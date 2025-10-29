import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { FormField, Button } from "../components/ui";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false); // ✅ added loading state
  const auth = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const errors = {};
    if (!name.trim()) errors.name = "Full name is required";
    if (!email) errors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errors.email = "Enter a valid email";
    if (!password) errors.password = "Password is required";
    else if (password.length < 8) errors.password = "At least 8 characters";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr(null);
    if (!validate()) return;

    setLoading(true); // ✅ start loading
    try {
      await auth.register(name, email, password);
      navigate("/");
    } catch (err) {
      setErr(err.response?.data?.message || "Failed to register");
    } finally {
      setLoading(false); // ✅ stop loading
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <div className="bg-gray-800/50 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-gray-700/50">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              Create Account
            </h2>
            <p className="text-gray-400 mt-2">Join us today</p>
          </div>

          {err && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-6"
            >
              {err}
            </motion.div>
          )}

          <form onSubmit={submit} className="space-y-6">
            <FormField
              label="Full Name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="bg-gray-900/50 border border-gray-600 text-gray-100 placeholder-gray-500"
              error={fieldErrors.name}
              onBlur={validate}
            />

            <FormField
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-gray-900/50 border border-gray-600 text-gray-100 placeholder-gray-500"
              error={fieldErrors.email}
              onBlur={validate}
            />

            <FormField
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              description="Must be at least 8 characters"
              className="bg-gray-900/50 border border-gray-600 text-gray-100 placeholder-gray-500"
              error={fieldErrors.password}
              onBlur={validate}
            />

            <Button
              type="submit"
              disabled={loading} // ✅ disable button during loading
              className={`w-full font-semibold px-6 py-3 rounded-lg shadow-lg transition-all ${
                loading
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-purple-500/50"
              }`}
            >
              {loading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-center space-x-2"
                >
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Creating...</span>
                </motion.div>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
