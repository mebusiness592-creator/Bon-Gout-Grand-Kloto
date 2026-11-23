import Link from "next/link";
import { Facebook, Instagram, Youtube, MessageCircle, Music2, Send, Twitter, Linkedin } from "lucide-react";
import type { Settings } from "@/lib/settings";

export function SiteFooter({ s }: { s: Settings }) {
  const socials = [
    { label: "Facebook", href: s.facebook, Icon: Facebook },
    { label: "Instagram", href: s.instagram, Icon: Instagram },
    { label: "TikTok", href: s.tiktok, Icon: Music2 },
    { label: "YouTube", href: s.youtube, Icon: Youtube },
    { label: "WhatsApp", href: s.whatsappLink || (s.whatsapp ? `https://wa.me/${s.whatsapp.replace(/\D/g, "")}` : ""), Icon: MessageCircle },
    { label: "Telegram", href: s.telegram, Icon: Send },
    { label: "X", href: s.x, Icon: Twitter },
    { label: "LinkedIn", href: s.linkedin, Icon: Linkedin },
  ].filter((item) => item.href);
  return (
    <footer className="footer">
      <div className="container">
        <div className="cols">
          <div><h4>{s.name}</h4><p>{s.tagline}</p></div>
          <div><h4>Navigation</h4><Link href="/restaurant">Restaurant</Link><Link href="/menu">Menu</Link><Link href="/production-locale">Production locale</Link><Link href="/produits">Nos produits</Link><Link href="/a-propos">À propos</Link><Link href="/contact">Contact</Link></div>
          <div><h4>Contact</h4><p>{s.address}</p>{s.phone && <a href={`tel:${s.phone}`}>{s.phone}</a>}{s.email && <a href={`mailto:${s.email}`}>{s.email}</a>}{s.hours && <p>{s.hours}</p>}</div>
          <div><h4>Informations</h4><Link href="/conditions">Conditions générales</Link><Link href="/confidentialite">Politique de confidentialité</Link><Link href="/mon-compte">Mon compte</Link></div>
        </div>
        {socials.length > 0 && (
          <div className="footer-socials" aria-label="Réseaux sociaux">
            {socials.map(({ label, href, Icon }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} title={label}>
                <Icon size={21} />
              </a>
            ))}
          </div>
        )}
        <p style={{ marginTop: "2rem", fontSize: ".8rem", opacity: .7 }}>© {new Date().getFullYear()} {s.name}. Tous droits réservés.</p>
      </div>
    </footer>
  );
}
