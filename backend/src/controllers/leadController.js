import Lead from "../models/Lead.js";

export const createLead = async (req, res) => {
  try {
    const userId = req.user._id;
    const data = req.body;


    const lead = new Lead({ ...data, createdBy: userId });
    await lead.save();

    const minimal = await Lead.findOne({ _id: lead._id, createdBy: userId })
      .select("name email company status source lastEmailSentAt createdAt")
      .lean();

    res.json(minimal);
  } catch (err) {
    console.error("createLead error:", err);
    res.status(500).json({ message: "Failed to create lead", error: err.message });
  }
};


export const getLeads = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      status,
      source,
      q,
      sortBy = "createdAt",
      sortOrder = "desc",
      lastEmailBefore,
      lastEmailAfter,
      page = 1,
      limit = 10,
    } = req.query;


    const query = { createdBy: userId };

    if (status) {
      query.status = Array.isArray(status) ? { $in: status } : status;
    }


    if (source) {
      query.source = Array.isArray(source) ? { $in: source } : source;
    }

    if (q) {
      const searchRegex = new RegExp(q.trim(), "i");
      query.$or = [
        { name: searchRegex },
        { company: searchRegex },
        { email: searchRegex },
        { notes: searchRegex },
      ];
    }

    if (lastEmailBefore || lastEmailAfter) {
      query.lastEmailSentAt = {};
      if (lastEmailBefore) {
        query.lastEmailSentAt.$lte = new Date(lastEmailBefore);
      }
      if (lastEmailAfter) {
        query.lastEmailSentAt.$gte = new Date(lastEmailAfter);
      }
    }

    const pageNum = Math.max(1, parseInt(page)) || 1;
    const limitNum = Math.max(1, Math.min(100, parseInt(limit))) || 10;
    const skip = (pageNum - 1) * limitNum;
    const validSortFields = ["name", "email", "company", "status", "source", "createdAt", "lastEmailSentAt"];
    const sortField = validSortFields.includes(sortBy) ? sortBy : "createdAt";
    const sortDirection = sortOrder === "asc" ? 1 : -1;


    const total = await Lead.countDocuments(query);

    const leads = await Lead.find(query)
      .select("name email company status source lastEmailSentAt createdAt notes")
      .sort({ [sortField]: sortDirection })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const stats = await Lead.aggregate([
      { $match: query },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const byStatus = stats.reduce((acc, s) => {
      acc[s._id || "unknown"] = s.count;
      return acc;
    }, {});

    res.json({
      leads,
      pagination: {
        total,
        pages: Math.ceil(total / limitNum),
        currentPage: pageNum,
        limit: limitNum,
      },
      stats: { totalLeads: total, byStatus },
    });
  } catch (err) {
    console.error("getLeads error:", err);
    res.status(500).json({ message: "Failed to fetch leads", error: err.message });
  }
};

export const getLead = async (req, res) => {
  try {
    const userId = req.user._id;
    const lead = await Lead.findOne({ _id: req.params.id, createdBy: userId })
      .select("name email phone company status source notes lastEmailSentAt createdAt")
      .lean();

    if (!lead) {
      return res.status(404).json({ message: "Lead not found or not authorized" });
    }

    res.json(lead);
  } catch (err) {
    console.error("getLead error:", err);
    res.status(500).json({ message: "Failed to fetch lead", error: err.message });
  }
};

export const updateLead = async (req, res) => {
  try {
    const userId = req.user._id;
    const updates = req.body;

    delete updates.createdBy;

    const updated = await Lead.findOneAndUpdate(
      { _id: req.params.id, createdBy: userId },
      { $set: updates },
      { new: true }
    )
      .select("name email company status source lastEmailSentAt createdAt")
      .lean();

    if (!updated) {
      return res.status(404).json({ message: "Lead not found or not authorized" });
    }

    res.json(updated);
  } catch (err) {
    console.error("updateLead error:", err);
    res.status(500).json({ message: "Failed to update lead", error: err.message });
  }
};


export const deleteLead = async (req, res) => {
  try {
    const userId = req.user._id;
    const lead = await Lead.findOneAndDelete({
      _id: req.params.id,
      createdBy: userId,
    });

    if (!lead) {
      return res.status(404).json({ message: "Lead not found or not authorized" });
    }

    res.json({ message: "Lead deleted successfully" });
  } catch (err) {
    console.error("deleteLead error:", err);
    res.status(500).json({ message: "Failed to delete lead", error: err.message });
  }
};