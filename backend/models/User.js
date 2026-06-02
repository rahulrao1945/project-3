import mongoose from 'mongoose';
import { LocalModel } from '../config/localDBManager.js';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  wishlist: [{ type: String }], // Store product IDs as string for local DB compatibility
  contactInfo: {
    phone: { type: String, default: '' },
    whatsapp: { type: String, default: '' },
    telegram: { type: String, default: '' }
  },
  avatar: { type: String, default: '' }
}, { timestamps: true });

let MongoUser;
try {
  MongoUser = mongoose.models.User || mongoose.model('User', userSchema);
} catch (e) {
  // Graceful failure during non-mongo mode
}

const localModel = new LocalModel('users');

const User = {
  find: async (filter = {}) => {
    return global.isLocalDB ? localModel.find(filter) : MongoUser.find(filter);
  },
  findOne: async (filter = {}) => {
    return global.isLocalDB ? localModel.findOne(filter) : MongoUser.findOne(filter);
  },
  findById: async (id) => {
    return global.isLocalDB ? localModel.findById(id) : MongoUser.findById(id);
  },
  create: async (data) => {
    return global.isLocalDB ? localModel.create(data) : MongoUser.create(data);
  },
  findByIdAndUpdate: async (id, update, opts = { new: true }) => {
    return global.isLocalDB ? localModel.findByIdAndUpdate(id, update, opts) : MongoUser.findByIdAndUpdate(id, update, opts);
  },
  findByIdAndDelete: async (id) => {
    return global.isLocalDB ? localModel.findByIdAndDelete(id) : MongoUser.findByIdAndDelete(id);
  }
};

export default User;
export { MongoUser };
