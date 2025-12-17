const { getPool } = require("../config/db");
const pool = getPool();
const { getOrCreateCart } = require("../services/cartService");
const { getActivePricingRules } = require("../repositories/pricingRuleRepository");
const { calculatePrice } = require("../services/pricingService");

exports.addToCart = async (req, res) => {
  const { variant_id, quantity, user_id, user_tier } = req.body;

  if (!variant_id || !quantity || quantity <= 0) {
    return res.status(400).json({ error: "Invalid input" });
  }

  const conn = await pool.getConnection(); 
  try {
    await conn.beginTransaction(); 

  
    const [inventory] = await conn.query(
      "SELECT stock_quantity, reserved_quantity FROM inventory WHERE variant_id = ? FOR UPDATE",
      [variant_id]
    );

    if (!inventory.length) {
      throw new Error("Inventory not found");
    }

    const available =
      inventory[0].stock_quantity - inventory[0].reserved_quantity;

    if (available < quantity) {
      throw new Error("Insufficient stock");
    }

  
    await conn.query(
      "UPDATE inventory SET reserved_quantity = reserved_quantity + ? WHERE variant_id = ?",
      [quantity, variant_id]
    );


    const [rows] = await conn.query(
      `SELECT p.base_price, v.price_adjustment
       FROM variants v
       JOIN products p ON p.id = v.product_id
       WHERE v.id = ?`,
      [variant_id]
    );

    if (!rows.length) {
      throw new Error("Variant not found");
    }

    const product = rows[0];
    console.log({
  base_price: product.base_price,
  price_adjustment: product.price_adjustment,
  quantity
});

   const basePrice =
  (Number(product.base_price) + Number(product.price_adjustment)) *
  Number(quantity);


    const rules = await getActivePricingRules();
    const pricing = calculatePrice(basePrice, quantity, rules, { user_tier });

 
    const cartId = await getOrCreateCart(user_id);

    await conn.query(
      `INSERT INTO cart_items
       (cart_id, variant_id, quantity, price_snapshot, reservation_expires_at)
       VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 15 MINUTE))`,
      [cartId, variant_id, quantity, pricing.final_price]
    );

    await conn.commit(); 

    res.status(201).json({
      cart_id: cartId,
      price_snapshot: pricing.final_price,
      expires_in_minutes: 15
    });

  } catch (e) {
    await conn.rollback(); 
    res.status(400).json({ error: e.message });
  } finally {
    conn.release(); 
  }
};


exports.updateCartItem = async (req, res) => {
  const { cart_item_id, new_quantity } = req.body;

  if (!cart_item_id || new_quantity <= 0) {
    return res.status(400).json({ error: "Invalid input" });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Lock cart item
    const [items] = await conn.query(
      "SELECT variant_id, quantity FROM cart_items WHERE id = ? FOR UPDATE",
      [cart_item_id]
    );

    if (!items.length) throw new Error("Cart item not found");

    const item = items[0];
    const diff = new_quantity - item.quantity;

    // 2. Adjust inventory
    if (diff !== 0) {
      const [inv] = await conn.query(
        "SELECT stock_quantity, reserved_quantity FROM inventory WHERE variant_id = ? FOR UPDATE",
        [item.variant_id]
      );

      const available =
        inv[0].stock_quantity - inv[0].reserved_quantity;

      if (diff > 0 && available < diff) {
        throw new Error("Insufficient stock");
      }

      await conn.query(
        "UPDATE inventory SET reserved_quantity = reserved_quantity + ? WHERE variant_id = ?",
        [diff, item.variant_id]
      );
    }


    await conn.query(
      "UPDATE cart_items SET quantity = ?, reservation_expires_at = DATE_ADD(NOW(), INTERVAL 15 MINUTE) WHERE id = ?",
      [new_quantity, cart_item_id]
    );

    await conn.commit();
    res.json({ message: "Cart item updated" });

  } catch (e) {
    await conn.rollback();
    res.status(400).json({ error: e.message });
  } finally {
    conn.release();
  }
};

exports.removeCartItem = async (req, res) => {
  const { cart_item_id } = req.params;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [items] = await conn.query(
      "SELECT variant_id, quantity FROM cart_items WHERE id = ? FOR UPDATE",
      [cart_item_id]
    );

    if (!items.length) throw new Error("Cart item not found");

    const item = items[0];

    await conn.query(
      "UPDATE inventory SET reserved_quantity = reserved_quantity - ? WHERE variant_id = ?",
      [item.quantity, item.variant_id]
    );

    await conn.query(
      "DELETE FROM cart_items WHERE id = ?",
      [cart_item_id]
    );

    await conn.commit();
    res.json({ message: "Cart item removed" });

  } catch (e) {
    await conn.rollback();
    res.status(400).json({ error: e.message });
  } finally {
    conn.release();
  }
};


