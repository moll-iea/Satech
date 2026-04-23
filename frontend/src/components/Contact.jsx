import React, { useState } from "react";
import { CONTACT_INFO } from "../data/siteData";
import styles from "./Contact.module.css";

const INITIAL = { name: "", email: "", message: "" };

export default function Contact() {
  const [form, setForm]       = useState(INITIAL);
  const [errors, setErrors]   = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const validate = () => {
    const e = {};
    if (!form.name.trim())    e.name    = "Name is required.";
    if (!form.email.trim())   e.email   = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email.";
    if (!form.message.trim()) e.message = "Message is required.";
    return e;
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
    setSubmitError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    try {
      setIsSubmitting(true);
      setSubmitError("");

      const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
      const res = await fetch(`${baseUrl}/api/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to send message.");
      }

      setSubmitted(true);
      setForm(INITIAL);
    } catch (error) {
      setSubmitError(error.message || "Failed to send message.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className={styles.contact} id="contact">
      <div className={styles.inner}>
        {/* Left: info */}
        <div className={styles.info}>
          <h2 className={styles.title}>Let's Build<br />Solutions<br />Together</h2>
          <div className={styles.details}>
            {CONTACT_INFO.map((c) => (
              <div className={styles.detailItem} key={c.label}>
                <div className={styles.detailIcon}>{c.icon}</div>
                <div>
                  <div className={styles.detailLabel}>{c.label}</div>
                  <div className={styles.detailVal}>{c.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: form */}
        <div className={styles.formSide}>
          {submitted ? (
            <div className={styles.success}>
              <div className={styles.successIcon}>✅</div>
              <h3 className={styles.successTitle}>Message Sent!</h3>
              <p className={styles.successMsg}>
                Thank you for reaching out. Our team will get back to you shortly.
              </p>
              <button className={styles.btnDark} onClick={() => setSubmitted(false)}>
                Send Another
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              {submitError && <p className={styles.error}>{submitError}</p>}

              <div className={styles.formGroup}>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your Full Name"
                  className={errors.name ? styles.inputError : ""}
                />
                {errors.name && (
                  <span className={styles.error}>{errors.name}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Email Address"
                  className={errors.email ? styles.inputError : ""}
                />
                {errors.email && (
                  <span className={styles.error}>{errors.email}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Tell us about your requirements..."
                  className={errors.message ? styles.inputError : ""}
                />
                {errors.message && (
                  <span className={styles.error}>{errors.message}</span>
                )}
              </div>

              <button type="submit" className={styles.btnDark} disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send Message →"}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}