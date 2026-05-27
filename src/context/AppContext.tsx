import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { defaultPaymentMethods, initialRituals, products, sampleBills, sampleNotifications, sampleStatements } from '../data/mockData';
import type { Bill, CartItem, Notification, PaymentMethod, RitualItem, StatementEntry, User } from '../types';

interface AppState {
  session: boolean;
  user: User;
  rituals: RitualItem[];
  cart: CartItem[];
  favourites: string[];
  bills: Bill[];
  notifications: Notification[];
  pausedToday: Record<string, boolean>;
  walletBalance: number;
  statementEntries: StatementEntry[];
  paymentMethods: PaymentMethod[];
}

interface AppContextValue extends AppState {
  login: (user: User) => void;
  logout: () => void;
  register: (user: User) => void;
  togglePause: (ritualId: string) => void;
  addExtra: (productId: string, qty: number) => void;
  addToCart: (productId: string, qty?: number) => void;
  updateCartQty: (productId: string, qty: number) => void;
  removeFromCart: (productId: string) => void;
  toggleFavourite: (productId: string) => void;
  markAllNotificationsRead: () => void;
  payBill: (billId: string, walletApplied?: number) => void;
  addWalletCredit: (amount: number) => void;
  addPaymentMethod: (method: Omit<PaymentMethod, 'id'>) => void;
  removePaymentMethod: (id: string) => void;
  setDefaultPaymentMethod: (id: string) => void;
  cartCount: number;
  cartTotal: number;
}

const defaultUser: User = {
  clientId: 'GR7K2M9X',
  firstName: 'Demo',
  lastName: 'Customer',
  email: 'demo@girrituals.com',
  phone: '9876543210',
  billingAddress: { street: '12 Farm Lane', city: 'Ahmedabad', state: 'Gujarat', pinCode: '380001' },
  deliveryAddress: { street: '12 Farm Lane', city: 'Ahmedabad', state: 'Gujarat', pinCode: '380001' },
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState(() => localStorage.getItem('gir_session') === 'true');
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('gir_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [rituals, setRituals] = useState<RitualItem[]>(initialRituals);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favourites, setFavourites] = useState<string[]>(['milk']);
  const [bills, setBills] = useState<Bill[]>(sampleBills);
  const [notifications, setNotifications] = useState<Notification[]>(sampleNotifications);
  const [pausedToday, setPausedToday] = useState<Record<string, boolean>>({});
  const [walletBalance, setWalletBalance] = useState(210);
  const [statementEntries, setStatementEntries] = useState<StatementEntry[]>(sampleStatements);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(defaultPaymentMethods);

  const persist = useCallback((u: User) => {
    localStorage.setItem('gir_session', 'true');
    localStorage.setItem('gir_user', JSON.stringify(u));
    setSession(true);
    setUser(u);
  }, []);

  const login = useCallback((u: User) => persist(u), [persist]);
  const register = useCallback((u: User) => persist(u), [persist]);

  const logout = useCallback(() => {
    localStorage.removeItem('gir_session');
    localStorage.removeItem('gir_user');
    setSession(false);
    setUser(null);
  }, []);

  const togglePause = useCallback((ritualId: string) => {
    setPausedToday((prev) => ({ ...prev, [ritualId]: !prev[ritualId] }));
    setRituals((prev) =>
      prev.map((r) =>
        r.id === ritualId
          ? { ...r, status: r.status === 'Paused' ? 'Pending' : 'Paused' }
          : r,
      ),
    );
  }, []);

  const addExtra = useCallback((productId: string, qty: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    setRituals((prev) => [
      ...prev,
      { id: `extra-${Date.now()}`, productId, quantity: qty, status: 'Extra' },
    ]);
  }, []);

  const addToCart = useCallback((productId: string, qty = 1) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.productId === productId);
      if (existing) {
        return prev.map((c) =>
          c.productId === productId ? { ...c, quantity: c.quantity + qty } : c,
        );
      }
      return [...prev, { productId, quantity: qty }];
    });
  }, []);

  const updateCartQty = useCallback((productId: string, qty: number) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((c) => c.productId !== productId));
      return;
    }
    setCart((prev) =>
      prev.map((c) => (c.productId === productId ? { ...c, quantity: qty } : c)),
    );
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((c) => c.productId !== productId));
  }, []);

  const toggleFavourite = useCallback((productId: string) => {
    setFavourites((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId],
    );
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const payBill = useCallback((billId: string, walletApplied = 0) => {
    if (walletApplied > 0) setWalletBalance((prev) => Math.max(0, prev - walletApplied));
    setBills((prev) =>
      prev.map((b) =>
        b.id === billId
          ? { ...b, status: 'paid' as const, paidDate: new Date().toISOString().slice(0, 10), method: 'UPI' }
          : b,
      ),
    );
    const bill = bills.find((b) => b.id === billId);
    if (bill) {
      const entry: StatementEntry = {
        id: `stmt-${Date.now()}`,
        date: new Date().toISOString().slice(0, 10),
        type: 'payment',
        description: `Payment received — ${bill.period}`,
        amount: bill.amount,
        credit: true,
        month: bill.period,
      };
      setStatementEntries((prev) => [entry, ...prev]);
    }
  }, [bills]);

  const addWalletCredit = useCallback((amount: number) => {
    setWalletBalance((prev) => prev + amount);
    const entry: StatementEntry = {
      id: `stmt-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      type: 'store_credit',
      description: `Store credit added ₹${amount}`,
      amount,
      credit: true,
      month: new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
    };
    setStatementEntries((prev) => [entry, ...prev]);
  }, []);

  const addPaymentMethod = useCallback((method: Omit<PaymentMethod, 'id'>) => {
    setPaymentMethods((prev) => [...prev, { ...method, id: `pm-${Date.now()}` }]);
  }, []);

  const removePaymentMethod = useCallback((id: string) => {
    setPaymentMethods((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const setDefaultPaymentMethod = useCallback((id: string) => {
    setPaymentMethods((prev) => prev.map((m) => ({ ...m, isDefault: m.id === id })));
  }, []);

  const cartCount = cart.reduce((sum, c) => sum + c.quantity, 0);
  const cartTotal = cart.reduce((sum, c) => {
    const p = products.find((x) => x.id === c.productId);
    return sum + (p ? p.price * c.quantity : 0);
  }, 0);

  const value = useMemo(
    () => ({
      session,
      user: user ?? defaultUser,
      rituals,
      cart,
      favourites,
      bills,
      notifications,
      pausedToday,
      walletBalance,
      statementEntries,
      paymentMethods,
      login,
      logout,
      register,
      togglePause,
      addExtra,
      addToCart,
      updateCartQty,
      removeFromCart,
      toggleFavourite,
      markAllNotificationsRead,
      payBill,
      addWalletCredit,
      addPaymentMethod,
      removePaymentMethod,
      setDefaultPaymentMethod,
      cartCount,
      cartTotal,
    }),
    [
      session,
      user,
      rituals,
      cart,
      favourites,
      bills,
      notifications,
      pausedToday,
      walletBalance,
      statementEntries,
      paymentMethods,
      login,
      logout,
      register,
      togglePause,
      addExtra,
      addToCart,
      updateCartQty,
      removeFromCart,
      toggleFavourite,
      markAllNotificationsRead,
      payBill,
      addWalletCredit,
      addPaymentMethod,
      removePaymentMethod,
      setDefaultPaymentMethod,
      cartCount,
      cartTotal,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
