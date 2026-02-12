import { create } from 'zustand';
import type { AppSession, Shop, UserRole } from '../../types';
import { db } from '../db/schema';

interface SessionState {
  session: AppSession | null;
  currentShop: Shop | null;
  isLoading: boolean;
  loadSession: () => Promise<void>;
  switchShop: (shopId: string) => Promise<void>;
  switchRole: (role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  session: null,
  currentShop: null,
  isLoading: true,

  loadSession: async () => {
    try {
      const session = await db.appSession.get('main');
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

  switchShop: async (shopId: string) => {
    const { session } = get();
    if (!session) return;

    const shop = await db.shops.get(shopId);
    if (!shop) return;

    const updatedSession = {
      ...session,
      currentShopId: shopId,
      updatedAt: new Date(),
    };

    await db.appSession.put(updatedSession);
    set({ session: updatedSession, currentShop: shop });
  },

  switchRole: async (role: UserRole) => {
    const { session } = get();
    if (!session) return;

    const updatedSession = {
      ...session,
      currentRole: role,
      updatedAt: new Date(),
    };

    await db.appSession.put(updatedSession);
    set({ session: updatedSession });
  },

  logout: async () => {
    set({ session: null, currentShop: null });
  },
}));
