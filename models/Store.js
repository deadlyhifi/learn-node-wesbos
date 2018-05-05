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
    created: {
        type: Date,
        default: Date.now,
    },
    // updated: {
    //     type: Date,
    // },
    location: {
        type: {
            type: String,
            default: 'Point',
        },
        coordinates: [{
            type: Number,
            required: 'You must supply co-ordinates.',
        }],
        address: {
            type: String,
            required: 'You must supply an address.',
        },
    },
    photo: String,
});

storeSchema.pre('save', function(next) {
    if (!this.isModified('name')) {
      return next(); // skip it
    }

    this.slug = slug(this.name);
    next();
    // TODO make more resiliant so slugs are unique
});

module.exports = mongoose.model('Store', storeSchema);
