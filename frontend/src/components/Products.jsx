import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { PRODUCTS } from "../data/siteData";
import { useScrollReveal } from "../hooks/useScrollReveal";
import styles from "./Products.module.css";

const resolveImageUrl = (imagePath) => {
  if (!imagePath) return "";
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) return imagePath;
  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
  return `${baseUrl}${imagePath.startsWith("/") ? imagePath : `/${imagePath}`}`;
};

const INITIAL_LIMIT = 5;

/* ── Fallback SVG ── */
function ImageFallback() {
  return (
    <div className={styles.imageFallback}>
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    </div>
  );
}

/* ── Modal lightbox ── */
function ProductModal({ product, broken, onImageError, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <button className={styles.modalClose} onClick={onClose} aria-label="Close">✕</button>
        <div className={styles.modalImageWrap}>
          {product.image && !broken ? (
            <img
              className={styles.modalImage}
              src={product.image}
              alt={product.name}
              onError={onImageError}
            />
          ) : (
            <ImageFallback />
          )}
          <span className={styles.badge}>{product.category}</span>
        </div>
        <div className={styles.modalBody}>
          <h3 className={styles.modalName}>{product.name}</h3>
          <p className={styles.modalDetail}>{product.detail}</p>
        </div>
      </div>
    </div>
  );
}

/* ── All Products full page ── */
function AllProductsPage({ catalog, categories, onBack }) {
  const [filterCat, setFilterCat] = useState("All");
  const [modalProduct, setModalProduct] = useState(null);
  const [brokenImages, setBrokenImages] = useState({});

  const filtered = useMemo(() => {
    return filterCat === "All" ? catalog : catalog.filter((p) => p.category === filterCat);
  }, [catalog, filterCat]);

  const markBroken = (key) => setBrokenImages((prev) => ({ ...prev, [key]: true }));

  return (
    <div className={styles.allProductsPage}>
      {/* Header */}
      <div className={styles.allPageHeader}>
        <button className={styles.backBtn} onClick={onBack}>
          ← Back
        </button>
        <div className={styles.allPageTitleBlock}>
          <span className={styles.eyebrow}>Full Catalogue</span>
          <h2 className={styles.heroTitle}>All <em>Products</em></h2>
        </div>
      </div>

      {/* Category filter */}
      <div className={styles.filterRow}>
        {categories.map((cat) => (
          <button
            key={cat}
            className={`${styles.pill} ${filterCat === cat ? styles.pillActive : ""}`}
            onClick={() => setFilterCat(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className={styles.allGrid}>
        {filtered.map((p) => {
          const key = `${p.category}-${p.name}`;
          const broken = brokenImages[key];
          return (
            <div
              key={key}
              className={styles.gridCard}
              onClick={() => setModalProduct({ ...p, key })}
              title="Click to enlarge"
            >
              <div className={styles.gridImageWrap}>
                {p.image && !broken ? (
                  <img
                    className={styles.image}
                    src={p.image}
                    alt={p.name}
                    loading="lazy"
                    onError={() => markBroken(key)}
                  />
                ) : (
                  <ImageFallback />
                )}
                <span className={styles.badge}>{p.category}</span>
                <div className={styles.tapHint}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                  </svg>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {modalProduct && (
        <ProductModal
          product={modalProduct}
          broken={brokenImages[modalProduct.key]}
          onImageError={() => markBroken(modalProduct.key)}
          onClose={() => setModalProduct(null)}
        />
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   Main Products component
══════════════════════════════════════════════════════════════ */
export default function Products() {
  const [apiProducts, setApiProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [brokenImages, setBrokenImages] = useState({});
  const [activeCategory, setActiveCategory] = useState("All");
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showAllPage, setShowAllPage] = useState(false);
  const [modalProduct, setModalProduct] = useState(null);
  const trackRef = useRef(null);
  const ref = useScrollReveal();

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
        const response = await fetch(`${baseUrl}/api/products`);
        const payload = await response.json();
        if (!response.ok || !payload.success || !Array.isArray(payload.data)) throw new Error();
        setApiProducts(payload.data);
      } catch {
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
      items.map((item) => ({ category, image: "", name: item.name, detail: item.detail }))
    );
  }, [apiProducts]);

  const categories = useMemo(() => ["All", ...new Set(catalog.map((p) => p.category))], [catalog]);

  const preview = useMemo(() => {
    const list = activeCategory === "All" ? catalog : catalog.filter((p) => p.category === activeCategory);
    return list.slice(0, INITIAL_LIMIT);
  }, [catalog, activeCategory]);

  const totalFiltered = useMemo(() => {
    return activeCategory === "All" ? catalog.length : catalog.filter((p) => p.category === activeCategory).length;
  }, [catalog, activeCategory]);

  const markImageBroken = (key) => setBrokenImages((prev) => ({ ...prev, [key]: true }));

  const handleScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setScrollProgress(max > 0 ? el.scrollLeft / max : 0);
  }, []);

  const scroll = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 340, behavior: "smooth" });
  };

  const handleScrubClick = (e) => {
    const el = trackRef.current;
    if (!el) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    el.scrollLeft = ratio * (el.scrollWidth - el.clientWidth);
  };

  /* ── Render all-products page ── */
  if (showAllPage) {
    return (
      <section className={styles.products} id="products">
        <AllProductsPage
          catalog={catalog}
          categories={categories}
          onBack={() => setShowAllPage(false)}
        />
      </section>
    );
  }

  return (
    <section className={styles.products} id="products" ref={ref}>
      {/* Hero header */}
      <div className={styles.heroHeader}>
        <span className={styles.eyebrow}>Product Catalogue</span>
        <h2 className={styles.heroTitle}>
          The Finest Way To Experience<br />
          <em>Advanced Equipment</em>
        </h2>
      </div>

      {/* Category filter pills */}
      <div className={styles.filterRow}>
        {categories.map((cat) => (
          <button
            key={cat}
            className={`${styles.pill} ${activeCategory === cat ? styles.pillActive : ""}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading && <p className={styles.loading}>Loading products…</p>}

      {/* Carousel */}
      <div className={styles.carouselOuter}>
        <div className={styles.carouselTrack} ref={trackRef} onScroll={handleScroll}>
          {preview.map((p, i) => {
            const key = `${p.category}-${p.name}`;
            const broken = brokenImages[key];
            const isFeatured = i % 5 === 2;
            return (
              <div
                key={key}
                className={`${styles.card} ${isFeatured ? styles.cardFeatured : ""}`}
                onClick={() => setModalProduct({ ...p, key })}
                title="Click to enlarge"
              >
                <div className={styles.imageWrap}>
                  {p.image && !broken ? (
                    <img
                      className={styles.image}
                      src={p.image}
                      alt={p.name}
                      loading="lazy"
                      onError={() => markImageBroken(key)}
                    />
                  ) : (
                    <ImageFallback />
                  )}
                  <span className={styles.badge}>{p.category}</span>
                  <div className={styles.tapHint}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Arrow + scrubber controls */}
      <div className={styles.controls}>
        <button className={styles.arrowBtn} onClick={() => scroll(-1)} aria-label="Previous">←</button>
        <div className={styles.scrubber} onClick={handleScrubClick}>
          <div className={styles.scrubberThumb} style={{ left: `${scrollProgress * 100}%` }} />
        </div>
        <button className={styles.arrowBtn} onClick={() => scroll(1)} aria-label="Next">→</button>
      </div>

      {/* View All Products button */}
      {totalFiltered > INITIAL_LIMIT && (
        <div className={styles.viewAllWrap}>
          <button className={styles.viewAllBtn} onClick={() => setShowAllPage(true)}>
            View All Products ({totalFiltered})
          </button>
        </div>
      )}

      {/* Modal lightbox */}
      {modalProduct && (
        <ProductModal
          product={modalProduct}
          broken={brokenImages[modalProduct.key]}
          onImageError={() => markImageBroken(modalProduct.key)}
          onClose={() => setModalProduct(null)}
        />
      )}
    </section>
  );
}