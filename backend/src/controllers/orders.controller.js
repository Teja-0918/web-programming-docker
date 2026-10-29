const Order = require("../model/orders.model");
const Product = require("../model/products.model");
const User = require("../model/user.model");

// creating order with validation, dynamic delivery date and inventory deduction
async function createOrder(req, res) {
    try {
        const {
            user: userId,
            customerName,
            customerPhone,
            products: orderItems,
            shippingAddress,
            paymentMethod,
            paymentStatus,
            status,
        } = req.body;

        let resolvedCustomerName = customerName || "Customer";

        // 1. If user ID provided, verify user exists
        if (userId) {
            const userExists = await User.findById(userId);
            if (!userExists) {
                return res.status(400).json({
                    success: false,
                    message: "Selected customer does not exist",
                });
            }
            resolvedCustomerName = userExists.name || resolvedCustomerName;
        }

        // 2. Verify products array is valid
        if (!Array.isArray(orderItems) || orderItems.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Order must contain at least one product",
            });
        }

        // 3. Verify stock and calculate verified total & max delivery days
        let verifiedTotal = 0;
        const verifiedItems = [];

        for (const item of orderItems) {
            const product = await Product.findById(item.product);
            if (!product) {
                return res.status(400).json({
                    success: false,
                    message: `Product with ID ${item.product} not found`,
                });
            }

            const qty = Number(item.quantity) || 1;
            if (qty < 1) {
                return res.status(400).json({
                    success: false,
                    message: `Quantity for product "${product.name}" must be at least 1`,
                });
            }

            if (product.stock < qty) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for "${product.name}". Only ${product.stock} available.`,
                });
            }

            const itemPrice = item.price !== undefined && item.price !== '' ? Number(item.price) : product.price;
            verifiedTotal += itemPrice * qty;

            verifiedItems.push({
                product: product._id,
                quantity: qty,
                price: itemPrice,
                productDoc: product,
            });
        }

        // 4. Calculate expected delivery date based on product's deliveryDays
        const maxDeliveryDays = verifiedItems.reduce((max, i) => Math.max(max, i.productDoc.deliveryDays || 2), 2);
        const expectedDelivery = new Date();
        expectedDelivery.setDate(expectedDelivery.getDate() + maxDeliveryDays);

        // 5. Deduct stock from products
        for (const item of verifiedItems) {
            item.productDoc.stock -= item.quantity;
            if (item.productDoc.stock === 0) {
                item.productDoc.isavail = false;
            }
            await item.productDoc.save();
        }

        // 6. Create order document with verified pricing & delivery date
        const order = await Order.create({
            user: userId || null,
            customerName: resolvedCustomerName,
            customerPhone: customerPhone || "",
            products: verifiedItems.map(i => ({
                product: i.product,
                quantity: i.quantity,
                price: i.price,
            })),
            totalAmount: Number(verifiedTotal.toFixed(2)),
            status: status || "pending",
            expectedDeliveryDate: expectedDelivery,
            deliveryStatus: "pending",
            shippingAddress,
            paymentMethod: paymentMethod || "COD",
            paymentStatus: paymentStatus || "pending",
        });

        const populatedOrder = await Order.findById(order._id)
            .populate("user")
            .populate("products.product");

        res.status(201).json({
            success: true,
            data: populatedOrder,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}

async function getOrders(req, res) {
    try {
        const orders = await Order.find()
            .sort({ createdAt: -1 })
            .populate("user")
            .populate("products.product");

        res.status(200).json({
            success: true,
            count: orders.length,
            data: orders,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}

async function getOrderById(req, res) {
    try {
        const order = await Order.findById(req.params.id)
            .populate("user")
            .populate("products.product");

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "order not found",
            });
        }

        res.status(200).json({
            success: true,
            data: order,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}

async function updateOrder(req, res) {
    try {
        const existingOrder = await Order.findById(req.params.id);
        if (!existingOrder) {
            return res.status(404).json({
                success: false,
                message: "order not found",
            });
        }

        // If order was not cancelled, but is now transitioning to cancelled, replenish stock
        if (existingOrder.status !== "cancelled" && req.body.status === "cancelled") {
            for (const item of existingOrder.products) {
                if (item.product) {
                    await Product.findByIdAndUpdate(item.product, {
                        $inc: { stock: item.quantity },
                        $set: { isavail: true },
                    });
                }
            }
        }

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                returnDocument: "after",
                runValidators: true,
            }
        )
            .populate("user")
            .populate("products.product");

        res.status(200).json({
            success: true,
            data: order,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}

async function markOrderAsPaid(req, res) {
    try {
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { paymentStatus: "paid" },
            { returnDocument: "after" }
        )
            .populate("user")
            .populate("products.product");

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "order not found",
            });
        }

        res.status(200).json({
            success: true,
            data: order,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}

async function markOrderAsDelivered(req, res) {
    try {
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { deliveryStatus: "delivered", status: "delivered" },
            { returnDocument: "after" }
        )
            .populate("user")
            .populate("products.product");

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "order not found",
            });
        }

        res.status(200).json({
            success: true,
            data: order,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}

async function deleteOrder(req, res) {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "order not found",
            });
        }

        // Replenish stock if order was not cancelled or delivered
        if (order.status !== "cancelled" && order.status !== "delivered") {
            for (const item of order.products) {
                if (item.product) {
                    await Product.findByIdAndUpdate(item.product, {
                        $inc: { stock: item.quantity },
                        $set: { isavail: true },
                    });
                }
            }
        }

        await Order.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: "order deleted successfully",
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}

module.exports = {
    createOrder,
    getOrders,
    getOrderById,
    updateOrder,
    markOrderAsPaid,
    markOrderAsDelivered,
    deleteOrder,
};