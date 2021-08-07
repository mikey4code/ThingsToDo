const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');
const users = require('../controllers/users');
const { isLoggedIn, isAuthor, validateUser } = require('../middleware');

router.route('/register')
    .get(users.renderRegister)
    .post(catchAsync(users.register));

router.route('/login')
    .get(users.renderLogin)
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login)

router.get('/logout', users.logout)

router.route('/users/:user_id')
    .get(catchAsync(users.profile))

router.route('/:user_id')
    .put(isLoggedIn, validateUser, catchAsync(users.updateProfile))

router.get('/users/:user_id/useredit', isLoggedIn, catchAsync(users.renderEdit))

module.exports = router;