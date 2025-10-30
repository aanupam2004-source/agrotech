const express = require('express')
const app = express()
const port = 3000
require('dotenv').config()
var cors = require('cors')
const {router} = require('./routes/agriShop.routes')
const soilInfo = require('./routes/soil.routes')
const plantDisease = require('./routes/plantDisease.routes')
const multer = require("multer");

// file's upload
const upload = multer({ dest: "uploads/" });

// middleware's
app.use(cors())
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(express.static('public'))
// Allow larger JSON payload (e.g., 10 MB)



// middleware for route's
app.use('/',router)
app.use('/',soilInfo)

app.use('/', plantDisease);
app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`)
})