const cashfree = require("cashfree-pg");
const Order = require("../models/orderModel");
require("dotenv").config();

// ✅ Correctly Initialize Cashfree SDK
cashfree.PG.init({
  appId: process.env.CASHFREE_APP_ID,
  secretKey: process.env.CASHFREE_SECRET_KEY,
  environment: "PRODUCTION", // Use "SANDBOX" for testing
});

// ✅ Checkout: Create Order and Initialize Payment
const checkout = async (req, res) => {
  try {
    const { totalPrice, totalPriceAfterDiscount, orderItems, shippingInfo } = req.body;

    // Validate required fields
    if (!totalPrice || !orderItems || !shippingInfo) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Create Order in Database
    const newOrder = await Order.create({
      user: req.user._id,
      orderItems,
      totalPrice,
      totalPriceAfterDiscount: totalPriceAfterDiscount || totalPrice,
      shippingInfo,
      orderStatus: "Pending",
      paymentInfo: { paymentStatus: "PENDING" }
    });

    // Create Cashfree Order
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
        return_url: `${process.env.FRONTEND_URL}/order-success/{order_id}`,
        notify_url: `${process.env.BACKEND_URL}/api/user/webhook`,
      },
      order_tags: { type: "ecommerce" },
    };

    console.log("Creating Cashfree order with data:", orderData);

    // ✅ Correct Function Call
    const orderResponse = await cashfree.PG.createOrder(orderData);

    console.log("Cashfree response:", orderResponse);

    if (orderResponse.order_status === "ACTIVE") {
      // Update order with payment details
      await Order.findByIdAndUpdate(
        newOrder._id,
        {
          paymentInfo: {
            paymentStatus: "PENDING",
            cashfreeOrderId: orderResponse.order_id,
            paymentLink: orderResponse.payment_link
          }
        },
        { new: true }
      );

      res.json({
        success: true,
        order: {
          ...orderResponse,
          orderId: newOrder._id,
          payment_link: orderResponse.payment_link
        },
      });
    } else {
      await Order.findByIdAndDelete(newOrder._id);
      res.status(400).json({ success: false, message: "Payment initialization failed", error: orderResponse.message });
    }
  } catch (error) {
    console.error("Cashfree Error:", error);
    res.status(500).json({ success: false, message: "Error processing payment", error: error.message });
  }
};

// ✅ Payment Verification
const paymentVerification = async (req, res) => {
  try {
    const { orderId, paymentId } = req.body;

    if (!orderId || !paymentId) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // ✅ Correct Function Call
    const orderStatus = await cashfree.PG.getOrder({ order_id: orderId });

    if (orderStatus.order_status === "PAID") {
      await Order.findByIdAndUpdate(
        orderId,
        {
          paymentInfo: {
            paymentStatus: "SUCCESS",
            cashfreePaymentId: paymentId,
            cashfreeOrderId: orderId
          },
          orderStatus: "Processing",
        },
        { new: true }
      );

      res.json({ success: true, message: "Payment verified successfully" });
    } else {
      await Order.findByIdAndUpdate(
        orderId,
        {
          paymentInfo: {
            paymentStatus: "FAILED",
            cashfreePaymentId: paymentId,
            cashfreeOrderId: orderId
          },
          orderStatus: "Failed",
        },
        { new: true }
      );

      res.status(400).json({ success: false, message: "Payment verification failed" });
    }
  } catch (error) {
    console.error("Payment Verification Error:", error);
    res.status(500).json({ success: false, message: "Error verifying payment", error: error.message });
  }
};

// ✅ Webhook Handler
const webhookHandler = async (req, res) => {
  try {
    const webhookData = req.body;
    const signature = req.headers["x-webhook-signature"];

    // ✅ Correct Function Call
    const isValid = cashfree.PG.validateWebhook({ webhookData, xSignature: signature });

    if (!isValid) {
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }

    if (webhookData.event === "ORDER_PAID") {
      await Order.findByIdAndUpdate(
        webhookData.order_id,
        {
          paymentInfo: {
            paymentId: webhookData.payment_id,
            paymentStatus: "SUCCESS",
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

// ✅ Export the functions
module.exports = {
  checkout,
  paymentVerification,
  webhookHandler,
};
