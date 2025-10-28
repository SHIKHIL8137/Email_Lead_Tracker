import mongoose from "mongoose";

const leadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    company: { type: String },
    email: { type: String, required: true },
    source: {
      type: String,
      enum: ["LinkedIn", "Website", "Referral", "Other"],
      default: "Other",
    },
    status: {
      type: String,
      enum: ["New", "Contacted", "Qualified", "Converted", "Lost"],
      default: "New",
    },
    notes: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    lastEmailSentAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("Lead", leadSchema);
