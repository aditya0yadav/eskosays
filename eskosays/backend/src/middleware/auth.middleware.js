const jwt = require('jsonwebtoken');
const { User, Panelist } = require('../models');

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];

            // Verify our internal JWT
            const decodedAccess = jwt.verify(token, process.env.JWT_SECRET);

            // Find user in database
            const user = await User.findByPk(decodedAccess.id, {
                attributes: { exclude: ['password_hash'] }
            });

            if (!user) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            // Fetch panelist data if available
            const panelist = await Panelist.findOne({ where: { user_id: user.id } });

            if (panelist && panelist.status === 'banned') {
                return res.status(403).json({ message: 'Access denied. Account is banned.' });
            }

            req.user = user;
            if (panelist) {
                req.panelistId = panelist.id;
            }

            next();
        } catch (error) {
            console.error('Middleware Auth Error:', error.message);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const protectOrAdmin = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decodedAccess = jwt.verify(token, process.env.JWT_SECRET);

            if (decodedAccess.role === 'admin' && decodedAccess.id === 'admin-static-id') {
                req.user = {
                    id: decodedAccess.id,
                    role: decodedAccess.role,
                    username: decodedAccess.username || 'admin'
                };
                return next();
            }

            return protect(req, res, next);
        } catch (error) {
            console.error('Middleware Auth Error:', error.message);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    return res.status(401).json({ message: 'Not authorized, no token' });
};

const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            res.status(403);
            res.json({ message: 'Forbidden: You do not have permission to perform this action' });
            return;
        }
        next();
    };
};

module.exports = {
    protect,
    protectOrAdmin,
    restrictTo
};
