export const ORDER_STATUS: Record<string, string> = {
  pending: "Nouvelle", confirmed: "Confirmée", preparing: "En préparation",
  delivering: "En livraison", delivered: "Terminée", cancelled: "Annulée",
};
export const PAYMENT_STATUS: Record<string, string> = {
  pending: "En attente", awaiting_verification: "En attente de vérification", paid: "Payé et vérifié",
  failed: "Échoué", cancelled: "Annulé", cod: "Paiement à la livraison", unpaid: "En attente",
};
export const DELIVERY_STATUS: Record<string, string> = {
  to_prepare: "À préparer", ready: "Prête", awaiting_delivery: "En attente de livraison",
  in_delivery: "En cours de livraison", delivered: "Livrée", failed: "Livraison échouée",
};
export const ROLE_LABEL: Record<string, string> = { customer: "Client", staff: "Employé", admin: "Administrateur" };
export const SECTION_LABEL: Record<string, string> = { restaurant: "Restaurant", huile: "Production locale", mixte: "Mixte" };
export const PLACEMENTS: Record<string, string> = {
  "accueil-restaurant": "Bannière du restaurant (défile toutes les 4,5 s)", restaurant: "Présentation du restaurant",
  "production-locale": "Bannière des produits locaux (défile toutes les 4,5 s)", galerie: "Galerie générale",
};

/** Couleur (tone) de chaque statut : un statut = une couleur distincte. */
export const ORDER_TONE: Record<string, string> = { pending: "orange", confirmed: "blue", preparing: "violet", delivering: "indigo", delivered: "green", cancelled: "red" };
export const PAYMENT_TONE: Record<string, string> = { pending: "gray", awaiting_verification: "amber", paid: "green", failed: "red", cancelled: "slate", cod: "blue", unpaid: "gray" };
export const DELIVERY_TONE: Record<string, string> = { to_prepare: "orange", ready: "teal", awaiting_delivery: "amber", in_delivery: "indigo", delivered: "green", failed: "red" };
export const TONE_COLOR: Record<string, string> = { orange: "#c2410c", blue: "#1d4ed8", violet: "#6d28d9", indigo: "#4338ca", green: "#15803d", red: "#b91c1c", amber: "#a16207", teal: "#0f766e", gray: "#64748b", slate: "#334155" };
