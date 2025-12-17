const express = require("express");
require("dotenv").config();
const categoryRoutes = require("./routes/categoryRoutes");
const productRoutes = require("./routes/productRoutes");
const variantRoutes = require("./routes/variantRoutes");
const pricingRoutes = require("./routes/pricingRoutes");
const cartRoutes = require("./routes/cartRoutes");
const checkoutRoutes = require("./routes/checkoutRoutes");
const app = express();
app.use(express.json());

app.get("/health", (req, res)=>{
    res.send("<h1>Server is Running...</h1>")
})

app.use("/categories", categoryRoutes);
app.use("/products", productRoutes);
app.use("/variants", variantRoutes);
app.use("/products", pricingRoutes);
app.use("/cart", cartRoutes);
app.use("/cart/checkout", checkoutRoutes);



app.listen(3000, ()=>{
    console.log("Server Running on port 3000");
})