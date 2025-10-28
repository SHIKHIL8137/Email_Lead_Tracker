import React, { useEffect, useState } from "react";
import api from "../lib/api";
import { Mail, RefreshCcw, Download, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function EmailHistory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    try {
      setLoading(true);
      const res = await api.get("/email/history", { params: { limit: 200 } });
      setItems(res.data.data || res.data);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  const exportCSV = async () => {
    const res = await api.get("/email/history/export", {
      params: { format: "csv" },
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(res.data);
    const a = document.createElement("a");
    a.href = url;
    a.download = "email_history.csv";
    a.click();
  };

  return (
    <div className="p-4 text-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Mail className="w-5 h-5 text-blue-400" />
          Email History
        </h2>
        <div className="flex gap-3">
          <button
            onClick={fetch}
            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm transition"
          >
            <RefreshCcw className="w-4 h-4" /> Refresh
          </button>
          <button
            onClick={exportCSV}
            className="flex items-center gap-1 bg-gray-700 hover:bg-gray-800 text-white px-3 py-1.5 rounded-lg text-sm transition"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
      ) : items.length === 0 ? (
        <div className="text-center text-gray-500">No email history found.</div>
      ) : (
        <div className="grid gap-4">
          {items.map((i) => (
            <div
              key={i._id}
              className="p-4 bg-gray-900/60 text-gray-100 rounded-2xl border border-gray-800 hover:border-gray-700 hover:shadow-lg transition"
            >
              <div className="flex justify-between items-start">
                <div className="max-w-[70%]">
                  <div className="text-sm text-gray-400">
                    To: <span className="font-medium text-gray-100">{i.to}</span>
                  </div>
                  <div className="text-base font-semibold mt-1">
                    {i.subject || "(No Subject)"}
                  </div>

                  <div className="text-xs text-gray-400 mt-1">
                    Template: {i.template?.name || "—"}
                  </div>

                  {i.previewUrl && (
                    <a
                      href={i.previewUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-blue-400 hover:underline mt-2 block"
                    >
                      View Preview →
                    </a>
                  )}

                  {i.error && (
                    <div className="flex items-center text-xs text-red-400 mt-2">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Error: {i.error}
                    </div>
                  )}
                </div>

                <div className="text-right text-sm">
                  <span
                    className={`inline-block px-2 py-1 text-xs rounded-full ${
                      i.status === "sent"
                        ? "bg-green-500/20 text-green-400"
                        : i.status === "failed"
                        ? "bg-red-500/20 text-red-400"
                        : "bg-gray-600/30 text-gray-300"
                    }`}
                  >
                    {i.status}
                  </span>
                  <div className="text-xs text-gray-400 mt-2">
                    Sent: {new Date(i.createdAt).toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-400">
                    Opened:{" "}
                    {i.openedAt ? new Date(i.openedAt).toLocaleString() : "—"}
                  </div>
                  <div className="text-xs text-gray-400">
                    Clicked:{" "}
                    {i.clickedAt ? new Date(i.clickedAt).toLocaleString() : "—"}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
