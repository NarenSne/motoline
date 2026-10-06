export interface Order {
  products: string[];
  address: {
    street: string;
    complement?: string;
    department?: string;
    city: string;
    zip: string;
  };
  totalPrice: number;
  shippingCost?: number;
  trackingNumber?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerDocumentType?: string;
  customerCedula?: string;
  total: number;
  date: Date;
  _id: string;
  user: string;
  status: 'pending' | 'accepted' | 'rejected';
  uniqueProductIds: string[];
  uniqueProducts: any[];
  items:any[];
}
