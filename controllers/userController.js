const mongoose = require('mongoose');
const User = mongoose.model('User');
const promisify = require('es6-promisify');

exports.loginForm = (req, res) => {
    res.render('pageLogin', { title: 'Login' });
};

exports.registerForm = (req, res) => {
    res.render('pageRegister', { title: 'Register' });
};

exports.validateRegister = (req, res, next) => {
    req.sanitizeBody('name');
    req.checkBody('name', 'You must supply a name').notEmpty();
    req.checkBody('email', 'That’s not a valid email address').isEmail();
    req.sanitizeBody('email').normalizeEmail({
        remove_dots: false,
        remove_extension: false,
        gmail_remove_subaddress: false,
    });
    req.checkBody('password', 'Password cannot be blank').notEmpty();
    req.checkBody('confirm-password', 'Password confirmation cannot be blank').notEmpty();
    req.checkBody('confirm-password', 'Oops, your passwords don’t match').equals(req.body.password);

    const errors = req.validationErrors();
    if (errors) {
        req.flash('error', errors.map((err) => err.msg));
        res.render('pageRegister', { title: 'Register', body: req.body, flashes: req.flash() });

        return;
    }

    next();
};

exports.register = async (req, res, next) => {
    const user = new User({
        email: req.body.email,
        name: req.body.name,
    });
    const registerWithPromise = promisify(User.register, User);
    await registerWithPromise(user, req.body.password);

    next();
};
