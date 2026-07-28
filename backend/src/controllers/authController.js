const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const register = async (req, res) => {
    try {
        const { firstName, lastName, email, password, confirmPassword} = req.body;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!firstName || !lastName || !email || !password || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            })
        }
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match"
            });
        }
        if (firstName.trim().length < 3) {
            return res.status(400).json({
                success: false,
                message: "First name must be at least 3 characters"
            });
        }
        if (lastName.trim().length < 3) {
            return res.status(400).json({
                success: false,
                message: "Last name must be at least 3 characters"
            });
        }
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format"
            });
        }
        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters"
            });
        }
        const name = `${firstName} ${lastName}`;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email already exists"
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            name,
            email,
            password: hashedPassword
        })
        await user.save();
        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        })
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            })
        }
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format"
            });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            })
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            })
        }
        const token = jwt.sign({
            id: user._id,
            email: user.email
        },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN
            })
        return res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            data: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        })
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}
const logout = (req, res) => {
    return res.status(200).json({
        success: true,
        message: "Logged out successfully"
    });
}
module.exports = { register, login, logout };