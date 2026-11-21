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
