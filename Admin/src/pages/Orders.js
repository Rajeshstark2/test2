import React, { useEffect } from "react";
import { Table } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { BiEdit } from "react-icons/bi";
import { AiFillDelete } from "react-icons/ai";
import { Link } from "react-router-dom";
import { getOrders, updateAOrder } from "../features/auth/authSlice";
import { toast } from "react-toastify";

const columns = [
  {
    title: "SNo",
    dataIndex: "key",
  },
  {
    title: "Name",
    dataIndex: "name",
  },
  {
    title: "Product",
    dataIndex: "product",
  },
  {
    title: "Amount",
    dataIndex: "amount",
  },
  {
    title: "Payment Method",
    dataIndex: "paymentMethod",
  },
  {
    title: "Shipping Info",
    dataIndex: "shippingInfo",
  },
  {
    title: "Status",
    dataIndex: "status",
  },
  {
    title: "Date",
    dataIndex: "date",
  },
  {
    title: "Action",
    dataIndex: "action",
  },
];

const Orders = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getOrders());
  }, []);
  const orderState = useSelector((state) => state?.auth?.orders.orders);
  const updateOrderState = useSelector((state) => state?.auth?.updateorder);

  useEffect(() => {
    if (updateOrderState?.success) {
      dispatch(getOrders());
      toast.success("Order status updated successfully");
    }
  }, [updateOrderState]);

  const data1 = [];
  for (let i = 0; i < orderState?.length; i++) {
    data1.push({
      key: i + 1,
      name: orderState[i]?.user?.firstname + " " + orderState[i]?.user?.lastname,
      product: (
        <Link to={`/admin-dashboard/order/${orderState[i]?._id}`} className="btn btn-primary">
          View Order Details
        </Link>
      ),
      amount: `₹${orderState[i]?.totalPrice}`,
      paymentMethod: (
        <div>
          {orderState[i]?.paymentInfo?.paymentMethod || "COD"}
          {orderState[i]?.paymentInfo?.paymentMethod === "UPI" && (
            <div style={{ fontSize: "12px", color: "#666" }}>
              Transaction ID: {orderState[i]?.paymentInfo?.upiTransactionId}
            </div>
          )}
        </div>
      ),
      shippingInfo: (
        <div className="shipping-info">
          <p><strong>Name:</strong> {orderState[i]?.shippingInfo?.firstname} {orderState[i]?.shippingInfo?.lastname}</p>
          <p><strong>Address:</strong> {orderState[i]?.shippingInfo?.address}</p>
          <p><strong>City:</strong> {orderState[i]?.shippingInfo?.city}</p>
          <p><strong>State:</strong> {orderState[i]?.shippingInfo?.state}</p>
          <p><strong>Country:</strong> {orderState[i]?.shippingInfo?.country}</p>
          <p><strong>Pincode:</strong> {orderState[i]?.shippingInfo?.pincode}</p>
          {orderState[i]?.shippingInfo?.other && (
            <p><strong>Additional Info:</strong> {orderState[i]?.shippingInfo?.other}</p>
          )}
        </div>
      ),
      status: (
        <>
          <select
            name=""
            defaultValue={orderState[i]?.orderStatus}
            onChange={(e) =>
              updateOrderStatus(orderState[i]?._id, e.target.value)
            }
            className="form-control form-select"
            id=""
          >
            <option value="Not Processed">Not Processed</option>
            <option value="Processing">Processing</option>
            <option value="Dispatched">Dispatched</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </>
      ),
      date: new Date(orderState[i]?.createdAt).toLocaleString(),
      action: (
        <>
          <Link
            to={`/admin-dashboard/order/${orderState[i]?._id}`}
            className="fs-3 text-success"
          >
            <BiEdit />
          </Link>
        </>
      ),
    });
  }

  const updateOrderStatus = (a, b) => {
    dispatch(updateAOrder({ id: a, status: b }));
  };

  return (
    <div>
      <h3 className="mb-4 title">Orders</h3>
      <div>{<Table columns={columns} dataSource={data1} />}</div>
    </div>
  );
};

export default Orders;
