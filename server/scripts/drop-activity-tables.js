const mysql = require("mysql2/promise");
require("dotenv").config();

async function dropTables() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);

  try {
    await connection.query("DROP TABLE IF EXISTS oil_zapper_indents");
    console.log("✓ Dropped oil_zapper_indents");

    await connection.query("DROP TABLE IF EXISTS oil_zapper_activities");
    console.log("✓ Dropped oil_zapper_activities");

    await connection.query("DROP TABLE IF EXISTS tph_activities");
    console.log("✓ Dropped tph_activities");

    await connection.query("DROP TABLE IF EXISTS zero_day_activities");
    console.log("✓ Dropped zero_day_activities");

    await connection.query("DROP TABLE IF EXISTS zero_day_samples");
    console.log("✓ Dropped zero_day_samples");

    console.log("\nAll activity tables dropped successfully!");
  } catch (error) {
    console.error("Error dropping tables:", error);
  } finally {
    await connection.end();
  }
}

dropTables();
