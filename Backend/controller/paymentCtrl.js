const cashfree = require("cashfree-pg");
const Order = require("../models/orderModel");
require("dotenv").config();

// Configure Cashfree
cashfree.XClientId = process.env.CASHFREE_APP_ID;
cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY;
cashfree.XEnvironment = "PROD"; // Changed to PROD for production

// Create Order and Initialize Payment
const checkout = async (req, res) => {
  try {
    const { 
      totalPrice,
      totalPriceAfterDiscount,
      orderItems,
      shippingInfo 
    } = req.body;

    // First create the order in your database
    const newOrder = await Order.create({
      user: req.user._id,
      orderItems,
      totalPrice,
      totalPriceAfterDiscount,
      shippingInfo,
    });

    // Create Cashfree order with production settings
    const orderData = {
      order_amount: totalPriceAfterDiscount || totalPrice,
      order_currency: "INR",
      order_id: newOrder._id.toString(),
      customer_details: {
        customer_id: req.user._id.toString(),
        customer_email: req.user.email,
        customer_phone: shippingInfo.mobile || "",
      },
      order_meta: {
        return_url: `${process.env.FRONTEND_URL}/order-success/{order_id}`, // Updated return URL
        notify_url: `${process.env.BACKEND_URL}/api/payment/webhook`,
      },
      order_tags: {
        type: "ecommerce",
      },
    };

    const orderResponse = await cashfree.PGCreateOrder(orderData);

    if (orderResponse.status === "ACTIVE") {
      res.json({
        success: true,
        order: {
          ...orderResponse,
          orderId: newOrder._id,
          paymentLink: orderResponse.payment_link,
        },
      });
    } else {
      // If order creation fails, delete the order from your database
      await Order.findByIdAndDelete(newOrder._id);
      res.status(400).json({ 
        success: false, 
        message: "Payment initialization failed" 
      });
    }
  } catch (error) {
    console.error("Cashfree Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error processing payment",
      error: error.message 
    });
  }
};

// Payment Verification
const paymentVerification = async (req, res) => {
  try {
    const { orderId, paymentId, txStatus } = req.body;

    const orderStatus = await cashfree.PGFetchOrder({
      order_id: orderId,
    });

    if (orderStatus.order_status === "PAID") {
      // Update order status in database
      await Order.findByIdAndUpdate(
        orderId,
        {
          paymentInfo: {
            paymentId: paymentId,
            status: "Success",
          },
          orderStatus: "Processing",
        },
        { new: true }
      );

      res.json({
        success: true,
        message: "Payment verified successfully",
      });
    } else {
      // If payment failed, update order status
      await Order.findByIdAndUpdate(
        orderId,
        {
          paymentInfo: {
            paymentId: paymentId,
            status: "Failed",
          },
          orderStatus: "Failed",
        },
        { new: true }
      );

      res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }
  } catch (error) {
    console.error("Payment Verification Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error verifying payment",
      error: error.message 
    });
  }
};

// Webhook handler
const webhookHandler = async (req, res) => {
  try {
    const webhookData = req.body;
    const signature = req.headers["x-webhook-signature"];

    // Verify webhook signature
    const isValid = cashfree.PGVerifyWebhookSignature(webhookData, signature, process.env.CASHFREE_SECRET_KEY);

    if (!isValid) {
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }

    if (webhookData.event === "ORDER_PAID") {
      await Order.findByIdAndUpdate(
        webhookData.order_id,
        {
          paymentInfo: {
            paymentId: webhookData.payment_id,
            status: "Success",
          },
          orderStatus: "Processing",
        },
        { new: true }
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Webhook Error:", error);
    res.status(500).json({ success: false });
  }
};

module.exports = {
  checkout,
  paymentVerification,
  webhookHandler,
};
