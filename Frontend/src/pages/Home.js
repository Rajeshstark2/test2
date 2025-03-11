import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Marquee from "react-fast-marquee";
import BlogCard from "../components/BlogCard";
import ProductCard from "../components/ProductCard";
import SpecialProduct from "../components/SpecialProduct";
import Container from "../components/Container";
import { services } from "../utils/Data";
import prodcompare from "../images/prodcompare.svg";
import wish from "../images/wish.svg";
import wishlist from "../images/wishlist.svg";
import watch from "../images/watch.jpg";
import watch2 from "../images/watch-1.avif";
import addcart from "../images/add-cart.svg";
import view from "../images/view.svg";
import { useDispatch, useSelector } from "react-redux";
import { getAllBlogs } from "../features/blogs/blogSlice";
import moment from "moment";
import { getAllProducts } from "../features/products/productSlilce";
import ReactStars from "react-rating-stars-component";
import { addToWishlist } from "../features/products/productSlilce";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";

const Home = () => {
  const blogState = useSelector((state) => state?.blog?.blog);
  const productState = useSelector((state) => state?.product?.product);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    getblogs();
    getProducts();
  }, [dispatch]);

  const getblogs = () => {
    dispatch(getAllBlogs());
  };

  const getProducts = () => {
    dispatch(getAllProducts());
  };

  const addToWish = (id) => {
    dispatch(addToWishlist(id));
  };

  if (!productState) {
    return <div>Loading...</div>;
  }

  return (
    <>
   <Container class1="home-wrapper-1 py-5">
        <div className="row">
          <div className="col-6">
            <div className="main-banner position-relative ">
              <img
                src="images/main-banner-1.jpg"
                className="img-fluid rounded-3"
                alt="main banner"
              />
              <div className="main-banner-content position-absolute">
                <h4>why Wait!</h4>
                <h5>Add to cart , add to Benefits!</h5>
                <p>From Rs. 299 </p>
                <Link to="/product" className="button">BUY NOW</Link>
              </div>
            </div>
          </div>
          <div className="col-6">
            <div className="d-flex flex-wrap gap-10 justify-content-between align-items-center">
              <div className="small-banner position-relative">
                <img
                  src="images/catbanner-01.jpg"
                  className="img-fluid rounded-3"
                  alt="main banner"
                />
                <div className="small-banner-content position-absolute">
                  <h4></h4>
                  <h5></h5>
                  <p>
                    <br />
                  </p>
                </div>
              </div>
              <div className="small-banner position-relative">
                <img
                  src="images/catbanner-02.jpg"
                  className="img-fluid rounded-3"
                  alt="main banner"
                />
                <div className="small-banner-content position-absolute">
                  <h4></h4>
                  <h5></h5>
                  <p>
                   <br />
                  </p>
                </div>
              </div>
              <div className="small-banner position-relative ">
                <img
                  src="images/catbanner-03.jpg"
                  className="img-fluid rounded-3"
                  alt="main banner"
                />
                <div className="small-banner-content position-absolute">
                  <h4></h4>
                  <h5></h5>
                  <p>
                    <br />
                  </p>
                </div>
              </div>
              <div className="small-banner position-relative ">
                <img
                  src="images/catbanner-04.jpg"
                  className="img-fluid rounded-3"
                  alt="main banner"
                />
                <div className="small-banner-content position-absolute">
                  <h4></h4>
                  <h5></h5>
                  <p>
                    <br />
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>            
      <Container class1="featured-wrapper py-5 home-wrapper-2">
  <div className="row">
    <div className="col-12">
      <h3 className="section-heading">Featured Collection</h3>
    </div>
    {productState?.map((item, index) => {
      if (item.tags === "featured") {
        return (
          <div key={index} className="col-12 col-md-6 col-lg-3 mb-4">
            <div className="product-card position-relative">
              <div className="wishlist-icon position-absolute">
                <button className="border-0 bg-transparent">
                  <img
                    src={wish}
                    alt="wishlist"
                    onClick={() => addToWish(item?._id)}
                  />
                </button>
              </div>
              <div className="product-image text-center">
                <img
                  src={item?.images?.[0]?.url || "default-image-url.jpg"}
                  alt="product image"
                  className="img-fluid"
                  style={{ maxHeight: "250px", objectFit: "cover" }}
                  onClick={() => navigate("/product/" + item?._id)}
                />
              </div>
              <div className="product-details text-center">
                <h6 className="brand">{item?.brand}</h6>
                <h5 className="product-title">
                  {item?.title?.substr(0, 70) + "..."}
                </h5>
                <ReactStars
                  count={5}
                  size={20}
                  value={item?.totalrating?.toString()}
                  edit={false}
                  activeColor="#ffd700"
                />
                <p className="price fw-bold">Rs. {item?.price}</p>
              </div>
            </div>
          </div>
        );
      }
    })}
  </div>
</Container>
      <Container class1="famous-wrapper py-5 home-wrapper-2">
        <div className="row">
          <div className="col-3">
            <div className="famous-card position-relative">
              <img
                src="images/famous-1.webp"
                className="img-fluid"
                alt="famous"
              />
              <div className="famous-content position-absolute">
                <h5></h5>
                <h6></h6>
                <p></p>
              </div>
            </div>
          </div>
          <div className="col-3">
            <div className="famous-card position-relative">
              <img
                src="images/famous-2.webp"
                className="img-fluid"
                alt="famous"
              />
              <div className="famous-content position-absolute">
                <h5 className="text-dark"></h5>
                <h6 className="text-dark"></h6>
                <p className="text-dark"></p>
              </div>
            </div>
          </div>
          <div className="col-3">
            <div className="famous-card position-relative">
              <img
                src="images/famous-3.webp"
                className="img-fluid"
                alt="famous"
              />
              <div className="famous-content position-absolute">
                <h5 className="text-dark"></h5>
                <h6 className="text-dark"></h6>
                <p className="text-dark"></p>
              </div>
            </div>
          </div>
          <div className="col-3">
            <div className="famous-card position-relative">
              <img
                src="images/famous-3.webp"
                className="img-fluid"
                alt="famous"
              />
              <div className="famous-content position-absolute">
                <h5 className="text-dark"></h5>
                <h6 className="text-dark"></h6>
                <p className="text-dark"></p>
              </div>
            </div>
          </div>
        </div>
      </Container>

      <Container class1="special-wrapper py-5 home-wrapper-2">
  <div className="row">
    <div className="col-12">
      <h3 className="section-heading">Special Products</h3>
    </div>
  </div>
  <div className="row">
    {productState?.map((item, index) => {
      if (item.tags === "special") {
        return (
          <div key={index} className="col-12 col-md-6 col-lg-4 mb-4">
            <SpecialProduct
              id={item?._id}
              title={item?.title}
              brand={item?.brand}
              totalrating={item?.totalrating?.toString()}
              price={item?.price}
              img={item?.images?.[0]?.url || "default-image-url.jpg"}
              sold={item?.sold}
              quantity={item?.quantity}
            />
          </div>
        );
      }
    })}
  </div>
</Container>
      <Container class1="popular-wrapper py-5 home-wrapper-2">
        <div className="row">
          <div className="col-12">
            <h3 className="section-heading">our quality is the identity of our goods</h3>
          </div>
        </div>
        <div className="row">
          {productState?.map((item, index) => {
            if (item.tags === "popular") {
              return (
                <div key={index} className={"col-3"}>
                  <div className="product-card position-relative">
                    <div className="wishlist-icon position-absolute">
                      <button className="border-0 bg-transparent">
                        <img
                          src={wish}
                          alt="wishlist"
                          onClick={(e) => {
                            addToWish(item?._id);
                          }}
                        />
                      </button>
                    </div>
                    <div className="product-image">
                      <img
                        src={item?.images?.[0]?.url || "default-image-url.jpg"}
                        alt="product image"
                        height={"250px"}
                        width={"100%"}
                        onClick={() => navigate("/product/" + item?._id)}
                      />
                      <img
                        src={item?.images?.[0]?.url || "default-image-url.jpg"}
                        alt="product image"
                        height={"250px"}
                        width={"100%"}
                        onClick={() => navigate("/product/" + item?._id)}
                      />
                    </div>
                    <div className="product-details">
                      <h6 className="brand">{item?.brand}</h6>
                      <h5 className="product-title">
                        {item?.title?.substr(0, 70) + "..."}
                      </h5>
                      <ReactStars
                        count={5}
                        size={24}
                        value={item?.totalrating?.toString()}
                        edit={false}
                        activeColor="#ffd700"
                      />

                      <p className="price">Rs. {item?.price}</p>
                    </div>
                    <div className="action-bar position-absolute">
                      <div className="d-flex flex-column gap-15">
                        {/* <button className="border-0 bg-transparent">
                          <img src={prodcompare} alt="compare" />
                        </button> */}
                        {/* <button className="border-0 bg-transparent">
                          <img
                            onClick={() => navigate("/product/" + item?._id)}
                            src={view}
                            alt="view"
                          />
                        </button> */}
                        {/* <button className="border-0 bg-transparent">
                          <img src={addcart} alt="addcart" />
                        </button> */}
                      </div>
                    </div>
                  </div>
                </div>
              );
            }
          })}
        </div>
      </Container>
      <Container class1="marque-wrapper home-wrapper-2 py-5">
        <div className="row">
          <div className="col-12">
            <div className="marquee-inner-wrapper card-wrapper">
              <Marquee className="d-flex">
                <div className="mx-4 w-25">
                  <img src="images/brand-01.png" alt="brand" />
                </div>
                <div className="mx-4 w-25">
                  <img src="images/brand-02.png" alt="brand" />
                </div>
                <div className="mx-4 w-25">
                  <img src="images/brand-03.png" alt="brand" />
                </div>
                <div className="mx-4 w-25">
                  <img src="images/brand-04.png" alt="brand" />
                </div>
                <div className="mx-4 w-25">
                  <img src="images/brand-05.png" alt="brand" />
                </div>
                <div className="mx-4 w-25">
                  <img src="images/brand-06.png" alt="brand" />
                </div>
                <div className="mx-4 w-25">
                <img src="images/brand-07.png" alt="brand" />
                </div>
                <div className="mx-4 w-25">
                  <img src="images/brand-08.png" alt="brand" />
                </div>
              </Marquee>
            </div>
          </div>
        </div>
      </Container>

      <Container class1="blog-wrapper py-5 home-wrapper-2">
        <div className="row">
          <div className="col-12">
            <h3 className="section-heading">Our Latest Blogs</h3>
          </div>
        </div>
        <div className="row">
          {blogState &&
            blogState?.map((item, index) => {
              if (index < 4) {
                return (
                  <div className="col-3" key={index}>
                    <BlogCard
                      id={item?._id}
                      title={item?.title}
                      description={item?.description}
                      image={item?.images?.[0]?.url || "default-image-url.jpg"}
                      date={moment(item?.createdAt).format(
                        "MMMM Do YYYY, h:mm a"
                      )}
                    />
                  </div>
                );
              }
            })}
        </div>
      </Container>
    </>
  );
};

export default Home;