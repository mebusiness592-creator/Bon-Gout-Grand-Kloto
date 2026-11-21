"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { ImageUploader } from "./ImageUploader";
import { fcfa, productImage } from "@/lib/pricing";

export type Field = { name: string; label: string; type: "text" | "textarea" | "number" | "bool" | "select" | "images" | "media"; options?: { value: string; label: string }[]; required?: boolean; help?: string };
export type Col = { key: string; label: string; type?: "text" | "money" | "bool" | "image" | "map" | "media" };
type Item = Record<string, unknown> & { _id: string };

export function ResourceManager({ resource, title, noun, items, fields, cols, maps = {}, defaults = {} }: {
  resource: string; title: string; noun: string; items: Item[]; fields: Field[]; cols: Col[];
  maps?: Record<string, Record<string, string>>; defaults?: Record<string, unknown>;
}) {
  const router = useRouter();
  const [form, setForm] = useState<Record<string, unknown> | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);

  function open(item?: Item) {
    setErr(""); setEditId(item?._id || null);
    const v: Record<string, unknown> = { ...defaults };
    for (const f of fields) {
      const cur = item ? item[f.name] : undefined;
      if (f.type === "images") v[f.name] = Array.isArray(cur) ? cur : (item && typeof item.imageUrl === "string" && f.name === "images" ? [item.imageUrl] : []);
      else if (f.type === "bool") v[f.name] = cur === undefined ? (v[f.name] ?? (f.name === "available")) : Boolean(cur);
      else if (f.type === "media") { v.url = item?.url ?? ""; v.kind = item?.kind ?? "image"; }
      else v[f.name] = cur ?? v[f.name] ?? "";
    }
    setForm(v);
  }
  async function save(e: React.FormEvent) {
    e.preventDefault(); if (!form) return;
    setBusy(true); setErr("");
    const body: Record<string, unknown> = {};
    for (const f of fields) {
      const v = form[f.name];
      if (f.type === "number") body[f.name] = v === "" || v === null || v === undefined ? (f.required ? 0 : null) : Number(v);
      else if (f.type === "select" && !f.required) body[f.name] = v === "" ? null : v;
      else if (f.type === "media") { body.url = form.url; body.kind = form.kind; }
      else if (f.type === "text" || f.type === "textarea") body[f.name] = typeof v === "string" ? v : "";
      else body[f.name] = v;
    }
    const r = await fetch(`/api/admin/${resource}${editId ? "/" + editId : ""}`, { method: editId ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const d = await r.json().catch(() => ({}));
    setBusy(false);
    if (!r.ok) return setErr(d.error || "Enregistrement impossible.");
    setForm(null); router.refresh();
  }
  async function del(it: Item) {
    if (!confirm(`Supprimer définitivement ce ${noun} ?`)) return;
    const r = await fetch(`/api/admin/${resource}/${it._id}`, { method: "DELETE" });
    if (r.ok) router.refresh(); else alert((await r.json().catch(() => ({}))).error || "Suppression impossible.");
  }
  async function toggle(it: Item) {
    await fetch(`/api/admin/${resource}/${it._id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ available: !it.available }) });
    router.refresh();
  }
  const hasAvail = fields.some((f) => f.name === "available");
  const cell = (it: Item, c: Col) => {
    const v = it[c.key];
    if (c.type === "money") return fcfa(Number(v || 0)) + (it.promoPrice && c.key === "price" ? ` → ${fcfa(Number(it.promoPrice))}` : "");
    if (c.type === "bool") return v ? "Oui" : "Non";
    if (c.type === "image") return productImage(it as never) ? <img src={productImage(it as never)} alt="" /> : "—";
    if (c.type === "media") return /\.(mp4|webm|mov)$/i.test(String(v)) ? <video src={String(v)} style={{ width: 60, height: 44 }} /> : <img src={String(v)} alt="" />;
    if (c.type === "map") return maps[c.key]?.[String(v)] || (typeof it.category === "string" && c.key === "categoryId" ? it.category : "—");
    return v === undefined || v === null || v === "" ? "—" : String(v);
  };
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: ".6rem", flexWrap: "wrap" }}>
        <h1 style={{ fontSize: "1.7rem", margin: 0 }}>{title}</h1>
        <button className="btn btn-primary btn-sm" onClick={() => open()}><Plus size={16} /> Ajouter</button>
      </div>
      <div className="scroll" style={{ marginTop: "1rem" }}>
        <table className="tbl"><thead><tr>{cols.map((c) => <th key={c.key + c.label}>{c.label}</th>)}<th /></tr></thead>
          <tbody>
            {items.length === 0 && <tr><td colSpan={cols.length + 1} className="muted">Aucun élément pour le moment.</td></tr>}
            {items.map((it) => (
              <tr key={it._id}>
                {cols.map((c) => <td key={c.key + c.label}>{cell(it, c)}</td>)}
                <td style={{ whiteSpace: "nowrap", textAlign: "right" }}>
                  {hasAvail && <button className="btn btn-sm btn-light" onClick={() => toggle(it)}>{it.available ? "Désactiver" : "Activer"}</button>}{" "}
                  {resource !== "media" && <button className="btn btn-sm btn-light" aria-label="Modifier" onClick={() => open(it)}><Pencil size={14} /></button>}{" "}
                  <button className="btn btn-sm btn-danger" aria-label="Supprimer" onClick={() => del(it)}><Trash2 size={14} /></button>
                </td>
              </tr>))}
          </tbody></table>
      </div>
      {form && (
        <div className="modal" onClick={(e) => { if (e.target === e.currentTarget) setForm(null); }}>
          <form className="box" onSubmit={save}>
            <h2 style={{ fontSize: "1.3rem" }}>{editId ? "Modifier" : "Ajouter"} – {noun}</h2>
            {err && <div className="err" role="alert">{err}</div>}
            {fields.map((f) => (
              <div key={f.name}>
                {f.type === "bool" ? <div className="check" style={{ marginTop: ".8rem" }}><input id={f.name} type="checkbox" checked={Boolean(form[f.name])} onChange={(e) => setForm({ ...form, [f.name]: e.target.checked })} /><label htmlFor={f.name}>{f.label}</label></div> : <>
                  <label htmlFor={f.name}>{f.label}{f.required ? " *" : ""}</label>
                  {f.type === "textarea" ? <textarea id={f.name} rows={3} value={String(form[f.name] ?? "")} onChange={(e) => setForm({ ...form, [f.name]: e.target.value })} />
                    : f.type === "select" ? <select id={f.name} value={String(form[f.name] ?? "")} onChange={(e) => setForm({ ...form, [f.name]: e.target.value })} required={f.required}>{!f.required && <option value="">—</option>}{f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
                    : f.type === "images" ? <ImageUploader value={(form[f.name] as string[]) || []} onChange={(v) => setForm({ ...form, [f.name]: v })} />
                    : f.type === "media" ? <ImageUploader video max={1} value={form.url ? [String(form.url)] : []} onChange={(v) => setForm({ ...form, url: v[0] || "" })} onUploaded={(r) => setForm((p) => ({ ...(p || {}), kind: r.kind }))} />
                    : <input id={f.name} type={f.type === "number" ? "number" : "text"} min={f.type === "number" ? 0 : undefined} step={f.type === "number" ? 1 : undefined} value={String(form[f.name] ?? "")} onChange={(e) => setForm({ ...form, [f.name]: e.target.value })} required={f.required} />}
                  {f.help && <small className="muted">{f.help}</small>}</>}
              </div>))}
            <div style={{ display: "flex", gap: ".6rem", marginTop: "1.2rem" }}>
              <button className="btn btn-primary" disabled={busy}>{busy ? "Enregistrement…" : "Enregistrer"}</button>
              <button type="button" className="btn btn-light" onClick={() => setForm(null)}>Annuler</button>
            </div>
          </form>
        </div>)}
    </div>
  );
}
