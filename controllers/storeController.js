const mongoose = require('mongoose');
const Store = mongoose.model('Store');
const multer = require('multer');
const jimp = require('jimp');
const uuid = require('uuid');

const multerOptions = {
    storage: multer.memoryStorage(),
    fileFilter(req, file, next) {
        const isPhoto = file.mimetype.startsWith('image/');
        if (isPhoto) {
            next(null, true);
        } else {
            next({ message: 'That filetype isn’t allowed' }, false);
        }
    }
};

exports.homePage = (req, res) => {
    res.render('pageIndex', {title: 'Zeke Rocks!'});
};

exports.addStore = (req, res) => {
    res.render('pageStoreEdit', {title: 'Add Store'});
};

// Allow upload of photo
exports.upload = multer(multerOptions).single('photo');

// Resize photo
exports.resize = async (req, res, next) => {
    if (!req.file) {
        return next();
    }

    const extension = req.file.mimetype.split('/')[1];
    req.body.photo = `${uuid.v4()}.${extension}`;
    const photo = await jimp.read(req.file.buffer);
    await photo.resize(800, jimp.AUTO);
    await photo.write(`./public/uploads/${req.body.photo}`);

    next();
};

// async - this function will have some await
// this is wrapped in the router to handle try catch
exports.createStore = async (req, res) => {
    req.body.author = req.user._id;
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
            stores,
        }
    );
};

const confirmOwner = (store, user) => {
    if (!store.author.equals(user._id)) {
        throw Error('You must own the store in order to edit it!');
    }
};

exports.editStore = async (req, res) => {
    // find store with id
    const store = await Store.findOne({ _id: req.params.id });

    // auth
    confirmOwner(store, req.user);

    // render edit form
    res.render(
        'pageStoreEdit',
        {
            title: `Edit – ${store.name}`,
            store,
        }
    );
};

exports.updateStore = async (req, res) => {
    // auth - TODO: can probably use this one to update after auth check
    const confirmStore = await Store.findOne({ _id: req.params.id });
    confirmOwner(confirmStore, req.user);

    // set the location data to be a point
    req.body.location.type = 'Point';

    // find and update store
    const store = await Store.findOneAndUpdate(
        { _id: req.params.id },
        req.body,
        {
            new: true, // return the updated store
            runValidators: true,
        }
    ).exec();

    req.flash('success', `Succesfully updated <strong>${store.name}</strong>. <a href='/store/${store.slug}'>View Store ►</a>`);
    res.redirect(`/store/${store._id}/edit`);
};

exports.getStoreBySlug = async (req, res, next) => {
    const store = await Store.findOne({ slug: req.params.slug })
        .populate('author'); // Tell mongo to bring in auth details

    if (!store) {
        return next();
    }
    res.render('pageStore', {
        title: store.name,
        store,
    });
};

exports.getStoresByTag = async (req, res) => {
    const tag = req.params.tag;
    const tagQuery = tag || { $exists: true };
    const tagsPromise = Store.getTagsCount();
    const storesPromise = Store.find({ tags: tagQuery });
    const storesCountPromise = Store.getStoresCount();

    const [ tags, stores, storesCount ] = await Promise.all([
        tagsPromise,
        storesPromise,
        storesCountPromise,
    ]);

    res.render('pageTags', {
        title: (tag || 'Tags'),
        tag,
        tags,
        stores,
        storesCount: storesCount[0].count,
    });
}
