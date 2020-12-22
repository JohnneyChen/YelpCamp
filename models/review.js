const mongoose = require('mongoose');
const user = require('./user');
const Schema = mongoose.Schema;
const reviewSchema = new Schema({
    text: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
})


module.exports = mongoose.model('Review', reviewSchema)