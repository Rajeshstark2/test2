import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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

// Validation Schema
const shippingSchema = yup.object({
  firstname: yup.string().required("First Name is Required"),
  lastname: yup.string().required("Last Name is Required"),
  address: yup.string().required("Address Details are Required"),
  state: yup.string().required("State is Required"),
  city: yup.string().required("City is Required"),
  country: yup.string().required("Country is Required"),
  pincode: yup.number().required("Pincode is Required").positive().integer(),
});

const Checkout = () => {
  const dispatch = useDispatch();
  const cartState = useSelector((state) => state?.auth?.cartProducts);
  const authState = useSelector((state) => state?.auth);
  const navigate = useNavigate();

  const [totalAmount, setTotalAmount] = useState(0);
  const [cartProductState, setCartProductState] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("online");

  useEffect(() => {
    let sum = 0;
    cartState?.forEach((item) => {
      sum += item.quantity * item.price;
    });
    setTotalAmount(sum);
  }, [cartState]);

  useEffect(() => {
    let items = cartState?.map((item) => ({
      product: item.productId._id,
      quantity: item.quantity,
      color: item.color._id,
      price: item.price,
    }));
    setCartProductState(items);
  }, [cartState]);

  useEffect(() => {
    if (authState?.orderedProduct?.order !== null && authState?.orderedProduct?.success === true) {
      navigate("/my-orders");
    }
  }, [authState]);

  useEffect(() => {
    dispatch(getUserCart());
  }, []);

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
      localStorage.setItem("address", JSON.stringify(values));
      if (paymentMethod === "online") {
        checkOutHandler(); // Razorpay payment
      } else {
        cashOnDeliveryHandler(); // COD
      }
    },
  });

  // Razorpay Online Payment
  const checkOutHandler = async () => {
    const result = await axios.post(
      "https://test2-60yt.onrender.com/api/user/order/checkout",
      { amount: totalAmount + 50 },
      config
    );

    if (!result) {
      alert("Something went wrong");
      return;
    }

    const options = {
      key: "rzp_test_fdOA5JRqNiD2Tb",
      amount: result.data.order.amount,
      currency: result.data.order.currency,
      name: "Cart's Corner",
      description: "Test Transaction",
      order_id: result.data.order.id,
      handler: async function (response) {
        const paymentData = {
          orderCreationId: result.data.order.id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpayOrderId: response.razorpay_order_id,
        };
        const verifyRes = await axios.post(
          "https://test2-60yt.onrender.com/api/user/order/paymentVerification",
          paymentData,
          config
        );
        dispatch(createAnOrder({
          totalPrice: totalAmount,
          totalPriceAfterDiscount: totalAmount,
          orderItems: cartProductState,
          paymentInfo: verifyRes.data,
          shippingInfo: JSON.parse(localStorage.getItem("address")),
        }));
        dispatch(deleteUserCart());
        localStorage.removeItem("address");
        dispatch(resetState());
      },
      theme: { color: "#61dafb" },
    };
    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  };

  // Cash on Delivery (COD) Handler
  const cashOnDeliveryHandler = async () => {
    dispatch(createAnOrder({
      totalPrice: totalAmount,
      totalPriceAfterDiscount: totalAmount,
      orderItems: cartProductState,
      paymentInfo: { paymentMethod: "COD" },
      shippingInfo: JSON.parse(localStorage.getItem("address")),
    }));
    dispatch(deleteUserCart());
    localStorage.removeItem("address");
    dispatch(resetState());
    navigate("/my-orders");
  };

  return (
    <Container class1="checkout-wrapper py-5 home-wrapper-2">
      <div className="row">
        <div className="col-7">
          <div className="checkout-left-data">
            <h3 className="website-name">Cart Corner</h3>
            <h4 className="mb-3">Shipping Address</h4>
            <form onSubmit={formik.handleSubmit} className="d-flex flex-wrap">
              <input type="text" placeholder="First Name" name="firstname" {...formik.getFieldProps("firstname")} />
              <input type="text" placeholder="Last Name" name="lastname" {...formik.getFieldProps("lastname")} />
              <input type="text" placeholder="Address" name="address" {...formik.getFieldProps("address")} />
              <input type="text" placeholder="City" name="city" {...formik.getFieldProps("city")} />
              <input type="text" placeholder="Pincode" name="pincode" {...formik.getFieldProps("pincode")} />

              {/* Payment Method Selection */}
              <h4>Select Payment Method:</h4>
              <div>
                <input type="radio" id="online" name="paymentMethod" value="online" defaultChecked onChange={() => setPaymentMethod("online")} />
                <label htmlFor="online">Online Payment</label>
              </div>
              <div>
                <input type="radio" id="cod" name="paymentMethod" value="cod" onChange={() => setPaymentMethod("cod")} />
                <label htmlFor="cod">Cash on Delivery</label>
              </div>

              <button type="submit" className="button">Place Order</button>
            </form>
          </div>
        </div>
        <div className="col-5">
          <h4 className="total">Total: Rs. {totalAmount + 50}</h4>
        </div>
      </div>
    </Container>
  );
};

export default Checkout;
