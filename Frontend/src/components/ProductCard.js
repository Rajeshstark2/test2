import React, { useEffect, useState } from "react";
import ReactStars from "react-rating-stars-component";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToWishlist } from "../features/products/productSlilce";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";

const ProductCard = ({ data }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  
  const wishlistState = useSelector((state) => state?.auth?.wishlist?.wishlist);
  const [wishlist, setWishlist] = useState(wishlistState || []);

  useEffect(() => {
    setWishlist(wishlistState || []);
  }, [wishlistState]);

  const isProductInWishlist = (productId) => wishlist?.some((item) => item._id === productId);

  const addToWish = (productId) => {
    dispatch(addToWishlist(productId));
    const updatedWishlist = isProductInWishlist(productId)
      ? wishlist.filter((item) => item._id !== productId)
      : [...wishlist, data.find((item) => item._id === productId)];
    setWishlist(updatedWishlist);
  };

  return (
    <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
      {data?.map((item, index) => {
        const isWishlist = isProductInWishlist(item._id);
        return (
          <div key={index} className="col">
            <div className="product-card position-relative p-3 shadow-sm rounded h-100">
              <div className="wishlist-icon position-absolute top-0 end-0 p-2">
                <button className="border-0 bg-transparent" onClick={() => addToWish(item._id)}>
                  {isWishlist ? <AiFillHeart className="fs-5 text-danger" /> : <AiOutlineHeart className="fs-5" />}
                </button>
              </div>
              <div className="product-image text-center">
                <img
                  src={item?.images[0]?.url}
                  className="img-fluid rounded"
                  alt="product"
                  style={{ maxHeight: "250px", width: "100%", objectFit: "cover" }}
                  onClick={() => navigate(`/product/${item?._id}`)}
                />
              </div>
              <div className="product-details text-center mt-3">
                <h6 className="brand text-secondary">{item?.brand}</h6>
                <h5 className="product-title text-truncate">{item?.title}</h5>
                <ReactStars count={5} size={20} value={item?.totalrating} edit={false} activeColor="#ffd700" />
                <p className="price fw-bold mt-2">Rs.{item?.price}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProductCard;
