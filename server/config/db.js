import mongoose from 'mongoose'

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
       console.log('No MONGODB_URI provided, skipping DB connection.');
       return;
    }
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('MongoDB connected')
  } catch (err) {
    console.error('MongoDB connection error:', err.message)
    // process.exit(1) // we don't exit to allow the app to run without DB in demo mode
  }
}
export default connectDB
