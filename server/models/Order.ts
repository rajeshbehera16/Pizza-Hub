import mongoose, { Document, Schema } from 'mongoose';

export interface IPizzaItem {
  id: string;
  name: string;
  base: {
    id: string;
    name: string;
    price: number;
  };
  sauce: {
    id: string;
    name: string;
    price: number;
  };
  cheese: {
    id: string;
    name: string;
    price: number;
  };
  vegetables: Array<{
    id: string;
    name: string;
    price: number;
  }>;
  meat?: Array<{
    id: string;
    name: string;
    price: number;
  }>;
  size: 'small' | 'medium' | 'large';
  quantity: number;
  price: number;
  totalPrice: number;
}

export interface IOrder extends Document {
  orderNumber: string;
  userId: mongoose.Types.ObjectId;
  customerInfo: {
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
  };
  items: IPizzaItem[];
  pricing: {
    subtotal: number;
    tax: number;
    deliveryFee: number;
    discount: number;
    total: number;
  };
  payment: {
    method: 'razorpay' | 'cod';
    status: 'pending' | 'paid' | 'failed' | 'refunded';
    transactionId?: string;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
  };
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';
  estimatedDeliveryTime: Date;
  actualDeliveryTime?: Date;
  notes?: string;
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  customerInfo: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      coordinates: {
        lat: Number,
        lng: Number
      }
    }
  },
  items: [{
    id: { type: String, required: true },
    name: { type: String, required: true },
    base: {
      id: { type: String, required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true }
    },
    sauce: {
      id: { type: String, required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true }
    },
    cheese: {
      id: { type: String, required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true }
    },
    vegetables: [{
      id: { type: String, required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true }
    }],
    meat: [{
      id: { type: String, required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true }
    }],
    size: {
      type: String,
      enum: ['small', 'medium', 'large'],
      required: true
    },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
    totalPrice: { type: Number, required: true }
  }],
  pricing: {
    subtotal: { type: Number, required: true },
    tax: { type: Number, required: true },
    deliveryFee: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true }
  },
  payment: {
    method: {
      type: String,
      enum: ['razorpay', 'cod'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending'
    },
    transactionId: String,
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'pending'
  },
  estimatedDeliveryTime: {
    type: Date,
    required: true
  },
  actualDeliveryTime: Date,
  notes: String,
  adminNotes: String
}, {
  timestamps: true
});

// Generate order number before saving
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const count = await mongoose.model('Order').countDocuments({
      createdAt: {
        $gte: new Date(year, date.getMonth(), date.getDate()),
        $lt: new Date(year, date.getMonth(), date.getDate() + 1)
      }
    });
    this.orderNumber = `PZ-${year}${month}${day}-${String(count + 1).padStart(3, '0')}`;
  }
  next();
});

// Indexes for efficient queries
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ 'payment.status': 1 });

export default mongoose.model<IOrder>('Order', orderSchema);
