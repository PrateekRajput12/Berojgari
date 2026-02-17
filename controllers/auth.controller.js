import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const cookieOptions = (req) => {
    const isProd = process.env.NODE_ENV === "production";

    return {
        httpOnly: true,
        secure: isProd,              // ✅ true only in production (https)
        sameSite: isProd ? "none" : "lax", // ✅ none for cross-site in prod, lax for local
        // domain: optional (only if you use same root domain in prod)
        // maxAge: 24 * 60 * 60 * 1000, // optional
    };
};

export const signup = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({ message: "Please send full details" });
        }

        const checkUser = await User.findOne({ email: email.toLowerCase() });
        if (checkUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            role,
        });

        // ✅ don’t return password
        const safeUser = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        };

        return res.status(201).json({ message: "Signed up successfully", user: safeUser });
    } catch (error) {
        console.log("Signup error:", error.message);
        return res.status(500).json({ message: "Problem in signing up" });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Please enter full details" });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.cookie("token", token, cookieOptions(req));

        const safeUser = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        };

        return res.status(200).json({ message: "Logged in successfully", user: safeUser });
    } catch (error) {
        console.log("Login error:", error.message);
        return res.status(500).json({ message: "Login failed" });
    }
};

export const logout = async (req, res) => {
    try {
        res.clearCookie("token", cookieOptions(req)); // ✅ must match login cookie options
        return res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.log("Logout error:", error.message);
        return res.status(500).json({ message: "Logout failed" });
    }
};

export const getMe = async (req, res) => {
    try {
        return res.status(200).json({ user: req.user });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
