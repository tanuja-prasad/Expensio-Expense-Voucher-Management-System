const express = require("express");

const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
  "/employee",
  authenticate,
  authorize("EMPLOYEE"),
  (req, res) => {
    res.json({
      success: true,
      message: "Welcome to Employee Dashboard",
      user: req.user
    });
  }
);

router.get(
  "/director",
  authenticate,
  authorize("DIRECTOR"),
  (req, res) => {
    res.json({
      success: true,
      message: "Welcome to Director Dashboard",
      user: req.user
    });
  }
);

router.get(
  "/accounts",
  authenticate,
  authorize("ACCOUNTS"),
  (req, res) => {
    res.json({
      success: true,
      message: "Welcome to Accounts Dashboard",
      user: req.user
    });
  }
);

router.get(
  "/management",
  authenticate,
  authorize("DIRECTOR", "ACCOUNTS"),
  (req, res) => {
    res.json({
      success: true,
      message: "Management access granted"
    });
  }
);

module.exports = router;