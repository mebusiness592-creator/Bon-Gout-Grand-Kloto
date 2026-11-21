"use client";
import { useState } from "react";
import Link from "next/link";
import { PasswordInput } from "./PasswordInput";

async function post(url: string, body: unknown) {
  const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const d = await r.json().catch(() => ({}));
  return { ok: r.ok, d };
}
function go(role: string) {
  const next = new URLSearchParams(window.location.search).get("next");
  window.location.href = next && next.startsWith("/") && !next.startsWith("//") ? next : role === "customer" ? "/mon-compte" : "/admin";
}

export function LoginForm() {
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr("");
    const { ok, d } = await post("/api/auth/login", { email, password });
    if (ok) go(d.role); else { setErr(d.error || "Connexion impossible."); setBusy(false); }
  }
  return (
    <form className="form panel" onSubmit={submit}>
      <h1 style={{ fontSize: "1.8rem" }}>Connexion</h1>
      {err && <div className="err" role="alert">{err}</div>}
      <label htmlFor="email">Adresse e-mail</label>
      <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
      <PasswordInput name="password" label="Mot de passe" value={password} onChange={setPassword} autoComplete="current-password" />
      <p style={{ textAlign: "right", fontSize: ".85rem" }}><Link href="/mot-de-passe-oublie">Mot de passe oublié ?</Link></p>
      <button className="btn btn-primary" style={{ width: "100%" }} disabled={busy}>{busy ? "Connexion…" : "Se connecter"}</button>
      <p className="center muted" style={{ fontSize: ".9rem" }}>Pas encore de compte ? <Link href="/inscription">Créer un compte</Link></p>
    </form>
  );
}

export function RegisterForm() {
  const [f, setF] = useState({ lastName: "", firstName: "", phone: "", email: "", password: "", confirmPassword: "" });
  const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (v: string) => setF((p) => ({ ...p, [k]: v }));
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr("");
    if (f.password !== f.confirmPassword) return setErr("Les mots de passe ne correspondent pas.");
    setBusy(true);
    const { ok, d } = await post("/api/auth/register", f);
    if (ok) go(d.role); else { setErr(d.error || "Inscription impossible."); setBusy(false); }
  }
  return (
    <form className="form panel" onSubmit={submit}>
      <h1 style={{ fontSize: "1.8rem" }}>Créer un compte</h1>
      {err && <div className="err" role="alert">{err}</div>}
      <div className="row2">
        <div><label htmlFor="ln">Nom</label><input id="ln" value={f.lastName} onChange={(e) => set("lastName")(e.target.value)} required maxLength={60} autoComplete="family-name" /></div>
        <div><label htmlFor="fn">Prénom</label><input id="fn" value={f.firstName} onChange={(e) => set("firstName")(e.target.value)} required maxLength={60} autoComplete="given-name" /></div>
      </div>
      <label htmlFor="ph">Téléphone</label><input id="ph" type="tel" value={f.phone} onChange={(e) => set("phone")(e.target.value)} required autoComplete="tel" />
      <label htmlFor="em">Adresse e-mail</label><input id="em" type="email" value={f.email} onChange={(e) => set("email")(e.target.value)} required autoComplete="email" />
      <PasswordInput name="pw1" label="Mot de passe (8 caractères minimum)" value={f.password} onChange={set("password")} autoComplete="new-password" />
      <PasswordInput name="pw2" label="Confirmer le mot de passe" value={f.confirmPassword} onChange={set("confirmPassword")} autoComplete="new-password" />
      <button className="btn btn-primary" style={{ width: "100%", marginTop: "1rem" }} disabled={busy}>{busy ? "Création…" : "Créer mon compte"}</button>
      <p className="center muted" style={{ fontSize: ".9rem" }}>Déjà inscrit ? <Link href="/connexion">Se connecter</Link></p>
    </form>
  );
}
