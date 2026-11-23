export type Section = "restaurant" | "huile";
export type Role = "customer" | "staff" | "admin";

export type Product = {
  _id: string; name: string; description?: string; price: number; promoPrice?: number | null;
  section: Section; categoryId?: string | null; category?: string;
  images?: string[]; imageUrl?: string; available: boolean; featured?: boolean;
  format?: string; stock?: number | null; createdAt?: string;
  priceMax?: number | null; variants?: Variant[]; videos?: string[];
};
export type Variant = { id: string; label: string; image?: string; description?: string };
export type Category = { _id: string; name: string; section: Section; order: number; image?: string };
export type MediaItem = { _id: string; url: string; kind: "image" | "video"; placement: string; title?: string; createdAt?: string };
export type OrderItem = { productId: string; variantId?: string | null; variantLabel?: string | null; name: string; section: Section; quantity: number; unitPrice: number; image?: string | null };
export type HistoryEntry = { at: string; by: string; field: string; from?: string; to: string; note?: string };
export type Order = {
  _id: string; reference: string; userId?: string | null; customerName: string; phone: string;
  address: string; city?: string; notes?: string; section: string; items: OrderItem[];
  subtotal?: number; deliveryFee?: number; total: number;
  paymentMethod: "ussd" | "delivery"; operator?: string;
  location?: { latitude: number; longitude: number; accuracy?: number } | null;
  status: string; paymentStatus: string; deliveryStatus?: string;
  history?: HistoryEntry[]; createdAt: string;
};
export type AppUser = {
  id: string; firstName: string; lastName: string; email: string; phone: string;
  role: Role; address?: string; city?: string; avatar?: string;
};
