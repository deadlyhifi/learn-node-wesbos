const mongoose = require('mongoose');
mongoose.Promise = global.Promise; // use default ES6 promise
const slug = require('slugs');

const storeSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: 'Please enter a store name.',
    },
    slug: String,
    description: {
        type: String,
        trim: true,
    },
    tags: [String],
});

storeSchema.pre('save', function(next) {
    // name not modified, skip generating a new slug
    if (!this.isModified(this.name)) {
        return next();
    }

    this.slug = slug(this.name);
    next();
    // todo - make slugs unique
});

module.exports = mongoose.model('Store', storeSchema);
