const { getPool } = require("../config/db");
const pool = getPool();


const createVariant = async (req, res)=>{
    const {product_id, sku, attributes, price_adjustment} = req.body;

    if(!product_id || !sku || !attributes){
       return res.status(400).json({
            error: "Missing fields"
        })
    }
    const conn = await pool.getConnection();
    try{
        await conn.beginTransaction();

        const [result] = await conn.query(
            `INSERT INTO variants (product_id, sku, attributes, price_adjustment)
       VALUES (?, ?, ?, ?)`,
       [product_id, sku, JSON.stringify(attributes), price_adjustment ||0]
        );

        await conn.query(
      "INSERT INTO inventory (variant_id, stock_quantity) VALUES (?, ?)",
      [result.insertId, 0]
    );

    await conn.commit();
    res.status(201).json({id: result.insertId});
    }catch(e){
        await conn.rollback();
        res.status(500).json({error: e.message});

    }finally{
        conn.release();
    }

  
}



const getVariantsByProduct = async (req, res) => {
  const { productId } = req.params;
  const pool = getPool();

  try {
    const [rows] = await pool.query(
      `
      SELECT 
        v.id,
        v.sku,
        v.attributes,
        v.price_adjustment,
        i.stock_quantity,
        i.reserved_quantity,
        (i.stock_quantity - i.reserved_quantity) AS available_quantity
      FROM variants v
      JOIN inventory i ON i.variant_id = v.id
      WHERE v.product_id = ?
      `,
      [productId]
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


module.exports = {createVariant, getVariantsByProduct};