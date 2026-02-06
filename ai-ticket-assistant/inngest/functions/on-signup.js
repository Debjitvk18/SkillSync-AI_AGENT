import { inngest } from "../client.js";
import { sendEmail } from "../../utils/mailer.js";
import UserSchema from "../../models/user.js";
import { NonRetriableError } from "inngest";
export const onUserSignup = inngest.createFunction(
    {
        id: "on-user-signup",
        name: "On User Signup",
        retries: 2,
    },
    {
        event: "user/signup",
    },
    async ({ event, step }) => {
        try {
            const { email } = event.data;
            const user = await step.run("get-user-email", async () => {
                const userObject = await UserSchema.findOne({ email });
                if (!userObject) {
                    throw new NonRetriableError("User not found")
                }
                return userObject;
            })
            await step.run("send-welcome-email", async () => {
                const subject = `Welcome to our platform ${user.name}`;
                const message = `Thank you for joining our platform. We are excited to have you with us.`
                await sendEmail(user.email, subject, message);
            })
            return { success: true, message: "Welcome email sent successfully" }
        } catch (error) {
            console.log("Error in onUserSignup", error);
            return { success: false, message: "Failed to send welcome email" }
        }
    }
);