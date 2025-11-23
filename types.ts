export enum Currency {
  PKR = 'PKR',
  INR = 'INR',
  USD = 'USD',
  AED = 'AED'
}

export const CurrencySymbols: Record<Currency, string> = {
  [Currency.PKR]: '₨',
  [Currency.INR]: '₹',
  [Currency.USD]: '$',
  [Currency.AED]: 'AED'
};

export interface InventoryItem {
  id: string;
  name: string;
  buyPrice: number;
  sellPrice: number;
  taxPercent: number;
  stock: number;
  unit: string;
}

export interface Party {
  id: string;
  name: string;
  phone: string;
  type: 'Customer' | 'Supplier';
  balance: number;
  address?: string;
}

export interface CartItem extends InventoryItem {
  quantity: number;
  discountPercent: number;
}

export interface Invoice {
  id: string;
  date: string;
  partyId: string;
  partyName: string;
  items: CartItem[];
  subTotal: number;
  totalTax: number;
  totalDiscount: number;
  grandTotal: number;
}

export interface AppSettings {
  currency: Currency;
  taxName: string; // e.g., GST, VAT
  businessName: string;
  businessAddress: string;
  theme: 'light' | 'dark';
}

export interface AppState {
  inventory: InventoryItem[];
  parties: Party[];
  invoices: Invoice[];
  settings: AppSettings;
}

export type Action =
  | { type: 'ADD_ITEM'; payload: InventoryItem }
  | { type: 'UPDATE_ITEM'; payload: InventoryItem }
  | { type: 'DELETE_ITEM'; payload: string }
  | { type: 'ADD_PARTY'; payload: Party }
  | { type: 'UPDATE_PARTY'; payload: Party }
  | { type: 'DELETE_PARTY'; payload: string }
  | { type: 'CREATE_INVOICE'; payload: Invoice }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppSettings> }
  | { type: 'RESTORE_DATA'; payload: AppState }
  | { type: 'RESET_DATA' };