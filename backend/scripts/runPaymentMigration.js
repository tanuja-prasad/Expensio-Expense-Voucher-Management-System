const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
require("dotenv").config();

async function runMigration() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || "expensio",
    multipleStatements: true,
  });

  try {
    const sqlPath = path.join(
      __dirname,
      "../database/accounts_payment_migration.sql"
    );

    const sql = fs.readFileSync(sqlPath, "utf8");

    await connection.query(sql);

    console.log("Payment migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error.message);
    process.exitCode = 1;
  } finally {
    await connection.end();
  }
}

runMigration();