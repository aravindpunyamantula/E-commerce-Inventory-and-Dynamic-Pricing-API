const { getPool } = require("../config/db");
const pool = getPool();


async function getOrCreateCart(userId = null){
    const [rows] = await pool.query(
        "SELECT * FROM carts WHERE user_id = ? LIMIT 1",
        [userId]
    );

    if(rows.length) return rows[0].id;

    const [result] = await pool.query(
        "INSERT INTO carts (user_id) VALUES(?)",
        [userId]
    );
    return result.insertId;
}

module.exports = {getOrCreateCart};