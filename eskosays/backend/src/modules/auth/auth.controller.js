const authService = require('./auth.service');
const msg91Service = require('./msg91.service');
const jwt = require('jsonwebtoken');
const admin = require('../../config/firebaseAdmin');

const register = async (req, res, next) => {
    try {
        const userAgent = req.headers['user-agent'];
        const result = await authService.register(req.body, userAgent);
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            ...result
        });
    } catch (error) {
        next(error);
    }
};

const login = async (req, res, next) => {
    const { email, deviceFingerprint } = req.body;
    console.log(`🔑 [Auth] Email login attempt | email: ${email} | fingerprint: ${deviceFingerprint?.slice(0, 8) || 'none'}...`);
    try {
        const userAgent = req.headers['user-agent'];
        const result = await authService.login(email, req.body.password, userAgent, deviceFingerprint);
        console.log(`✅ [Auth] Email login success | email: ${email} | userId: ${result.user?.id} | trust: ${result.deviceTrust?.score ?? 'n/a'}`);
        res.json({ success: true, ...result });
    } catch (error) {
        console.warn(`❌ [Auth] Email login failed | email: ${email} | reason: ${error.message}`);
        res.status(401);
        next(error);
    }
};

const refresh = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        const userAgent = req.headers['user-agent'];

        const result = await authService.refreshAccessToken(refreshToken, userAgent);
        res.json({ success: true, ...result });
    } catch (error) {
        res.status(403);
        next(error);
    }
};

const adminLogin = async (req, res, next) => {
    try {
        const { username, password } = req.body;

        // Admin credentials read from environment — never hardcode in source
        const adminUser = process.env.ADMIN_USERNAME;
        const adminPass = process.env.ADMIN_PASSWORD;
        console.log(adminUser, adminPass, username, password);

        if (!adminUser || !adminPass) {
            return res.status(500).json({ success: false, message: 'Admin credentials not configured on server' });
        }

        if (username === adminUser && password === adminPass) {
            const token = jwt.sign(
                { role: 'admin', id: 'admin-static-id' },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );

            return res.json({
                success: true,
                data: {
                    accessToken: token,
                    user: {
                        id: 'admin-static-id',
                        username: 'admin',
                        role: 'admin'
                    }
                }
            });
        }

        return res.status(401).json({
            success: false,
            message: 'Invalid admin credentials'
        });
    } catch (error) {
        next(error);
    }
};

const logout = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        await authService.logout(refreshToken);
        res.json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
        next(error);
    }
};

const getMe = async (req, res) => {
    res.json({
        success: true,
        user: req.user
    });
};

const firebaseAuth = async (req, res, next) => {
    try {
        const { idToken, deviceFingerprint } = req.body;
        const userAgent = req.headers['user-agent'];

        if (!idToken) {
            return res.status(400).json({ success: false, message: 'Firebase ID Token is required' });
        }

        const decodedToken = await admin.auth().verifyIdToken(idToken);
        console.log(`🔑 [Auth] Firebase login | email: ${decodedToken.email} | fingerprint: ${deviceFingerprint?.slice(0, 8) || 'none'}...`);

        const result = await authService.firebaseLogin(decodedToken, userAgent, deviceFingerprint);
        console.log(`✅ [Auth] Firebase login success | userId: ${result.user?.id} | trust: ${result.deviceTrust?.score ?? 'n/a'}`);

        res.json({ success: true, ...result });
    } catch (error) {
        console.error('Backend: Firebase Auth Error:', error.message);
        res.status(401);
        next(new Error('Invalid Firebase Token: ' + error.message));
    }
};

const changePassword = async (req, res, next) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const result = await authService.changePassword(req.user.id, oldPassword, newPassword);
        res.json(result);
    } catch (error) {
        res.status(400);
        next(error);
    }
};

const sendOtp = async (req, res, next) => {
    const { identifier } = req.body;
    console.log(`📤 [OTP] Send OTP request | identifier: ${identifier}`);
    try {
        if (!identifier) {
            console.warn('⚠️  [OTP] Send OTP failed — identifier missing');
            return res.status(400).json({ success: false, message: 'Identifier is required' });
        }
        const result = await msg91Service.sendOtp(identifier);
        console.log(`✅ [OTP] OTP sent successfully | identifier: ${identifier}`);
        res.json({ success: true, data: result });
    } catch (error) {
        console.error(`❌ [OTP] Send OTP failed | identifier: ${identifier} | error: ${error.message}`);
        next(error);
    }
};

const retryOtp = async (req, res, next) => {
    const { identifier, retryType } = req.body;
    console.log(`🔄 [OTP] Retry OTP request | identifier: ${identifier} | type: ${retryType || 'text'}`);
    try {
        if (!identifier) {
            console.warn('⚠️  [OTP] Retry OTP failed — identifier missing');
            return res.status(400).json({ success: false, message: 'Identifier is required' });
        }
        const result = await msg91Service.retryOtp(identifier, retryType);
        console.log(`✅ [OTP] OTP resent successfully | identifier: ${identifier}`);
        res.json({ success: true, data: result });
    } catch (error) {
        console.error(`❌ [OTP] Retry OTP failed | identifier: ${identifier} | error: ${error.message}`);
        next(error);
    }
};

const verifyOtp = async (req, res, next) => {
    const { identifier, otp, deviceFingerprint } = req.body;
    const userAgent = req.headers['user-agent'];
    console.log(`🔐 [OTP] Verify OTP request | identifier: ${identifier} | fingerprint: ${deviceFingerprint?.slice(0, 8) || 'none'}...`);

    try {
        if (!identifier || !otp) {
            console.warn('⚠️  [OTP] Verify failed — identifier or OTP missing');
            return res.status(400).json({ success: false, message: 'Identifier and OTP are required' });
        }

        // 1. Verify OTP with MSG91
        console.log(`  [OTP] Step 1: Verifying OTP with MSG91...`);
        const verifyResult = await msg91Service.verifyOtp(identifier, otp);

        if (verifyResult.status !== 'success') {
            console.warn(`❌ [OTP] OTP verification failed | identifier: ${identifier} | msg: ${verifyResult.message}`);
            return res.status(400).json({ success: false, message: verifyResult.message || 'OTP verification failed' });
        }
        console.log(`  [OTP] Step 1: OTP verified ✅`);

        // 2. Map widgetToken to our user
        console.log(`  [OTP] Step 2: Resolving user from widget token...`);
        const widgetToken = verifyResult.data;
        const tokenDetails = await msg91Service.verifyAccessToken(widgetToken);

        if (tokenDetails.status !== 'success') {
            console.warn(`❌ [OTP] Access token verification failed | identifier: ${identifier}`);
            return res.status(401).json({ success: false, message: 'Failed to retrieve user details from MSG91' });
        }

        const userIdentifier = tokenDetails.data.mobile_number || tokenDetails.data.email;
        console.log(`  [OTP] Step 2: Resolved identifier: ${userIdentifier} ✅`);

        // 3. Login or Register the user in our system
        console.log(`  [OTP] Step 3: Running otpLogin for identifier: ${userIdentifier}...`);
        const result = await authService.otpLogin(userIdentifier, userAgent, deviceFingerprint);
        console.log(`✅ [OTP] Login complete | userId: ${result.user?.id} | trust: ${result.deviceTrust?.score ?? 'n/a'}`);

        res.json({
            success: true,
            message: 'OTP verified successfully',
            ...result
        });
    } catch (error) {
        console.error(`❌ [OTP] verifyOtp error | identifier: ${identifier} | error: ${error.message}`);
        res.status(401);
        next(error);
    }
};

module.exports = {
    register,
    login,
    adminLogin,
    firebaseAuth,
    refresh,
    logout,
    getMe,
    changePassword,
    sendOtp,
    retryOtp,
    verifyOtp
};
