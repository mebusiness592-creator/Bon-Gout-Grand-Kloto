"use client";
import { useState } from "react";
import { PasswordInput } from "./PasswordInput";

export function AccountForm({ user }: { user: { firstName: string; lastName: string; phone: string; address: string; city: string; email: string } }) {
  const [f, setF] = useState({ firstName: user.firstName, lastName: user.lastName, phone: user.phone, address: user.address, city: user.city });
  const [cur, setCur] = useState(""); const [nw, setNw] = useState("");
  const [msg, setMsg] = useState(""); const [err, setErr] = useState("");
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF((p) => ({ ...p, [k]: e.target.value }));
  async function save(e: React.FormEvent) {
    e.preventDefault(); setMsg(""); setErr("");
    const body: Record<string, unknown> = { ...f };
    if (nw) { body.currentPassword = cur; body.newPassword = nw; }
    const r = await fetch("/api/account", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const d = await r.json().catch(() => ({}));
    if (r.ok) { setMsg("Informations enregistrées."); setCur(""); setNw(""); } else setErr(d.error || "Enregistrement impossible.");
  }
  async function logout() { await fetch("/api/auth/logout", { method: "POST" }); window.location.href = "/"; }
  return (
    <form className="panel" onSubmit={save}>
      <h3>Mon profil</h3>
      {msg && <div className="okmsg">{msg}</div>}{err && <div className="err">{err}</div>}
      <p className="muted" style={{ margin: 0 }}>{user.email}</p>
      <div className="row2"><div><label>Nom</label><input value={f.lastName} onChange={set("lastName")} required /></div><div><label>Prénom</label><input value={f.firstName} onChange={set("firstName")} required /></div></div>
      <label>Téléphone</label><input value={f.phone} onChange={set("phone")} required />
      <label>Adresse</label><input value={f.address} onChange={set("address")} />
      <label>Ville / quartier</label><input value={f.city} onChange={set("city")} />
      <details style={{ marginTop: "1rem" }}><summary style={{ cursor: "pointer", fontWeight: 600 }}>Changer mon mot de passe</summary>
        <PasswordInput name="cur" label="Mot de passe actuel" value={cur} onChange={setCur} autoComplete="current-password" />
        <PasswordInput name="nw" label="Nouveau mot de passe" value={nw} onChange={setNw} autoComplete="new-password" /></details>
      <div style={{ display: "flex", gap: ".6rem", marginTop: "1rem", flexWrap: "wrap" }}>
        <button className="btn btn-primary">Enregistrer</button><button type="button" className="btn btn-ghost" style={{ color: "var(--brown)" }} onClick={logout}>Se déconnecter</button>
      </div>
    </form>
  );
}
