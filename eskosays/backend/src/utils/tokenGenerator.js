const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const generateAccessToken = (user, panelistId = null) => {
    const payload = {
        id: user.id,
        role: user.role
    };

    if (panelistId) {
        payload.panelistId = panelistId;
    }

    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '7d'
    });
};

const generateRefreshToken = () => {
    return crypto.randomBytes(40).toString('hex');
};

module.exports = {
    generateAccessToken,
    generateRefreshToken
};
