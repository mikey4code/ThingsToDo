const { any } = require('joi');
const Activitie = require('../models/activitie');
const Review = require('../models/review');
const User = require('../models/user');

module.exports.renderRegister = (req, res) => {
    res.render('users/register');
}

module.exports.register = async (req, res, next) => {
    try {
        const { email, username, password, firstname, lastname, city, state } = req.body;
        const user = new User({ email, username, firstname, lastname, city, state });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to Yelp Camp!');
            res.redirect('/activities');
        })
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('register');
    }
}

module.exports.renderLogin = (req, res) => {
    res.render('users/login');
}

module.exports.login = (req, res) => {
    req.flash('success', 'welcome back!');
    const redirectUrl = req.session.returnTo || '/activities';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}

module.exports.logout = (req, res) => {
    req.logout();
    // req.session.destroy();
    req.flash('success', "Goodbye!");
    res.redirect('/activities');
}


module.exports.profile = async (req, res,) => {
    const user = await User.findById(req.params.user_id)
    const activities = await Activitie.find({ author: user }).populate('reviews');
    const reviews = await Review.find({ author: user }).populate('activitie');
    console.log('whats this', activities)
    console.log('this is review----', reviews)
    if (!user) {
        req.flash('error', 'Cannot find that user!');
        return res.redirect('/activities');
    }
    console.log(user)
    res.render('users/show', { user, activities, reviews });
}