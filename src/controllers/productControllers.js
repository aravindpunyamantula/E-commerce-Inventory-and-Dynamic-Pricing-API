const { getPool } = require("../config/db");
const pool = getPool();


const createProduct = async (req, res)=>{
   try{
     const {name, description, base_price, category_id} = req.body;

    if(!name || !base_price || !category_id)return res.status(400).json({error: "Missing fields"});

    const [result] = await pool.query(
        "INSERT INTO products(name, description, base_price, category_id) VALUES(?, ?, ?, ?)",
        [name, description, base_price, category_id]
    );
    res.status(201).json(result.insertId);
   }catch (e){
    res.status(500).json({error: e.message});
   }
}

const getProducts = async (req, res)=>{
    try{
      const  [rows] = await pool.query(
        "SELECT * FROM products WHERE id = ?",
        [req.params.id]
      );
      if(!rows.length)return res.status(404).json({error: "Not found"});
      res.json(rows[0]);
    }catch(e){
        res.status(500).json({error: e.message});
    }

}

module.exports = {createProduct, getProducts}