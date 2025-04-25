import jwt from "jsonwebtoken";

const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET_KEY, 
    { expiresIn: "1h" } 
  );
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET_KEY);
  } catch (error) {
    return null;
  }
};

export { generateToken, verifyToken };
