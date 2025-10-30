const express = require("express");
const router = express.Router();
const multer = require("multer");
const { plantDisease } = require("../controllers/plantDisease.controller");

// Multer upload config
const upload = multer({ dest: "uploads/" });

// POST /plant-disease
// Multer handles single file upload with key "plantImage"
router.post("/plantDisease", upload.single("plantImage"), plantDisease);

module.exports = router;