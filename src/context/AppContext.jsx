import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { api, setToken, clearToken, refreshSession } from "../lib/api";

const EMPTY_USER = {
  clientId: '', firstName: '', lastName: '', email: '', phone: '',
  walletBalance: 0, role: 'customer',
  billingAddress:  { street: '', city: '', state: '', pinCode: '' },
  deliveryAddress: { street: '', city: '', state: '', pinCode: '' },
};

const AppContext = createContext(null);

function AppProvider({ children }) {
  // null = checking, false = logged out, true = logged in
  const [authReady, setAuthReady] = useState(false);
  const [session, setSession]     = useState(false);
  const [user, setUser]           = useState(null);

  const [products, setProducts]         = useState([]);
  const [offers, setOffers]             = useState([]);
  const [banners, setBanners]           = useState([]);
  const [orders, setOrders]             = useState([]);
  const [rituals, setRituals]           = useState([]);
  const [cart, setCart]                 = useState([]);
  const [favourites, setFavourites]     = useState(() => {
    try { return JSON.parse(localStorage.getItem("gir_favourites") || "[]"); } catch { return []; }
  });
  const [bills, setBills]               = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [statementEntries, setStatementEntries] = useState([]);
  const [paymentMethods, setPaymentMethods]     = useState([]);
  const [pausedToday, setPausedToday]           = useState({});

  // Public data — load regardless of auth
  useEffect(() => {
    api.getProducts().then(setProducts).catch(() => {});
    api.getOffers().then(setOffers).catch(() => {});
    api.getBanners().then(setBanners).catch(() => {});
  }, []);

  // On mount: try to restore session from HttpOnly refresh cookie
  const bootRef = useRef(false);
  useEffect(() => {
    if (bootRef.current) return;
    bootRef.current = true;
    refreshSession()
      .then((token) => {
        setToken(token);
        setSession(true);
      })
      .catch(() => {
        // No valid session cookie — user is logged out
        setSession(false);
      })
      .finally(() => setAuthReady(true));
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

  useEffect(() => {
    if (session) loadUserData();
  }, [session, loadUserData]);

  const login = useCallback((u, token) => {
    setToken(token);
    setSession(true);
    setUser(u);
  }, []);

  const register = useCallback((u, token) => {
    setToken(token);
    setSession(true);
    setUser(u);
  }, []);

  const logout = useCallback(async () => {
    try { await api.logout(); } catch {}
    clearToken();
    localStorage.removeItem("gir_user");
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
      if (isPaused) api.resumeRitual(ritualId).catch(() => {});
      else          api.pauseRitual(ritualId).catch(() => {});
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
    if (qty <= 0) { setCart(prev => prev.filter(c => c.productId !== productId)); return; }
    setCart(prev => prev.map(c => c.productId === productId ? { ...c, quantity: qty } : c));
  }, []);

  const removeFromCart = useCallback((productId) => {
    setCart(prev => prev.filter(c => c.productId !== productId));
  }, []);

  const toggleFavourite = useCallback((productId) => {
    setFavourites(prev => {
      const next = prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId];
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
      throw err;
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
    authReady,
    session,
    user: user ?? EMPTY_USER,
    walletBalance: user?.walletBalance ?? 0,
    products,
    offers,
    banners,
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
    authReady, session, user, products, offers, banners, orders, rituals, cart, favourites, bills,
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
