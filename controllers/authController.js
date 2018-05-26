const passport = require('passport');

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
