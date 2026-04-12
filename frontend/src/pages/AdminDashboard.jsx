import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./AdminDashboard.module.css";

const TOKEN_KEY = "satech_admin_token";

const EMPTY_CATEGORY_FORM = {
  name: "",
  description: "",
};

const EMPTY_PRODUCT_FORM = {
  name: "",
  detail: "",
  categoryId: "",
};

const resolveImageUrl = (imagePath) => {
  if (!imagePath) {
    return "";
  }

  if (imagePath.startsWith("http://") || imagePath.startsWith("https://") || imagePath.startsWith("blob:")) {
    return imagePath;
  }

  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
  return `${baseUrl}${imagePath.startsWith("/") ? imagePath : `/${imagePath}`}`;
};

export default function AdminDashboard() {
  const [messages, setMessages] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

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

  const navigate = useNavigate();

  const stats = useMemo(() => [
    { label: "Categories", value: categories.length },
    { label: "Products", value: products.length },
    { label: "Inquiries", value: messages.length },
  ], [categories.length, products.length, messages.length]);

  useEffect(() => {
    if (!imageFile) {
      setImagePreview("");
      return undefined;
    }

    const previewUrl = URL.createObjectURL(imageFile);
    setImagePreview(previewUrl);

    return () => URL.revokeObjectURL(previewUrl);
  }, [imageFile]);

  const authHeaders = () => {
    const token = localStorage.getItem(TOKEN_KEY);
    return {
      Authorization: `Bearer ${token}`,
    };
  };

  const jsonHeaders = () => ({
    ...authHeaders(),
    "Content-Type": "application/json",
  });

  const resolveCategoryIdFromProduct = (product) => {
    if (product.categoryId && typeof product.categoryId === "object") {
      return product.categoryId._id || "";
    }

    if (typeof product.categoryId === "string") {
      return product.categoryId;
    }

    const matchedCategory = categories.find((category) => {
      if (!category.name || !product.category) {
        return false;
      }

      return category.name.toLowerCase() === product.category.toLowerCase();
    });

    return matchedCategory ? matchedCategory._id : "";
  };

  const loadAdminData = async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      navigate("/admin/login", { replace: true });
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
      const [messagesRes, productsRes, categoriesRes] = await Promise.all([
        fetch(`${baseUrl}/api/contact/messages`, {
          method: "GET",
          headers: authHeaders(),
        }),
        fetch(`${baseUrl}/api/products`, {
          method: "GET",
        }),
        fetch(`${baseUrl}/api/categories`, {
          method: "GET",
        }),
      ]);

      if (messagesRes.status === 401 || messagesRes.status === 403) {
        localStorage.removeItem(TOKEN_KEY);
        navigate("/admin/login", { replace: true });
        return;
      }

      const messagesData = await messagesRes.json();
      const productsData = await productsRes.json();
      const categoriesData = await categoriesRes.json();

      if (!messagesRes.ok || !messagesData.success) {
        throw new Error(messagesData.message || "Failed to load inquiries.");
      }

      if (!productsRes.ok || !productsData.success) {
        throw new Error(productsData.message || "Failed to load products.");
      }

      if (!categoriesRes.ok || !categoriesData.success) {
        throw new Error(categoriesData.message || "Failed to load categories.");
      }

      setMessages(Array.isArray(messagesData.data) ? messagesData.data : []);
      setProducts(Array.isArray(productsData.data) ? productsData.data : []);
      setCategories(Array.isArray(categoriesData.data) ? categoriesData.data : []);
    } catch (err) {
      setError(err.message || "Failed to load admin data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [navigate]);

  const resetCategoryForm = () => {
    setCategoryForm(EMPTY_CATEGORY_FORM);
    setCategoryEditingId("");
    setCategoryError("");
  };

  const resetProductForm = () => {
    setProductForm(EMPTY_PRODUCT_FORM);
    setEditingId("");
    setCurrentImage("");
    setImageFile(null);
    setProductError("");
  };

  const reloadCategories = async () => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
    const response = await fetch(`${baseUrl}/api/categories`);
    const payload = await response.json();

    if (!response.ok || !payload.success) {
      throw new Error(payload.message || "Failed to reload categories.");
    }

    setCategories(Array.isArray(payload.data) ? payload.data : []);
  };

  const reloadProducts = async () => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
    const response = await fetch(`${baseUrl}/api/products`);
    const payload = await response.json();

    if (!response.ok || !payload.success) {
      throw new Error(payload.message || "Failed to reload products.");
    }

    setProducts(Array.isArray(payload.data) ? payload.data : []);
  };

  const handleEditCategory = (item) => {
    setCategoryEditingId(item._id);
    setCategoryForm({
      name: item.name || "",
      description: item.description || "",
    });
    setCategoryError("");
  };

  const handleSaveCategory = async (event) => {
    event.preventDefault();
    setCategoryError("");

    if (!categoryForm.name.trim()) {
      setCategoryError("Category name is required.");
      return;
    }

    try {
      setCategoryLoading(true);
      const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
      const isEditing = Boolean(categoryEditingId);
      const endpoint = isEditing ? `${baseUrl}/api/categories/${categoryEditingId}` : `${baseUrl}/api/categories`;

      const response = await fetch(endpoint, {
        method: isEditing ? "PUT" : "POST",
        headers: jsonHeaders(),
        body: JSON.stringify({
          name: categoryForm.name.trim(),
          description: categoryForm.description.trim(),
        }),
      });

      const payload = await response.json();

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem(TOKEN_KEY);
        navigate("/admin/login", { replace: true });
        return;
      }

      if (!response.ok || !payload.success) {
        throw new Error(payload.message || "Failed to save category.");
      }

      await reloadCategories();
      resetCategoryForm();
      await reloadProducts();
    } catch (err) {
      setCategoryError(err.message || "Failed to save category.");
    } finally {
      setCategoryLoading(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    try {
      setCategoryError("");
      setCategoryLoading(true);
      const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
      const response = await fetch(`${baseUrl}/api/categories/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });

      const payload = await response.json();

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem(TOKEN_KEY);
        navigate("/admin/login", { replace: true });
        return;
      }

      if (!response.ok || !payload.success) {
        throw new Error(payload.message || "Failed to delete category.");
      }

      await reloadCategories();
      if (categoryEditingId === id) {
        resetCategoryForm();
      }
    } catch (err) {
      setCategoryError(err.message || "Failed to delete category.");
    } finally {
      setCategoryLoading(false);
    }
  };

  const handleEditProduct = (item) => {
    setEditingId(item._id);
    setProductForm({
      name: item.name || "",
      detail: item.detail || "",
      categoryId: resolveCategoryIdFromProduct(item),
    });
    setCurrentImage(resolveImageUrl(item.image));
    setImageFile(null);
    setProductError("");
  };

  const handleSaveProduct = async (event) => {
    event.preventDefault();
    setProductError("");

    if (!productForm.name.trim() || !productForm.detail.trim() || !productForm.categoryId) {
      setProductError("Name, detail, and category are required.");
      return;
    }

    if (!imageFile && !currentImage) {
      setProductError("Please select an image file.");
      return;
    }

    try {
      setProductLoading(true);
      const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
      const isEditing = Boolean(editingId);
      const endpoint = isEditing ? `${baseUrl}/api/products/${editingId}` : `${baseUrl}/api/products`;
      const formData = new FormData();

      formData.append("name", productForm.name.trim());
      formData.append("detail", productForm.detail.trim());
      formData.append("categoryId", productForm.categoryId);

      if (imageFile) {
        formData.append("image", imageFile);
      }

      const response = await fetch(endpoint, {
        method: isEditing ? "PUT" : "POST",
        headers: authHeaders(),
        body: formData,
      });

      const payload = await response.json();

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem(TOKEN_KEY);
        navigate("/admin/login", { replace: true });
        return;
      }

      if (!response.ok || !payload.success) {
        throw new Error(payload.message || "Failed to save product.");
      }

      await reloadProducts();
      resetProductForm();
    } catch (err) {
      setProductError(err.message || "Failed to save product.");
    } finally {
      setProductLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      setProductError("");
      setProductLoading(true);
      const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
      const response = await fetch(`${baseUrl}/api/products/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });

      const payload = await response.json();

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem(TOKEN_KEY);
        navigate("/admin/login", { replace: true });
        return;
      }

      if (!response.ok || !payload.success) {
        throw new Error(payload.message || "Failed to delete product.");
      }

      await reloadProducts();
      if (editingId === id) {
        resetProductForm();
      }
    } catch (err) {
      setProductError(err.message || "Failed to delete product.");
    } finally {
      setProductLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(TOKEN_KEY);
    navigate("/admin/login", { replace: true });
  };

  const handleImageChange = (event) => {
    const selectedFile = event.target.files && event.target.files[0] ? event.target.files[0] : null;
    setImageFile(selectedFile);
    setCurrentImage("");
  };

  const canSubmitProduct = categories.length > 0;

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.tag}>SATECH ADMIN</p>
          <h1 className={styles.title}>Categories, Products, and Inquiries</h1>
          <p className={styles.subtitle}>Manage the content that appears on the public website from one place.</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.logout} onClick={handleLogout}>Logout</button>
        </div>
      </header>

      {!isLoading && !error && (
        <section className={styles.overviewGrid}>
          {stats.map((stat) => (
            <article className={styles.overviewCard} key={stat.label}>
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
            </article>
          ))}
        </section>
      )}

      {isLoading && <p className={styles.state}>Loading admin data...</p>}
      {!isLoading && error && <p className={styles.error}>{error}</p>}

      {!isLoading && !error && (
        <div className={styles.managementGrid}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Category Management</h2>

          <form className={styles.form} onSubmit={handleSaveCategory}>
            <input
              type="text"
              placeholder="Category name"
              value={categoryForm.name}
              onChange={(e) => setCategoryForm((prev) => ({ ...prev, name: e.target.value }))}
            />
            <textarea
              placeholder="Category description (optional)"
              value={categoryForm.description}
              onChange={(e) => setCategoryForm((prev) => ({ ...prev, description: e.target.value }))}
            />

            {categoryError && <p className={styles.error}>{categoryError}</p>}

            <div className={styles.formActions}>
              <button className={styles.save} type="submit" disabled={categoryLoading}>
                {categoryLoading ? "Saving..." : categoryEditingId ? "Update Category" : "Add Category"}
              </button>
              {categoryEditingId && (
                <button className={styles.cancel} type="button" onClick={resetCategoryForm}>
                  Cancel Edit
                </button>
              )}
            </div>
          </form>

          <div className={styles.categoryGrid}>
            {categories.map((category) => (
              <article className={styles.categoryCard} key={category._id}>
                <h3>{category.name}</h3>
                <p>{category.description || "No description"}</p>
                <div className={styles.productActions}>
                  <button type="button" className={styles.edit} onClick={() => handleEditCategory(category)}>
                    Edit
                  </button>
                  <button type="button" className={styles.delete} onClick={() => handleDeleteCategory(category._id)}>
                    Delete
                  </button>
                </div>
              </article>
            ))}
            {categories.length === 0 && <p className={styles.state}>No categories yet. Create one first.</p>}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Product Management</h2>

          {categories.length === 0 && (
            <p className={styles.notice}>Create at least one category before adding products.</p>
          )}

          <form className={styles.form} onSubmit={handleSaveProduct}>
            <input
              type="text"
              placeholder="Product name"
              value={productForm.name}
              onChange={(e) => setProductForm((prev) => ({ ...prev, name: e.target.value }))}
            />
            <select
              value={productForm.categoryId}
              onChange={(e) => setProductForm((prev) => ({ ...prev, categoryId: e.target.value }))}
              className={styles.select}
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
            {(imagePreview || currentImage) && (
              <img
                className={styles.formImagePreview}
                src={imagePreview || currentImage}
                alt="Selected product preview"
              />
            )}
            {!imagePreview && !currentImage && (
              <div className={styles.formImageFallback}>Choose an image file</div>
            )}
            <textarea
              placeholder="Product detail"
              value={productForm.detail}
              onChange={(e) => setProductForm((prev) => ({ ...prev, detail: e.target.value }))}
            />

            {productError && <p className={styles.error}>{productError}</p>}

            <div className={styles.formActions}>
              <button className={styles.save} type="submit" disabled={productLoading || !canSubmitProduct}>
                {productLoading ? "Saving..." : editingId ? "Update Product" : "Add Product"}
              </button>
              {editingId && (
                <button className={styles.cancel} type="button" onClick={resetProductForm}>
                  Cancel Edit
                </button>
              )}
            </div>
          </form>

          <div className={styles.productsGrid}>
            {products.map((product) => (
              <article className={styles.productCard} key={product._id}>
                <div className={styles.productTop}>
                  <h3>{product.name}</h3>
                  <p>{product.category}</p>
                </div>
                {product.image ? (
                  <img className={styles.productImage} src={resolveImageUrl(product.image)} alt={product.name} loading="lazy" />
                ) : (
                  <div className={styles.productImageFallback}>No image</div>
                )}
                <p className={styles.productDetail}>{product.detail}</p>
                <div className={styles.productActions}>
                  <button type="button" className={styles.edit} onClick={() => handleEditProduct(product)}>
                    Edit
                  </button>
                  <button type="button" className={styles.delete} onClick={() => handleDeleteProduct(product._id)}>
                    Delete
                  </button>
                </div>
              </article>
            ))}
            {products.length === 0 && <p className={styles.state}>No products yet. Add your first product above.</p>}
          </div>
        </section>
        </div>
      )}

      {!isLoading && !error && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Latest Inquiries</h2>
          {messages.length === 0 && <p className={styles.state}>No inquiries yet.</p>}
          {messages.length > 0 && (
            <div className={styles.grid}>
              {messages.map((item) => (
                <article key={item._id} className={styles.card}>
                  <div className={styles.row}>
                    <h2>{item.name}</h2>
                    <span>{new Date(item.createdAt).toLocaleString()}</span>
                  </div>
                  <p><strong>Email:</strong> {item.email}</p>
                  <p><strong>Company:</strong> {item.company || "-"}</p>
                  <p className={styles.message}>{item.message}</p>
                </article>
              ))}
            </div>
          )}
        </section>
      )}
    </main>
  );
}
