import mongoose from "mongoose";

const userSchema = new mongoose.Schema({ 
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "user","moderator"], default: "user" },
    skills: { type: [String], default: [] },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("User", userSchema);