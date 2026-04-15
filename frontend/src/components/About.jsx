import React, { useEffect, useRef } from "react";
import { VALUES } from "../data/siteData";
import { useScrollReveal } from "../hooks/useScrollReveal";
import styles from "./About.module.css";

export default function About() {
  const ref = useScrollReveal();
  const scanRef = useRef(null);
  const animFrameRef = useRef(null);

  useEffect(() => {
    const scanEl = scanRef.current;
    if (!scanEl) return;
    let y = -120;

    const animate = () => {
      const svgEl = scanEl.closest("svg");
      const h = svgEl ? svgEl.getBoundingClientRect().height || 600 : 600;
      y += 0.6;
      if (y > h + 120) y = -120;
      scanEl.setAttribute("y", y);
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, []);

  return (
    <section className={styles.about} id="about" ref={ref}>
      {/* PCB Background */}
      <svg
        className={styles.pcbBg}
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <pattern
            id="pcb"
            x="0"
            y="0"
            width="80"
            height="80"
            patternUnits="userSpaceOnUse"
          >
            <line x1="0" y1="20" x2="80" y2="20" stroke="rgba(232,160,0,0.07)" strokeWidth="1" />
            <line x1="40" y1="0" x2="40" y2="80" stroke="rgba(232,160,0,0.07)" strokeWidth="1" />
            <path d="M0 60 L20 60 L20 80" stroke="rgba(232,160,0,0.09)" strokeWidth="1" fill="none" />
            <path d="M80 0 L60 0 L60 20 L80 20" stroke="rgba(232,160,0,0.07)" strokeWidth="1" fill="none" />
            <circle cx="40" cy="20" r="2.5" fill="none" stroke="rgba(232,160,0,0.18)" strokeWidth="0.8" />
            <circle cx="40" cy="60" r="1.8" fill="rgba(232,160,0,0.1)" stroke="rgba(232,160,0,0.22)" strokeWidth="0.8" />
            <circle cx="20" cy="60" r="1.5" fill="none" stroke="rgba(232,160,0,0.15)" strokeWidth="0.6" />
            <rect x="55" y="35" width="8" height="4" rx="1" fill="rgba(232,160,0,0.08)" stroke="rgba(232,160,0,0.15)" strokeWidth="0.5" />
            <rect x="67" y="35" width="8" height="4" rx="1" fill="rgba(232,160,0,0.08)" stroke="rgba(232,160,0,0.15)" strokeWidth="0.5" />
            <rect x="50" y="45" width="20" height="14" rx="1" fill="none" stroke="rgba(232,160,0,0.10)" strokeWidth="0.6" />
            <line x1="50" y1="50" x2="44" y2="50" stroke="rgba(232,160,0,0.08)" strokeWidth="0.8" />
            <line x1="50" y1="54" x2="44" y2="54" stroke="rgba(232,160,0,0.08)" strokeWidth="0.8" />
            <line x1="70" y1="50" x2="76" y2="50" stroke="rgba(232,160,0,0.08)" strokeWidth="0.8" />
            <line x1="70" y1="54" x2="76" y2="54" stroke="rgba(232,160,0,0.08)" strokeWidth="0.8" />
          </pattern>
          <linearGradient id="scan" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(232,160,0,0)" />
            <stop offset="50%" stopColor="rgba(232,160,0,0.06)" />
            <stop offset="100%" stopColor="rgba(232,160,0,0)" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#pcb)" />
        <rect ref={scanRef} width="100%" height="120" fill="url(#scan)" y="-120" />
      </svg>

      {/* Left: text */}
      <div className={styles.text}>
        <div className={`${styles.sectionTag} reveal`}>// Who We Are</div>
        <h2 className={`${styles.sectionTitle} reveal`}>
          We Create<br />
          <span className={styles.gold}>Values</span>
        </h2>
        <div className={styles.divider} />
        <p className={`${styles.bodyText} reveal`}>
          SATECH is a solutions provider with more than 30 years of experience
          in the SMT and Semiconductor business worldwide. We connect suppliers
          and end-users across Electronics, Semiconductors, Medical, Automotive,
          Pharmaceutical, Food, and Machine Industries.
        </p>
        <p className={`${styles.bodyText} reveal`}>
          Our highly skilled, factory-trained professionals deliver technical
          expertise 24/7, backed by deep knowledge in Electronics, Computers,
          Automotive, and Mechanical fields — with capability for re-engineering,
          design, repair, fabrication, and assembly.
        </p>
      </div>

      {/* Right: values card */}
      <div className={styles.visual}>
        <div className={styles.box}>
          <div className={styles.boxHeader}>
            <div className={styles.boxTitle}>Core Values</div>
            <div className={styles.boxVersion}>REV 3.0</div>
          </div>

          <div className={styles.valuesGrid}>
            {VALUES.map((v) => (
              <div
                className={`${styles.valueItem} reveal`}
                key={v.name}
                data-icon={v.icon}
              >
                <div className={styles.valueIcon}>{v.icon}</div>
                <div>
                  <div className={styles.valueName}>{v.name}</div>
                  <div className={styles.valueDesc}>{v.desc}</div>
                </div>
              </div>
            ))}
          </div>

       
        </div>
      </div>
    </section>
  );
}