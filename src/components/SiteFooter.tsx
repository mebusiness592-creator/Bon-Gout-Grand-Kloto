import Link from "next/link";
import type { Settings } from "@/lib/settings";

export function SiteFooter({ s }: { s: Settings }) {
  return (
    <footer className="footer">
      <div className="container">
        <div className="cols">
          <div><h4>{s.name}</h4><p>{s.tagline}</p>
            {s.facebook && <a href={s.facebook} target="_blank" rel="noopener noreferrer">Facebook</a>}
            {s.instagram && <a href={s.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>}
            {s.tiktok && <a href={s.tiktok} target="_blank" rel="noopener noreferrer">TikTok</a>}
          </div>
          <div><h4>Navigation</h4><Link href="/restaurant">Restaurant</Link><Link href="/menu">Menu</Link><Link href="/production-locale">Production locale</Link><Link href="/produits">Nos produits</Link><Link href="/a-propos">À propos</Link><Link href="/contact">Contact</Link></div>
          <div><h4>Contact</h4><p>{s.address}</p>{s.phone && <a href={`tel:${s.phone}`}>{s.phone}</a>}{s.email && <a href={`mailto:${s.email}`}>{s.email}</a>}{s.hours && <p>{s.hours}</p>}</div>
          <div><h4>Informations</h4><Link href="/conditions">Conditions générales</Link><Link href="/confidentialite">Politique de confidentialité</Link><Link href="/mon-compte">Mon compte</Link></div>
        </div>
        <p style={{ marginTop: "2rem", fontSize: ".8rem", opacity: .7 }}>© {new Date().getFullYear()} {s.name}. Tous droits réservés.</p>
      </div>
    </footer>
  );
}
