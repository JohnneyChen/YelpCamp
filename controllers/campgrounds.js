const express = require('express')
const router = express.Router()
const { wrapAsync } = require('../utilities/wrapAsync')
const Campground = require('../models/campground')
const Review = require('../models/review')
const { cloudinary } = require('../cloudinary')
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding')
const campground = require('../models/campground')
const mbxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mbxToken });


module.exports.getIndex = wrapAsync(async (req, res, next) => {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', { campgrounds })
})
module.exports.getCampground = wrapAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author')
    if (!campground) {
        req.flash('error', 'Campground Not Found')
        res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', { campground })
})
module.exports.getNew = (req, res) => {
    res.render('campgrounds/new')
}
module.exports.getEdit = wrapAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id)
    if (!campground) {
        req.flash('error', 'Campground Not Found')
        res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', { campground })
})

module.exports.postNew = wrapAsync(async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    const newCampground = new Campground(req.body.campground)
    newCampground.geometry = geoData.body.features[0].geometry;
    newCampground.images = req.files.map(f => ({ url: f.path, filename: f.filename }))
    newCampground.author = req.user._id
    await newCampground.save();
    req.flash('success', "Successfully Made a New Campground")
    res.redirect(`campgrounds/${newCampground.id}`)
})

module.exports.patchCampground = wrapAsync(async (req, res, next) => {
    const campground = await Campground.findByIdAndUpdate(req.params.id, { ...req.body.campground })
    const newImages = req.files.map(f => ({ url: f.path, filename: f.filename }))
    campground.images.push(...newImages)
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    await campground.save()
    req.flash('success', "Successfully Edited the Campground")
    res.redirect(`${req.params.id}`)
})

module.exports.deleteCampground = wrapAsync(async (req, res, next) => {
    await Campground.findByIdAndDelete(req.params.id)
    req.flash('success', "Successfully Deleted the Campground")
    res.redirect('/campgrounds')
})