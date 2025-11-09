const mysql = require("mysql2/promise");
require("dotenv").config();

async function checkTables() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);

  try {
    const [rows] = await connection.query("SHOW TABLES");
    console.log("All tables in database:");
    rows.forEach((row) => console.log("-", Object.values(row)[0]));
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await connection.end();
  }
}

checkTables();
