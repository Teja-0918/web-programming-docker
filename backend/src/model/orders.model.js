const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: false,
        },

        customerName: {
            type: String,
            trim: true,
            default: "Customer",
        },

        customerPhone: {
            type: String,
            trim: true,
            default: "",
        },

        products: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    required: true,
                },

                quantity: {
                    type: Number,
                    required: true,
                    min: 1,
                    default: 1,
                },

                price: {
                    type: Number,
                    required: true,
                    min: 0,
                },
            }
        ],

        totalAmount: {
            type: Number,
            required: true,
            min: 0,
        },

        status: {
            type: String,
            enum: [
                "pending",
                "confirmed",
                "shipped",
                "delivered",
                "cancelled"
            ],
            default: "pending",
        },

        expectedDeliveryDate: {
            type: Date,
        },

        deliveryStatus: {
            type: String,
            enum: ["pending", "delivered"],
            default: "pending",
        },

        shippingAddress: {
            address: {
                type: String,
                required: true,
                trim: true,
            },

            city: {
                type: String,
                required: true,
                trim: true,
            },

            state: {
                type: String,
                required: true,
                trim: true,
            },

            pincode: {
                type: String,
                required: true,
                trim: true,
            },
        },

        paymentMethod: {
            type: String,
            enum: [
                "COD",
                "UPI",
                "Card"
            ],
            default: "COD",
            required: true,
        },

        paymentStatus: {
            type: String,
            enum: [
                "pending",
                "paid",
                "failed"
            ],
            default: "pending",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Order", orderSchema);