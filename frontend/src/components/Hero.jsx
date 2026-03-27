import React from "react";
import { HERO_STATS } from "../data/siteData";
import PCBBackground from "./PCBBackground";
import styles from "./Hero.module.css";

export default function Hero() {
  return (
    <section className={styles.hero} id="hero">
      {/* Animated PCB canvas — replaces static .bg and .grid divs */}
      <PCBBackground />

      <div className={styles.tag}>
        📍 Muntinlupa City, Philippines · Est. 30+ Years
      </div>

      <h1 className={styles.title}>
        {/* SATECH<br /> */}
        <span className={styles.stroke}>SATECH</span>
      </h1>

      <p className={styles.sub}>The Solutions Provider</p>

      <p className={styles.desc}>
        Providing the manufacturing industry with technologically advanced
        systems, globally competitive products, quality support, and reliable
        business integrity for over 30 years.
      </p>

      <div className={styles.btns}>
        <a href="#products" className="btn-primary">Explore Products</a>
        <a href="#contact"  className="btn-outline">Get In Touch</a>
      </div>

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
