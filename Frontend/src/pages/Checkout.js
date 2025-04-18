import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BiArrowBack } from "react-icons/bi";
import Container from "../components/Container";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import * as yup from "yup";
import axios from "axios";
import { config, base_url } from "../utils/axiosConfig";
import {
  createAnOrder,
  deleteUserCart,
  getUserCart,
  resetState,
} from "../features/user/userSlice";
import { QRCodeSVG } from "qrcode.react";

// UPI Configuration
const UPI_CONFIG = {
  upiId: "rajesh93601615@oksbi", // Replace with your UPI ID (e.g., "username@upi")
  name: "RAJESH KRISHNAN", // Replace with your name
  merchantCode: "0000" // Optional: Add your merchant code if you have one
};

let shippingSchema = yup.object({
  firstname: yup.string().required("First Name is Required"),
  lastname: yup.string().required("Last Name is Required"),
  address: yup.string().required("Address Details are Required"),
  state: yup.string().required("S tate is Required"),
  city: yup.string().required("city is Required"),
  country: yup.string().required("country is Required"),
  pincode: yup.number("Pincode No is Required").required().positive().integer(),
});

const Checkout = () => {
  const dispatch = useDispatch();
  const cartState = useSelector((state) => state?.auth?.cartProducts);
  const authState = useSelector((state) => state?.auth);
  const [totalAmount, setTotalAmount] = useState(null);
  const [shippingInfo, setShippingInfo] = useState(null);
  const [paymentInfo, setPaymentInfo] = useState({
    upiTransactionId: "",
    paymentStatus: "Pending"
  });
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [showQRCode, setShowQRCode] = useState(false);
  const [upiTransactionId, setUpiTransactionId] = useState("");

  useEffect(() => {
    let sum = 0;
    for (let index = 0; index < cartState?.length; index++) {
      sum = sum + Number(cartState[index].quantity) * cartState[index].price;
      setTotalAmount(sum);
    }
  }, [cartState]);

  const getTokenFromLocalStorage = localStorage.getItem("customer")
    ? JSON.parse(localStorage.getItem("customer"))
    : null;

  const config2 = {
    headers: {
      Authorization: `Bearer ${
        getTokenFromLocalStorage !== null ? getTokenFromLocalStorage.token : ""
      }`,
      Accept: "application/json",
    },
  };

  useEffect(() => {
    dispatch(getUserCart());
  }, []);

  useEffect(() => {
    if (
      authState?.orderedProduct?.order !== null &&
      authState?.orderedProduct?.success === true
    ) {
      navigate("/my-orders");
    }
  }, [authState]);

  const [cartProductState, setCartProductState] = useState([]);

  useEffect(() => {
    let items = [];
    if (cartState && cartState.length > 0) {
      for (let index = 0; index < cartState.length; index++) {
        items.push({
          product: cartState[index].productId._id,
          quantity: cartState[index].quantity,
          color: cartState[index].color._id,
          price: cartState[index].price,
        });
      }
      setCartProductState(items);
    }
  }, [cartState]);

  const handleUPIPayment = async () => {
    if (!upiTransactionId) {
      alert("Please enter the UPI Transaction ID");
      return;
    }

    try {
      const address = JSON.parse(localStorage.getItem("address"));
      const user = authState?.user; // Get user from Redux state
      
      if (!address || !user) {
        throw new Error("Missing shipping information or user data");
      }

      // Create the order through the payment endpoint
      const orderData = {
        user: user._id,
        amount: totalAmount + 5,
        paymentMethod: "UPI",
        upiTransactionId: upiTransactionId,
        shippingInfo: {
          firstname: address.firstname,
          lastname: address.lastname,
          address: address.address,
          city: address.city,
          state: address.state,
          country: address.country,
          pincode: address.pincode,
          other: address.other || ""
        },
        orderItems: cartProductState
      };

      console.log("Creating UPI order with data:", orderData);

      // Create order through the payment endpoint
      const response = await axios.post(
        `${base_url}user/order/create`,
        orderData,
        config2
      );
      
      if (response.data.success) {
        // Clear cart and reset state
        await dispatch(deleteUserCart(config2));
        dispatch(resetState());
        localStorage.removeItem("address"); // Clean up stored address
        navigate("/my-orders");
      } else {
        throw new Error(response.data.message || "Failed to create order");
      }
    } catch (error) {
      console.error("Error processing UPI payment:", error);
      alert(error.response?.data?.message || error.message || "Failed to process payment. Please try again.");
    }
  };

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
    onSubmit: async (values) => {
      try {
        if (!cartProductState || cartProductState.length === 0) {
          console.error("No items in cart");
          return;
        }

        if (paymentMethod === "upi") {
          // For UPI, just show the QR code
          localStorage.setItem("address", JSON.stringify(values));
          setShowQRCode(true);
          return;
        }

        // For COD, proceed with order creation
        const user = JSON.parse(localStorage.getItem("customer"));
        const orderData = {
          user: user._id,
          shippingInfo: {
            firstname: values.firstname,
            lastname: values.lastname,
            address: values.address,
            city: values.city,
            state: values.state,
            country: values.country,
            pincode: values.pincode,
            other: values.other || ""
          },
          orderItems: cartProductState,
          totalPrice: totalAmount + 5,
          totalPriceAfterDiscount: totalAmount + 5,
          paymentInfo: {
            upiTransactionId: `COD-${Date.now()}`,
            paymentMethod: "COD",
            paymentStatus: "Pending"
          },
          orderStatus: "Processing",
          paidAt: new Date(),
          month: new Date().getMonth()
        };

        console.log("Creating COD order with data:", orderData);

        const orderResult = await dispatch(createAnOrder(orderData)).unwrap();
        if (orderResult.success) {
          await dispatch(deleteUserCart(config2));
          dispatch(resetState());
          navigate("/my-orders");
        }
      } catch (error) {
        console.error("Error processing order:", error);
        alert(error.response?.data?.message || error.message || "Failed to process order. Please try again.");
      }
    },
  });

  return (
    <>
      <Container class1="checkout-wrapper py-5 home-wrapper-2">
        <div className="row">
          <div className="col-12">
            <div className="checkout-left-data">
              <h3 className="website-name">Cart's Corner</h3>
              <nav
                aria-label="breadcrumb"
                className="d-flex align-items-center"
              >
                <ol className="breadcrumb">
                  <li className="breadcrumb-item">
                    <Link to="/cart">Cart</Link>
                  </li>
                  &nbsp; /&nbsp;
                  <li className="breadcrumb-item total">
                    <a aria-current="page">Checkout</a>
                  </li>
                </ol>
              </nav>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-12">
            <div className="checkout-right-data">
              <h4 className="mb-3">Shipping Address</h4>
              <form
                onSubmit={formik.handleSubmit}
                className="d-flex gap-15 flex-wrap justify-content-between"
              >
                <div className="w-100">
                  <select
                    className="form-control form-select"
                    id=""
                    name="country"
                    value={formik.values.country}
                    onChange={formik.handleChange("country")}
                    onBlur={formik.handleChange("country")}
                  >
                    <option value="" selected disabled>
                      Select Country
                    </option>
                    <option value="India">India</option>
                  </select>
                  <div className="error ms-2 my-1">
                    {formik.touched.country && formik.errors.country}
                  </div>
                </div>
                <div className="flex-grow-1">
                  <input
                    type="text"
                    placeholder="First Name"
                    className="form-control"
                    name="firstname"
                    value={formik.values.firstname}
                    onChange={formik.handleChange("firstname")}
                    onBlur={formik.handleBlur("firstname")}
                  />
                  <div className="error ms-2 my-1">
                    {formik.touched.firstname && formik.errors.firstname}
                  </div>
                </div>
                <div className="flex-grow-1">
                  <input
                    type="text"
                    placeholder="Last Name"
                    className="form-control"
                    name="lastname"
                    value={formik.values.lastname}
                    onChange={formik.handleChange("lastname")}
                    onBlur={formik.handleBlur("lastname")}
                  />
                  <div className="error ms-2 my-1">
                    {formik.touched.lastname && formik.errors.lastname}
                  </div>
                </div>
                <div className="w-100">
                  <input
                    type="text"
                    placeholder="Address"
                    className="form-control"
                    name="address"
                    value={formik.values.address}
                    onChange={formik.handleChange("address")}
                    onBlur={formik.handleBlur("address")}
                  />
                  <div className="error ms-2 my-1">
                    {formik.touched.address && formik.errors.address}
                  </div>
                </div>
                <div className="w-100">
                  <input
                    type="text"
                    placeholder="Apartment, Suite ,etc"
                    className="form-control"
                    name="other"
                    value={formik.values.other}
                    onChange={formik.handleChange("other")}
                    onBlur={formik.handleBlur("other")}
                  />
                </div>
                <div className="flex-grow-1">
                  <input
                    type="text"
                    placeholder="City"
                    className="form-control"
                    name="city"
                    value={formik.values.city}
                    onChange={formik.handleChange("city")}
                    onBlur={formik.handleBlur("city")}
                  />
                  <div className="error ms-2 my-1">
                    {formik.touched.city && formik.errors.city}
                  </div>
                </div>
                <div className="flex-grow-1">
                  <select
                    className="form-control form-select"
                    id=""
                    name="state"
                    value={formik.values.state}
                    onChange={formik.handleChange("state")}
                    onBlur={formik.handleChange("state")}
                  >
                    <option value="" selected disabled>
                      Select State
                    </option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                  </select>
                  <div className="error ms-2 my-1">
                    {formik.touched.state && formik.errors.state}
                  </div>
                </div>
                <div className="flex-grow-1">
                  <input
                    type="text"
                    placeholder="Pincode"
                    className="form-control"
                    name="pincode"
                    value={formik.values.pincode}
                    onChange={formik.handleChange("pincode")}
                    onBlur={formik.handleBlur("pincode")}
                  />
                  <div className="error ms-2 my-1">
                    {formik.touched.pincode && formik.errors.pincode}
                  </div>
                </div>
                <div className="w-100 mt-3">
                  <h4 className="mb-3">Payment Method</h4>
                  <div className="d-flex gap-15 align-items-center">
                    <div className="form-check">
                      <input
                        type="radio"
                        className="form-check-input"
                        id="cod"
                        name="paymentMethod"
                        value="cod"
                        checked={paymentMethod === "cod"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <label className="form-check-label" htmlFor="cod">
                        Cash On Delivery
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        type="radio"
                        className="form-check-input"
                        id="upi"
                        name="paymentMethod"
                        value="upi"
                        checked={paymentMethod === "upi"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <label className="form-check-label" htmlFor="upi">
                        UPI Payment
                      </label>
                    </div>
                  </div>
                </div>

                {showQRCode && paymentMethod === "upi" && (
                  <div className="w-100 mt-4">
                    <div className="d-flex flex-column align-items-center">
                      <h4 className="mb-3">Scan QR Code to Pay</h4>
                      <div className="p-3 border rounded">
                        <QRCodeSVG 
                          value={`upi://pay?pa=${UPI_CONFIG.upiId}&pn=${UPI_CONFIG.name}&am=${totalAmount + 5}&cu=INR&mc=${UPI_CONFIG.merchantCode}`}
                          size={200}
                        />
                      </div>
                      <div className="mt-3 text-center">
                        <p className="mb-2">UPI ID: {UPI_CONFIG.upiId}</p>
                        <p className="mb-2">Amount: ₹{totalAmount + 5}</p>
                        <p className="mb-3">Name: {UPI_CONFIG.name}</p>
                        <div className="d-flex gap-2 justify-content-center">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Enter UPI Transaction ID"
                            value={upiTransactionId}
                            onChange={(e) => setUpiTransactionId(e.target.value)}
                          />
                          <button
                            type="button"
                            className="button border-0"
                            onClick={handleUPIPayment}
                          >
                            Confirm Payment
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="w-100 mt-3">
                  <button
                    type="submit"
                    className="button border-0"
                    disabled={paymentMethod === "upi" && showQRCode}
                  >
                    {paymentMethod === "upi" ? "Proceed to Payment" : "Place Order"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </Container>
    </>
  );
};

export default Checkout;
