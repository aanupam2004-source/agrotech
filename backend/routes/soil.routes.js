const express = require("express")
const router = express.Router()
const {soilInfo} = require("../controllers/soil.controller")

router.post('/soilInfo',soilInfo)

module.exports= router