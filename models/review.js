const mongoose = require('mongoose');
//const Activities = require('./activitie')
const Schema = mongoose.Schema;


const reviewSchema = new Schema({
    body: String,
    rating: Number,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: { type: Date, default: Date.now },
    activitie: {
        type: Schema.Types.ObjectId,
        ref: 'Activitie'
    }
});



module.exports = mongoose.model("Review", reviewSchema);

