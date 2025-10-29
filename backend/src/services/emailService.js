import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import EmailHistory from "../models/EmailHistory.js";

dotenv.config();

let cachedTransport = null;
let usingTestAccount = false;

function resolveBaseUrl(fallbackPort) {
  const envUrl = process.env.BACKEND_URL;
  if (envUrl) return envUrl.replace(/\/$/, "");
  return `http://localhost:${fallbackPort || process.env.PORT || 5000}`;
}

async function getTransport() {
  if (cachedTransport) return cachedTransport;

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    cachedTransport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    usingTestAccount = false;
    return cachedTransport;
  }

  try {
    const testAccount = await nodemailer.createTestAccount();
    cachedTransport = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    usingTestAccount = true;
    console.warn(
      "No SMTP configured - using Ethereal test account. Preview URL will be logged after send."
    );
    return cachedTransport;
  } catch (err) {
    cachedTransport = {
      sendMail: async (opts) => {
        console.warn("SMTP not available - email would be sent with:", opts);
        return { messageId: `stub-${Date.now()}`, accepted: [opts.to] };
      },
    };
    usingTestAccount = false;
    return cachedTransport;
  }
}

export async function sendTemplatedEmail({
  to,
  subject,
  body,
  leadId,
  templateId,
  baseUrl,
  createdBy
}) {
  const effectiveBaseUrl = (baseUrl || resolveBaseUrl()).replace(/\/$/, "");
  const trackId = uuidv4();


  const pixel = `<img src="${effectiveBaseUrl}/api/email/track/open?hid=${trackId}" alt="logo" style="width:1px;height:1px;" />`;

  const rewriteHref = (html) => {
    if (!html) return html || "";
    return html.replace(
      /href=(["'])(https?:\/\/[^'"\s]+)\1/gi,
      (m, quote, url) => {
        const tracked = `${effectiveBaseUrl}/api/email/track/click?hid=${trackId}&url=${encodeURIComponent(
          url
        )}`;
        return `href=${quote}${tracked}${quote}`;
      }
    );
  };

  const bodyRewritten = rewriteHref(body);
  const bodyWithTrack = `${bodyRewritten}\n\n${pixel}`;

  const history = new EmailHistory({
    lead: leadId,
    template: templateId,
    to,
    subject,
    body: bodyWithTrack,
    status: "sent",
    trackId,
    createdBy
  });

  const transport = await getTransport();

  try {
    const info = await transport.sendMail({
      from:
        process.env.SMTP_USER ||
        (transport.options &&
          transport.options.auth &&
          transport.options.auth.user) ||
        "no-reply@example.com",
      to,
      subject,
      html: bodyWithTrack,
    });

    history.messageId = info.messageId || info.response || "";
    history.status = "sent";
    await history.save();

    if (usingTestAccount) {
      const preview = nodemailer.getTestMessageUrl(info);
      if (preview) {
        console.info("Ethereal preview URL:", preview);
        history.previewUrl = preview;
        await history.save();
      }
    }

    return history;
  } catch (err) {
    history.status = "failed";
    history.error = err.message;
    await history.save();
    throw err;
  }
}
