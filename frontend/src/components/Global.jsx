import React, { useState, useEffect, useMemo } from "react";
import { newsService } from "../services/newsService";
import { useScrollReveal } from "../hooks/useScrollReveal";
import styles from "./Global.module.css";

export default function Global() {
  const ref = useScrollReveal();
  const [newsArticles, setNewsArticles] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [hoveredId, setHoveredId] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const data = await newsService.getAll();
        setNewsArticles(data);
        
        // Extract unique categories from news articles
        const uniqueCategories = ["All", ...new Set(data.map(article => article.category).filter(Boolean))];
        setCategories(uniqueCategories);
      } catch (error) {
        console.error("Failed to fetch news:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  const filtered = useMemo(
    () =>
      activeCategory === "All"
        ? newsArticles
        : newsArticles.filter((a) => a.category === activeCategory),
    [activeCategory, newsArticles]
  );

  // Sidebar shows ALL articles
  const sidebarItems = useMemo(() => filtered, [filtered]);

  // Grid shows only 8 articles
  const gridItems = useMemo(() => filtered.slice(0, 9), [filtered]);

  return (
    <section className={styles.global} id="news" ref={ref}>
      {/* Header */}
      <div className={styles.header}>
        <div className="section-tag">News & Articles</div>
        <h2 className={styles.title}>Latest Updates</h2>
        <p className={styles.desc}>
          SATECH announcements, event highlights, and industry insights.
        </p>
      </div>

      {/* Filter tabs */}
      <div className={styles.filterRow}>
        {/* {categories.map((cat) => (
          <button
            key={cat}
            className={`${styles.filterBtn} ${activeCategory === cat ? styles.filterActive : ""}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))} */}
        {/* <span className={styles.filterCount}>
          {filtered.length} news item{filtered.length !== 1 ? "s" : ""}
        </span> */}
      </div>

      {/* Main layout: sidebar + card grid */}
      {loading ? (
        <div className={styles.loading}>Loading news...</div>
      ) : (
        <>
          <div className={styles.contentLayout}>
            {/* Sidebar */}
            <aside className={styles.sidebar}>
              <p className={styles.sidebarLabel}>Recommended For You</p>
              <ul className={styles.sidebarList}>
                {sidebarItems.map((item) => (
                  <li
                    key={item._id}
                    className={`${styles.sidebarItem} ${hoveredId === item._id ? styles.sidebarItemActive : ""}`}
                    onMouseEnter={() => setHoveredId(item._id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() => setSelectedArticle(item)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className={styles.sidebarImage}>
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.title} />
                      ) : (
                        <div className={styles.sidebarImageFallback}>📰</div>
                      )}
                    </div>
                    <div>
                      <p className={styles.sidebarTitle}>{item.title}</p>
                      <div className={styles.sidebarMeta}>
                        {item.source && (
                          <span className={styles.sidebarMetaRow}>
                            <span className={styles.sidebarMetaLabel}>Source</span>
                            <span className={styles.sidebarMetaValue}>{item.source}</span>
                          </span>
                        )}
                        <span className={styles.sidebarMetaRow}>
                          <span className={styles.sidebarMetaLabel}>Date</span>
                          <span className={styles.sidebarMetaValue}>
                            {item.date ? new Date(item.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }) : "—"}
                          </span>
                        </span>
                        {item.author && (
                          <span className={styles.sidebarMetaRow}>
                            <span className={styles.sidebarMetaLabel}>Author</span>
                            <span className={styles.sidebarMetaValue}>{item.author}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </aside>

            {/* Card grid */}
            <div className={styles.cardGrid}>
              {gridItems.map((item) => (
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
                        {item.author && ` • ${item.author}`}
                      </span>
                    </div>
                  </div>
                </a>
              ))}

              {gridItems.length === 0 && (
                <div className={styles.empty}>No news in this category yet.</div>
              )}
            </div>
          </div>

          {/* See All button */}
          {/* {filtered.length > 8 && (
            <button
              className={styles.seeAllBtn}
              onClick={() => setShowModal(true)}
            >
              See All News and Articles
            </button>
          )} */}

          {/* Modal */}
          {showModal && (
            <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
              <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                  <h2 className={styles.modalTitle}>All News & Articles</h2>
                  <button
                    className={styles.closeBtn}
                    onClick={() => setShowModal(false)}
                    aria-label="Close modal"
                  >
                    ✕
                  </button>
                </div>
                <div className={styles.modalGrid}>
                  {filtered.map((item) => (
                    <a
                      key={item._id}
                      href={item.link}
                      className={`${styles.modalCard} reveal`}
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
                </div>
              </div>
            </div>
          )}

          {/* Article Details Modal */}
          {selectedArticle && (
            <div className={styles.modalOverlay} onClick={() => setSelectedArticle(null)}>
              <div className={styles.detailsModal} onClick={(e) => e.stopPropagation()}>
                <button
                  className={styles.closeBtn}
                  onClick={() => setSelectedArticle(null)}
                  aria-label="Close modal"
                  style={{ position: "absolute", top: "20px", right: "20px", zIndex: 10 }}
                >
                  ✕
                </button>

                {/* Article image */}
                <div className={styles.detailsImageWrap}>
                  {selectedArticle.imageUrl ? (
                    <img
                      src={selectedArticle.imageUrl}
                      alt={selectedArticle.title}
                      className={styles.detailsImage}
                    />
                  ) : (
                    <div className={styles.detailsImageFallback}>
                      <span className={styles.fallbackIcon}>📰</span>
                    </div>
                  )}
                  <span className={styles.categoryBadge}>{selectedArticle.category}</span>
                </div>

                {/* Article content */}
                <div className={styles.detailsContent}>
                  <h2 className={styles.detailsTitle}>{selectedArticle.title}</h2>

                  {/* Metadata */}
                  <div className={styles.detailsMeta}>
                    {selectedArticle.source && (
                      <div className={styles.detailsMetaItem}>
                        <span className={styles.detailsMetaLabel}>Source</span>
                        <span className={styles.detailsMetaValue}>{selectedArticle.source}</span>
                      </div>
                    )}
                    {selectedArticle.date && (
                      <div className={styles.detailsMetaItem}>
                        <span className={styles.detailsMetaLabel}>Date</span>
                        <span className={styles.detailsMetaValue}>
                          {new Date(selectedArticle.date).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    )}
                    {selectedArticle.author && (
                      <div className={styles.detailsMetaItem}>
                        <span className={styles.detailsMetaLabel}>Author</span>
                        <span className={styles.detailsMetaValue}>{selectedArticle.author}</span>
                      </div>
                    )}
                  </div>

                  {/* Description/Body */}
                  {selectedArticle.summary && (
                    <div className={styles.detailsBody}>
                      <p>{selectedArticle.summary}</p>
                    </div>
                  )}

                  {/* Link button */}
                  {selectedArticle.link && (
                    <a
                      href={selectedArticle.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.detailsLink}
                    >
                      Read Full Article →
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}