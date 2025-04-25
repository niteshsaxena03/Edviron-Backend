import mongoose from "mongoose";
import "dotenv/config";

const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is not defined");
    process.exit(1);
  }

  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}`
    );
    console.log(
      `\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`
    );
    return connectionInstance;
  } catch (error) {
    console.log("MONGODB connection FAILED ", error);
    throw error;
  }
};

export default connectDB;
