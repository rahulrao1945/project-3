import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'campus_components_marketplace_jwt_secret_key_2026');

      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({ message: 'User session expired or not found' });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('JWT verification error:', error);
      res.status(401).json({ message: 'Not authorized, token validation failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, token is missing' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Forbidden: Admin access only' });
  }
};

export { protect, admin };
