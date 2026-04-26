import React, { useEffect, useRef, useState, useCallback } from "react";
import { videoService } from "../services/videoService";
import { useScrollReveal } from "../hooks/useScrollReveal";
import styles from "./Videos.module.css";

const INITIAL_LIMIT = 10;

function VideosModal({ video, onClose }) {
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
  const getYouTubeEmbedUrl = (url) => {
    if (!url) return "";
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : null;
  };

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <button className={styles.modalClose} onClick={onClose} aria-label="Close">
          ✕
        </button>
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

  const preview = videos.slice(0, INITIAL_LIMIT);

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
        <h2 className={styles.heroTitle}>Our <em>Videos</em></h2>
      </div>

      <div className={styles.carouselContainer}>
        <button className={styles.arrowBtn} onClick={() => scroll("left")} aria-label="Scroll left">
          ←
        </button>

        <div className={styles.track} ref={trackRef} onScroll={handleScroll}>
          {preview.map((video) => (
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
              </div>
            </div>
          ))}
        </div>

        <button className={styles.arrowBtn} onClick={() => scroll("right")} aria-label="Scroll right">
          →
        </button>
      </div>

      <div className={styles.progressBar}>
        <div className={styles.progress} style={{ width: `${scrollProgress * 100}%` }} />
      </div>

      {modalVideo && <VideosModal video={modalVideo} onClose={() => setModalVideo(null)} />}
    </section>
  );
}