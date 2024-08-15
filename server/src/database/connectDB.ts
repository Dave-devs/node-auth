import mongoose from 'mongoose';
import config from '../utils/config';

export const connectDB = async () => {
  try {
    const connection = await mongoose.connect(`${config.mongoUrl}`);
    console.log(`MongoDB Connected Successfully: ${connection.connection.host}`);
  } catch (error: any) {
    throw Error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};
