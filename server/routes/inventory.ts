import { RequestHandler } from "express";
import Inventory, { IInventoryItem } from "../models/Inventory";
import { connectToDatabase } from "../database/connection";

// Get all inventory items (with optional category filter)
export const getInventory: RequestHandler = async (req, res) => {
  try {
    await connectToDatabase();
    
    const { category, active } = req.query;
    let filter: any = {};
    
    if (category) {
      filter.category = category;
    }
    
    if (active !== undefined) {
      filter.isActive = active === 'true';
    }

    const items = await Inventory.find(filter).sort({ category: 1, name: 1 });

    res.json({
      success: true,
      data: { items }
    });
  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get inventory by category for pizza builder
export const getInventoryByCategory: RequestHandler = async (req, res) => {
  try {
    await connectToDatabase();
    
    const inventory = await Inventory.aggregate([
      { $match: { isActive: true, stock: { $gt: 0 } } },
      {
        $group: {
          _id: '$category',
          items: {
            $push: {
              id: '$_id',
              name: '$name',
              description: '$description',
              price: '$price',
              stock: '$stock',
              imageUrl: '$imageUrl'
            }
          }
        }
      }
    ]);

    const categorizedInventory = inventory.reduce((acc, cat) => {
      acc[cat._id] = cat.items;
      return acc;
    }, {});

    res.json({
      success: true,
      data: categorizedInventory
    });
  } catch (error) {
    console.error('Get categorized inventory error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Create new inventory item (Admin only)
export const createInventoryItem: RequestHandler = async (req, res) => {
  try {
    await connectToDatabase();
    
    const { name, category, description, price, stock, threshold, unit, imageUrl } = req.body;

    const item = new Inventory({
      name,
      category,
      description,
      price,
      stock,
      threshold,
      unit,
      imageUrl
    });

    await item.save();

    res.status(201).json({
      success: true,
      message: 'Inventory item created successfully',
      data: { item }
    });
  } catch (error) {
    console.error('Create inventory item error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update inventory item (Admin only)
export const updateInventoryItem: RequestHandler = async (req, res) => {
  try {
    await connectToDatabase();
    
    const { id } = req.params;
    const updates = req.body;

    const item = await Inventory.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    res.json({
      success: true,
      message: 'Inventory item updated successfully',
      data: { item }
    });
  } catch (error) {
    console.error('Update inventory item error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Delete inventory item (Admin only)
export const deleteInventoryItem: RequestHandler = async (req, res) => {
  try {
    await connectToDatabase();
    
    const { id } = req.params;

    const item = await Inventory.findByIdAndDelete(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    res.json({
      success: true,
      message: 'Inventory item deleted successfully'
    });
  } catch (error) {
    console.error('Delete inventory item error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update stock levels (used when orders are placed)
export const updateStock: RequestHandler = async (req, res) => {
  try {
    await connectToDatabase();
    
    const { items } = req.body; // Array of { id, quantity }

    const stockUpdates = items.map(async (item: { id: string, quantity: number }) => {
      const inventoryItem = await Inventory.findById(item.id);
      if (!inventoryItem) {
        throw new Error(`Inventory item ${item.id} not found`);
      }
      
      if (inventoryItem.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${inventoryItem.name}. Available: ${inventoryItem.stock}, Required: ${item.quantity}`);
      }
      
      inventoryItem.stock -= item.quantity;
      return inventoryItem.save();
    });

    await Promise.all(stockUpdates);

    res.json({
      success: true,
      message: 'Stock levels updated successfully'
    });
  } catch (error) {
    console.error('Update stock error:', error);
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Internal server error'
    });
  }
};

// Get low stock items (for admin alerts)
export const getLowStockItems: RequestHandler = async (req, res) => {
  try {
    await connectToDatabase();
    
    const lowStockItems = await Inventory.find({
      $expr: { $lte: ['$stock', '$threshold'] },
      isActive: true
    }).sort({ category: 1, name: 1 });

    res.json({
      success: true,
      data: { items: lowStockItems }
    });
  } catch (error) {
    console.error('Get low stock items error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Seed initial inventory data
export const seedInventory: RequestHandler = async (req, res) => {
  try {
    await connectToDatabase();
    
    // Check if inventory already exists
    const existingItems = await Inventory.countDocuments();
    if (existingItems > 0) {
      return res.status(400).json({
        success: false,
        message: 'Inventory already contains items'
      });
    }

    const seedData = [
      // Pizza Bases
      { name: "Classic Thin Crust", category: "base", description: "Light, crispy, and traditional", price: 0, stock: 50, threshold: 20, unit: "pieces" },
      { name: "Thick Crust", category: "base", description: "Fluffy and filling base", price: 150, stock: 40, threshold: 15, unit: "pieces" },
      { name: "Stuffed Crust", category: "base", description: "Cheese-filled crust edges", price: 300, stock: 30, threshold: 10, unit: "pieces" },
      { name: "Gluten-Free", category: "base", description: "Made with alternative flour", price: 200, stock: 25, threshold: 10, unit: "pieces" },
      { name: "Whole Wheat", category: "base", description: "Healthy whole grain option", price: 80, stock: 35, threshold: 15, unit: "pieces" },

      // Sauces
      { name: "Classic Tomato", category: "sauce", description: "Traditional pizza sauce", price: 0, stock: 100, threshold: 30, unit: "servings" },
      { name: "BBQ Sauce", category: "sauce", description: "Sweet and tangy BBQ", price: 80, stock: 80, threshold: 25, unit: "servings" },
      { name: "White Sauce", category: "sauce", description: "Creamy garlic alfredo", price: 120, stock: 70, threshold: 20, unit: "servings" },
      { name: "Pesto", category: "sauce", description: "Fresh basil pesto", price: 150, stock: 60, threshold: 15, unit: "servings" },
      { name: "Buffalo Sauce", category: "sauce", description: "Spicy buffalo wing sauce", price: 120, stock: 50, threshold: 15, unit: "servings" },

      // Cheeses
      { name: "Mozzarella", category: "cheese", description: "Classic stretchy cheese", price: 0, stock: 200, threshold: 50, unit: "servings" },
      { name: "Cheddar", category: "cheese", description: "Sharp and flavorful", price: 1, stock: 150, threshold: 40, unit: "servings" },
      { name: "Parmesan", category: "cheese", description: "Aged and nutty", price: 2, stock: 100, threshold: 30, unit: "servings" },
      { name: "Four Cheese Blend", category: "cheese", description: "Mozzarella, cheddar, parmesan, provolone", price: 3, stock: 80, threshold: 25, unit: "servings" },
      { name: "Vegan Cheese", category: "cheese", description: "Plant-based alternative", price: 2, stock: 60, threshold: 20, unit: "servings" },

      // Vegetables
      { name: "Mushrooms", category: "vegetables", description: "Fresh button mushrooms", price: 1, stock: 120, threshold: 30, unit: "servings" },
      { name: "Bell Peppers", category: "vegetables", description: "Colorful bell peppers", price: 1, stock: 100, threshold: 25, unit: "servings" },
      { name: "Red Onions", category: "vegetables", description: "Sweet red onions", price: 0.5, stock: 150, threshold: 40, unit: "servings" },
      { name: "Black Olives", category: "vegetables", description: "Mediterranean olives", price: 1.5, stock: 90, threshold: 25, unit: "servings" },
      { name: "Tomatoes", category: "vegetables", description: "Fresh cherry tomatoes", price: 1, stock: 80, threshold: 20, unit: "servings" },
      { name: "Spinach", category: "vegetables", description: "Fresh baby spinach", price: 1, stock: 70, threshold: 20, unit: "servings" },
      { name: "Jalapeños", category: "vegetables", description: "Spicy jalapeño peppers", price: 1, stock: 60, threshold: 15, unit: "servings" },
      { name: "Corn", category: "vegetables", description: "Sweet corn kernels", price: 1, stock: 80, threshold: 20, unit: "servings" },

      // Meat
      { name: "Pepperoni", category: "meat", description: "Classic spicy pepperoni", price: 2, stock: 100, threshold: 25, unit: "servings" },
      { name: "Italian Sausage", category: "meat", description: "Seasoned pork sausage", price: 2.5, stock: 80, threshold: 20, unit: "servings" },
      { name: "Grilled Chicken", category: "meat", description: "Tender grilled chicken", price: 3, stock: 70, threshold: 20, unit: "servings" },
      { name: "Ham", category: "meat", description: "Smoked ham slices", price: 2, stock: 60, threshold: 15, unit: "servings" },
      { name: "Bacon", category: "meat", description: "Crispy bacon strips", price: 2.5, stock: 50, threshold: 15, unit: "servings" },
      { name: "Ground Beef", category: "meat", description: "Seasoned ground beef", price: 2.5, stock: 60, threshold: 15, unit: "servings" }
    ];

    await Inventory.insertMany(seedData);

    res.json({
      success: true,
      message: 'Inventory seeded successfully',
      data: { count: seedData.length }
    });
  } catch (error) {
    console.error('Seed inventory error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
