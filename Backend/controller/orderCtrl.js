const Order = require("../models/orderModel");

// ✅ Handle COD Order
const placeCODOrder = async (req, res) => {
  try {
    // Ensure user is authenticated
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: "User not authenticated!" });
    }

    const userId = req.user._id;
    const { shippingInfo, orderItems, totalPrice } = req.body;

    // Validate request data
    if (!shippingInfo || !orderItems || !totalPrice) {
      return res.status(400).json({ success: false, message: "Missing order details!" });
    }

    // Ensure orderItems is not empty
    if (!Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json({ success: false, message: "Order items cannot be empty!" });
    }

    // Create a new COD order
    const newOrder = new Order({
      user: userId,
      shippingInfo,
      orderItems,
      totalPrice,
      totalPriceAfterDiscount: totalPrice, // Handle discounts later
      paymentInfo: {
        paymentMethod: "Cash on Delivery",
        razorpayOrderId: "COD",
        razorpayPaymentId: "COD",
      },
      orderStatus: "Placed (COD)",
    });

    await newOrder.save();

    return res.json({ success: true, message: "COD order placed successfully!", order: newOrder });
  } catch (error) {
    console.error("Error placing COD order:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error!" });
  }
};

module.exports = { placeCODOrder };
