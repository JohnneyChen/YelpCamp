const express = require('express')
const router = express.Router()
const { wrapAsync } = require('../utilities/wrapAsync')
const User = require('../models/user')
const passport = require('passport')
const { validateLogin, validateRegister, getRegister, postRegister, getLogin, postLogin, getLogout } = require('../controllers/user')

router.get('/logout', getLogout)

router.route('/login')
    .get(getLogin)
    .post(validateLogin, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), postLogin)

router.route('/register')
    .get(getRegister)
    .post(validateRegister, postRegister)

module.exports.userRoutes = router