const express = require("express");
const cors = require("cors");
const db = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const testRoutes = require("./routes/testRoutes");
const voucherRoutes = require("./routes/voucherRoutes");
const approvalRoutes = require("./routes/approvalRoutes");
const profileRoutes = require("./routes/profileRoutes");
const accountsRoutes = require("./routes/accountsRoutes");


const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173"
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/vouchers", voucherRoutes);
app.use("/api/review", approvalRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/accounts", accountsRoutes);


app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Expense Voucher API is running"
  });
});

app.get("/api/health/database", async (req, res) => {
  try {
    await db.query("SELECT 1");

    res.json({
      success: true,
      message: "MySQL connected successfully"
    });
  } catch (error) {
    console.error("Database error:", error);

    res.status(503).json({
      success: false,
      message: "Database connection failed"
    });
  }
});

app.use("/api/auth", authRoutes);

// Temporary testing routes
app.use("/api/test", testRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found"
  });
});

module.exports = app;