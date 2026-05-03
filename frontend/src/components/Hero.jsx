import React from "react";
import { HERO_STATS } from "../data/siteData";
import PCBBackground from "./PCBBackground";
import styles from "./Hero.module.css";

export default function Hero() {
  return (
    <section className={styles.hero} id="hero">
      {/* Animated PCB canvas — replaces static .bg and .grid divs */}
      <PCBBackground />

      {/* <div className={styles.tag}>
        📍 Muntinlupa City, Philippines · Est. 30+ Years
      </div> */}

      <h1 className={styles.title}>
        <span className={styles.fill}>SA</span>
        <span className={styles.stroke}>TECH</span>
      </h1>
      <p className={styles.sub}>The Solutions Provider</p>

      <p className={styles.tagline}>
        <span className={styles.colorA}>Sell</span> <span className={styles.circleText}>the problem you solve</span> <span className={styles.colorA}>,</span> <br />
        <span className={styles.colorA}>Not the product</span> <span className={styles.circleText}>you have</span>
      </p>

      <div className={styles.stats}>
        {HERO_STATS.map((s) => (
          <div className={styles.statItem} key={s.label}>
            <div className={styles.statNum}>{s.num}</div>
            <div className={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}