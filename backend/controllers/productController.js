import Product from '../models/Product.js';
import User from '../models/User.js';
import Review from '../models/Review.js';
import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';

// @desc    Create a new product listing
// @route   POST /api/products
// @access  Private
export const createProduct = async (req, res) => {
  try {
    const { title, description, price, condition, category, isKit } = req.body;

    if (!title || !description || !price || !category) {
      return res.status(400).json({ message: 'Title, description, price, and category are required' });
    }

    let imageUrls = [];

    // Check if files were uploaded via Multer
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        if (isCloudinaryConfigured) {
          try {
            // Upload to Cloudinary
            const result = await cloudinary.uploader.upload(file.path, {
              folder: 'campus_marketplace'
            });
            imageUrls.push(result.secure_url);
            // Clean up local temp file
            // fs.unlinkSync(file.path); (optional, keeping local disk copy as fallback is fine)
          } catch (uploadError) {
            console.error('Cloudinary upload failure, using local image instead:', uploadError);
            imageUrls.push(`/uploads/${file.filename}`);
          }
        } else {
          // Store local relative URL
          imageUrls.push(`/uploads/${file.filename}`);
        }
      }
    } else {
      // Default placeholder based on category
      imageUrls.push(`https://images.unsplash.com/photo-1517059224940-d4af9eec41b7?w=500&auto=format&fit=crop`);
    }

    const product = await Product.create({
      title,
      description,
      price: Number(price),
      condition: condition || 'Good',
      category,
      images: imageUrls,
      seller: req.user._id.toString(),
      sellerName: req.user.name,
      sellerEmail: req.user.email,
      isKit: isKit === 'true' || isKit === true,
      status: 'available',
      views: 0
    });

    res.status(201).json(product);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Server error creating product', error: error.message });
  }
};

// @desc    Get all products with filters
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const { search, category, condition, status, isKit, minPrice, maxPrice } = req.query;

    let products = [];
    
    // 1. Fetch all matching or base array
    if (global.isLocalDB) {
      products = await Product.find({});
    } else {
      // Direct Mongo Query (populate can be simulated or bypassed)
      products = await Product.find({});
    }

    // 2. Perform advanced javascript filters for unified execution in both JSON & Mongo modes
    let filtered = [...products];

    // Search query match (title/description)
    if (search && search.trim() !== '') {
      const q = search.toLowerCase();
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(q) || 
        p.description.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (category && category !== 'All') {
      filtered = filtered.filter(p => p.category === category);
    }

    // Condition filter
    if (condition && condition !== 'All') {
      filtered = filtered.filter(p => p.condition === condition);
    }

    // Status filter (available / sold / all)
    if (status) {
      if (status !== 'All') {
        filtered = filtered.filter(p => p.status === status);
      }
    } else {
      // Default to showing only available products if not admin / dashboard context
      filtered = filtered.filter(p => p.status === 'available');
    }

    // Kit filter
    if (isKit !== undefined && isKit !== '') {
      const targetIsKit = isKit === 'true';
      filtered = filtered.filter(p => p.isKit === targetIsKit);
    }

    // Price range filters
    if (minPrice) {
      filtered = filtered.filter(p => p.price >= Number(minPrice));
    }
    if (maxPrice) {
      filtered = filtered.filter(p => p.price <= Number(maxPrice));
    }

    // Sort by latest by default
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(filtered);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error retrieving listings', error: error.message });
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product listing not found' });
    }

    // Increment view count asynchronously
    const updatedViews = (product.views || 0) + 1;
    await Product.findByIdAndUpdate(req.params.id, { views: updatedViews });
    product.views = updatedViews;

    // Fetch seller contact ratings and profile
    const seller = await User.findById(product.seller);
    const reviews = await Review.find({ seller: product.seller });

    res.json({
      product,
      seller: seller ? {
        name: seller.name,
        email: seller.email,
        contactInfo: seller.contactInfo,
        avatar: seller.avatar,
        reviewsCount: reviews.length,
        averageRating: reviews.length > 0 
          ? Number((reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length).toFixed(1))
          : 5.0
      } : null
    });
  } catch (error) {
    console.error('Get single product error:', error);
    res.status(500).json({ message: 'Server error fetching product details', error: error.message });
  }
};

// @desc    Update product listing
// @route   PUT /api/products/:id
// @access  Private
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product listing not found' });
    }

    // Check ownership or admin status
    if (product.seller !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to modify this listing' });
    }

    const { title, description, price, condition, category, status, isKit } = req.body;

    const updatedData = {
      title: title || product.title,
      description: description || product.description,
      price: price !== undefined ? Number(price) : product.price,
      condition: condition || product.condition,
      category: category || product.category,
      status: status || product.status,
      isKit: isKit !== undefined ? (isKit === 'true' || isKit === true) : product.isKit
    };

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updatedData, { new: true });
    res.json(updatedProduct);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error updating product', error: error.message });
  }
};

// @desc    Delete product listing
// @route   DELETE /api/products/:id
// @access  Private
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product listing not found' });
    }

    // Check ownership or admin status
    if (product.seller !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this listing' });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Listing removed successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error removing listing', error: error.message });
  }
};

// @desc    Add review for a seller
// @route   POST /api/products/review
// @access  Private
export const addReview = async (req, res) => {
  try {
    const { sellerId, rating, comment } = req.body;

    if (!sellerId || !rating || !comment) {
      return res.status(400).json({ message: 'Seller ID, rating (1-5), and review text are required' });
    }

    if (sellerId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Students cannot review themselves!' });
    }

    // Check if reviewer already rated this seller (prevent review stuffing)
    const existingReviews = await Review.find({ seller: sellerId, reviewer: req.user._id.toString() });
    if (existingReviews.length > 0) {
      return res.status(400).json({ message: 'You have already reviewed this seller!' });
    }

    const review = await Review.create({
      reviewer: req.user._id.toString(),
      reviewerName: req.user.name,
      seller: sellerId,
      rating: Number(rating),
      comment
    });

    res.status(201).json(review);
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ message: 'Server error saving review', error: error.message });
  }
};

// @desc    Get reviews for a seller
// @route   GET /api/products/reviews/:sellerId
// @access  Public
export const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ seller: req.params.sellerId });
    res.json(reviews);
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ message: 'Server error fetching reviews', error: error.message });
  }
};

// @desc    Get AI-based product recommendations
// @route   GET /api/products/recommendations/:id
// @access  Public
export const getAIRecommendations = async (req, res) => {
  try {
    const activeProduct = await Product.findById(req.params.id);
    if (!activeProduct) {
      return res.status(404).json({ message: 'Active product not found' });
    }

    // AI recommendation algorithm (content similarity + price matching + category overlapping):
    // 1. Fetch other available items
    const allProducts = await Product.find({ status: 'available' });
    const pool = allProducts.filter(p => p._id.toString() !== activeProduct._id.toString());

    // 2. Score items based on criteria:
    //    - Same category: +50 points
    //    - Price difference is small (within 30% range): +30 points
    //    - Text title similarity overlap: +20 points
    const scoredList = pool.map(p => {
      let score = 0;

      // Category matching
      if (p.category === activeProduct.category) {
        score += 50;
      }

      // Price similarity score
      const priceDiffPct = Math.abs(p.price - activeProduct.price) / activeProduct.price;
      if (priceDiffPct <= 0.3) {
        score += 30; // close price
      } else if (priceDiffPct <= 0.6) {
        score += 15; // semi-close price
      }

      // Condition score matching
      if (p.condition === activeProduct.condition) {
        score += 10;
      }

      // Basic tag overlap matching
      const pWords = p.title.toLowerCase().split(/\s+/);
      const activeWords = activeProduct.title.toLowerCase().split(/\s+/);
      const matches = pWords.filter(w => w.length > 3 && activeWords.includes(w));
      score += matches.length * 10;

      return { product: p, score };
    });

    // Sort by score (highest first) and take top 4
    scoredList.sort((a, b) => b.score - a.score);
    const recommendations = scoredList.slice(0, 4).map(item => item.product);

    res.json(recommendations);
  } catch (error) {
    console.error('AI Recommendations error:', error);
    res.status(500).json({ message: 'Server error building recommendations', error: error.message });
  }
};
