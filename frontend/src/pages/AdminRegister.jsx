import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./AdminRegister.module.css";

const TOKEN_KEY = "satech_admin_token";

export default function AdminRegister() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [hasAdmin, setHasAdmin] = useState(false);
  const navigate = useNavigate();

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
      } catch (err) {
        setError(err.message || "Failed to load admin setup status.");
      } finally {
        setIsChecking(false);
      }
    };

    loadStatus();
  }, []);

  useEffect(() => {
    if (!isChecking && hasAdmin) {
      navigate("/admin/login", { replace: true });
    }
  }, [hasAdmin, isChecking, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Name, email, and password are required.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setIsLoading(true);
      const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
      const endpoint = hasAdmin ? "/api/users/admin/register" : "/api/users/admin/bootstrap";
      const headers = {
        "Content-Type": "application/json",
      };

      if (hasAdmin && token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
        }),
      });

      const payload = await response.json();

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem(TOKEN_KEY);
        navigate("/admin/login", { replace: true });
        return;
      }

      if (!response.ok || !payload.success) {
        throw new Error(payload.message || "Failed to create admin account.");
      }

      navigate("/admin/login?checkEmail=1", { replace: true });
    } catch (err) {
      setError(err.message || "Failed to create admin account.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <p className={styles.tag}>SATECH ADMIN</p>
        <h1 className={styles.title}>Set up the first admin</h1>
        <p className={styles.subtitle}>Create the first admin account directly from the admin side. No setup key or terminal needed.</p>
        {isChecking && <p className={styles.notice}>Checking admin setup status...</p>}
        {!isChecking && !hasAdmin && <p className={styles.notice}>This screen is only available until the first admin account is created.</p>}

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.label} htmlFor="admin-name">Name</label>
          <input
            id="admin-name"
            className={styles.input}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Admin name"
            autoComplete="name"
          />

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
            placeholder="Create password"
            autoComplete="new-password"
          />

          <label className={styles.label} htmlFor="admin-confirm-password">Confirm password</label>
          <input
            id="admin-confirm-password"
            className={styles.input}
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm password"
            autoComplete="new-password"
          />

          {error && <p className={styles.error}>{error}</p>}
          <button className={styles.button} type="submit" disabled={isLoading || isChecking}>
            {isLoading ? "Creating..." : "Create First Admin"}
          </button>
        </form>

        <p className={styles.footerText}>
          <Link className={styles.link} to="/admin">Back to dashboard</Link>
          <span className={styles.divider}>·</span>
          <Link className={styles.link} to="/admin/login">Sign in</Link>
        </p>
      </section>
    </main>
  );
}