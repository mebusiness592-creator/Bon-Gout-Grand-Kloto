import { getDb } from "./db";

export type Settings = {
  name: string; tagline: string; phone: string; whatsapp: string; email: string; address: string; hours: string;
  deliveryFee: number; freeDeliveryFrom: number; deliveryNote: string;
  allowCod: boolean; allowUssd: boolean; paymentInstructions: string;
  facebook: string; instagram: string; tiktok: string; notifyNewOrders: boolean;
};
export const defaultSettings: Settings = {
  name: "BON GOÛT DU GRAND KLOTO", tagline: "Cuisine africaine & européenne, fast-food et produits locaux",
  phone: "", whatsapp: "", email: "", address: "Grand Kloto, Togo", hours: "",
  deliveryFee: 0, freeDeliveryFrom: 0, deliveryNote: "Livraison selon les conditions disponibles dans votre zone.",
  allowCod: true, allowUssd: true,
  paymentInstructions: "Composez le code USSD, validez le paiement avec votre code secret, puis revenez confirmer. Votre commande reste « en attente de vérification » jusqu'à contrôle par notre équipe.",
  facebook: "", instagram: "", tiktok: "", notifyNewOrders: true,
};
export async function getSettings(): Promise<Settings> {
  try {
    const doc = await (await getDb()).collection("settings").findOne({ _id: "main" as never });
    const { _id, ...rest } = (doc || {}) as Record<string, unknown>;
    void _id;
    return { ...defaultSettings, ...(rest as Partial<Settings>) };
  } catch {
    return defaultSettings;
  }
}
