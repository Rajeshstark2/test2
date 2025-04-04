const mongoose = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model
var orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    shippingInfo: {
      firstname: {
        type: String,
        required: true,
      },
      lastname: {
        type: String,
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: true,
      },
      pincode: {
        type: Number,
        required: true,
      },
      other: {
        type: String,
      },
    },
    orderItems: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        color: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Color",
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    totalPrice: {
      type: Number,
      required: true,
    },
    totalPriceAfterDiscount: {
      type: Number,
    },
    paymentInfo: {
      paymentMethod: {
        type: String,
        required: true,
        enum: ["UPI", "COD"],
        uppercase: true
      },
      paymentStatus: {
        type: String,
        required: true,
        enum: ["Pending", "Completed"],
        default: "Pending"
      },
      upiTransactionId: {
        type: String,
        required: function() {
          return this.paymentInfo.paymentMethod === "UPI";
        }
      }
    },
    orderStatus: {
      type: String,
      default: "Processing",
    },
    paidAt: {
      type: Date,
    },
    month: {
      type: Number,
      default: new Date().getMonth(),
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Add a pre-save middleware to handle payment method and status
orderSchema.pre('save', function(next) {
  if (this.paymentInfo && this.paymentInfo.paymentMethod) {
    this.paymentInfo.paymentMethod = this.paymentInfo.paymentMethod.toUpperCase();
  }

  // Validate shipping info
  if (!this.shippingInfo || !this.shippingInfo.firstname || !this.shippingInfo.lastname) {
    throw new Error("Shipping information is incomplete");
  }
  
  // Validate order items
  if (!this.orderItems || this.orderItems.length === 0) {
    throw new Error("Order must contain at least one item");
  }
  
  next();
});

//Export the model
module.exports = mongoose.model("Order", orderSchema);
