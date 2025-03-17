const Order = require("../models/orderModel");

// ✅ Handle COD Order
const placeCODOrder = async (req, res) => {
  try {
    const { shippingInfo, orderItems, totalPrice, totalPriceAfterDiscount } = req.body;

    if (!shippingInfo || !orderItems || !totalPrice) {
      return res.status(400).json({ success: false, message: "Missing order details!" });
    }

    const newOrder = new Order({
      user: req.user._id, // Get user from auth middleware
      shippingInfo,
      orderItems,
      totalPrice,
      totalPriceAfterDiscount: totalPriceAfterDiscount || totalPrice,
      paymentInfo: {
        razorpayOrderId: "COD-" + Date.now(),
        razorpayPaymentId: "COD-" + Date.now(),
        paymentMethod: "COD",
        paymentStatus: "Pending"
      },
      orderStatus: "Processing",
    });

    await newOrder.save();

    res.json({ 
      success: true, 
      message: "COD order placed successfully!", 
      order: newOrder 
    });
  } catch (error) {
    console.error("Error in placeCODOrder:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error placing COD order",
      error: error.message 
    });
  }
};

// Get all orders for a user
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("orderItems.product")
      .populate("orderItems.color");
    
    res.json({ 
      success: true, 
      orders 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error fetching orders",
      error: error.message 
    });
  }
};

module.exports = { 
  placeCODOrder,
  getOrders
};
