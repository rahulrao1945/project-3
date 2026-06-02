import mongoose from 'mongoose';
import { LocalModel } from '../config/localDBManager.js';

const reviewSchema = new mongoose.Schema({
  reviewer: { type: String, required: true },
  reviewerName: { type: String, default: '' },
  seller: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

let MongoReview;
try {
  MongoReview = mongoose.models.Review || mongoose.model('Review', reviewSchema);
} catch (e) {
  // Graceful failure during non-mongo mode
}

const localModel = new LocalModel('reviews');

const Review = {
  find: async (filter = {}) => {
    return global.isLocalDB ? localModel.find(filter) : MongoReview.find(filter);
  },
  findOne: async (filter = {}) => {
    return global.isLocalDB ? localModel.findOne(filter) : MongoReview.findOne(filter);
  },
  findById: async (id) => {
    return global.isLocalDB ? localModel.findById(id) : MongoReview.findById(id);
  },
  create: async (data) => {
    return global.isLocalDB ? localModel.create(data) : MongoReview.create(data);
  },
  findByIdAndUpdate: async (id, update, opts = { new: true }) => {
    return global.isLocalDB ? localModel.findByIdAndUpdate(id, update, opts) : MongoReview.findByIdAndUpdate(id, update, opts);
  },
  findByIdAndDelete: async (id) => {
    return global.isLocalDB ? localModel.findByIdAndDelete(id) : MongoReview.findByIdAndDelete(id);
  }
};

export default Review;
export { MongoReview };
