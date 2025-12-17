const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/variantControllers")

router.post("/", ctrl.createVariant);
router.get("/:productId", ctrl.getVariantsByProduct);


module.exports = router;