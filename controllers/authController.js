const passport = require('passport');
const crypto = require('crypto');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const promisify = require('es6-promisify');

exports.login = passport.authenticate('local', {
   failureRedirect: '/login',
   failureFlash: 'Failed Login',
   successRedirect: '/', // TODO - take them to where they were going
   successFlash: 'You are now logged in',
});

exports.logout = (req, res) => {
    req.logout();
    req.flash('success', 'You are now logged out');
    res.redirect('/');
};

exports.isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    };

    req.flash('error', 'Oops, you need to be logged in for this');
    res.redirect('/login');
};

exports.forgotPassword = async (req, res) => {
    const message = 'If an account exists a password reset has been emailed to you';

    // check if user exists
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        req.flash('success', message);
        res.redirect('/login');
    }

    // Generate reset token and expiry
    user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send reset email
    const resetUrl = `http://${req.headers.host}/account/reset/${user.resetPasswordToken}`;

    // Send to login page
    req.flash('success', message + `<br/>  ${resetUrl}`);
    res.redirect('/login');
};

exports.resetPassword = async (req, res) => {
    const user = await User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
        req.flash('error', 'Sorry, password reset token is invalid or has expired');
        return res.redirect('/login');
    }

    // if it's expired, show the password reset form again
    res.render('pageReset', { title: 'Reset your password ►' });
}

exports.confirmPasswords = (req, res, next) => {
    if (req.body.password === req.body['password-confirm']) {
        return next();
    }

    req.flash('error', 'Passwords don’t match');
    res.redirect('back');
};

exports.updatePassword = async (req, res) => {
    const user = await User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
        req.flash('error', 'Sorry, password reset token is invalid or has expired');
        return res.redirect('/login');
    }

    const setPasswordPromise = promisify(user.setPassword, user);
    await setPasswordPromise(req.body.password);
    user.resetPasswordToken = undefined; // expire tokens
    user.resetPasswordExpires = undefined;
    const updatedUser = await user.save();

    await req.login(updatedUser);
    req.flash('success', 'Your password has been reset and you have been logged in');
    res.redirect('/');
};
