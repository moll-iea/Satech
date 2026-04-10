import React, { useState, useEffect } from "react";
import { newsService } from "../services/newsService";
import { useScrollReveal } from "../hooks/useScrollReveal";
import styles from "./Global.module.css";

export default function Global() {
  const ref = useScrollReveal();
  const [newsArticles, setNewsArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const data = await newsService.getAll();
        console.log('Fetched news data:', data);  // DEBUG
        console.log('Number of articles:', data.length);  // DEBUG
        setNewsArticles(data);
      } catch (error) {
        console.error('Failed to fetch news:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  return (
    <section className={styles.global} id="news" ref={ref}>
      <div className={styles.left}>
        <div className="section-tag">// News & Articles</div>
        <h2 className="section-title">Latest<br />Updates</h2>
        <div className="divider" />
        <p className={styles.desc}>
          Read the latest SA TECH announcements, event highlights, and industry insights.
        </p>
      </div>

      <div className={styles.right}>
        {loading ? (
          <div className={styles.loading}>Loading articles...</div>
        ) : (
          <div className={styles.locGrid}>
            {newsArticles.map((item) => (
              <a key={item._id} href={item.link} className={`${styles.locItem} reveal`}>
                {item.imageUrl && (
                  <img src={item.imageUrl} alt={item.title} className={styles.newsImage} />
                )}
                <div className={styles.locInfo}>
                  <span className={styles.dot} />
                  <span className={styles.locName}>
                    [{item.category}] {item.title} — {new Date(item.date).toLocaleDateString()}
                  </span>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
