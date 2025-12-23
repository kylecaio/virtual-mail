import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.FROM_EMAIL || 'mail@bigoakland.com';
const COMPANY_NAME = 'BIG Oakland Virtual Mail';

export async function sendNewMailNotification(to: string, customerName: string, sender: string, mailType: string) {
    return resend.emails.send({
          from: FROM_EMAIL,
          to,
          subject: `New ${mailType} Received - ${COMPANY_NAME}`,
          html: `<h2>Hello ${customerName},</h2><p>You have received new mail at your ${COMPANY_NAME} address.</p><p><strong>From:</strong> ${sender}</p><p><strong>Type:</strong> ${mailType}</p><p>Log in to your account to view and manage this mail item.</p><p><a href="${process.env.NEXTAUTH_URL}/mail">View Your Mail</a></p><p>Best regards,<br/>${COMPANY_NAME} Team</p>`,
    });
}

export async function sendRequestCompletedNotification(to: string, customerName: string, requestType: string, details?: string) {
    const typeLabels: Record<string, string> = { SCAN: 'Scan', SHRED: 'Shred', FORWARD: 'Forward', PICKUP: 'Pickup' };
    return resend.emails.send({
          from: FROM_EMAIL,
          to,
          subject: `${typeLabels[requestType] || requestType} Request Completed - ${COMPANY_NAME}`,
          html: `<h2>Hello ${customerName},</h2><p>Your ${typeLabels[requestType]?.toLowerCase() || requestType} request has been completed.</p>${details ? `<p><strong>Details:</strong> ${details}</p>` : ''}<p><a href="${process.env.NEXTAUTH_URL}/requests">View Your Requests</a></p><p>Best regards,<br/>${COMPANY_NAME} Team</p>`,
    });
}

export async function sendPaymentReceiptNotification(to: string, customerName: string, amount: number, description: string) {
    return resend.emails.send({
          from: FROM_EMAIL,
          to,
          subject: `Payment Receipt - ${COMPANY_NAME}`,
          html: `<h2>Hello ${customerName},</h2><p>Thank you for your payment.</p><p><strong>Amount:</strong> $${amount.toFixed(2)}</p><p><strong>Description:</strong> ${description}</p><p><a href="${process.env.NEXTAUTH_URL}/billing">View Billing History</a></p><p>Best regards,<br/>${COMPANY_NAME} Team</p>`,
    });
}

export async function sendWelcomeEmail(to: string, customerName: string) {
    return resend.emails.send({
          from: FROM_EMAIL,
          to,
          subject: `Welcome to ${COMPANY_NAME}!`,
          html: `<h2>Welcome ${customerName}!</h2><p>Thank you for choosing ${COMPANY_NAME} for your virtual mailbox needs.</p><p>Your account is now active and you can start receiving mail at your new address.</p><p><a href="${process.env.NEXTAUTH_URL}/dashboard">Go to Your Dashboard</a></p><p>Best regards,<br/>${COMPANY_NAME} Team</p>`,
    });
}
