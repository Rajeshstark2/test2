const { Payouts } = require('cashfree-sdk');

const instance = new Payouts({
  env: 'sandbox', // Use 'production' for live
  appId: process.env.CASHFREE_APP_ID,
  clientId: process.env.CASHFREE_CLIENT_ID,
  clientSecret: process.env.CASHFREE_CLIENT_SECRET,
});

const checkout = async (req, res) => {
  try {
    const { amount } = req.body;
    const orderId = `order_${Date.now()}`;
    
    const orderData = {
      orderId: orderId,
      orderAmount: amount,
      orderCurrency: 'INR',
      orderNote: 'Order from Cart Corner',
      customerDetails: {
        customerId: req.user._id,
        customerName: req.user.firstname + ' ' + req.user.lastname,
        customerEmail: req.user.email,
        customerPhone: req.user.mobile,
      },
      orderMeta: {
        returnUrl: `${process.env.FRONTEND_URL}/payment-verification?order_id={order_id}&order_token={order_token}`,
        notifyUrl: `${process.env.BACKEND_URL}/api/user/order/payment-webhook`,
      },
    };

    const order = await instance.createOrder(orderData);
    
    res.json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const paymentVerification = async (req, res) => {
  try {
    const { orderId, orderToken } = req.query;
    
    const orderStatus = await instance.getOrderStatus(orderId);
    
    if (orderStatus.orderStatus === 'PAID') {
      res.json({
        success: true,
        orderId,
        orderToken,
        paymentStatus: 'PAID',
      });
    } else {
      res.json({
        success: false,
        message: 'Payment failed',
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  checkout,
  paymentVerification,
};
