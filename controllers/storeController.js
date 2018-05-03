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
    const store = await (new Store(req.body)).save();

    req.flash('success', `Succesfully Created ${store.name}. Care to leave a review?`);
    res.redirect(`/store/${store.slug}`);
};

exports.getStores = async (req, res) => {
    // get all stores
    const stores = await Store.find();
    res.render(
        'pageStores',
        {
            title: 'Store List',
            stores
        }
    );
};

exports.editStore = async (req, res) => {
    // find store with id
    const store = await Store.findOne({ _id: req.params.id });
    // todo - auth

    // render edit form
    res.render(
        'pageStoreEdit',
        {
            title: `Edit – ${store.name}`,
            store
        }
    );
};

exports.updateStore = async (req, res) => {
    // auth
    // find and update store
    const store = await Store.findOneAndUpdate(
        { _id: req.params.id },
        req.body,
        {
            new: true, // return the updated store
            runValidators: true,
        }
    ).exec();

    req.flash('success', `Succesfully updated <strong>${store.name}</strong>. <a href='/stores/${store.slug}'>View Store ►</a>`);
    res.redirect(`/stores/${store._id}/edit`);
};
