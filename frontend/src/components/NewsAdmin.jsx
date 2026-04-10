import React, { useState, useEffect } from 'react';
import { newsService } from '../services/newsService';
import styles from './NewsAdmin.module.css';

export default function NewsAdmin() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    date: '',
    summary: '',
    link: '',
    image: null,
  });

  const categories = ['Exhibition', 'Partnership', 'Case Study', 'Product Launch', 'Press Release', 'Event'];

  // Fetch all news on mount
  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const data = await newsService.getAll();
      setNews(data);
    } catch (error) {
      alert('Failed to fetch news');
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      image: e.target.files[0],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.category || !formData.date || !formData.summary) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (key !== 'image') data.append(key, formData[key]);
        if (key === 'image' && formData.image) data.append('image', formData.image);
      });

      if (editingId) {
        await newsService.update(editingId, data);
        alert('News updated successfully');
      } else {
        await newsService.create(data);
        alert('News created successfully');
      }
      
      setFormData({ title: '', category: '', date: '', summary: '', link: '', image: null });
      setEditingId(null);
      setShowForm(false);
      fetchNews();
    } catch (error) {
      alert('Failed to save news');
    }
  };

  const handleEdit = (item) => {
    const dateStr = new Date(item.date).toISOString().split('T')[0];
    setFormData({
      title: item.title,
      category: item.category,
      date: dateStr,
      summary: item.summary,
      link: item.link || '',
      image: item.image || null,
    });
    setEditingId(item._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this news?')) {
      try {
        await newsService.delete(id);
        alert('News deleted successfully');
        fetchNews();
      } catch (error) {
        alert('Failed to delete news');
      }
    }
  };

  const handleCancel = () => {
    setFormData({ title: '', category: '', date: '', summary: '', link: '', image: null });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className={styles.container}>
      <h1>News & Articles Manager</h1>

      {!showForm ? (
        <button className={styles.addBtn} onClick={() => setShowForm(true)}>
          + Add News Article
        </button>
      ) : (
        <form className={styles.form} onSubmit={handleSubmit}>
          <h2>{editingId ? 'Edit News' : 'Create New Article'}</h2>
          
          <div className={styles.formGroup}>
            <label>Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter article title"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
            >
              <option value="">Select a category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Date *</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Summary *</label>
            <textarea
              name="summary"
              value={formData.summary}
              onChange={handleInputChange}
              placeholder="Enter article summary"
              rows="3"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Link</label>
            <input
              type="text"
              name="link"
              value={formData.link}
              onChange={handleInputChange}
              placeholder="https://example.com (optional)"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Image</label>
            <input
              type="file"
              name="image"
              onChange={handleFileChange}
              placeholder="Upload an image (optional)"
            />
          </div>

          <div className={styles.formButtons}>
            <button type="submit" className={styles.submitBtn}>
              {editingId ? 'Update' : 'Create'}
            </button>
            <button type="button" className={styles.cancelBtn} onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className={styles.table}>
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {news.map(item => (
                <tr key={item._id}>
                  <td>{item.title}</td>
                  <td>{item.category}</td>
                  <td>{new Date(item.date).toLocaleDateString()}</td>
                  <td className={styles.actions}>
                    <button
                      className={styles.editBtn}
                      onClick={() => handleEdit(item)}
                    >
                      Edit
                    </button>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => handleDelete(item._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}