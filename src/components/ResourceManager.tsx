"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { ImageUploader } from "./ImageUploader";
import { OptionGroupsEditor } from "./OptionGroupsEditor";
import { groupsOf } from "@/lib/options";
import type { OptionGroup } from "@/lib/types";
import { fcfa, priceLabel, productImage } from "@/lib/pricing";

export type Field = { name: string; label: string; type: "text" | "textarea" | "number" | "bool" | "select" | "images" | "videos" | "image" | "variants" | "groups" | "media"; options?: { value: string; label: string }[]; required?: boolean; help?: string };
export type Col = { key: string; label: string; type?: "text" | "money" | "bool" | "image" | "map" | "media" };
type Item = Record<string, unknown> & { _id: string };
type Variant = { id: string; label: string; image: string; description?: string };
const newId = () => Math.random().toString(36).slice(2, 10);
const isVideo = (u: string) => /\.(mp4|webm|mov)$/i.test(u);

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
      if (f.type === "images" || f.type === "videos") v[f.name] = Array.isArray(cur) ? cur : (item && typeof item.imageUrl === "string" && f.name === "images" ? [item.imageUrl] : []);
      else if (f.type === "variants") v[f.name] = Array.isArray(cur) ? cur : [];
      else if (f.type === "groups") v[f.name] = item ? groupsOf(item as never) : [];
      else if (f.type === "image") v[f.name] = typeof cur === "string" ? cur : "";
      else if (f.type === "bool") v[f.name] = cur === undefined ? (v[f.name] ?? (f.name === "available")) : Boolean(cur);
      else if (f.type === "media") v[f.name] = [];
      else if (f.name === "priceText") v[f.name] = item ? (item.priceMax ? `${item.price}-${item.priceMax}` : String(item.price ?? "")) : "";
      else v[f.name] = cur ?? v[f.name] ?? "";
    }
    setForm(v);
  }
  async function send(url: string, method: string, body: unknown) {
    const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    return { ok: r.ok, d: await r.json().catch(() => ({})) };
  }
  async function save(e: React.FormEvent) {
    e.preventDefault(); if (!form) return;
    setBusy(true); setErr("");
    const body: Record<string, unknown> = {};
    for (const f of fields) {
      const v = form[f.name];
      if (f.type === "number") body[f.name] = v === "" || v === null || v === undefined ? (f.required ? 0 : null) : Number(v);
      else if (f.type === "select" && !f.required) body[f.name] = v === "" ? null : v;
      else if (f.type === "variants") body[f.name] = ((v as Variant[]) || []).filter((x) => x.label.trim()).map((x) => ({ id: x.id, label: x.label.trim(), image: x.image || "", description: (x.description || "").trim() }));
      else if (f.type === "groups") body[f.name] = ((v as OptionGroup[]) || []).map((g) => ({ ...g, label: g.label.trim(), items: g.items.filter((x) => x.label.trim()).map((x) => ({ ...x, label: x.label.trim() })) })).filter((g) => g.label && g.items.length);
      else if (f.type === "text" || f.type === "textarea") body[f.name] = typeof v === "string" ? v : "";
      else if (f.type !== "media") body[f.name] = v;
    }
    let res = { ok: true, d: {} as { error?: string } };
    if (resource === "media") {
      const urls = (form.urls as string[]) || [];
      if (!urls.length) { setBusy(false); return setErr("Ajoutez au moins une photo ou vidéo."); }
      for (const u of urls) {
        res = await send("/api/admin/media", "POST", { url: u, kind: isVideo(u) ? "video" : "image", placement: form.placement, title: form.title || "" });
        if (!res.ok) break;
      }
    } else res = await send(`/api/admin/${resource}${editId ? "/" + editId : ""}`, editId ? "PATCH" : "POST", body);
    setBusy(false);
    if (!res.ok) return setErr(res.d.error || "Enregistrement impossible.");
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
    if (c.type === "money") return c.key === "price" ? priceLabel({ price: Number(it.price || 0), priceMax: it.priceMax as number | null, promoPrice: it.promoPrice as number | null }) + (it.promoPrice && !it.priceMax ? ` → ${fcfa(Number(it.promoPrice))}` : "") : fcfa(Number(v || 0));
    if (c.type === "bool") return v ? "Oui" : "Non";
    if (c.type === "image") { const u = productImage(it as never); return u ? <img src={u} alt="" /> : "—"; }
    if (c.type === "media") return isVideo(String(v)) ? <video src={String(v)} style={{ width: 60, height: 44 }} /> : <img src={String(v)} alt="" />;
    if (c.type === "map") return maps[c.key]?.[String(v)] || (typeof it.category === "string" && c.key === "categoryId" ? it.category : "—");
    if (Array.isArray(v)) return `${v.length}`;
    return v === undefined || v === null || v === "" ? "—" : String(v);
  };
  const set = (name: string, val: unknown) => setForm((p) => ({ ...(p || {}), [name]: val }));
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
                {f.type === "bool" ? <div className="check" style={{ marginTop: ".8rem" }}><input id={f.name} type="checkbox" checked={Boolean(form[f.name])} onChange={(e) => set(f.name, e.target.checked)} /><label htmlFor={f.name}>{f.label}</label></div> : <>
                  <label htmlFor={f.name}>{f.label}{f.required ? " *" : ""}</label>
                  {f.type === "textarea" ? <textarea id={f.name} rows={3} value={String(form[f.name] ?? "")} onChange={(e) => set(f.name, e.target.value)} />
                    : f.type === "select" ? <select id={f.name} value={String(form[f.name] ?? "")} onChange={(e) => set(f.name, e.target.value)} required={f.required}>{!f.required && <option value="">—</option>}{f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
                    : f.type === "images" ? <ImageUploader value={(form[f.name] as string[]) || []} onChange={(v) => set(f.name, v)} max={8} />
                    : f.type === "videos" ? <ImageUploader videoOnly max={4} value={(form[f.name] as string[]) || []} onChange={(v) => set(f.name, v)} />
                    : f.type === "image" ? <ImageUploader max={1} value={form[f.name] ? [String(form[f.name])] : []} onChange={(v) => set(f.name, v[0] || "")} />
                    : f.type === "media" ? <ImageUploader video max={30} value={(form.urls as string[]) || []} onChange={(v) => set("urls", v)} />
                    : f.type === "groups" ? <OptionGroupsEditor value={(form[f.name] as OptionGroup[]) || []} onChange={(v) => set(f.name, v)} />
                    : f.type === "variants" ? (
                      <div>
                        {((form[f.name] as Variant[]) || []).map((v, idx) => (
                          <div className="vrow" key={v.id}>
                            <div><input placeholder="Nom (ex. Sauce d'arachide)" value={v.label} maxLength={60} onChange={(e) => set(f.name, (form[f.name] as Variant[]).map((x, k) => k === idx ? { ...x, label: e.target.value } : x))} />
                              <textarea rows={2} placeholder="Description de cette association (ingrédients, taille…)" maxLength={600} value={v.description || ""} onChange={(e) => set(f.name, (form[f.name] as Variant[]).map((x, k) => k === idx ? { ...x, description: e.target.value } : x))} style={{ margin: ".4rem 0" }} />
                              <ImageUploader max={1} value={v.image ? [v.image] : []} onChange={(u) => set(f.name, (form[f.name] as Variant[]).map((x, k) => k === idx ? { ...x, image: u[0] || "" } : x))} /></div>
                            <span /><button type="button" className="btn btn-sm btn-danger" onClick={() => set(f.name, (form[f.name] as Variant[]).filter((_, k) => k !== idx))}><Trash2 size={14} /></button>
                          </div>))}
                        <button type="button" className="btn btn-sm btn-light" style={{ marginTop: ".5rem" }} onClick={() => set(f.name, [...((form[f.name] as Variant[]) || []), { id: newId(), label: "", image: "", description: "" }])}><Plus size={14} /> Ajouter une association</button>
                      </div>)
                    : <input id={f.name} type={f.type === "number" ? "number" : "text"} min={f.type === "number" ? 0 : undefined} step={f.type === "number" ? 1 : undefined} value={String(form[f.name] ?? "")} onChange={(e) => set(f.name, e.target.value)} required={f.required} />}
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
