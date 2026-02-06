import bcrypt from "bcrypt";
import UserSchema from "../models/user.js";
import { inngest } from "../inngest/client.js";
import jwt from "jsonwebtoken";


export const signup = async (req, res) => {
    const { email, password, skills = [] } = req.body;

    try {
        const hashed = await bcrypt.hash(password, 10);
        const user = await UserSchema.create({
            email,
            password: hashed,
            skills
        });

        // Send Inngest event (non-blocking - don't fail signup if Inngest is down)
        inngest.send({
            name: "user/signup",
            data: {
                email: user.email,
                name: user.name
            }
        }).catch(err => {
            console.log("Inngest event failed (non-critical):", err.message);
        });

        const token = jwt.sign({ _id: user._id, role: user.role }, process.env.JWT_SECRET);
        res.json({ user, token })

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await UserSchema.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" })
        }
        const token = jwt.sign({ _id: user._id, role: user.role }, process.env.JWT_SECRET);
        res.json({ user, token })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const logout = async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Unauthorized" })

        }
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(401).json({ message: "Unauthorized" })
            }

        });

        res.json({ message: "Logout successful" })


    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const updateUser = async (req, res) => {
    const { skills = [], email, role } = req.body;
    try {
        if (req.user?.role !== "admin") {
            return res.status(403).json({ error: "Forbidden" });
        }
        const user = await UserSchema.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        await UserSchema.updateOne(
            { email },
            { skills: skills.length ? skills : user.skills, role },

        )
        return res.json({ message: "User updated successfully" })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const getUser = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ error: "Forbidden" });
        }
        const users = await UserSchema.find().select("-password");
        return res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}