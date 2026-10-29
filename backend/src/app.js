const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/user.routes");
const prodRoutes = require("./routes/product.routes");
const ordRoutes = require("./routes/order.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "MERNexus API is running",
    });
});

app.get("/stats", async (req, res) => {
    try {
        const User = require("./model/user.model");
        const Product = require("./model/products.model");
        const Order = require("./model/orders.model");

        const [users, products, orders] = await Promise.all([
            User.countDocuments(),
            Product.countDocuments(),
            Order.countDocuments(),
        ]);

        res.json({
            success: true,
            data: { users, products, orders },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

app.use("/users", userRoutes);
app.use("/products", prodRoutes);
app.use("/orders", ordRoutes);

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`,
    });
});

// Centralized error handler
app.use((err, req, res, next) => {
    console.error("Server error:", err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal server error",
    });
});

module.exports = app;