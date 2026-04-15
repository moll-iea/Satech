import React, { useState, useEffect } from "react";
import { newsService } from "../services/newsService";
import { useScrollReveal } from "../hooks/useScrollReveal";
import styles from "./Global.module.css";

const CATEGORIES = ["All", "Announcements", "Events", "Industry", "Awards"];

export default function Global() {
  const ref = useScrollReveal();
  const [newsArticles, setNewsArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const data = await newsService.getAll();
        setNewsArticles(data);
      } catch (error) {
        console.error("Failed to fetch news:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  const filtered =
    activeCategory === "All"
      ? newsArticles
      : newsArticles.filter((a) => a.category === activeCategory);

  return (
    <section className={styles.global} id="news" ref={ref}>
      {/* Header */}
      <div className={styles.header}>
        <div className="section-tag">// News & Articles</div>
        <h2 className={styles.title}>Latest Updates</h2>
        <p className={styles.desc}>
          SATECH announcements, event highlights, and industry insights.
        </p>
      </div>

      {/* Filter tabs */}
      <div className={styles.filterRow}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`${styles.filterBtn} ${activeCategory === cat ? styles.filterActive : ""}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
        <span className={styles.filterCount}>
          {filtered.length} article{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Grid */}
      {loading ? (
        <div className={styles.loading}>Loading articles...</div>
      ) : (
        <div className={styles.cardGrid}>
          {filtered.map((item) => (
            <a
              key={item._id}
              href={item.link}
              className={`${styles.card} reveal`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className={styles.cardImageWrap}>
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className={styles.cardImage}
                  />
                ) : (
                  <div className={styles.cardImageFallback}>
                    <span className={styles.fallbackIcon}>📰</span>
                  </div>
                )}
                <span className={styles.categoryBadge}>{item.category}</span>
              </div>

              <div className={styles.cardBody}>
                <h3 className={styles.cardTitle}>{item.title}</h3>
                <div className={styles.cardMeta}>
                  <span className={styles.dot} />
                  <span className={styles.cardDate}>
                    {new Date(item.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </a>
          ))}

          {filtered.length === 0 && (
            <div className={styles.empty}>No articles in this category yet.</div>
          )}
        </div>
      )}
    </section>
  );
}