const express = require("express");
const { placeCODOrder, getOrders } = require("../controller/orderCtrl");
const { authMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();

// Protected routes - require authentication
router.use(authMiddleware);

// Place a COD order
router.post("/cod", placeCODOrder);

// Get user's orders
router.get("/my-orders", getOrders);

module.exports = router;
