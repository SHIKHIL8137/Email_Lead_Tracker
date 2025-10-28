import express from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import {
  createLead,
  getLeads,
  getLead,
  updateLead,
  deleteLead,
} from "../controllers/leadController.js";

const router = express.Router();

router.use(authenticate);

router.post("/", createLead);
router.get("/", getLeads);

router.get("/export", async (req, res) => {
  try {
    const format = req.query.format || "json";
    const { status, source, q } = req.query;
    const query = { createdBy: req.user._id };
    if (status) query.status = status;
    if (source) query.source = source;
    if (q)
      query.$or = [
        { name: new RegExp(q, "i") },
        { company: new RegExp(q, "i") },
        { email: new RegExp(q, "i") },
      ];
    const leads = await (await import("../models/Lead.js")).default
      .find(query)
      .sort({ createdAt: -1 });
    if (format === "csv") {
      const header = [
        "id",
        "name",
        "company",
        "email",
        "source",
        "status",
        "notes",
        "createdAt",
        "lastEmailSentAt",
      ];
      const rows = leads.map((l) =>
        header
          .map((h) => JSON.stringify(l[h] ?? l[h] === 0 ? l[h] : ""))
          .join(",")
      );
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", 'attachment; filename="leads.csv"');
      res.send([header.join(","), ...rows].join("\n"));
    } else {
      res.json(leads);
    }
  } catch (err) {
    res.status(500).json({ message: "Export failed", error: err.message });
  }
});
router.get("/:id", getLead);
router.put("/:id", updateLead);
router.delete("/:id", deleteLead);

export default router;
