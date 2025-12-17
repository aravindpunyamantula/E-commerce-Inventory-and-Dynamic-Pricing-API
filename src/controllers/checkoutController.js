const { getPool } = require("../config/db");
const pool = getPool();


exports.checkout = async (req, res) => {
  const { cart_id } = req.body;

  if (!cart_id) {
    return res.status(400).json({ error: "cart_id required" });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

 
    const [items] = await conn.query(
      `SELECT id, variant_id, quantity
       FROM cart_items
       WHERE cart_id = ?
       FOR UPDATE`,
      [cart_id]
    );

    if (!items.length) {
      throw new Error("Cart is empty");
    }

    // 2. Process each item
    for (const item of items) {
      // Lock inventory row
      const [inventory] = await conn.query(
        `SELECT stock_quantity, reserved_quantity
         FROM inventory
         WHERE variant_id = ?
         FOR UPDATE`,
        [item.variant_id]
      );

      const inv = inventory[0];

      if (inv.reserved_quantity < item.quantity) {
        throw new Error("Inventory reservation mismatch");
      }

      // Deduct permanent stock
      await conn.query(
        `UPDATE inventory
         SET stock_quantity = stock_quantity - ?,
             reserved_quantity = reserved_quantity - ?
         WHERE variant_id = ?`,
        [item.quantity, item.quantity, item.variant_id]
      );
    }

    // 3. Clear cart
    await conn.query(
      "DELETE FROM cart_items WHERE cart_id = ?",
      [cart_id]
    );

    await conn.commit();

    res.json({
      message: "Checkout successful",
      cart_id
    });

  } catch (e) {
    await conn.rollback();
    res.status(400).json({ error: e.message });
  } finally {
    conn.release();
  }
};
