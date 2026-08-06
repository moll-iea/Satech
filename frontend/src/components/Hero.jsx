import React, { useEffect, useState } from "react";
import { HERO_STATS } from "../data/siteData";
import PCBBackground from "./PCBBackground";
import styles from "./Hero.module.css";

function parseStatNum(str) {
  const match = str.match(/^(\d+)(.*)$/);
  if (!match) return { target: 0, suffix: str };
  return { target: parseInt(match[1], 10), suffix: match[2] };
}

function useCountUp(target, duration = 1500, start = false) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!start) return;
    let raf;
    let startTime = null;

    const animate = (ts) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setValue(Math.floor(eased * target));
      if (progress < 1) raf = requestAnimationFrame(animate);
      else setValue(target);
    };

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [start, target, duration]);

  return value;
}

function StatItem({ num, label, delay = 0 }) {
  const { target, suffix } = parseStatNum(num);
  const [start, setStart] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setStart(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  const count = useCountUp(target, 1500, start);

  return (
    <div className={styles.statItem}>
      <div className={styles.statNum}>
        {count}
        {suffix}
      </div>
      <div className={styles.statLabel}>{label}</div>
    </div>
  );
}

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
      <p className={styles.sub}>The Solutions Provider!</p>

      <p className={styles.tagline}>
        <span className={styles.colorA}>INTELLIGENT</span>{" "}
        <span className={styles.circleText}>PROCESS </span>
        <br />
        <span className={styles.circleText}>IMPROVEMENT</span>
      </p>

      <div className={styles.stats}>
        {HERO_STATS.map((s, i) => (
          <StatItem
            key={s.label}
            num={s.num}
            label={s.label}
            delay={1200 + i * 150}
          />
        ))}
      </div>
    </section>
  );
}