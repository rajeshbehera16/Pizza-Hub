// Demo response (legacy)
export interface DemoResponse {
  message: string;
}

// Authentication Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    token: string;
  };
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'user' | 'admin';
  isEmailVerified: boolean;
  createdAt: string;
}

// Inventory Types
export interface InventoryItem {
  _id: string;
  name: string;
  category: 'base' | 'sauce' | 'cheese' | 'vegetables' | 'meat';
  description: string;
  price: number;
  stock: number;
  threshold: number;
  unit: string;
  isActive: boolean;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryResponse {
  success: boolean;
  message?: string;
  data: {
    items: InventoryItem[];
  };
}

export interface CategorizedInventoryResponse {
  success: boolean;
  data: Record<string, InventoryItem[]>;
}

// Pizza Builder Types
export interface PizzaIngredient {
  id: string;
  name: string;
  price: number;
}

export interface CustomPizza {
  id: string;
  name: string;
  base: PizzaIngredient;
  sauce: PizzaIngredient;
  cheese: PizzaIngredient;
  vegetables: PizzaIngredient[];
  meat: PizzaIngredient[];
  size: 'small' | 'medium' | 'large';
  quantity: number;
  price: number;
  totalPrice: number;
}

// Order Types
export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
}

export interface OrderPricing {
  subtotal: number;
  tax: number;
  deliveryFee: number;
  discount: number;
  total: number;
}

export interface OrderPayment {
  method: 'razorpay' | 'cod';
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  transactionId?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  userId: string;
  customerInfo: CustomerInfo;
  items: CustomPizza[];
  pricing: OrderPricing;
  payment: OrderPayment;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';
  estimatedDeliveryTime: string;
  actualDeliveryTime?: string;
  notes?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrdersResponse {
  success: boolean;
  data: {
    orders: Order[];
    pagination?: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  };
}

export interface CreateOrderRequest {
  customerInfo: CustomerInfo;
  items: CustomPizza[];
  pricing: OrderPricing;
  paymentMethod: 'razorpay' | 'cod';
  notes?: string;
}

export interface UpdateOrderStatusRequest {
  status: Order['status'];
  adminNotes?: string;
}

// Payment Types
export interface RazorpayConfig {
  success: boolean;
  data: {
    key: string;
    currency: string;
    name: string;
    description: string;
    image: string;
    theme: {
      color: string;
    };
  };
}

export interface CreatePaymentOrderRequest {
  amount: number;
  currency?: string;
}

export interface PaymentOrderResponse {
  success: boolean;
  data: {
    orderId: string;
    amount: number;
    currency: string;
    key: string;
  };
}

export interface VerifyPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  orderData: {
    customerInfo: CustomerInfo;
    items: CustomPizza[];
    pricing: OrderPricing;
  };
}

export interface PaymentVerificationResponse {
  success: boolean;
  message: string;
  data?: {
    orderId: string;
    orderNumber: string;
  };
}

// Admin Dashboard Types
export interface OrderStats {
  todayOrders: number;
  todayRevenue: number;
  monthlyRevenue: number;
  statusBreakdown: Record<string, number>;
}

export interface StockSummary {
  totalItems: number;
  lowStockItems: number;
  criticalItems: number;
  outOfStockItems: number;
  categories: Record<string, number>;
}

export interface AdminStatsResponse {
  success: boolean;
  data: OrderStats;
}

// Order Tracking Types
export interface OrderTracking {
  orderNumber: string;
  status: Order['status'];
  progress: number;
  estimatedDeliveryTime: string;
  actualDeliveryTime?: string;
  createdAt: string;
  items: Array<{
    name: string;
    quantity: number;
    size: string;
  }>;
  customerName: string;
}

export interface TrackOrderResponse {
  success: boolean;
  data: {
    tracking: OrderTracking;
  };
}

// Generic API Response
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// Error Response
export interface ApiError {
  success: false;
  message: string;
  error?: string;
}

// Pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationResponse {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

// Filters
export interface OrderFilters extends PaginationParams {
  status?: Order['status'];
  date?: string;
  search?: string;
}

export interface InventoryFilters {
  category?: InventoryItem['category'];
  active?: boolean;
}
