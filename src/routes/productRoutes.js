const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/productControllers")

router.post("/", ctrl.createProduct);
router.get("/:id", ctrl.getProducts);

module.exports = router;