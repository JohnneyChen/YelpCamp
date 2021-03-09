const { AppError } = require('./utilities/AppError')
const { reviewSchema, campgroundSchema } = require('./schemas')
const Campground = require('./models/campground')
const Review = require('./models/review')
const { wrapAsync } = require('./utilities/wrapAsync')

const isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnURL = req.originalUrl
        req.flash('error', 'You must be logged in')
        return res.redirect('/login')
    }
    next()
}

const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body)
    console.log(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new AppError(msg, 400)
    }
    next();
}

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new AppError(msg, 400)
    }
    next();
}

const isAuthor = wrapAsync(async (req, res, next) => {
    const { id } = req.params
    const campground = await Campground.findById(id)
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'You are not authorized to perform this action')
        return res.redirect(`/campgrounds/${id}`)
    }
    next()
})

const isReviewAuthor = wrapAsync(async (req, res, next) => {
    const { reviewId, id } = req.params
    const review = await Review.findById(reviewId)
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You are not authorized to perform this action')
        return res.redirect(`/campgrounds/${id}`)
    }
    next()
})

module.exports.validateReview = validateReview
module.exports.validateCampground = validateCampground
module.exports.isLoggedIn = isLoggedIn
module.exports.isAuthor = isAuthor
module.exports.isReviewAuthor = isReviewAuthor
