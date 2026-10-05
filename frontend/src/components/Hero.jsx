import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { HERO_STATS } from "../data/siteData";
import PCBBackground from "./PCBBackground";
import styles from "./Hero.module.css";

function parseStatNum(str) {
  const match = str.match(/^(\d+)(.*)$/);
  if (!match) return { target: 0, suffix: str };
  return { target: parseInt(match[1], 10), suffix: match[2] };
}

function useCountUp(target, duration = 6000, start = false) {
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

  const count = useCountUp(target, 6000, start);

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
  const wrapRef = useRef(null);   // wrapper ng TECH + subtitle
  const tRef = useRef(null);      // "T" ng TECH
  const innerRef = useRef(null);  // subtitle text

  // Kung kulang/sobra pa rin ang pantay, ito lang ang i-adjust:
  const STEM_LEFT_RATIO = 0.32; // kaliwang gilid ng stem ng T, % ng lapad ng T
  const NUDGE_PX = 0;           // +kanan / -kaliwa, fine-tune

  // Itapat ang kaliwang gilid ng "T" ng THE sa kaliwang gilid ng stem ng "T" sa TECH,
  // at i-scale pababa lang kung lalagpas sa dulo ng "H".
  useLayoutEffect(() => {
    const fit = () => {
      const wrap = wrapRef.current;
      const t = tRef.current;
      const inner = innerRef.current;
      if (!wrap || !t || !inner) return;

      inner.style.transform = "none";
      inner.style.marginLeft = "0px";

      const wrapW = wrap.offsetWidth;
      const titleLS = parseFloat(getComputedStyle(t).letterSpacing) || 0;
      const tWidth = t.offsetWidth - titleLS;     // lapad ng glyph ng T
      const natural = inner.offsetWidth;          // buong lapad ng subtitle

      const offset = tWidth * STEM_LEFT_RATIO + NUDGE_PX;
      const s = Math.min(1, (wrapW - offset) / natural);

      inner.style.marginLeft = `${offset}px`;
      inner.style.transform = `scale(${s})`;
    };

    fit();
    window.addEventListener("resize", fit);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  return (
    <section className={styles.hero} id="hero">
      {/* Animated PCB canvas — replaces static .bg and .grid divs */}
      <PCBBackground />

      {/* <div className={styles.tag}>
        📍 Muntinlupa City, Philippines · Est. 30+ Years
      </div> */}

      <h1 className={styles.title}>
        <span className={styles.fill}>SA</span>
        <span className={styles.techWrap} ref={wrapRef}>
          <span className={styles.stroke}>
            <span ref={tRef}>T</span>ECH
          </span>
          <span className={styles.sub}>
            <span className={styles.subInner} ref={innerRef}>
              The Solutions Provider!
            </span>
          </span>
        </span>
      </h1>

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