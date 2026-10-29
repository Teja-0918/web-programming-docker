const User = require("../model/user.model");
const Order = require("../model/orders.model");

// creating user
async function createUser(req, res) {
    try {
        const user = await User.create(req.body);
        res.status(201).json({
            success: true,
            data: user,
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Email is already registered",
            });
        }
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}

async function getUsers(req, res) {
    try {
        const filter = {};
        if (req.query.role) {
            filter.role = req.query.role;
        }
        const users = await User.find(filter).sort({ createdAt: -1 });

        // Retrieve orders to attach spending & order counts for each user
        const orders = await Order.find({}, 'user customerPhone customerName totalAmount status');
        const enrichedUsers = users.map((u) => {
            const uObj = u.toObject();
            const userOrders = orders.filter((o) =>
                (o.user && o.user.toString() === u._id.toString()) ||
                (u.phone && o.customerPhone === u.phone) ||
                (o.customerName && u.name && o.customerName.toLowerCase() === u.name.toLowerCase())
            );
            uObj.orderCount = userOrders.length;
            uObj.totalSpent = userOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
            return uObj;
        });

        res.status(200).json({
            success: true,
            count: enrichedUsers.length,
            data: enrichedUsers,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}

async function getUserById(req, res) {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "user not found",
            });
        }

        // Fetch all orders matching this user
        const queryOr = [{ user: user._id }];
        if (user.phone) {
            queryOr.push({ customerPhone: user.phone });
        }
        if (user.name) {
            queryOr.push({ customerName: user.name });
        }

        const orders = await Order.find({ $or: queryOr })
            .populate('products.product')
            .sort({ createdAt: -1 });

        const uObj = user.toObject();
        uObj.orders = orders;
        uObj.orderCount = orders.length;
        uObj.totalSpent = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

        res.status(200).json({
            success: true,
            data: uObj,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}

async function updateUser(req, res) {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, {
            returnDocument: "after",
            runValidators: true,
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "user not found",
            });
        }
        res.status(200).json({
            success: true,
            data: user,
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Email is already registered",
            });
        }
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}

async function deleteUser(req, res) {
    try {
        const activeOrders = await Order.countDocuments({ user: req.params.id });
        if (activeOrders > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete user: ${activeOrders} order(s) are linked to this user.`,
            });
        }

        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "user not found",
            });
        }
        res.status(200).json({
            success: true,
            message: "user deleted successfully",
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}

module.exports = { createUser, getUsers, getUserById, updateUser, deleteUser };