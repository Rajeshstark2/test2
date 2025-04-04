const User = require("../models/userModel");
const Product = require("../models/productModel");
const Cart = require("../models/cartModel");
const Coupon = require("../models/couponModel");
const Order = require("../models/orderModel");
const uniqid = require("uniqid");

const asyncHandler = require("express-async-handler");
const { generateToken } = require("../config/jwtToken");
const validateMongoDbId = require("../utils/validateMongodbId");
const { generateRefreshToken } = require("../config/refreshtoken");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const sendEmail = require("./emailCtrl");
const { createPasswordResetToken } = require("../models/userModel");

// Create a User ----------------------------------------------

const createUser = asyncHandler(async (req, res) => {
  /**
   * TODO:Get the email from req.body
   */
  const email = req.body.email;
  /**
   * TODO:With the help of email find the user exists or not
   */
  const findUser = await User.findOne({ email: email });

  if (!findUser) {
    /**
     * TODO:if user not found user create a new user
     */
    const newUser = await User.create(req.body);
    res.json(newUser);
  } else {
    /**
     * TODO:if user found then thow an error: User already exists
     */
    throw new Error("User Already Exists");
  }
});

// Login a user
const loginUserCtrl = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  // check if user exists or not
  const findUser = await User.findOne({ email });
  if (findUser && (await findUser.isPasswordMatched(password))) {
    const refreshToken = await generateRefreshToken(findUser?._id);
    const updateuser = await User.findByIdAndUpdate(
      findUser.id,
      {
        refreshToken: refreshToken,
      },
      { new: true }
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000,
    });
    res.json({
      _id: findUser?._id,
      firstname: findUser?.firstname,
      lastname: findUser?.lastname,
      email: findUser?.email,
      mobile: findUser?.mobile,
      token: generateToken(findUser?._id),
    });
  } else {
    throw new Error("Invalid Credentials");
  }
});

// admin login

const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  // check if user exists or not
  const findAdmin = await User.findOne({ email });
  if (findAdmin.role !== "admin") throw new Error("Not Authorised");
  if (findAdmin && (await findAdmin.isPasswordMatched(password))) {
    const refreshToken = await generateRefreshToken(findAdmin?._id);
    const updateuser = await User.findByIdAndUpdate(
      findAdmin.id,
      {
        refreshToken: refreshToken,
      },
      { new: true }
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000,
    });
    res.json({
      _id: findAdmin?._id,
      firstname: findAdmin?.firstname,
      lastname: findAdmin?.lastname,
      email: findAdmin?.email,
      mobile: findAdmin?.mobile,
      token: generateToken(findAdmin?._id),
    });
  } else {
    throw new Error("Invalid Credentials");
  }
});

// handle refresh token

const handleRefreshToken = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) throw new Error("No Refresh Token in Cookies");
  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({ refreshToken });
  if (!user) throw new Error(" No Refresh token present in db or not matched");
  jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
    if (err || user.id !== decoded.id) {
      throw new Error("There is something wrong with refresh token");
    }
    const accessToken = generateToken(user?._id);
    res.json({ accessToken });
  });
});

// logout functionality

const logout = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) throw new Error("No Refresh Token in Cookies");
  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({ refreshToken });
  if (!user) {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
    });
    return res.sendStatus(204); // forbidden
  }
  await User.findOneAndUpdate(refreshToken, {
    refreshToken: "",
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
  });
  res.sendStatus(204); // forbidden
});

// Update a user

const updatedUser = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);

  try {
    const updatedUser = await User.findByIdAndUpdate(
      _id,
      {
        firstname: req?.body?.firstname,
        lastname: req?.body?.lastname,
        email: req?.body?.email,
        mobile: req?.body?.mobile,
      },
      {
        new: true,
      }
    );
    res.json(updatedUser);
  } catch (error) {
    throw new Error(error);
  }
});

// save user Address

const saveAddress = asyncHandler(async (req, res, next) => {
  const { _id } = req.user;
  validateMongoDbId(_id);

  try {
    const updatedUser = await User.findByIdAndUpdate(
      _id,
      {
        address: req?.body?.address,
      },
      {
        new: true,
      }
    );
    res.json(updatedUser);
  } catch (error) {
    throw new Error(error);
  }
});

// Get all users

const getallUser = asyncHandler(async (req, res) => {
  try {
    const getUsers = await User.find().populate("wishlist");
    res.json(getUsers);
  } catch (error) {
    throw new Error(error);
  }
});

// Get a single user

const getaUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const getaUser = await User.findById(id);
    res.json({
      getaUser,
    });
  } catch (error) {
    throw new Error(error);
  }
});

// Get a single user

const deleteaUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const deleteaUser = await User.findByIdAndDelete(id);
    res.json({
      deleteaUser,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const blockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const blockusr = await User.findByIdAndUpdate(
      id,
      {
        isBlocked: true,
      },
      {
        new: true,
      }
    );
    res.json(blockusr);
  } catch (error) {
    throw new Error(error);
  }
});

const unblockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const unblock = await User.findByIdAndUpdate(
      id,
      {
        isBlocked: false,
      },
      {
        new: true,
      }
    );
    res.json({
      message: "User UnBlocked",
    });
  } catch (error) {
    throw new Error(error);
  }
});

const updatePassword = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { password } = req.body;
  validateMongoDbId(_id);
  const user = await User.findById(_id);
  if (password) {
    user.password = password;
    const updatedPassword = await user.save();
    res.json(updatedPassword);
  } else {
    res.json(user);
  }
});

const forgotPasswordToken = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found with this email");
  try {
    const token = await user.createPasswordResetToken();

    await user.save();
    console.log(token);
    const resetURL = `Hi, Please follow this link to reset Your Password. This link is valid till 10 minutes from now. <a href='http://localhost:3000/reset-password/${token}'>Click Here</>`;

    const data = {
      to: email,
      text: "Hey User",
      subject: "Forgot Password Link",
      htm: resetURL,
    };
    sendEmail(data);
    res.json(token);
  } catch (error) {
    throw new Error(error);
  }
});

const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const { token } = req.params;
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) throw new Error(" Token Expired, Please try again later");
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  res.json(user);
});

const getWishlist = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  try {
    const findUser = await User.findById(_id).populate("wishlist");
    res.json(findUser);
  } catch (error) {
    throw new Error(error);
  }
});

const userCart = asyncHandler(async (req, res) => {
  const { productId, color, quantity, price } = req.body;

  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    let newCart = await new Cart({
      userId: _id,
      productId,
      color,
      price,
      quantity,
    }).save();
    res.json(newCart);
  } catch (error) {
    throw new Error(error);
  }
});

const getUserCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const cart = await Cart.find({ userId: _id })
      .populate("productId")
      .populate("color");
    res.json(cart);
  } catch (error) {
    throw new Error(error);
  }
});

const removeProductFromCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { cartItemId } = req.params;
  validateMongoDbId(_id);
  try {
    const deleteProductFromcart = await Cart.deleteOne({
      userId: _id,
      _id: cartItemId,
    });

    res.json(deleteProductFromcart);
  } catch (error) {
    throw new Error(error);
  }
});

const emptyCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const deleteCart = await Cart.deleteMany({
      userId: _id,
    });

    res.json(deleteCart);
  } catch (error) {
    throw new Error(error);
  }
});

const updateProductQuantityFromCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { cartItemId, newQuantity } = req.params;
  validateMongoDbId(_id);
  try {
    const cartItem = await Cart.findOne({
      userId: _id,
      _id: cartItemId,
    });
    cartItem.quantity = newQuantity;
    cartItem.save();
    res.json(cartItem);
  } catch (error) {
    throw new Error(error);
  }
});

const createOrder = asyncHandler(async (req, res) => {
  const {
    shippingInfo,
    orderItems,
    totalPrice,
    totalPriceAfterDiscount,
    paymentInfo,
    orderStatus,
    paidAt,
    month
  } = req.body;
  const { _id } = req.user;
  
  try {
    // Validate required fields
    if (!shippingInfo || !orderItems || !totalPrice || !paymentInfo) {
      throw new Error("Missing required order fields");
    }

    // Ensure payment method is uppercase and valid
    const paymentMethod = paymentInfo.paymentMethod.toUpperCase();
    if (!["UPI", "COD"].includes(paymentMethod)) {
      throw new Error("Invalid payment method");
    }

    // Create the order with all provided fields
    const orderData = {
      shippingInfo,
      orderItems: orderItems.map(item => ({
        product: item.product,
        quantity: item.quantity,
        color: item.color,
        price: item.price
      })),
      totalPrice,
      totalPriceAfterDiscount,
      paymentInfo: {
        paymentMethod: paymentMethod,
        paymentStatus: paymentMethod === "UPI" ? "Completed" : "Pending",
        upiTransactionId: paymentMethod === "UPI" ? paymentInfo.upiTransactionId : null
      },
      user: _id,
      orderStatus: orderStatus || "Processing",
      paidAt: paymentMethod === "UPI" ? new Date() : null,
      month: month || new Date().getMonth()
    };

    console.log("Creating order with data:", orderData);

    const order = await Order.create(orderData);

    // Populate the order with user and product details
    const populatedOrder = await Order.findById(order._id)
      .populate("user")
      .populate({
        path: "orderItems.product",
        select: "title price images"
      })
      .populate("orderItems.color");

    res.json({
      order: populatedOrder,
      success: true,
      message: "Order created successfully"
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to create order"
    });
  }
});

const getMyOrders = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  try {
    const orders = await Order.find({ user: _id })
      .populate("user")
      .populate("orderItems.product")
      .populate("orderItems.color");
    res.json({
      orders,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const getAllOrders = asyncHandler(async (req, res) => {
  try {
    // First check if there are any orders
    const orders = await Order.find()
      .populate("user", "firstname lastname email mobile")
      .populate("orderItems.product", "title price images")
      .populate("orderItems.color", "title")
      .sort({ createdAt: -1 });

    if (!orders || orders.length === 0) {
      return res.json({
        success: true,
        orders: []
      });
    }

    // Format orders to ensure all data is included and properly structured
    const formattedOrders = orders.map(order => {
      // Ensure orderItems is an array
      const orderItems = Array.isArray(order.orderItems) ? order.orderItems : [];
      
      // Format each order item
      const formattedOrderItems = orderItems.map(item => ({
        product: item.product || null,
        quantity: item.quantity || 0,
        color: item.color || null,
        price: item.price || 0
      }));

      // Format shipping info with fallbacks
      const shippingInfo = {
        firstname: order.shippingInfo?.firstname || "",
        lastname: order.shippingInfo?.lastname || "",
        address: order.shippingInfo?.address || "",
        city: order.shippingInfo?.city || "",
        state: order.shippingInfo?.state || "",
        country: order.shippingInfo?.country || "",
        pincode: order.shippingInfo?.pincode || "",
        other: order.shippingInfo?.other || ""
      };

      // Format payment info with fallbacks
      const paymentInfo = {
        paymentMethod: (order.paymentInfo?.paymentMethod || "COD").toUpperCase(),
        paymentStatus: order.paymentInfo?.paymentStatus || "Pending",
        upiTransactionId: order.paymentInfo?.upiTransactionId || ""
      };

      return {
        _id: order._id,
        user: order.user || null,
        orderItems: formattedOrderItems,
        shippingInfo,
        paymentInfo,
        totalPrice: order.totalPrice || 0,
        totalPriceAfterDiscount: order.totalPriceAfterDiscount || 0,
        orderStatus: order.orderStatus || "Processing",
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      };
    });

    res.json({
      success: true,
      orders: formattedOrders
    });
  } catch (error) {
    console.error("Error in getAllOrders:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching orders",
      error: error.message
    });
  }
});

const getsingleOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const order = await Order.findOne({ _id: id })
      .populate("user", "firstname lastname email mobile")
      .populate("orderItems.product", "title price images")
      .populate("orderItems.color", "title");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // Format order to ensure correct data structure
    const formattedOrder = {
      ...order._doc,
      shippingInfo: {
        firstname: order.shippingInfo?.firstname || "",
        lastname: order.shippingInfo?.lastname || "",
        address: order.shippingInfo?.address || "",
        city: order.shippingInfo?.city || "",
        state: order.shippingInfo?.state || "",
        country: order.shippingInfo?.country || "",
        pincode: order.shippingInfo?.pincode || "",
        other: order.shippingInfo?.other || ""
      },
      paymentInfo: {
        ...order.paymentInfo,
        paymentMethod: order.paymentInfo.paymentMethod.toUpperCase(),
        upiTransactionId: order.paymentInfo.upiTransactionId || ""
      }
    };

    res.json({
      success: true,
      order: formattedOrder
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching order",
      error: error.message
    });
  }
});

const updateOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }
    
    order.orderStatus = req.body.status;
    await order.save();
    
    // Populate the updated order
    const updatedOrder = await Order.findById(id)
      .populate("user")
      .populate("orderItems.product")
      .populate("orderItems.color");
      
    res.json({
      success: true,
      message: "Order status updated successfully",
      order: updatedOrder
    });
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({
      success: false,
      message: "Error updating order status",
      error: error.message
    });
  }
});

const getMonthWiseOrderIncome = asyncHandler(async (req, res) => {
  try {
    let monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    
    let endDate = new Date();
    endDate.setMonth(endDate.getMonth() - 11); // Get last 12 months
    
    const data = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $lte: new Date(),
            $gte: endDate
          }
        }
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          amount: { $sum: "$totalPriceAfterDiscount" },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id": 1 }
      }
    ]);

    // Format the response to include month names
    const formattedData = data.map(item => ({
      month: monthNames[item._id - 1],
      amount: item.amount || 0,
      count: item.count || 0
    }));

    // Ensure we have data for all months
    const completeData = monthNames.map((month, index) => {
      const existingData = formattedData.find(d => d.month === month);
      return existingData || {
        month,
        amount: 0,
        count: 0
      };
    });

    res.json({
      success: true,
      data: completeData
    });
  } catch (error) {
    console.error("Error fetching monthly income:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching monthly income",
      error: error.message
    });
  }
});

const getYearlyTotalOrder = asyncHandler(async (req, res) => {
  try {
    let endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() - 1); // Get last year
    
    const data = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $lte: new Date(),
            $gte: endDate
          }
        }
      },
      {
        $group: {
          _id: { $year: "$createdAt" },
          totalOrders: { $sum: 1 },
          totalAmount: { $sum: "$totalPriceAfterDiscount" }
        }
      }
    ]);

    const result = data[0] || { totalOrders: 0, totalAmount: 0 };

    res.json({
      success: true,
      data: {
        totalOrders: result.totalOrders || 0,
        totalAmount: result.totalAmount || 0
      }
    });
  } catch (error) {
    console.error("Error fetching yearly orders:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching yearly orders",
      error: error.message
    });
  }
});

module.exports = {
  createUser,
  loginUserCtrl,
  getallUser,
  getaUser,
  deleteaUser,
  updatedUser,
  blockUser,
  unblockUser,
  handleRefreshToken,
  logout,
  updatePassword,
  forgotPasswordToken,
  resetPassword,
  loginAdmin,
  getWishlist,
  saveAddress,
  userCart,
  getUserCart,
  createOrder,
  getMyOrders,
  emptyCart,
  getMonthWiseOrderIncome,
  getAllOrders,
  getsingleOrder,
  updateOrder,
  getYearlyTotalOrder,

  removeProductFromCart,
  updateProductQuantityFromCart,
};
