const Activities = require('../models/activitie');
const Review = require('../models/review');

module.exports.createReview = async (req, res) => {
    const activities = await Activities.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    review.activitie = activities;
    activities.reviews.push(review);
    await review.save();
    await activities.save();
    req.flash('success', 'Created new review!');
    res.redirect(`/activities/${activities._id}`);
}

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Activities.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review')
    res.redirect(`/activities/${id}`);
}
