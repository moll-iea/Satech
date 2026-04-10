import React, { useEffect, useState } from "react";
import styles from "./Clients.module.css";

function ExhibitionsTrack({ exhibitions, reverse = false }) {
  return (
    <div className={styles.marqueeWrap}>
      <div className={`${styles.track} ${reverse ? styles.reverse : ""}`}>
        {/* group 1 */}
        <div className={styles.group}>
          {exhibitions.map((e, i) => (
            <span className={styles.badge} key={`a-${i}`}>{e.name}</span>
          ))}
        </div>

        {/* group 2 (duplicate for seamless loop) */}
        <div className={styles.group} aria-hidden="true">
          {exhibitions.map((e, i) => (
            <span className={styles.badge} key={`b-${i}`}>{e.name}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Exhibitions() {
  const [row1, setRow1] = useState([]);
  const [row2, setRow2] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchExhibitions = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
        const response = await fetch(`${baseUrl}/api/exhibitions`);
        const data = await response.json();

        if (data.success && Array.isArray(data.data)) {
          const sortedExhibitions = data.data.sort((a, b) => {
            if (a.row !== b.row) return a.row - b.row;
            return a.order - b.order;
          });

          setRow1(sortedExhibitions.filter(e => e.row === 1));
          setRow2(sortedExhibitions.filter(e => e.row === 2));
        }
      } catch (error) {
        console.error("Failed to fetch exhibitions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExhibitions();
  }, []);

  return (
    <section className={styles.clients} id="exhibitions">
      <div className={styles.header}>
        <div className="section-tag">// Exhibitions</div>
        <h2 className="section-title">Featured In<br />Top Industry Events</h2>
        <div className="divider" />
        <p className={styles.sub}>
          From global semiconductor summits to specialized manufacturing expos — our
          presence spans the world's most respected exhibitions in technology and industry.
        </p>
      </div>

      {!isLoading && row1.length > 0 && <ExhibitionsTrack exhibitions={row1} />}
      {!isLoading && row2.length > 0 && <ExhibitionsTrack exhibitions={row2} reverse />}
    </section>
  );
}
