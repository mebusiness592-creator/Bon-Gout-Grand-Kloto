export type Section = "restaurant" | "huile";
export type Product = {
  _id?: string; name: string; description: string; price: number; section: Section;
  imageUrl?: string; available: boolean; category?: string; createdAt?: string;
};
export type Order = {
  _id?: string; reference: string; customerName: string; phone: string; address: string;
  section: Section; items: { productId: string; name: string; quantity: number; unitPrice: number }[];
  total: number; paymentMethod: "ussd" | "delivery"; operator?: string;
  location?: { latitude: number; longitude: number; accuracy?: number };
  status: "pending" | "confirmed" | "preparing" | "delivering" | "delivered" | "cancelled";
  paymentStatus: "unpaid" | "pending" | "paid"; createdAt: string;
};
