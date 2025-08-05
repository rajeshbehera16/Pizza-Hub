import { RequestHandler } from "express";
import Order, { IOrder } from "../models/Order";
import User from "../models/User";
import { connectToDatabase } from "../database/connection";

// Get user's orders
export const getUserOrders: RequestHandler = async (req, res) => {
  try {
    await connectToDatabase();
    
    const userId = (req as any).userId;
    const { status, limit = 10, page = 1 } = req.query;
    
    let filter: any = { userId };
    if (status) {
      filter.status = status;
    }
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(skip)
      .select('-payment.razorpaySignature'); // Don't expose sensitive payment data

    const total = await Order.countDocuments(filter);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / Number(limit)),
          totalItems: total,
          itemsPerPage: Number(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get specific order by ID
export const getOrderById: RequestHandler = async (req, res) => {
  try {
    await connectToDatabase();
    
    const { orderId } = req.params;
    const userId = (req as any).userId;
    
    const order = await Order.findOne({ _id: orderId, userId })
      .select('-payment.razorpaySignature');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: { order }
    });
  } catch (error) {
    console.error('Get order by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Create new order (used for COD)
export const createOrder: RequestHandler = async (req, res) => {
  try {
    await connectToDatabase();
    
    const userId = (req as any).userId;
    const { customerInfo, items, pricing, paymentMethod, notes } = req.body;

    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Create order
    const order = new Order({
      userId,
      customerInfo: customerInfo || {
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        phone: user.phone,
        address: customerInfo?.address
      },
      items,
      pricing,
      payment: {
        method: paymentMethod || 'cod',
        status: paymentMethod === 'cod' ? 'pending' : 'pending'
      },
      status: 'pending',
      estimatedDeliveryTime: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
      notes
    });

    await order.save();

    // TODO: Update inventory stock levels
    // TODO: Send order confirmation email
    // TODO: Notify admin of new order

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        estimatedDeliveryTime: order.estimatedDeliveryTime
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Cancel order (only if not yet preparing)
export const cancelOrder: RequestHandler = async (req, res) => {
  try {
    await connectToDatabase();
    
    const { orderId } = req.params;
    const userId = (req as any).userId;
    const { reason } = req.body;

    const order = await Order.findOne({ _id: orderId, userId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled at this stage'
      });
    }

    order.status = 'cancelled';
    order.adminNotes = `Cancelled by customer. Reason: ${reason || 'No reason provided'}`;
    await order.save();

    // TODO: Process refund if payment was already made
    // TODO: Restore inventory stock levels
    // TODO: Send cancellation confirmation email

    res.json({
      success: true,
      message: 'Order cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Track order status
export const trackOrder: RequestHandler = async (req, res) => {
  try {
    await connectToDatabase();
    
    const { orderNumber } = req.params;
    
    const order = await Order.findOne({ orderNumber })
      .select('orderNumber status estimatedDeliveryTime actualDeliveryTime createdAt items customerInfo.name');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Calculate progress percentage based on status
    const statusProgress = {
      'pending': 10,
      'confirmed': 25,
      'preparing': 50,
      'ready': 75,
      'out_for_delivery': 90,
      'delivered': 100,
      'cancelled': 0
    };

    const trackingInfo = {
      orderNumber: order.orderNumber,
      status: order.status,
      progress: statusProgress[order.status] || 0,
      estimatedDeliveryTime: order.estimatedDeliveryTime,
      actualDeliveryTime: order.actualDeliveryTime,
      createdAt: order.createdAt,
      items: order.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        size: item.size
      })),
      customerName: order.customerInfo.name
    };

    res.json({
      success: true,
      data: { tracking: trackingInfo }
    });
  } catch (error) {
    console.error('Track order error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Admin: Get all orders
export const getAllOrders: RequestHandler = async (req, res) => {
  try {
    await connectToDatabase();
    
    const { status, date, limit = 20, page = 1, search } = req.query;
    
    let filter: any = {};
    
    if (status) {
      filter.status = status;
    }
    
    if (date) {
      const startDate = new Date(date as string);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      filter.createdAt = { $gte: startDate, $lt: endDate };
    }
    
    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'customerInfo.name': { $regex: search, $options: 'i' } },
        { 'customerInfo.phone': { $regex: search, $options: 'i' } }
      ];
    }
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const orders = await Order.find(filter)
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(skip);

    const total = await Order.countDocuments(filter);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / Number(limit)),
          totalItems: total,
          itemsPerPage: Number(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Admin: Update order status
export const updateOrderStatus: RequestHandler = async (req, res) => {
  try {
    await connectToDatabase();
    
    const { orderId } = req.params;
    const { status, adminNotes } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order status'
      });
    }

    order.status = status;
    if (adminNotes) {
      order.adminNotes = adminNotes;
    }
    
    if (status === 'delivered') {
      order.actualDeliveryTime = new Date();
    }

    await order.save();

    // TODO: Send status update notification to customer
    // TODO: Emit real-time update via WebSocket/Socket.io

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: { order }
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Admin: Get order statistics
export const getOrderStats: RequestHandler = async (req, res) => {
  try {
    await connectToDatabase();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const stats = await Order.aggregate([
      {
        $facet: {
          todayOrders: [
            { $match: { createdAt: { $gte: today, $lt: tomorrow } } },
            { $count: "count" }
          ],
          todayRevenue: [
            { 
              $match: { 
                createdAt: { $gte: today, $lt: tomorrow },
                'payment.status': 'paid'
              } 
            },
            { $group: { _id: null, total: { $sum: "$pricing.total" } } }
          ],
          statusCounts: [
            { $group: { _id: "$status", count: { $sum: 1 } } }
          ],
          monthlyRevenue: [
            {
              $match: {
                createdAt: { $gte: new Date(today.getFullYear(), today.getMonth(), 1) },
                'payment.status': 'paid'
              }
            },
            { $group: { _id: null, total: { $sum: "$pricing.total" } } }
          ]
        }
      }
    ]);

    const result = stats[0];

    res.json({
      success: true,
      data: {
        todayOrders: result.todayOrders[0]?.count || 0,
        todayRevenue: result.todayRevenue[0]?.total || 0,
        monthlyRevenue: result.monthlyRevenue[0]?.total || 0,
        statusBreakdown: result.statusCounts.reduce((acc: any, item: any) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
