const express = require("express");
const router = express.Router();

const {
    createOrder,
    getOrders,
    getOrderById,
    updateOrder,
    markOrderAsPaid,
    markOrderAsDelivered,
    deleteOrder
} = require("../controllers/orders.controller");

router.post("/", createOrder);
router.get("/", getOrders);
router.get("/:id", getOrderById);
router.put("/:id", updateOrder);
router.put("/:id/pay", markOrderAsPaid);
router.put("/:id/deliver", markOrderAsDelivered);
router.delete("/:id", deleteOrder);

module.exports = router;