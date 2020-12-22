const express = require('express')
const router = express.Router()
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware')
const { getIndex, getNew, getCampground, getEdit, postNew, patchCampground, deleteCampground } = require('../controllers/campgrounds')
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

router.get('/new', isLoggedIn, getNew)

router.get('/:id/edit', isLoggedIn, isAuthor, getEdit)

router.route('/')
    .get(getIndex)
    .post(isLoggedIn, upload.array('image'), validateCampground, postNew)

router.route('/:id')
    .get(getCampground)
    .patch(isLoggedIn, isAuthor, upload.array('image'), validateCampground, patchCampground)
    .delete(isLoggedIn, isAuthor, deleteCampground)

exports.campgroundsRoutes = router