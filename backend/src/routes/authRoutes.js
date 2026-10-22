const express = require("express");
const { login } = require("../controllers/authController");
const authenticate = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/login", login);

router.get("/me", authenticate, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

module.exports = router;