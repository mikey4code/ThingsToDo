const BaseJoi = require('joi');
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

const Joi = BaseJoi.extend(extension)

module.exports.activitiesSchema = Joi.object({
    activities: Joi.object({
        title: Joi.string().required().escapeHTML(),
        price: Joi.number().required().min(0),
        address: Joi.string().required().escapeHTML(),
        city: Joi.string().required().escapeHTML(),
        state: Joi.string().required().escapeHTML(),
        tags: Joi.string().required(),
        description: Joi.string().required()
    }).required(),
    deleteImages: Joi.array()
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        body: Joi.string().required().escapeHTML()
    }).required()
})

module.exports.userSchema = Joi.object({
    user: Joi.object({
        firstname: Joi.string().required().escapeHTML(),
        lastname: Joi.string().required().escapeHTML(),
        username: Joi.string().required().escapeHTML(),
        email: Joi.string().required().escapeHTML(),
        password: Joi.string().required().escapeHTML(),
        city: Joi.string().required().escapeHTML(),
        state: Joi.string().required().escapeHTML(),
    }).required()
})

