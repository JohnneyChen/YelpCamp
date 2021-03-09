const { string } = require('joi')
const baseJoi = require('joi')
const sanitizeHtml = require('sanitize-html');
const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
});

const Joi = baseJoi.extend(extension)

exports.campgroundSchema = Joi.object({
    campground: Joi.object({
        title: Joi.string().required().escapeHTML(),
        price: Joi.number().required().min(0),
        location: Joi.string().required().escapeHTML(),
        description: Joi.string().required().escapeHTML(),
        // images: Joi.object({
        //     url: Joi.string().required(),
        //     filename: Joi.string().required()
        // }).required()
    }).required(),
    deleteImages: Joi.array()
})

exports.reviewSchema = Joi.object({
    review: Joi.object({
        text: Joi.string().required().escapeHTML(),
        rating: Joi.number().required().min(0).max(5)
    }).required()
})

exports.registerSchema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
    email: Joi.string().required()
})

exports.loginSchema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required()
})