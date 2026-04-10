import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { exhibitionService } from "../services/exhibitionService";
import styles from "./ExhibitionAdmin.module.css";

const TOKEN_KEY = "satech_admin_token";

export default function ExhibitionAdmin() {
  const [exhibitions, setExhibitions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    row: 1,
    order: 0,
  });

  useEffect(() => {
    checkAuth();
    loadExhibitions();
  }, []);

  useEffect(() => {
    if (!imageFile) {
      setImagePreview("");
      return;
    }
    const previewUrl = URL.createObjectURL(imageFile);
    setImagePreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [imageFile]);

  const checkAuth = () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      navigate("/admin/login", { replace: true });
    }
  };

  const loadExhibitions = async () => {
    try {
      setIsLoading(true);
      const data = await exhibitionService.getAll();
      setExhibitions(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("Exhibition name is required");
      return;
    }

    if (!imageFile && !editingId) {
      setError("Image is required for new exhibitions");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", form.name.trim());
      formData.append("row", form.row);
      formData.append("order", form.order);
      if (imageFile) {
        formData.append("image", imageFile);
      }

      if (editingId) {
        await exhibitionService.update(editingId, formData);
      } else {
        await exhibitionService.create(formData);
      }

      setForm({ name: "", row: 1, order: 0 });
      setImageFile(null);
      setEditingId(null);
      await loadExhibitions();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (exhibition) => {
    setEditingId(exhibition._id);
    setForm({
      name: exhibition.name,
      row: exhibition.row,
      order: exhibition.order,
    });
    setImagePreview(exhibition.image);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;

    try {
      await exhibitionService.delete(id);
      await loadExhibitions();
      if (editingId === id) {
        setEditingId(null);
        setForm({ name: "", row: 1, order: 0 });
        setImageFile(null);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm({ name: "", row: 1, order: 0 });
    setImageFile(null);
    setImagePreview("");
  };

  return (
    <div className={styles.container}>
      <button onClick={() => navigate("/admin")} className={styles.backBtn}>
        ← Back to Dashboard
      </button>

      <h1>Exhibition Management</h1>

      {error && <p className={styles.error}>{error}</p>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="text"
          placeholder="Exhibition name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />

        <select
          value={form.row}
          onChange={(e) => setForm({ ...form, row: parseInt(e.target.value) })}
        >
          <option value={1}>Row 1</option>
          <option value={2}>Row 2</option>
        </select>

        <input
          type="number"
          placeholder="Order"
          value={form.order}
          onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) })}
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files?.[0] || null)}
        />

        {(imagePreview || imageFile) && (
          <img src={imagePreview} alt="Preview" className={styles.preview} />
        )}

        <div className={styles.formActions}>
          <button type="submit">{editingId ? "Update" : "Add"} Exhibition</button>
          {editingId && (
            <button type="button" onClick={handleCancel} className={styles.cancel}>
              Cancel
            </button>
          )}
        </div>
      </form>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className={styles.list}>
          {exhibitions.map((ex) => (
            <div key={ex._id} className={styles.item}>
              <h3>{ex.name}</h3>
              <p>Row {ex.row} • Order {ex.order}</p>
              {ex.image && <img src={ex.image} alt={ex.name} />}
              <div className={styles.actions}>
                <button onClick={() => handleEdit(ex)} className={styles.edit}>
                  Edit
                </button>
                <button onClick={() => handleDelete(ex._id)} className={styles.delete}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}