const pool = require("../config/db");

async function cleanupExpiredReservations() {
    const conn = await pool.getConnection();

    try{
        await pool.beginTransaction();

        const [expired] = await conn.query(
            "SELECT id, variant_id, quantity from cart_items WHERE reservation_expires_at < NOW()",
        );

        for(const item of expired){
            await conn.query(
                "UPDATE inventory SET reserved_quantity = reserved_quantity - ? WHERE variant_id = ?",
                [item.quantity, item.variant_id]
            );
        }

        await conn.query(
            "DELETE FROM cart_items WHERE reservation_expires_at < now()"
        );
        await conn.commit();

    }catch (e){
        await conn.rollback();
        throw e;
    }finally{
        conn.release;
    }
}
module.exports = cleanupExpiredReservations;

