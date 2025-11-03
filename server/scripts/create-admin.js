/**
 * Script to create the first admin user
 * Run with: node create-admin.js
 */

const bcrypt = require("bcrypt");
const mysql = require("mysql2/promise");
require("dotenv").config();

async function createAdminUser() {
  console.log("🔐 Creating Admin User...\n");

  // Get user input or use defaults
  const name = process.env.ADMIN_NAME || "Admin User";
  const email = process.env.ADMIN_EMAIL || "admin@example.com";
  const password = process.env.ADMIN_PASSWORD || "Admin123!";

  try {
    // Hash the password
    console.log("⏳ Hashing password...");
    const password_hash = await bcrypt.hash(password, 10);

    // Connect to database
    console.log("⏳ Connecting to database...");
    const connection = await mysql.createConnection(process.env.DATABASE_URL);

    // Check if user already exists
    const [existingUsers] = await connection.execute(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existingUsers.length > 0) {
      console.log("❌ User with this email already exists!");
      await connection.end();
      return;
    }

    // Insert admin user
    console.log("⏳ Creating admin user...");
    const [result] = await connection.execute(
      `INSERT INTO users (name, email, password_hash, role, status, created_at, updated_at)
       VALUES (?, ?, ?, 'admin', 'active', NOW(), NOW())`,
      [name, email, password_hash]
    );

    await connection.end();

    console.log("\n✅ Admin user created successfully!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📧 Email:", email);
    console.log("🔑 Password:", password);
    console.log("👤 Role: admin");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    console.log("⚠️  IMPORTANT: Change this password after first login!\n");
  } catch (error) {
    console.error("❌ Error creating admin user:", error.message);
    process.exit(1);
  }
}

// Run the script
createAdminUser();
