import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import applicationRoute from './routes/applicationRoute.js'
dotenv.config();
connectDB();

const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/job", jobRoutes);
app.use("/api/application", applicationRoute);
// app.get("/api/health", (req, res) => {
//     res.json({ status: "Server running with cookies 🍪" });
// });

app.listen(process.env.PORT, () => {
    console.log("Server running on port " + process.env.PORT);
});
