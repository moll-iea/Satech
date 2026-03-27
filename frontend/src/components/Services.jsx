import React from "react";
import { SERVICES } from "../data/siteData";
import { useScrollReveal } from "../hooks/useScrollReveal";
import styles from "./Services.module.css";

export default function Services() {
  const ref = useScrollReveal();

  return (
    <section className={styles.services} id="services" ref={ref}>
      <div className={styles.intro}>
        <div>
          <div className="section-tag">// What We Do</div>
          <h2 className="section-title">End-to-End<br />Solutions</h2>
          <div className="divider" />
        </div>
        <p className={styles.introText}>
          From equipment supply and technical support to factory automation and
          legal services — SATECH delivers comprehensive solutions that
          drive value across your entire operation.
        </p>
      </div>

      <div className={styles.grid}>
        {SERVICES.map((s) => (
          <div className={`${styles.card} reveal`} key={s.num}>
            <span className={styles.num}>{s.num}</span>
            <span className={styles.icon}>{s.icon}</span>
            <div className={styles.cat}>{s.cat}</div>
            <div className={styles.title}>{s.title}</div>
            <div className={styles.desc}>{s.desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
