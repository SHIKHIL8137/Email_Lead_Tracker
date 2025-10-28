import Lead from "../models/Lead.js";
import EmailHistory from "../models/EmailHistory.js";
import mongoose from "mongoose";

export const getStats = async (req, res) => {
  try {
    const userId = req.user._id;


    const leadsAgg = await Lead.aggregate([
      { $match: { createdBy: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    const leadsByStatus = leadsAgg.reduce((acc, s) => {
      acc[s._id || "Unknown"] = s.count;
      return acc;
    }, {});
    const totalLeads = Object.values(leadsByStatus).reduce((a, b) => a + b, 0);

    const since = new Date();
    since.setDate(since.getDate() - 14);

    const emailsAgg = await EmailHistory.aggregate([
      {
        $lookup: {
          from: "leads",
          localField: "lead",
          foreignField: "_id",
          as: "leadDoc",
        },
      },
      { $unwind: { path: "$leadDoc", preserveNullAndEmptyArrays: true } },
      { $match: { "leadDoc.createdBy": new mongoose.Types.ObjectId(userId) } },
      {
        $facet: {
          perDay: [
            { $match: { createdAt: { $gte: since } } },
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                count: { $sum: 1 },
              },
            },
            { $sort: { _id: 1 } },
          ],
          totals: [
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                opened: {
                  $sum: { $cond: [{ $eq: ["$status", "opened"] }, 1, 0] },
                },
                clicked: {
                  $sum: { $cond: [{ $eq: ["$status", "clicked"] }, 1, 0] },
                },
              },
            },
          ],
        },
      },
    ]);

    const perDayArr = emailsAgg[0]?.perDay || [];
    const perDay = perDayArr.reduce((acc, d) => {
      acc[d._id] = d.count;
      return acc;
    }, {});

    const totalsDoc = emailsAgg[0]?.totals?.[0] || { total: 0, opened: 0, clicked: 0 };

    res.json({
      leadsByStatus,
      totalLeads,
      emailsPerDay: perDay,
      totals: { total: totalsDoc.total, opened: totalsDoc.opened, clicked: totalsDoc.clicked },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
