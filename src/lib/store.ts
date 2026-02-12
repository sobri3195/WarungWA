import { create } from 'zustand';
import { db, type AppSession, type Shop } from './db';

// ============================================================
// APP STATE
// ============================================================

interface AppState {
  // Session
  session: AppSession | null;
  currentShop: Shop | null;
  isLoading: boolean;
  
  // Actions
  loadSession: () => Promise<void>;
  setSession: (session: Partial<AppSession>) => Promise<void>;
  switchShop: (shopId: string) => Promise<void>;
  switchRole: (role: 'OWNER' | 'ADMIN' | 'STAFF') => Promise<void>;
  logout: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  session: null,
  currentShop: null,
  isLoading: true,
  
  loadSession: async () => {
    try {
      const session = await db.appSession.get('current');
      
      if (session) {
        const shop = await db.shops.get(session.currentShopId);
        set({ session, currentShop: shop || null, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Failed to load session:', error);
      set({ isLoading: false });
    }
  },
  
  setSession: async (updates: Partial<AppSession>) => {
    const currentSession = get().session;
    
    if (!currentSession) return;
    
    const newSession: AppSession = {
      ...currentSession,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    await db.appSession.put(newSession);
    set({ session: newSession });
  },
  
  switchShop: async (shopId: string) => {
    const shop = await db.shops.get(shopId);
    
    if (!shop) {
      throw new Error('Shop not found');
    }
    
    await get().setSession({ currentShopId: shopId });
    set({ currentShop: shop });
  },
  
  switchRole: async (role: 'OWNER' | 'ADMIN' | 'STAFF') => {
    await get().setSession({ currentRole: role });
  },
  
  logout: () => {
    set({ session: null, currentShop: null });
  },
}));

// ============================================================
// TOAST NOTIFICATION STATE
// ============================================================

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

interface ToastState {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  
  addToast: (toast) => {
    const id = Math.random().toString(36).substring(7);
    const newToast: Toast = { ...toast, id };
    
    set((state) => ({ toasts: [...state.toasts, newToast] }));
    
    // Auto remove after duration
    const duration = toast.duration || 5000;
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, duration);
  },
  
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
}));

// ============================================================
// MODAL STATE
// ============================================================

interface ModalState {
  isOpen: boolean;
  component: React.ReactNode | null;
  openModal: (component: React.ReactNode) => void;
  closeModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  isOpen: false,
  component: null,
  
  openModal: (component) => {
    set({ isOpen: true, component });
  },
  
  closeModal: () => {
    set({ isOpen: false, component: null });
  },
}));
