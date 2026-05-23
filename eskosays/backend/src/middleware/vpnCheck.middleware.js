const { checkVpn, getClientIp } = require('./vpn.service');

/**
 * Middleware that blocks sign-in requests from VPN/proxy IPs.
 * Fails open if all VPN detection providers are unavailable.
 */
const vpnCheck = async (req, res, next) => {
    const ip = getClientIp(req);
    const route = `${req.method} ${req.path}`;

    // Always allow localhost in development
    if (ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1') {
        console.log(`🔓 [VPN Middleware] Localhost detected (${ip}) — bypassing VPN check for ${route}`);
        return next();
    }

    console.log(`🔐 [VPN Middleware] Checking IP ${ip} on route: ${route}`);

    try {
        const { isVpn, provider, skipped } = await checkVpn(ip);

        if (isVpn) {
            console.warn(`🚫 [VPN Middleware] BLOCKED | IP: ${ip} | Provider: ${provider} | Route: ${route}`);
            return res.status(403).json({
                success: false,
                code: 'VPN_DETECTED',
                message: 'VPN or proxy detected. Please disable it and try again.'
            });
        }

        if (skipped) {
            console.warn(`⚠️  [VPN Middleware] All providers unavailable — allowing IP ${ip} through`);
        } else {
            console.log(`✅ [VPN Middleware] IP ${ip} is clean — proceeding to auth`);
        }

        next();
    } catch (err) {
        console.error(`💥 [VPN Middleware] Unexpected error for IP ${ip}:`, err.message, '— failing open');
        next();
    }
};

module.exports = vpnCheck;
