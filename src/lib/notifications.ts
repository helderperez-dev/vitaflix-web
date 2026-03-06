import { Resend } from "resend";
import twilio from "twilio";
import admin from "firebase-admin";

// Initialize Resend
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Initialize Twilio
const twilioClient = (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN)
    ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    : null;

// Initialize Firebase Admin
if (
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY &&
    admin.apps.length === 0
) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
            }),
        });
    } catch (error: any) {
        console.error("Firebase Admin initialization error:", error.message);
    }
}

export interface SendEmailParams {
    to: string | string[];
    subject: string;
    body: string;
    html?: string;
    attachments?: { filename: string; path: string }[];
}

export async function sendEmail({ to, subject, body, html, attachments }: SendEmailParams) {
    if (!resend) {
        console.warn("Resend is not configured. Skipping email.");
        return { success: false, error: "Resend not configured" };
    }

    try {
        const result = await resend.emails.send({
            from: process.env.EMAIL_FROM || "Vitaflix <notifications@vitaflix.com>",
            to: Array.isArray(to) ? to : [to],
            subject,
            text: body,
            html: html || body.replace(/\n/g, "<br>"),
            attachments,
        });

        if (result.error) throw result.error;
        return { success: true, id: result.data?.id };
    } catch (error: any) {
        console.error("Resend Error:", error);
        return { success: false, error: error.message };
    }
}

export interface SendSmsParams {
    to: string;
    body: string;
}

export async function sendSms({ to, body }: SendSmsParams) {
    if (!twilioClient) {
        console.warn("Twilio is not configured. Skipping SMS.");
        return { success: false, error: "Twilio not configured" };
    }

    try {
        const from = process.env.TWILIO_MESSAGING_SERVICE_SID || process.env.TWILIO_FROM_NUMBER;
        if (!from) throw new Error("Missing Twilio Send ID (Service SID or Phone Number)");

        const message = await twilioClient.messages.create({
            body,
            to,
            [process.env.TWILIO_MESSAGING_SERVICE_SID ? 'messagingServiceSid' : 'from']: from
        });

        return { success: true, id: message.sid };
    } catch (error: any) {
        console.error("Twilio Error:", error);
        return { success: false, error: error.message };
    }
}

export interface SendPushParams {
    token: string;
    title: string;
    body: string;
    data?: Record<string, string>;
}

export async function sendPush({ token, title, body, data }: SendPushParams) {
    if (admin.apps.length === 0) {
        console.warn("Firebase Admin is not configured. Skipping Push.");
        return { success: false, error: "Firebase not configured" };
    }

    try {
        const message = {
            notification: {
                title,
                body,
            },
            data,
            token,
        };

        const response = await admin.messaging().send(message);
        return { success: true, id: response };
    } catch (error: any) {
        console.error("Firebase FCM Error:", error);
        return { success: false, error: error.message };
    }
}
