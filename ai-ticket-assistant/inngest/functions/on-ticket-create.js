import { inngest } from "../client.js";
import { sendEmail } from "../../utils/mailer.js";
import UserSchema from "../../models/user.js";
import { NonRetriableError } from "inngest";
import TicketSchema from "../../models/ticket.js";
import analyzeTicket from "../../utils/ai.js";


export const onTicketCreate = inngest.createFunction(
    {
        id: "on-ticket-create",
        event: "ticket/create",
        retries: 2,
    },
    async ({ event, step }) => {
        try {
            const ticket = await step.run("fetch-ticket", async () => {
                const { ticketId } = event.data;
                const ticketObject = await TicketSchema.findById(ticketId)
                if (!ticketObject) {
                    throw new NonRetriableError("Ticket not found")
                }
                return ticketObject
            })
            await step.run("update-ticket-status", async () => {
                await TicketSchema.findByIdAndUpdate(ticket._id, { status: "TODO" })
            })
            const aiResponse = await analyzeTicket(ticket)
            const relatedSkills = await step.run("ai-processing", async () => {
                let skills = []
                if (aiResponse) {
                    await TicketSchema.findByIdAndUpdate(ticket._id, {
                        priority: ["low", "medium", "high"].includes(aiResponse.priority) ? "medium" : aiResponse.priority,
                        helpfullNotes: aiResponse.helpfullNotes,
                        status: "IN_PROGRESS",
                        skills: aiResponse.relatedSkills
                    })
                    skills = aiResponse.relatedSkills
                }
                return skills
            })
            const moderator = await step.run("assign-moderator", async () => {
                let user = await UserSchema.findOne({
                    role: "moderator",
                    skills: {
                        $elemMatch: {
                            $regex: relatedSkills.join("|"),
                            $options: "i"
                        }
                    }
                })
                if (!user) {
                    user = await UserSchema.findOne({
                        role: "admin"
                    })
                }
                await TicketSchema.findByIdAndUpdate(ticket._id, { assignedTo: user?._id || null })
                return user
            })
            await step.run("send-notification-email", async () => {
                if (moderator) {
                    const finalTicket = await TicketSchema.findById(ticket._id)
                    await sendEmail(moderator.email,
                        "Ticket Assigend",

                        `You have been assigned a new ticket ${finalTicket.title}. Please review it at your earliest 
                        convenience.`)
                }
            })
            return { sucess: true, message: "Ticket processed successfully" }
        } catch (error) {
            console.log("Error in onTicketCreate", error);
            return { sucess: false, message: "Failed to process ticket" }
        }

    }

)