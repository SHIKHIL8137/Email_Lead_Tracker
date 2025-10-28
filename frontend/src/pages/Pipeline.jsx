import React, { useEffect, useState } from "react";
import api from "../lib/api";

const STATUSES = [
  "New",
  "Contacted",
  "Qualified",
  "Proposal",
  "Negotiation",
  "Converted",
  "Lost",
];

export default function Pipeline() {
  const [loading, setLoading] = useState(true);
  const [columns, setColumns] = useState({});
  const [pagination, setPagination] = useState(null);
  const [stats, setStats] = useState(null);
  const [dragOverStatus, setDragOverStatus] = useState(null);
  const [draggingId, setDraggingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    fetchLeads();
  }, [currentPage]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/leads?page=${currentPage}&limit=${limit}`);
      const { leads = [], pagination, stats } = res.data;

      const grouped = leads.reduce((acc, lead) => {
        const status = lead.status || "New";
        if (!acc[status]) acc[status] = [];
        acc[status].push(lead);
        return acc;
      }, {});

      STATUSES.forEach((status) => {
        if (!grouped[status]) grouped[status] = [];
      });

      setColumns(grouped);
      setPagination(pagination);
      setStats(stats);
    } catch (err) {
      console.error("❌ Failed to fetch leads:", err);
    } finally {
      setLoading(false);
    }
  };

  const startDrag = (e, leadId, fromStatus) => {
    setDraggingId(leadId);
    e.dataTransfer.setData("text/plain", JSON.stringify({ leadId, fromStatus }));
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = async (e, toStatus) => {
    e.preventDefault();
    setDragOverStatus(null);
    setDraggingId(null);

    const { leadId, fromStatus } = JSON.parse(e.dataTransfer.getData("text/plain"));
    if (fromStatus === toStatus) return;

    try {
      await api.put(`/leads/${leadId}`, { status: toStatus });
      setColumns((prev) => {
        const lead = prev[fromStatus].find((l) => l._id === leadId);
        return {
          ...prev,
          [fromStatus]: prev[fromStatus].filter((l) => l._id !== leadId),
          [toStatus]: [...prev[toStatus], { ...lead, status: toStatus }],
        };
      });
    } catch (err) {
      console.error("❌ Failed to update lead:", err);
      fetchLeads();
    }
  };

  const handlePrevPage = () => {
    if (pagination?.currentPage > 1) setCurrentPage((p) => p - 1);
  };

  const handleNextPage = () => {
    if (pagination?.currentPage < pagination?.pages) setCurrentPage((p) => p + 1);
  };

  return (
    <div className="h-full flex flex-col bg-gray-900/60 text-gray-100">
      <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800 shadow-sm">
        <h2 className="text-xl font-semibold text-white">Lead Pipeline</h2>
        <button
          onClick={fetchLeads}
          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition"
        >
          Refresh
        </button>
      </div>

      {stats && (
        <div className="flex justify-around p-3 bg-gray-800 border-b border-gray-700 text-sm">
          <div>Total Leads: <b>{stats.totalLeads}</b></div>
          <div>Qualified: <b>{stats.byStatus?.Qualified || 0}</b></div>
          <div>Website Leads: <b>{stats.bySource?.Website || 0}</b></div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center flex-1">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto p-4">
          <div className="flex gap-4 min-w-[1000px]">
            {STATUSES.map((status) => (
              <div
                key={status}
                className={`flex-1 flex flex-col bg-gray-800/70 rounded-lg ${
                  dragOverStatus === status
                    ? "ring-2 ring-blue-400 bg-blue-900/30"
                    : ""
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverStatus(status);
                }}
                onDragLeave={() => setDragOverStatus(null)}
                onDrop={(e) => handleDrop(e, status)}
              >
                <div className="p-3 border-b border-gray-700 bg-gray-800 rounded-t-lg flex justify-between items-center">
                  <h3 className="font-medium text-gray-100">{status}</h3>
                  <span className="bg-gray-700 text-gray-200 px-2 py-1 rounded-full text-xs">
                    {(columns[status] || []).length}
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                  {(columns[status] || []).map((lead) => (
                    <div
                      key={lead._id}
                      draggable
                      onDragStart={(e) => startDrag(e, lead._id, status)}
                      className={`bg-gray-700 p-3 rounded-lg shadow-sm border border-gray-600 cursor-move ${
                        draggingId === lead._id ? "opacity-50" : ""
                      } hover:shadow-md transition`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-medium text-gray-50">{lead.name}</h4>
                        <span className="text-xs text-gray-400">
                          {new Date(lead.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-sm text-gray-300">{lead.email}</div>
                      {lead.company && (
                        <div className="text-xs text-gray-400 mt-1">{lead.company}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {pagination && (
        <div className="p-3 border-t border-gray-700 bg-gray-800 flex justify-center items-center gap-3 text-sm">
          <button
            disabled={pagination.currentPage === 1}
            onClick={handlePrevPage}
            className={`px-3 py-1 rounded ${
              pagination.currentPage === 1
                ? "bg-gray-700 text-gray-400"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            Prev
          </button>
          <span>
            Page {pagination.currentPage} of {pagination.pages}
          </span>
          <button
            disabled={pagination.currentPage === pagination.pages}
            onClick={handleNextPage}
            className={`px-3 py-1 rounded ${
              pagination.currentPage === pagination.pages
                ? "bg-gray-700 text-gray-400"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
