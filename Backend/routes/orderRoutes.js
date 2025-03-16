const express = require("express");
const { placeCODOrder } = require("../controllers/orderCtrl");

const router = express.Router();

router.post("/cod", placeCODOrder);

module.exports = router;
