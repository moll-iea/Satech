import React from "react";
import { NEWS_ARTICLES } from "../data/siteData";
import { useScrollReveal } from "../hooks/useScrollReveal";
import styles from "./Global.module.css";

export default function Global() {
  const ref = useScrollReveal();

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
        <div className={styles.locGrid}>
          {NEWS_ARTICLES.map((item) => (
            <a
              key={`${item.title}-${item.date}`}
              href={item.link}
              className={`${styles.locItem} reveal`}
            >
              <span className={styles.dot} />
              <span className={styles.locName}>
                [{item.category}] {item.title} — {item.date}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
