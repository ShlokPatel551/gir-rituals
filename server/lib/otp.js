import nodemailer from 'nodemailer';
import twilio from 'twilio';

const EMAIL_ENABLED = !!(process.env.SMTP_USER && process.env.SMTP_PASS);
const SMS_ENABLED   = !!(process.env.TWILIO_SID && process.env.TWILIO_TOKEN && process.env.TWILIO_PHONE);
const WA_ENABLED    = !!(process.env.TWILIO_SID && process.env.TWILIO_TOKEN && process.env.TWILIO_WHATSAPP_FROM);

let _transporter = null;
function getMailer() {
  if (!_transporter) {
    _transporter = nodemailer.createTransport({
      host:   process.env.SMTP_HOST || 'smtp.gmail.com',
      port:   parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth:   { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return _transporter;
}

let _twilioClient = null;
function getTwilio() {
  if (!_twilioClient) _twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
  return _twilioClient;
}

async function sendEmail(to, code) {
  await getMailer().sendMail({
    from: `"Gir Rituals" <${process.env.SMTP_USER}>`,
    to,
    subject: `Your Gir Rituals OTP: ${code}`,
    text: `Your one-time password is ${code}. It expires in 5 minutes. Do not share it with anyone.`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="color:#4a7c59">Gir Rituals</h2>
        <p>Your one-time password is:</p>
        <div style="font-size:32px;font-weight:bold;letter-spacing:6px;color:#2d5a3d;padding:16px 0">${code}</div>
        <p style="color:#666;font-size:14px">Expires in 5 minutes. Never share this with anyone.</p>
      </div>`,
  });
}

async function sendSms(to, code) {
  await getTwilio().messages.create({
    body: `Your Gir Rituals OTP is ${code}. Valid for 5 minutes. Do not share.`,
    from: process.env.TWILIO_PHONE,
    to,
  });
}

async function sendWhatsApp(to, code) {
  await getTwilio().messages.create({
    body: `Your Gir Rituals OTP is *${code}*. Valid for 5 minutes. Do not share.`,
    from: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`,
    to:   `whatsapp:${to}`,
  });
}

/**
 * Send OTP to all configured channels. Fails gracefully per channel.
 * Returns { email, sms, whatsapp } booleans indicating what was attempted.
 */
export async function deliverOtp({ email, phone, code, log }) {
  const results = { email: false, sms: false, whatsapp: false };
  const errors  = [];

  const sends = [];

  if (EMAIL_ENABLED && email) {
    sends.push(
      sendEmail(email, code)
        .then(() => { results.email = true; })
        .catch(err => { errors.push(`email: ${err.message}`); })
    );
  }

  if (SMS_ENABLED && phone) {
    sends.push(
      sendSms(phone, code)
        .then(() => { results.sms = true; })
        .catch(err => { errors.push(`sms: ${err.message}`); })
    );
  }

  if (WA_ENABLED && phone) {
    sends.push(
      sendWhatsApp(phone, code)
        .then(() => { results.whatsapp = true; })
        .catch(err => { errors.push(`whatsapp: ${err.message}`); })
    );
  }

  await Promise.all(sends);

  if (log) {
    log.info({ results, errors: errors.length ? errors : undefined }, `OTP delivered to ${email || phone}`);
  }

  const anySent = results.email || results.sms || results.whatsapp;
  if (!anySent && (EMAIL_ENABLED || SMS_ENABLED || WA_ENABLED)) {
    throw new Error(`OTP delivery failed: ${errors.join('; ')}`);
  }

  return results;
}

export { EMAIL_ENABLED, SMS_ENABLED, WA_ENABLED };
