import mongoose, { Document, Schema } from 'mongoose';

export interface IInventoryItem extends Document {
  name: string;
  category: 'base' | 'sauce' | 'cheese' | 'vegetables' | 'meat';
  description: string;
  price: number;
  stock: number;
  threshold: number; // Minimum stock before alert
  unit: string; // e.g., 'pieces', 'kg', 'liters'
  isActive: boolean;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const inventorySchema = new Schema<IInventoryItem>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['base', 'sauce', 'cheese', 'vegetables', 'meat']
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  stock: {
    type: Number,
    required: true,
    min: 0
  },
  threshold: {
    type: Number,
    required: true,
    min: 0,
    default: 10
  },
  unit: {
    type: String,
    required: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  imageUrl: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
inventorySchema.index({ category: 1, isActive: 1 });
inventorySchema.index({ stock: 1, threshold: 1 });

export default mongoose.model<IInventoryItem>('Inventory', inventorySchema);
