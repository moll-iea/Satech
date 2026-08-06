import React, { useState, useEffect, useMemo, useRef } from "react";
import { newsService } from "../services/newsService";
import { exhibitionService } from "../services/exhibitionService";
import { videoService } from "../services/videoService";
import { useScrollReveal } from "../hooks/useScrollReveal";
import styles from "./Global.module.css";

export default function Global() {
  const ref = useScrollReveal();
  const [newsArticles, setNewsArticles] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [activeNewsIndex, setActiveNewsIndex] = useState(0);
  const newsViewportRef = useRef(null);
  const newsItemRefs = useRef([]);

  const [exhibitions, setExhibitions] = useState([]);
  const [exhibitionsLoading, setExhibitionsLoading] = useState(true);

  const [videos, setVideos] = useState([]);
  const [videosLoading, setVideosLoading] = useState(true);

  const loading = newsLoading || exhibitionsLoading || videosLoading;

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
        setNewsLoading(false);
      }
    };
    fetchNews();
  }, []);

  useEffect(() => {
    const fetchExhibitions = async () => {
      try {
        const res = await exhibitionService.getAll();
        // API returns { success, count, data }
        setExhibitions(res.data || []);
      } catch (error) {
        console.error("Failed to fetch exhibitions:", error);
      } finally {
        setExhibitionsLoading(false);
      }
    };
    fetchExhibitions();
  }, []);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await videoService.getVideos();
        if (response.success && Array.isArray(response.data)) {
          setVideos(response.data);
        } else {
          setVideos([]);
        }
      } catch (error) {
        console.error("Failed to fetch videos:", error);
        setVideos([]);
      } finally {
        setVideosLoading(false);
      }
    };
    fetchVideos();
  }, []);

  const filtered = useMemo(
    () =>
      activeCategory === "All"
        ? newsArticles
        : newsArticles.filter((a) => a.category === activeCategory),
    [activeCategory, newsArticles]
  );

  // Sidebar shows ALL news articles
  const sidebarItems = useMemo(() => filtered, [filtered]);

  // Grid shows exhibitions (2 columns x 3 rows), already sorted by row/order from the backend
  const gridItems = useMemo(
    () =>
      exhibitions
        .filter((item) => !((item.name || "").toLowerCase().includes("apex")))
        .slice(0, 6),
    [exhibitions]
  );
  const videoItems = useMemo(() => videos, [videos]);

  const ExhibitionPeakIcon = ({ className }) => (
    <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <path d="M12 48L28 20L38 34L46 26L52 48H12Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M20 48L30 30L40 48" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  const ExhibitionGearIcon = ({ className }) => (
    <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <circle cx="32" cy="32" r="10" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="32" cy="32" r="4" stroke="currentColor" strokeWidth="2.5" />
      <path d="M32 10V18M32 46V54M10 32H18M46 32H54M17 17L22 22M42 42L47 47M47 17L42 22M22 42L17 47" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );

  const ExhibitionCircuitIcon = ({ className }) => (
    <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <path d="M16 20H28V32H38V44H48" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 44H24V36H34V24H48" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="16" cy="20" r="4" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="28" cy="32" r="4" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="38" cy="44" r="4" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="48" cy="44" r="4" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="24" cy="44" r="4" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="34" cy="24" r="4" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="48" cy="24" r="4" stroke="currentColor" strokeWidth="2.5" />
    </svg>
  );

  const ExhibitionGlobalIcon = ({ className }) => (
    <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <circle cx="32" cy="32" r="18" stroke="currentColor" strokeWidth="2.5" />
      <path d="M14 32H50M32 14C26 20 26 44 32 50C38 44 38 20 32 14Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 22C24 25 28 27 32 27C36 27 40 25 44 22M20 42C24 39 28 37 32 37C36 37 40 39 44 42" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  const ExhibitionSparkIcon = ({ className }) => (
    <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <path d="M32 10L37.5 24.5L52 30L37.5 35.5L32 50L26.5 35.5L12 30L26.5 24.5L32 10Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M48 12L49.5 16.5L54 18L49.5 19.5L48 24L46.5 19.5L42 18L46.5 16.5L48 12Z" stroke="currentColor" strokeWidth="2.25" strokeLinejoin="round" />
    </svg>
  );

  const ExhibitionHexIcon = ({ className }) => (
    <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <path d="M22 14L42 14L54 32L42 50H22L10 32L22 14Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M22 24L32 18L42 24V40L32 46L22 40V24Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
    </svg>
  );

  const getExhibitionFallbackIcon = (name, index) => {
    const normalized = (name || "").toLowerCase();

    const iconRules = [
      { match: ["apex", "peak", "summit"], icon: ExhibitionPeakIcon },
      { match: ["metal", "steel", "alloy"], icon: ExhibitionGearIcon },
      { match: ["pcb", "board", "circuit"], icon: ExhibitionCircuitIcon },
      { match: ["tech", "digital", "smart"], icon: ExhibitionSparkIcon },
      { match: ["global", "world", "expo"], icon: ExhibitionGlobalIcon },
      { match: ["lab", "research", "innovation"], icon: ExhibitionHexIcon },
    ];

    const matchedRule = iconRules.find(({ match }) =>
      match.some((keyword) => normalized.includes(keyword))
    );

    if (matchedRule) {
      return matchedRule.icon;
    }

    const fallbackIcons = [ExhibitionPeakIcon, ExhibitionGearIcon, ExhibitionCircuitIcon, ExhibitionSparkIcon, ExhibitionGlobalIcon, ExhibitionHexIcon];
    return fallbackIcons[index % fallbackIcons.length];
  };

  useEffect(() => {
    if (sidebarItems.length === 0) {
      setActiveNewsIndex(0);
      return;
    }

    setActiveNewsIndex((currentIndex) => Math.min(currentIndex, sidebarItems.length - 1));
  }, [sidebarItems]);

  const scrollToNewsIndex = (nextIndex) => {
    if (sidebarItems.length === 0) {
      return;
    }

    const clampedIndex = Math.max(0, Math.min(nextIndex, sidebarItems.length - 1));
    setActiveNewsIndex(clampedIndex);
    newsItemRefs.current[clampedIndex]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  const handleNewsScroll = () => {
    if (!newsViewportRef.current || newsItemRefs.current.length === 0) {
      return;
    }

    const viewportRect = newsViewportRef.current.getBoundingClientRect();
    const viewportCenter = viewportRect.top + viewportRect.height / 2;

    let closestIndex = 0;
    let smallestDistance = Number.POSITIVE_INFINITY;

    newsItemRefs.current.forEach((item, index) => {
      if (!item) {
        return;
      }

      const rect = item.getBoundingClientRect();
      const itemCenter = rect.top + rect.height / 2;
      const distance = Math.abs(itemCenter - viewportCenter);

      if (distance < smallestDistance) {
        smallestDistance = distance;
        closestIndex = index;
      }
    });

    setActiveNewsIndex((currentIndex) => (currentIndex === closestIndex ? currentIndex : closestIndex));
  };

  return (
    <section className={styles.global} id="news" ref={ref}>
      {/* Header */}
      <div className={styles.header}>
        <div className="section-tag">News & Exhibitions</div>
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
              <div className={styles.newsRailHeader}>
                <button
                  type="button"
                  className={styles.newsArrow}
                  onClick={() => scrollToNewsIndex(activeNewsIndex - 1)}
                  disabled={activeNewsIndex === 0}
                  aria-label="Previous news item"
                >
                  <span aria-hidden="true">▲</span>
                </button>
                <p className={styles.sidebarLabel}>Recommended For You</p>
              </div>

              <div className={styles.newsViewport} ref={newsViewportRef} onScroll={handleNewsScroll}>
                <ul className={styles.sidebarList}>
                  {sidebarItems.map((item, index) => (
                    <li key={item._id} className={styles.sidebarListItem}>
                      <a
                        ref={(node) => {
                          newsItemRefs.current[index] = node;
                        }}
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.sidebarItem}
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
                        </div>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div className={styles.newsRailFooter}>
                <button
                  type="button"
                  className={styles.newsArrow}
                  onClick={() => scrollToNewsIndex(activeNewsIndex + 1)}
                  disabled={activeNewsIndex >= sidebarItems.length - 1}
                  aria-label="Next news item"
                >
                  <span aria-hidden="true">▼</span>
                </button>
              </div>
            </aside>

            <div className={styles.mainStack}>
              {/* Card grid — Exhibitions */}
              <div className={styles.cardGrid}>
                {gridItems.map((item, index) => (
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
                          alt={item.name}
                          className={styles.cardImage}
                          loading="lazy"
                        />
                      ) : (
                        <div className={styles.cardImageFallback}>
                          {(() => {
                            const Icon = getExhibitionFallbackIcon(item.name, index);
                            return <Icon className={styles.fallbackIcon} />;
                          })()}
                        </div>
                      )}
                    </div>

                    <div className={styles.cardBody}>
                      <h3 className={styles.cardTitle}>{item.name}</h3>
                    </div>
                  </a>
                ))}

                {gridItems.length === 0 && (
                  <div className={styles.empty}>No exhibitions yet.</div>
                )}
              </div>

              <div className={styles.videosBlock}>
                <div className={styles.videosHeader}>
                  <p className={styles.videosLabel}>Reels</p>
                  <span className={styles.videosHint}>Latest clips from SATECH</span>
                </div>

                {videosLoading ? (
                  <div className={styles.videosLoading}>Loading videos...</div>
                ) : videoItems.length > 0 ? (
                  <div className={styles.videoRow}>
                    {videoItems.map((video) => (
                      <a
                        key={video._id}
                        href={video.url}
                        className={styles.videoCard}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <div className={styles.videoThumb}>
                          {video.thumbnail ? (
                            <img src={video.thumbnail} alt={video.title} loading="lazy" />
                          ) : (
                            <div className={styles.videoThumbFallback}>
                              <span className={styles.videoPlay}>▶</span>
                            </div>
                          )}
                        </div>
                        <div className={styles.videoMeta}>
                          <h3 className={styles.videoTitle}>{video.title}</h3>
                          {video.description ? (
                            <p className={styles.videoDescription}>{video.description}</p>
                          ) : null}
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className={styles.videosLoading}>No videos yet.</div>
                )}
              </div>
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


        </>
      )}
    </section>
  );
}