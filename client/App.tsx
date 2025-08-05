import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import PizzaBuilder from "./pages/PizzaBuilder";
import Checkout from "./pages/Checkout";
import AdminLogin from "./pages/AdminLogin";
import ProtectedAdminDashboard from "./pages/ProtectedAdminDashboard";
import Placeholder from "./pages/Placeholder";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/build" element={<PizzaBuilder />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<ProtectedAdminDashboard />} />

          {/* Placeholder routes for future implementation */}
          <Route 
            path="/menu" 
            element={
              <Placeholder 
                title="Full Menu" 
                description="Complete pizza menu with categories, filters, and detailed descriptions."
                suggestedAction="The full menu page is in development. Check out the featured pizzas on the dashboard!"
              />
            } 
          />
          <Route 
            path="/orders" 
            element={
              <Placeholder 
                title="Order Tracking" 
                description="Track your current and past orders with real-time status updates."
                suggestedAction="Order tracking functionality will be available once you place your first order."
              />
            } 
          />


          <Route 
            path="/forgot-password" 
            element={
              <Placeholder 
                title="Forgot Password" 
                description="Reset your password with email verification."
                suggestedAction="Password recovery system will be implemented next."
              />
            } 
          />
          <Route 
            path="/favorites" 
            element={
              <Placeholder 
                title="Favorite Pizzas" 
                description="View and manage your favorite pizza combinations."
                suggestedAction="Save your favorite orders to access them quickly in the future."
              />
            } 
          />
          <Route 
            path="/terms" 
            element={
              <Placeholder 
                title="Terms of Service" 
                description="Legal terms and conditions for using PizzaCraft."
                suggestedAction="Legal documents and policies are being prepared."
              />
            } 
          />
          <Route 
            path="/privacy" 
            element={
              <Placeholder 
                title="Privacy Policy" 
                description="How we protect and handle your personal information."
                suggestedAction="Privacy policy and data protection information coming soon."
              />
            } 
          />
          
          {/* Catch-all route for 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
