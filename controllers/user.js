const express = require('express')
const router = express.Router()
const { wrapAsync } = require('../utilities/wrapAsync')
const { AppError } = require('../utilities/AppError')
const { registerSchema, loginSchema } = require('../schemas')
const User = require('../models/user')
const passport = require('passport')

module.exports.validateLogin = (req, res, next) => {
    const { error } = loginSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        req.flash('error', msg)
        res.redirect('/login')
    }
    next();
}

module.exports.validateRegister = (req, res, next) => {
    const { error } = registerSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        req.flash('error', msg)
        res.redirect('/register')
    }
    next();
}

module.exports.getRegister = (req, res) => {
    res.render('user/register')
}

module.exports.postRegister = wrapAsync(async (req, res, next) => {
    try {
        const { username, email, password } = req.body
        const user = new User({ username, email })
        const newUser = await User.register(user, password)
        req.login(newUser, err => {
            if (err) {
                return next(err)
            }
        })
        req.flash('success', 'Successfully Registered')
        res.redirect('/campgrounds')
    } catch (e) {
        req.flash('error', e.message)
        res.redirect('/register')
    }
})

module.exports.getLogin = (req, res) => {
    res.render('user/login')
}

module.exports.postLogin = wrapAsync(async (req, res, next) => {
    req.flash('success', 'Welcome Back!')
    const redirectUrl = req.session.returnURL || '/campgrounds'
    delete req.session.returnURL
    res.redirect(redirectUrl)
})

module.exports.getLogout = (req, res) => {
    req.logout()
    req.flash('success', 'You have logged out')
    res.redirect('/campgrounds')
}