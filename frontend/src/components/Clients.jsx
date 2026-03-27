import React from "react";
import styles from "./Clients.module.css";

const EXHIBITIONS_ROW1 = ["Medical", "Aerospace", "Metal", "Productronica", "Apex"];
const EXHIBITIONS_ROW2 = ["Nepcon", "Semi.org", "Semicon", "Medical", "Aerospace"];

function ExhibitionsTrack({ exhibitions, reverse = false }) {
  return (
    <div className={styles.marqueeWrap}>
      <div className={`${styles.track} ${reverse ? styles.reverse : ""}`}>
        {/* group 1 */}
        <div className={styles.group}>
          {exhibitions.map((e, i) => (
            <span className={styles.badge} key={`a-${i}`}>{e}</span>
          ))}
        </div>

        {/* group 2 (duplicate for seamless loop) */}
        <div className={styles.group} aria-hidden="true">
          {exhibitions.map((e, i) => (
            <span className={styles.badge} key={`b-${i}`}>{e}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Exhibitions() {
  return (
    <section className={styles.clients} id="exhibitions">
      <div className={styles.header}>
        <div className="section-tag">// Exhibitions</div>
        <h2 className="section-title">Featured In<br />Top Industry Events</h2>
        <div className="divider" />
        <p className={styles.sub}>
          From global semiconductor summits to specialized manufacturing expos — our
          presence spans the world's most respected exhibitions in technology and industry.
        </p>
      </div>

      <ExhibitionsTrack exhibitions={EXHIBITIONS_ROW1} />
      <ExhibitionsTrack exhibitions={EXHIBITIONS_ROW2} reverse />
    </section>
  );
}
