import express from 'express';
import { createProduct, getProducts, getProductById, updateProduct, deleteProduct, addReview, getReviews, getAIRecommendations } from '../controllers/productController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/', protect, upload.array('images', 5), createProduct);
router.get('/', getProducts);
router.get('/:id', getProductById);
router.put('/:id', protect, updateProduct);
router.delete('/:id', protect, deleteProduct);
router.post('/review', protect, addReview);
router.get('/reviews/:sellerId', getReviews);
router.get('/recommendations/:id', getAIRecommendations);

export default router;
