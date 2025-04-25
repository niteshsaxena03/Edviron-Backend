import { User } from "../models/user.model.js";
import { generateToken } from "../utils/jwt.utils.js";
import ApiResponse from "../utils/ApiResponse.utils.js";
import ApiError from "../utils/ApiError.utils.js";

const registerUser = async (req, res, next) => {
  const { username, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new ApiError(400, "User already exists"));
  }

  const newUser = new User({
    username,
    email,
    password,
  });

  await newUser.save();

  const token = generateToken(newUser._id, newUser.role);

  const response = new ApiResponse(201, "User registered successfully", {
    token,
  });
  res.status(201).json(response);
};

const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return next(new ApiError(400, "Invalid email or password"));
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return next(new ApiError(400, "Invalid email or password"));
  }

  const token = generateToken(user._id, user.role);

  const response = new ApiResponse(200, "User logged in successfully", {
    token,
  });
  res.status(200).json(response);
};

export { loginUser, registerUser };
