const Order = require("../models/orderModel");

// ✅ Handle COD Order
const placeCODOrder = async (req, res) => {
  try {
    const { user, shippingInfo, orderItems, totalPrice } = req.body;

    if (!user || !shippingInfo || !orderItems || !totalPrice) {
      return res.status(400).json({ success: false, message: "Missing order details!" });
    }

    const newOrder = new Order({
      user,
      shippingInfo,
      orderItems,
      totalPrice,
      totalPriceAfterDiscount: totalPrice, // Handle discount later
      paymentInfo: {
        razorpayOrderId: "COD",
        razorpayPaymentId: "COD",
      },
      orderStatus: "Placed (COD)",
    });

    await newOrder.save();

    res.json({ success: true, message: "COD order placed successfully!", order: newOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { placeCODOrder };
