import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { serve } from "inngest/express";
import mongoose from 'mongoose';
import userRoutes from "./routes/user.js";
import ticketRoutes from "./routes/ticket.js";
import { inngest } from "./inngest/client.js";
import { onUserSignup } from "./inngest/functions/on-signup.js";
import { onTicketCreate } from "./inngest/functions/on-ticket-create.js";
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/tickets", ticketRoutes);

app.use("/api/inngest", serve({
    client: inngest,
    functions: [onUserSignup, onTicketCreate]
}))

const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected")
    )
    .catch((err) => console.log(err));



app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});