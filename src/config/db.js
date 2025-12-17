const mysql = require("mysql2/promise");
require("dotenv").config();

let pool;

async function initDB() {
  let retries = 5;
  while (retries) {
    try {
      pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT,
        waitForConnections: true,
        connectionLimit: 10
      });

      await pool.query("SELECT 1");
      console.log(" MySQL connected");
      break;
    } catch (err) {
      retries--;
      console.log("Waiting for MySQL...");
      await new Promise(res => setTimeout(res, 5000));
    }
  }
}

initDB();

module.exports = {
  getPool: () => pool
};
