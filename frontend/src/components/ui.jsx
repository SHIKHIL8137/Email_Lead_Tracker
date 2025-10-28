import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}) {
  const baseStyle =
    "px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-100 text-gray-800 hover:bg-gray-200",
    success: "bg-green-600 text-white hover:bg-green-700",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}

export function Input({ label, ...props }) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        {...props}
      />
    </div>
  );
}

export function Select({ label, children, ...props }) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <select
        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        {...props}
      >
        {children}
      </select>
    </div>
  );
}

export function TextArea({ label, ...props }) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <textarea
        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        {...props}
      />
    </div>
  );
}

export function Card({ children, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-lg shadow-sm p-6 ${className}`}
    >
      {children}
    </motion.div>
  );
}

export function Badge({ children, variant = "default" }) {
  const variants = {
    default: "bg-gray-100 text-gray-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    danger: "bg-red-100 text-red-800",
    info: "bg-blue-100 text-blue-800",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}
    >
      {children}
    </span>
  );
}


export function FormField({
  label,
  description,
  error,
  as = "input",
  rightSlot,
  children,
  className = "",
  containerClassName = "",
  ...props
}) {
  const baseInputClasses =
    "w-full bg-white border border-gray-300 text-gray-900 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400";

  const Element = as === "select" ? "select" : as === "textarea" ? "textarea" : "input";

  return (
    <div className={containerClassName}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}

      <motion.div
        initial={false}
        animate={{ boxShadow: error ? "0 0 0 3px rgba(239, 68, 68, 0.25)" : "0 0 0 0 rgba(0,0,0,0)" }}
        className={`relative ${error ? "ring-2 ring-red-500 ring-offset-0" : ""} rounded-lg`}
      >
        <Element className={`${baseInputClasses} ${className}`} {...props}>
          {as === "select" ? children : null}
        </Element>

        {rightSlot && (
          <div className="absolute inset-y-0 right-2 flex items-center">{rightSlot}</div>
        )}
      </motion.div>

      {description && !error && (
        <p className="mt-1 text-xs text-gray-500">{description}</p>
      )}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function Modal({ open, onClose, title, children, maxWidth = "max-w-2xl", className = "" }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
            className={`bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/50 w-full ${maxWidth} max-h-[90vh] overflow-y-auto ${className}`}
            onClick={(e) => e.stopPropagation()}
          >
            {(title || onClose) && (
              <div className="sticky top-0 bg-gray-800/95 backdrop-blur-xl border-b border-gray-700/50 p-6 flex justify-between items-center">
                <h3 className="text-2xl font-bold text-gray-100">{title}</h3>
                {onClose && (
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-200 transition-colors p-2 hover:bg-gray-700/50 rounded-lg"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            )}
            <div className="p-6">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Table({ columns = [], data = [], emptyText = "No data", className = "" }) {
  return (
    <div className={`overflow-hidden rounded-2xl border border-gray-200 ${className}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col) => (
                <th key={col.key || col.accessor} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-10 text-center text-sm text-gray-500">
                  {emptyText}
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr key={row.id || row._id || idx} className="hover:bg-gray-50 transition-colors">
                  {columns.map((col) => (
                    <td key={col.key || col.accessor} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {col.render ? col.render(row) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}