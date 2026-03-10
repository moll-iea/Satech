import React from "react";
import { MARQUEE_ITEMS } from "../data/siteData";
import styles from "./MarqueeBar.module.css";

export default function MarqueeBar() {
  // Duplicate items so the loop is seamless
  const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];

  return (
    <div className={styles.bar}>
      <div className={styles.inner}>
        {items.map((item, i) => (
          <React.Fragment key={i}>
            <span className={styles.item}>{item}</span>
            <span className={styles.dot}>✦</span>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
