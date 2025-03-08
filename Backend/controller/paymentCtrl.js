const Cashfree = require("cashfree-sdk");

// Initialize Cashfree Payment Gateway
const paymentGateway = Cashfree.Payouts;
paymentGateway.Init({
  ENV: 'TEST',
  ClientID: process.env.CASHFREE_APP_ID,
  ClientSecret: process.env.CASHFREE_CLIENT_SECRET,
});

const checkout = async (req, res) => {
  try {
    const { amount } = req.body;
    const orderId = 'order_' + Date.now();

    const createOrderData = {
      orderId: orderId,
      orderAmount: amount,
      orderCurrency: 'INR',
    };

    const response = await paymentGateway.Orders.CreateOrder(createOrderData);

    res.json({
      success: true,
      order: response,
    });
  } catch (error) {
    console.error('Cashfree order creation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const paymentVerification = async (req, res) => {
  try {
    const { orderId } = req.query;
    
    const orderStatus = await paymentGateway.Orders.GetStatus({
      orderId: orderId
    });
    
    if (orderStatus.orderStatus === 'PAID') {
      res.json({
        success: true,
        orderId: orderStatus.orderId,
        orderToken: orderStatus.orderToken,
        paymentStatus: 'PAID',
      });
    } else {
      res.json({
        success: false,
        message: 'Payment verification failed',
        status: orderStatus.orderStatus
      });
    }
  } catch (error) {
    console.error('Cashfree payment verification error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  checkout,
  paymentVerification,
};
