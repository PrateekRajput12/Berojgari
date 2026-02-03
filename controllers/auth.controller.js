import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/user.model.js'



export const signup = async (req, res) => {
    try {
        const { name, email, password, role } = req.body

        if (!name || !email || !password || !role) {
            return res.status(400).json({ message: "Please send full details" })
        }
        const checkUser = await User.findOne({ email })

        if (checkUser) {
            return res.status(400).json({ message: "User already exist" })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        if (!hashedPassword) {
            return res.status(400).json({ message: "Problem in creating hash Password" })
        }
        const user = await User.create({ email, password: hashedPassword, role, name })
        res.status(200).json({ message: "Signed up Successfully", user })
    } catch (error) {
        console.log(error.message || "Error in signing up")
        res.status(400).json({ message: "Problem in signing Up" })
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ message: "Please enter full details" })
        }

        const checkUser = await User.findOne({ email })
        if (!checkUser) {
            return res.status(400).json({ message: "User not found" })
        }

        const hashedPassword = await bcrypt.compare(password, checkUser.password)
        if (!hashedPassword) {
            return res.status(400).json({ message: "Problem in comparing Password" })
        }

        const token = jwt.sign({ id: checkUser._id, role: checkUser.role }, process.env.JWT_SECRET, { expiresIn: "1d" })
        if (!token) {
            return res.status(400).json({ message: "Problem in creating token with jwt" })
        }

        res.cookie("token", token, {
            httpOnly: true,
            secure: false, // true in production (https)
            sameSite: "lax",
        })


        res.status(200).json({ message: "Logged In Successfully", checkUser })
    } catch (error) {
        console.log(error.message || "Error in signing up")
        res.status(400).json({ message: "Problem in signing Up" })
    }
}

export const logout = async (req, res) => {
    try {
        res.cookie("token", "", {
            httpOnly: true,
            expires: new Date(0),
        })
    } catch (error) {
        console.log(error.message || "Error in signing up")
        res.status(400).json({ message: "Problem in signing Up" })
    }
}