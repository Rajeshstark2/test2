const { Cashfree } = require("@cashfreepayments/cashfree-sdk");

// Initialize Cashfree
Cashfree.XClientId = "your-client-id"; // Replace with your client ID
Cashfree.XClientSecret = "your-client-secret"; // Replace with your client secret
Cashfree.XEnvironment = Cashfree.Environment.Production; // Use Production for live environment

const checkout = async (req, res) => {
  const { amount } = req.body;

  try {
    const orderResponse = await Cashfree.PGCreateOrder({
      order_id: `order_${Date.now()}`, // Unique order ID
      order_amount: amount * 100, // Amount in paise (e.g., 100 INR = 10000 paise)
      order_currency: "INR",
      customer_details: {
        customer_id: "cust_12345", // Replace with your customer ID
        customer_name: "John Doe", // Replace with customer name
        customer_email: "john.doe@example.com", // Replace with customer email
        customer_phone: "9876543210", // Replace with customer phone
      },
      order_meta: {
        return_url: "https://test2-1-t9x9.onrender.com/", // Replace with your return URL
      },
    });

    res.json({
      success: true,
      order: orderResponse,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create order",
    });
  }
};

const paymentVerification = async (req, res) => {
  const { orderId, paymentId } = req.body;

  try {
    const paymentDetails = await Cashfree.PGOrderFetchPayments(orderId);

    if (paymentDetails && paymentDetails.payment_id === paymentId) {
      res.json({
        success: true,
        orderId,
        paymentId,
      });
    } else {
      res.status(400).json({
        success: false,
        error: "Payment verification failed",
      });
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({
      success: false,
      error: "Failed to verify payment",
    });
  }
};

module.exports = {
  checkout,
  paymentVerification,
};
