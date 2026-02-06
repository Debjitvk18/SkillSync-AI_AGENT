import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema({
    title: String,
    description: String,
    status: { type: String, enum: ["TODO", "IN_PROGRESS", "DONE"], default: "TODO" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    priority:String, 
    deadline:Date,
    helpfullNotes:String,
    relatedSkill:[String],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model("Ticket", ticketSchema);