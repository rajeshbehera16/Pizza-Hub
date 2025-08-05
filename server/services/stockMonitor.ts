import cron from 'node-cron';
import Inventory from '../models/Inventory';
import { sendLowStockAlert } from './emailService';

// Track when last alert was sent to avoid spam
let lastAlertSent: Date | null = null;
const ALERT_COOLDOWN_HOURS = 6; // Send alerts at most every 6 hours

// Check for low stock items
export const checkLowStockItems = async (): Promise<void> => {
  try {
    console.log('Checking inventory for low stock items...');

    // Find items where current stock is at or below threshold
    const lowStockItems = await Inventory.find({
      $expr: { $lte: ['$stock', '$threshold'] },
      isActive: true
    }).sort({ category: 1, name: 1 });

    if (lowStockItems.length === 0) {
      console.log('✅ All inventory items are above threshold levels');
      return;
    }

    console.log(`⚠️ Found ${lowStockItems.length} items below threshold:`);
    lowStockItems.forEach(item => {
      console.log(`  - ${item.name}: ${item.stock}/${item.threshold} ${item.unit}`);
    });

    // Check if we should send an alert (respect cooldown period)
    const now = new Date();
    const shouldSendAlert = !lastAlertSent || 
      (now.getTime() - lastAlertSent.getTime()) > (ALERT_COOLDOWN_HOURS * 60 * 60 * 1000);

    if (shouldSendAlert) {
      console.log('📧 Sending low stock alert email...');
      const emailSent = await sendLowStockAlert(lowStockItems);
      
      if (emailSent) {
        lastAlertSent = now;
        console.log('✅ Low stock alert email sent successfully');
        
        // Log the alert in database (you could create an AlertLog model)
        console.log(`Alert sent for ${lowStockItems.length} items at ${now.toISOString()}`);
      } else {
        console.error('❌ Failed to send low stock alert email');
      }
    } else {
      const nextAlertTime = new Date(lastAlertSent.getTime() + (ALERT_COOLDOWN_HOURS * 60 * 60 * 1000));
      console.log(`⏰ Alert cooldown active. Next alert can be sent after ${nextAlertTime.toLocaleString()}`);
    }
  } catch (error) {
    console.error('Error checking low stock items:', error);
  }
};

// Update stock levels after order
export const updateStockAfterOrder = async (orderItems: Array<{
  base: { id: string };
  sauce: { id: string };
  cheese: { id: string };
  vegetables: Array<{ id: string }>;
  meat: Array<{ id: string }>;
  quantity: number;
}>): Promise<boolean> => {
  try {
    console.log('Updating inventory stock after order...');

    for (const item of orderItems) {
      const updates: Array<{ id: string; quantity: number }> = [];

      // Add base, sauce, cheese (1 unit per pizza)
      updates.push(
        { id: item.base.id, quantity: item.quantity },
        { id: item.sauce.id, quantity: item.quantity },
        { id: item.cheese.id, quantity: item.quantity }
      );

      // Add vegetables and meat
      item.vegetables.forEach(veg => {
        updates.push({ id: veg.id, quantity: item.quantity });
      });

      item.meat.forEach(meat => {
        updates.push({ id: meat.id, quantity: item.quantity });
      });

      // Update each ingredient's stock
      for (const update of updates) {
        const inventoryItem = await Inventory.findById(update.id);
        if (inventoryItem) {
          if (inventoryItem.stock >= update.quantity) {
            inventoryItem.stock -= update.quantity;
            await inventoryItem.save();
            console.log(`Updated ${inventoryItem.name}: -${update.quantity} (now ${inventoryItem.stock})`);
          } else {
            console.warn(`Warning: Insufficient stock for ${inventoryItem.name}. Available: ${inventoryItem.stock}, Required: ${update.quantity}`);
            // You might want to handle this case differently
          }
        } else {
          console.error(`Inventory item not found: ${update.id}`);
        }
      }
    }

    // Check for low stock after update
    await checkLowStockItems();
    
    return true;
  } catch (error) {
    console.error('Error updating stock after order:', error);
    return false;
  }
};

// Initialize stock monitoring jobs
export const initStockMonitoring = (): void => {
  console.log('🔍 Initializing stock monitoring system...');

  // Check for low stock every hour
  cron.schedule('0 * * * *', async () => {
    console.log('⏰ Running hourly stock check...');
    await checkLowStockItems();
  });

  // Daily detailed stock report at 9 AM
  cron.schedule('0 9 * * *', async () => {
    console.log('📊 Running daily stock report...');
    try {
      const allItems = await Inventory.find({ isActive: true }).sort({ category: 1, name: 1 });
      const categories = ['base', 'sauce', 'cheese', 'vegetables', 'meat'];
      
      console.log('\n=== DAILY INVENTORY REPORT ===');
      categories.forEach(category => {
        const categoryItems = allItems.filter(item => item.category === category);
        console.log(`\n${category.toUpperCase()}:`);
        categoryItems.forEach(item => {
          const status = item.stock <= item.threshold ? '⚠️ LOW' : '✅ OK';
          console.log(`  ${item.name}: ${item.stock} ${item.unit} ${status}`);
        });
      });
      console.log('\n=== END REPORT ===\n');
    } catch (error) {
      console.error('Error generating daily stock report:', error);
    }
  });

  // Emergency stock check every 15 minutes during business hours (11 AM - 11 PM)
  cron.schedule('*/15 11-23 * * *', async () => {
    const now = new Date();
    const hour = now.getHours();
    
    if (hour >= 11 && hour <= 23) {
      console.log('🚨 Running emergency stock check during business hours...');
      
      // Check for critically low items (stock <= 5)
      const criticalItems = await Inventory.find({
        stock: { $lte: 5 },
        isActive: true
      });

      if (criticalItems.length > 0) {
        console.log(`🚨 CRITICAL: ${criticalItems.length} items have 5 or fewer units remaining!`);
        criticalItems.forEach(item => {
          console.log(`  🔴 ${item.name}: ${item.stock} ${item.unit} remaining`);
        });
        
        // Send immediate alert for critical items
        await sendLowStockAlert(criticalItems);
      }
    }
  });

  console.log('✅ Stock monitoring system initialized');
  console.log('  📅 Hourly stock checks scheduled');
  console.log('  📊 Daily reports at 9:00 AM');
  console.log('  🚨 Emergency checks every 15 minutes (11 AM - 11 PM)');
  
  // Run initial check
  setTimeout(async () => {
    console.log('🔄 Running initial stock check...');
    await checkLowStockItems();
  }, 5000); // Wait 5 seconds after startup
};

// Manual trigger for low stock check (useful for testing)
export const triggerLowStockCheck = async (): Promise<void> => {
  console.log('🔧 Manual low stock check triggered');
  await checkLowStockItems();
};

// Get stock summary for admin dashboard
export const getStockSummary = async (): Promise<{
  totalItems: number;
  lowStockItems: number;
  criticalItems: number;
  outOfStockItems: number;
  categories: Record<string, number>;
}> => {
  try {
    const allItems = await Inventory.find({ isActive: true });
    
    const summary = {
      totalItems: allItems.length,
      lowStockItems: allItems.filter(item => item.stock <= item.threshold).length,
      criticalItems: allItems.filter(item => item.stock <= 5).length,
      outOfStockItems: allItems.filter(item => item.stock === 0).length,
      categories: {} as Record<string, number>
    };

    // Count items by category
    allItems.forEach(item => {
      summary.categories[item.category] = (summary.categories[item.category] || 0) + 1;
    });

    return summary;
  } catch (error) {
    console.error('Error getting stock summary:', error);
    return {
      totalItems: 0,
      lowStockItems: 0,
      criticalItems: 0,
      outOfStockItems: 0,
      categories: {}
    };
  }
};
