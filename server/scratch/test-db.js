import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const uri = process.env.MONGODB_URI;
console.log('Testing connection to:', uri ? uri.substring(0, 20) + '...' : 'NULL');

if (!uri) {
    console.error('MONGODB_URI is not defined in .env');
    process.exit(1);
}

mongoose.connect(uri, { 
    serverSelectionTimeoutMS: 5000, // 5 seconds timeout
})
.then(() => {
    console.log('SUCCESS: Connected to MongoDB');
    process.exit(0);
})
.catch(err => {
    console.error('FAILURE: Could not connect to MongoDB');
    console.error(err);
    process.exit(1);
});
