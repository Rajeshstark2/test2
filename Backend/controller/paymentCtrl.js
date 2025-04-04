const Order = require("../models/orderModel");

const createOrder = async (req, res) => {
  try {
    const { user, amount, paymentMethod, upiTransactionId, shippingInfo, orderItems } = req.body;

    console.log("Received order data:", {
      user,
      amount,
      paymentMethod,
      upiTransactionId,
      shippingInfo,
      orderItems: orderItems?.length
    });

    if (!user || !amount || !paymentMethod || !shippingInfo || !orderItems) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    if (paymentMethod.toUpperCase() === "UPI" && !upiTransactionId) {
      return res.status(400).json({
        success: false,
        message: "UPI Transaction ID is required for UPI payments"
      });
    }

    // Format order items to ensure they have the correct structure
    const formattedOrderItems = orderItems.map(item => ({
      product: item.product,
      quantity: item.quantity,
      color: item.color,
      price: item.price
    }));

    const orderData = {
      user: user,
      totalPrice: amount,
      totalPriceAfterDiscount: amount,
      orderItems: formattedOrderItems,
      shippingInfo: {
        firstname: shippingInfo.firstname,
        lastname: shippingInfo.lastname,
        address: shippingInfo.address,
        city: shippingInfo.city,
        state: shippingInfo.state,
        country: shippingInfo.country,
        pincode: shippingInfo.pincode,
        other: shippingInfo.other || ""
      },
      paymentInfo: {
        paymentMethod: paymentMethod.toUpperCase(),
        paymentStatus: paymentMethod.toUpperCase() === "UPI" ? "Completed" : "Pending",
        upiTransactionId: paymentMethod.toUpperCase() === "UPI" ? upiTransactionId : null
      },
      orderStatus: "Processing",
      paidAt: paymentMethod.toUpperCase() === "UPI" ? new Date() : null
    };

    console.log("Creating order with data:", orderData);

    const order = await Order.create(orderData);

    console.log("Created order:", {
      _id: order._id,
      paymentMethod: order.paymentInfo.paymentMethod,
      upiTransactionId: order.paymentInfo.upiTransactionId,
      paymentStatus: order.paymentInfo.paymentStatus
    });

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error creating order"
    });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { upiTransactionId } = req.body;

    if (!upiTransactionId) {
      return res.status(400).json({
        success: false,
        message: "UPI Transaction ID is required"
      });
    }

    const order = await Order.findOneAndUpdate(
      { "paymentInfo.upiTransactionId": upiTransactionId },
      { "paymentInfo.paymentStatus": "Completed" },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error verifying payment"
    });
  }
};

module.exports = {
  createOrder,
  verifyPayment
};
