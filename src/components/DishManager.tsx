"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, Pencil, Plus, Trash2, X } from "lucide-react";
import { ImageUploader } from "./ImageUploader";
import { OptionGroupsEditor } from "./OptionGroupsEditor";
import { DISH_CSS } from "./OrderBlocks";
import { groupsOf } from "@/lib/options";
import { priceLabel, productImage } from "@/lib/pricing";
import type { OptionGroup, OptionItem, Product } from "@/lib/types";

type Mode = "variant" | "sauce" | "extra";
type Form = {
  name: string; description: string; categoryId: string; priceMin: string; priceMax: string; promoPrice: string;
  main: string; gallery: string[]; videos: string[];
  variants: OptionItem[]; sauces: OptionItem[]; extras: OptionItem[]; others: OptionGroup[];
  vReq: boolean; sMulti: boolean; sReq: boolean; eMulti: boolean; eReq: boolean;
  mealTime: string; available: boolean; featured: boolean;
};
const newId = () => Math.random().toString(36).slice(2, 10);
const blank = (mode: Mode): OptionItem => ({ id: newId(), label: "", description: "", image: "", priceMin: null, priceMax: null, ...(mode === "sauce" ? { free: true } : {}) });
const num = (v: string): number | null => (v === "" ? null : Math.max(0, Math.round(Number(v)) || 0));
const isVideo = (u: string) => /\.(mp4|webm|mov)(\?.*)?$/i.test(u);

function toForm(item?: Product): Form {
  const groups = item ? groupsOf(item) : [];
  const legacy = groups.find((g) => g.id === "legacy"); // anciennes « variantes »
  const find = (r: string) => groups.find((g) => g.role === r)?.items || [];
  const hasVariants = find("variant").length > 0 || Boolean(legacy?.items.length);
  const imgs = item ? (item.images?.length ? item.images : item.imageUrl ? [item.imageUrl] : []) : [];
  return {
    name: item?.name || "", description: item?.description || "", categoryId: item?.categoryId || "",
    priceMin: item && !hasVariants ? String(item.price ?? "") : "", priceMax: item && !hasVariants && item.priceMax ? String(item.priceMax) : "", promoPrice: item && !hasVariants && item.promoPrice ? String(item.promoPrice) : "",
    main: imgs[0] || "", gallery: imgs.slice(1), videos: item?.videos || [],
    variants: find("variant").length ? find("variant") : (legacy ? legacy.items : []),
    sauces: find("sauce").map((i) => ({ ...i, free: i.free ?? typeof i.priceMin !== "number" })),
    extras: find("extra"),
    others: groups.filter((g) => !g.role && g.id !== "legacy"),
    vReq: groups.find((g) => g.role === "variant")?.required ?? true,
    sMulti: groups.find((g) => g.role === "sauce")?.multiple ?? true, sReq: groups.find((g) => g.role === "sauce")?.required ?? false,
    eMulti: groups.find((g) => g.role === "extra")?.multiple ?? true, eReq: groups.find((g) => g.role === "extra")?.required ?? false,
    mealTime: item?.mealTime || "", available: item ? item.available !== false : true, featured: Boolean(item?.featured),
  };
}

function Section({ n, title, hint, count, open: o0, force = 0, children }: { n: number; title: string; hint?: string; count?: number; open?: boolean; force?: number; children: React.ReactNode }) {
  const [open, setOpen] = useState(Boolean(o0));
  useEffect(() => { if (force) setOpen(true); }, [force]);
  return (
    <section className="dsec">
      <button type="button" className="dsec-h" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span className="dsec-n">{n}</span>
        <span className="dsec-t"><strong>{title}</strong>{hint && <small>{hint}</small>}</span>
        {typeof count === "number" && count > 0 && <span className="dsec-c">{count}</span>}
        {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>
      {open && <div className="dsec-b">{children}</div>}
    </section>
  );
}

/** Règles d'un groupe : plusieurs choix possibles ? choix obligatoire ? */
function GroupRules({ idp, multi, req, onMulti, onReq }: { idp: string; multi?: boolean; req: boolean; onMulti?: (v: boolean) => void; onReq: (v: boolean) => void }) {
  return (
    <div style={{ display: "grid", gap: ".2rem", margin: ".7rem 0 .3rem", padding: ".6rem .8rem", border: "1px solid var(--line)", borderRadius: 12, background: "#fffdf9" }}>
      {onMulti ? <div className="check"><input id={`${idp}-m`} type="checkbox" checked={Boolean(multi)} onChange={(e) => onMulti(e.target.checked)} /><label htmlFor={`${idp}-m`}><strong>Le client peut choisir plusieurs éléments</strong> <small className="muted">(décoché : un seul choix)</small></label></div>
        : <small className="muted">Le client ne peut choisir qu&apos;une seule variante.</small>}
      <div className="check"><input id={`${idp}-r`} type="checkbox" checked={req} onChange={(e) => onReq(e.target.checked)} /><label htmlFor={`${idp}-r`}><strong>Choix obligatoire</strong> <small className="muted">(le client doit choisir avant d&apos;ajouter au panier)</small></label></div>
    </div>
  );
}

/** Liste d'éléments (variantes / sauces / viandes-poissons-accompagnements) avec nom, description, image et prix. */
function ItemsEditor({ mode, items, onChange, addLabel }: { mode: Mode; items: OptionItem[]; onChange: (v: OptionItem[]) => void; addLabel: string }) {
  const set = (i: number, patch: Partial<OptionItem>) => onChange(items.map((it, k) => (k === i ? { ...it, ...patch } : it)));
  return (
    <div>
      {items.map((it, i) => {
        const showPrice = mode === "extra" || mode === "variant" || (mode === "sauce" && it.free === false);
        return (
          <div className="ditem" key={it.id}>
            <div className="ditem-top">
              <input placeholder={mode === "variant" ? "Nom de la variante (ex. Igname)" : mode === "sauce" ? "Nom de la sauce (ex. Arachide)" : "Nom (ex. Poulet, Poisson braisé, Alloco)"} value={it.label} maxLength={80} onChange={(e) => set(i, { label: e.target.value })} />
              <button type="button" className="btn btn-sm btn-danger" aria-label="Supprimer" onClick={() => onChange(items.filter((_, k) => k !== i))}><Trash2 size={14} /></button>
            </div>
            <textarea rows={2} placeholder="Description (facultatif)" maxLength={600} value={it.description || ""} onChange={(e) => set(i, { description: e.target.value })} style={{ margin: ".5rem 0" }} />
            {mode === "sauce" && (
              <div className="free">
                <input id={`free${it.id}`} type="checkbox" checked={it.free !== false} onChange={(e) => set(i, e.target.checked ? { free: true, priceMin: null, priceMax: null } : { free: false })} />
                <label htmlFor={`free${it.id}`}><strong>Exclusive / Gratuite</strong> — sans supplément (décochez pour rendre cette sauce payante)</label>
              </div>)}
            {showPrice && (
              <div className="dpricebox">
                <div className="dgrid two">
                  <div><label>Prix minimum (FCFA){mode === "variant" ? " *" : ""}</label><input type="number" min={0} step={50} value={it.priceMin ?? ""} onChange={(e) => set(i, { priceMin: num(e.target.value) })} required={mode === "variant" || mode === "extra" || (mode === "sauce" && it.free === false)} /></div>
                  <div><label>Prix maximum (FCFA)</label><input type="number" min={0} step={50} value={it.priceMax ?? ""} onChange={(e) => set(i, { priceMax: num(e.target.value) })} /></div>
                </div>
                <small className="muted">{mode === "variant" ? "Chaque variante doit avoir son propre prix. Le prix du plat principal ne sera plus utilisé." : "Le client indique le montant qu'il veut payer, entre le minimum et le maximum. Un seul prix = prix fixe."}</small>
              </div>)}
            <label>Image</label>
            <ImageUploader max={1} value={it.image ? [it.image] : []} onChange={(u) => set(i, { image: u[0] || "" })} />
          </div>);
      })}
      <button type="button" className="btn btn-sm btn-light" style={{ marginTop: ".7rem" }} onClick={() => onChange([...items, blank(mode)])}><Plus size={14} /> {addLabel}</button>
    </div>
  );
}

export function DishManager({ items, categories }: { items: Product[]; categories: { _id: string; name: string }[] }) {
  const router = useRouter();
  const [f, setF] = useState<Form | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  const [errTick, setErrTick] = useState(0); const [errSec, setErrSec] = useState<number | null>(null);
  const errRef = useRef<HTMLDivElement>(null);
  // Affiche l'erreur, ouvre la section concernée et fait défiler jusqu'au message.
  const fail = (m: string, sec: number | null = null) => { setErr(m); setErrSec(sec); setErrTick((t) => t + 1); };
  useEffect(() => {
    if (!errTick) return;
    const t = setTimeout(() => errRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 150);
    return () => clearTimeout(t);
  }, [errTick]);
  const secOf = (m: string): number | null => (/^Variante/.test(m) ? 3 : /^Sauce/.test(m) ? 4 : /^Viande/.test(m) ? 5 : /nom du plat|prix minimum du plat|prix maximum doit/i.test(m) ? 1 : /sauce/i.test(m) ? 4 : null);
  const catName = Object.fromEntries(categories.map((c) => [c._id, c.name]));
  const set = (patch: Partial<Form>) => setF((p) => (p ? { ...p, ...patch } : p));
  const open = (it?: Product) => { setErr(""); setEditId(it?._id || null); setF(toForm(it)); };

  function check(x: Form): string {
    if (x.name.trim().length < 2) return "Indiquez le nom du plat.";
    const mn = num(x.priceMin), mx = num(x.priceMax);
    if (!x.variants.length) {
      if (mn === null) return "Indiquez le prix minimum du plat.";
      if (mx !== null && mx <= mn) return "Le prix maximum doit être supérieur au prix minimum (ou laissez-le vide pour un prix fixe).";
    }
    const rng = (it: OptionItem, req: boolean, what: string) => {
      if (!it.label.trim()) return `${what} : un nom est manquant.`;
      if (req && typeof it.priceMin !== "number") return `${what} « ${it.label} » : indiquez le prix minimum et maximum.`;
      if (typeof it.priceMin === "number" && typeof it.priceMax === "number" && it.priceMax < it.priceMin) return `${what} « ${it.label} » : le maximum doit être supérieur ou égal au minimum.`;
      return "";
    };
    for (const it of x.variants) { const e = rng(it, true, "Variante"); if (e) return e; }
    for (const it of x.sauces) { const e = rng(it, it.free === false, "Sauce"); if (e) return e; }
    for (const it of x.extras) { const e = rng(it, true, "Viande / poisson / accompagnement"); if (e) return e; }
    return "";
  }
  async function save(e: React.FormEvent) {
    e.preventDefault(); if (!f) return;
    const bad = check(f); if (bad) return fail(bad, secOf(bad));
    const clean = (list: OptionItem[]) => list.filter((i) => i.label.trim()).map((i) => ({ ...i, label: i.label.trim(), description: (i.description || "").trim(), image: i.image || "" }));
    const groups: OptionGroup[] = [];
    if (f.variants.length) groups.push({ id: "variants", label: "Variante", role: "variant", required: f.vReq, multiple: false, items: clean(f.variants) });
    if (f.sauces.length) groups.push({ id: "sauces", label: "Sauces", role: "sauce", required: f.sReq, multiple: f.sMulti, items: clean(f.sauces).map((i) => (i.free !== false ? { ...i, free: true, priceMin: null, priceMax: null } : { ...i, free: false })) });
    if (f.extras.length) groups.push({ id: "extras", label: "Viandes, poissons et accompagnements", role: "extra", required: f.eReq, multiple: f.eMulti, items: clean(f.extras) });
    groups.push(...f.others.map((g) => ({ ...g, label: g.label.trim(), items: g.items.filter((x) => x.label.trim()).map((x) => ({ ...x, label: x.label.trim() })) })).filter((g) => g.label && g.items.length));
    const mn = num(f.priceMin) as number, mx = num(f.priceMax);
    const body = {
      name: f.name.trim(), description: f.description.trim(), categoryId: f.categoryId || null,
      priceText: f.variants.length ? "0" : (mx !== null && mx > mn ? `${mn}-${mx}` : String(mn)),
      promoPrice: f.variants.length ? null : num(f.promoPrice),
      images: [f.main, ...f.gallery].filter(Boolean), videos: f.videos, mealTime: f.mealTime || null,
      optionGroups: groups, available: f.available, featured: f.featured,
    };
    setBusy(true); setErr(""); setErrSec(null);
    const r = await fetch(`/api/admin/plats${editId ? "/" + editId : ""}`, { method: editId ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const d = await r.json().catch(() => ({}));
    setBusy(false);
    if (!r.ok) { const m = d.error || "Enregistrement impossible."; return fail(m, secOf(m)); }
    setF(null); router.refresh();
  }
  async function del(it: Product) {
    if (!confirm(`Supprimer définitivement « ${it.name} » ?`)) return;
    const r = await fetch(`/api/admin/plats/${it._id}`, { method: "DELETE" });
    if (r.ok) router.refresh(); else alert((await r.json().catch(() => ({}))).error || "Suppression impossible.");
  }
  async function toggle(it: Product) {
    await fetch(`/api/admin/plats/${it._id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ available: !it.available }) });
    router.refresh();
  }

  return (
    <div>
      <style dangerouslySetInnerHTML={{ __html: DISH_CSS }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: ".6rem", flexWrap: "wrap" }}>
        <h1 style={{ fontSize: "1.7rem", margin: 0 }}>Gestion du restaurant</h1>
        <button className="btn btn-primary btn-sm" onClick={() => open()}><Plus size={16} /> Ajouter un plat</button>
      </div>
      <div className="scroll" style={{ marginTop: "1rem" }}>
        <table className="tbl"><thead><tr><th>Photo</th><th>Plat</th><th>Spécialité</th><th>Prix</th><th>Dispo</th><th /></tr></thead>
          <tbody>
            {items.length === 0 && <tr><td colSpan={6} className="muted">Aucun plat pour le moment.</td></tr>}
            {items.map((it) => {
              const g = groupsOf(it);
              const n = (r: string) => g.find((x) => x.role === r)?.items.length || 0;
              return (
                <tr key={it._id}>
                  <td>{productImage(it) ? <img src={productImage(it)} alt="" /> : "—"}</td>
                  <td><strong>{it.name}</strong><div className="dchips">{n("variant") > 0 && <span className="dchip">{n("variant")} variante(s)</span>}{n("sauce") > 0 && <span className="dchip">{n("sauce")} sauce(s)</span>}{n("extra") > 0 && <span className="dchip">{n("extra")} accompagnement(s)</span>}</div></td>
                  <td>{(it.categoryId && catName[it.categoryId]) || it.category || "—"}</td>
                  <td>{g.some((x) => x.role === "variant" && x.items.length > 0) ? "Selon variante" : priceLabel(it)}</td><td>{it.available ? "Oui" : "Non"}</td>
                  <td style={{ whiteSpace: "nowrap", textAlign: "right" }}>
                    <button className="btn btn-sm btn-light" onClick={() => toggle(it)}>{it.available ? "Désactiver" : "Activer"}</button>{" "}
                    <button className="btn btn-sm btn-light" aria-label="Modifier" onClick={() => open(it)}><Pencil size={14} /></button>{" "}
                    <button className="btn btn-sm btn-danger" aria-label="Supprimer" onClick={() => del(it)}><Trash2 size={14} /></button>
                  </td>
                </tr>);
            })}
          </tbody></table>
      </div>

      {f && (
        <div className="modal" onClick={(e) => { if (e.target === e.currentTarget) setF(null); }}>
          <form className="box dish-sheet" onSubmit={save}>
            <div className="dish-head"><h2>{editId ? "Modifier le plat" : "Nouveau plat"}</h2><button type="button" className="xbtn" aria-label="Fermer" onClick={() => setF(null)}><X size={22} /></button></div>
            <div className="dish-body">
              {err && <div ref={errRef} tabIndex={-1} className="err" role="alert" style={{ margin: 0, fontWeight: 700 }}>⚠️ {err}</div>}

              <Section n={1} force={errSec === 1 ? errTick : 0} title="Informations et prix" hint="Nom, description, spécialité, prix" open>
                <label htmlFor="d-name">Nom du plat *</label><input id="d-name" value={f.name} maxLength={120} onChange={(e) => set({ name: e.target.value })} placeholder="Ex. : Fufu" required />
                <label htmlFor="d-desc">Description</label><textarea id="d-desc" rows={3} value={f.description} maxLength={2000} onChange={(e) => set({ description: e.target.value })} />
                <label htmlFor="d-cat">Spécialité</label>
                <select id="d-cat" value={f.categoryId} onChange={(e) => set({ categoryId: e.target.value })}><option value="">—</option>{categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}</select>
                {f.variants.length === 0 ? <>
                  <div className="dgrid three">
                    <div><label htmlFor="d-min">Prix minimum (FCFA) *</label><input id="d-min" type="number" min={0} step={50} value={f.priceMin} onChange={(e) => set({ priceMin: e.target.value })} required /></div>
                    <div><label htmlFor="d-max">Prix maximum (FCFA)</label><input id="d-max" type="number" min={0} step={50} value={f.priceMax} onChange={(e) => set({ priceMax: e.target.value })} /></div>
                    <div><label htmlFor="d-promo">Prix promotionnel</label><input id="d-promo" type="number" min={0} step={50} value={f.promoPrice} onChange={(e) => set({ promoPrice: e.target.value })} /></div>
                  </div>
                  <small className="muted">Maximum vide = prix fixe. Avec un maximum, le client indique son montant entre les deux (la promotion ne s&apos;applique qu&apos;aux prix fixes).</small>
                </> : <p className="muted" style={{ margin: ".5rem 0" }}>Ce plat possède des variantes : le prix du plat principal est désactivé. Chaque variante doit avoir son propre prix.</p>}
              </Section>

              <Section n={2} force={errSec === 2 ? errTick : 0} title="Photos et vidéo" hint="Image principale, galerie, vidéo facultative" count={(f.main ? 1 : 0) + f.gallery.length + f.videos.length} open>
                <label>Image principale</label>
                <ImageUploader max={1} value={f.main && !isVideo(f.main) ? [f.main] : []} onChange={(v) => set({ main: v[0] || "" })} />
                <label>Galerie de photos</label>
                <ImageUploader max={7} value={f.gallery} onChange={(v) => set({ gallery: v })} />
                <label>Vidéo (facultatif)</label>
                <ImageUploader videoOnly max={4} value={f.videos} onChange={(v) => set({ videos: v })} />
                <small className="muted">L&apos;image principale, la galerie et la vidéo défilent automatiquement sur la fiche du plat. Vidéo : MP4, WebM ou MOV, 80 Mo maximum.</small>
              </Section>

              <Section n={3} force={errSec === 3 ? errTick : 0} title="Variantes du plat" hint="Ex. : Fufu → igname, manioc, plantain" count={f.variants.length} open={f.variants.length > 0}>
                <p className="muted" style={{ margin: ".6rem 0 0" }}>Dès que vous ajoutez une première variante, le prix du plat principal est automatiquement supprimé. Chaque variante doit avoir son propre prix minimum et peut avoir un prix maximum.</p>
                <GroupRules idp="gv" req={f.vReq} onReq={(v) => set({ vReq: v })} />
                <ItemsEditor mode="variant" items={f.variants} onChange={(v) => set({ variants: v, ...(v.length ? { priceMin: "", priceMax: "", promoPrice: "" } : {}) })} addLabel="Ajouter une variante" />
              </Section>

              <Section n={4} force={errSec === 4 ? errTick : 0} title="Sauces" hint="Autant de sauces que vous voulez — le client peut en choisir plusieurs" count={f.sauces.length} open={f.sauces.length > 0}>
                <GroupRules idp="gs" multi={f.sMulti} req={f.sReq} onMulti={(v) => set({ sMulti: v })} onReq={(v) => set({ sReq: v })} />
                <ItemsEditor mode="sauce" items={f.sauces} onChange={(v) => set({ sauces: v })} addLabel="Ajouter une sauce" />
              </Section>

              <Section n={5} force={errSec === 5 ? errTick : 0} title="Viandes, poissons et accompagnements" hint="Le client en choisit plusieurs et saisit le montant de chacun" count={f.extras.length} open={f.extras.length > 0}>
                <GroupRules idp="ge" multi={f.eMulti} req={f.eReq} onMulti={(v) => set({ eMulti: v })} onReq={(v) => set({ eReq: v })} />
                <ItemsEditor mode="extra" items={f.extras} onChange={(v) => set({ extras: v })} addLabel="Ajouter un élément" />
              </Section>

              <Section n={6} force={errSec === 6 ? errTick : 0} title="Options avancées" hint="Disponibilité, mise en avant, notifications, autres groupes" count={f.others.length || undefined} open={f.others.length > 0}>
                <div className="check" style={{ marginTop: ".8rem" }}><input id="d-av" type="checkbox" checked={f.available} onChange={(e) => set({ available: e.target.checked })} /><label htmlFor="d-av">Disponible à la commande</label></div>
                <div className="check"><input id="d-ft" type="checkbox" checked={f.featured} onChange={(e) => set({ featured: e.target.checked })} /><label htmlFor="d-ft">Mettre en avant (plat populaire)</label></div>
                <label htmlFor="d-meal">Moment de la journée (notifications automatiques)</label>
                <select id="d-meal" value={f.mealTime} onChange={(e) => set({ mealTime: e.target.value })}><option value="">— Non utilisé —</option><option value="matin">Petit-déjeuner (matin)</option><option value="midi">Déjeuner (midi)</option><option value="soir">Dîner (soir)</option></select>
                <h4 style={{ margin: "1rem 0 .3rem" }}>Autres groupes de choix (ex. Boissons, Suppléments)</h4><small className="muted">Créez vos propres groupes : vous décidez s&apos;ils sont obligatoires et si le client peut choisir plusieurs éléments.</small><OptionGroupsEditor value={f.others} onChange={(v) => set({ others: v })} />
              </Section>
            </div>
            <div className="dfoot">
              {err && <span style={{ marginRight: "auto", color: "#991b1b", fontSize: ".82rem", fontWeight: 700, maxWidth: "60%", lineHeight: 1.25 }}>⚠️ {err}</span>}
              <button type="button" className="btn btn-light" onClick={() => setF(null)}>Annuler</button>
              <button className="btn btn-primary" disabled={busy}>{busy ? "Enregistrement…" : "Enregistrer le plat"}</button>
            </div>
          </form>
        </div>)}
    </div>
  );
}