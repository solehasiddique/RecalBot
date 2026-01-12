import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    const sessionId = req.cookies.sessionId;

    if (!token || !sessionId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId);
    if (!user || user.sessionId !== sessionId) {
      return res.status(401).json({ message: "Session invalid" });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Authentication failed" });
  }
};
