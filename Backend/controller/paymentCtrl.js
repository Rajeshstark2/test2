require('dotenv').config(); // Load environment variables
const axios = require("axios");

const checkout = async (req, res) => {
  const { amount } = req.body;
  const options = {
    method: 'POST',
    url: 'https://api.cashfree.com/pg/orders',
    headers: {
      'x-client-id': process.env.CASHFREE_APP_ID, // Use environment variable
      'x-client-secret': process.env.CASHFREE_SECRET_KEY, // Use environment variable
      'Content-Type': 'application/json',
    },
    data: {
      order_id: `order_${Date.now()}`,
      order_amount: amount,
      order_currency: 'INR',
      order_note: 'Test Order',
    },
  };

  try {
    const response = await axios.request(options);
    res.json({
      success: true,
      order: response.data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating Cashfree order',
    });
  }
};

const paymentVerification = async (req, res) => {
  const { orderId, paymentId } = req.body;
  const options = {
    method: 'GET',
    url: `https://api.cashfree.com/pg/orders/${orderId}/payments/${paymentId}`,
    headers: {
      'x-client-id': process.env.CASHFREE_APP_ID, // Use environment variable
      'x-client-secret': process.env.CASHFREE_SECRET_KEY, // Use environment variable
      'Content-Type': 'application/json',
    },
  };

  try {
    const response = await axios.request(options);
    res.json({
      success: true,
      paymentDetails: response.data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error verifying Cashfree payment',
    });
  }
};

module.exports = {
  checkout,
  paymentVerification,
};
