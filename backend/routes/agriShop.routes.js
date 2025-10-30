const express = require("express")
const router = express.Router()
const {agriShop} = require('../controllers/agriShop.controller')

router.post('/agriShop',agriShop)

module.exports ={
    router
}