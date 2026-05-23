const { User, Panelist, RefreshToken } = require('../../models');
const { hashPassword, comparePassword } = require('../../utils/passwordHash');
const { generateAccessToken, generateRefreshToken } = require('../../utils/tokenGenerator');
const fingerprintService = require('./fingerprint.service');

const register = async (userData, userAgent) => {
    // Check if user exists
    const existingUser = await User.findOne({ where: { email: userData.email } });
    if (existingUser) {
        throw new Error('User already exists');
    }

    // Hash password
    const hashedPassword = await hashPassword(userData.password);

    // Create user
    const user = await User.create({
        email: userData.email,
        password_hash: hashedPassword,
        role: userData.role || 'panelist'
    });

    let panelist = null;
    // Create Panelist profile if role is panelist
    if (user.role === 'panelist') {
        panelist = await Panelist.create({
            user_id: user.id,
            first_name: userData.name ? userData.name.split(' ')[0] : 'User',
            last_name: userData.name ? userData.name.split(' ').slice(1).join(' ') : '',
            country_code: userData.countryCode
        });
    }

    // Generate tokens for immediate login
    const panelistId = panelist ? panelist.id : null;
    const accessToken = generateAccessToken(user, panelistId);
    const refreshTokenString = generateRefreshToken();

    // Store refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

    await RefreshToken.create({
        user_id: user.id,
        token: refreshTokenString,
        expires_at: expiresAt,
        user_agent: userAgent
    });

    return {
        user: {
            id: user.id,
            email: user.email,
            role: user.role,
            firstName: panelist ? panelist.first_name : null,
            lastName: panelist ? panelist.last_name : null
        },
        accessToken,
        refreshToken: refreshTokenString
    };
};

const login = async (email, password, userAgent, fingerprintHash) => {
    const user = await User.findOne({
        where: { email },
        include: [{ model: Panelist, as: 'panelist' }]
    });

    if (!user || !(await comparePassword(password, user.password_hash))) {
        throw new Error('Invalid credentials');
    }

    // Update last login
    user.last_login = new Date();
    await user.save();

    // Generate tokens
    const panelistId = user.panelist ? user.panelist.id : null;
    const accessToken = generateAccessToken(user, panelistId);
    const refreshTokenString = generateRefreshToken();

    // Store refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await RefreshToken.create({
        user_id: user.id,
        token: refreshTokenString,
        expires_at: expiresAt,
        user_agent: userAgent
    });

    // Device fingerprint trust
    const deviceTrust = await fingerprintService.upsertFingerprint(user.id, fingerprintHash, userAgent);

    return {
        user: {
            id: user.id,
            email: user.email,
            role: user.role,
            firstName: user.panelist ? user.panelist.first_name : null,
            lastName: user.panelist ? user.panelist.last_name : null
        },
        accessToken,
        refreshToken: refreshTokenString,
        deviceTrust
    };
};

const refreshAccessToken = async (token, userAgent) => {
    const storedToken = await RefreshToken.findOne({
        where: { token },
        include: [{
            model: User,
            as: 'user',
            include: [{ model: Panelist, as: 'panelist' }]
        }]
    });

    if (!storedToken) {
        throw new Error('Invalid refresh token');
    }

    // Check expiration
    if (new Date() > storedToken.expires_at) {
        await storedToken.destroy(); // Cleanup expired token
        throw new Error('Refresh token expired');
    }

    const { user } = storedToken;

    // Reject if user is banned (Passive Security)
    if (user.role === 'panelist' && user.panelist && user.panelist.status === 'banned') {
        await storedToken.destroy();
        throw new Error('Account is banned');
    }

    // Rotation: Delete old token, issue new one
    await storedToken.destroy();

    const newRefreshTokenString = generateRefreshToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

    await RefreshToken.create({
        user_id: user.id,
        token: newRefreshTokenString,
        expires_at: expiresAt,
        user_agent: userAgent
    });

    const panelistId = user.panelist ? user.panelist.id : null;
    const newAccessToken = generateAccessToken(user, panelistId);

    return {
        accessToken: newAccessToken,
        refreshToken: newRefreshTokenString
    };
};

const logout = async (token) => {
    await RefreshToken.destroy({ where: { token } });
};

const changePassword = async (userId, oldPassword, newPassword) => {
    const user = await User.findByPk(userId);
    if (!user) {
        throw new Error('User not found');
    }

    // Check if user has a password (might be a Firebase user)
    if (user.password_hash === 'FIREBASE_AUTH_PROVIDER') {
        throw new Error('Password cannot be changed for social login accounts');
    }

    // Verify old password
    const isValid = await comparePassword(oldPassword, user.password_hash);
    if (!isValid) {
        throw new Error('Invalid old password');
    }

    // Hash and update new password
    const hashedPassword = await hashPassword(newPassword);
    user.password_hash = hashedPassword;
    await user.save();

    return { success: true, message: 'Password updated successfully' };
};

const firebaseLogin = async (decodedToken, userAgent, fingerprintHash) => {
    // firebaseLogin logic
    const { uid, email, name, picture, email_verified } = decodedToken;

    let user = await User.findOne({
        where: { email },
        include: [{ model: Panelist, as: 'panelist' }]
    });

    if (!user) {
        // Create new user if they don't exist
        user = await User.create({
            email,
            password_hash: 'FIREBASE_AUTH_PROVIDER',
            role: 'panelist',
            email_verified: email_verified || false,
            google_id: uid
        });

        // Parse name for panelist profile
        const nameParts = name ? name.split(' ') : ['User', ''];
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ') || '';
        await Panelist.create({
            user_id: user.id,
            first_name: firstName,
            last_name: lastName,
            profile_picture: picture
        });

        // Re-fetch to include panelist profile
        user = await User.findByPk(user.id, {
            include: [{ model: Panelist, as: 'panelist' }]
        });
    } else {
        // Update google_id and email_verified status on existing users
        const updates = {};
        if (!user.google_id) updates.google_id = uid;
        if (!user.email_verified && email_verified) updates.email_verified = true;
        if (Object.keys(updates).length > 0) await user.update(updates);
    }

    // Update last login
    user.last_login = new Date();
    await user.save();

    // Generate tokens for session persistence
    const panelistId = user.panelist ? user.panelist.id : null;
    const accessToken = generateAccessToken(user, panelistId);
    const refreshTokenString = generateRefreshToken();

    // Store refresh token (30 days shelf life)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await RefreshToken.create({
        user_id: user.id,
        token: refreshTokenString,
        expires_at: expiresAt,
        user_agent: userAgent
    });

    // Device fingerprint trust
    const deviceTrust = await fingerprintService.upsertFingerprint(user.id, fingerprintHash, userAgent);

    return {
        user: {
            id: user.id,
            email: user.email,
            role: user.role,
            firstName: user.panelist ? user.panelist.first_name : null,
            lastName: user.panelist ? user.panelist.last_name : null,
            avatar: user.avatar_url || (user.panelist ? user.panelist.profile_picture : null)
        },
        accessToken,
        refreshToken: refreshTokenString,
        deviceTrust
    };
};

const otpLogin = async (identifier, userAgent, fingerprintHash) => {
    // Determine if identifier is email or mobile
    const isEmail = identifier.includes('@');
    const whereClause = isEmail ? { email: identifier } : { phone: identifier };

    let user = await User.findOne({
        where: whereClause,
        include: [{ model: Panelist, as: 'panelist' }]
    });

    if (!user) {
        // Create new user if they don't exist
        // Note: email is NOT NULL in DB, so phone-only users get a placeholder
        user = await User.create({
            email: isEmail ? identifier : `phone_${identifier}@otp.internal`,
            phone: isEmail ? null : identifier,
            password_hash: 'OTP_AUTH_PROVIDER',
            role: 'panelist',
            email_verified: isEmail
        });

        // Create Panelist profile
        await Panelist.create({
            user_id: user.id,
            first_name: 'User',
            last_name: ''
        });

        // Re-fetch to include panelist profile
        user = await User.findByPk(user.id, {
            include: [{ model: Panelist, as: 'panelist' }]
        });
    }

    // Update last login
    user.last_login = new Date();
    await user.save();

    // Generate tokens
    const panelistId = user.panelist ? user.panelist.id : null;
    const accessToken = generateAccessToken(user, panelistId);
    const refreshTokenString = generateRefreshToken();

    // Store refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await RefreshToken.create({
        user_id: user.id,
        token: refreshTokenString,
        expires_at: expiresAt,
        user_agent: userAgent
    });

    // Device fingerprint trust
    const deviceTrust = await fingerprintService.upsertFingerprint(user.id, fingerprintHash, userAgent);

    return {
        user: {
            id: user.id,
            email: user.email,
            phone: user.phone,
            role: user.role,
            firstName: user.panelist ? user.panelist.first_name : null,
            lastName: user.panelist ? user.panelist.last_name : null
        },
        accessToken,
        refreshToken: refreshTokenString,
        deviceTrust
    };
};

module.exports = {
    register,
    login,
    firebaseLogin,
    otpLogin,
    refreshAccessToken,
    logout,
    changePassword
};
