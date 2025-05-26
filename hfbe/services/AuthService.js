// Services related to authentication and user management
const Account = require('../models/Account');
const Address = require('../models/Address');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const { v4: uuidv4 } = require('uuid');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const AddressService = require('./AddressService');

class AuthService {
  constructor() {
    this.initializeGoogleStrategy();
  }
  initializeGoogleStrategy() {
    // Only initialize if environment variables are available
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      console.warn('Google OAuth credentials not found in environment variables. Google authentication will not work.');
      return; // Skip initialization if credentials are missing
    }
    
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: '/api/auth/google/callback',
          scope: ['profile', 'email'],
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            // Check if user already exists
            let user = await Account.findOne({ googleID: profile.id });

            if (!user) {
              // If user doesn't exist, create a new one
              const email = profile.emails[0].value;
              // Check if email is already registered without Google
              const existingUser = await Account.findOne({ email });

              if (existingUser) {
                // Link Google ID to existing account
                existingUser.googleID = profile.id;
                await existingUser.save();
                return done(null, existingUser);
              }

              // Create new user
              user = new Account({
                googleID: profile.id,
                email,
                username: email,
                accountCode: 'CUST-' + uuidv4().substring(0, 8).toUpperCase(),
                firstname: profile.name.givenName || '',
                lastname: profile.name.familyName || '',
                avatar: profile.photos[0].value,
                role: 'customer',
              });

              // Set a random password for the new user
              const randomPassword = Math.random().toString(36).slice(-8);
              await Account.register(user, randomPassword);
            }

            return done(null, user);
          } catch (err) {
            return done(err);
          }
        }
      )
    );
  }  async registerUser(userData) {
    try {
      // Check if user already exists
      const existingUser = await Account.findOne({ email: userData.email });
      if (existingUser) {
        throw new Error('Email already registered');
      }
      
      // Check if username already exists
      if (userData.username) {
        const existingUsername = await Account.findOne({ username: userData.username });
        if (existingUsername) {
          throw new Error('Username already taken');
        }
      }

      // Create accountCode
      const accountCode = 'CUST-' + uuidv4().substring(0, 8).toUpperCase();

      // Create new user with all possible fields
      const newUser = new Account({
        email: userData.email,
        username: userData.username || userData.email,
        accountCode,
        firstname: userData.firstname || '',
        lastname: userData.lastname || '',
        DOB: userData.DOB || null,
        gender: userData.gender || '',
        phone: userData.phone || '',
        role: 'customer',
      });

      // Register user with passport-local-mongoose
      await Account.register(newUser, userData.password);
      
      // Create address if address data is provided
      if (userData.addressData) {
        try {
          const addressData = {
            ...userData.addressData,
            userId: newUser._id
          };
          
          // Create address using AddressService
          const address = await AddressService.createAddress(newUser._id, addressData);
          
          // Update user account with the new address ID
          newUser.addressId = address._id;
          await newUser.save();
        } catch (addressError) {
          console.error('Error creating address during registration:', addressError);
          // Continue with registration even if address creation fails
        }
      }
      
      return newUser;
    } catch (error) {
      throw error;
    }
  }

  async loginUser(email, password) {
    return new Promise((resolve, reject) => {
      passport.authenticate('local', (err, user, info) => {
        if (err) return reject(err);
        if (!user) return reject(new Error(info.message || 'Invalid email or password'));
        return resolve(user);
      })({ body: { email, password } });
    });
  }

  async getUserById(userId) {
    try {
      const user = await Account.findById(userId).select('-salt -hash');
      if (!user) throw new Error('User not found');
      return user;
    } catch (error) {
      throw error;
    }
  }

  async updateUserProfile(userId, userData) {
    try {
      const user = await Account.findByIdAndUpdate(
        userId,
        {
          $set: {
            firstname: userData.firstname,
            lastname: userData.lastname,
            phone: userData.phone,
            DOB: userData.DOB,
            gender: userData.gender,
            avatar: userData.avatar || user.avatar,
          }
        },
        { new: true }
      ).select('-salt -hash');

      if (!user) throw new Error('User not found');
      return user;
    } catch (error) {
      throw error;
    }
  }

  async changePassword(userId, currentPassword, newPassword) {
    try {
      const user = await Account.findById(userId);
      if (!user) throw new Error('User not found');
      
      // Verify current password
      await user.authenticate(currentPassword);

      // Set the new password
      await user.setPassword(newPassword);
      await user.save();
      
      return true;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new AuthService();
