import React, { useRef, useState, useEffect } from "react";
import { useScrollReveal } from "../hooks/useScrollReveal";
import { serviceService } from "../services/serviceService";
import styles from "./Services.module.css";

export default function Services() {
  const ref = useScrollReveal();
  const trackRef = useRef(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);
  const [activeCategory, setActiveCategory] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch services from API
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await serviceService.getAll();
        setServices(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching services:', error);
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  // Derive unique categories from fetched services data
  const categories = ["All", ...Array.from(new Set(services.map((s) => s.category)))];

  const filteredServices =
    activeCategory && activeCategory !== "All"
      ? services.filter((s) => s.category === activeCategory)
      : services;

  const scroll = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    const amount = el.offsetWidth * 0.75;
    el.scrollBy({ left: dir === "next" ? amount : -amount, behavior: "smooth" });
  };

  const onScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 10);
    setCanNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  return (
    <section className={styles.services} id="services" ref={ref}>

      {/* ── Top intro ── */}
<div className={styles.intro}>
  <div className={styles.label}>What We Offer</div>
  <h2 className={styles.heading}>Our Solutions</h2>
</div>
      {/* ── Category Tab Bar ── */}
      <div className={styles.tabBar}>
        {categories.map((cat) => (
          <button
            key={cat}
            className={`${styles.tabItem} ${
              (activeCategory === cat || (!activeCategory && cat === "All"))
                ? styles.tabItemActive
                : ""
            }`}
            onClick={() => {
              setActiveCategory(cat === "All" ? null : cat);
              // Reset scroll on filter
              if (trackRef.current) {
                trackRef.current.scrollLeft = 0;
                setCanPrev(false);
                setCanNext(true);
              }
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ── Carousel ── */}
      <div className={styles.carouselWrap}>

        {/* Left: description + nav */}
        <div className={styles.sideCol}>
          <p className={styles.sideDesc}>
            From equipment supply and technical support to factory automation and
            legal services — SATECH delivers comprehensive solutions that
            drive value across your entire operation.
          </p>

          <div className={styles.navBtns}>
            <button
              className={`${styles.navBtn} ${!canPrev ? styles.navBtnDisabled : ""}`}
              onClick={() => scroll("prev")}
              aria-label="Previous"
            >
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 12H5M5 12L11 6M5 12L11 18"
                  stroke="currentColor" strokeWidth="1.5"
                  strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              className={`${styles.navBtn} ${!canNext ? styles.navBtnDisabled : ""}`}
              onClick={() => scroll("next")}
              aria-label="Next"
            >
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 12H19M19 12L13 6M19 12L13 18"
                  stroke="currentColor" strokeWidth="1.5"
                  strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable track */}
        <div className={styles.track} ref={trackRef} onScroll={onScroll}>
          {loading ? (
            <div className={styles.loadingMessage}>Loading services...</div>
          ) : filteredServices.length === 0 ? (
            <div className={styles.emptyMessage}>No services available</div>
          ) : (
            filteredServices.map((s) => (
              <div className={`${styles.card} reveal`} key={s._id}>
                {/* Service image */}
                {s.image && (
                  <img src={s.image} alt={s.title} className={styles.cardImage} />
                )}

                {/* Bottom text */}
                <div className={styles.body}>
                  <div className={styles.cat}>{s.category}</div>
                  <div className={styles.title}>{s.title}</div>
                  <div className={styles.desc}>{s.description}</div>
                </div>

                {/* Hover gold bottom bar */}
              </div>
            ))
          )}
        </div>
      </div>

    </section>
  );
}