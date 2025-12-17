const express = require("express");
const router = express.Router();
const controller = require("../controllers/pricingController");

router.get("/:product_id/price", controller.getProductPrice);

module.exports = router;