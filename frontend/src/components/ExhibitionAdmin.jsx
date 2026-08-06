import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { exhibitionService } from "../services/exhibitionService";
import { toast } from "sonner";
import styles from "./ExhibitionAdmin.module.css";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";

const TOKEN_KEY = "satech_admin_token";

export default function ExhibitionAdmin() {
  const [exhibitions, setExhibitions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", link: "", order: 0, image: null });
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => { checkAuth(); loadExhibitions(); }, []);

  useEffect(() => {
    if (!form.image || typeof form.image === 'string') return;
    const url = URL.createObjectURL(form.image);
    setImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [form.image]);

  const handleFileChange = (e) => {
    setForm(prev => ({ ...prev, image: e.target.files[0] }));
  };

  const checkAuth = () => {
    if (!localStorage.getItem(TOKEN_KEY)) navigate("/admin/login", { replace: true });
  };

  const loadExhibitions = async () => {
    try {
      setIsLoading(true);
      const data = await exhibitionService.getAll();
      setExhibitions(data.data || []);
    } catch (err) { setError(err.message); }
    finally { setIsLoading(false); }
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    let yPos = 20;
    doc.setFontSize(16);
    doc.text('Exhibition Gallery', 14, yPos);
    yPos += 15;
    doc.setFontSize(10);

    filtered.forEach(item => {
      doc.setFont(undefined, 'bold');
      doc.text(`${item.name}`, 14, yPos);
      yPos += 6;
      doc.setFont(undefined, 'normal');
      doc.setTextColor(100);
      doc.text(`Order #${item.order}`, 14, yPos);
      yPos += 8;
      doc.setTextColor(0);
      if (yPos > 270) { doc.addPage(); yPos = 20; }
    });
    doc.save('exhibitions.pdf');
    toast.success('PDF downloaded successfully!');
  };

  const downloadExcel = () => {
    const data = filtered.map(item => ({
      Name: item.name,
      'Display Order': item.order
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Exhibitions');
    XLSX.writeFile(workbook, 'exhibitions.xlsx');
    toast.success('Excel downloaded successfully!');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) {
      setError("Exhibition name is required");
      return;
    }
    if (!form.link.trim()) {
      setError("Exhibition link is required");
      return;
    }
    try {
      const data = new FormData();
      data.append("name", form.name.trim());
      data.append("link", form.link.trim());
      data.append("order", form.order);
      if (form.image instanceof File) data.append("image", form.image);

      if (editingId) await exhibitionService.update(editingId, data);
      else await exhibitionService.create(data);
      setForm({ name: "", link: "", order: 0, image: null });
      setImagePreview("");
      setEditingId(null);
      setShowForm(false);
      await loadExhibitions();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (ex) => {
    setEditingId(ex._id);
    setForm({
      name: ex.name || "",
      link: ex.link || "",
      order: ex.order || 0,
      image: null
    });
    setImagePreview(ex.imageUrl || "");
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this exhibition?")) return;
    try {
      await exhibitionService.delete(id);
      await loadExhibitions();
      if (editingId === id) {
        setEditingId(null);
        setForm({ name: "", link: "", order: 0, image: null });
        setImagePreview("");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm({ name: "", link: "", order: 0, image: null });
    setImagePreview("");
    setShowForm(false);
  };

  const matchesSearch = (item, term) => {
    if (!term.trim()) return true;
    return item.name.toLowerCase().includes(term.toLowerCase());
  };

  const filtered = exhibitions.filter(ex => matchesSearch(ex, searchTerm));

  return (
    <div className={styles.shell}>
      {/* Top Nav */}
      <header className={styles.topnav}>
        <div className={styles.topnavLeft}>
          <button onClick={() => navigate("/admin")} className={styles.backBtn}>
            <span>←</span> Dashboard
          </button>
          <div className={styles.topnavDivider} />
          <div className={styles.topnavTitle}>
            <span className={styles.topnavTag}>CONTENT</span>
            <h1>Exhibition Gallery</h1>
          </div>
        </div>
        <div className={styles.topbarActions}>
          <input
            type="text"
            placeholder="Search exhibitions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          <button onClick={() => { setShowForm(true); setEditingId(null); setImagePreview(""); setForm({ name: "", link: "", order: 0, image: null }); }}
            className={styles.addBtn}>
            ⊕ New Exhibition
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
                <span>{editingId ? "Edit Exhibition" : "New Exhibition"}</span>
                <button className={styles.closeBtn} onClick={handleCancel}>✕</button>
              </div>

              <form onSubmit={handleSubmit} className={styles.form}>
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
                      <span>Upload Exhibition Image</span>
                      <span className={styles.imageUploadSub}>Click to browse</span>
                    </div>
                  )}
                </label>

                <div className={styles.fieldGroup}>
                  <label>Exhibition Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. SEMICON Asia 2024"
                    value={form.name || ""}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label>Exhibition Link *</label>
                  <input
                    type="url"
                    placeholder="e.g. https://www.semicon.org"
                    value={form.link || ""}
                    onChange={e => setForm({ ...form, link: e.target.value })}
                    required
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <div className={styles.labelWithInfo}>
                    <label>Display Order</label>
                    <span className={styles.infoBubble} title="Nagseset ng posisyon ng exhibition na ito. Lumalabas muna ang mas mababang numero.">ⓘ</span>
                  </div>
                  <input
                    type="number"
                    value={form.order || 0}
                    onChange={e => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div className={styles.formActions}>
                  <button type="submit" className={styles.submitBtn}>
                    {editingId ? "Save Changes" : "Create Exhibition"}
                  </button>
                  <button type="button" onClick={handleCancel} className={styles.cancelBtn}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Gallery Grid */}
        {isLoading ? (
          <div className={styles.loadingState}>
            <div className={styles.spinner} />
            <span>Loading exhibitions...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>⬚</div>
            <p>No exhibitions found.</p>
            <button className={styles.addBtn} onClick={() => setShowForm(true)}>⊕ Add First Exhibition</button>
          </div>
        ) : (
          <div className={styles.galleryGrid}>
            {filtered.map(ex => (
              <div key={ex._id} className={styles.galleryCard}>
                <div className={styles.galleryCardImage}>
                  {ex.imageUrl ? (
                    <img src={ex.imageUrl} alt={ex.name} loading="lazy" />
                  ) : (
                    <span className={styles.noImage}>🔗</span>
                  )}
                  <div className={styles.galleryCardBadges}>
                    <span className={styles.orderBadge}>#{ex.order}</span>
                  </div>
                </div>
                <div className={styles.galleryCardFooter}>
                  <span className={styles.galleryCardName}>{ex.name}</span>
                  <div className={styles.galleryCardActions}>
                    <button className={styles.editBtn} onClick={() => handleEdit(ex)}>Edit</button>
                    <button className={styles.deleteBtn} onClick={() => handleDelete(ex._id)}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
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