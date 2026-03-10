import React, { useState } from "react";
import { CONTACT_INFO } from "../data/siteData";
import styles from "./Contact.module.css";

const INITIAL = { name: "", email: "", company: "", message: "" };

export default function Contact() {
  const [form, setForm]       = useState(INITIAL);
  const [errors, setErrors]   = useState({});
  const [submitted, setSubmitted] = useState(false);

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
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitted(true);
    setForm(INITIAL);
  };

  return (
    <section className={styles.contact} id="contact">
      <div className={styles.inner}>
        {/* Left: info */}
        <div className={styles.info}>
          <h2 className={styles.title}>Let's Build<br />Solutions<br />Together</h2>
          <p className={styles.sub}>
            Ready to find the right equipment, parts, or services solution for
            your operation? Reach out and our team will respond promptly.
          </p>
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
              {[
                { name: "name",    type: "text",  placeholder: "Your Full Name" },
                { name: "email",   type: "email", placeholder: "Email Address" },
                { name: "company", type: "text",  placeholder: "Company Name (optional)" },
              ].map((field) => (
                <div className={styles.formGroup} key={field.name}>
                  <input
                    type={field.type}
                    name={field.name}
                    value={form[field.name]}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    className={errors[field.name] ? styles.inputError : ""}
                  />
                  {errors[field.name] && (
                    <span className={styles.error}>{errors[field.name]}</span>
                  )}
                </div>
              ))}
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
              <button type="submit" className={styles.btnDark}>
                Send Message →
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
