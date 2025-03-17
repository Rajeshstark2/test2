const Order = require("../models/orderModel");
const asyncHandler = require("express-async-handler");

// ✅ Handle COD Order
const placeCODOrder = asyncHandler(async (req, res) => {
  try {
    const { shippingInfo, orderItems, totalPrice, totalPriceAfterDiscount, paymentInfo } = req.body;

    // Validate required fields
    if (!shippingInfo || !orderItems || !totalPrice || !paymentInfo) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
        required: {
          shippingInfo: !shippingInfo,
          orderItems: !orderItems,
          totalPrice: !totalPrice,
          paymentInfo: !paymentInfo
        }
      });
    }

    // Validate shipping info
    const requiredShippingFields = ['firstname', 'lastname', 'address', 'city', 'state', 'country', 'pincode'];
    const missingFields = requiredShippingFields.filter(field => !shippingInfo[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Missing shipping information fields",
        missingFields
      });
    }

    // Create new order
    const newOrder = await Order.create({
      user: req.user._id,
      shippingInfo,
      orderItems,
      totalPrice,
      totalPriceAfterDiscount: totalPriceAfterDiscount || totalPrice,
      paymentInfo: {
        ...paymentInfo,
        paymentMethod: "COD",
        paymentStatus: "Pending"
      },
      orderStatus: "Processing"
    });

    // Populate order items
    const populatedOrder = await Order.findById(newOrder._id)
      .populate("orderItems.product")
      .populate("orderItems.color");

    res.status(200).json({
      success: true,
      message: "Order placed successfully",
      order: populatedOrder
    });
  } catch (error) {
    console.error("Error in placeCODOrder:", error);
    res.status(500).json({
      success: false,
      message: "Error creating order",
      error: error.message
    });
  }
});

// Get all orders for a user
const getOrders = asyncHandler(async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("orderItems.product")
      .populate("orderItems.color")
      .sort("-createdAt");
    
    res.status(200).json({
      success: true,
      orders
    });
  } catch (error) {
    console.error("Error in getOrders:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching orders",
      error: error.message
    });
  }
});

module.exports = {
  placeCODOrder,
  getOrders
};
