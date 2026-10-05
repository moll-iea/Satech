import React, { useEffect, useRef, useState, useCallback } from "react";
import { videoService } from "../services/videoService";
import { useScrollReveal } from "../hooks/useScrollReveal";
import styles from "./Videos.module.css";

const INITIAL_LIMIT = 10;
const ITEMS_PER_PAGE = 6;

function ArrowIcon({ direction = "down" }) {
  // Filled arrow pointing right; rotate for up/down
  const rotation = direction === "up" ? -90 : direction === "down" ? 90 : 0;
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <g transform={`rotate(${rotation} 12 12)`}>
        <path
          d="M7 11h7.586L11.293 6.707 12.707 5.293 19.414 12l-6.707 6.707-1.414-1.414L14.586 13H7z"
          fill="currentColor"
        />
      </g>
    </svg>
  );
}

export function VideosModal({ video, onClose }) {
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const isYouTubeUrl = (url) => url?.includes("youtube.com") || url?.includes("youtu.be");
  const getYouTubeVideoId = (url) => {
    if (!url) return "";
    return url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([^&\n?#]+)/)?.[1] || "";
  };

  const getYouTubeEmbedUrl = (url) => {
    const videoId = getYouTubeVideoId(url);
    return videoId
      ? `https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&playlist=${videoId}`
      : null;
  };

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <button className={styles.modalClose} onClick={onClose} aria-label="Close video">
            ✕
          </button>
        </div>
        <div className={styles.modalVideoWrap}>
          {isYouTubeUrl(video.url) ? (
            <iframe
              className={styles.modalIframe}
              src={getYouTubeEmbedUrl(video.url)}
              title={video.title}
              allowFullScreen
              allow="autoplay"
            />
          ) : (
            <a href={video.url} target="_blank" rel="noopener noreferrer" className={styles.externalVideoLink}>
              Open Video ↗
            </a>
          )}
        </div>
        <div className={styles.modalBody}>
          <h3 className={styles.modalTitle}>{video.title}</h3>
          <p className={styles.modalDescription}>{video.description}</p>
          {isYouTubeUrl(video.url) && (
            <a
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.openInYouTube}
            >
              Open in YouTube
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Videos() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [modalVideo, setModalVideo] = useState(null);
  const trackRef = useRef(null);
  const ref = useScrollReveal();

  useEffect(() => {
    const loadVideos = async () => {
      try {
        setLoading(true);
        const response = await videoService.getVideos();
        if (response.success && Array.isArray(response.data)) {
          setVideos(response.data);
        }
      } catch (error) {
        console.error("Error loading videos:", error);
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };
    loadVideos();
  }, []);

  const [page, setPage] = useState(0);
  const itemsPerPage = ITEMS_PER_PAGE;
  const totalPages = Math.max(1, Math.ceil(videos.length / itemsPerPage));
  const pageItems = videos.slice(page * itemsPerPage, page * itemsPerPage + itemsPerPage);

  const handleScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setScrollProgress(max > 0 ? el.scrollLeft / max : 0);
  }, []);

  const scroll = (direction) => {
    const el = trackRef.current;
    if (!el) return;
    const amount = 320;
    el.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  if (loading) {
    return (
      <section className={styles.videos} ref={ref}>
        <div className={styles.heroHeader}>
          <h2 className={styles.heroTitle}>Loading <em>Videos</em></h2>
        </div>
      </section>
    );
  }

  if (videos.length === 0) {
    return null;
  }

  return (
    <section className={styles.videos} ref={ref}>
      <div className={styles.heroHeader}>
        <h2 className={styles.heroTitle}>Solutions <em> in Action</em></h2>
      </div>

      <div className={styles.carouselContainer}>
        <button className={styles.arrowBtn} onClick={() => scroll("left")} aria-label="Scroll left">
          <ArrowIcon direction="up" />
        </button>

        <div className={styles.track} ref={trackRef} onScroll={handleScroll}>
          {pageItems.map((video) => (
            <div
              key={video._id}
              className={styles.card}
              onClick={() => setModalVideo(video)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && setModalVideo(video)}
            >
              <div className={styles.videoThumb}>
                {video.thumbnail ? (
                  <img src={video.thumbnail} alt={video.title} loading="lazy" />
                ) : (
                  <div className={styles.videoPlaceholder}>
                    <span>▶</span>
                  </div>
                )}
              </div>
              <div className={styles.cardBody}>
                <h3 className={styles.cardTitle}>{video.title}</h3>
                <p className={styles.cardDescription}>{video.description}</p>
              </div>
            </div>
          ))}
        </div>

        <button className={styles.arrowBtn} onClick={() => scroll("right")} aria-label="Scroll right">
          <ArrowIcon direction="down" />
        </button>
      </div>

      <div className={styles.pageNavWrap}>
        <button
          className={styles.pageBtn}
          onClick={() => {
            setPage((p) => Math.max(0, p - 1));
            if (trackRef.current) trackRef.current.scrollLeft = 0;
            setScrollProgress(0);
          }}
          disabled={page <= 0}
          aria-label="Previous page"
        >
          <ArrowIcon direction="up" />
        </button>

        <div className={styles.pageIndicator}>{`${page + 1}/${totalPages}`}</div>

        <button
          className={styles.pageBtn}
          onClick={() => {
            setPage((p) => Math.min(totalPages - 1, p + 1));
            if (trackRef.current) trackRef.current.scrollLeft = 0;
            setScrollProgress(0);
          }}
          disabled={page >= totalPages - 1}
          aria-label="Next page"
        >
          <ArrowIcon direction="down" />
        </button>
      </div>

      <div className={styles.progressBar}>
        <div className={styles.progress} style={{ width: `${scrollProgress * 100}%` }} />
      </div>

      {modalVideo && <VideosModal video={modalVideo} onClose={() => setModalVideo(null)} />}
    </section>
  );
}