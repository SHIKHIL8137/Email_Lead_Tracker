import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../lib/api";
import { Modal } from "../components/ui";

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [source, setSource] = useState("");
  const [page] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await api.get("/leads", {
        params: { q, status, source, page, limit: 100 },
      });
      const leadsData = Array.isArray(res.data)
        ? res.data
        : res.data.leads || res.data.data || [];
      setLeads(leadsData);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLeads();
  }, [q, status, source]);

  const openCreate = () => {
    setEditing(null);
    setShowModal(true);
  };
  
  const openEdit = (lead) => {
    setEditing(lead);
    setShowModal(true);
  };

  const remove = async (id) => {
    if (!confirm("Delete lead?")) return;
    await api.delete(`/leads/${id}`);
    fetchLeads();
  };

  const exportCSV = async () => {
    const res = await api.get("/leads/export", {
      params: { format: "csv", q, status, source },
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(res.data);
    const a = document.createElement("a");
    a.href = url;
    a.download = "leads.csv";
    a.click();
  };

  const saveLead = async (payload) => {
    if (editing) {
      await api.put(`/leads/${editing._id}`, payload);
    } else {
      await api.post("/leads", payload);
    }
    setShowModal(false);
    fetchLeads();
  };

  const getStatusColor = (status) => {
    const colors = {
      New: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      Contacted: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      Qualified: "bg-green-500/20 text-green-400 border-green-500/30",
      Converted: "bg-pink-500/20 text-pink-400 border-pink-500/30",
      Lost: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    };
    return colors[status] || colors.New;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Leads
          </h1>
          <p className="text-gray-400 mt-1">Manage your lead pipeline</p>
        </div>
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg hover:shadow-green-500/50 transition-all flex items-center gap-2"
            onClick={openCreate}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Lead
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gray-700/50 hover:bg-gray-700 text-gray-200 px-5 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2"
            onClick={fetchLeads}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg hover:shadow-blue-500/50 transition-all flex items-center gap-2"
            onClick={exportCSV}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export
          </motion.button>
        </div>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-gray-700/50">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              placeholder="Search name, company, or email..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full bg-gray-900/50 border border-gray-600 text-gray-100 pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-500"
            />
          </div>
          <select
            className="bg-gray-900/50 border border-gray-600 text-gray-100 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All Status</option>
            <option>New</option>
            <option>Contacted</option>
            <option>Qualified</option>
            <option>Converted</option>
            <option>Lost</option>
          </select>
          <select
            className="bg-gray-900/50 border border-gray-600 text-gray-100 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            value={source}
            onChange={(e) => setSource(e.target.value)}
          >
            <option value="">All Sources</option>
            <option>LinkedIn</option>
            <option>Website</option>
            <option>Referral</option>
            <option>Other</option>
          </select>
        </div>
      </div>


      {loading ? (
        <div className="flex items-center justify-center py-20">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
          />
        </div>
      ) : leads.length === 0 ? (
        <div className="bg-gray-800/30 backdrop-blur-xl rounded-2xl border border-gray-700/30 p-12 text-center">
          <svg className="w-20 h-20 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 className="text-xl font-semibold text-gray-300 mb-2">No leads found</h3>
          <p className="text-gray-500">Get started by creating your first lead</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {leads.map((l, index) => (
            <motion.div
              key={l._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.01 }}
              className="bg-gray-800/50 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-gray-700/50 hover:border-gray-600/50 transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-100">
                      {l.name}
                    </h3>
                    {l.company && (
                      <span className="text-sm text-gray-400 bg-gray-700/50 px-3 py-1 rounded-full">
                        {l.company}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-gray-300 mb-3">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm">{l.email}</span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      Source: {l.source}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-4 py-2 rounded-xl text-sm font-medium border ${getStatusColor(l.status)}`}>
                    {l.status}
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="text-blue-400 hover:text-blue-300 p-2 hover:bg-blue-500/10 rounded-lg transition-all"
                    onClick={() => openEdit(l)}
                    title="Edit"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="text-red-400 hover:text-red-300 p-2 hover:bg-red-500/10 rounded-lg transition-all"
                    onClick={() => remove(l._id)}
                    title="Delete"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? "Edit Lead" : "New Lead"}
      >
        <LeadForm onSave={saveLead} initial={editing} />
      </Modal>
    </motion.div>
  );
}

function LeadForm({ onSave, initial }) {
  const [name, setName] = useState(initial?.name || "");
  const [company, setCompany] = useState(initial?.company || "");
  const [email, setEmail] = useState(initial?.email || "");
  const [source, setSource] = useState(initial?.source || "Other");
  const [status, setStatus] = useState(initial?.status || "New");
  const [notes, setNotes] = useState(initial?.notes || "");

  const submit = async (e) => {
    e?.preventDefault();
    await onSave({ name, company, email, source, status, notes });
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Full Name *
        </label>
        <input
          className="w-full bg-gray-900/50 border border-gray-600 text-gray-100 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-500"
          placeholder="John Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Company
        </label>
        <input
          className="w-full bg-gray-900/50 border border-gray-600 text-gray-100 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-500"
          placeholder="Acme Inc."
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Email Address *
        </label>
        <input
          className="w-full bg-gray-900/50 border border-gray-600 text-gray-100 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-500"
          placeholder="john@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Source
          </label>
          <select
            className="w-full bg-gray-900/50 border border-gray-600 text-gray-100 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            value={source}
            onChange={(e) => setSource(e.target.value)}
          >
            <option>LinkedIn</option>
            <option>Website</option>
            <option>Referral</option>
            <option>Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Status
          </label>
          <select
            className="w-full bg-gray-900/50 border border-gray-600 text-gray-100 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option>New</option>
            <option>Contacted</option>
            <option>Qualified</option>
            <option>Converted</option>
            <option>Lost</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Notes
        </label>
        <textarea
          className="w-full bg-gray-900/50 border border-gray-600 text-gray-100 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-500 resize-none"
          rows={4}
          placeholder="Add any additional notes..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
      <div className="flex justify-end pt-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-blue-500/50 transition-all"
        >
          {initial ? "Update Lead" : "Create Lead"}
        </motion.button>
      </div>
    </form>
  );
}