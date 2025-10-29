import React, { useEffect, useState } from "react";
import api from "../lib/api";
import { FileText, Plus, X, Edit, Trash2 } from "lucide-react";
import { Modal } from "../components/ui";
import { motion } from "framer-motion";

const VITE_API_FRONTEND_URL = import.meta.env.VITE_API_FRONTEND_URL;

export default function Templates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState("");

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await api.get("/email/templates");
      const data = Array.isArray(res.data)
        ? res.data
        : res.data.templates || res.data.data || [];
      setTemplates(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setShowModal(true);
    setMessage("");
  };

  const openEdit = (t) => {
    setEditing(t);
    setShowModal(true);
    setMessage("");
  };

  const remove = async (id) => {
    if (!confirm("Delete template?")) return;
    await api.delete(`/email/templates/${id}`);
    fetchTemplates();
  };

  const save = async (payload) => {
    try {
      if (editing) {
        await api.put(`/email/templates/${editing._id}`, payload);
        setMessage("Template updated successfully!");
      } else {
        await api.post("/email/templates", payload);
        setMessage("Template created successfully!");
      }
      setShowModal(false);
      fetchTemplates();
    } catch (err) {
      setMessage(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="p-4 text-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-400" /> Email Templates
        </h2>
        <button
          className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-sm transition"
          onClick={openCreate}
        >
          <Plus className="w-4 h-4" /> New Template
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
          />
        </div>
      ) : templates.length === 0 ? (
        <div className="text-gray-400">No templates found.</div>
      ) : (
        <div className="grid gap-4">
          {templates.map((t) => (
            <div
              key={t._id}
              className="p-4 bg-gray-900/60 text-gray-100 rounded-2xl border border-gray-800 hover:border-gray-700 hover:shadow-lg transition"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold text-lg">{t.name}</div>
                  <div className="text-sm text-gray-400">{t.subject}</div>
                </div>
                <div className="flex gap-3">
                  <button
                    className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
                    onClick={() => openEdit(t)}
                  >
                    <Edit className="w-4 h-4" /> Edit
                  </button>
                  <button
                    className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1"
                    onClick={() => remove(t._id)}
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              </div>

              <div
                className="mt-3 text-sm text-gray-300 border-t border-gray-800 pt-3"
                dangerouslySetInnerHTML={{ __html: t.body }}
              />
            </div>
          ))}
        </div>
      )}

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? "Edit Template" : "New Template"}
        maxWidth="max-w-xl"
      >
        <TemplateForm initial={editing} onSave={save} />
      </Modal>

      {message && (
        <div className="mt-4 text-sm text-green-400 font-medium">{message}</div>
      )}
    </div>
  );
}

function TemplateForm({ initial, onSave }) {
  const [name, setName] = useState(initial?.name || "");
  const [subject, setSubject] = useState(initial?.subject || "");
  const [body, setBody] = useState(initial?.body || "");
  const [tone, setTone] = useState("professional");
  const [generating, setGenerating] = useState(false);
  const [errors, setErrors] = useState({});
  const [linkUrl, setLinkUrl] = useState(VITE_API_FRONTEND_URL || "http://localhost:5173/");
  const [links, setLinks] = useState([]);
  const [inserting, setInserting] = useState(false);

  useEffect(() => {
    setName(initial?.name || "");
    setSubject(initial?.subject || "");
    setBody(initial?.body || "");
  }, [initial]);

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = "Name is required";
    if (!subject.trim()) e.subject = "Subject is required";
    if (!body || !body.trim()) e.body = "Body (HTML) cannot be empty";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (e) => {
    e?.preventDefault();
    if (!validate()) return;
    await onSave({ name, subject, body });
  };

  const generate = async () => {
    try {
      setGenerating(true);
      const res = await api.post("/email/snippet", {
        leadId: null,
        data: body,
        tone,
      });
      const html = res.data?.html || "";
      if (html) setBody(html);
    } catch (err) {
      console.error("Failed to generate snippet", err);
      alert(err.response?.data?.message || err.message || "Failed to generate snippet");
    } finally {
      setGenerating(false);
    }
  };

  const insertLink = async () => {
    if (!linkUrl || !/^https?:\/\//i.test(linkUrl)) {
      alert("Enter a valid URL starting with http:// or https://");
      return;
    }
    setInserting(true);
    setTimeout(() => {
      const linkHtml = `\n<p><a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${linkUrl}</a></p>`;
      setBody((prev) => (prev || "") + linkHtml);
      setLinks((prev) => [...prev, linkUrl]);
      setInserting(false);
    }, 600);
  };

  const removeLink = (url) => {
    setLinks((prev) => prev.filter((l) => l !== url));
    setBody((prev) => prev.replace(new RegExp(`<a href="${url}".*?</a>`, "g"), ""));
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-400">Use AI to draft your HTML body</div>
        <div className="flex items-center gap-2">
          <select
            className="bg-gray-800 border border-gray-700 text-gray-100 text-xs px-2 py-1 rounded"
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            disabled={generating}
            title="Tone"
          >
            <option value="professional">Professional</option>
            <option value="friendly">Friendly</option>
            <option value="casual">Casual</option>
            <option value="persuasive">Persuasive</option>
          </select>
          <button
            type="button"
            onClick={generate}
            disabled={generating}
            className={`px-3 py-1.5 rounded text-sm font-medium ${
              generating
                ? "bg-gray-700 text-gray-300 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 text-white"
            }`}
          >
            {generating ? "Generating..." : "Generate Snippet"}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-gray-400">
        <span>Tip: Any link you include will be auto-tracked when sent.</span>
      </div>

      <div className="flex items-center gap-2">
        <input
          className="flex-1 bg-gray-800 border border-gray-700 text-gray-100 p-2 rounded focus:outline-none focus:border-blue-500 text-sm"
          placeholder={`${VITE_API_FRONTEND_URL || "http://localhost:5173"}/`}
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
        />
        <button
          type="button"
          onClick={insertLink}
          disabled={inserting}
          className={`flex items-center justify-center gap-2 px-3 py-2 rounded text-sm ${
            inserting
              ? "bg-gray-700 text-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {inserting && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
            />
          )}
          {inserting ? "Inserting..." : "Insert Link"}
        </button>
      </div>

      {links.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {links.map((url) => (
            <div
              key={url}
              className="flex items-center gap-2 bg-gray-800 border border-gray-700 px-2 py-1 rounded text-xs text-gray-300"
            >
              <a href={url} target="_blank" rel="noopener noreferrer" className="underline">
                {url}
              </a>
              <X
                className="w-3 h-3 text-red-400 cursor-pointer hover:text-red-300"
                onClick={() => removeLink(url)}
              />
            </div>
          ))}
        </div>
      )}

      <div>
        <label className="block text-sm text-gray-300 mb-1">Name</label>
        <input
          className={`w-full bg-gray-800 border ${
            errors.name ? "border-red-500" : "border-gray-700"
          } text-gray-100 p-2 rounded focus:outline-none focus:border-blue-500`}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={validate}
          required
        />
        {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
      </div>
      <div>
        <label className="block text-sm text-gray-300 mb-1">Subject</label>
        <input
          className={`w-full bg-gray-800 border ${
            errors.subject ? "border-red-500" : "border-gray-700"
          } text-gray-100 p-2 rounded focus:outline-none focus:border-blue-500`}
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          onBlur={validate}
          required
        />
        {errors.subject && <p className="mt-1 text-xs text-red-400">{errors.subject}</p>}
      </div>
      <div>
        <label className="block text-sm text-gray-300 mb-1">Body (HTML)</label>
        <textarea
          className={`w-full bg-gray-800 border ${
            errors.body ? "border-red-500" : "border-gray-700"
          } text-gray-100 p-2 rounded focus:outline-none focus:border-blue-500`}
          rows={8}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onBlur={validate}
        />
        {errors.body && <p className="mt-1 text-xs text-red-400">{errors.body}</p>}
      </div>
      <div className="flex justify-end gap-2">
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          Save Template
        </button>
      </div>
    </form>
  );
}
