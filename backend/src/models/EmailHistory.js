import mongoose from "mongoose";

const emailHistorySchema = new mongoose.Schema(
  {
    lead: { type: mongoose.Schema.Types.ObjectId, ref: "Lead" },
    template: { type: mongoose.Schema.Types.ObjectId, ref: "EmailTemplate" },
    to: { type: String },
    subject: { type: String },
    body: { type: String },
    status: {
      type: String,
      enum: ["sent", "failed", "opened", "clicked"],
      default: "sent",
    },
    messageId: { type: String },
    trackId: { type: String },
    openedAt: { type: Date },
    clickedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("EmailHistory", emailHistorySchema);
