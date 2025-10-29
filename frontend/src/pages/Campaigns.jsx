import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../lib/api";

export default function Campaigns() {
  const [templates, setTemplates] = useState([]);
  const [tplError, setTplError] = useState("");
  const [leads, setLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [overrideBody, setOverrideBody] = useState("");
  const [snippetLoading, setSnippetLoading] = useState(false);

  useEffect(() => {
    fetchTemplates();
    fetchLeads();
  }, []);

  useEffect(() => {
    const loadTemplateContent = async () => {
      if (selectedTemplate) {
        try {
          const res = await api.get(`/email/templates/${selectedTemplate}`);
          setOverrideBody(res.data.body || "");
        } catch (err) {
          console.error("Failed to load template", err);
          setMessage(
            "Failed to load template: " +
              (err.response?.data?.message || err.message)
          );
        }
      }
    };
    loadTemplateContent();
  }, [selectedTemplate]);

  const fetchTemplates = async () => {
    try {
      const res = await api.get("/email/templates");
      const templatesData = Array.isArray(res.data)
        ? res.data
        : res.data.templates || res.data.data || res.data.items || [];
      if (!templatesData.length) {
        if (res.data && res.data.message && !Array.isArray(res.data)) {
          setTplError(res.data.message);
        } else {
          setTplError("No templates available");
        }
      } else {
        setTplError("");
      }
      setTemplates(templatesData);
    } catch (err) {
      setTplError(err.response?.data?.message || err.message);
      setTemplates([]);
    }
  };

  const fetchLeads = async () => {
    const res = await api.get("/leads");
    const leadsData = Array.isArray(res.data)
      ? res.data
      : res.data.leads || res.data.data || [];
    setLeads(leadsData);
  };

  const canSend = () => !!selectedLead; 

  const canGenerateSnippet = () =>
    !selectedTemplate && selectedLead && !sending;

  const send = async () => {
    if (!canSend()) {
      setMessage("Select a lead before sending.");
      return;
    }
    setSending(true);
    setMessage("");
    try {
      const payload = {
        leadIds: selectedLead ? [selectedLead] : [],
        templateId: selectedTemplate || undefined,
        body: overrideBody || undefined,
      };
      await api.post("/email/campaigns", payload);
      setMessage("✅ Email queued/sent");
      setOverrideBody("");
    } catch (err) {
      setMessage("❌ " + (err.response?.data?.message || err.message));
    } finally {
      setSending(false);
    }
  };

  const generateSnippet = async () => {
    if (!canGenerateSnippet()) {
      return setMessage(
        "Select a lead first. Template must be empty to generate snippet."
      );
    }
    setSnippetLoading(true);
    setMessage("");
    try {
      const res = await api.post("/email/snippet", {
        leadId: selectedLead,
        templateId: null,
      });
      setOverrideBody(res.data.html || res.data.body || "");
      setMessage("✨ Snippet generated");
    } catch (err) {
      setMessage(
        "Failed to generate snippet: " +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setSnippetLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >

      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r p-2 from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
          Campaigns
        </h1>
        <p className="text-gray-400">Send personalized email campaigns</p>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 backdrop-blur-xl p-6 rounded-2xl border border-blue-500/20 hover:border-blue-500/40 transition-all"
        >
          <h3 className="text-lg font-semibold text-blue-400 mb-3">
            Select Lead
          </h3>
          <select
            className="w-full bg-gray-900/60 text-gray-100 border border-gray-700 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedLead}
            onChange={(e) => setSelectedLead(e.target.value)}
          >
            <option value="">-- Choose a lead --</option>
            {leads.map((l) => (
              <option key={l._id} value={l._id}>
                {l.name} — {l.email}
              </option>
            ))}
          </select>
          {!selectedLead && (
            <p className="mt-2 text-xs text-blue-300/80">Select a lead to enable sending.</p>
          )}
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 backdrop-blur-xl p-6 rounded-2xl border border-purple-500/20 hover:border-purple-500/40 transition-all"
        >
          <h3 className="text-lg font-semibold text-purple-400 mb-3">
            Select Template
          </h3>
          <select
            className="w-full bg-gray-900/60 text-gray-100 border border-gray-700 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(e.target.value)}
          >
            <option value="">-- Choose a template --</option>
            {templates.map((t) => (
              <option key={t._id} value={t._id}>
                {t.name}
              </option>
            ))}
          </select>
          {tplError && <div className="text-sm text-red-400 mt-2">{tplError}</div>}
        </motion.div>
      </div>


      <div className="flex flex-wrap items-center gap-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={send}
          disabled={sending || !canSend()}
          className={`px-6 py-2 rounded-lg font-medium shadow-lg transition-all ${
            canSend()
              ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-purple-500/40"
              : "bg-gray-700 text-gray-400 cursor-not-allowed"
          }`}
        >
          {sending ? "Sending..." : "Send Email"}
        </motion.button>

        {!selectedTemplate && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={generateSnippet}
            disabled={snippetLoading || !canGenerateSnippet()}
            className={`px-6 py-2 rounded-lg font-medium shadow-lg transition-all ${
              canGenerateSnippet()
                ? "bg-gradient-to-r from-indigo-500 to-blue-600 text-white hover:shadow-indigo-500/40"
                : "bg-gray-700 text-gray-400 cursor-not-allowed"
            }`}
          >
            {snippetLoading ? "Generating..." : "Generate Snippet"}
          </motion.button>
        )}

        {message && (
          <div
            className={`text-sm mt-2 ${
              message.toLowerCase().includes("fail")
                ? "text-red-400"
                : "text-green-400"
            }`}
          >
            {message}
          </div>
        )}
      </div>

      <motion.div
        whileHover={{ scale: 1.01 }}
        className="bg-gray-800/50 backdrop-blur-xl p-6 rounded-2xl border border-gray-700/50 shadow-2xl transition-all"
      >
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold text-gray-100">
            Email Content
          </h3>
          {selectedTemplate && (
            <button
              onClick={() => {
                setSelectedTemplate("");
                setOverrideBody("");
              }}
              className="text-sm text-gray-400 hover:text-red-400 transition-colors"
            >
              Clear Template
            </button>
          )}
        </div>

        <textarea
          className="w-full bg-gray-900/60 text-gray-100 border border-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          rows={10}
          value={overrideBody}
          onChange={(e) => setOverrideBody(e.target.value)}
          placeholder={
            snippetLoading
              ? "Generating snippet..."
              : selectedTemplate
              ? "Template content (you can edit to override)"
              : "Write or generate your email content (HTML allowed)"
          }
        />
      </motion.div>
    </motion.div>
  );
}
