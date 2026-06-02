import Product from '../models/Product.js';
import User from '../models/User.js';

// @desc    Force delete a listing (Fake listing moderator)
// @route   DELETE /api/admin/products/:id
// @access  Private/Admin
export const deleteFakeListing = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product listing not found' });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Fake or inappropriate listing successfully removed by administrator' });
  } catch (error) {
    console.error('Admin delete listing error:', error);
    res.status(500).json({ message: 'Server error removing listing', error: error.message });
  }
};

// @desc    Get all users for administration
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    // Remove passwords before sending
    const sanitized = users.map(u => {
      const copy = { ...u };
      delete copy.password;
      return copy;
    });
    res.json(sanitized);
  } catch (error) {
    console.error('Admin get users error:', error);
    res.status(500).json({ message: 'Server error loading users list', error: error.message });
  }
};

// @desc    Ban and delete a user account
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User account not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Administrators cannot ban other administrators!' });
    }

    // 1. Delete all listings owned by this user
    const products = await Product.find({ seller: req.params.id });
    for (const prod of products) {
      await Product.findByIdAndDelete(prod._id);
    }

    // 2. Delete the user
    await User.findByIdAndDelete(req.params.id);

    res.json({ message: 'Student account banned and all associated listings removed' });
  } catch (error) {
    console.error('Admin delete user error:', error);
    res.status(500).json({ message: 'Server error banning student account', error: error.message });
  }
};
