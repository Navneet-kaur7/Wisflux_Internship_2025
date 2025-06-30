const jwt = require("jsonwebtoken");
const User = require("../model/User/User");

const isLoggin = async (req, res, next) => {
  try {
    // Check if authorization header exists
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        status: "failed",
        message: "No authorization header provided"
      });
    }

    // Extract token
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        status: "failed",
        message: "No token provided"
      });
    }

    // Check if JWT_KEY exists
    if (!process.env.JWT_KEY) {
      console.error("JWT_KEY environment variable is not set!");
      return res.status(500).json({
        status: "error",
        message: "Server configuration error"
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    
    // Extract user ID from token
    const userId = decoded?.user?.id || decoded?.id;
    if (!userId) {
      return res.status(401).json({
        status: "failed",
        message: "Invalid token structure"
      });
    }

    // Find user
    const user = await User.findById(userId).select("username email role _id");
    if (!user) {
      return res.status(401).json({
        status: "failed",
        message: "User not found"
      });
    }

    // Attach user to request
    req.userAuth = user;
    next();

  } catch (error) {
    console.error("Authentication error:", error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: "failed",
        message: "Invalid token"
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: "failed",
        message: "Token expired"
      });
    }

    return res.status(500).json({
      status: "error",
      message: "Authentication failed"
    });
  }
};

module.exports = isLoggin;