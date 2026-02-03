import jwt from "jsonwebtoken";
import User from "../models/User.js";

const isAuthenticated = async (req, res, next) => {
    // console.log("here")
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Not authenticated"
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // console.log(decoded)
        const user = await User.findById(decoded.id).select("-password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found"
            });
        }

        req.user = user; // 🔥 VERY IMPORTANT

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid token"
        });
    }
};

export default isAuthenticated;
