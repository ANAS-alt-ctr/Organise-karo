import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AppState, Action, Currency, InventoryItem, Party, Invoice } from '../types';

// Use a factory function to ensure we always get a fresh copy of the initial state
// This prevents reference issues when resetting data
const getInitialState = (): AppState => ({
  inventory: [
    { id: '1', name: 'Wireless Mouse', buyPrice: 500, sellPrice: 800, taxPercent: 5, stock: 50, unit: 'pcs' },
    { id: '2', name: 'Mechanical Keyboard', buyPrice: 3000, sellPrice: 4500, taxPercent: 10, stock: 20, unit: 'pcs' },
  ],
  parties: [
    { id: '1', name: 'Tech Solutions Ltd', phone: '+92 300 1234567', type: 'Customer', balance: 0, address: 'Lahore, Pakistan' },
    { id: '2', name: 'Global Importers', phone: '+92 321 7654321', type: 'Supplier', balance: 50000, address: 'Karachi, Pakistan' },
  ],
  invoices: [],
  settings: {
    currency: Currency.PKR,
    taxName: 'GST',
    businessName: 'My Business Store',
    businessAddress: '123 Market Road, City Center',
    theme: 'light',
  },
});

export const STORAGE_KEY = 'organise_karo_data_v1';

const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'ADD_ITEM':
      return { ...state, inventory: [...state.inventory, action.payload] };
    case 'UPDATE_ITEM':
      return {
        ...state,
        inventory: state.inventory.map((item) => (item.id === action.payload.id ? action.payload : item)),
      };
    case 'DELETE_ITEM':
      return { ...state, inventory: state.inventory.filter((item) => item.id !== action.payload) };
    case 'ADD_PARTY':
      return { ...state, parties: [...state.parties, action.payload] };
    case 'UPDATE_PARTY':
      return {
        ...state,
        parties: state.parties.map((p) => (p.id === action.payload.id ? action.payload : p)),
      };
    case 'DELETE_PARTY':
      return { ...state, parties: state.parties.filter((p) => p.id !== action.payload) };
    case 'CREATE_INVOICE':
      // 1. Deduct stock
      const updatedInventory = state.inventory.map((item) => {
        const cartItem = action.payload.items.find((c) => c.id === item.id);
        if (cartItem) {
          return { ...item, stock: item.stock - cartItem.quantity };
        }
        return item;
      });

      // 2. Update Party Balance (Receivable)
      // If it's a customer, the invoice amount is added to their balance (they owe us)
      const updatedParties = state.parties.map((p) => {
        if (p.id === action.payload.partyId) {
          return { ...p, balance: p.balance + action.payload.grandTotal };
        }
        return p;
      });

      return {
        ...state,
        inventory: updatedInventory,
        parties: updatedParties,
        invoices: [action.payload, ...state.invoices],
      };
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    case 'RESTORE_DATA':
      return action.payload;
    case 'RESET_DATA':
      // Return a completely fresh state object
      return getInitialState();
    default:
      return state;
  }
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
}>({ state: getInitialState(), dispatch: () => null });

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, getInitialState(), (initial) => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : initial;
    } catch (error) {
      console.error("Failed to load data from storage, resetting to default.", error);
      return initial;
    }
  });

  useEffect(() => {
    if (!state) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error("Failed to save state to localStorage", e);
    }
  }, [state]);

  // Apply Theme Class
  useEffect(() => {
    if (state.settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.settings.theme]);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
};

export const useAppStore = () => useContext(AppContext);