import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

// Set global flag for database state
global.isLocalDB = true;

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (mongoUri && mongoUri.trim() !== '') {
    try {
      console.log('🔌 Attempting connection to MongoDB...');
      const conn = await mongoose.connect(mongoUri);
      global.isLocalDB = false;
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      return conn;
    } catch (error) {
      console.error(`❌ MongoDB Connection Error: ${error.message}`);
      console.log('⚠️ Falling back to Local JSON database (local_db.json)...');
      initializeLocalDB();
    }
  } else {
    console.log('ℹ️ No MONGO_URI specified in env. Using Local JSON database (local_db.json)...');
    initializeLocalDB();
  }
};

const initializeLocalDB = () => {
  global.isLocalDB = true;
  const dbPath = path.resolve('local_db.json');
  
  if (!fs.existsSync(dbPath)) {
    const initialStructure = {
      users: [],
      products: [],
      messages: [],
      reviews: []
    };
    fs.writeFileSync(dbPath, JSON.stringify(initialStructure, null, 2), 'utf-8');
    console.log('📦 Created local database: local_db.json');
  } else {
    console.log('📦 Local database file found: local_db.json');
  }
};

export default connectDB;
