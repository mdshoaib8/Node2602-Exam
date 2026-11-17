const express = require('express');
const router = express.Router();
const {
    signUpController,
    signInController,
    profileController,
    emailVerifyController,
    resendEmailVerifyController,
    forgotPasswordController,
    resetPasswordController,
} = require('../../controllers/auth.controller');
const verifyJWT = require('../../middlewares/auth.middleware');

// http://localhost:3000/api/auth/signup
router.post('/signup', signUpController);
// http://localhost:3000/api/auth/signin
router.post('/signin', signInController);
// http://localhost:3000/api/auth/profile
router.get('/profile', verifyJWT, profileController);
// http://localhost:3000/api/auth/verify-email
router.post('/verify-email', emailVerifyController);
// http://localhost:3000/api/auth/resend-verify-email
router.post('/resend-verify-email', resendEmailVerifyController);
// http://localhost:3000/api/auth/forgot-password
router.post('/forgot-password', forgotPasswordController);
// http://localhost:3000/api/auth/reset-password
router.post('/reset-password', resetPasswordController);


module.exports = router;