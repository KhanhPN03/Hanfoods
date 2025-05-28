// Authentication utilities for JWT token generation and verification
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/Account');
const jwt = require('jsonwebtoken');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

passport.use(new LocalStrategy({
    usernameField: 'email',
    usernameQueryFields: ['email']
  }, User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.getToken = (user) => {    
    return jwt.sign(user, process.env.JWT_SECRET || 'your-fallback-secret-key', {
        expiresIn: 3600
    }) // get token
}

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET || 'your-fallback-secret-key'
}

exports.jwtPassport = passport.use(new JwtStrategy(opts, async (jwt_payload, done) => {
    try {
        const user = await User.findById(jwt_payload._id);
        if(user) {
            return done(null, user);
        } else {
            return done(null, false);
        }
    } catch (error) {
        return done(error, false);
    }
}));

exports.verifyUser = passport.authenticate('jwt', {session: false}); // thông tin đc lưu trữ dạng token không cần lưu trữ trên server

exports.refreshToken = (token) => {
    try {
        // Verify the old token (ignore expiration)
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-fallback-secret-key', { ignoreExpiration: true });
        
        // Create new token with same payload but fresh expiration
        const newToken = jwt.sign(
            { _id: decoded._id }, 
            process.env.JWT_SECRET || 'your-fallback-secret-key', 
            { expiresIn: 3600 }
        );
        
        return newToken;
    } catch (error) {
        throw new Error('Invalid token');
    }
}
