// Authentication controller
const AuthService = require('../services/AuthService');
const authenticate = require('../utils/authenticate');
const passport = require('passport');

class AuthController {  // Register a new user
  async register(req, res) {
    try {
      console.log('Register request received:', JSON.stringify({
        headers: req.headers,
        body: req.body
      }, null, 2));
      
      const { 
        email, 
        username, 
        password, 
        firstname, 
        lastname, 
        DOB, 
        gender, 
        phone,
        address 
      } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required' });
      }
      
      const newUser = await AuthService.registerUser({
        email,
        username,
        password,
        firstname,
        lastname,
        DOB,
        gender,
        phone,
        address
      });
      
      // Generate JWT token for the new user
      const token = authenticate.getToken({ _id: newUser._id });
      
      // Convert mongoose document to plain object if needed
      const userObj = newUser.toObject ? newUser.toObject() : newUser;
      
      // Filter out sensitive information
      const { isDeleted, salt, hash, createdAt, updatedAt, ...rest } = userObj;
      
      console.log('User registered successfully:', newUser);
      
      // Return response with token
      res.statusCode = 201;
      res.setHeader("Content-Type", "application/json");
      return res.json({
        success: true,
        token: token,
        user: rest,
        status: "User registered successfully"
      });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }
  // Login user
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email and password are required' 
        });
      }
        // Find user by email
      const Account = require('../models/Account');
      const user = await Account.findOne({ email: email });
      
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid email or password' 
        });
      }
      
      // Verify password using passport-local-mongoose method
      try {
        const isValidPassword = await new Promise((resolve) => {
          // Set a timeout to prevent hanging
          const timeout = setTimeout(() => {
            resolve(false);
          }, 5000); // 5 second timeout
          
          user.authenticate(password, (err, authenticatedUser, info) => {
            clearTimeout(timeout);
            if (err) {
              console.error('Authentication error:', err);
              resolve(false);
            } else {
              resolve(!!authenticatedUser);
            }
          });
        });
        
        if (!isValidPassword) {
          return res.status(401).json({ 
            success: false, 
            message: 'Invalid email or password' 
          });
        }
      } catch (authError) {
        console.error('Password verification failed:', authError);
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid email or password' 
        });
      }
      
      // Generate JWT token
      const token = authenticate.getToken({ _id: user._id });
      
      // Convert user to plain object and remove sensitive fields
      const userObj = user.toObject();
      const { salt, hash, createdAt, updatedAt, ...rest } = userObj;
      
      res.json({
        success: true,
        token: token,
        user: rest,
        status: "You are successfully logged in!",
      });
      
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  }

  // Google OAuth login
  googleLogin(req, res) {
    // Handled by passport
  }

  // Google OAuth callback
  googleCallback(req, res) {
    // Redirect to frontend with user info
    const user = req.user;
    const redirectUrl = `${process.env.CLIENT_URL}/auth/success?userId=${user._id}`;
    return res.redirect(redirectUrl);
  }

  // Logout user
  logout(req, res) {
    req.logout(function(err) {
      if (err) return res.status(500).json({ success: false, message: 'Logout failed' });
      
      res.status(200).json({ success: true, message: 'Logged out successfully' });
    });
  }

  // Get current user
  getCurrentUser(req, res) {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    
    return res.status(200).json({
      success: true,
      user: {
        _id: req.user._id,
        email: req.user.email,
        firstname: req.user.firstname,
        lastname: req.user.lastname,
        role: req.user.role,
        accountCode: req.user.accountCode,
        avatar: req.user.avatar,
        phone: req.user.phone,
        DOB: req.user.DOB,
        gender: req.user.gender
      }
    });
  }

  // Update user profile
  async updateProfile(req, res) {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }
      
      const userId = req.user._id;
      const updatedUser = await AuthService.updateUserProfile(userId, req.body);
      
      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        user: updatedUser
      });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }
  // Change password
  async changePassword(req, res) {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }
      
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ success: false, message: 'Current and new passwords are required' });
      }
      
      const userId = req.user._id;
      await AuthService.changePassword(userId, currentPassword, newPassword);
      
      return res.status(200).json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  // Refresh token
  async refreshToken(req, res) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '') || req.body.token;
      
      if (!token) {
        return res.status(401).json({ success: false, message: 'No token provided' });
      }
      
      // Verify and generate new token
      const newToken = authenticate.refreshToken(token);
      
      return res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        token: newToken
      });
    } catch (error) {
      return res.status(401).json({ success: false, message: error.message });
    }
  }
}

module.exports = new AuthController();
