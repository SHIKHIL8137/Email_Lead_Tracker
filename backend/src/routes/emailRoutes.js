import express from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import {
  createTemplate,
  listTemplates,
  getTemplate,
  updateTemplate,
  deleteTemplate,
  sendCampaign,
  getHistory,
  exportHistory,
  generateSnippet,
  trackOpen,
  trackClick,
} from "../controllers/emailController.js";

const router = express.Router();


const publicRouter = express.Router();
publicRouter.get("/open", trackOpen);
publicRouter.get("/click", trackClick);

router.use(authenticate);
router.post("/templates", createTemplate);
router.get("/templates", listTemplates);
router.get("/templates/:id", getTemplate);
router.put("/templates/:id", updateTemplate);
router.delete("/templates/:id", deleteTemplate);


router.post("/campaigns", sendCampaign);
router.post("/snippet", generateSnippet);
router.get("/history", getHistory);
router.get("/history/export", exportHistory);

export default function mount(app) {
  app.use("/api/email/track", publicRouter);
  app.use("/api/email", router);
}
