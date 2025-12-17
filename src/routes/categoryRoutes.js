const express = require("express");
const router = express.Router();
const controller = require("../controllers/categoryControllers");

router.post("/", controller.createCategory);
router.get("/", controller.getCategories);

module.exports = router;