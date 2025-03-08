const cashfree = require("@cashfreepayments/cashfree-sdk");

// Initialize Cashfree
const cf = new cashfree.Cashfree({
  env: 'PROD', // 'TEST' or 'PROD'
  apiVersion: '2022-09-01',
  appId: process.env.CASHFREE_APP_ID,
  secretKey: process.env.CASHFREE_SECRET_KEY
});

const createOrder = async (req, res) => {
  try {
    const { amount } = req.body;
    
    const orderData = {
      order_amount: amount,
      order_currency: "INR",
      customer_details: {
        customer_id: req.user._id,
        customer_email: req.user.email,
        customer_phone: req.user.mobile || "",
      },
      order_meta: {
        return_url: `${process.env.FRONTEND_URL}/payment-status?order_id={order_id}`,
        notify_url: `${process.env.BACKEND_URL}/api/payment/webhook`,
      }
    };

    const order = await cf.orders.createOrder(orderData);
    
    res.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { order_id, payment_id } = req.body;
    
    const payment = await cf.orders.getPayment(order_id);
    
    if (payment.payment_status === "SUCCESS") {
      res.json({
        success: true,
        paymentStatus: payment.payment_status,
        cashfreeOrderId: order_id,
        cashfreePaymentId: payment_id,
      });
    } else {
      throw new Error("Payment verification failed");
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

const handleWebhook = async (req, res) => {
  try {
    const webhookData = req.body;
    const signature = req.headers["x-webhook-signature"];
    
    // Verify webhook signature
    const isValid = cf.verifyWebhookSignature(
      JSON.stringify(webhookData),
      signature,
      process.env.CASHFREE_WEBHOOK_SECRET
    );

    if (!isValid) {
      throw new Error("Invalid webhook signature");
    }

    // Handle webhook event
    if (webhookData.event === "PAYMENT_SUCCESS") {
      // Update order status in your database
      console.log("Payment successful for order:", webhookData.orderId);
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  handleWebhook,
};
