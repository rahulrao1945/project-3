import mongoose from 'mongoose';
import { LocalModel } from '../config/localDBManager.js';

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  condition: { type: String, enum: ['New', 'Good', 'Used'], default: 'Good' },
  category: { 
    type: String, 
    enum: [
      'Arduino & ESP Boards',
      'Drone Components',
      'Robotics Parts',
      'Sensors',
      'Batteries',
      'Motors & Drivers',
      'Tools',
      'Wires & Connectors',
      'Laptop Accessories',
      'Miscellaneous'
    ],
    default: 'Miscellaneous'
  },
  images: [{ type: String }],
  seller: { type: String, required: true }, // Store as string ID for compatibility
  sellerName: { type: String, default: '' },
  sellerEmail: { type: String, default: '' },
  status: { type: String, enum: ['available', 'sold'], default: 'available' },
  isKit: { type: Boolean, default: false },
  views: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

let MongoProduct;
try {
  MongoProduct = mongoose.models.Product || mongoose.model('Product', productSchema);
} catch (e) {
  // Graceful failure during non-mongo mode
}

const localModel = new LocalModel('products');

const Product = {
  find: async (filter = {}) => {
    return global.isLocalDB ? localModel.find(filter) : MongoProduct.find(filter);
  },
  findOne: async (filter = {}) => {
    return global.isLocalDB ? localModel.findOne(filter) : MongoProduct.findOne(filter);
  },
  findById: async (id) => {
    return global.isLocalDB ? localModel.findById(id) : MongoProduct.findById(id);
  },
  create: async (data) => {
    return global.isLocalDB ? localModel.create(data) : MongoProduct.create(data);
  },
  findByIdAndUpdate: async (id, update, opts = { new: true }) => {
    return global.isLocalDB ? localModel.findByIdAndUpdate(id, update, opts) : MongoProduct.findByIdAndUpdate(id, update, opts);
  },
  findByIdAndDelete: async (id) => {
    return global.isLocalDB ? localModel.findByIdAndDelete(id) : MongoProduct.findByIdAndDelete(id);
  }
};

export default Product;
export { MongoProduct };
