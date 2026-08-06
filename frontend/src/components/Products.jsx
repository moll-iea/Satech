import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { PRODUCTS } from "../data/siteData";
import { useScrollReveal } from "../hooks/useScrollReveal";
import ProcessMenu from "./ProcessMenu";
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

/* ── 3D Carousel Card ──
   Cards are pre-positioned on the cylinder via rotateY + translateZ.
   The DRUM (parent) rotates — this is the true 360° approach.
── */
function CarouselCard({ product, index, total, isActive, broken, onImageError, onHoverStart, onHoverEnd }) {
  // Each card is placed at its fixed slot on the cylinder
  const anglePerCard = 360 / total;
  const cardAngle = index * anglePerCard;

  const cardStyle = {
    // Pre-place card on the cylinder face
    transform: `rotateY(${cardAngle}deg) translateZ(var(--drum-radius))`,
  };

  // Flatten the multi-line detail into a single, readable hover blurb
  const shortDesc = (product.detail || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={`${styles.card} ${isActive ? styles.cardActive : ""}`}
      style={cardStyle}
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
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
          <div className={styles.cardTitle}>{product.name}</div>
          {shortDesc && <div className={styles.cardDesc}>{shortDesc}</div>}
        </div>
      </div>
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

  // 360° drum state — drumAngle is the Y rotation applied to the whole drum
  const [current, setCurrent] = useState(0);
  const [drumAngle, setDrumAngle] = useState(0); // cumulative degrees (never wraps — allows smooth infinite spin)
  const [busy, setBusy] = useState(false);
  const timerRef = useRef(null);
  const touchXRef = useRef(0);
  const dragRef = useRef(null);   // for mouse drag support
  const cardHoverRef = useRef(false); // true while pointer is over any card
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

  const preview = useMemo(() => {
    return catalog.slice(0, 6);
  }, [catalog]);

  const N = preview.length;
  const anglePerCard = N > 0 ? 360 / N : 0;

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
    if (!cardHoverRef.current) startTimer();
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
    if (!cardHoverRef.current) startTimer();
  };

  // Hover a card → pause rotation. Leave it → resume (unless dragging/touching).
  const handleCardMouseEnter = useCallback(() => {
    cardHoverRef.current = true;
    stopTimer();
  }, [stopTimer]);

  const handleCardMouseLeave = useCallback(() => {
    cardHoverRef.current = false;
    startTimer();
  }, [startTimer]);

  // Interactive mouse-tracking spotlight
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    e.currentTarget.style.setProperty("--mx", `${x}%`);
    e.currentTarget.style.setProperty("--my", `${y}%`);
  };

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
          SELL THE PROBLEM YOU SOLVE, NOT<br />
          <em>THE PRODUCT YOU HAVE</em>
        </h2>
      </div>

      {loading && <p className={styles.loading}>Loading products…</p>}

      {/* Two-column body: left scroll menu + right carousel */}
      {!loading && preview.length > 0 && (
        <div className={styles.productsBody}>
          <ProcessMenu />

          <div className={styles.stageColumn}>
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
                      onImageError={() => markImageBroken(key)}
                      onHoverStart={handleCardMouseEnter}
                      onHoverEnd={handleCardMouseLeave}
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
          </div>
        </div>
      )}

      {!loading && catalog.length === 0 && (
        <p className={styles.emptyState}>No products available.</p>
      )}
    </section>
  );
}