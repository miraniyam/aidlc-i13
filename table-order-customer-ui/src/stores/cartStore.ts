import { create } from 'zustand';
import { CartItem, Menu } from '@/types/api';

interface CartState {
  items: CartItem[];
  totalAmount: number;
  totalQuantity: number;
}

interface CartActions {
  addItem: (menu: Menu) => void;
  removeItem: (menuId: string) => void;
  updateQuantity: (menuId: string, quantity: number) => void;
  clearCart: () => void;
  loadFromStorage: () => void;
  saveToStorage: () => void;
  recalculateTotals: () => void;
}

type CartStore = CartState & CartActions;

const STORAGE_KEY = 'cart';

const useCartStore = create<CartStore>((set, get) => ({
  // Initial state
  items: [],
  totalAmount: 0,
  totalQuantity: 0,

  // Actions
  addItem: (menu) => {
    const { items } = get();
    const existingItem = items.find(item => item.menuId === menu.menuId);

    if (existingItem) {
      // Increase quantity
      set(state => ({
        items: state.items.map(item =>
          item.menuId === menu.menuId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ),
      }));
    } else {
      // Add new item
      set(state => ({
        items: [...state.items, {
          menuId: menu.menuId,
          menuName: menu.menuName,
          price: menu.price,
          quantity: 1,
          imageUrl: menu.imageUrl,
        }],
      }));
    }

    get().recalculateTotals();
    get().saveToStorage();
  },

  removeItem: (menuId) => {
    set(state => ({
      items: state.items.filter(item => item.menuId !== menuId),
    }));
    get().recalculateTotals();
    get().saveToStorage();
  },

  updateQuantity: (menuId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(menuId);
      return;
    }

    set(state => ({
      items: state.items.map(item =>
        item.menuId === menuId
          ? { ...item, quantity }
          : item
      ),
    }));
    get().recalculateTotals();
    get().saveToStorage();
  },

  clearCart: () => {
    set({ items: [], totalAmount: 0, totalQuantity: 0 });
    get().saveToStorage();
  },

  recalculateTotals: () => {
    const { items } = get();
    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    set({ totalAmount, totalQuantity });
  },

  loadFromStorage: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const cartData = JSON.parse(stored);
        set(cartData);
      }
    } catch (error) {
      console.error('Failed to load cart from storage:', error);
    }
  },

  saveToStorage: () => {
    try {
      const { items, totalAmount, totalQuantity } = get();
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ items, totalAmount, totalQuantity }));
    } catch (error) {
      console.error('Failed to save cart to storage:', error);
    }
  },
}));

export default useCartStore;
