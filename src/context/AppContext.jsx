import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";

const defaultUser = {
  clientId: "GR7K2M9X",
  firstName: "Demo",
  lastName: "Customer",
  email: "demo@girrituals.com",
  phone: "9876543210",
  billingAddress: { street: "12 Farm Lane", city: "Ahmedabad", state: "Gujarat", pinCode: "380001" },
  deliveryAddress: { street: "12 Farm Lane", city: "Ahmedabad", state: "Gujarat", pinCode: "380001" },
};

const AppContext = createContext(null);

function AppProvider({ children }) {
  const [session, setSession] = useState(() => !!localStorage.getItem("gir_token"));
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("gir_user");
    const token = localStorage.getItem("gir_token");
    return stored && token ? JSON.parse(stored) : null;
  });

  const [products, setProducts] = useState([]);
  const [offers, setOffers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [rituals, setRituals] = useState([]);
  const [cart, setCart] = useState([]);
  const [favourites, setFavourites] = useState(() => {
    try {
      const s = localStorage.getItem("gir_favourites");
      return s ? JSON.parse(s) : [];
    } catch { return []; }
  });
  const [bills, setBills] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [statementEntries, setStatementEntries] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [pausedToday, setPausedToday] = useState({});

  // Public data — load on mount regardless of auth
  useEffect(() => {
    api.getProducts().then(setProducts).catch(err => console.error('[App] getProducts:', err.message));
    api.getOffers().then(setOffers).catch(err => console.error('[App] getOffers:', err.message));
  }, []);

  const loadUserData = useCallback(async () => {
    try {
      const [profile, billsData, notifsData, ritualsData, stmtData, ordersData] = await Promise.all([
        api.getProfile(),
        api.getBills(),
        api.getNotifications(),
        api.getRituals(),
        api.getStatement(),
        api.getOrders(),
      ]);
      setUser(prev => ({ ...(prev ?? {}), ...profile }));
      setPaymentMethods(profile.paymentMethods ?? []);
      setBills(billsData);
      setNotifications(notifsData);
      setRituals(ritualsData);
      setStatementEntries(stmtData);
      setOrders(ordersData);
    } catch (err) {
      console.error('[App] loadUserData:', err.message);
    }
  }, []);

  // Load user-specific data whenever session becomes active
  useEffect(() => {
    if (session) loadUserData();
  }, [session, loadUserData]);

  const persist = useCallback((u, token) => {
    if (token) localStorage.setItem("gir_token", token);
    localStorage.setItem("gir_user", JSON.stringify(u));
    localStorage.removeItem("gir_session");
    setSession(true);
    setUser(u);
  }, []);

  const login = useCallback((u, token) => persist(u, token), [persist]);
  const register = useCallback((u, token) => persist(u, token), [persist]);

  const logout = useCallback(async () => {
    try { await api.logout(); } catch {}
    localStorage.removeItem("gir_session");
    localStorage.removeItem("gir_user");
    localStorage.removeItem("gir_token");
    setSession(false);
    setUser(null);
    setBills([]);
    setNotifications([]);
    setRituals([]);
    setStatementEntries([]);
    setPaymentMethods([]);
    setOrders([]);
  }, []);

  const togglePause = useCallback(async (ritualId) => {
    setRituals(prev => {
      const ritual = prev.find(r => r.id === ritualId);
      if (!ritual) return prev;
      const isPaused = ritual.status === "Paused";
      if (isPaused) api.resumeRitual(ritualId).catch(err => console.error('[App] resumeRitual:', err.message));
      else api.pauseRitual(ritualId).catch(err => console.error('[App] pauseRitual:', err.message));
      setPausedToday(p => ({ ...p, [ritualId]: !isPaused }));
      return prev.map(r => r.id === ritualId ? { ...r, status: isPaused ? "Pending" : "Paused" } : r);
    });
  }, []);

  const addExtra = useCallback((productId, qty) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    setRituals(prev => [...prev, { id: `extra-${Date.now()}`, productId, quantity: qty, status: "Extra" }]);
  }, [products]);

  const addToCart = useCallback((productId, qty = 1) => {
    setCart(prev => {
      const existing = prev.find(c => c.productId === productId);
      if (existing) return prev.map(c => c.productId === productId ? { ...c, quantity: c.quantity + qty } : c);
      return [...prev, { productId, quantity: qty }];
    });
  }, []);

  const updateCartQty = useCallback((productId, qty) => {
    if (qty <= 0) {
      setCart(prev => prev.filter(c => c.productId !== productId));
      return;
    }
    setCart(prev => prev.map(c => c.productId === productId ? { ...c, quantity: qty } : c));
  }, []);

  const removeFromCart = useCallback((productId) => {
    setCart(prev => prev.filter(c => c.productId !== productId));
  }, []);

  const toggleFavourite = useCallback((productId) => {
    setFavourites(prev => {
      const next = prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId];
      localStorage.setItem("gir_favourites", JSON.stringify(next));
      return next;
    });
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    api.markAllNotificationsRead().catch(() => {});
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const markNotificationRead = useCallback((id) => {
    api.markNotificationRead(id).catch(() => {});
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const payBill = useCallback(async (billId) => {
    try {
      const { paidDate } = await api.payBill(billId, { method: "UPI" });
      setBills(prev => prev.map(b => b.id === billId ? { ...b, status: "paid", paidDate, method: "UPI" } : b));
    } catch (err) {
      console.error('[App] payBill:', err.message);
      throw err; // re-throw so payment page can show an error
    }
  }, []);

  const cancelOrder = useCallback(async (orderId) => {
    try {
      await api.cancelOrder(orderId);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: "cancelled" } : o));
    } catch (err) {
      console.error('[App] cancelOrder:', err.message);
      throw err;
    }
  }, []);

  const addPaymentMethod = useCallback(async (method) => {
    try {
      const pm = await api.addPaymentMethod(method);
      setPaymentMethods(prev => [...prev, pm]);
    } catch (err) {
      console.error('[App] addPaymentMethod:', err.message);
      throw err;
    }
  }, []);

  const removePaymentMethod = useCallback(async (id) => {
    try {
      await api.deletePaymentMethod(id);
      setPaymentMethods(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      console.error('[App] removePaymentMethod:', err.message);
      throw err;
    }
  }, []);

  const setDefaultPaymentMethod = useCallback(async (id) => {
    try {
      await api.setDefaultPaymentMethod(id);
      setPaymentMethods(prev => prev.map(m => ({ ...m, isDefault: m.id === id })));
    } catch (err) {
      console.error('[App] setDefaultPaymentMethod:', err.message);
      throw err;
    }
  }, []);

  const cartCount = cart.reduce((sum, c) => sum + c.quantity, 0);
  const cartTotal = cart.reduce((sum, c) => {
    const p = products.find(x => x.id === c.productId);
    return sum + (p ? p.price * c.quantity : 0);
  }, 0);

  const value = useMemo(() => ({
    session,
    user: user ?? defaultUser,
    walletBalance: user?.walletBalance ?? 0,
    products,
    offers,
    orders,
    rituals,
    cart,
    favourites,
    bills,
    notifications,
    pausedToday,
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
    markNotificationRead,
    payBill,
    cancelOrder,
    addPaymentMethod,
    removePaymentMethod,
    setDefaultPaymentMethod,
    cartCount,
    cartTotal,
    loadUserData,
  }), [
    session, user, user?.walletBalance, products, offers, orders, rituals, cart, favourites, bills,
    notifications, pausedToday, statementEntries, paymentMethods,
    login, logout, register, togglePause, addExtra, addToCart, updateCartQty,
    removeFromCart, toggleFavourite, markAllNotificationsRead, markNotificationRead, payBill,
    cancelOrder, addPaymentMethod, removePaymentMethod,
    setDefaultPaymentMethod, cartCount, cartTotal, loadUserData,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

export { AppProvider, useApp };
