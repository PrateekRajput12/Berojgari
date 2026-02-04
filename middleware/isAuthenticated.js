import bcrypt from "bcryptjs";
import jwt, { decode } from 'jsonwebtoken'
import User from "../models/user.model.js";

const isAuthenticated = async (req, res, next) => {
    try {
        const token = req.cookies.token

        if (!token) {
            return res.status(400).json({ message: "token not found" })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        console.log(decoded)
        if (!decoded) {
            return res.status(400).json({ message: "Problem in comparing jwt" })
        }

        const user = await User.findById(decoded.id).select("-password")
        if (!user) {
            return res.status(400).json({ message: "Problem in finding user in isAuthenticated because of decoeded.-id" })
        }

        req.user = user
        next()
    } catch (error) {
        console.log(error.message || "Problem in authenticating")
        return res.status(400).json({ message: "Failed in authentication", })
    }
}



export default isAuthenticated