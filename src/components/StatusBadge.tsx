import { DELIVERY_STATUS, DELIVERY_TONE, ORDER_STATUS, ORDER_TONE, PAYMENT_STATUS, PAYMENT_TONE } from "@/lib/labels";

const MAP = {
  order: [ORDER_STATUS, ORDER_TONE, "Commande"], payment: [PAYMENT_STATUS, PAYMENT_TONE, "Paiement"], delivery: [DELIVERY_STATUS, DELIVERY_TONE, "Livraison"],
} as const;

/** Pastille de statut : couleur + bordure propres à chaque statut. */
export function StatusBadge({ kind, value, withKind }: { kind: "order" | "payment" | "delivery"; value?: string; withKind?: boolean }) {
  const [labels, tones, name] = MAP[kind];
  const v = value || (kind === "delivery" ? "to_prepare" : "");
  if (!v) return null;
  return <span className={`st ${tones[v] || "gray"}`} title={name}>{withKind ? `${name} : ` : ""}{labels[v] || v}</span>;
}
