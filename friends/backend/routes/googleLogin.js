// routes/auth.js

const express = require('express');
const router = express.Router();
const { googleLogin } = require('../controllers/authController');

// POST route to handle Google login
router.post('/google-login', googleLogin);

module.exports = router;
