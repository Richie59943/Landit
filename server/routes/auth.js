const express = require('express'); // Import Express
const {
    registerUser,
    loginUser,
    requestPasswordReset,
    verifyPasswordResetToken,
    resetPassword
} = require('../controllers/authController'); // imports the controller function within auth

const router = express.Router(); // Create a router object

// Auth routes
router.post('/register', registerUser); // when POST /register is called use registerUser()
router.post('/login', loginUser); // when POST /login is called use loginUser()
router.post('/forgot-password', requestPasswordReset);
router.get('/reset-password/:token', verifyPasswordResetToken);
router.post('/reset-password/:token', resetPassword);

module.exports = router; // Export the router to use it elsewhere
