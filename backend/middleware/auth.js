// ✅ server/middleware/auth.js
import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({ success: false, message: "No token provided" });

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ No role restriction — both admin and user can pass
    req.user = decoded;
    next();
  } catch (err) {
    console.error("verifyToken error:", err);
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};
