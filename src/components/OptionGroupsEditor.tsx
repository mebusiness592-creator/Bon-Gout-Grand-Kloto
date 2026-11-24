"use client";
import { Plus, Trash2 } from "lucide-react";
import { ImageUploader } from "./ImageUploader";
import type { OptionGroup, OptionItem } from "@/lib/types";

const newId = () => Math.random().toString(36).slice(2, 10);
const num = (v: string): number | null => (v === "" ? null : Math.max(0, Math.round(Number(v)) || 0));

/** Éditeur des accompagnements d'un plat : groupes (Sauce, Viande…), accompagnements, prix minimum / maximum. */
export function OptionGroupsEditor({ value, onChange }: { value: OptionGroup[]; onChange: (v: OptionGroup[]) => void }) {
  const setGroup = (gi: number, patch: Partial<OptionGroup>) => onChange(value.map((g, k) => (k === gi ? { ...g, ...patch } : g)));
  const setItem = (gi: number, ii: number, patch: Partial<OptionItem>) => onChange(value.map((g, k) => (k === gi ? { ...g, items: g.items.map((it, j) => (j === ii ? { ...it, ...patch } : it)) } : g)));
  return (
    <div>
      {value.map((g, gi) => (
        <div key={g.id} className="panel" style={{ marginBottom: ".8rem", padding: ".9rem" }}>
          <div style={{ display: "flex", gap: ".5rem", alignItems: "center" }}>
            <input placeholder="Nom du groupe (ex. Type de sauce, Viande)" value={g.label} maxLength={60} onChange={(e) => setGroup(gi, { label: e.target.value })} />
            <button type="button" className="btn btn-sm btn-danger" aria-label="Supprimer le groupe" onClick={() => onChange(value.filter((_, k) => k !== gi))}><Trash2 size={14} /></button>
          </div>
          <div className="check" style={{ marginTop: ".5rem" }}><input id={`req${g.id}`} type="checkbox" checked={Boolean(g.required)} onChange={(e) => setGroup(gi, { required: e.target.checked })} /><label htmlFor={`req${g.id}`}>Choix obligatoire</label></div>
          <div className="check"><input id={`mul${g.id}`} type="checkbox" checked={Boolean(g.multiple)} onChange={(e) => setGroup(gi, { multiple: e.target.checked })} /><label htmlFor={`mul${g.id}`}>Le client peut choisir plusieurs éléments</label></div>
          {g.items.map((it, ii) => (
            <div key={it.id} className="vrow" style={{ alignItems: "start" }}>
              <div>
                <input placeholder="Nom (ex. Sauce d'arachide)" value={it.label} maxLength={80} onChange={(e) => setItem(gi, ii, { label: e.target.value })} />
                <textarea rows={2} placeholder="Description (facultatif)" maxLength={600} value={it.description || ""} onChange={(e) => setItem(gi, ii, { description: e.target.value })} style={{ margin: ".4rem 0" }} />
                <div className="row2">
                  <div><label>Prix minimum (FCFA)</label><input type="number" min={0} step={50} value={it.priceMin ?? ""} onChange={(e) => setItem(gi, ii, { priceMin: num(e.target.value) })} /></div>
                  <div><label>Prix maximum (FCFA)</label><input type="number" min={0} step={50} value={it.priceMax ?? ""} onChange={(e) => setItem(gi, ii, { priceMax: num(e.target.value) })} /></div>
                </div>
                <small className="muted">Vide = pas de champ de prix (inclus). Un seul prix = prix fixe. Minimum + maximum = le client saisit son montant dans cet intervalle.</small>
                <ImageUploader max={1} value={it.image ? [it.image] : []} onChange={(u) => setItem(gi, ii, { image: u[0] || "" })} />
              </div>
              <span />
              <button type="button" className="btn btn-sm btn-danger" aria-label="Supprimer" onClick={() => setGroup(gi, { items: g.items.filter((_, j) => j !== ii) })}><Trash2 size={14} /></button>
            </div>))}
          <button type="button" className="btn btn-sm btn-light" style={{ marginTop: ".5rem" }} onClick={() => setGroup(gi, { items: [...g.items, { id: newId(), label: "", image: "", description: "", priceMin: null, priceMax: null }] })}><Plus size={14} /> Ajouter un élément</button>
        </div>))}
      <button type="button" className="btn btn-sm btn-light" onClick={() => onChange([...value, { id: newId(), label: "", required: false, multiple: false, items: [{ id: newId(), label: "", image: "", description: "", priceMin: null, priceMax: null }] }])}><Plus size={14} /> Ajouter un groupe d&apos;accompagnements</button>
    </div>
  );
}
