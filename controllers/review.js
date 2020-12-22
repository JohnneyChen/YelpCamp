const express = require('express')
const router = express.Router({ mergeParams: true })
const { wrapAsync } = require('../utilities/wrapAsync')
const Review = require('../models/review')
const Campground = require('../models/campground')

module.exports.postReview = wrapAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    const review = new Review(req.body.review)
    review.author = req.user._id
    campground.reviews.push(review)
    await review.save()
    await campground.save()
    req.flash('success', "Successfully Added a New Review")
    res.redirect(`/campgrounds/${campground._id}`)
})

module.exports.deleteReview = wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    const review = await Review.findByIdAndDelete(reviewId)
    req.flash('success', "Successfully Deleted the Review")
    res.redirect(`/campgrounds/${id}`)
})