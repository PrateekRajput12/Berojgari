const jwt = require('jsonwebtoken')
const User = require("../models/User")

const auth = (roles = []) = async (req, res, next) => {
    try {
        const token = req.cookies.token
        if (!token) {
            return res.status(401).json({ message: "Not Authorized, Login Again" })
        }
        const decoded = jwt.verify(token, process.env.SECRET_KEY)

        req.user = await User.findOne(decoded.id).select("-password")
        if (!req.user) {
            return res.status(401).json({ message: "User not found" });
        }
        if (roles.length && !roles.includes(req.user.role)) {
            return res.status(403).json({ message: "Forbidden: Role not allowed" });
        }
        next()
    } catch (error) {
        console.log("Error in Authorizing" + error.message)
        res.status(400).json({ message: "Error in  Authorizing" })
    }
}