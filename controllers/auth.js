const User = require('../models/User')
const jwt = require('jsonwebtoken')
const register = async (req, res) => {
    try {
        const { email, name, password, role } = req.body

        if (!email || !password || !role || !name) {
            console.log("Something is missing")
            res.status(400).json({ message: "Enter full details" })
        }
        const userExist = await User.findOne({ email })

        if (userExist) {
            res.status(400).json({ message: "User Already Exist" })
        }
        const user = await User.create({ email, name, password, role })

        res.status(200).json({ message: "Signed Up Successfully", user })
    } catch (error) {
        console.log('Error in registering', error.message)
        res.status(400).json({ message: "Problem in registering" })
    }
}

const login = async (req, res) => {
    try {
        const { password, email } = req.body
        if (!email || !password) {
            console.log("Something is missing")
            res.status(400).json({ message: "Enter full details" })
        }

        const user = await User.findOne({ email })
        if (!user) {
            console.log("User not exist")
            return res.status(400).json({ message: "User not exist please signup" })
        }
        console.log("here1");
        const isMatch = await user.matchPassword(password)
        console.log("here2");
        if (!isMatch) {
            return res.status(400).json({ message: "Password doesnot match " })
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.SECRET_KEY, {
            expiresIn: '7d'
        })
        res
            .cookie("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000
            })
            .status(200)
            .json({
                message: "Login successful",
                user
            });
    } catch (error) {
        console.log("Error in logging " + error.message)
        res.status(400).json({ message: "Error in logginin" })
    }
}


const logout = async (req, res) => {
    try {
        res
            .cookie("token", "", {
                httpOnly: true,
                expires: new Date(0)
            })
            .status(200)
            .json({ message: "Logout successful" });
    } catch (error) {
        console.log("Error in logging Out" + error.message)
        res.status(400).json({ message: "Error in logginig Out" })
    }
}
module.exports = { register, login, logout }