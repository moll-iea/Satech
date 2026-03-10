import React from "react";
import { LOCATIONS } from "../data/siteData";
import { useScrollReveal } from "../hooks/useScrollReveal";
import styles from "./Global.module.css";

export default function Global() {
  const ref = useScrollReveal();

  return (
    <section className={styles.global} id="global" ref={ref}>
      <div className={styles.left}>
        <div className="section-tag">// Our Reach</div>
        <h2 className="section-title">Global<br />Presence</h2>
        <div className="divider" />
        <p className={styles.desc}>
          SA TECH has provided technical support across multiple continents —
          from Southeast Asia and the Americas to Europe and the Middle East.
        </p>
        <div className={styles.locGrid}>
          {LOCATIONS.map((loc) => (
            <div className={`${styles.locItem} reveal`} key={loc}>
              <span className={styles.dot} />
              <span className={styles.locName}>{loc}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.mapBox}>
          <div className={styles.mapGrid} />
          <div className={styles.mapContent}>
            <span className={styles.globeEmoji}>🌏</span>
            <p className={styles.mapText}>WORLDWIDE<br />TECHNICAL SUPPORT</p>
          </div>
        </div>
      </div>
    </section>
  );
}
