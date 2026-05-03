import React, { useEffect, useRef } from "react";
import { VALUES } from "../data/siteData";
import { useScrollReveal } from "../hooks/useScrollReveal";
import styles from "./About.module.css";

export default function About() {
  const ref = useScrollReveal();

  return (
    <section className={styles.about} id="about" ref={ref}>

      {/* Background video */}
      <video
        className={styles.bgVideo}
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
      >
        <source src="/videos/serv.mp4" type="video/mp4" />
      </video>

      {/* Subtle geometric grid background */}
      <div className={styles.gridBg} aria-hidden="true" />

      {/* Hero Content */}
      <div className={styles.heroContent}>
        <span className={`${styles.eyebrow} reveal`}>Who We Are</span>

        <h2 className={`${styles.heroTitle} reveal`}>
          We Create <em>Values</em>
        </h2>

        <div className={styles.rule} aria-hidden="true" />

        <p className={`${styles.heroBody} reveal`}>
          Through values that define its culture, added to a complete set of services,
          Satech stands as a{" "}
          <strong>strategic partner in providing equipment, parts and services solutions.</strong>
        </p>
      </div>

      {/* Values Strip */}
      <div className={styles.valuesStrip}>
        {VALUES.map((v, i) => (
          <div
            className={`${styles.valueItem} reveal`}
            key={v.name}
            style={{ "--i": i }}
          >
            <div className={styles.valueIcon} aria-hidden="true">{v.icon}</div>
            <div className={styles.valueName}>{v.name}</div>
            <p className={styles.valueDesc}>{v.desc}</p>
          </div>
        ))}
      </div>

    </section>
  );
}