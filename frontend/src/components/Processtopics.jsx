import React from "react";
import styles from "./Products.module.css";

/* ══════════════════════════════════════════════════════════════
   processTopics — capability roadmap data + icon set for ProcessMenu

   All icons below are original line-art (no logos, no product
   photography, no brand marks) so nothing here can be traced
   back to a specific vendor or machine.
══════════════════════════════════════════════════════════════ */

const ICON_PATHS = {
  tester: (
    <>
      <rect x="8" y="12" width="18" height="16" rx="2" />
      <path d="M12 12V8M16 12V8M20 12V8M24 12V8M12 28v4M16 28v4M20 28v4M24 28v4" />
      <path d="M29 14l6-4M29 20h7" />
    </>
  ),
  laser: (
    <>
      <circle cx="9" cy="20" r="3" />
      <path d="M12 20h9" />
      <path d="M21 14l6 6-6 6" />
      <path d="M27 20h5" />
      <path d="M21 14v12" strokeDasharray="2 3" />
    </>
  ),
  profiler: (
    <>
      <path d="M6 28c4-10 8-14 12-14s8 4 12 14" />
      <path d="M18 8v6" />
      <circle cx="18" cy="7" r="1.6" />
      <path d="M4 30h32" />
    </>
  ),
  bondtest: (
    <>
      <rect x="10" y="20" width="16" height="8" rx="1.5" />
      <path d="M18 20v-8" />
      <path d="M14 14l4-4 4 4" />
      <path d="M6 30h28" />
    </>
  ),
  computer: (
    <>
      <rect x="6" y="8" width="24" height="16" rx="2" />
      <path d="M11 30h14M18 24v6" />
      <path d="M10 19l4-5 3 3 5-6 4 4" />
    </>
  ),
  epoxy: (
    <>
      <path d="M20 6v10" />
      <path d="M20 16c-4 4-7 8-7 12a7 7 0 0 0 14 0c0-4-3-8-7-12z" />
      <circle cx="20" cy="27" r="2" />
    </>
  ),
  inline: (
    <>
      <path d="M4 26h28" />
      <rect x="6" y="15" width="7" height="9" rx="1" />
      <rect x="16.5" y="15" width="7" height="9" rx="1" />
      <rect x="27" y="15" width="6" height="9" rx="1" />
      <path d="M4 30h28" strokeDasharray="1 3" />
    </>
  ),
  xray: (
    <>
      <rect x="12" y="14" width="12" height="12" rx="1.5" />
      <path d="M18 6v4M18 6l-3 3M18 6l3 3" />
      <path d="M6 10l4 4M30 10l-4 4M6 26l4-4M30 26l-4-4" strokeDasharray="1.6 2.4" />
    </>
  ),
  xray3d: (
    <>
      <path d="M18 5l13 6-13 6-13-6z" />
      <path d="M5 18l13 6 13-6" />
      <path d="M5 25l13 6 13-6" />
    </>
  ),
  router: (
    <>
      <rect x="6" y="6" width="24" height="24" rx="1.5" strokeDasharray="2 2.5" />
      <circle cx="18" cy="18" r="4" />
      <path d="M18 10v4M18 22v4M10 18h4M22 18h4" />
    </>
  ),
  cmm: (
    <>
      <path d="M8 30V10M8 10h20M28 10v6" />
      <path d="M28 16l4 4-4 4" />
      <rect x="14" y="20" width="8" height="8" rx="1" />
    </>
  ),
  aoi: (
    <>
      <rect x="6" y="10" width="24" height="16" rx="2" />
      <circle cx="18" cy="18" r="5" />
      <circle cx="18" cy="18" r="1.6" />
      <path d="M10 10l-3-3M26 10l3-3" />
    </>
  ),
  wafer: (
    <>
      <circle cx="20" cy="20" r="12" />
      <path d="M20 8v24M8 20h24" strokeDasharray="1.5 2" />
      <path d="M11.5 11.5l17 17M28.5 11.5l-17 17" strokeDasharray="1.5 2" />
    </>
  ),
  breadboard: (
    <>
      <rect x="6" y="10" width="28" height="18" rx="2" />
      <path d="M12 10v18M18 10v18M24 10v18M30 10v18" strokeDasharray="1 2.6" />
      <path d="M6 16h28M6 22h28" strokeDasharray="1 2.6" />
    </>
  ),
  spi3d: (
    <>
      <path d="M18 5l13 6-13 6-13-6z" />
      <path d="M5 18l13 6 13-6" />
      <circle cx="14" cy="15" r="1.2" />
      <circle cx="20" cy="12.5" r="1.2" />
      <circle cx="24" cy="15.5" r="1.2" />
    </>
  ),
  solder: (
    <>
      <path d="M10 30l14-14" />
      <path d="M22 10l6 6-4 4-6-6z" />
      <circle cx="11" cy="29" r="2.2" />
    </>
  ),
  inlinexray: (
    <>
      <path d="M4 28h32" />
      <rect x="14" y="13" width="12" height="10" rx="1.5" />
      <path d="M20 7v4M20 7l-2.4 2.4M20 7l2.4 2.4" />
      <rect x="6" y="19" width="6" height="6" rx="1" />
      <rect x="28" y="19" width="6" height="6" rx="1" />
    </>
  ),
  cleaning: (
    <>
      <path d="M14 7c-4 6-8 11-8 15a8 8 0 0 0 16 0c0-4-4-9-8-15z" />
      <path d="M26.5 16c-2.5 3.5-5 6.3-5 8.8a5 5 0 0 0 10 0c0-2.5-2.5-5.3-5-8.8z" />
    </>
  ),
  lidattach: (
    <>
      <rect x="8" y="18" width="20" height="12" rx="1.5" />
      <path d="M8 18l4-6h12l4 6" />
      <path d="M18 4v8M18 4l-3 3M18 4l3 3" />
    </>
  ),
  press: (
    <>
      <path d="M6 10h28M6 30h28" />
      <path d="M12 10v6M28 10v6M12 24v6M28 24v6" />
      <rect x="12" y="16" width="16" height="8" rx="1" />
    </>
  ),
};

export function ProcessIcon({ name }) {
  return (
    <svg
      className={styles.processIconSvg}
      viewBox="0 0 40 40"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICON_PATHS[name] || ICON_PATHS.tester}
    </svg>
  );
}