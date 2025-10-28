import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../lib/api";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

export default function Dashboard() {
  const [stats, setStats] = useState({ leadsByStatus: {}, totalLeads: 0, totals: { total: 0, opened: 0, clicked: 0 }, emailsPerDay: {} });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const sRes = await api.get("/stats");
      setStats(sRes.data || {});
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const byStatus = () => {
    return Object.entries(stats.leadsByStatus || {}).map(([name, value]) => ({ name, value }));
  };

  const COLORS = ["#3B82F6", "#8B5CF6", "#EC4899", "#10B981", "#F59E0B"];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >

      <motion.div variants={itemVariants}>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
          Dashboard
        </h1>
        <p className="text-gray-400">Welcome back! Here's your overview</p>
      </motion.div>


      <motion.div 
        variants={containerVariants}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <motion.div 
          variants={itemVariants}
          whileHover={{ scale: 1.02, y: -5 }}
          className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-blue-500/20 hover:border-blue-500/40 transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-medium text-blue-400">Total Leads</div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <div className="text-4xl font-bold text-gray-100">{stats.totalLeads || 0}</div>
          <div className="text-xs text-gray-400 mt-2">Active in pipeline</div>
        </motion.div>

        <motion.div 
          variants={itemVariants}
          whileHover={{ scale: 1.02, y: -5 }}
          className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-purple-500/20 hover:border-purple-500/40 transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-medium text-purple-400">Total Emails</div>
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <div className="text-4xl font-bold text-gray-100">{stats.totals?.total || 0}</div>
          <div className="text-xs text-gray-400 mt-2">Sent in last period</div>
        </motion.div>

        <motion.div 
          variants={itemVariants}
          whileHover={{ scale: 1.02, y: -5 }}
          className="bg-gradient-to-br from-pink-500/10 to-pink-600/10 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-pink-500/20 hover:border-pink-500/40 transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-medium text-pink-400">Clicks</div>
            <div className="w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="text-4xl font-bold text-gray-100">
            {stats.totals?.clicked || 0}
          </div>
          <div className="text-xs text-gray-400 mt-2">
            {stats.totals?.total > 0 ? `${Math.round((stats.totals.clicked / stats.totals.total) * 100)}% click rate` : "No data yet"}
          </div>
        </motion.div>
      </motion.div>


      <motion.div 
        variants={itemVariants}
        className="bg-gray-800/50 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-gray-700/50"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-100">Leads by Status</h3>
            <p className="text-gray-400 text-sm mt-1">Distribution across pipeline stages</p>
          </div>
        </div>

        {byStatus().length > 0 ? (
          <div style={{ height: 350 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={byStatus()}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={true}
                >
                  {byStatus().map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]}
                      strokeWidth={2}
                      stroke="#1f2937"
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '0.5rem',
                    color: '#f3f4f6'
                  }}
                />
                <Legend 
                  wrapperStyle={{
                    paddingTop: '20px'
                  }}
                  iconType="circle"
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-lg font-medium">No lead data available</p>
            <p className="text-sm">Start adding leads to see the distribution</p>
          </div>
        )}
      </motion.div>

      <motion.div 
        variants={itemVariants}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {byStatus().map((status, index) => (
          <div
            key={status.name}
            className="bg-gray-800/30 backdrop-blur-xl p-4 rounded-xl border border-gray-700/30"
          >
            <div className="flex items-center space-x-3">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <div className="flex-1">
                <div className="text-xs text-gray-400">{status.name}</div>
                <div className="text-xl font-bold text-gray-100">{status.value}</div>
              </div>
            </div>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}