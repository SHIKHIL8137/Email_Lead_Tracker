import Lead from "../models/Lead.js";

export const createLead = async (req, res) => {
  try {
    const data = req.body;
    const lead = new Lead({ ...data, createdBy: req.user._id });
    await lead.save();
    const minimal = await Lead.findById(lead._id)
      .select("name email company status source lastEmailSentAt createdAt")
      .lean();
    res.json(minimal);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getLeads = async (req, res) => {
  try {
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

    const query = { createdBy: req.user._id };


    if (status) {
      query.status = Array.isArray(status) ? { $in: status } : status;
    }


    if (source) {
      query.source = Array.isArray(source) ? { $in: source } : source;
    }

    if (q) {
      query.$or = [
        { name: new RegExp(q, "i") },
        { company: new RegExp(q, "i") },
        { email: new RegExp(q, "i") },
        { notes: new RegExp(q, "i") },
      ];
    }

    if (lastEmailBefore || lastEmailAfter) {
      query.lastEmailSentAt = {};
      if (lastEmailBefore)
        query.lastEmailSentAt.$lte = new Date(lastEmailBefore);
      if (lastEmailAfter) query.lastEmailSentAt.$gte = new Date(lastEmailAfter);
    }


    const skip = (parseInt(page) - 1) * parseInt(limit);


    const total = await Lead.countDocuments(query);


    const leads = await Lead.find(query)
      .select("name email company status source lastEmailSentAt createdAt")
      .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();


    const stats = await Lead.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const byStatus = stats.reduce((acc, s) => {
      acc[s._id] = s.count;
      return acc;
    }, {});

    res.json({
      leads,
      pagination: {
        total,
        pages: Math.ceil(total / parseInt(limit)),
        currentPage: parseInt(page),
        limit: parseInt(limit),
      },
      stats: { totalLeads: total, byStatus },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .select("name email phone company status source notes lastEmailSentAt createdAt")
      .lean();
    if (!lead) return res.status(404).json({ message: "Lead not found" });
    res.json(lead);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const updateLead = async (req, res) => {
  try {
    await Lead.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    const minimal = await Lead.findById(req.params.id)
      .select("name email company status source lastEmailSentAt createdAt")
      .lean();
    if (!minimal) return res.status(404).json({ message: "Lead not found" });
    res.json(minimal);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const deleteLead = async (req, res) => {
  try {
    await Lead.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
