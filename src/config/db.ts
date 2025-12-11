import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const dbUrl = process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/cs-association';
    
    const conn = await mongoose.connect(dbUrl);

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    try {
      console.log("Attempting to drop old 'slug' index...");
      await mongoose.connection.collection('events').dropIndex('slug_1');
      console.log("✅ SUCCESS: Old 'slug' index dropped.");
    } catch (err: any) {
      if (err.code === 27) {
        console.log("ℹ️ Index 'slug_1' not found (already dropped).");
      } else {
        console.log("⚠️ Note: Could not drop index (might be already gone):", err.message);
      }
    }

  } catch (error) {
    console.error(`Error: ${error}`);
    process.exit(1);
  }
};

export default connectDB;