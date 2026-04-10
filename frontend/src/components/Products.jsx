import React, { useEffect, useMemo, useState } from "react";
import { PRODUCTS } from "../data/siteData";
import { useScrollReveal } from "../hooks/useScrollReveal";
import styles from "./Products.module.css";

const resolveImageUrl = (imagePath) => {
  if (!imagePath) {
    return "";
  }

  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
  return `${baseUrl}${imagePath.startsWith("/") ? imagePath : `/${imagePath}`}`;
};

export default function Products() {
  const [apiProducts, setApiProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [brokenImages, setBrokenImages] = useState({});
  const ref = useScrollReveal();

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
        const response = await fetch(`${baseUrl}/api/products`);
        const payload = await response.json();

        if (!response.ok || !payload.success || !Array.isArray(payload.data)) {
          throw new Error("Failed to load products");
        }

        setApiProducts(payload.data);
      } catch (_err) {
        setApiProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const catalog = useMemo(() => {
    if (apiProducts.length) {
      return apiProducts.map((item) => ({
        category: item.category || "Uncategorized",
        image: resolveImageUrl(item.image),
        name: item.name,
        detail: item.detail,
      }));
    }

    return Object.entries(PRODUCTS).flatMap(([category, items]) =>
      items.map((item) => ({
        category,
        image: "",
        name: item.name,
        detail: item.detail,
      }))
    );
  }, [apiProducts]);

  const groupedCatalog = useMemo(() => {
    return catalog.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {});
  }, [catalog]);

  const markImageBroken = (category, name) => {
    setBrokenImages((prev) => ({
      ...prev,
      [`${category}-${name}`]: true,
    }));
  };

  return (
    <section className={styles.products} id="products" ref={ref}>
      <div className={styles.header}>
        <div className="section-tag">// Product Catalogue</div>
        <h2 className="section-title">Advanced<br />Equipment</h2>
        <div className="divider" />
      </div>

      {loading && <p className={styles.loading}>Loading products...</p>}

      {Object.entries(groupedCatalog).map(([category, items]) => (
        <div key={category} className={styles.categoryBlock}>
          <h3 className={styles.categoryTitle}>{category}</h3>
          <div className={styles.grid}>
            {items.map((p) => (
              <div className={`${styles.card} reveal`} key={`${category}-${p.name}`}>
                {p.image && !brokenImages[`${category}-${p.name}`] ? (
                  <img
                    className={styles.image}
                    src={p.image}
                    alt={p.name}
                    loading="lazy"
                    onError={() => markImageBroken(category, p.name)}
                  />
                ) : (
                  <div className={styles.imageFallback}>No image</div>
                )}
                <div className={styles.name}>{p.name}</div>
                <div className={styles.detail}>{p.detail}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
