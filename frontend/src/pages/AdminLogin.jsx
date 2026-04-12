import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import styles from "./AdminLogin.module.css";

const TOKEN_KEY = "satech_admin_token";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasAdmin, setHasAdmin] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      navigate("/admin", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    const loadStatus = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
        const response = await fetch(`${baseUrl}/api/users/admin/status`);
        const payload = await response.json();

        if (!response.ok || !payload.success) {
          throw new Error(payload.message || "Failed to load admin setup status.");
        }

        setHasAdmin(Boolean(payload.data?.hasAdmin));
      } catch {
        setHasAdmin(true);
      }
    };

    loadStatus();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      return;
    }

    try {
      setIsLoading(true);
      const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
      const response = await fetch(`${baseUrl}/api/users/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success || !data.token) {
        throw new Error(data.message || "Admin login failed.");
      }

      localStorage.setItem(TOKEN_KEY, data.token);
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(err.message || "Admin login failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <p className={styles.tag}>SATECH ADMIN</p>
        <h1 className={styles.title}>Sign in</h1>
        <p className={styles.subtitle}>Admin-only access panel for inquiry management.</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.label} htmlFor="admin-email">Email</label>
          <input
            id="admin-email"
            className={styles.input}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@company.com"
            autoComplete="email"
          />

          <label className={styles.label} htmlFor="admin-password">Password</label>
          <input
            id="admin-password"
            className={styles.input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            autoComplete="current-password"
          />

          {error && <p className={styles.error}>{error}</p>}

          <button className={styles.button} type="submit" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Login as Admin"}
          </button>
        </form>

        {hasAdmin === false && (
          <p className={styles.footerText}>
            No admin exists yet? <Link className={styles.link} to="/admin/register">Set up the first admin</Link>
          </p>
        )}

      </section>
    </main>
  );
}
