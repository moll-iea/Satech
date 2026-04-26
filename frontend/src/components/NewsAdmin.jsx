import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { newsService } from '../services/newsService';
import { toast } from 'sonner';
import styles from './NewsAdmin.module.css';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

const TOKEN_KEY = "satech_admin_token";

const CATEGORIES = [
  'Exhibition', 
  'Partnership', 
  'Case Study', 
  'Product Launch', 
  'Press Release', 
  'Event',
  'New Category Here'  // ← Add your new category
];

const CAT_COLORS = {
  Exhibition: { bg: 'rgba(0,229,255,0.08)', border: 'rgba(0,229,255,0.2)', text: '#00e5ff' },
  Partnership: { bg: 'rgba(124,58,237,0.08)', border: 'rgba(124,58,237,0.2)', text: '#a78bfa' },
  'Case Study': { bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)', text: '#34d399' },
  'Product Launch': { bg: 'rgba(251,146,60,0.08)', border: 'rgba(251,146,60,0.2)', text: '#fb923c' },
  'Press Release': { bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)', text: '#f87171' },
  Event: { bg: 'rgba(234,179,8,0.08)', border: 'rgba(234,179,8,0.2)', text: '#facc15' },
  'New Category Here': { bg: 'rgba(255,100,0,0.08)', border: 'rgba(255,100,0,0.2)', text: '#f55f0f' },
};

const getCategoryColor = (category) => {
  return CAT_COLORS[category] || { 
    bg: 'rgba(100,100,100,0.08)', 
    border: 'rgba(100,100,100,0.2)', 
    text: '#999999' 
  };
};

const matchesSearch = (item, term) => {
  if (!term.trim()) return true;
  const searchLower = term.toLowerCase();
  return (
    item.title?.toLowerCase().includes(searchLower) ||
    item.category?.toLowerCase().includes(searchLower) ||
    item.summary?.toLowerCase().includes(searchLower) ||
    item.author?.toLowerCase().includes(searchLower) ||
    new Date(item.date).toLocaleDateString().includes(searchLower)
  );
};

export default function NewsAdmin() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '', category: '', date: '', summary: '', link: '', source: '', author: '', image: null,
  });
  const [imagePreview, setImagePreview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => { checkAuth(); fetchNews(); }, []);

  useEffect(() => {
    if (!formData.image || typeof formData.image === 'string') return;
    const url = URL.createObjectURL(formData.image);
    setImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [formData.image]);

  const checkAuth = () => {
    if (!localStorage.getItem(TOKEN_KEY)) navigate("/admin/login", { replace: true });
  };

  const fetchNews = async () => {
    setLoading(true);
    try {
      const data = await newsService.getAll();
      setNews(Array.isArray(data) ? data : data.data || []);
    } catch { setError('Failed to fetch news'); }
    setLoading(false);
  };

  // ── Moved inside component so they can access `news` state ──

  const handleCancel = () => {
    setFormData({ title: '', category: '', date: '', summary: '', link: '', source: '', author: '', image: null });
    setImagePreview("");
    setShowForm(false);
    setEditingId(null);
    setError("");
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    let yPos = 20;
    doc.setFontSize(16);
    doc.text('News & Articles', 14, yPos);
    yPos += 15;
    doc.setFontSize(10);
    
    news.forEach(item => {
      doc.setFont(undefined, 'bold');
      doc.text(`${item.title}`, 14, yPos);
      yPos += 6;
      doc.setFont(undefined, 'normal');
      doc.setTextColor(100);
      doc.text(`${item.category} | ${new Date(item.date).toLocaleDateString()}`, 14, yPos);
      yPos += 4;
      const summary = doc.splitTextToSize(item.summary, 180);
      doc.text(summary, 14, yPos);
      yPos += summary.length * 4 + 5;
      doc.setTextColor(0);
      if (item.link) doc.textWithLink(item.link, 14, yPos, { pageNumber: undefined });
      yPos += 8;
      if (yPos > 270) { doc.addPage(); yPos = 20; }
    });
    doc.save('articles.pdf');
    toast.success('PDF downloaded successfully!');
  };

  const downloadExcel = () => {
    const data = news.map(item => ({
      Title: item.title,
      Category: item.category,
      Date: new Date(item.date).toLocaleDateString(),
      Summary: item.summary,
      Link: item.link || '-'
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Articles');
    XLSX.writeFile(workbook, 'articles.xlsx');
    toast.success('Excel downloaded successfully!');
  };

  // ────────────────────────────────────────────────────────────

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, image: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError("");
    if (!formData.title || !formData.category || !formData.date || !formData.summary) {
      setError('Please fill in all required fields'); return;
    }
    setSubmitting(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'image' && formData.image instanceof File) {
          data.append('image', formData.image);
        } else if (key !== 'image' && key !== 'imageUrl') {
          data.append(key, formData[key]);
        }
      });
      if (editingId) await newsService.update(editingId, data);
      else await newsService.create(data);
      toast.success(editingId ? 'Article updated successfully!' : 'Article created successfully!');
      setFormData({ title: '', category: '', date: '', summary: '', link: '', source: '', author: '', image: null });
      setImagePreview(""); setEditingId(null); setShowForm(false);
      await fetchNews();
    } catch (err) { 
      toast.error(err.message || 'Failed to save news'); 
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item) => {
    const dateStr = new Date(item.date).toISOString().split('T')[0];
    setFormData({ title: item.title, category: item.category, date: dateStr, summary: item.summary, link: item.link || '', source: item.source || '', author: item.author || '', image: null });
    setImagePreview(item.imageUrl || "");
    setEditingId(item._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this article?')) return;
    setDeleting(id);
    try { 
      await newsService.delete(id); 
      toast.success('Article deleted successfully!'); 
      await fetchNews(); 
    }
    catch { setError('Failed to delete'); }
    finally {
      setDeleting(null);
    }
  };

  const allCategories = [...new Set([...CATEGORIES, ...news.map(n => n.category).filter(Boolean)])];
  const catCounts = allCategories.reduce((acc, cat) => ({ ...acc, [cat]: news.filter(n => n.category === cat).length }), {});
  const filteredNews = activeFilter === "all" 
    ? news.filter(n => matchesSearch(n, searchTerm))
    : news.filter(n => n.category === activeFilter && matchesSearch(n, searchTerm));

  return (
    <div className={styles.shell}>
      {/* Top Nav */}
      <header className={styles.topnav}>
        <div className={styles.topnavLeft}>
          <button onClick={() => navigate("/admin")} className={styles.backBtn}>← Dashboard</button>
          <div className={styles.topnavDivider} />
          <div className={styles.topnavTitle}>
            <span className={styles.topnavTag}>CONTENT</span>
            <h1>News & Articles</h1>
          </div>
        </div>
        <div className={styles.topbarActions}>
          <input
            type="text"
            placeholder="Search articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          {/* <button onClick={downloadPDF} className={styles.downloadBtn}>📄 PDF</button>
          <button onClick={downloadExcel} className={styles.downloadBtn}>📊 Excel</button> */}
          <button onClick={() => { setShowForm(true); setEditingId(null); setImagePreview(""); setFormData({ title: '', category: '', date: '', summary: '', link: '', source: '', author: '', image: null }); }}
            className={styles.addBtn}>
            ⊕ New Article
          </button>
        </div>
      </header>

      <div className={styles.body}>
        {error && <div className={styles.errorBanner}>{error}</div>}

        {/* Slide-in Form Panel */}
        {showForm && (
          <div className={styles.formOverlay} onClick={handleCancel}>
            <div className={styles.formPanel} onClick={e => e.stopPropagation()}>
              <div className={styles.formPanelHeader}>
                <span>{editingId ? "Edit Article" : "New Article"}</span>
                <button className={styles.closeBtn} onClick={handleCancel}>✕</button>
              </div>

              <form className={styles.form} onSubmit={handleSubmit}>
                {/* Image */}
                <label className={styles.imageUpload}>
                  <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
                  {imagePreview ? (
                    <div className={styles.imageUploadPreview}>
                      <img src={imagePreview} alt="Preview" />
                      <div className={styles.imageUploadOverlay}>Change Image</div>
                    </div>
                  ) : (
                    <div className={styles.imageUploadPlaceholder}>
                      <span className={styles.imageUploadIcon}>◎</span>
                      <span>Upload Article Image</span>
                      <span className={styles.imageUploadSub}>Click to browse</span>
                    </div>
                  )}
                </label>

                <div className={styles.fieldGroup}>
                  <label>Title *</label>
                  <input type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="Article headline..." />
                </div>

                <div className={styles.fieldRow}>
                  <div className={styles.fieldGroup}>
                    <label>Category *</label>
                    <input 
                      type="text" 
                      name="category" 
                      value={formData.category} 
                      onChange={handleInputChange} 
                      placeholder="e.g., Exhibition, Webinar, etc..."
                      list="categorySuggestions"
                    />
                    <datalist id="categorySuggestions">
                      {CATEGORIES.map(c => <option key={c} value={c} />)}
                    </datalist>
                  </div>
                  <div className={styles.fieldGroup}>
                    <label>Date *</label>
                    <input type="date" name="date" value={formData.date} onChange={handleInputChange} />
                  </div>
                </div>

                <div className={styles.fieldGroup}>
                  <label>Summary *</label>
                  <textarea name="summary" value={formData.summary} onChange={handleInputChange}
                    placeholder="Brief summary of the article..." rows={3} />
                </div>

                <div className={styles.fieldGroup}>
                  <label>External Link</label>
                  <input type="text" name="link" value={formData.link} onChange={handleInputChange} placeholder="https://..." />
                </div>

                <div className={styles.fieldGroup}>
                  <label>Source</label>
                  <input type="text" name="source" value={formData.source} onChange={handleInputChange} placeholder="e.g., Reuters, Bloomberg, etc." />
                </div>

                <div className={styles.fieldGroup}>
                  <label>Author</label>
                  <input type="text" name="author" value={formData.author} onChange={handleInputChange} placeholder="Article author..." />
                </div>

                <div className={styles.formActions}>
                  <button type="submit" className={styles.submitBtn} disabled={submitting}>
                    {submitting ? '⟳ Saving...' : (editingId ? 'Save Changes' : 'Publish Article')}
                  </button>
                  <button type="button" className={styles.cancelBtn} onClick={handleCancel}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Stats strip */}
        <div className={styles.statsStrip}>
          <div className={styles.statPill}>
            <span className={styles.statPillNum}>{news.length}</span>
            <span>Total Articles</span>
          </div>
          {allCategories.filter(c => catCounts[c] > 0).map(cat => (
            <div key={cat} className={styles.statPill} style={{ borderColor: CAT_COLORS[cat]?.border }}>
              <span className={styles.statPillNum} style={{ color: CAT_COLORS[cat]?.text }}>{catCounts[cat]}</span>
              <span>{cat}</span>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className={styles.filterBar}>
          <button className={`${styles.filterTab} ${activeFilter === "all" ? styles.filterTabActive : ""}`}
            onClick={() => setActiveFilter("all")}>
            All <span className={styles.filterCount}>{news.length}</span>
          </button>
          {allCategories.filter(c => catCounts[c] > 0).map(cat => (
            <button key={cat}
              className={`${styles.filterTab} ${activeFilter === cat ? styles.filterTabActive : ""}`}
              style={activeFilter === cat ? { borderColor: CAT_COLORS[cat]?.border, color: CAT_COLORS[cat]?.text } : {}}
              onClick={() => setActiveFilter(cat)}>
              {cat} <span className={styles.filterCount}>{catCounts[cat]}</span>
            </button>
          ))}
        </div>

        {/* Articles */}
        {loading ? (
          <div className={styles.loadingState}><div className={styles.spinner} /><span>Loading articles...</span></div>
        ) : filteredNews.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>◎</div>
            <p>No articles found.</p>
            <button className={styles.addBtn} onClick={() => setShowForm(true)}>⊕ Create First Article</button>
          </div>
        ) : (
          <div className={styles.articleGrid}>
            {filteredNews.map(item => {
              const catStyle = getCategoryColor(item.category);
              return (
                <div key={item._id} className={styles.articleCard}>
                  <div className={styles.articleCardImage}>
                    {item.imageUrl
                      ? <img src={item.imageUrl} alt={item.title} loading="lazy" />
                      : <span className={styles.noImage}>◎</span>}
                    <span className={styles.catTag}
                      style={{ background: catStyle.bg, borderColor: catStyle.border, color: catStyle.text }}>
                      {item.category}
                    </span>
                  </div>
                  <div className={styles.articleCardBody}>
                    <div className={styles.articleMeta}>
                      <span className={styles.articleDate}>{new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                      {item.link && <a href={item.link} target="_blank" rel="noopener noreferrer" className={styles.articleLink}>↗ Link</a>}
                    </div>
                    {item.source && <span className={styles.articleSource}>{item.source}</span>}
                    {item.author && <span className={styles.articleSource} style={{ fontSize: "0.75rem", color: "#7ab0c0" }}>By {item.author}</span>}
                    <h3 className={styles.articleTitle}>{item.title}</h3>
                    <p className={styles.articleSummary}>{item.summary?.substring(0, 90)}{item.summary?.length > 90 ? '...' : ''}</p>
                  </div>
                  <div className={styles.articleCardFooter}>
                    <button className={styles.editBtn} onClick={() => handleEdit(item)}>Edit</button>
                    <button 
                      className={styles.deleteBtn} 
                      onClick={() => handleDelete(item._id)}
                      disabled={deleting === item._id}
                    >
                      {deleting === item._id ? '⟳ Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div className={styles.downloadControls}>
        <button className={styles.downloadBtn} onClick={downloadPDF}>Download PDF</button>
        <button className={styles.downloadBtn} onClick={downloadExcel}>Download Excel</button>
      </div>
    </div>
  );
}