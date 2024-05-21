const express = require('express');
const userController = require('../controllers/user.controllers');
const authController = require('../controllers/auth.controllers');

const router = express.Router();

router.post('/signup', userController.signup);
router.post('/verifyOtp', userController.verifyOtp);
router.post('/login', userController.loginUser);
router.get('/logout', userController.logout);
router.post('/verifyAccount', userController.verifyAccount);
router.post('/forgotPassword', userController.forgetPassword);
router.patch('/resetPassword/:token', userController.resetPassword);

router.patch('/updateMyPassword', authController.protect, userController.updatePassword);

router.get('/me', authController.protect, userController.getUser);
router.patch('/me', authController.protect, userController.updateUser);
router.delete('/me', authController.protect, userController.deleteUser);

router.get('/', authController.protect, userController.getAllUsers);

module.exports = router;
