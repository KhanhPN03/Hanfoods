// Authentication middleware
const passport = require('passport');
const authenticate = require('../utils/authenticate');

// Check if user is authenticated via session or JWT
const isAuthenticated = (req, res, next) => {
  // First try session-based authentication
  if (req.isAuthenticated()) {
    return next();
  }
  
  // Then try JWT-based authentication
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) return next(err);
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'Unauthorized. Please login.' });
    }
    
    // Set user in request
    req.user = user;
    next();
  })(req, res, next);
};

const isAdmin = (req, res, next) => {
  // First check session-based authentication
  if (req.isAuthenticated() && req.user.role === 'admin') {
    return next();
  }
  
  // Then try JWT-based authentication
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) return next(err);
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied. Admin privileges required.' });
    }
    
    // Set user in request
    req.user = user;
    next();
  })(req, res, next);
};

const isUserOrAdmin = (req, res, next) => {
  // Try session-based auth first
  if (req.isAuthenticated()) {
    // If admin, allow access
    if (req.user.role === 'admin') {
      return next();
    }
    
    // If user is accessing their own data (checking userId in params or query)
    const userId = req.params.userId || req.query.userId;
    if (userId && userId.toString() === req.user._id.toString()) {
      return next();
    }
  }
  
  // Then try JWT-based authentication
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) return next(err);
    
    if (!user) {
      return res.status(403).json({ success: false, message: 'Access denied. Unauthorized.' });
    }
    
    // If admin, allow access
    if (user.role === 'admin') {
      req.user = user;
      return next();
    }
    
    // If user is accessing their own data
    const userId = req.params.userId || req.query.userId;
    if (userId && userId.toString() === user._id.toString()) {
      req.user = user;
      return next();
    }
    
    return res.status(403).json({ success: false, message: 'Access denied. Unauthorized.' });
  })(req, res, next);
};

module.exports = {
  isAuthenticated,
  isAdmin,
  isUserOrAdmin
};
