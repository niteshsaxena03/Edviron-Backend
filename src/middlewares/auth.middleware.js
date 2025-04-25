import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.utils.js";
import asyncHandler from "../utils/AsyncHandler.utils.js";

// Protect routes - authenticate user
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next(new ApiError(401, "Not authorized, no token provided"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    if (decoded.exp && decoded.exp < Date.now() / 1000) {
      return next(new ApiError(401, "Token has expired, please login again"));
    }

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return next(new ApiError(401, "User not found or deactivated"));
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    if (error.name === "JsonWebTokenError") {
      return next(new ApiError(401, "Invalid token, please login again"));
    }
    if (error.name === "TokenExpiredError") {
      return next(new ApiError(401, "Token has expired, please login again"));
    }
    return next(new ApiError(401, "Authentication failed"));
  }
});


const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, "Authentication required"));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          `User role ${req.user.role} is not authorized to access this resource`
        )
      );
    }

    next();
  };
};

export { protect, authorize };
