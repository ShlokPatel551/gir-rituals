import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AppProvider } from "./context/AppContext";
import { ToastProvider } from "./context/ToastContext";
import { GOOGLE_CLIENT_ID } from "./lib/googleAuth";
import { AdminLayout } from "./components/AdminLayout";
import { Layout } from "./components/Layout";
import { ProtectedAdminRoute } from "./components/ProtectedAdminRoute";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminBilling } from "./pages/admin/AdminBilling";
import { AdminCampaigns } from "./pages/admin/AdminCampaigns";
import { AdminCreateBanner } from "./pages/admin/AdminCreateBanner";
import { AdminComms } from "./pages/admin/AdminComms";
import { AdminOffers } from "./pages/admin/AdminOffers";
import { AdminCreateOffer } from "./pages/admin/AdminCreateOffer";
import { AdminCustomerDetail } from "./pages/admin/AdminCustomerDetail";
import { AdminCustomerBilling } from "./pages/admin/AdminCustomerBilling";
import { AdminCustomerOrders } from "./pages/admin/AdminCustomerOrders";
import { AdminCustomerTransactions } from "./pages/admin/AdminCustomerTransactions";
import { AdminCustomerActiveOrders } from "./pages/admin/AdminCustomerActiveOrders";
import { AdminStockInventory } from "./pages/admin/AdminStockInventory";
import { AdminLowStock } from "./pages/admin/AdminLowStock";
import { AdminOutOfStock } from "./pages/admin/AdminOutOfStock";
import { AdminAddOrder } from "./pages/admin/AdminAddOrder";
import { AdminOrderDetail } from "./pages/admin/AdminOrderDetail";
import { AdminEditOrder } from "./pages/admin/AdminEditOrder";
import { AdminAddProduct } from "./pages/admin/AdminAddProduct";
import { AdminEditProduct } from "./pages/admin/AdminEditProduct";
import { AdminViewProduct } from "./pages/admin/AdminViewProduct";
import { AdminAddCustomer } from "./pages/admin/AdminAddCustomer";
import { AdminCustomers } from "./pages/admin/AdminCustomers";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminDeliveries } from "./pages/admin/AdminDeliveries";
import { AdminAnalytics } from "./pages/admin/AdminAnalytics";
import { AdminFinance } from "./pages/admin/AdminFinance";
import { AdminNotifications } from "./pages/admin/AdminNotifications";
import { AdminRefunds } from "./pages/admin/AdminRefunds";
import { AdminLogin } from "./pages/admin/AdminLogin";
import { AdminOrders } from "./pages/admin/AdminOrders";
import { AdminProducts } from "./pages/admin/AdminProducts";
import { AdminProduction } from "./pages/admin/AdminProduction";
import { AdminProductionEntry } from "./pages/admin/AdminProductionEntry";
import { AdminProductionForm } from "./pages/admin/AdminProductionForm";
import { AdminStockLedger } from "./pages/admin/AdminStockLedger";
import { AdminLeftoverStock } from "./pages/admin/AdminLeftoverStock";
import { AdminProductionLog } from "./pages/admin/AdminProductionLog";
import { AdminSettings } from "./pages/admin/AdminSettings";
import { AdminTeam } from "./pages/admin/AdminTeam";
import { Splash } from "./pages/Splash";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Otp } from "./pages/Otp";
import { ForgotPassword } from "./pages/ForgotPassword";
import { Home } from "./pages/Home";
import { Products } from "./pages/Products";
import { ProductDetail } from "./pages/ProductDetail";
import { Offers, OfferDetail } from "./pages/Offers";
import { Schedule, DayDetail } from "./pages/Schedule";
import { Bills } from "./pages/Bills";
import { Orders, OrderDetail } from "./pages/Orders";
import { Cart } from "./pages/Cart";
import { Checkout } from "./pages/Checkout";
import { Payment, PaymentSuccess, PaymentFailure } from "./pages/Payment";
import { Profile, AccountSettings, Feedback } from "./pages/Profile";
import { About } from "./pages/About";
import { Contact } from "./pages/Contact";
import { Notifications } from "./pages/Notifications";
import { Favourites } from "./pages/Favourites";
import { Flow } from "./pages/Flow";
import { Dashboard } from "./pages/Dashboard";
function AppRoutes() {
  return <Routes>
      {
    /* Admin routes — separate layout */
  }
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
    path="/admin"
    element={<ProtectedAdminRoute>
            <AdminLayout />
          </ProtectedAdminRoute>}
  >
        <Route index element={<AdminDashboard />} />
        <Route path="customers" element={<AdminCustomers />} />
        <Route path="customers/new" element={<AdminAddCustomer />} />
        <Route path="customers/:id" element={<AdminCustomerDetail />} />
        <Route path="customers/:id/billing" element={<AdminCustomerBilling />} />
        <Route path="customers/:id/orders" element={<AdminCustomerOrders />} />
        <Route path="customers/:id/transactions" element={<AdminCustomerTransactions />} />
        <Route path="customers/:id/active-orders" element={<AdminCustomerActiveOrders />} />
        <Route path="deliveries" element={<AdminDeliveries />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="orders/new" element={<AdminAddOrder />} />
        <Route path="orders/:id" element={<AdminOrderDetail />} />
        <Route path="orders/:id/edit" element={<AdminEditOrder />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="products/new" element={<AdminAddProduct />} />
        <Route path="products/:id" element={<AdminViewProduct />} />
        <Route path="products/:id/edit" element={<AdminEditProduct />} />
        <Route path="production" element={<AdminProduction />} />
        <Route path="production/:productId" element={<AdminProductionEntry />} />
        <Route path="production/:productId/edit" element={<AdminProductionForm />} />
        <Route path="stock" element={<AdminStockInventory />} />
        <Route path="low-stock" element={<AdminLowStock />} />
        <Route path="out-of-stock" element={<AdminOutOfStock />} />
        <Route path="stock-history" element={<AdminStockLedger />} />
        <Route path="leftover-stock" element={<AdminLeftoverStock />} />
        <Route path="production-log" element={<AdminProductionLog />} />
        <Route path="finance" element={<AdminFinance />} />
        <Route path="billing" element={<AdminBilling />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="notifications" element={<AdminNotifications />} />
        <Route path="refunds" element={<AdminRefunds />} />
        <Route path="offers" element={<AdminOffers />} />
        <Route path="offers/create" element={<AdminCreateOffer />} />
        <Route path="campaigns" element={<AdminCampaigns />} />
        <Route path="campaigns/create" element={<AdminCreateBanner />} />
        <Route path="comms" element={<AdminComms />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="team" element={<AdminTeam />} />
      </Route>

      <Route element={<Layout />}>
        <Route path="/" element={<Splash />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/otp" element={<Otp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
        <Route path="/products/:id" element={<ProtectedRoute><ProductDetail /></ProtectedRoute>} />
        <Route path="/offers" element={<ProtectedRoute><Offers /></ProtectedRoute>} />
        <Route path="/offers/:id" element={<ProtectedRoute><OfferDetail /></ProtectedRoute>} />
        <Route path="/schedule" element={<ProtectedRoute><Schedule /></ProtectedRoute>} />
        <Route path="/schedule/day/:day" element={<ProtectedRoute><DayDetail /></ProtectedRoute>} />
        <Route path="/bills" element={<ProtectedRoute><Bills /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
        <Route path="/orders/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
        <Route path="/favourites" element={<ProtectedRoute><Favourites /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/about" element={<ProtectedRoute><About /></ProtectedRoute>} />
        <Route path="/contact" element={<ProtectedRoute><Contact /></ProtectedRoute>} />
        <Route path="/flow" element={<ProtectedRoute><Flow /></ProtectedRoute>} />
        <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/profile/settings" element={<ProtectedRoute><AccountSettings /></ProtectedRoute>} />
        <Route path="/profile/feedback" element={<ProtectedRoute><Feedback /></ProtectedRoute>} />

        <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        <Route path="/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
        <Route path="/payment/success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
        <Route path="/payment/failure" element={<ProtectedRoute><PaymentFailure /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>;
}
function App() {
  return <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID || "no-client-id"}>
      <AppProvider>
        <ToastProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </ToastProvider>
      </AppProvider>
    </GoogleOAuthProvider>;
}
export {
  App as default
};
