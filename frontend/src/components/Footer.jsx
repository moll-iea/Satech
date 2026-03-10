import React from "react";
import { NAV_LINKS } from "../data/siteData";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.logo}>SATECH INC.</div>
      <div className={styles.copy}>
        © {new Date().getFullYear()} SA TECH INC. All rights reserved. The Solutions Provider.
      </div>
      <div className={styles.links}>
        {NAV_LINKS.map((l) => (
          <a href={l.href} key={l.href}>{l.label}</a>
        ))}
      </div>
    </footer>
  );
}
