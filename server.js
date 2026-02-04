import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import connectDB from './config/db.js'
import dotenv from 'dotenv'
import AuthRouter from './routes/auth.router.js'
import JobRouter from './routes/job.routes.js'
import ApplicationRouter from './routes/application.router.js'
dotenv.config()
const app = express()
connectDB()
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}

))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// Routers
app.use("/auth", AuthRouter)
app.use("/job", JobRouter)
app.use("/applications", ApplicationRouter)

app.listen(process.env.PORT, () => {
    console.log("Running on port " + process.env.PORT)
})





