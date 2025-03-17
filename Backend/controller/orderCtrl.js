const Order = require("../models/orderModel");
const asyncHandler = require("express-async-handler");

// ✅ Handle COD Order
const placeCODOrder = asyncHandler(async (req, res) => {
  try {
    console.log("Received order data:", JSON.stringify(req.body, null, 2));
    
    const { shippingInfo, orderItems, totalPrice, totalPriceAfterDiscount, paymentInfo } = req.body;

    // Validate required fields
    if (!shippingInfo || !orderItems || !totalPrice || !paymentInfo) {
      console.log("Missing required fields:", {
        hasShippingInfo: !!shippingInfo,
        hasOrderItems: !!orderItems,
        hasTotalPrice: !!totalPrice,
        hasPaymentInfo: !!paymentInfo
      });
      
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
      console.log("Missing shipping fields:", missingFields);
      console.log("Shipping info received:", shippingInfo);
      
      return res.status(400).json({
        success: false,
        message: "Missing shipping information fields",
        missingFields,
        receivedFields: Object.keys(shippingInfo)
      });
    }

    // Validate order items
    if (!Array.isArray(orderItems) || orderItems.length === 0) {
      console.log("Invalid order items:", orderItems);
      
      return res.status(400).json({
        success: false,
        message: "Invalid order items",
        received: orderItems
      });
    }

    // Create new order
    const orderData = {
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
    };

    console.log("Creating order with data:", JSON.stringify(orderData, null, 2));

    const newOrder = await Order.create(orderData);

    // Populate order items
    const populatedOrder = await Order.findById(newOrder._id)
      .populate("orderItems.product")
      .populate("orderItems.color");

    console.log("Order created successfully:", newOrder._id);

    res.status(200).json({
      success: true,
      message: "Order placed successfully",
      order: populatedOrder
    });
  } catch (error) {
    console.error("Error in placeCODOrder:", error);
    console.error("Error stack:", error.stack);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: Object.values(error.errors).map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Error creating order",
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
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
