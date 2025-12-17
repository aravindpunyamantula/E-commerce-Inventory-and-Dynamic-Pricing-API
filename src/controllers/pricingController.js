const { getPool } = require("../config/db");
const pool = getPool();

const { calculatePrice } = require("../services/pricingService");
const  {getActivePricingRules}  = require("../repositories/pricingRuleRepository");

exports.getProductPrice = async (req, res) => {
  const productId = req.params.product_id;
  const quantity = parseInt(req.query.quantity, 10);
  const user_tier = req.query.user_tier;

  if (!quantity || quantity <= 0) {
    return res.status(400).json({ error: "Invalid quantity" });
  }

  const [products] = await pool.query(
    "SELECT base_price FROM products WHERE id = ? AND status = 'ACTIVE'",
    [productId]
  );

  if (!products.length) {
    return res.status(404).json({ error: "Product not found" });
  }

  const basePrice = products[0].base_price * quantity;
  const rules = await getActivePricingRules();

  const pricing = calculatePrice(basePrice, quantity, rules, { user_tier });

  res.json({
    product_id: productId,
    quantity,
    base_price: basePrice,
    final_price: pricing.final_price,
    discounts: pricing.breakdown
  });
};
