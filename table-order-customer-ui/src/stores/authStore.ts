import { create } from 'zustand';

interface AuthState {
  token: string | null;
  tableId: string | null;
  sessionId: string | null;
  storeId: string | null;
  isAuthenticated: boolean;
}

interface AuthActions {
  login: (token: string, tableId: string, sessionId: string, storeId: string) => void;
  logout: () => void;
  loadFromStorage: () => void;
}

type AuthStore = AuthState & AuthActions;

const useAuthStore = create<AuthStore>((set) => ({
  token: null,
  tableId: null,
  sessionId: null,
  storeId: null,
  isAuthenticated: false,

  login: (token, tableId, sessionId, storeId) => {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('table_id', tableId);
    localStorage.setItem('session_id', sessionId);
    localStorage.setItem('store_id', storeId);
    set({ token, tableId, sessionId, storeId, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('table_id');
    localStorage.removeItem('session_id');
    localStorage.removeItem('store_id');
    set({ token: null, tableId: null, sessionId: null, storeId: null, isAuthenticated: false });
  },

  loadFromStorage: () => {
    const token = localStorage.getItem('auth_token');
    const tableId = localStorage.getItem('table_id');
    const sessionId = localStorage.getItem('session_id');
    const storeId = localStorage.getItem('store_id');
    if (token && tableId && sessionId && storeId) {
      set({ token, tableId, sessionId, storeId, isAuthenticated: true });
    }
  },
}));

export default useAuthStore;
