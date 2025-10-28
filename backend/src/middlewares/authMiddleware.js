import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || "secretkey";

export const authenticate = async (req, res, next) => {
  try {
    const bearerToken = req.headers.authorization?.split(" ")[1];
    const cookieToken = req.cookies?.token;
    const token = bearerToken || cookieToken;
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(401).json({ message: "Invalid token" });

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: "Unauthorized", error: err.message });
  }
};
