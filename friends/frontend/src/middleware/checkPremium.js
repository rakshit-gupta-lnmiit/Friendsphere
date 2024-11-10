// middleware/checkPremium.js
const Users = require('../models/user');

const checkPremium = async (req, res, next) => {
  try {
    const userId = req.user.id; // Assuming you have set req.user with the authenticated user
    const user = await Users.findById(userId);

    if (!user) {
      return res.status(404).json({ msg: "User not found." });
    }

    if (!user.isPremium) {
      return res.status(403).json({ msg: "Access denied. Upgrade to premium to post." });
    }

    next(); // Proceed to the next middleware/route handler if the user is premium
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

module.exports = checkPremium;
