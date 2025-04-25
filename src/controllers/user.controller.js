import { User } from "../models/user.model.js";
import { generateToken } from "../utils/jwt.utils.js";
import ApiResponse from "../utils/ApiResponse.utils.js";
import ApiError from "../utils/ApiError.utils.js";
import asyncHandler from "../utils/AsyncHandler.utils.js";

const registerUser = asyncHandler(async (req, res, next) => {
  try {
    const { username, email, password, role = "user" } = req.body;

    // Validate required fields
    if (!username || !email || !password) {
      return next(new ApiError(400, "Please provide all required fields"));
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return next(
        new ApiError(400, "User with this email or username already exists")
      );
    }

    // Create new user
    const newUser = new User({
      username,
      email,
      password,
      role,
    });

    await newUser.save();

    const token = generateToken(newUser._id, newUser.role);

    const response = new ApiResponse(201, "User registered successfully", {
      user: {
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      },
      token,
    });

    res.status(201).json(response);
  } catch (error) {
    console.error("Registration error:", error);
    next(new ApiError(500, "An error occurred during registration"));
  }
});

const loginUser = asyncHandler(async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new ApiError(400, "Please provide email and password"));
    }

    const user = await User.findOne({ email });
    if (!user) {
      return next(new ApiError(401, "Invalid email or password"));
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return next(new ApiError(401, "Invalid email or password"));
    }

    const token = generateToken(user._id, user.role);

    const response = new ApiResponse(200, "User logged in successfully", {
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      token,
    });

    res.status(200).json(response);
  } catch (error) {
    console.error("Login error:", error);
    next(new ApiError(500, "An error occurred during login"));
  }
});

const getUserProfile = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return next(new ApiError(404, "User not found"));
    }

    const response = new ApiResponse(
      200,
      "User profile retrieved successfully",
      { user }
    );
    res.status(200).json(response);
  } catch (error) {
    console.error("Profile retrieval error:", error);
    next(new ApiError(500, "An error occurred while retrieving user profile"));
  }
});

export { loginUser, registerUser, getUserProfile };
