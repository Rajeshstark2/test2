import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BiArrowBack } from "react-icons/bi";
import Container from "../components/Container";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import * as yup from "yup";
import axios from "axios";
import { config } from "../utils/axiosConfig";
import {
  createAnOrder,
  deleteUserCart,
  getUserCart,
  resetState,
} from "../features/user/userSlice";

let shippingSchema = yup.object({
  firstname: yup.string().required("First Name is Required"),
  lastname: yup.string().required("Last Name is Required"),
  address: yup.string().required("Address Details are Required"),
  state: yup.string().required("State is Required"),
  city: yup.string().required("City is Required"),
  country: yup.string().required("Country is Required"),
  pincode: yup.number().required().positive().integer(),
});

const Checkout = () => {
  const dispatch = useDispatch();
  const cartState = useSelector((state) => state?.auth?.cartProducts);
  const authState = useSelector((state) => state?.auth);
  const [totalAmount, setTotalAmount] = useState(0);
  const [shippingInfo, setShippingInfo] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("online"); // Default to Online Payment
  const navigate = useNavigate();

  useEffect(() => {
    let sum = cartState?.reduce((acc, item) => acc + item.quantity * item.price, 0) || 0;
    setTotalAmount(sum);
  }, [cartState]);

  useEffect(() => {
    dispatch(getUserCart());
  }, []);

  useEffect(() => {
    if (authState?.orderedProduct?.order !== null && authState?.orderedProduct?.success) {
      navigate("/my-orders");
    }
  }, [authState]);

  const formik = useFormik({
    initialValues: {
      firstname: "",
      lastname: "",
      address: "",
      state: "",
      city: "",
      country: "",
      pincode: "",
      other: "",
    },
    validationSchema: shippingSchema,
    onSubmit: (values) => {
      setShippingInfo(values);
      localStorage.setItem("address", JSON.stringify(values));
      setTimeout(() => {
        if (paymentMethod === "cod") {
          placeOrderCOD(); // Place COD order
        } else {
          checkOutHandler(); // Process Razorpay Payment
        }
      }, 300);
    },
  });

  const placeOrderCOD = async () => {
    const orderData = {
      totalPrice: totalAmount + 50,
      totalPriceAfterDiscount: totalAmount + 50,
      orderItems: cartState.map((item) => ({
        product: item.productId._id,
        quantity: item.quantity,
        color: item.color._id,
        price: item.price,
      })),
      paymentInfo: { method: "COD", status: "Pending" }, // Payment info for COD
      shippingInfo: JSON.parse(localStorage.getItem("address")),
    };

    dispatch(createAnOrder(orderData));
    dispatch(deleteUserCart());
    localStorage.removeItem("address");
    dispatch(resetState());
  };

  const checkOutHandler = async () => {
    const res = await axios.post(
      "https://test2-60yt.onrender.com/api/user/order/checkout",
      { amount: totalAmount + 50 },
      config
    );

    if (!res) {
      alert("Something Went Wrong");
      return;
    }

    const { amount, id: order_id, currency } = res.data.order;
    const options = {
      key: "rzp_test_fdOA5JRqNiD2Tb",
      amount,
      currency,
      name: "Cart's Corner",
      description: "Test Transaction",
      order_id,
      handler: async function (response) {
        const paymentData = {
          orderCreationId: order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpayOrderId: response.razorpay_order_id,
        };

        const result = await axios.post(
          "https://test2-60yt.onrender.com/api/user/order/paymentVerification",
          paymentData,
          config
        );

        dispatch(
          createAnOrder({
            totalPrice: totalAmount,
            totalPriceAfterDiscount: totalAmount,
            orderItems: cartState.map((item) => ({
              product: item.productId._id,
              quantity: item.quantity,
              color: item.color._id,
              price: item.price,
            })),
            paymentInfo: result.data,
            shippingInfo: JSON.parse(localStorage.getItem("address")),
          })
        );

        dispatch(deleteUserCart());
        localStorage.removeItem("address");
        dispatch(resetState());
      },
      prefill: {
        name: "prabanjam",
        email: "prabanjam.original@gmail.com",
        contact: "+91 97918 46885",
      },
      theme: { color: "#61dafb" },
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  };

  return (
    <Container class1="checkout-wrapper py-5 home-wrapper-2">
      <div className="row">
        <div className="col-7">
          <div className="checkout-left-data">
            <h3 className="website-name">Cart Corner</h3>
            <h4 className="mb-3">Shipping Address</h4>
            <form onSubmit={formik.handleSubmit} className="d-flex gap-15 flex-wrap">
              {/* Form Fields */}
              <div className="w-100">
                <label className="mb-2">Select Payment Method:</label>
                <div className="d-flex gap-3">
                  <label>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="online"
                      checked={paymentMethod === "online"}
                      onChange={() => setPaymentMethod("online")}
                    />
                    Online Payment
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={() => setPaymentMethod("cod")}
                    />
                    Cash on Delivery
                  </label>
                </div>
              </div>
              <div className="w-100">
                <button className="button" type="submit">
                  {paymentMethod === "cod" ? "Place COD Order" : "Proceed to Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default Checkout;
