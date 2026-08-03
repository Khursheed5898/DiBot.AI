import mongoose from 'mongoose'

// Disable buffering so that database errors are thrown immediately
// mongoose.set('bufferCommands', false);

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!uri) {
       console.log('❌ No MongoDB connection string provided, skipping DB connection.');
       return;
    }

    console.log('⏳ Attempting to connect to MongoDB Atlas...');
    
    // Setting a timeout to avoid infinite buffering
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, 
    });

    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    if (err.message.includes('IP that isn\'t whitelisted')) {
      console.error('\n⚠️  ACTION REQUIRED: Your IP address is not whitelisted in MongoDB Atlas.');
      console.error('Please go to MongoDB Atlas -> Network Access -> Add IP Address and add your current IP or 0.0.0.0/0 (not recommended for production).\n');
    }
  }
};
export default connectDB
