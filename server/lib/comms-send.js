import nodemailer from 'nodemailer';
import twilio    from 'twilio';

// ── MSG91 WhatsApp ────────────────────────────────────────────────
const MSG91_ENABLED = !!(process.env.MSG91_AUTH_KEY && process.env.MSG91_WHATSAPP_NUMBER);

async function sendWhatsAppMsg91(to, body) {
  const phone = to.replace(/\D/g, '');
  const r = await fetch('https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', authkey: process.env.MSG91_AUTH_KEY },
    body: JSON.stringify({
      integrated_number: process.env.MSG91_WHATSAPP_NUMBER,
      content_type: 'text',
      payload: {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: phone,
        type: 'text',
        text: { body },
      },
    }),
  });
  if (!r.ok) throw new Error(`MSG91 WhatsApp error ${r.status}: ${await r.text()}`);
}

// ── Twilio WhatsApp (fallback) ────────────────────────────────────
const TWILIO_WA_ENABLED = !!(
  process.env.TWILIO_SID && process.env.TWILIO_TOKEN && process.env.TWILIO_WHATSAPP_FROM
);

let _twilio = null;
function getTwilio() {
  if (!_twilio) _twilio = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
  return _twilio;
}

async function sendWhatsAppTwilio(to, body) {
  await getTwilio().messages.create({
    body,
    from: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`,
    to:   `whatsapp:${to}`,
  });
}

// ── Nodemailer Email ──────────────────────────────────────────────
const EMAIL_ENABLED = !!(process.env.SMTP_USER && process.env.SMTP_PASS);

let _mailer = null;
function getMailer() {
  if (!_mailer) {
    _mailer = nodemailer.createTransport({
      host:   process.env.SMTP_HOST   || 'smtp.gmail.com',
      port:   parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth:   { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return _mailer;
}

// ── Twilio SMS ────────────────────────────────────────────────────
const SMS_ENABLED = !!(
  process.env.TWILIO_SID && process.env.TWILIO_TOKEN && process.env.TWILIO_PHONE
);

// ── Unified send ──────────────────────────────────────────────────
export async function sendCommsMessage({ channel, to, body, subject }) {
  switch (channel) {

    case 'whatsapp':
      if (MSG91_ENABLED)     return sendWhatsAppMsg91(to, body);
      if (TWILIO_WA_ENABLED) return sendWhatsAppTwilio(to, body);
      throw new Error('No WhatsApp provider configured (set MSG91_AUTH_KEY or TWILIO_SID)');

    case 'sms':
      if (!SMS_ENABLED) throw new Error('No SMS provider configured (set TWILIO_SID/TOKEN/PHONE)');
      await getTwilio().messages.create({
        body, from: process.env.TWILIO_PHONE, to,
      });
      return;

    case 'email':
      if (!EMAIL_ENABLED) throw new Error('No email provider configured (set SMTP_USER/PASS)');
      await getMailer().sendMail({
        from:    `"Gir Rituals" <${process.env.SMTP_USER}>`,
        to,
        subject: subject || 'Message from Gir Rituals',
        text:    body,
        html:    `
          <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px">
            <h3 style="color:#7B5233;margin:0 0 16px">Gir Rituals</h3>
            <p style="line-height:1.7;color:#333">${body.replace(/\n/g, '<br>')}</p>
            <p style="color:#999;font-size:12px;margin-top:32px;border-top:1px solid #eee;padding-top:12px">
              Reply directly to this email to continue your conversation with our team.
            </p>
          </div>`,
        replyTo: process.env.SMTP_USER,
      });
      return;

    default:
      throw new Error(`Unknown channel: ${channel}`);
  }
}

export async function sendBroadcast({ channel, body, recipients }) {
  const errors = [];
  await Promise.allSettled(
    recipients.map(r =>
      sendCommsMessage({ channel, to: r.to, body, subject: r.subject })
        .catch(err => errors.push({ to: r.to, error: err.message }))
    )
  );
  return { sent: recipients.length - errors.length, errors };
}

export const CHANNELS_STATUS = {
  whatsapp: MSG91_ENABLED ? 'msg91' : TWILIO_WA_ENABLED ? 'twilio' : 'disabled',
  sms:      SMS_ENABLED   ? 'twilio' : 'disabled',
  email:    EMAIL_ENABLED ? 'smtp'   : 'disabled',
};
