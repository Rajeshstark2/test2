import React, { useEffect } from "react";
import { Table } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { getaOrder } from "../features/auth/authSlice";

const columns = [
  {
    title: "SNo",
    dataIndex: "key",
  },
  {
    title: "Product Name",
    dataIndex: "name",
  },
  {
    title: "Brand",
    dataIndex: "brand",
  },
  {
    title: "Count",
    dataIndex: "count",
  },
  {
    title: "Amount",
    dataIndex: "amount",
  },
];

const ViewOrder = () => {
  const location = useLocation();
  const orderId = location.pathname.split("/")[3];
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getaOrder(orderId));
  }, []);
  const orderState = useSelector((state) => state?.auth?.singleorder?.orders);

  const data1 = [];
  for (let i = 0; i < orderState?.orderItems?.length; i++) {
    data1.push({
      key: i + 1,
      name: orderState?.orderItems[i]?.product?.title,
      brand: orderState?.orderItems[i]?.product?.brand,
      count: orderState?.orderItems[i]?.quantity,
      amount: `₹${orderState?.orderItems[i]?.price}`,
    });
  }

  return (
    <div>
      <h3 className="mb-4 title">View Order</h3>
      
      {/* Order Details Section */}
      <div className="order-details mb-4">
        <div className="row">
          <div className="col-md-6">
            <h5>Order Information</h5>
            <p><strong>Order ID:</strong> {orderState?._id}</p>
            <p><strong>Order Date:</strong> {new Date(orderState?.createdAt).toLocaleString()}</p>
            <p><strong>Payment Method:</strong> {orderState?.paymentInfo?.paymentMethod || "COD"}</p>
            <p><strong>Payment Status:</strong> {orderState?.paymentInfo?.paymentStatus || "Pending"}</p>
            <p><strong>Total Amount:</strong> ₹{orderState?.totalPrice}</p>
            <p><strong>Order Status:</strong> {orderState?.orderStatus}</p>
          </div>
          <div className="col-md-6">
            <h5>Shipping Information</h5>
            <p><strong>Name:</strong> {orderState?.shippingInfo?.firstname} {orderState?.shippingInfo?.lastname}</p>
            <p><strong>Address:</strong> {orderState?.shippingInfo?.address}</p>
            <p><strong>City:</strong> {orderState?.shippingInfo?.city}</p>
            <p><strong>State:</strong> {orderState?.shippingInfo?.state}</p>
            <p><strong>Country:</strong> {orderState?.shippingInfo?.country}</p>
            <p><strong>Pincode:</strong> {orderState?.shippingInfo?.pincode}</p>
            <p><strong>Phone:</strong> {orderState?.shippingInfo?.mobile}</p>
          </div>
        </div>
      </div>

      {/* Order Items Table */}
      <div className="order-items">
        <h5>Order Items</h5>
        <Table columns={columns} dataSource={data1} />
      </div>
    </div>
  );
};

export default ViewOrder;
