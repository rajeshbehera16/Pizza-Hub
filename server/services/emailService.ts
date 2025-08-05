import nodemailer from 'nodemailer';
import { IInventoryItem } from '../models/Inventory';
import { IOrder } from '../models/Order';

// Email configuration
const EMAIL_CONFIG = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || 'your-email@gmail.com',
    pass: process.env.SMTP_PASS || 'your-app-password'
  }
};

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@pizzacraft.com';
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@pizzacraft.com';

// Create transporter
const transporter = nodemailer.createTransporter(EMAIL_CONFIG);

// Verify email configuration
export const verifyEmailConfig = async (): Promise<boolean> => {
  try {
    await transporter.verify();
    console.log('Email service is ready');
    return true;
  } catch (error) {
    console.error('Email service verification failed:', error);
    return false;
  }
};

// Send low stock alert to admin
export const sendLowStockAlert = async (lowStockItems: IInventoryItem[]): Promise<boolean> => {
  try {
    if (lowStockItems.length === 0) {
      return true;
    }

    const itemsList = lowStockItems.map(item => 
      `• ${item.name} (${item.category}): ${item.stock} ${item.unit} remaining (Threshold: ${item.threshold})`
    ).join('\n');

    const urgentItems = lowStockItems.filter(item => item.stock <= 5);
    const warningText = urgentItems.length > 0 
      ? `\n⚠️ URGENT: ${urgentItems.length} items are critically low (≤5 units)!`
      : '';

    const htmlContent = `
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #E85A4F, #F4A261); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">🍕 PizzaCraft Inventory Alert</h1>
          </div>
          
          <div style="padding: 20px; background: #f9f9f9;">
            <h2 style="color: #E85A4F;">Low Stock Alert</h2>
            <p>The following items are running low and need to be restocked:</p>
            
            <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #E85A4F;">
              <h3>Items Below Threshold:</h3>
              <pre style="white-space: pre-wrap; font-family: monospace; background: #f5f5f5; padding: 10px; border-radius: 4px;">${itemsList}</pre>
              ${warningText ? `<p style="color: #d32f2f; font-weight: bold;">${warningText}</p>` : ''}
            </div>
            
            <div style="margin-top: 20px; padding: 15px; background: #fff3cd; border-radius: 8px;">
              <h4>📊 Summary:</h4>
              <ul>
                <li>Total items below threshold: <strong>${lowStockItems.length}</strong></li>
                <li>Critical items (≤5 units): <strong>${urgentItems.length}</strong></li>
              </ul>
            </div>
            
            <div style="margin-top: 20px; text-align: center;">
              <a href="${process.env.ADMIN_DASHBOARD_URL || 'http://localhost:8080/admin'}" 
                 style="background: #E85A4F; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                View Admin Dashboard
              </a>
            </div>
          </div>
          
          <div style="padding: 20px; text-align: center; color: #666; font-size: 12px;">
            <p>This is an automated alert from PizzaCraft Inventory Management System</p>
            <p>Generated on: ${new Date().toLocaleString()}</p>
          </div>
        </body>
      </html>
    `;

    const textContent = `
PizzaCraft Inventory Alert - Low Stock Warning

The following items are running low and need to be restocked:

${itemsList}
${warningText}

Summary:
- Total items below threshold: ${lowStockItems.length}
- Critical items (≤5 units): ${urgentItems.length}

Please restock these items as soon as possible to avoid order fulfillment issues.

Admin Dashboard: ${process.env.ADMIN_DASHBOARD_URL || 'http://localhost:8080/admin'}

Generated on: ${new Date().toLocaleString()}
    `;

    const mailOptions = {
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `🚨 PizzaCraft: ${lowStockItems.length} Items Below Stock Threshold`,
      text: textContent,
      html: htmlContent
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Low stock alert email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Failed to send low stock alert:', error);
    return false;
  }
};

// Send order confirmation email to customer
export const sendOrderConfirmation = async (order: IOrder): Promise<boolean> => {
  try {
    const itemsList = order.items.map(item => 
      `${item.quantity}x ${item.name} (${item.size}) - $${item.totalPrice.toFixed(2)}`
    ).join('\n');

    const htmlContent = `
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #E85A4F, #F4A261); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">🍕 Order Confirmed!</h1>
          </div>
          
          <div style="padding: 20px;">
            <h2>Thank you for your order, ${order.customerInfo.name}!</h2>
            <p>Your delicious pizza is being prepared with love.</p>
            
            <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3>Order Details:</h3>
              <p><strong>Order Number:</strong> ${order.orderNumber}</p>
              <p><strong>Status:</strong> ${order.status}</p>
              <p><strong>Estimated Delivery:</strong> ${new Date(order.estimatedDeliveryTime).toLocaleTimeString()}</p>
            </div>
            
            <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #ddd;">
              <h3>Your Items:</h3>
              <pre style="white-space: pre-wrap; font-family: monospace;">${itemsList}</pre>
              
              <div style="border-top: 1px solid #ddd; padding-top: 10px; margin-top: 10px;">
                <p><strong>Total: $${order.pricing.total.toFixed(2)}</strong></p>
              </div>
            </div>
            
            <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h4>🚚 Delivery Address:</h4>
              <p>${order.customerInfo.address.street}<br>
                 ${order.customerInfo.address.city}, ${order.customerInfo.address.state} ${order.customerInfo.address.zipCode}</p>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:8080'}/orders/track/${order.orderNumber}" 
                 style="background: #E85A4F; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Track Your Order
              </a>
            </div>
          </div>
          
          <div style="padding: 20px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #ddd;">
            <p>Questions? Contact us at support@pizzacraft.com or call (555) 123-PIZZA</p>
          </div>
        </body>
      </html>
    `;

    const mailOptions = {
      from: FROM_EMAIL,
      to: order.customerInfo.email,
      subject: `🍕 Order Confirmed - ${order.orderNumber}`,
      html: htmlContent
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Order confirmation email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Failed to send order confirmation email:', error);
    return false;
  }
};

// Send order status update email
export const sendOrderStatusUpdate = async (order: IOrder, previousStatus: string): Promise<boolean> => {
  try {
    const statusMessages = {
      confirmed: "Your order has been confirmed and is being prepared! 👨‍🍳",
      preparing: "Our chefs are now preparing your delicious pizza! 🍕",
      ready: "Your pizza is ready and will be out for delivery soon! 📦",
      out_for_delivery: "Your pizza is on its way to you! 🚚",
      delivered: "Your pizza has been delivered! Enjoy! 🎉",
      cancelled: "Your order has been cancelled. 😔"
    };

    const message = statusMessages[order.status as keyof typeof statusMessages] || "Your order status has been updated.";

    const htmlContent = `
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #E85A4F, #F4A261); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">🍕 Order Update</h1>
          </div>
          
          <div style="padding: 20px;">
            <h2>Hi ${order.customerInfo.name}!</h2>
            <p style="font-size: 18px; color: #E85A4F;">${message}</p>
            
            <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3>Order ${order.orderNumber}</h3>
              <p><strong>Status:</strong> ${order.status.replace('_', ' ').toUpperCase()}</p>
              ${order.estimatedDeliveryTime ? `<p><strong>Estimated Delivery:</strong> ${new Date(order.estimatedDeliveryTime).toLocaleTimeString()}</p>` : ''}
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:8080'}/orders/track/${order.orderNumber}" 
                 style="background: #E85A4F; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Track Your Order
              </a>
            </div>
          </div>
        </body>
      </html>
    `;

    const mailOptions = {
      from: FROM_EMAIL,
      to: order.customerInfo.email,
      subject: `📱 Order ${order.orderNumber} - ${order.status.replace('_', ' ').toUpperCase()}`,
      html: htmlContent
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Order status update email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Failed to send order status update email:', error);
    return false;
  }
};

// Send new order notification to admin
export const sendNewOrderNotification = async (order: IOrder): Promise<boolean> => {
  try {
    const itemsList = order.items.map(item => 
      `${item.quantity}x ${item.name} (${item.size}) - $${item.totalPrice.toFixed(2)}`
    ).join('\n');

    const htmlContent = `
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #E85A4F, #F4A261); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">🍕 New Order Received!</h1>
          </div>
          
          <div style="padding: 20px;">
            <h2>Order ${order.orderNumber}</h2>
            
            <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3>Customer Information:</h3>
              <p><strong>Name:</strong> ${order.customerInfo.name}</p>
              <p><strong>Phone:</strong> ${order.customerInfo.phone}</p>
              <p><strong>Email:</strong> ${order.customerInfo.email}</p>
              <p><strong>Address:</strong> ${order.customerInfo.address.street}, ${order.customerInfo.address.city}, ${order.customerInfo.address.state} ${order.customerInfo.address.zipCode}</p>
            </div>
            
            <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #ddd;">
              <h3>Order Items:</h3>
              <pre style="white-space: pre-wrap; font-family: monospace;">${itemsList}</pre>
              
              <div style="border-top: 1px solid #ddd; padding-top: 10px; margin-top: 10px;">
                <p><strong>Payment Method:</strong> ${order.payment.method.toUpperCase()}</p>
                <p><strong>Payment Status:</strong> ${order.payment.status.toUpperCase()}</p>
                <p><strong>Total: $${order.pricing.total.toFixed(2)}</strong></p>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.ADMIN_DASHBOARD_URL || 'http://localhost:8080/admin'}" 
                 style="background: #E85A4F; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                View in Admin Dashboard
              </a>
            </div>
          </div>
        </body>
      </html>
    `;

    const mailOptions = {
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `🔔 New Order: ${order.orderNumber} - $${order.pricing.total.toFixed(2)}`,
      html: htmlContent
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('New order notification email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Failed to send new order notification:', error);
    return false;
  }
};

// Initialize email service
export const initEmailService = async (): Promise<void> => {
  const isReady = await verifyEmailConfig();
  if (!isReady) {
    console.warn('Email service is not configured properly. Email notifications will be disabled.');
  }
};
