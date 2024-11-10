// server/controllers/authController.js

const Users = require("../models/userModel");
const jwt = require('jsonwebtoken');
// controllers/authController.js

const admin = require('firebase-admin'); // Make sure you have Firebase Admin SDK set up
const serviceAccount = require('./key.json'); // Update with the path to your JSON file

// Define the createAccessToken function
const createAccessToken = (payload) => {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1d",
  });
};

const createRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "30d",
  });
};

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
// Google login controller function
const googleLogin = async (req, res) => {
  try {
      const { uid, email, displayName, photoURL } = req.body; // Destructure the data

      // Check if the user exists in your database
      let user = await Users.findOne({ email });

      if (!user) {
          // If user doesn't exist, create one
          user = new Users({
              email,
              fullname: displayName,
              username:displayName,
              password:' ',
              avatar: photoURL, // Save the photo URL if you have a field for it in your User model
          });
          await user.save();
      }

      // Create access token
      const access_token = createAccessToken({ id: user._id });

      // Set refresh token in a cookie
      const refresh_token = createRefreshToken({ id: user._id }); // Ensure this function is defined

      res.cookie("refreshtoken", refresh_token, {
          httpOnly: true,
          path: "/api/refresh_token",
          sameSite: 'lax',
          maxAge: 30 * 24 * 60 * 60 * 1000, // validity of 30 days
      });

      res.json({
          msg: "Logged in Successfully!",
          access_token,
          user: {
              ...user._doc,
              password: "",
          },
      });
  } catch (err) {
      return res.status(500).json({ msg: err.message });
  }
};


module.exports = { googleLogin };
