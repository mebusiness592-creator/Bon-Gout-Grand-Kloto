import Link from "next/link";
import {
  Facebook,
  Instagram,
  Youtube,
  MessageCircle,
  Music2,
  Send,
  Twitter,
  Linkedin,
} from "lucide-react";
import type { Settings } from "@/lib/settings";

export function SiteFooter({ s }: { s: Settings }) {
  const socials = [
    { label: "Facebook", href: s.facebook, Icon: Facebook },
    { label: "Instagram", href: s.instagram, Icon: Instagram },
    { label: "TikTok", href: s.tiktok, Icon: Music2 },
    { label: "YouTube", href: s.youtube, Icon: Youtube },
    {
      label: "WhatsApp",
      href:
        s.whatsappLink ||
        (s.whatsapp ? `https://wa.me/${s.whatsapp.replace(/\\D/g, "")}` : ""),
      Icon: MessageCircle,
    },
    { label: "Telegram", href: s.telegram, Icon: Send },
    { label: "X", href: s.x, Icon: Twitter },
    { label: "LinkedIn", href: s.linkedin, Icon: Linkedin },
  ].filter((item) => item.href);

  const navLinks = [
    { href: "/restaurant", label: "Restaurant" },
    { href: "/menu", label: "Menu" },
    { href: "/production-locale", label: "Production locale" },
    { href: "/produits", label: "Nos produits" },
    { href: "/a-propos", label: "À propos" },
    { href: "/contact", label: "Contact" },
  ];

  const infoLinks = [
    { href: "/conditions", label: "Conditions générales" },
    { href: "/confidentialite", label: "Confidentialité" },
    { href: "/mon-compte", label: "Mon compte" },
  ];

  const hasContact = Boolean(s.address || s.phone || s.email || s.hours);

  return (
    <footer
      className="footer"
      style={{
        marginTop: "24px",
        padding: "20px 0 12px",
        fontSize: ".82rem",
        lineHeight: 1.45,
      }}
    >
      <div className="container">
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px 24px",
            paddingBottom: "12px",
            borderBottom: "1px solid rgba(233,217,197,.2)",
          }}
        >
          <div style={{ minWidth: "180px", flex: "1 1 220px" }}>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: ".98rem" }}>
              {s.name}
            </div>
            {s.tagline && (
              <p style={{ margin: "3px 0 0", opacity: 0.78, fontSize: ".78rem" }}>
                {s.tagline}
              </p>
            )}
          </div>

          <nav
            aria-label="Navigation de pied de page"
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "5px 14px",
              alignItems: "center",
            }}
          >
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                style={{ display: "inline", padding: 0, fontSize: ".8rem", opacity: 0.9 }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {(hasContact || infoLinks.length > 0 || socials.length > 0) && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "10px 20px",
              paddingTop: "10px",
            }}
          >
            {hasContact && (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: "4px 14px",
                  color: "#e9d9c5",
                  fontSize: ".76rem",
                }}
              >
                {s.address && <span>{s.address}</span>}
                {s.phone && (
                  <a href={`tel:${s.phone}`} style={{ display: "inline", padding: 0 }}>
                    {s.phone}
                  </a>
                )}
                {s.email && (
                  <a href={`mailto:${s.email}`} style={{ display: "inline", padding: 0 }}>
                    {s.email}
                  </a>
                )}
                {s.hours && <span>{s.hours}</span>}
              </div>
            )}

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: "5px 12px",
              }}
            >
              {infoLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{ display: "inline", padding: 0, fontSize: ".74rem", opacity: 0.8 }}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {socials.length > 0 && (
              <div
                className="footer-socials"
                aria-label="Réseaux sociaux"
                style={{ display: "flex", alignItems: "center", gap: "9px" }}
              >
                {socials.map(({ label, href, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    title={label}
                    style={{ display: "inline-flex", padding: 0, opacity: 0.85 }}
                  >
                    <Icon size={16} />
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        <p
          style={{
            margin: "10px 0 0",
            paddingTop: "8px",
            borderTop: "1px solid rgba(233,217,197,.14)",
            fontSize: ".7rem",
            opacity: 0.65,
            textAlign: "center",
          }}
        >
          © {new Date().getFullYear()} {s.name}. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}
