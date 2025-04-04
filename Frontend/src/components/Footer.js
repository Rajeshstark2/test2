import React from "react";
import { Link } from "react-router-dom";
import { BsLinkedin, BsGithub, BsYoutube, BsInstagram } from "react-icons/bs";
import newsletter from "../images/newsletter.png";

const Footer = () => {
  return (
    <>
      {/* Newsletter Section */}
      <footer className="py-4">
        <div className="container-xxl">
          <div className="row align-items-center">
            <div className="col-12 col-lg-5 mb-3 mb-lg-0">
              <div className="footer-top-data d-flex gap-30 align-items-center">
                <img src={newsletter} alt="newsletter" className="img-fluid" />
                <h2 className="mb-0 text-white">Sign Up for upcoming products</h2>
              </div>
            </div>
            <div className="col-12 col-lg-7">
              <div className="input-group">
                <input
                  type="text"
                  className="form-control py-1"
                  placeholder="Your Email Address"
                  aria-label="Your Email Address"
                  aria-describedby="basic-addon2"
                />
                <span className="input-group-text p-2" id="basic-addon2">
                  Subscribe
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Main Footer Section */}
      <footer className="py-4">
        <div className="container-xxl">
          <div className="row">
            {/* Contact Us */}
            <div className="col-12 col-md-6 col-lg-4 mb-4 mb-lg-0">
              <h4 className="text-white mb-4">Contact Us</h4>
              <div>
                <address className="text-white fs-6">
                  PGM Enterprises: <br />
                  169/4A9, Gandhi Nagar Poongunam, <br />
                  Panruti, Cuddalore Dist. <br />
                  Tamil Nadu <br />
                  PinCode: 607 106
                </address>
                <a
                  href="tel:+91 97918 46885"
                  className="mt-3 d-block mb-1 text-white"
                >
                  +91 97918 46885
                </a>
                <a
                  href="mailto:prabanjam.original@gmail.com"
                  className="mt-2 d-block mb-0 text-white"
                >
                  prabanjam.original@gmail.com
                </a>
                <div className="social_icons d-flex align-items-center gap-30 mt-4">
                  <a className="text-white" href="#">
                    <BsLinkedin className="fs-4" />
                  </a>
                  <a className="text-white" href="#">
                    <BsInstagram className="fs-4" />
                  </a>
                  <a className="text-white" href="#">
                    <BsGithub className="fs-4" />
                  </a>
                  <a className="text-white" href="#">
                    <BsYoutube className="fs-4" />
                  </a>
                </div>
              </div>
            </div>

            {/* Information */}
            <div className="col-6 col-md-3 col-lg-3 mb-4 mb-lg-0">
              <h4 className="text-white mb-4">Information</h4>
              <div className="footer-link d-flex flex-column">
                <Link to="/privacy-policy" className="text-white py-2 mb-1">
                  Privacy Policy
                </Link>
                <Link to="/refund-policy" className="text-white py-2 mb-1">
                  Refund Policy
                </Link>
                <Link to="/shipping-policy" className="text-white py-2 mb-1">
                  Shipping Policy
                </Link>
                <Link to="/term-conditions" className="text-white py-2 mb-1">
                  Terms & Conditions
                </Link>
                <Link className="text-white py-2 mb-1">Blogs</Link>
              </div>
            </div>

            {/* Why Choose Us */}
            <div className="col-6 col-md-3 col-lg-3 mb-4 mb-lg-0">
              <h4 className="text-white mb-4">Why Choose Us ?</h4>
              <div className="footer-link d-flex flex-column">
                <Link className="text-white py-2 mb-1">High-Quality</Link>
                <Link className="text-white py-2 mb-1">Affordable Pricing</Link>
                <Link className="text-white py-2 mb-1">100% Farm Fresh</Link>
              </div>
            </div>

            {/* FSSAI License Number */}
            <div className="col-12 col-md-6 col-lg-2">
              <h4 className="text-white mb-4">FSSAI License Number:</h4>
              <div className="footer-link d-flex flex-column">
                <Link className="text-white py-2 mb-1">22423029000361</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Copyright Section */}
      <footer className="py-4">
        <div className="container-xxl">
          <div className="row">
            <div className="col-12">
              <p className="text-center mb-0 text-white">
                &copy; {new Date().getFullYear()}; Powered by PRABANJAM
              </p>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;