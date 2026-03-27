import React from "react";
import { VALUES } from "../data/siteData";
import { useScrollReveal } from "../hooks/useScrollReveal";
import styles from "./About.module.css";

export default function About() {
  const ref = useScrollReveal();

  return (
    <section className={styles.about} id="about" ref={ref}>
      {/* Left: text */}
      <div className={styles.text}>
        <div className="section-tag">// Who We Are</div>
        <h2 className="section-title">We Create<br />Values</h2>
        <div className="divider" />
        <p className="reveal">
          SATECH is a solutions provider with more than 30 years of
          experience in the SMT and Semiconductor business worldwide. We connect
          suppliers and end-users across Electronics, Semiconductors, Medical,
          Automotive, Pharmaceutical, Food, and Machine Industries.
        </p>
        <p className="reveal">
          Our highly skilled, factory-trained professionals deliver technical
          expertise 24/7, backed by deep knowledge in Electronics, Computers,
          Automotive, and Mechanical fields — with capability for re-engineering,
          design, repair, fabrication, and assembly.
        </p>
      </div>

      {/* Right: values card */}
      <div className={styles.visual}>
        <div className={styles.box}>
          <div className={styles.boxTitle}>Core Values</div>
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
