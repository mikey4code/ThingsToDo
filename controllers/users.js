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
        console.log(password)
        const registeredUser = await User.register(user, password);
        console.log(registeredUser)
        req.login(registeredUser, err => {
            if (err) return next(err);
            console.log(req.user)
            req.flash('success', 'Welcome to thingsToDo!');
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
    console.log(req.user)
    req.flash('success', 'welcome back!');
    const redirectUrl = req.session.returnTo || '/activities';
    console.log(redirectUrl)
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
    if (!user) {
        req.flash('error', 'Cannot find that user!');
        return res.redirect('/activities');
    }
    res.render('users/show', { user, activities, reviews });
}

module.exports.renderEdit = async (req, res) => {
    const user = await User.findById(req.params.user_id)
    if (!user) {
        req.flash('error', 'Cannot find that User!');
        return res.redirect('/activities');
    }
    res.render('users/useredit', { user });
}

module.exports.updateProfile = async (req, res) => {
    const { user_id } = req.params;
    const user = await User.findByIdAndUpdate(user_id, { ...req.body.user });
    await user.save();
    if (!user) {
        req.flash('error', 'Cannot find that user!');
        return res.redirect(`/users/${user_id}`);
    }
    req.flash('success', 'Successfully update profile!');
    res.redirect(`/users/${user_id}`)
}