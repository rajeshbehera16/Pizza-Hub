import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectToDatabase } from "./database/connection";
import { initEmailService } from "./services/emailService";
import { initStockMonitoring } from "./services/stockMonitor";

// Import auth routes
import { 
  register, 
  login, 
  verifyEmail, 
  forgotPassword, 
  resetPassword, 
  getProfile, 
  authenticateToken, 
  requireAdmin 
} from "./routes/auth";

// Import inventory routes
import {
  getInventory,
  getInventoryByCategory,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  updateStock,
  getLowStockItems,
  seedInventory
} from "./routes/inventory";

// Import payment routes
import {
  createOrder as createPaymentOrder,
  verifyPayment,
  handlePaymentFailure,
  getPaymentStatus,
  createRefund,
  getConfig
} from "./routes/payment";

// Import order routes
import {
  getUserOrders,
  getOrderById,
  createOrder,
  cancelOrder,
  trackOrder,
  getAllOrders,
  updateOrderStatus,
  getOrderStats
} from "./routes/orders";

// Legacy demo route
import { handleDemo } from "./routes/demo";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Initialize database connection
  connectToDatabase().catch(console.error);

  // Initialize background services
  initEmailService().catch(console.error);
  initStockMonitoring();

  // Health check
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "pong";
    res.json({ message: ping, timestamp: new Date().toISOString() });
  });

  // Legacy demo route
  app.get("/api/demo", handleDemo);

  // Auth routes
  app.post("/api/auth/register", register);
  app.post("/api/auth/login", login);
  app.get("/api/auth/verify-email/:token", verifyEmail);
  app.post("/api/auth/forgot-password", forgotPassword);
  app.post("/api/auth/reset-password/:token", resetPassword);
  app.get("/api/auth/profile", authenticateToken, getProfile);

  // Inventory routes
  app.get("/api/inventory", getInventory);
  app.get("/api/inventory/categorized", getInventoryByCategory);
  app.post("/api/inventory", authenticateToken, requireAdmin, createInventoryItem);
  app.put("/api/inventory/:id", authenticateToken, requireAdmin, updateInventoryItem);
  app.delete("/api/inventory/:id", authenticateToken, requireAdmin, deleteInventoryItem);
  app.post("/api/inventory/update-stock", authenticateToken, requireAdmin, updateStock);
  app.get("/api/inventory/low-stock", authenticateToken, requireAdmin, getLowStockItems);
  app.post("/api/inventory/seed", seedInventory); // Remove in production

  // Payment routes
  app.get("/api/payment/config", getConfig);
  app.post("/api/payment/create-order", authenticateToken, createPaymentOrder);
  app.post("/api/payment/verify", authenticateToken, verifyPayment);
  app.post("/api/payment/failure", handlePaymentFailure);
  app.get("/api/payment/status/:paymentId", authenticateToken, getPaymentStatus);
  app.post("/api/payment/refund", authenticateToken, requireAdmin, createRefund);

  // Order routes
  app.get("/api/orders", authenticateToken, getUserOrders);
  app.get("/api/orders/:orderId", authenticateToken, getOrderById);
  app.post("/api/orders", authenticateToken, createOrder);
  app.put("/api/orders/:orderId/cancel", authenticateToken, cancelOrder);
  app.get("/api/orders/track/:orderNumber", trackOrder); // Public route for order tracking

  // Admin order routes
  app.get("/api/admin/orders", authenticateToken, requireAdmin, getAllOrders);
  app.put("/api/admin/orders/:orderId/status", authenticateToken, requireAdmin, updateOrderStatus);
  app.get("/api/admin/orders/stats", authenticateToken, requireAdmin, getOrderStats);

  // Error handling middleware
  app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Server error:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { error: err.message })
    });
  });

  // 404 handler for API routes
  app.use('/api/*', (req, res) => {
    res.status(404).json({
      success: false,
      message: 'API endpoint not found'
    });
  });

  return app;
}
