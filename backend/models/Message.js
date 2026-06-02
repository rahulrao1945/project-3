import mongoose from 'mongoose';
import { LocalModel } from '../config/localDBManager.js';

const messageSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  receiver: { type: String, required: true },
  senderName: { type: String, default: '' },
  receiverName: { type: String, default: '' },
  content: { type: String, required: true },
  roomId: { type: String, required: true }, // e.g. "userId1-userId2" sorted
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

let MongoMessage;
try {
  MongoMessage = mongoose.models.Message || mongoose.model('Message', messageSchema);
} catch (e) {
  // Graceful failure during non-mongo mode
}

const localModel = new LocalModel('messages');

const Message = {
  find: async (filter = {}) => {
    return global.isLocalDB ? localModel.find(filter) : MongoMessage.find(filter);
  },
  findOne: async (filter = {}) => {
    return global.isLocalDB ? localModel.findOne(filter) : MongoMessage.findOne(filter);
  },
  findById: async (id) => {
    return global.isLocalDB ? localModel.findById(id) : MongoMessage.findById(id);
  },
  create: async (data) => {
    return global.isLocalDB ? localModel.create(data) : MongoMessage.create(data);
  },
  findByIdAndUpdate: async (id, update, opts = { new: true }) => {
    return global.isLocalDB ? localModel.findByIdAndUpdate(id, update, opts) : MongoMessage.findByIdAndUpdate(id, update, opts);
  },
  findByIdAndDelete: async (id) => {
    return global.isLocalDB ? localModel.findByIdAndDelete(id) : MongoMessage.findByIdAndDelete(id);
  }
};

export default Message;
export { MongoMessage };
