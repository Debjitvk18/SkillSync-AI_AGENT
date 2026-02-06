import { inngest } from "../inngest/client.js";
import Ticket from "../models/ticket.js";
import TicketSchema from "../models/ticket.js";

export const createTicket = async (req, res) => {

    try {
        const { title, description } = req.body;
        if (!title || !description) {
            return res.status(400).json({ message: "Title and description are required" })
        }
        const newTicket = await TicketSchema.create({
            title,
            description,
            createdBy: req.user._id.toString()
        });

        // Send Inngest event (non-blocking - don't fail ticket creation if Inngest is down)
        inngest.send({
            name: "ticket/create",
            data: {
                ticketId: newTicket._id.toString(),
                title,
                description,
                createdBy: req.user._id.toString()
            }
        }).catch(err => {
            console.log("Inngest event failed (non-critical):", err.message);
        });

        return res.status(201).json({ message: "Ticket created and sent to AI for processing successfully", ticket: newTicket })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const getTickets = async (req, res) => {
    try {
        const user = req.user;
        let tickets = [];
        if (user.role != "user") {

            TicketSchema.find({})
                .populate("assignedTo", ["name email"])
                .sort({ createdAt: -1 })
        } else {
            tickets = await TicketSchema.find({ createdBy: user._id })
                .select("title description status createdAt")
                .sort({ createdAt: -1 })
        }
        return res.status(200).json({ message: "Tickets fetched successfully", tickets })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const getTicket = async (req, res) => {
    try {
        const user = req.user;
        let ticket;
        if (user.role != "user") {
            ticket = await TicketSchema.findById(req.params.id)
                .populate("assignedTo", ["email", "_id"])
        }
        else {
            ticket = await TicketSchema.findOne({ _id: req.params.id, createdBy: user._id })
                .select("title description status createdAt")
        }
        if (!ticket) {
            return res.status(404).json({ message: "Ticket not found" })
        }
        return res.status(200).json({ message: "Ticket fetched successfully", ticket })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}