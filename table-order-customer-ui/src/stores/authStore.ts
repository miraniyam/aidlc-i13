import { create } from 'zustand';

interface AuthState {
  token: string | null;
  tableId: string | null;
  sessionId: string | null;
  isAuthenticated: boolean;
}

interface AuthActions {
  login: (token: string, tableId: string, sessionId: string) => void;
  logout: () => void;
  loadFromStorage: () => void;
}

type AuthStore = AuthState & AuthActions;

const useAuthStore = create<AuthStore>((set) => ({
  token: null,
  tableId: null,
  sessionId: null,
  isAuthenticated: false,

  login: (token, tableId, sessionId) => {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('table_id', tableId);
    localStorage.setItem('session_id', sessionId);
    set({ token, tableId, sessionId, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('table_id');
    localStorage.removeItem('session_id');
    set({ token: null, tableId: null, sessionId: null, isAuthenticated: false });
  },

  loadFromStorage: () => {
    const token = localStorage.getItem('auth_token');
    const tableId = localStorage.getItem('table_id');
    const sessionId = localStorage.getItem('session_id');
    if (token && tableId && sessionId) {
      set({ token, tableId, sessionId, isAuthenticated: true });
    }
  },
}));

export default useAuthStore;
