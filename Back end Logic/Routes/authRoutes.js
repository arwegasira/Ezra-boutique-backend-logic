
const express = require('express');
const router = express.Router();
const{register,login,verifyAccount,logout,forgotPassword,resetPassword} = require('../Controller/authController');
const authenticationMiddleware = require('../Middleware/authentication');
router.post('/register', register)
router.post('/login', login)
router.post('/verify-Account', verifyAccount);
router.delete('/logout', authenticationMiddleware,logout)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPassword);

module.exports = router;