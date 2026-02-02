const express = require('express')
const cors = require('cors')
const dotEnv = require("dotenv")
const db = require('./config/db')
const cookieparser = require("cookie-parser")
// routes
const router = require("./routes/auth")
dotEnv.config()
const app = express()
app.use(cors())
app.use(cookieparser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))



app.use("/auth", router)
db()
app.listen(process.env.PORT, () => {
    console.log("Running on port " + process.env.PORT);
})