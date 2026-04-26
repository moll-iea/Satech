import React from "react";
import styles from "./PCBBackground.module.css";
import chipImage from '../assets/pcbs.mp4';

/**
 * PCBBackground — video version, right-panel layout.
 * Video sits on the right half (like the chip image did),
 * with glow, scanlines, and vignette overlays preserved.
 */
export default function PCBBackground() {
  return (
    <div className={styles.wrapper} aria-hidden="true">
      {/* Soft ambient bloom behind the video */}
      <div className={styles.glow} />

      {/* Video — positioned right-centre, same as chip image was */}
      <div className={styles.videoContainer}>
        <video
          className={styles.video}
          src={chipImage}
          autoPlay
          loop
          muted
        />
      </div>

      {/* Subtle horizontal scanlines */}
      <div className={styles.scanlines} />

      {/* Dark vignette — heavy on the left to protect text */}
      <div className={styles.vignette} />
    </div>
  );
}