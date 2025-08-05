import { RequestHandler } from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import Order from "../models/Order";
import { connectToDatabase } from "../database/connection";

// Initialize Razorpay (use test keys for development)
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_xxxxxxxxxx',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'your_test_secret_key'
});

// Create Razorpay order
export const createOrder: RequestHandler = async (req, res) => {
  try {
    await connectToDatabase();
    
    const { amount, currency = 'INR' } = req.body;
    
    // Convert amount to smallest currency unit (paise for INR)
    const amountInSmallestUnit = Math.round(amount * 100);
    
    const options = {
      amount: amountInSmallestUnit,
      currency,
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        key: process.env.RAZORPAY_KEY_ID || 'rzp_test_xxxxxxxxxx'
      }
    });
  } catch (error) {
    console.error('Create Razorpay order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment order'
    });
  }
};

// Verify Razorpay payment
export const verifyPayment: RequestHandler = async (req, res) => {
  try {
    await connectToDatabase();
    
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      orderData 
    } = req.body;

    // Verify the payment signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || 'your_test_secret_key')
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }

    // Create order in database
    const userId = (req as any).userId; // From auth middleware
    
    const order = new Order({
      userId,
      customerInfo: orderData.customerInfo,
      items: orderData.items,
      pricing: orderData.pricing,
      payment: {
        method: 'razorpay',
        status: 'paid',
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature
      },
      status: 'confirmed',
      estimatedDeliveryTime: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes from now
    });

    await order.save();

    // TODO: Update inventory stock levels
    // TODO: Send order confirmation email
    // TODO: Notify admin of new order

    res.json({
      success: true,
      message: 'Payment verified and order created successfully',
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber
      }
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed'
    });
  }
};

// Handle payment failure
export const handlePaymentFailure: RequestHandler = async (req, res) => {
  try {
    const { razorpay_order_id, error } = req.body;

    // Log the payment failure
    console.error('Payment failed:', {
      orderId: razorpay_order_id,
      error: error
    });

    // TODO: Update order status to failed
    // TODO: Send failure notification

    res.json({
      success: true,
      message: 'Payment failure recorded'
    });
  } catch (error) {
    console.error('Handle payment failure error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to handle payment failure'
    });
  }
};

// Get payment status
export const getPaymentStatus: RequestHandler = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await razorpay.payments.fetch(paymentId);

    res.json({
      success: true,
      data: {
        id: payment.id,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
        method: payment.method,
        captured: payment.captured,
        created_at: payment.created_at
      }
    });
  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment status'
    });
  }
};

// Create refund (Admin only)
export const createRefund: RequestHandler = async (req, res) => {
  try {
    const { paymentId, amount, reason } = req.body;
    
    const refund = await razorpay.payments.refund(paymentId, {
      amount: amount ? Math.round(amount * 100) : undefined, // Partial refund if amount specified
      notes: {
        reason: reason || 'Customer request'
      }
    });

    // TODO: Update order status in database
    // TODO: Send refund confirmation email

    res.json({
      success: true,
      message: 'Refund processed successfully',
      data: {
        refundId: refund.id,
        amount: refund.amount,
        status: refund.status
      }
    });
  } catch (error) {
    console.error('Create refund error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process refund'
    });
  }
};

// Get Razorpay configuration for frontend
export const getConfig: RequestHandler = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        key: process.env.RAZORPAY_KEY_ID || 'rzp_test_xxxxxxxxxx',
        currency: 'INR',
        name: 'PizzaCraft',
        description: 'Fresh pizza delivered hot to your door',
        image: '/pizza-logo.png', // Your logo URL
        theme: {
          color: '#E85A4F' // Your primary color
        }
      }
    });
  } catch (error) {
    console.error('Get config error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment configuration'
    });
  }
};
