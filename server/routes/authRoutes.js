const express = require("express");
const router = express.Router();
const controller = require("../controllers/authController");

/* =========================
   SAFE BASE ROUTE
========================= */
router.get("/", (req, res) => {
  res.status(200).json({
    message: "Auth API is working",
    endpoints: {
      register: "POST /api/auth/register",
      login: "POST /api/auth/login",
    },
  });
});

/* =========================
   BLOCK UNKNOWN GET REQUESTS
========================= */
router.use((req, res, next) => {
  if (req.method === "GET" && req.path !== "/") {
    return res.status(403).json({
      message: "Forbidden",
    });
  }
  next();
});

/* =========================
   AUTH ROUTES
========================= */
router.post("/register", controller.register);
router.post("/login", controller.login);

/* =========================
   FALLBACK (EXTRA SAFETY)
========================= */
router.use((req, res) => {
  res.status(404).json({
    message: "Auth route not found",
  });
});

module.exports = router;
