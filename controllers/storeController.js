const mongoose = require('mongoose');
const Store = mongoose.model('Store');

exports.homePage = (req, res) => {
    res.render('pageIndex', {title: 'Zeke Rocks!'});
};

exports.addStore = (req, res) => {
    res.render('pageStoreEdit', {title: 'Add Store'});
};

// async - this function will have some await
// this is wrapped in the router to handle try catch
exports.createStore = async (req, res) => {
    const store = new Store(req.body);

    // wait - wait until this has finished
    await store.save();

    res.redirect('/');
};
