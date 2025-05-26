// Authentication controller
const AuthService = require('../services/AuthService');
const authenticate = require('../utils/authenticate');
const passport = require('passport');

class AuthController {
  // Register a new user  async register(req, res) {
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
        addressData 
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
        addressData
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
    // Đăng nhập sử dụng passport-local
    passport.authenticate('local', (err, user, info) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ success: false, message: info && info.message ? info.message : 'Invalid email or password' });
      }
      req.logIn(user, (err) => {
        if (err) return next(err);
        // Tạo JWT token
        const token = authenticate.getToken({ _id: user._id });
        // Lưu token vào session để tránh đăng nhập lại nhiều lần
        req.session.token = token;
        // Chuyển user mongoose doc về object thường nếu cần
        const userObj = user.toObject ? user.toObject() : user;
        // Loại bỏ các trường nhạy cảm
        const { isDeleted, salt, hash, createdAt, updatedAt, ...rest } = userObj;
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json({
          success: true,
          token: token,
          user: rest,
          status: "You are successfully logged in!",
        });
      });
    })(req, res, next);
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
}

module.exports = new AuthController();
