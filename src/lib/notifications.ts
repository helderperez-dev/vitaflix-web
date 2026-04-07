import { Resend } from "resend";
import twilio from "twilio";
import admin from "firebase-admin";
import { createPrivateKey } from "node:crypto";

// Initialize Resend
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Initialize Twilio
const twilioClient = (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN)
    ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    : null;

let firebaseAdminInitError: string | null = null;

// Initialize Firebase Admin
function getFirebaseAdmin() {
    if (admin.apps.length > 0) return admin;

    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (projectId && clientEmail && privateKey) {
        try {
            firebaseAdminInitError = null;

            // Robust private key formatting
            const formattedKey = privateKey
                .trim()
                .replace(/^['"]|['"]$/g, '') // Remove surrounding quotes
                .replace(/\\r\\n/g, "\n")
                .replace(/\\n/g, "\n")
                .replace(/\r\n/g, "\n");

            createPrivateKey({ key: formattedKey, format: "pem" });

            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId,
                    clientEmail,
                    privateKey: formattedKey,
                }),
            });
            console.log("Firebase Admin initialized successfully");
            return admin;
        } catch (error: any) {
            firebaseAdminInitError = "Invalid FIREBASE_PRIVATE_KEY. Replace it with the exact private_key from your Firebase service account JSON and restart the dev server.";
            console.error("Firebase Admin initialization error:", error.message);
        }
    } else {
        const missing = [];
        if (!projectId) missing.push("FIREBASE_PROJECT_ID");
        if (!clientEmail) missing.push("FIREBASE_CLIENT_EMAIL");
        if (!privateKey) missing.push("FIREBASE_PRIVATE_KEY");
        firebaseAdminInitError = `Missing Firebase Admin configuration: ${missing.join(", ")}`;
        console.warn(`Firebase Admin missing configuration: ${missing.join(", ")}`);
    }

    return null;
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
    const firebaseAdmin = getFirebaseAdmin();
    if (!firebaseAdmin) {
        const errorMessage = firebaseAdminInitError || "Firebase not configured";
        console.warn(`Push skipped: ${errorMessage}`);
        return { success: false, error: errorMessage };
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

        const response = await firebaseAdmin.messaging().send(message);
        return { success: true, id: response };
    } catch (error: any) {
        console.error("Firebase FCM Error:", error);
        return { success: false, error: error.message };
    }
}
