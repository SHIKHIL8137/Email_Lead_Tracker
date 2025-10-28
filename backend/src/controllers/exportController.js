export const exportLeads = async (req, res) => {
  try {
    const { format = "json" } = req.query;
    const leads = await Lead.find({ createdBy: req.user._id })
      .select("-__v")
      .lean();

    if (format === "csv") {
      const csv = leads
        .map((l) => {
          return `${l.name},${l.company || ""},${l.email},${l.source},${
            l.status
          },${l.notes || ""}`;
        })
        .join("\n");
      const header = "Name,Company,Email,Source,Status,Notes\n";
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=leads.csv");
      return res.send(header + csv);
    }

    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", "attachment; filename=leads.json");
    res.json(leads);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
