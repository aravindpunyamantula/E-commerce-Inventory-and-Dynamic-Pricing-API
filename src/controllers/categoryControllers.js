const { getPool } = require("../config/db");
const pool = getPool();


const createCategory = async (req, res)=>{
    const {name, parent_id} = req.body;

   try{
     if(!name)return res.status(400).json({error: "Name required"});

    const [result] = await pool.query(
        "INSERT INTO categories(name, parent_id) VALUES(?, ?)",
        [name, parent_id || null]
    );
    res.status(201).json({id: result.insertId});

   }catch(e){
    res.status(500).json({error: "Server error "+e});
   }
}

const getCategories = async (req, res)=>{
    const [rows] = await pool.query("SELECT * FROM categories");
    res.json(rows);
}

module.exports = {createCategory, getCategories}