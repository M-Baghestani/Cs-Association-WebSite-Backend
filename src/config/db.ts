import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const dbUrl = process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/cs-association';
    
    const conn = await mongoose.connect(dbUrl);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error}`);
    process.exit(1);
  }
};

export default connectDB;