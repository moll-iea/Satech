import React from "react";
import { CLIENTS_ROW1, CLIENTS_ROW2 } from "../data/siteData";
import styles from "./Clients.module.css";

function ClientsTrack({ clients, reverse = false }) {
  const doubled = [...clients, ...clients];
  return (
    <div className={styles.marqueeWrap}>
      <div className={`${styles.track} ${reverse ? styles.reverse : ""}`}>
        {doubled.map((c, i) => (
          <span className={styles.badge} key={i}>{c}</span>
        ))}
      </div>
    </div>
  );
}

export default function Clients() {
  return (
    <section className={styles.clients} id="clients">
      <div className={styles.header}>
        <div className="section-tag">// Global Clientele</div>
        <h2 className="section-title">Trusted By<br />Industry Leaders</h2>
        <div className="divider" />
        <p className={styles.sub}>
          From global semiconductor giants to local manufacturers — our client
          portfolio spans the world's most respected brands in technology and industry.
        </p>
      </div>

      <ClientsTrack clients={CLIENTS_ROW1} />
      <ClientsTrack clients={CLIENTS_ROW2} reverse />
    </section>
  );
}
