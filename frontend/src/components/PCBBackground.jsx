import React from "react";
import chipImage from "../assets/chip.png"; // ← move the image to src/assets/chip.png
import styles from "./PCBBackground.module.css";

/**
 * PCBBackground — replaces the old canvas animation.
 * Renders the layered-chip photo with glow, scanlines, and vignette overlays
 * so it blends seamlessly into the dark hero section.
 */
export default function PCBBackground() {
  return (
    <div className={styles.wrapper} aria-hidden="true">
      {/* Soft blue-gold ambient bloom behind the chip */}
      <div className={styles.glow} />

      {/* Hero chip image — positioned right-centre, slightly cropped at edges */}
      <img
        src={chipImage}
        alt=""
        className={styles.chip}
        draggable={false}
      />

      {/* Subtle horizontal scanlines — keeps the "tech screen" texture */}
      <div className={styles.scanlines} />

      {/* Dark vignette so content text stays readable over the image */}
      <div className={styles.vignette} />
    </div>
  );
}