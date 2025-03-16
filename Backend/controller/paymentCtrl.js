const Cashfree = require("cashfree-sdk");
const instance = new Cashfree({
  key_id: "920442d64d234896cf1df8f22a244029",
  key_secret: "cfsk_ma_prod_e9b9aa6f6b77f4fd782e53b02b7313bc_e7518d81",
});

const checkout = async (req, res) => {
  const { amount } = req.body;
  const option = {
    amount: amount * 50,
    currency: "INR",
  };
  const order = await instance.orders.create(option);
  res.json({
    success: true,
    order,
  });
};

const paymentVerification = async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId } = req.body;
  res.json({
    razorpayOrderId,
    razorpayPaymentId,
  });
};

module.exports = {
  checkout,
  paymentVerification,
};

