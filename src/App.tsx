import { Suspense, lazy, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { SettingsProvider, useSettings } from "@/context/SettingsContext";
import { Loader2 } from "lucide-react";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";

// Lazy load Customer pages
const Index = lazy(() => import("./pages/Index"));
const Products = lazy(() => import("./pages/Products"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Offers = lazy(() => import("./pages/Offers"));
const Contact = lazy(() => import("./pages/Contact"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const TransferRequest = lazy(() => import("./pages/TransferRequest"));
const TransferOrders = lazy(() => import("./pages/TransferOrders"));
const NotFound = lazy(() => import("./pages/NotFound"));
const CustomerLayout = lazy(() => import("./components/CustomerLayout"));

// Lazy load Admin pages
const AdminLogin = lazy(() => import("./pages/admin/Login"));
const AdminLayout = lazy(() => import("./components/admin/AdminLayout"));
const ProtectedRoute = lazy(() => import("./components/admin/ProtectedRoute"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminProducts = lazy(() => import("./pages/admin/Products"));
const Categories = lazy(() => import("./pages/admin/Categories"));
const Orders = lazy(() => import("./pages/admin/Orders"));
const Customers = lazy(() => import("./pages/admin/Customers"));
const Coupons = lazy(() => import("./pages/admin/Coupons"));
const Shipping = lazy(() => import("./pages/admin/Shipping"));
const Locations = lazy(() => import("./pages/admin/Locations"));
const Banners = lazy(() => import("./pages/admin/Banners"));
const ContactMessages = lazy(() => import("./pages/admin/ContactMessages"));
const Reviews = lazy(() => import("./pages/admin/Reviews"));
const Settings = lazy(() => import("./pages/admin/Settings"));
const Users = lazy(() => import("./pages/admin/Users"));
const AdminTransferOrders = lazy(() => import("./pages/admin/TransferOrders"));
const AdminTransferMethods = lazy(() => import("./pages/admin/TransferMethods"));
const AdminFeeRules = lazy(() => import("./pages/admin/FeeRules"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

const TitleUpdater = () => {
  const { settings } = useSettings();
  useEffect(() => {
    if (settings?.storeName) {
      document.title = settings.storeName;
    }
  }, [settings]);
  return null;
};

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <Loader2 className="w-10 h-10 animate-spin text-primary" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <BrowserRouter>
          <SettingsProvider>
            <TitleUpdater />
            <CartProvider>
              <Toaster />
              <Sonner position="top-center" />
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  {/* Customer routes */}
                  <Route element={<CustomerLayout />}>
                    <Route path="/" element={<Index />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route path="/offers" element={<Offers />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/transfer" element={<TransferRequest />} />
                    <Route path="/transfer/orders" element={<TransferOrders />} />
                    <Route path="*" element={<NotFound />} />
                  </Route>

                  {/* Admin routes */}
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route element={<ProtectedRoute />}>
                    <Route path="/admin" element={<AdminLayout />}>
                      <Route index element={<Dashboard />} />
                      <Route path="products" element={<AdminProducts />} />
                      <Route path="categories" element={<Categories />} />
                      <Route path="orders" element={<Orders />} />
                      <Route path="customers" element={<Customers />} />
                      <Route path="coupons" element={<Coupons />} />
                      <Route path="shipping" element={<Shipping />} />
                      <Route path="locations" element={<Locations />} />
                      <Route path="banners" element={<Banners />} />
                      <Route path="messages" element={<ContactMessages />} />
                      <Route path="reviews" element={<Reviews />} />
                      <Route path="settings" element={<Settings />} />
                      <Route path="users" element={<Users />} />
                      <Route path="transfers" element={<AdminTransferOrders />} />
                      <Route path="transfer-methods" element={<AdminTransferMethods />} />
                      <Route path="fee-rules" element={<AdminFeeRules />} />
                    </Route>
                  </Route>


                </Routes>
              </Suspense>
              <FloatingWhatsApp />
            </CartProvider>
          </SettingsProvider>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
