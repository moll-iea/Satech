import React, { useState } from "react";
import { PRODUCT_TABS, PRODUCTS } from "../data/siteData";
import { useScrollReveal } from "../hooks/useScrollReveal";
import styles from "./Products.module.css";

export default function Products() {
  const [activeTab, setActiveTab] = useState(PRODUCT_TABS[0]);
  const ref = useScrollReveal();

  const currentProducts = PRODUCTS[activeTab] || [];

  return (
    <section className={styles.products} id="products" ref={ref}>
      <div className={styles.header}>
        <div className="section-tag">// Product Catalogue</div>
        <h2 className="section-title">Advanced<br />Equipment</h2>
        <div className="divider" />
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        {PRODUCT_TABS.map((tab) => (
          <button
            key={tab}
            className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Product grid */}
      <div className={styles.grid}>
        {currentProducts.map((p) => (
          <div className={`${styles.card} reveal`} key={p.name}>
            <div className={styles.icon}>{p.icon}</div>
            <div className={styles.name}>{p.name}</div>
            <div className={styles.detail}>{p.detail}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
