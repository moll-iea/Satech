import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./AdminDashboard.module.css";
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import { videoService } from '../services/videoService';

const TOKEN_KEY = "satech_admin_token";

const getTokenExpiryMs = (token) => {
  try {
    const payloadPart = token.split(".")[1];
    if (!payloadPart) {
      return null;
    }

    const payload = JSON.parse(atob(payloadPart));
    if (!payload.exp) {
      return null;
    }

    return payload.exp * 1000;
  } catch {
    return null;
  }
};

const isTokenExpired = (token) => {
  const expiryMs = getTokenExpiryMs(token);
  if (!expiryMs) {
    return true;
  }

  return Date.now() >= expiryMs;
};

const EMPTY_CATEGORY_FORM = { name: "", description: "" };
const EMPTY_PRODUCT_FORM = { name: "", detail: "", categoryId: "" };
const EMPTY_VIDEO_FORM = { title: "", url: "", description: "" };
const DAY_MS = 24 * 60 * 60 * 1000;

const resolveImageUrl = (imagePath) => {
  if (!imagePath) return "";
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://") || imagePath.startsWith("blob:")) return imagePath;
  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
  return `${baseUrl}${imagePath.startsWith("/") ? imagePath : `/${imagePath}`}`;
};

const SparkLine = ({ data, color }) => {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 80, h = 28;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      <polyline points={points} stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
};

const MiniBarChart = ({ data, labels, color }) => {
  const max = Math.max(...data, 1);
  return (
    <div className={styles.miniBarChart}>
      {data.map((v, i) => (
        <div key={i} className={styles.miniBarCol}>
          <div className={styles.miniBar} style={{ height: `${(v / max) * 48}px`, background: color }} />
          <span>{labels[i]}</span>
        </div>
      ))}
    </div>
  );
};

const toTimestamp = (value) => {
  const ts = new Date(value).getTime();
  return Number.isFinite(ts) ? ts : null;
};

const buildSevenDaySeries = (items = []) => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const windowStart = todayStart - 6 * DAY_MS;
  const windowEnd = todayStart + DAY_MS - 1;
  const previousWindowStart = windowStart - 7 * DAY_MS;

  const labels = Array.from({ length: 7 }, (_, index) =>
    new Date(windowStart + index * DAY_MS).toLocaleDateString("en-US", { weekday: "short" })
  );
  const counts = Array(7).fill(0);
  let previousTotal = 0;

  items.forEach((item) => {
    const ts = toTimestamp(item?.createdAt);
    if (ts === null) return;

    if (ts >= windowStart && ts <= windowEnd) {
      const index = Math.floor((ts - windowStart) / DAY_MS);
      if (index >= 0 && index < counts.length) counts[index] += 1;
      return;
    }

    if (ts >= previousWindowStart && ts < windowStart) {
      previousTotal += 1;
    }
  });

  const currentTotal = counts.reduce((sum, value) => sum + value, 0);
  return { labels, counts, currentTotal, previousTotal };
};

const formatTrend = (current, previous, unit = "items") => {
  if (current === 0 && previous === 0) return `No new ${unit} in the last 7 days`;
  if (previous === 0) return `+${current} ${unit} in the last 7 days`;
  const delta = current - previous;
  const percent = Math.round((Math.abs(delta) / previous) * 100);
  if (delta === 0) return `No change vs previous 7 days`;
  return `${delta > 0 ? "+" : "-"}${percent}% vs previous 7 days`;
};

export default function AdminDashboard() {
  const [messages, setMessages] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [categoryForm, setCategoryForm] = useState(EMPTY_CATEGORY_FORM);
  const [categoryEditingId, setCategoryEditingId] = useState("");
  const [categoryError, setCategoryError] = useState("");
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [productForm, setProductForm] = useState(EMPTY_PRODUCT_FORM);
  const [editingId, setEditingId] = useState("");
  const [currentImage, setCurrentImage] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [productError, setProductError] = useState("");
  const [productLoading, setProductLoading] = useState(false);
  const [videoForm, setVideoForm] = useState(EMPTY_VIDEO_FORM);
  const [videoEditingId, setVideoEditingId] = useState("");
  const [videoError, setVideoError] = useState("");
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoThumbnailFile, setVideoThumbnailFile] = useState(null);
  const [videoThumbnailPreview, setVideoThumbnailPreview] = useState("");
  const [currentVideoThumbnail, setCurrentVideoThumbnail] = useState("");
  const [expandedMsg, setExpandedMsg] = useState(null);
  const [expandedChart, setExpandedChart] = useState(null);
  const [isChartExporting, setIsChartExporting] = useState(false);
  const expandedChartRef = useRef(null);
  const navigate = useNavigate();

  const canSubmitProduct = productForm.name.trim() && productForm.categoryId;
  const canSubmitVideo = videoForm.title.trim() && videoForm.url.trim();

  const categorySeries = useMemo(() => buildSevenDaySeries(categories), [categories]);
  const productSeries = useMemo(() => buildSevenDaySeries(products), [products]);
  const inquirySeries = useMemo(() => buildSevenDaySeries(messages), [messages]);

  const stats = useMemo(() => [
    {
      label: "Categories",
      value: categories.length,
      icon: "◈",
      trend: formatTrend(categorySeries.currentTotal, categorySeries.previousTotal, "categories"),
      spark: categorySeries.counts,
      color: "#00e5ff"
    },
    {
      label: "Products",
      value: products.length,
      icon: "⬡",
      trend: formatTrend(productSeries.currentTotal, productSeries.previousTotal, "products"),
      spark: productSeries.counts,
      color: "#7c3aed"
    },
    {
      label: "Inquiries",
      value: messages.length,
      icon: "⌁",
      trend: formatTrend(inquirySeries.currentTotal, inquirySeries.previousTotal, "inquiries"),
      spark: inquirySeries.counts,
      color: "#10b981"
    },
  ], [
    categories.length,
    products.length,
    messages.length,
    categorySeries,
    productSeries,
    inquirySeries,
  ]);

  const inquiryByDay = useMemo(() => {
    return {
      days: inquirySeries.labels,
      counts: inquirySeries.counts,
      currentTotal: inquirySeries.currentTotal,
      previousTotal: inquirySeries.previousTotal,
    };
  }, [inquirySeries]);

  const categoryDist = useMemo(() => {
    return categories.map(cat => ({
      name: cat.name,
      count: products.filter(p => {
        const catId = typeof p.categoryId === "object" ? p.categoryId?._id : p.categoryId;
        return catId === cat._id || p.category === cat.name;
      }).length,
    }));
  }, [categories, products]);

  const getOverviewChartMeta = (type) => {
    if (type === "inquiries") {
      return { type: "inquiries", title: "Inquiries This Week", fileName: "inquiries-this-week" };
    }
    return { type: "category", title: "Products by Category", fileName: "products-by-category" };
  };

  const renderOverviewChart = (type, expanded = false) => {
    const chartShellClass = `${styles.chartShell} ${expanded ? styles.chartShellExpanded : ""}`;

    if (type === "inquiries") {
      return (
        <div className={chartShellClass}>
          <div className={styles.analyticsHeader}>
            <span className={styles.analyticsTitle}>Inquiries This Week</span>
            <span className={styles.analyticsBadge} style={{ color: "#10b981" }}>
              {formatTrend(inquiryByDay.currentTotal, inquiryByDay.previousTotal, "inquiries")}
            </span>
          </div>
          <MiniBarChart data={inquiryByDay.counts} labels={inquiryByDay.days} color="#10b981" />
          <div className={styles.analyticsFooter}>
            Total in last 7 days: {inquiryByDay.currentTotal} inquiries
          </div>
        </div>
      );
    }

    return (
      <div className={chartShellClass}>
        <div className={styles.analyticsHeader}>
          <span className={styles.analyticsTitle}>Products by Category</span>
        </div>
        <div className={styles.categoryDistList}>
          {categoryDist.length === 0 && <span className={styles.emptyNote}>No data yet</span>}
          {categoryDist.map(cd => (
            <div key={cd.name} className={styles.catDistRow}>
              <span className={styles.catDistName}>{cd.name}</span>
              <div className={styles.catDistBar}>
                <div
                  className={styles.catDistFill}
                  style={{ width: `${Math.max((cd.count / (products.length || 1)) * 100, 4)}%` }}
                />
              </div>
              <span className={styles.catDistCount}>{cd.count}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const openChartModal = (type) => {
    setExpandedChart(getOverviewChartMeta(type));
  };

  const closeChartModal = () => {
    if (!isChartExporting) setExpandedChart(null);
  };

  const downloadExpandedChartPdf = async () => {
    if (!expandedChartRef.current || !expandedChart) return;

    try {
      setIsChartExporting(true);
      const canvas = await html2canvas(expandedChartRef.current, {
        backgroundColor: "#091318",
        scale: 2,
        useCORS: true,
      });

      const image = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const maxWidth = pageWidth - margin * 2;
      const maxHeight = pageHeight - margin * 2;
      const imageRatio = canvas.width / canvas.height;

      let renderWidth = maxWidth;
      let renderHeight = renderWidth / imageRatio;

      if (renderHeight > maxHeight) {
        renderHeight = maxHeight;
        renderWidth = renderHeight * imageRatio;
      }

      const x = (pageWidth - renderWidth) / 2;
      const y = (pageHeight - renderHeight) / 2;

      pdf.addImage(image, "PNG", x, y, renderWidth, renderHeight);
      pdf.save(`${expandedChart.fileName}.pdf`);
      toast.success("Chart PDF downloaded!");
    } catch (err) {
      toast.error("Failed to export chart PDF.");
    } finally {
      setIsChartExporting(false);
    }
  };

  useEffect(() => {
    if (!imageFile) { setImagePreview(""); return; }
    const url = URL.createObjectURL(imageFile);
    setImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token || isTokenExpired(token)) {
      localStorage.removeItem(TOKEN_KEY);
      navigate("/admin/login?sessionExpired=1", { replace: true });
      return undefined;
    }

    const expiryMs = getTokenExpiryMs(token);
    if (!expiryMs) {
      return undefined;
    }

    const timeoutMs = Math.max(0, expiryMs - Date.now());
    const timeoutId = window.setTimeout(() => {
      localStorage.removeItem(TOKEN_KEY);
      navigate("/admin/login?sessionExpired=1", { replace: true });
    }, timeoutMs);

    return () => window.clearTimeout(timeoutId);
  }, [navigate]);

  useEffect(() => {
    if (!videoThumbnailFile) { setVideoThumbnailPreview(""); return; }
    const url = URL.createObjectURL(videoThumbnailFile);
    setVideoThumbnailPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [videoThumbnailFile]);

  const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem(TOKEN_KEY)}` });
  const jsonHeaders = () => ({ ...authHeaders(), "Content-Type": "application/json" });

  const loadAdminData = async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token || isTokenExpired(token)) {
      localStorage.removeItem(TOKEN_KEY);
      navigate("/admin/login", { replace: true });
      return;
    }

    try {
      setIsLoading(true); setError("");
      const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
      const [mRes, pRes, cRes, vRes] = await Promise.all([
        fetch(`${baseUrl}/api/contact/messages`, { headers: authHeaders() }),
        fetch(`${baseUrl}/api/products`),
        fetch(`${baseUrl}/api/categories`),
        fetch(`${baseUrl}/api/videos`),
      ]);
      if (mRes.status === 401 || mRes.status === 403) { localStorage.removeItem(TOKEN_KEY); navigate("/admin/login", { replace: true }); return; }
      const [mData, pData, cData, vData] = await Promise.all([mRes.json(), pRes.json(), cRes.json(), vRes.json()]);
      setMessages(Array.isArray(mData.data) ? mData.data : []);
      setProducts(Array.isArray(pData.data) ? pData.data : []);
      setCategories(Array.isArray(cData.data) ? cData.data : []);
      setVideos(Array.isArray(vData.data) ? vData.data : []);
    } catch (err) {
      setError(err.message || "Failed to load admin data.");
    } finally { setIsLoading(false); }
  };

  useEffect(() => { loadAdminData(); }, [navigate]);

  const handleLogout = () => { localStorage.removeItem(TOKEN_KEY); navigate("/admin/login", { replace: true }); };

  const resetCategoryForm = () => { setCategoryForm(EMPTY_CATEGORY_FORM); setCategoryEditingId(""); setCategoryError(""); };
  const resetProductForm = () => { setProductForm(EMPTY_PRODUCT_FORM); setEditingId(""); setCurrentImage(""); setImageFile(null); setProductError(""); };
  const resetVideoForm = () => { setVideoForm(EMPTY_VIDEO_FORM); setVideoEditingId(""); setCurrentVideoThumbnail(""); setVideoThumbnailFile(null); setVideoError(""); };

  const reloadCategories = async () => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
    const r = await fetch(`${baseUrl}/api/categories`);
    const p = await r.json();
    setCategories(Array.isArray(p.data) ? p.data : []);
  };

  const reloadProducts = async () => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
    const r = await fetch(`${baseUrl}/api/products`);
    const p = await r.json();
    setProducts(Array.isArray(p.data) ? p.data : []);
  };

  const reloadVideos = async () => {
    try {
      const data = await videoService.getVideos();
      setVideos(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      setVideoError("Failed to reload videos");
    }
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault(); setCategoryError("");
    if (!categoryForm.name.trim()) { setCategoryError("Name is required."); return; }
    try {
      setCategoryLoading(true);
      const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
      const url = categoryEditingId ? `${baseUrl}/api/categories/${categoryEditingId}` : `${baseUrl}/api/categories`;
      const method = categoryEditingId ? "PUT" : "POST";
      const r = await fetch(url, { method, headers: jsonHeaders(), body: JSON.stringify(categoryForm) });
      const p = await r.json();
      if (!r.ok || !p.success) throw new Error(p.message || "Failed.");
      resetCategoryForm(); await reloadCategories();
      toast.success(categoryEditingId ? "Category updated!" : "Category added!");
    } catch (err) { setCategoryError(err.message); toast.error(err.message); } finally { setCategoryLoading(false); }
  };

  const handleEditCategory = (cat) => { setCategoryForm({ name: cat.name, description: cat.description || "" }); setCategoryEditingId(cat._id); };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
      await fetch(`${baseUrl}/api/categories/${id}`, { method: "DELETE", headers: authHeaders() });
      await reloadCategories();
      toast.success("Category deleted!");
    } catch (err) { setCategoryError(err.message); toast.error(err.message); }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault(); setProductError("");
    if (!productForm.name.trim() || !productForm.categoryId) { setProductError("Name and category are required."); return; }
    try {
      setProductLoading(true);
      const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
      const url = editingId ? `${baseUrl}/api/products/${editingId}` : `${baseUrl}/api/products`;
      const method = editingId ? "PUT" : "POST";
      const fd = new FormData();
      Object.keys(productForm).forEach(k => fd.append(k, productForm[k]));
      if (imageFile) fd.append("image", imageFile);
      const r = await fetch(url, { method, headers: authHeaders(), body: fd });
      const p = await r.json();
      if (!r.ok || !p.success) throw new Error(p.message || "Failed.");
      resetProductForm(); await reloadProducts();
      toast.success(editingId ? "Product updated!" : "Product added!");
    } catch (err) { setProductError(err.message); toast.error(err.message); } finally { setProductLoading(false); }
  };

  const handleEditProduct = (product) => {
    const catId = typeof product.categoryId === "object" ? product.categoryId?._id : product.categoryId;
    setProductForm({ name: product.name, detail: product.detail || "", categoryId: catId || "" });
    setEditingId(product._id);
    setCurrentImage(resolveImageUrl(product.image));
    setImageFile(null);
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
      await fetch(`${baseUrl}/api/products/${id}`, { method: "DELETE", headers: authHeaders() });
      await reloadProducts();
      if (editingId === id) resetProductForm();
      toast.success("Product deleted!");
    } catch (err) { setProductError(err.message); toast.error(err.message); }
  };

  const handleSaveVideo = async (e) => {
    e.preventDefault();
    setVideoError("");
    if (!videoForm.title.trim() || !videoForm.url.trim()) {
      setVideoError("Title and URL are required.");
      return;
    }
    try {
      setVideoLoading(true);
      const fd = new FormData();
      fd.append("title", videoForm.title);
      fd.append("url", videoForm.url);
      fd.append("description", videoForm.description || "");
      if (videoThumbnailFile) {
        fd.append("thumbnail", videoThumbnailFile);
      }

      let result;
      if (videoEditingId) {
        result = await videoService.updateVideo(videoEditingId, fd);
      } else {
        result = await videoService.createVideo(fd);
      }

      if (!result.success) throw new Error(result.message || "Failed.");
      resetVideoForm();
      await reloadVideos();
      toast.success(videoEditingId ? "Video updated!" : "Video added!");
    } catch (err) {
      setVideoError(err.message);
      toast.error(err.message);
    } finally {
      setVideoLoading(false);
    }
  };

  const handleEditVideo = (video) => {
    setVideoForm({
      title: video.title,
      url: video.url,
      description: video.description || ""
    });
    setVideoEditingId(video._id);
    setCurrentVideoThumbnail(resolveImageUrl(video.thumbnail));
    setVideoThumbnailFile(null);
  };

  const handleDeleteVideo = async (id) => {
    if (!window.confirm("Delete this video?")) return;
    try {
      const result = await videoService.deleteVideo(id);
      if (!result.success) throw new Error(result.message);
      await reloadVideos();
      if (videoEditingId === id) resetVideoForm();
      toast.success("Video deleted!");
    } catch (err) {
      setVideoError(err.message);
      toast.error(err.message);
    }
  };

  const handleImageChange = (e) => { setImageFile(e.target.files?.[0] || null); };

  const handleVideoThumbnailChange = (e) => { setVideoThumbnailFile(e.target.files?.[0] || null); };

  const navItems = [
    { id: "overview", label: "Overview", icon: "◈" },
    { id: "categories", label: "Categories", icon: "⬡" },
    { id: "products", label: "Products", icon: "▣" },
    { id: "services", label: "Services", icon: "⚙" },
    { id: "videos", label: "Videos", icon: "▶" },
    { id: "inquiries", label: "Inquiries", icon: "⌁" },
  ];

  // Search & Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [categoryFilterId, setCategoryFilterId] = useState("all");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  const matchesProductSearch = (product, term) => {
    if (!term.trim()) return true;
    const searchLower = term.toLowerCase();
    return (
      product.name?.toLowerCase().includes(searchLower) ||
      product.detail?.toLowerCase().includes(searchLower) ||
      product.category?.toLowerCase().includes(searchLower)
    );
  };

  const matchesInquirySearch = (inquiry, term) => {
    if (!term.trim()) return true;
    const searchLower = term.toLowerCase();
    return (
      inquiry.name?.toLowerCase().includes(searchLower) ||
      inquiry.email?.toLowerCase().includes(searchLower) ||
      inquiry.company?.toLowerCase().includes(searchLower) ||
      inquiry.message?.toLowerCase().includes(searchLower)
    );
  };

  const matchesCategorySearch = (category, term) => {
    if (!term.trim()) return true;
    const searchLower = term.toLowerCase();
    return (
      category.name?.toLowerCase().includes(searchLower) ||
      category.description?.toLowerCase().includes(searchLower)
    );
  };

  const matchesVideoSearch = (video, term) => {
    if (!term.trim()) return true;
    const searchLower = term.toLowerCase();
    return (
      video.title?.toLowerCase().includes(searchLower) ||
      video.description?.toLowerCase().includes(searchLower) ||
      video.url?.toLowerCase().includes(searchLower)
    );
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = matchesProductSearch(p, searchTerm);
      const matchesCategory = categoryFilterId === "all" || 
        (typeof p.categoryId === "object" ? p.categoryId?._id : p.categoryId) === categoryFilterId;
      const productDate = new Date(p.createdAt || new Date());
      const matchesDate = (!dateRange.start || productDate >= new Date(dateRange.start)) &&
                          (!dateRange.end || productDate <= new Date(dateRange.end));
      return matchesSearch && matchesCategory && matchesDate;
    });
  }, [searchTerm, categoryFilterId, dateRange, products]);

  const filteredMessages = useMemo(() => {
    return messages.filter(m => {
      const matchesSearch = matchesInquirySearch(m, searchTerm);
      const messageDate = new Date(m.createdAt || new Date());
      const matchesDate = (!dateRange.start || messageDate >= new Date(dateRange.start)) &&
                        (!dateRange.end || messageDate <= new Date(dateRange.end));
      return matchesSearch && matchesDate;
    });
  }, [searchTerm, dateRange, messages]);

  const filteredCategories = useMemo(() => {
    return categories.filter(c => matchesCategorySearch(c, searchTerm));
  }, [searchTerm, categories]);

  const filteredVideos = useMemo(() => {
    return videos.filter(v => {
      const matchesSearch = matchesVideoSearch(v, searchTerm);
      const videoDate = new Date(v.createdAt || new Date());
      const matchesDate = (!dateRange.start || videoDate >= new Date(dateRange.start)) &&
                          (!dateRange.end || videoDate <= new Date(dateRange.end));
      return matchesSearch && matchesDate;
    });
  }, [searchTerm, dateRange, videos]);

  const downloadProductsPDF = () => {
    const doc = new jsPDF();
    let yPos = 20;
    doc.setFontSize(16);
    doc.text('Product Catalog', 14, yPos);
    yPos += 15;
    doc.setFontSize(10);
    
    filteredProducts.forEach(product => {
      doc.setFont(undefined, 'bold');
      doc.text(`${product.name}`, 14, yPos);
      yPos += 6;
      doc.setFont(undefined, 'normal');
      doc.setTextColor(100);
      doc.text(`Category: ${product.category || '—'}`, 14, yPos);
      yPos += 4;
      const detail = doc.splitTextToSize(product.detail || '—', 180);
      doc.text(detail, 14, yPos);
      yPos += detail.length * 4 + 5;
      doc.setTextColor(0);
      if (yPos > 270) { doc.addPage(); yPos = 20; }
    });
    doc.save('products.pdf');
    toast.success('Products PDF downloaded!');
  };

  const downloadProductsExcel = () => {
    const data = filteredProducts.map(p => ({
      Name: p.name,
      Category: p.category || '—',
      Details: p.detail || '—',
      'Created Date': new Date(p.createdAt).toLocaleDateString(),
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');
    XLSX.writeFile(workbook, 'products.xlsx');
    toast.success('Products Excel downloaded!');
  };

  const downloadInquiriesPDF = () => {
    const doc = new jsPDF();
    let yPos = 20;
    doc.setFontSize(16);
    doc.text('Customer Inquiries', 14, yPos);
    yPos += 15;
    doc.setFontSize(10);
    
    filteredMessages.forEach(msg => {
      doc.setFont(undefined, 'bold');
      doc.text(`${msg.name}`, 14, yPos);
      yPos += 6;
      doc.setFont(undefined, 'normal');
      doc.setTextColor(100);
      doc.text(`Email: ${msg.email} | Company: ${msg.company || '—'}`, 14, yPos);
      yPos += 4;
      const message = doc.splitTextToSize(msg.message, 180);
      doc.text(message, 14, yPos);
      yPos += message.length * 4 + 5;
      doc.setTextColor(0);
      if (yPos > 270) { doc.addPage(); yPos = 20; }
    });
    doc.save('inquiries.pdf');
    toast.success('Inquiries PDF downloaded!');
  };

  const downloadInquiriesExcel = () => {
    const data = filteredMessages.map(m => ({
      Name: m.name,
      Email: m.email,
      Company: m.company || '—',
      Date: new Date(m.createdAt).toLocaleDateString(),
      Message: m.message.substring(0, 100) + (m.message.length > 100 ? '...' : ''),
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Inquiries');
    XLSX.writeFile(workbook, 'inquiries.xlsx');
    toast.success('Inquiries Excel downloaded!');
  };

  const downloadCategoriesPDF = () => {
    const doc = new jsPDF();
    let yPos = 20;
    doc.setFontSize(16);
    doc.text('Product Categories', 14, yPos);
    yPos += 15;
    doc.setFontSize(10);
    
    filteredCategories.forEach(category => {
      doc.setFont(undefined, 'bold');
      doc.text(`${category.name}`, 14, yPos);
      yPos += 6;
      doc.setFont(undefined, 'normal');
      doc.setTextColor(100);
      const productCount = products.filter(p => {
        const catId = typeof p.categoryId === "object" ? p.categoryId?._id : p.categoryId;
        return catId === category._id || p.category === category.name;
      }).length;
      doc.text(`Products: ${productCount}`, 14, yPos);
      yPos += 4;
      const desc = doc.splitTextToSize(category.description || 'No description', 180);
      doc.text(desc, 14, yPos);
      yPos += desc.length * 4 + 5;
      doc.setTextColor(0);
      if (yPos > 270) { doc.addPage(); yPos = 20; }
    });
    doc.save('categories.pdf');
    toast.success('Categories PDF downloaded!');
  };

  const downloadCategoriesExcel = () => {
    const data = filteredCategories.map(category => ({
      'Category Name': category.name,
      'Description': category.description || '—',
      'Product Count': products.filter(p => {
        const catId = typeof p.categoryId === "object" ? p.categoryId?._id : p.categoryId;
        return catId === category._id || p.category === category.name;
      }).length,
      'Created Date': new Date(category.createdAt || new Date()).toLocaleDateString(),
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Categories');
    XLSX.writeFile(workbook, 'categories.xlsx');
    toast.success('Categories Excel downloaded!');
  };

  const downloadVideosPDF = () => {
    const doc = new jsPDF();
    let yPos = 20;
    doc.setFontSize(16);
    doc.text('Video Library', 14, yPos);
    yPos += 15;
    doc.setFontSize(10);
    
    filteredVideos.forEach(video => {
      doc.setFont(undefined, 'bold');
      doc.text(`${video.title}`, 14, yPos);
      yPos += 6;
      doc.setFont(undefined, 'normal');
      doc.setTextColor(100);
      doc.text(`URL: ${video.url}`, 14, yPos);
      yPos += 4;
      const desc = doc.splitTextToSize(video.description || '—', 180);
      doc.text(desc, 14, yPos);
      yPos += desc.length * 4 + 5;
      doc.setTextColor(0);
      if (yPos > 270) { doc.addPage(); yPos = 20; }
    });
    doc.save('videos.pdf');
    toast.success('Videos PDF downloaded!');
  };

  const downloadVideosExcel = () => {
    const data = filteredVideos.map(v => ({
      Title: v.title,
      URL: v.url,
      Description: v.description || '—',
      'Created Date': new Date(v.createdAt).toLocaleDateString(),
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Videos');
    XLSX.writeFile(workbook, 'videos.xlsx');
    toast.success('Videos Excel downloaded!');
  };

  return (
    <div className={styles.shell}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}>
          <div className={styles.logoMark}>S</div>
          <div>
            <div className={styles.logoName}>SATECH</div>
            <div className={styles.logoSub}>Admin Console</div>
          </div>
        </div>

        <nav className={styles.sidebarNav}>
          <div className={styles.navGroup}>
            <span className={styles.navGroupLabel}>Dashboard</span>
            {navItems.map(item => (
              <button
                key={item.id}
                className={`${styles.navItem} ${activeTab === item.id ? styles.navItemActive : ""}`}
                onClick={() => setActiveTab(item.id)}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>

          <div className={styles.navGroup}>
            <span className={styles.navGroupLabel}>Content</span>
            <button className={styles.navItem} onClick={() => navigate("/admin/news")}>
              <span className={styles.navIcon}>◎</span>
              News & Articles
              <span className={styles.navBadge}>↗</span>
            </button>
            <button className={styles.navItem} onClick={() => navigate("/admin/exhibitions")}>
              <span className={styles.navIcon}>⬚</span>
              Exhibitions
              <span className={styles.navBadge}>↗</span>
            </button>
          </div>
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.systemStatus}>
            <span className={styles.statusDot} />
            <span>System Online</span>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout}>Sign Out</button>
        </div>
      </aside>

      {/* Main */}
      <main className={styles.main}>
        {/* Top Bar */}
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <h1 className={styles.pageTitle}>
              {navItems.find(n => n.id === activeTab)?.label || "Dashboard"}
            </h1>
            <span className={styles.breadcrumb}>SATECH / Admin / {navItems.find(n => n.id === activeTab)?.label || "Dashboard"}</span>
          </div>
          <div className={styles.topbarRight}>
            <div className={styles.topbarClock}>{new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</div>
          </div>
        </header>

        <div className={styles.content}>
          {isLoading && (
            <div className={styles.loadingState}>
              <div className={styles.loadingSpinner} />
              <span>Initializing systems...</span>
            </div>
          )}
          {!isLoading && error && <div className={styles.errorBanner}>{error}</div>}

          {/* OVERVIEW TAB */}
          {!isLoading && !error && activeTab === "overview" && (
            <div className={styles.tabContent}>
              {/* Stats Row */}
              <div className={styles.statsRow}>
                {stats.map(stat => (
                  <div key={stat.label} className={styles.statCard}>
                    <div className={styles.statTop}>
                      <span className={styles.statIcon} style={{ color: stat.color }}>{stat.icon}</span>
                      <SparkLine data={stat.spark} color={stat.color} />
                    </div>
                    <div className={styles.statValue} style={{ color: stat.color }}>{stat.value}</div>
                    <div className={styles.statLabel}>{stat.label}</div>
                    <div className={styles.statTrend}>{stat.trend}</div>
                  </div>
                ))}
              </div>

              {/* Quick Access Cards */}
              <div className={styles.sectionLabel}>CONTENT MANAGEMENT</div>
              <div className={styles.quickGrid}>
                <div className={styles.quickCard} onClick={() => navigate("/admin/news")}>
                  <div className={styles.quickCardIcon}>◎</div>
                  <div className={styles.quickCardBody}>
                    <h3>News & Articles</h3>
                    <p>Publish press releases, case studies, and announcements</p>
                  </div>
                  <div className={styles.quickCardArrow}>→</div>
                </div>
                <div className={styles.quickCard} onClick={() => navigate("/admin/exhibitions")}>
                  <div className={styles.quickCardIcon}>⬚</div>
                  <div className={styles.quickCardBody}>
                    <h3>Exhibition Gallery</h3>
                    <p>Manage trade show and exhibition photo galleries</p>
                  </div>
                  <div className={styles.quickCardArrow}>→</div>
                </div>
              </div>

              {/* Analytics Row */}
              <div className={styles.sectionLabel}>ANALYTICS</div>
              <div className={styles.analyticsRow}>
                <button
                  type="button"
                  className={`${styles.analyticsCard} ${styles.analyticsCardInteractive}`}
                  onClick={() => openChartModal("inquiries")}
                  aria-label="Expand inquiries chart"
                >
                  {renderOverviewChart("inquiries")}
                  <span className={styles.chartCardHint}>Click to expand and download PDF</span>
                </button>

                <button
                  type="button"
                  className={`${styles.analyticsCard} ${styles.analyticsCardInteractive}`}
                  onClick={() => openChartModal("category")}
                  aria-label="Expand products by category chart"
                >
                  {renderOverviewChart("category")}
                  <span className={styles.chartCardHint}>Click to expand and download PDF</span>
                </button>
              </div>

              {/* Recent Inquiries Preview */}
              {messages.length > 0 && (
                <>
                  <div className={styles.sectionLabel}>RECENT INQUIRIES</div>
                  <div className={styles.inqPreviewList}>
                    {messages.slice(0, 3).map(msg => (
                      <div key={msg._id} className={styles.inqPreviewRow}>
                        <div className={styles.inqAvatar}>{msg.name?.[0]?.toUpperCase() || "?"}</div>
                        <div className={styles.inqPreviewBody}>
                          <span className={styles.inqPreviewName}>{msg.name}</span>
                          <span className={styles.inqPreviewCompany}>{msg.company || "—"}</span>
                        </div>
                        <span className={styles.inqPreviewDate}>{new Date(msg.createdAt).toLocaleDateString()}</span>
                        <button className={styles.inqViewBtn} onClick={() => setActiveTab("inquiries")}>View →</button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* CATEGORIES TAB */}
          {!isLoading && !error && activeTab === "categories" && (
            <div className={styles.tabContent}>
              {/* Search & Download Toolbar */}
              <div className={styles.toolbarRow}>
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={styles.searchInput}
                />
                <button onClick={downloadCategoriesPDF} className={styles.downloadBtn}>📄 PDF</button>
                <button onClick={downloadCategoriesExcel} className={styles.downloadBtn}>📊 Excel</button>
              </div>

              <div className={styles.panelGrid}>
                <div className={styles.panel}>
                  <div className={styles.panelHeader}>
                    <span>{categoryEditingId ? "Edit Category" : "New Category"}</span>
                    {categoryEditingId && <button className={styles.clearBtn} onClick={resetCategoryForm}>✕ Cancel</button>}
                  </div>
                  <form onSubmit={handleSaveCategory} className={styles.modernForm}>
                    <div className={styles.fieldGroup}>
                      <label>Category Name *</label>
                      <input type="text" placeholder="e.g. RF Semiconductors" value={categoryForm.name}
                        onChange={e => setCategoryForm(p => ({ ...p, name: e.target.value }))} />
                    </div>
                    <div className={styles.fieldGroup}>
                      <label>Description</label>
                      <textarea placeholder="Brief description of this product line..." value={categoryForm.description}
                        onChange={e => setCategoryForm(p => ({ ...p, description: e.target.value }))} rows={3} />
                    </div>
                    {categoryError && <div className={styles.fieldError}>{categoryError}</div>}
                    <button className={styles.primaryBtn} type="submit" disabled={categoryLoading}>
                      {categoryLoading ? "Saving..." : categoryEditingId ? "Update Category" : "Add Category"}
                    </button>
                  </form>
                </div>

                <div className={styles.panel} style={{ flex: 2 }}>
                  <div className={styles.panelHeader}><span>All Categories ({filteredCategories.length})</span></div>
                  <div className={styles.chipGrid}>
                    {filteredCategories.length === 0 && <span className={styles.emptyNote}>No categories found.</span>}
                    {filteredCategories.map(cat => (
                      <div key={cat._id} className={styles.categoryChip}>
                        <div className={styles.chipDot} />
                        <div className={styles.chipBody}>
                          <strong>{cat.name}</strong>
                          <span>{cat.description || "No description"}</span>
                          <span className={styles.chipCount}>
                            {products.filter(p => {
                              const cid = typeof p.categoryId === "object" ? p.categoryId?._id : p.categoryId;
                              return cid === cat._id || p.category === cat.name;
                            }).length} products
                          </span>
                        </div>
                        <div className={styles.chipActions}>
                          <button className={styles.editChipBtn} onClick={() => handleEditCategory(cat)}>Edit</button>
                          <button className={styles.deleteChipBtn} onClick={() => handleDeleteCategory(cat._id)}>Del</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PRODUCTS TAB */}
          {!isLoading && !error && activeTab === "products" && (
            <div className={styles.tabContent}>
              {/* Search & Filter & Download Toolbar */}
              <div className={styles.toolbarRow}>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={styles.searchInput}
                />
                <select value={categoryFilterId} onChange={(e) => setCategoryFilterId(e.target.value)} className={styles.filterSelect}>
                  <option value="all">All Categories</option>
                  {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
                <input 
                  type="date" 
                  value={dateRange.start} 
                  onChange={(e) => setDateRange(p => ({...p, start: e.target.value}))} 
                  className={styles.dateInput}
                  title="From Date"
                />
                <input 
                  type="date" 
                  value={dateRange.end} 
                  onChange={(e) => setDateRange(p => ({...p, end: e.target.value}))} 
                  className={styles.dateInput}
                  title="To Date"
                />
                <button onClick={downloadProductsPDF} className={styles.downloadBtn}>📄 PDF</button>
                <button onClick={downloadProductsExcel} className={styles.downloadBtn}>📊 Excel</button>
              </div>

              <div className={styles.panelGrid}>
                <div className={styles.panel}>
                  <div className={styles.panelHeader}>
                    <span>{editingId ? "Edit Product" : "New Product"}</span>
                    {editingId && <button className={styles.clearBtn} onClick={resetProductForm}>✕ Cancel</button>}
                  </div>
                  <form onSubmit={handleSaveProduct} className={styles.modernForm}>
                    <div className={styles.fieldGroup}>
                      <label>Product Name *</label>
                      <input type="text" placeholder="e.g. GaN Power Amplifier" value={productForm.name}
                        onChange={e => setProductForm(p => ({ ...p, name: e.target.value }))} />
                    </div>
                    <div className={styles.fieldGroup}>
                      <label>Category *</label>
                      <select value={productForm.categoryId} onChange={e => setProductForm(p => ({ ...p, categoryId: e.target.value }))}>
                        <option value="">Select category</option>
                        {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className={styles.fieldGroup}>
                      <label>Product Image</label>
                      <label className={styles.fileZone}>
                        <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />
                        {(imagePreview || currentImage) ? (
                          <img src={imagePreview || currentImage} alt="Preview" className={styles.filePreview} />
                        ) : (
                          <span className={styles.filePrompt}>⊕ Choose image</span>
                        )}
                      </label>
                    </div>
                    <div className={styles.fieldGroup}>
                      <label>Details</label>
                      <textarea placeholder="Technical specifications and product details..." value={productForm.detail}
                        onChange={e => setProductForm(p => ({ ...p, detail: e.target.value }))} rows={3} />
                    </div>
                    {productError && <div className={styles.fieldError}>{productError}</div>}
                    <button className={styles.primaryBtn} type="submit" disabled={productLoading || !canSubmitProduct}>
                      {productLoading ? "Saving..." : editingId ? "Update Product" : "Add Product"}
                    </button>
                  </form>
                </div>

                <div className={styles.panel} style={{ flex: 2 }}>
                  <div className={styles.panelHeader}><span>Product Catalog ({filteredProducts.length})</span></div>
                  <div className={styles.productList}>
                    {filteredProducts.length === 0 && <span className={styles.emptyNote}>No products found.</span>}
                    {filteredProducts.map(product => (
                      <div key={product._id} className={styles.productRow}>
                        <div className={styles.productThumb}>
                          {product.image
                            ? <img src={resolveImageUrl(product.image)} alt={product.name} />
                            : <span>⬡</span>}
                        </div>
                        <div className={styles.productRowBody}>
                          <strong>{product.name}</strong>
                          <span className={styles.productRowCat}>{product.category || "—"}</span>
                          <span className={styles.productRowDetail}>{product.detail?.substring(0, 60)}{product.detail?.length > 60 ? "..." : ""}</span>
                        </div>
                        <div className={styles.productRowActions}>
                          <button className={styles.editChipBtn} onClick={() => handleEditProduct(product)}>Edit</button>
                          <button className={styles.deleteChipBtn} onClick={() => handleDeleteProduct(product._id)}>Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIDEOS TAB */}
          {!isLoading && !error && activeTab === "videos" && (
            <div className={styles.tabContent}>
              {/* Search & Download Toolbar */}
              <div className={styles.toolbarRow}>
                <input
                  type="text"
                  placeholder="Search videos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={styles.searchInput}
                />
                <input 
                  type="date" 
                  value={dateRange.start} 
                  onChange={(e) => setDateRange(p => ({...p, start: e.target.value}))} 
                  className={styles.dateInput}
                  title="From Date"
                />
                <input 
                  type="date" 
                  value={dateRange.end} 
                  onChange={(e) => setDateRange(p => ({...p, end: e.target.value}))} 
                  className={styles.dateInput}
                  title="To Date"
                />
                <button onClick={downloadVideosPDF} className={styles.downloadBtn}>📄 PDF</button>
                <button onClick={downloadVideosExcel} className={styles.downloadBtn}>📊 Excel</button>
              </div>

              <div className={styles.panelGrid}>
                <div className={styles.panel}>
                  <div className={styles.panelHeader}>
                    <span>{videoEditingId ? "Edit Video" : "New Video"}</span>
                    {videoEditingId && <button className={styles.clearBtn} onClick={resetVideoForm}>✕ Cancel</button>}
                  </div>
                  <form onSubmit={handleSaveVideo} className={styles.modernForm}>
                    <div className={styles.fieldGroup}>
                      <label>Video Title *</label>
                      <input type="text" placeholder="e.g. Product Demo 2026" value={videoForm.title}
                        onChange={e => setVideoForm(p => ({ ...p, title: e.target.value }))} />
                    </div>
                    <div className={styles.fieldGroup}>
                      <label>Video URL *</label>
                      <input type="text" placeholder="e.g. https://youtube.com/watch?v=..." value={videoForm.url}
                        onChange={e => setVideoForm(p => ({ ...p, url: e.target.value }))} />
                    </div>
                    <div className={styles.fieldGroup}>
                      <label>Thumbnail Image</label>
                      <label className={styles.fileZone}>
                        <input type="file" accept="image/*" onChange={handleVideoThumbnailChange} style={{ display: "none" }} />
                        {(videoThumbnailPreview || currentVideoThumbnail) ? (
                          <img src={videoThumbnailPreview || currentVideoThumbnail} alt="Thumbnail Preview" className={styles.filePreview} />
                        ) : (
                          <span className={styles.filePrompt}>⊕ Choose thumbnail</span>
                        )}
                      </label>
                    </div>
                    <div className={styles.fieldGroup}>
                      <label>Description</label>
                      <textarea placeholder="Video description and details..." value={videoForm.description}
                        onChange={e => setVideoForm(p => ({ ...p, description: e.target.value }))} rows={3} />
                    </div>
                    {videoError && <div className={styles.fieldError}>{videoError}</div>}
                    <button className={styles.primaryBtn} type="submit" disabled={videoLoading || !canSubmitVideo}>
                      {videoLoading ? "Saving..." : videoEditingId ? "Update Video" : "Add Video"}
                    </button>
                  </form>
                </div>

                <div className={styles.panel} style={{ flex: 2 }}>
                  <div className={styles.panelHeader}><span>Video Library ({filteredVideos.length})</span></div>
                  <div className={styles.videoList}>
                    {filteredVideos.length === 0 && <span className={styles.emptyNote}>No videos found.</span>}
                    {filteredVideos.map(video => (
                      <div key={video._id} className={styles.videoRow}>
                        <div className={styles.videoThumb}>
                          {video.thumbnail
                            ? <img src={resolveImageUrl(video.thumbnail)} alt={video.title} />
                            : <span>▶</span>}
                        </div>
                        <div className={styles.videoRowBody}>
                          <strong>{video.title}</strong>
                          <span className={styles.videoRowUrl}>{video.url?.substring(0, 60)}{video.url?.length > 60 ? "..." : ""}</span>
                          <span className={styles.videoRowDetail}>{video.description?.substring(0, 60)}{video.description?.length > 60 ? "..." : ""}</span>
                        </div>
                        <div className={styles.videoRowActions}>
                          <button className={styles.editChipBtn} onClick={() => handleEditVideo(video)}>Edit</button>
                          <button className={styles.deleteChipBtn} onClick={() => handleDeleteVideo(video._id)}>Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* INQUIRIES TAB */}
          {!isLoading && !error && activeTab === "inquiries" && (
            <div className={styles.tabContent}>
              {/* Search & Filter & Download Toolbar */}
              <div className={styles.toolbarRow}>
                <input
                  type="text"
                  placeholder="Search inquiries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={styles.searchInput}
                />
                <input 
                  type="date" 
                  value={dateRange.start} 
                  onChange={(e) => setDateRange(p => ({...p, start: e.target.value}))} 
                  className={styles.dateInput}
                  title="From Date"
                />
                <input 
                  type="date" 
                  value={dateRange.end} 
                  onChange={(e) => setDateRange(p => ({...p, end: e.target.value}))} 
                  className={styles.dateInput}
                  title="To Date"
                />
                <button onClick={downloadInquiriesPDF} className={styles.downloadBtn}>📄 PDF</button>
                <button onClick={downloadInquiriesExcel} className={styles.downloadBtn}>📊 Excel</button>
              </div>

              <div className={styles.sectionLabel}>ALL INQUIRIES ({filteredMessages.length})</div>
              {filteredMessages.length === 0 && <span className={styles.emptyNote}>No inquiries found.</span>}
              <div className={styles.inqList}>
                {filteredMessages.map(msg => (
                  <div key={msg._id} className={`${styles.inqCard} ${expandedMsg === msg._id ? styles.inqCardExpanded : ""}`}
                    onClick={() => setExpandedMsg(expandedMsg === msg._id ? null : msg._id)}>
                    <div className={styles.inqCardTop}>
                      <div className={styles.inqAvatar}>{msg.name?.[0]?.toUpperCase() || "?"}</div>
                      <div className={styles.inqCardMeta}>
                        <strong>{msg.name}</strong>
                        <span>{msg.email}</span>
                      </div>
                      <div className={styles.inqCardCompany}>{msg.company || "—"}</div>
                      <div className={styles.inqCardDate}>{new Date(msg.createdAt).toLocaleDateString()}</div>
                      <span className={styles.inqToggle}>{expandedMsg === msg._id ? "▲" : "▼"}</span>
                    </div>
                    {expandedMsg === msg._id && (
                      <div className={styles.inqCardMessage}>{msg.message}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SERVICES TAB */}
          {!isLoading && !error && activeTab === "services" && (
            <ServiceAdmin />
          )}
        </div>

        {expandedChart && (
          <div className={styles.chartModalBackdrop} onClick={closeChartModal}>
            <div className={styles.chartModal} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
              <div className={styles.chartModalHeader}>
                <h3>{expandedChart.title}</h3>
                <div className={styles.chartModalActions}>
                  <button
                    type="button"
                    className={styles.downloadBtn}
                    onClick={downloadExpandedChartPdf}
                    disabled={isChartExporting}
                  >
                    {isChartExporting ? "Preparing PDF..." : "📄 Download PDF"}
                  </button>
                  <button type="button" className={styles.clearBtn} onClick={closeChartModal}>Close</button>
                </div>
              </div>

              <div ref={expandedChartRef} className={styles.chartModalCanvas}>
                {renderOverviewChart(expandedChart.type, true)}
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}