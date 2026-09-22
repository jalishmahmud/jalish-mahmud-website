"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function LoginPage() {
  const router = useRouter(); const [form, setForm] = useState({ identifier: "", password: "" }); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(event) { event.preventDefault(); setBusy(true); setError(""); const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) }); const data = await response.json(); if (!response.ok) setError(data.error); else router.push("/admin/dashboard"); setBusy(false); }
  return <main className={styles.page}><div className={styles.card}><div className={styles.mark}>JM</div><span>Private workspace</span><h1>Welcome back.</h1><p>Sign in to manage your professional blog.</p><form onSubmit={submit}><label>Username or email<input required value={form.identifier} onChange={(e) => setForm({ ...form, identifier: e.target.value })} autoComplete="username" /></label><label>Password<input required type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="current-password" /></label>{error && <div className={styles.error}>{error}</div>}<button className="btn btnPrimary" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button></form></div></main>;
}
