import React, { useEffect } from "react";
import Container from "../components/Container";
import BreadCrumb from "../components/BreadCrumb";
import { useDispatch, useSelector } from "react-redux";
import { getOrders } from "../features/user/userSlice";
import "./orders.css";

const Orders = () => {
  const dispatch = useDispatch();
  const orderState = useSelector(
    (state) => state?.auth?.getorderedProduct?.orders
  );

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
    dispatch(getOrders(config2));
  }, []);

  return (
    <>
      <BreadCrumb title="My Orders" />
      <Container class1="cart-wrapper home-wrapper-2 py-5">
        <div className="row">
          <div className="col-12">
            <div className="order-header d-none d-md-flex">
              <div className="col-md-3">
                <h5>Order Id</h5>
              </div>
              <div className="col-md-3">
                <h5>Total Amount</h5>
              </div>
              <div className="col-md-3">
                <h5>Total After Discount</h5>
              </div>
              <div className="col-md-3">
                <h5>Status</h5>
              </div>
            </div>

            <div className="orders-list">
              {orderState &&
                orderState?.map((item, index) => {
                  return (
                    <div className="order-card" key={index}>
                      {/* Order Summary - Visible on both mobile and desktop */}
                      <div className="order-summary">
                        <div className="order-info">
                          <div className="info-item">
                            <span className="label d-md-none">Order ID:</span>
                            <span className="value">{item?._id}</span>
                          </div>
                          <div className="info-item">
                            <span className="label d-md-none">Total:</span>
                            <span className="value">₹{item?.totalPrice}</span>
                          </div>
                          <div className="info-item">
                            <span className="label d-md-none">After Discount:</span>
                            <span className="value">₹{item?.totalPriceAfterDiscount}</span>
                          </div>
                          <div className="info-item">
                            <span className="label d-md-none">Status:</span>
                            <span className={`value status-badge ${item?.orderStatus?.toLowerCase()}`}>
                              {item?.orderStatus}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="order-items">
                        <div className="items-header">
                          <div className="row">
                            <div className="col-6 col-md-3">
                              <h6>Product</h6>
                            </div>
                            <div className="col-2 col-md-3">
                              <h6>Qty</h6>
                            </div>
                            <div className="col-2 col-md-3">
                              <h6>Price</h6>
                            </div>
                            <div className="col-2 col-md-3">
                              <h6>Color</h6>
                            </div>
                          </div>
                        </div>

                        <div className="items-list">
                          {item?.orderItems?.map((i, index) => (
                            <div className="item-row" key={index}>
                              <div className="row align-items-center">
                                <div className="col-6 col-md-3">
                                  <p className="product-title">{i?.product?.title}</p>
                                </div>
                                <div className="col-2 col-md-3">
                                  <p>{i?.quantity}</p>
                                </div>
                                <div className="col-2 col-md-3">
                                  <p>₹{i?.price}</p>
                                </div>
                                <div className="col-2 col-md-3">
                                  <div 
                                    className="color-box"
                                    style={{
                                      backgroundColor: i?.color?.title,
                                      width: "25px",
                                      height: "25px",
                                      borderRadius: "50%",
                                      border: "1px solid #ddd"
                                    }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </Container>
    </>
  );
};

export default Orders;
