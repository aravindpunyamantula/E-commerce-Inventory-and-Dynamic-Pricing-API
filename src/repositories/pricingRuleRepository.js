const { getPool } = require("../config/db");
const pool = getPool();


async function  getActivePricingRules(){
    const [rows] = await pool.query(
        `SELECT * FROM pricing_rules
     WHERE active = true
     AND (start_time IS NULL OR start_time <= NOW())
     AND (end_time IS NULL OR end_time >= NOW())`
    );

    return rows;
}

module.exports = {getActivePricingRules}