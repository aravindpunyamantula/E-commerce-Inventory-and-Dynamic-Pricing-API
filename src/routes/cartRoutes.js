const express = require("express");
const router = express.Router();
const controller = require("../controllers/cartController");

router.post("/items", controller.addToCart);
router.put("/items", controller.updateCartItem);
router.delete("/items/:cart_item_id", controller.removeCartItem);


module.exports = router;