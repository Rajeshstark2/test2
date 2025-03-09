const express = require("express");
const {
  checkout,
  paymentVerification,
  webhookHandler,
} = require("../controller/paymentCtrl");
const { authMiddleware } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/order/checkout", authMiddleware, checkout);
router.post("/order/verify", authMiddleware, paymentVerification);
router.post("/webhook", webhookHandler); // No auth middleware for webhooks

module.exports = router; 