const cashfree = require("cashfree-pg");
require("dotenv").config();

// Configure Cashfree
cashfree.XClientId = process.env.CASHFREE_APP_ID;
cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY;
cashfree.XEnvironment = "PROD"; // Change to "PROD" for live payments

// Checkout Function (Create Order)
const checkout = async (req, res) => {
  try {
    const { amount, orderId, customerEmail, customerPhone } = req.body;

    const orderData = {
      order_amount: amount,
      order_currency: "INR",
      order_id: orderId, // Unique order ID
      customer_details: {
        customer_id: `cust_${Date.now()}`, // Unique customer ID
        customer_email: customerEmail,
        customer_phone: customerPhone,
      },
      order_meta: {
        return_url: `https://prabanjampgm.com/payment-success?order_id={order_id}`,
      },
    };

    const orderResponse = await cashfree.PGCreateOrder(orderData);

    if (orderResponse.status === "ACTIVE") {
      res.json({
        success: true,
        order: orderResponse,
      });
    } else {
      res.status(400).json({ success: false, message: "Order creation failed" });
    }
  } catch (error) {
    console.error("Cashfree Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Payment Verification Function
const paymentVerification = async (req, res) => {
  try {
    const { orderId } = req.body;

    const paymentDetails = await cashfree.PGFetchOrder(orderId);

    if (paymentDetails.order_status === "PAID") {
      res.json({
        success: true,
        message: "Payment verified",
        paymentDetails,
      });
    } else {
      res.json({
        success: false,
        message: "Payment not completed",
        paymentDetails,
      });
    }
  } catch (error) {
    console.error("Payment Verification Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  checkout,
  paymentVerification,
};
