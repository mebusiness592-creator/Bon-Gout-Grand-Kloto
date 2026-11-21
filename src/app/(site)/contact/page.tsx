import type { Metadata } from "next";
import { getSettings } from "@/lib/settings";
import { MapPin, Phone, Mail, Clock, MessageCircle } from "lucide-react";
export const metadata: Metadata = { title: "Contact" };
export default async function Contact() {
  const s = await getSettings();
  const wa = s.whatsapp.replace(/[^0-9]/g, "");
  return (
    <div className="container section" style={{ maxWidth: 820 }}>
      <span className="eyebrow">Contact</span><h1>Parlons-nous</h1>
      <div className="panel" style={{ display: "grid", gap: ".9rem" }}>
        <span><MapPin size={16} /> {s.address}</span>
        {s.phone && <a href={`tel:${s.phone}`}><Phone size={16} /> {s.phone}</a>}
        {wa && <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer"><MessageCircle size={16} /> WhatsApp</a>}
        {s.email && <a href={`mailto:${s.email}`}><Mail size={16} /> {s.email}</a>}
        <span><Clock size={16} /> {s.hours || "Horaires à venir"}</span>
        {!s.phone && !s.email && <p className="muted">Les coordonnées seront bientôt renseignées.</p>}
      </div>
    </div>
  );
}
