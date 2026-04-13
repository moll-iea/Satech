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
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [activeRow, setActiveRow] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", row: 1, order: 0 });

  useEffect(() => { checkAuth(); loadExhibitions(); }, []);

  useEffect(() => {
    if (!imageFile) { setImagePreview(""); return; }
    const url = URL.createObjectURL(imageFile);
    setImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

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
      doc.text(`Row ${item.row} | Order #${item.order}`, 14, yPos);
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
      Row: item.row,
      'Display Order': item.order
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Exhibitions');
    XLSX.writeFile(workbook, 'exhibitions.xlsx');
    toast.success('Excel downloaded successfully!');
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError("");
    if (!form.name.trim()) { setError("Exhibition name is required"); return; }
    if (!imageFile && !editingId) { setError("Image is required for new exhibitions"); return; }
    try {
      const fd = new FormData();
      fd.append("name", form.name.trim());
      fd.append("row", form.row);
      fd.append("order", form.order);
      if (imageFile) fd.append("image", imageFile);
      if (editingId) await exhibitionService.update(editingId, fd);
      else await exhibitionService.create(fd);
      setForm({ name: "", row: 1, order: 0 });
      setImageFile(null); setEditingId(null); setShowForm(false);
      await loadExhibitions();
    } catch (err) { setError(err.message); }
  };

  const handleEdit = (ex) => {
    setEditingId(ex._id);
    setForm({ name: ex.name, row: ex.row, order: ex.order });
    setImagePreview(ex.image);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this exhibition?")) return;
    try {
      await exhibitionService.delete(id);
      await loadExhibitions();
      if (editingId === id) { setEditingId(null); setForm({ name: "", row: 1, order: 0 }); setImageFile(null); }
    } catch (err) { setError(err.message); }
  };

  const handleCancel = () => {
    setEditingId(null); setForm({ name: "", row: 1, order: 0 });
    setImageFile(null); setImagePreview(""); setShowForm(false);
  };

  const matchesSearch = (item, term) => {
    if (!term.trim()) return true;
    return item.name.toLowerCase().includes(term.toLowerCase());
  };

  const filtered = activeRow === "all" 
    ? exhibitions.filter(ex => matchesSearch(ex, searchTerm))
    : exhibitions.filter(ex => ex.row === parseInt(activeRow) && matchesSearch(ex, searchTerm));
  
  const rowCounts = { 
    all: exhibitions.filter(ex => matchesSearch(ex, searchTerm)).length, 
    1: exhibitions.filter(e => e.row === 1 && matchesSearch(e, searchTerm)).length, 
    2: exhibitions.filter(e => e.row === 2 && matchesSearch(e, searchTerm)).length 
  };

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
          <button onClick={() => { setShowForm(true); setEditingId(null); setImagePreview(""); setImageFile(null); setForm({ name: "", row: 1, order: 0 }); }}
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
                {/* Image Upload */}
                <label className={styles.imageUpload}>
                  <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} style={{ display: "none" }} />
                  {(imagePreview) ? (
                    <div className={styles.imageUploadPreview}>
                      <img src={imagePreview} alt="Preview" />
                      <div className={styles.imageUploadOverlay}>Change Image</div>
                    </div>
                  ) : (
                    <div className={styles.imageUploadPlaceholder}>
                      <span className={styles.imageUploadIcon}>⊞</span>
                      <span>Upload Exhibition Photo</span>
                      <span className={styles.imageUploadSub}>Click to browse</span>
                    </div>
                  )}
                </label>

                <div className={styles.fieldGroup}>
                  <label>Exhibition Name *</label>
                  <input type="text" placeholder="e.g. SEMICON Asia 2024" value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })} required />
                </div>

                <div className={styles.fieldRow}>
                  <div className={styles.fieldGroup}>
                    <div className={styles.labelWithInfo}>
                      <label>Gallery Row</label>
                      <span className={styles.infoBubble} title="Row 1: Pangunahing gallery section para sa featured exhibitions. Row 2: Secondary gallery section para sa karagdagang exhibitions.">ⓘ</span>
                    </div>
                    <div className={styles.segmentControl}>
                      {[1, 2].map(r => (
                        <button key={r} type="button"
                          className={`${styles.segment} ${form.row === r ? styles.segmentActive : ""}`}
                          onClick={() => setForm({ ...form, row: r })}>Row {r}</button>
                      ))}
                    </div>
                  </div>
                  <div className={styles.fieldGroup}>
                    <div className={styles.labelWithInfo}>
                      <label>Display Order</label>
                      <span className={styles.infoBubble} title="Nagseset ng posisyon ng exhibition na ito sa loob ng row. Lumalabas muna ang mas mababang numero.">ⓘ</span>
                    </div>
                    <input type="number" value={form.order} onChange={e => setForm({ ...form, order: parseInt(e.target.value) })} />
                  </div>
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

        {/* Filter Tabs */}
        <div className={styles.filterBar}>
          {[{ id: "all", label: "All" }, { id: "1", label: "Row 1" }, { id: "2", label: "Row 2" }].map(tab => (
            <button key={tab.id}
              className={`${styles.filterTab} ${activeRow === tab.id ? styles.filterTabActive : ""}`}
              onClick={() => setActiveRow(tab.id)}>
              {tab.label}
              <span className={styles.filterCount}>{rowCounts[tab.id]}</span>
            </button>
          ))}
        </div>

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
                  {ex.image
                    ? <img src={ex.image} alt={ex.name} loading="lazy" />
                    : <span className={styles.noImage}>⬚</span>}
                  <div className={styles.galleryCardBadges}>
                    <span className={styles.rowBadge}>Row {ex.row}</span>
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