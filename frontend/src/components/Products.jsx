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

const TRANSITION = 900; // ms — must match CSS --trans

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
function ProductModal({ product, onClose }) {

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
        <div className={styles.modalBody}>
          <span className={styles.modalBadge}>{product.category}</span>
          <h3 className={styles.modalName}>{product.name}</h3>
          <div className={styles.modalDetail}>
            {product.detail
              ?.split("\n")
              .filter((line) => line.trim())
              .map((line, idx) => (
                <div key={idx}>{line.trim()}</div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── 3D Carousel Card ──
   Cards are pre-positioned on the cylinder via rotateY + translateZ.
   The DRUM (parent) rotates — this is the true 360° approach.
── */
function CarouselCard({ product, index, total, isActive, broken, onClick, onImageError }) {
  // Each card is placed at its fixed slot on the cylinder
  const anglePerCard = 360 / total;
  const cardAngle = index * anglePerCard;

  const cardStyle = {
    // Pre-place card on the cylinder face
    transform: `rotateY(${cardAngle}deg) translateZ(var(--drum-radius))`,
  };

  return (
    <div
      className={`${styles.card} ${isActive ? styles.cardActive : ""}`}
      style={cardStyle}
      onClick={isActive ? onClick : undefined}
      title={isActive ? "Click to enlarge" : undefined}
    >
      <div className={styles.cardInner}>
        {product.image && !broken ? (
          <img
            className={styles.cardImage}
            src={product.image}
            alt={product.name}
            loading="lazy"
            onError={onImageError}
          />
        ) : (
          <ImageFallback />
        )}
        <div className={styles.cardCaption}>
          <div className={styles.cardTag}>{product.category}</div>
          <div className={styles.cardTitle}>{product.name}</div>
        </div>
      </div>
    </div>
  );
}

/* ── All Products full page ── */
function AllProductsPage({ catalog, categories, searchQuery, onSearchChange, onBack }) {
  const [filterCat, setFilterCat] = useState("");
  const [modalProduct, setModalProduct] = useState(null);
  const [brokenImages, setBrokenImages] = useState({});
  const normalizedSearch = searchQuery.trim().toLowerCase();

  const filtered = useMemo(() => {
    const byCategory = !filterCat ? catalog : catalog.filter((p) => p.category === filterCat);
    if (!normalizedSearch) return byCategory;
    return byCategory.filter((p) => {
      const haystack = `${p.name} ${p.detail} ${p.category}`.toLowerCase();
      return haystack.includes(normalizedSearch);
    });
  }, [catalog, filterCat, normalizedSearch]);

  const markBroken = (key) => setBrokenImages((prev) => ({ ...prev, [key]: true }));

  return (
    <div className={styles.allProductsPage}>
      <div className={styles.allPageHeader}>
        <button className={styles.backBtn} onClick={onBack}>← Back</button>
        <div className={styles.allPageTitleBlock}>
          <span className={styles.eyebrow}>Full Catalogue</span>
          <h2 className={styles.heroTitle}>All <em>Products</em></h2>
        </div>
      </div>

      <div className={styles.searchRow}>
        <label className={styles.searchField}>
          <span className={styles.searchIcon} aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5" />
            </svg>
          </span>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search products, categories, or details"
            aria-label="Search products"
          />
          {searchQuery && (
            <button
              type="button"
              className={styles.searchClear}
              onClick={() => onSearchChange("")}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </label>
      </div>

      <p className={styles.resultCount}>{filtered.length} product{filtered.length === 1 ? "" : "s"} found</p>

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

      {modalProduct && (
        <ProductModal
          product={modalProduct}
          onClose={() => setModalProduct(null)}
        />
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   Main Products component — TRUE 360° Rotating Drum Carousel
   
   Architecture (matches the 3D Marvel Carousel pattern):
   
   <stage>                          ← perspective camera
     <drum style="rotateY(Ndeg)">  ← THE WHOLE CYLINDER ROTATES
       <card style="rotateY(0deg)  translateZ(R)">   slot 0
       <card style="rotateY(51deg) translateZ(R)">   slot 1
       ...                          ← cards are FIXED on the drum
     </drum>
   </stage>
   
   To advance: drumRotation -= anglePerCard  (CSS transition handles the spin)
══════════════════════════════════════════════════════════════ */
export default function Products() {
  const [apiProducts, setApiProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [brokenImages, setBrokenImages] = useState({});
  const [activeCategory, setActiveCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef(null);
  const [showAllPage, setShowAllPage] = useState(false);
  const [modalProduct, setModalProduct] = useState(null);

  // 360° drum state — drumAngle is the Y rotation applied to the whole drum
  const [current, setCurrent] = useState(0);
  const [drumAngle, setDrumAngle] = useState(0); // cumulative degrees (never wraps — allows smooth infinite spin)
  const [busy, setBusy] = useState(false);
  const timerRef = useRef(null);
  const touchXRef = useRef(0);
  const dragRef = useRef(null);   // for mouse drag support
  const ref = useScrollReveal();

  const INTERVAL = 3200;

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

  const categories = useMemo(() => [...new Set(catalog.map((p) => p.category))], [catalog]);

  const normalizedSearch = searchQuery.trim().toLowerCase();

  const filteredCatalog = useMemo(() => {
    const byCategory = !activeCategory ? catalog : catalog.filter((p) => p.category === activeCategory);
    if (!normalizedSearch) return byCategory;
    return byCategory.filter((p) => {
      const haystack = `${p.name} ${p.detail} ${p.category}`.toLowerCase();
      return haystack.includes(normalizedSearch);
    });
  }, [catalog, activeCategory, normalizedSearch]);

  const preview = useMemo(() => {
    return filteredCatalog.slice(0, 7);
  }, [filteredCatalog]);

  const N = preview.length;
  const anglePerCard = N > 0 ? 360 / N : 0;

  const totalFiltered = useMemo(() => {
    return filteredCatalog.length;
  }, [filteredCatalog]);

  const markImageBroken = (key) => setBrokenImages((prev) => ({ ...prev, [key]: true }));

  // Advance the drum — uses cumulative angle so it spins smoothly without wrapping
  const advance = useCallback((dir = 1) => {
    if (busy || N === 0) return;
    setBusy(true);
    setCurrent((prev) => (prev + dir + N) % N);
    setDrumAngle((prev) => prev - dir * anglePerCard);
    setTimeout(() => setBusy(false), TRANSITION);
  }, [busy, N, anglePerCard]);

  // Jump to a specific index (for pip clicks)
  const jumpTo = useCallback((idx) => {
    if (busy || N === 0 || idx === current) return;
    setBusy(true);
    // Find shortest arc
    let delta = idx - current;
    if (delta > N / 2) delta -= N;
    if (delta < -N / 2) delta += N;
    setCurrent(idx);
    setDrumAngle((prev) => prev - delta * anglePerCard);
    setTimeout(() => setBusy(false), TRANSITION);
  }, [busy, N, current, anglePerCard]);

  // Auto-play
  const startTimer = useCallback(() => {
    if (timerRef.current) return;
    timerRef.current = setInterval(() => advance(1), INTERVAL);
  }, [advance]);

  const stopTimer = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = null;
  }, []);

  // Reset carousel when category changes
  useEffect(() => {
    setCurrent(0);
    setDrumAngle(0);
  }, [activeCategory]);

  useEffect(() => {
    setCurrent(0);
    setDrumAngle(0);
  }, [searchQuery]);

  // Start auto-play
  useEffect(() => {
    startTimer();
    return () => stopTimer();
  }, [startTimer, stopTimer]);

  // Touch swipe
  const handleTouchStart = (e) => {
    touchXRef.current = e.touches[0].clientX;
    stopTimer();
  };

  const handleTouchEnd = (e) => {
    const dx = e.changedTouches[e.changedTouches.length - 1].clientX - touchXRef.current;
    if (Math.abs(dx) > 48) {
      advance(dx < 0 ? 1 : -1);
    }
    startTimer();
  };

  // Mouse drag support
  const handleMouseDown = (e) => {
    dragRef.current = e.clientX;
    stopTimer();
  };

  const handleMouseUp = (e) => {
    if (dragRef.current !== null) {
      const dx = e.clientX - dragRef.current;
      if (Math.abs(dx) > 48) advance(dx < 0 ? 1 : -1);
      dragRef.current = null;
    }
    startTimer();
  };

  // Interactive mouse-tracking spotlight
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    e.currentTarget.style.setProperty("--mx", `${x}%`);
    e.currentTarget.style.setProperty("--my", `${y}%`);
  };

  /* ── Render all-products page ── */
  if (showAllPage) {
    return (
      <section className={styles.products} id="products">
        <AllProductsPage
          catalog={catalog}
          categories={categories}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onBack={() => setShowAllPage(false)}
        />
      </section>
    );
  }

  // The drum CSS transform — rotates the entire cylinder
  const drumStyle = {
    transform: `rotateX(-16deg) rotateY(${drumAngle}deg)`,
  };

  return (
    <section className={styles.products} id="products" ref={ref} onMouseMove={handleMouseMove}>
      {/* Atmospheric background orbs */}
      <div className={`${styles.bgOrb} ${styles.orb1}`} />
      <div className={`${styles.bgOrb} ${styles.orb2}`} />
      <div className={`${styles.bgOrb} ${styles.orb3}`} />
      <div className={styles.noise} />
      {/* Interactive grid lines */}
      <div className={styles.gridLines} aria-hidden="true" />
      {/* Mouse-follow spotlight */}
      <div className={styles.spotlight} aria-hidden="true" />
      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <div key={i} className={`${styles.particle} ${styles['p' + (i + 1)]}`} aria-hidden="true" />
      ))}

      {/* Hero header */}
      <div className={styles.heroHeader}>
        {/* <span className={styles.eyebrow}>Product Catalogue</span> */}
        <h2 className={styles.heroTitle}>
          The Finest Way To Experience<br />
          <em>Advanced Solutions</em>
        </h2>
      </div>

      {/* Row 1 — Filter pills */}
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

      {/* Row 2 — Search icon on the right, expands left */}
      <div className={styles.searchRow}>
        <div className={`${styles.searchWrapper} ${searchOpen ? styles.searchWrapperOpen : ""}`}>
          <div className={styles.searchExpandable}>
            <input
              ref={searchInputRef}
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products…"
              aria-label="Search products"
              onBlur={() => { if (!searchQuery) setSearchOpen(false); }}
            />
            {searchQuery && (
              <button
                type="button"
                className={styles.searchClear}
                onClick={() => { setSearchQuery(""); setSearchOpen(false); }}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          <button
            className={styles.searchIconBtn}
            aria-label="Open search"
            onClick={() => {
              setSearchOpen(true);
              setTimeout(() => searchInputRef.current?.focus(), 50);
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5" />
            </svg>
          </button>
        </div>
      </div>

      {loading && <p className={styles.loading}>Loading products…</p>}

      {/* 3D Carousel Stage */}
      {!loading && preview.length > 0 && (
        <>
          {/* Stage: perspective camera */}
          <div className={styles.stage}>
            {/* Drum: the cylinder that rotates */}
            <div
              className={styles.drum}
              style={drumStyle}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
            >
              {preview.map((p, i) => {
                const key = `${p.category}-${p.name}`;
                const isActive = i === current;
                return (
                  <CarouselCard
                    key={key}
                    product={p}
                    index={i}
                    total={N}
                    isActive={isActive}
                    broken={brokenImages[key]}
                    onClick={() => setModalProduct({ ...p, key })}
                    onImageError={() => markImageBroken(key)}
                  />
                );
              })}
            </div>
          </div>

          {/* Arrow controls */}
          <div className={styles.controls}>
            <button
              className={styles.arrowBtn}
              onClick={() => { stopTimer(); advance(-1); startTimer(); }}
              aria-label="Previous"
            >‹</button>
            <div className={styles.progressRing}>
              {preview.map((_, i) => (
                <span
                  key={i}
                  className={`${styles.pip} ${i === current ? styles.pipActive : ""}`}
                  onClick={() => { stopTimer(); jumpTo(i); startTimer(); }}
                />
              ))}
            </div>
            <button
              className={styles.arrowBtn}
              onClick={() => { stopTimer(); advance(1); startTimer(); }}
              aria-label="Next"
            >›</button>
          </div>
        </>
      )}

      {!loading && filteredCatalog.length === 0 && (
        <p className={styles.emptyState}>No products match your search.</p>
      )}

      {/* Modal lightbox */}
      {modalProduct && (
        <ProductModal
          product={modalProduct}
          onClose={() => setModalProduct(null)}
        />
      )}
    </section>
  );
}