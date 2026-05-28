import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { defaultPaymentMethods, initialRituals, products, sampleBills, sampleNotifications, sampleStatements } from "../data/mockData";
const defaultUser = {
  clientId: "GR7K2M9X",
  firstName: "Demo",
  lastName: "Customer",
  email: "demo@girrituals.com",
  phone: "9876543210",
  billingAddress: { street: "12 Farm Lane", city: "Ahmedabad", state: "Gujarat", pinCode: "380001" },
  deliveryAddress: { street: "12 Farm Lane", city: "Ahmedabad", state: "Gujarat", pinCode: "380001" }
};
const AppContext = createContext(null);
function AppProvider({ children }) {
  const [session, setSession] = useState(() => !!localStorage.getItem("gir_token"));
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("gir_user");
    const token = localStorage.getItem("gir_token");
    return stored && token ? JSON.parse(stored) : null;
  });
  const [rituals, setRituals] = useState(initialRituals);
  const [cart, setCart] = useState([]);
  const [favourites, setFavourites] = useState(["milk"]);
  const [bills, setBills] = useState(sampleBills);
  const [notifications, setNotifications] = useState(sampleNotifications);
  const [pausedToday, setPausedToday] = useState({});
  const [walletBalance, setWalletBalance] = useState(210);
  const [statementEntries, setStatementEntries] = useState(sampleStatements);
  const [paymentMethods, setPaymentMethods] = useState(defaultPaymentMethods);
  const persist = useCallback((u, token) => {
    if (token) localStorage.setItem("gir_token", token);
    localStorage.setItem("gir_user", JSON.stringify(u));
    localStorage.removeItem("gir_session");
    setSession(true);
    setUser(u);
  }, []);
  const login = useCallback((u, token) => persist(u, token), [persist]);
  const register = useCallback((u, token) => persist(u, token), [persist]);
  const logout = useCallback(() => {
    localStorage.removeItem("gir_session");
    localStorage.removeItem("gir_user");
    localStorage.removeItem("gir_token");
    setSession(false);
    setUser(null);
  }, []);
  const togglePause = useCallback((ritualId) => {
    setPausedToday((prev) => ({ ...prev, [ritualId]: !prev[ritualId] }));
    setRituals(
      (prev) => prev.map(
        (r) => r.id === ritualId ? { ...r, status: r.status === "Paused" ? "Pending" : "Paused" } : r
      )
    );
  }, []);
  const addExtra = useCallback((productId, qty) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    setRituals((prev) => [
      ...prev,
      { id: `extra-${Date.now()}`, productId, quantity: qty, status: "Extra" }
    ]);
  }, []);
  const addToCart = useCallback((productId, qty = 1) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.productId === productId);
      if (existing) {
        return prev.map(
          (c) => c.productId === productId ? { ...c, quantity: c.quantity + qty } : c
        );
      }
      return [...prev, { productId, quantity: qty }];
    });
  }, []);
  const updateCartQty = useCallback((productId, qty) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((c) => c.productId !== productId));
      return;
    }
    setCart(
      (prev) => prev.map((c) => c.productId === productId ? { ...c, quantity: qty } : c)
    );
  }, []);
  const removeFromCart = useCallback((productId) => {
    setCart((prev) => prev.filter((c) => c.productId !== productId));
  }, []);
  const toggleFavourite = useCallback((productId) => {
    setFavourites(
      (prev) => prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  }, []);
  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);
  const payBill = useCallback((billId, walletApplied = 0) => {
    if (walletApplied > 0) setWalletBalance((prev) => Math.max(0, prev - walletApplied));
    setBills(
      (prev) => prev.map(
        (b) => b.id === billId ? { ...b, status: "paid", paidDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), method: "UPI" } : b
      )
    );
    const bill = bills.find((b) => b.id === billId);
    if (bill) {
      const entry = {
        id: `stmt-${Date.now()}`,
        date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
        type: "payment",
        description: `Payment received \u2014 ${bill.period}`,
        amount: bill.amount,
        credit: true,
        month: bill.period
      };
      setStatementEntries((prev) => [entry, ...prev]);
    }
  }, [bills]);
  const addWalletCredit = useCallback((amount) => {
    setWalletBalance((prev) => prev + amount);
    const entry = {
      id: `stmt-${Date.now()}`,
      date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
      type: "store_credit",
      description: `Store credit added \u20B9${amount}`,
      amount,
      credit: true,
      month: (/* @__PURE__ */ new Date()).toLocaleDateString("en-IN", { month: "long", year: "numeric" })
    };
    setStatementEntries((prev) => [entry, ...prev]);
  }, []);
  const addPaymentMethod = useCallback((method) => {
    setPaymentMethods((prev) => [...prev, { ...method, id: `pm-${Date.now()}` }]);
  }, []);
  const removePaymentMethod = useCallback((id) => {
    setPaymentMethods((prev) => prev.filter((m) => m.id !== id));
  }, []);
  const setDefaultPaymentMethod = useCallback((id) => {
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
      cartTotal
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
      cartTotal
    ]
  );
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
export {
  AppProvider,
  useApp
};
