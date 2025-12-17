const { getPool } = require("../config/db");
const pool = getPool();


async function reserveStock(variantId, quantity){
    const conn = await pool.getConnection();
    try{
        await conn.beginTransaction();

        const [rows] = await conn.query(
            "SELECT stock_quantity, reserved_quantity FROM inventory WHERE variant_id = ? FOR UPDATE",
            [variantId]
        );

        if(!rows.length)throw new Error("Inventory not found");
        const available = rows[0].stock_quantity - rows[0].reserved_quantity;
        if(available < quantity){
            throw new Error("Insufficient stock");
        }

        await conn.query(
            "UPDATE inventory SET reserved_quantity = reserved_quantity + ? WHERE variant_id = ?",
            [quantity, variantId]
        );

        await conn.commit();

    }catch(e){
        await conn.rollback();
        throw e;

    }finally{
        conn.release;
    }
}

module.exports = { reserveStock};