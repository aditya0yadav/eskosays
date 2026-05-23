const Joi = require('joi');

const registerSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    firstName: Joi.string().optional(),
    lastName: Joi.string().optional(),
    countryCode: Joi.string().length(2).optional(),
    role: Joi.string().valid('panelist', 'admin').optional()
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

const validateRequest = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
        res.status(400);
        return next(new Error(error.details[0].message));
    }
    next();
};

// These should be used in the routes as middleware
// For now I won't update the routes file to include them unless asked, or I can update it now for completeness.
// I'll leave the file as is for now as a utility or update the routes to use it.
// Actually, I should export middleware.

module.exports = {
    validateRegister: validateRequest(registerSchema),
    validateLogin: validateRequest(loginSchema)
};
