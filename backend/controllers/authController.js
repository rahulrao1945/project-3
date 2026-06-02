import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Helper to sign JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'campus_components_marketplace_jwt_secret_key_2026', {
    expiresIn: '30d'
  });
};

// @desc    Register a new student
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, whatsapp, telegram } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email and password' });
    }

    // College Email Validation Check
    // Standard college emails end with .edu, .ac.in, or similar student domains
    const collegeEmailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(edu|ac\.[a-z]{2,3}|org)$/;
    if (!collegeEmailRegex.test(email.toLowerCase())) {
      return res.status(400).json({ 
        message: 'Invalid email. Registration is restricted to verified student emails ending with .edu, .ac.*, or .org college domains.' 
      });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Initial role selection
    // First user can be admin for demonstration purposes, else regular 'student'
    const totalUsers = await User.find({});
    const role = totalUsers.length === 0 ? 'admin' : 'student';

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      contactInfo: {
        phone: phone || '',
        whatsapp: whatsapp || '',
        telegram: telegram || ''
      },
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${name}`
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        contactInfo: user.contactInfo,
        avatar: user.avatar,
        wishlist: user.wishlist || [],
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      contactInfo: user.contactInfo,
      avatar: user.avatar,
      wishlist: user.wishlist || [],
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        contactInfo: user.contactInfo,
        avatar: user.avatar,
        wishlist: user.wishlist || []
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
      }
      user.contactInfo = {
        phone: req.body.phone !== undefined ? req.body.phone : user.contactInfo.phone,
        whatsapp: req.body.whatsapp !== undefined ? req.body.whatsapp : user.contactInfo.whatsapp,
        telegram: req.body.telegram !== undefined ? req.body.telegram : user.contactInfo.telegram
      };
      if (req.body.avatar) {
        user.avatar = req.body.avatar;
      }

      // Handle mongoose vs local database update syntax
      let updatedUser;
      if (global.isLocalDB) {
        updatedUser = await User.findByIdAndUpdate(user._id, user);
      } else {
        // Mongoose save
        const savedUser = await MongoUser.findById(user._id);
        savedUser.name = user.name;
        savedUser.password = user.password;
        savedUser.contactInfo = user.contactInfo;
        savedUser.avatar = user.avatar;
        await savedUser.save();
        updatedUser = savedUser;
      }

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        contactInfo: updatedUser.contactInfo,
        avatar: updatedUser.avatar,
        wishlist: updatedUser.wishlist || []
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Toggle wishlist item
// @route   POST /api/auth/wishlist
// @access  Private
export const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const wishlist = user.wishlist || [];
    const isWishlisted = wishlist.includes(productId);

    let updateQuery;
    if (isWishlisted) {
      updateQuery = global.isLocalDB 
        ? { $pull: { wishlist: productId } } 
        : { $pull: { wishlist: productId } };
    } else {
      updateQuery = global.isLocalDB 
        ? { $push: { wishlist: productId } } 
        : { $push: { wishlist: productId } };
    }

    const updatedUser = await User.findByIdAndUpdate(user._id, updateQuery, { new: true });

    res.json({
      message: isWishlisted ? 'Removed from wishlist' : 'Added to wishlist',
      wishlist: updatedUser.wishlist || []
    });
  } catch (error) {
    console.error('Wishlist error:', error);
    res.status(500).json({ message: 'Server error modifying wishlist', error: error.message });
  }
};
