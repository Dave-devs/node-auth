import mongoose from 'mongoose';
import config from '../utils/config';

export const connectDB = async () => {
  try {
    const connection = await mongoose.connect(config.mongoUrl!);
    console.log(`MongoDB Connected: ${connection.connection.host}`);
  } catch (error: any) {
    throw Error(`Database Connection Error: ${error.message}`);
    process.exit(1);
  }
};
