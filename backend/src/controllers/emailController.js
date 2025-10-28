import EmailTemplate from "../models/EmailTemplate.js";
import EmailHistory from "../models/EmailHistory.js";
import Lead from "../models/Lead.js";
import { sendTemplatedEmail } from "../services/emailService.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const parseSubjectFromBody = (raw) => {
  if (!raw || typeof raw !== "string") return { subject: null, body: raw };


  const textVersion = raw
    .replace(/<br\s*\/?>(?=\s*\n?)/gi, "\n")
    .replace(/<\/?p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .trim();

  const m = textVersion.match(/^[ \t]*Subject:\s*(.+)$/im);
  if (!m) return { subject: null, body: raw };

  const subject = m[1].trim();

  let cleaned = raw.replace(/<[^>]*>[^<]*Subject:[\s\S]*?<\/(?:[^>]+)>/i, "");

  if (cleaned === raw) {
    cleaned = raw.replace(/^[\s\n]*Subject:[^\n]*\n?/i, "");
    cleaned = cleaned.replace(/<[^>]*>\s*Subject:[^<]*<\/?[^>]*>/i, "");
  }

  return { subject, body: cleaned.trim() };
};

const fetchLeadsForCampaign = async ({ leadIds, filters = {} }) => {
  if (Array.isArray(leadIds) && leadIds.length) {
    return await Lead.find({ _id: { $in: leadIds } });
  }
  const q = {};
  if (filters.status) q.status = filters.status;
  if (filters.source) q.source = filters.source;
  if (filters.q)
    q.$or = [
      { name: new RegExp(filters.q, "i") },
      { company: new RegExp(filters.q, "i") },
      { email: new RegExp(filters.q, "i") },
    ];
  return await Lead.find(q).limit(1000);
};

export const createTemplate = async (req, res) => {
  try {
    const { name, subject, body } = req.body;
    const t = new EmailTemplate({ name, subject, body });
    await t.save();
    res.json({ id: t._id, name: t.name, subject: t.subject, createdAt: t.createdAt });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const listTemplates = async (req, res) => {
  try {
    const templates = await EmailTemplate.find()
      .select("name subject createdAt updatedAt")
      .sort({ createdAt: -1 })
      .lean();
    res.json(templates);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getTemplate = async (req, res) => {
  try {
    const template = await EmailTemplate.findById(req.params.id)
      .select("name subject body createdAt updatedAt")
      .lean();
    if (!template)
      return res.status(404).json({ message: "Template not found" });
    res.json(template);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const updateTemplate = async (req, res) => {
  try {
    const { name, subject, body } = req.body;
    await EmailTemplate.findByIdAndUpdate(
      req.params.id,
      { name, subject, body },
      { new: true }
    );
    const updated = await EmailTemplate.findById(req.params.id)
      .select("name subject body updatedAt")
      .lean();
    if (!updated)
      return res.status(404).json({ message: "Template not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const deleteTemplate = async (req, res) => {
  try {
    const template = await EmailTemplate.findByIdAndDelete(req.params.id);
    if (!template)
      return res.status(404).json({ message: "Template not found" });
    res.json({ message: "Template deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const sendEmail = async (req, res) => {
  try {
    const { leadId, templateId, overrideBody, to } = req.body;
    let lead = null;
    if (leadId) lead = await Lead.findById(leadId);

    const recipient = to || lead?.email;
    if (!recipient)
      return res.status(400).json({ message: "No recipient specified" });

    const template = templateId
      ? await EmailTemplate.findById(templateId)
      : null;

    let subject = template
      ? template.subject
      : req.body.subject || "No Subject";
    let body = overrideBody || (template ? template.body : req.body.body || "");

    if (overrideBody) {
      const parsed = parseSubjectFromBody(overrideBody);
      if (parsed.subject) subject = parsed.subject;
      body = parsed.body || "";
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const history = await sendTemplatedEmail({
      to: recipient,
      subject,
      body,
      leadId: lead?._id,
      templateId: template?._id,
      baseUrl,
    });

    if (lead) {
      lead.lastEmailSentAt = new Date();
      await lead.save();
    }

    // minimal response
    res.json({
      id: history._id,
      to: history.to,
      subject: history.subject,
      status: history.status,
      createdAt: history.createdAt,
      previewUrl: history.previewUrl,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to send", error: err.message });
  }
};

export const getHistory = async (req, res) => {
  try {
    const q = {};
    if (req.query.leadId) q.lead = req.query.leadId;
    if (req.query.status) q.status = req.query.status;
    // pagination
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 100);
    const skip = (page - 1) * limit;
    const items = await EmailHistory.find(q)
      .select("to subject status createdAt openedAt clickedAt previewUrl lead template")
      .populate({ path: "lead", select: "name" })
      .populate({ path: "template", select: "name" })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    const total = await EmailHistory.countDocuments(q);
    res.json({ data: items, total });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const exportHistory = async (req, res) => {
  try {
    const format = req.query.format || "json";
    const q = {};
    if (req.query.leadId) q.lead = req.query.leadId;
    const items = await EmailHistory.find(q)
      .select("to subject status createdAt openedAt clickedAt previewUrl lead template")
      .populate({ path: "lead", select: "name" })
      .populate({ path: "template", select: "name" })
      .sort({ createdAt: -1 })
      .lean();
    if (format === "csv") {
      const header = [
        "id",
        "lead",
        "to",
        "subject",
        "status",
        "createdAt",
        "openedAt",
        "clickedAt",
      ];
      const rows = items.map((i) =>
        [
          i._id,
          i.lead?.name || "",
          i.to,
          i.subject,
          i.status,
          i.createdAt,
          i.openedAt || "",
          i.clickedAt || "",
        ]
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(",")
      );
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        'attachment; filename="email_history.csv"'
      );
      res.send([header.join(","), ...rows].join("\n"));
    } else {
      res.json(items);
    }
  } catch (err) {
    res.status(500).json({ message: "Export failed", error: err.message });
  }
};

// Tracking endpoints
export const trackOpen = async (req, res) => {
  const logoPath = path.resolve(__dirname, "../../public/logo.svg");
  try {
    const { hid } = req.query;
    if (!hid) {
      res.set({
        "Cache-Control": "no-store, no-cache, must-revalidate, private",
        Pragma: "no-cache",
        Expires: "0",
      });
      return res.sendFile(logoPath);
    }

    // Find and update the email history
    const h = await EmailHistory.findOne({ trackId: hid });
    if (h) {
      if (!h.openedAt) h.openedAt = new Date();
      if (h.status !== "clicked") {
        h.status = "opened";
      }
      await h.save();
    }

    // Return a real image (logo) to display in the email client
    res.set({
      "Cache-Control": "no-store, no-cache, must-revalidate, private",
      Pragma: "no-cache",
      Expires: "0",
    });
    res.sendFile(logoPath);
  } catch (err) {
    console.error("Track open error:", err);
    // On error, still try to return the image to avoid broken content
    try {
      res.set({
        "Cache-Control": "no-store, no-cache, must-revalidate, private",
        Pragma: "no-cache",
        Expires: "0",
      });
      res.sendFile(logoPath);
    } catch (e) {
      res.status(200).end();
    }
  }
};

export const trackClick = async (req, res) => {
  try {
    const { hid, url } = req.query;
    if (!hid) return res.status(400).send("Missing tracking ID");
    if (!url) return res.status(400).send("Missing destination URL");

    // Find and update the email history
    const h = await EmailHistory.findOne({ trackId: hid });
    if (h) {
      h.status = "clicked";
      h.clickedAt = h.clickedAt || new Date(); // Keep first click time
      if (!h.openedAt) h.openedAt = new Date();
      await h.save();
    }

    // Safely decode and validate the URL
    const dest = decodeURIComponent(url);
    if (!dest.startsWith("http://") && !dest.startsWith("https://")) {
      return res.status(400).send("Invalid URL protocol");
    }

    // Redirect to the destination with no-cache headers
    res.set({
      "Cache-Control": "no-store, no-cache, must-revalidate, private",
      Expires: "0",
    });
    res.redirect(dest);
  } catch (err) {
    console.error("Track click error:", err);
    res.status(500).send("Tracking error");
  }
};

// Campaign sender: accepts { templateId, leadIds, filters, subject, body }
export const sendCampaign = async (req, res) => {
  try {
    const {
      templateId,
      leadIds,
      filters,
      subject: subjectOverride,
      body: bodyOverride,
    } = req.body;

    // validate template if provided
    let template = null;
    if (templateId) template = await EmailTemplate.findById(templateId);
 

    // If the provided bodyOverride includes a Subject: line, parse it once
    // and reuse for the whole campaign.
    let campaignSubject = subjectOverride;

    let campaignBody = bodyOverride;

    if (bodyOverride) {
      const parsed = parseSubjectFromBody(bodyOverride);
      if (parsed.subject) campaignSubject = parsed.subject;
      campaignBody = parsed.body || "";
    }

    // fetch leads to send to
    const leadsToSend = await fetchLeadsForCampaign({ leadIds, filters });
    if (!leadsToSend || leadsToSend.length === 0)
      return res.status(400).json({ message: "No leads found for campaign" });


    const results = { sent: 0, failed: 0, errors: [] };
    const baseUrl = `${req.protocol}://${req.get("host")}`;


    // send sequentially to avoid overwhelming SMTP; could be parallelized with throttling
    for (const lead of leadsToSend) {
      try {
        const recipient = lead.email;
        if (!recipient) {
          results.failed++;
          results.errors.push({ lead: lead._id, message: "Missing email" });
          continue;
        }

        const subject =
          campaignSubject || (template ? template.subject : "No Subject");
        const body = campaignBody || (template ? template.body : "");

        // use the service to send and record history
        await sendTemplatedEmail({
          to: recipient,
          subject,
          body,
          leadId: lead._id,
          templateId: template?._id,
          baseUrl,
        });
        results.sent++;
      } catch (err) {
        results.failed++;
        results.errors.push({ lead: lead._id, message: err.message });
      }
    }

    res.json({ message: "Campaign processed", results });
  } catch (err) {
    res.status(500).json({ message: "Campaign failed", error: err.message });
  }
};

// Generate an AI-assisted personalized snippet for a lead/template
export const generateSnippet = async (req, res) => {
  try {
    const { leadId, templateId, tone = "professional" } = req.body;
    const lead = leadId ? await Lead.findById(leadId) : null;
    const template = templateId
      ? await EmailTemplate.findById(templateId)
      : null;

    const placeholder = (
      template?.body ||
      `Dear {{name}},

[Your message will go here]

Best regards,
[Sender Name]`
    ).replace(/{{name}}/g, lead?.name || "{{name}}");

    const prompt = `Write a personalized outreach email with subject line following this structure:

Template to follow:
${placeholder}

Lead information to personalize the message:
- Name: ${lead?.name || "[Not provided]"}
- Company: ${lead?.company || "[Not provided]"}
- Title: ${lead?.title || ""}
- Notes: ${lead?.notes || ""}

Requirements:
1. Start with "Subject:" followed by a compelling subject line
2. Use proper business email format with clear sections
3. Start with a personalized greeting
4. Include 2-3 well-spaced paragraphs
5. End with a clear call to action
6. Add a professional sign-off
7. Maintain ${tone} tone throughout
8. Use proper spacing between sections

Format example:
Dear [Name],

[First paragraph with personal context]

[Second paragraph with value proposition]

[Call to action]

Best regards,
[Sender]

Return ONLY the formatted email body without any extra text or annotations.`;

    const SAMBA_KEY =
      process.env.SAMBANOVA_API_KEY || process.env.SAMBA_API_KEY;
    const SAMBA_MODEL =
      process.env.SAMBANOVA_MODEL || "Meta-Llama-3.1-8B-Instruct";
    if (!SAMBA_KEY) {
      return res
        .status(400)
        .json({ message: "SambaNova API key not configured" });
    }

    try {
      const resp = await fetch("https://api.sambanova.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${SAMBA_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: SAMBA_MODEL,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await resp.json();
      const text =
        data?.choices?.[0]?.message?.content ||
        data?.output ||
        data?.text ||
        data?.result ||
        (Array.isArray(data) && data[0]?.generated_text) ||
        null;
      if (!text) {
        return res
          .status(500)
          .json({ message: "SambaNova returned no content", raw: data });
      }

      const toHtml = (s) => {
        if (!s) return "";
        if (/<[a-z][\s\S]*>/i.test(s)) return s;

        // Split into sections (greeting, body, signature)
        const parts = s.split(/\n{2,}/);
        const formatted = parts.map((part) => {
          const lines = part.split(/\n/);
          if (lines.length === 1) {
            // Single line (greeting or signature)
            return `<p style=\"margin: 0.5em 0\">${lines[0]}</p>`;
          } else {
            // Multi-line paragraph
            return `<p style=\"margin: 1em 0\">${lines.join("<br/>")}</p>`;
          }
        });

        return `<div style=\"font-family: system-ui, -apple-system, sans-serif; line-height: 1.5\">
          ${formatted.join("\n")}
        </div>`;
      };

      const html = toHtml(text);
      return res.json({ body: text, html, provider: "sambanova" });
    } catch (e) {
      console.error("SambaNova snippet error", e);
      return res
        .status(500)
        .json({ message: "SambaNova request failed", error: e.message });
    }
  } catch (err) {
    res
      .status(500)
      .json({ message: "Snippet generation failed", error: err.message });
  }
};
