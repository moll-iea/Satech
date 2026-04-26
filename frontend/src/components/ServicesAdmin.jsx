import React, { useState, useEffect } from 'react';
import { serviceService } from '../services/serviceService';
import { toast } from 'sonner';
import styles from './ServicesAdmin.module.css';

export default function ServicesAdmin() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    image: null
  });

  // Fetch all services
  const fetchServices = async () => {
    setLoading(true);
    try {
      const data = await serviceService.getAll();
      setServices(data);
    } catch (error) {
      toast.error('Failed to fetch services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.category) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!editingId && !formData.image) {
      toast.error('Please select an image');
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('category', formData.category);
    if (formData.image) {
      formDataToSend.append('image', formData.image);
    }

    try {
      if (editingId) {
        await serviceService.update(editingId, formDataToSend);
        toast.success('Service updated successfully');
      } else {
        await serviceService.create(formDataToSend);
        toast.success('Service created successfully');
      }
      
      fetchServices();
      resetForm();
    } catch (error) {
      toast.error(editingId ? 'Failed to update service' : 'Failed to create service');
    }
  };

  // Handle edit
  const handleEdit = (service) => {
    setFormData({
      title: service.title,
      description: service.description,
      category: service.category,
      image: null
    });
    setImagePreview(service.image);
    setEditingId(service._id);
    setIsFormOpen(true);
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        await serviceService.delete(id);
        toast.success('Service deleted successfully');
        fetchServices();
      } catch (error) {
        toast.error('Failed to delete service');
      }
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      image: null
    });
    setImagePreview(null);
    setEditingId(null);
    setIsFormOpen(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Services Management</h1>
        <button 
          className={styles.addBtn}
          onClick={() => setIsFormOpen(true)}
        >
          + Add Service
        </button>
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>{editingId ? 'Edit Service' : 'Create Service'}</h2>
              <button 
                className={styles.closeBtn}
                onClick={resetForm}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              {/* Title */}
              <div className={styles.formGroup}>
                <label>Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter service title"
                  required
                />
              </div>

              {/* Category */}
              <div className={styles.formGroup}>
                <label>Category *</label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  placeholder="Enter service category"
                  required
                />
              </div>

              {/* Description */}
              <div className={styles.formGroup}>
                <label>Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter service description"
                  rows="5"
                  required
                />
              </div>

              {/* Image */}
              <div className={styles.formGroup}>
                <label>Image {!editingId && '*'}</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className={styles.fileInput}
                />
                {imagePreview && (
                  <div className={styles.imagePreview}>
                    <img src={imagePreview} alt="Preview" />
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div className={styles.formActions}>
                <button 
                  type="button"
                  className={styles.cancelBtn}
                  onClick={resetForm}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className={styles.submitBtn}
                >
                  {editingId ? 'Update Service' : 'Create Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Services List */}
      <div className={styles.listContainer}>
        {loading ? (
          <p className={styles.loading}>Loading services...</p>
        ) : services.length === 0 ? (
          <p className={styles.empty}>No services found. Create one to get started!</p>
        ) : (
          <div className={styles.servicesGrid}>
            {services.map(service => (
              <div key={service._id} className={styles.card}>
                {service.image && (
                  <img src={service.image} alt={service.title} className={styles.cardImage} />
                )}
                <div className={styles.cardContent}>
                  <h3 className={styles.cardTitle}>{service.title}</h3>
                  <p className={styles.cardCategory}>{service.category}</p>
                  <p className={styles.cardDescription}>{service.description}</p>
                  <div className={styles.cardActions}>
                    <button
                      className={styles.editBtn}
                      onClick={() => handleEdit(service)}
                    >
                      Edit
                    </button>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => handleDelete(service._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
