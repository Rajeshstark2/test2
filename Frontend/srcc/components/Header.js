import React, { useEffect, useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { BsSearch } from "react-icons/bs";
import compare from "../images/compare.svg";
import wishlist from "../images/wishlist.svg";
import user from "../images/user.svg";
import cart from "../images/cart.svg";
import menu from "../images/menu.svg";
import { useDispatch, useSelector } from "react-redux";
import { Typeahead } from "react-bootstrap-typeahead";
import "react-bootstrap-typeahead/css/Typeahead.css";
import { getAProduct } from "../features/products/productSlilce";
import { getUserCart } from "../features/user/userSlice";
import { Navbar, Nav, Container, Offcanvas } from "react-bootstrap";

const Header = () => {
  const dispatch = useDispatch();
  const cartState = useSelector((state) => state?.auth?.cartProducts);
  const authState = useSelector((state) => state?.auth);
  const [total, setTotal] = useState(null);
  const [paginate, setPaginate] = useState(true);
  const productState = useSelector((state) => state?.product?.product);
  const navigate = useNavigate();

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
    dispatch(getUserCart(config2));
  }, []);

  const [productOpt, setProductOpt] = useState([]);
  useEffect(() => {
    let sum = 0;
    for (let index = 0; index < cartState?.length; index++) {
      sum = sum + Number(cartState[index].quantity) * cartState[index].price;
      setTotal(sum);
    }
  }, [cartState]);

  useEffect(() => {
    let data = [];
    for (let index = 0; index < productState?.length; index++) {
      const element = productState[index];
      data.push({ id: index, prod: element?._id, name: element?.title });
    }
    setProductOpt(data);
  }, [productState]);

  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <>
      {/* Top Strip */}
      <header className="header-top-strip py-3">
        <div className="container-xxl">
          <div className="row">
            <div className="col-6">
              <p className="text-white mb-0">A Traditional Product, Naturally Perfect!</p>
            </div>
            <div className="col-6">
              <p className="text-end text-white mb-0">
                Call:
                <a className="text-white" href="tel:+91 97918 46885">
                  +91 97918 46885
                </a>
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Header */}
      <header className="header-upper py-3">
        <div className="container-xxl">
          <div className="row align-items-center">
            <div className="col-12 col-lg-2 mb-3 mb-lg-0">
              <h2>
                <Link className="text-white" to="/">
                  PRABANJAM
                </Link>
              </h2>
            </div>
            <div className="col-12 col-lg-5 mb-3 mb-lg-0">
              <div className="input-group">
                <Typeahead
                  id="pagination-example"
                  onPaginate={() => console.log("Results paginated")}
                  onChange={(selected) => {
                    navigate(`/product/${selected[0]?.prod}`);
                    dispatch(getAProduct(selected[0]?.prod));
                  }}
                  options={productOpt}
                  paginate={paginate}
                  labelKey={"name"}
                  placeholder="Search for Products here"
                />
                <span className="input-group-text p-3" id="basic-addon2">
                  <BsSearch className="fs-6" />
                </span>
              </div>
            </div>
            <div className="col-12 col-lg-5">
              <div className="header-upper-links d-flex align-items-center justify-content-between flex-wrap gap-3">
                <div>
                  <Link
                    to="/wishlist"
                    className="d-flex align-items-center gap-10 text-white"
                  >
                    <img src={wishlist} alt="wishlist" />
                    <p className="mb-0">
                      Favourite <br /> wishlist
                    </p>
                  </Link>
                </div>
                <div>
                  <Link
                    to={authState?.user === null ? "/login" : "my-profile"}
                    className="d-flex align-items-center gap-10 text-white"
                  >
                    <img src={user} alt="user" />
                    {authState?.user === null ? (
                      <p className="mb-0">
                        Log in <br /> My Account
                      </p>
                    ) : (
                      <p className="mb-0">
                        Welcome {authState?.user?.firstname}
                      </p>
                    )}
                  </Link>
                </div>
                <div>
                  <Link
                    to="/cart"
                    className="d-flex align-items-center gap-10 text-white"
                  >
                    <img src={cart} alt="cart" />
                    <div className="d-flex flex-column gap-10">
                      <span className="badge bg-white text-dark">
                        {cartState?.length ? cartState?.length : 0}
                      </span>
                      <p className="mb-0">
                        Rs. {!cartState?.length ? 0 : total ? total : 0}
                      </p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Bottom Header with Navigation */}
      <header className="header-bottom py-3">
        <div className="container-xxl">
          <div className="row">
            <div className="col-12">
              <Navbar expand="lg" className="p-0">
                <Container fluid>
                  <Navbar.Toggle aria-controls="offcanvasNavbar" className="border-0">
                    <img src={menu} alt="menu" />
                  </Navbar.Toggle>
                  <Navbar.Offcanvas
                    id="offcanvasNavbar"
                    aria-labelledby="offcanvasNavbarLabel"
                    placement="start"
                  >
                    <Offcanvas.Header closeButton>
                      <Offcanvas.Title id="offcanvasNavbarLabel">
                        PRABANJAM
                      </Offcanvas.Title>
                    </Offcanvas.Header>
                    <Offcanvas.Body>
                      <Nav className="menu-links d-flex align-items-center gap-15 flex-wrap">
                        <NavLink to="/">Home</NavLink>
                        <NavLink to="/product">Our Store</NavLink>
                        <NavLink to="/my-orders">My Orders</NavLink>
                        <NavLink to="/blogs">Blogs</NavLink>
                        <NavLink to="/contact">Contact</NavLink>
                        <NavLink to="/login">LogOut</NavLink>
                        {authState?.user !== null && (
                          <button
                            className="border border-0 bg-transparent text-white text-uppercase"
                            type="button"
                            style={{ backgroundColor: "#232f3e" }}
                            onClick={handleLogout}
                          >
                            LogOut
                          </button>
                        )}
                      </Nav>
                    </Offcanvas.Body>
                  </Navbar.Offcanvas>
                </Container>
              </Navbar>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;