/**
 * VPN Detection Service
 *
 * Tries VPN detection via 3 providers in cascade:
 * 1. IPHub.info      — block: 1 means VPN/proxy
 * 2. IP-API.com      — proxy: true means VPN/proxy
 * 3. proxycheck.io   — proxy: yes means VPN/proxy
 *
 * Each provider has a 1.5s timeout.
 * If all providers fail/timeout, the check is skipped (fail-open).
 */

const axios = require('axios');

const TIMEOUT_MS = 1500;

// ─── Helper: elapsed time tag ─────────────────────────────────────────────────
function ms(start) {
    return `${Date.now() - start}ms`;
}

// ─── Provider 1: IPHub ────────────────────────────────────────────────────────
async function checkIpHub(ip) {
    const apiKey = process.env.IPHUB_API_KEY;
    if (!apiKey || apiKey === 'your_iphub_api_key_here') {
        console.log('  [VPN:IPHub]  ⏭  Skipped — IPHUB_API_KEY not configured');
        return null;
    }

    const t = Date.now();
    const response = await axios.get(`https://v2.iphub.info/ip/${ip}`, {
        headers: { 'X-Key': apiKey },
        timeout: TIMEOUT_MS
    });

    const { block, countryCode, asn, isp } = response.data;
    const isVpn = block === 1;
    console.log(`  [VPN:IPHub]  ✅  Done in ${ms(t)} | block=${block} vpn=${isVpn} country=${countryCode} isp="${isp}" asn=${asn}`);

    return { provider: 'IPHub', isVpn, raw: response.data };
}

// ─── Provider 2: IP-API ───────────────────────────────────────────────────────
async function checkIpApi(ip) {
    const t = Date.now();
    const response = await axios.get(
        `http://ip-api.com/json/${ip}?fields=status,proxy,hosting,isp,country,query`,
        { timeout: TIMEOUT_MS }
    );

    const { status, proxy, hosting, isp, country } = response.data;
    if (status !== 'success') {
        console.log(`  [VPN:IP-API] ⚠️  Non-success status: ${status}`);
        return null;
    }

    const isVpn = proxy === true || hosting === true;
    console.log(`  [VPN:IP-API] ✅  Done in ${ms(t)} | proxy=${proxy} hosting=${hosting} vpn=${isVpn} country=${country} isp="${isp}"`);

    return { provider: 'IP-API', isVpn, raw: response.data };
}

// ─── Provider 3: proxycheck.io ────────────────────────────────────────────────
async function checkProxyCheck(ip) {
    const apiKey = process.env.PROXYCHECK_API_KEY;
    const url = apiKey && apiKey !== 'your_proxycheck_api_key_here'
        ? `https://proxycheck.io/v2/${ip}?key=${apiKey}&vpn=1&asn=1`
        : `https://proxycheck.io/v2/${ip}?vpn=1`;

    const t = Date.now();
    const response = await axios.get(url, { timeout: TIMEOUT_MS });
    const data = response.data;

    if (data.status !== 'ok') {
        console.log(`  [VPN:PCio]   ⚠️  Non-ok status: ${data.status}`);
        return null;
    }

    const ipData = data[ip];
    if (!ipData) {
        console.log(`  [VPN:PCio]   ⚠️  No data returned for IP ${ip}`);
        return null;
    }

    const isVpn = ipData.proxy === 'yes';
    console.log(`  [VPN:PCio]   ✅  Done in ${ms(t)} | proxy=${ipData.proxy} vpn=${isVpn} country=${ipData.country} type=${ipData.type || 'n/a'}`);

    return { provider: 'proxycheck.io', isVpn, raw: ipData };
}

// ─── Cascade Runner ───────────────────────────────────────────────────────────
const providers = [checkIpHub, checkIpApi, checkProxyCheck];

/**
 * Check if an IP is a VPN/proxy using cascade of 3 providers.
 * @param {string} ip
 * @returns {{ isVpn: boolean, provider: string|null, skipped: boolean }}
 */
async function checkVpn(ip) {
    const totalStart = Date.now();
    console.log(`\n🔍 [VPN Check] Starting check for IP: ${ip}`);

    for (const check of providers) {
        try {
            const result = await check(ip);
            if (result !== null) {
                const verdict = result.isVpn ? '🚫 VPN/PROXY DETECTED' : '✅ Clean IP';
                console.log(`🏁 [VPN Check] Result: ${verdict} | Provider: ${result.provider} | Total: ${ms(totalStart)}\n`);
                return { isVpn: result.isVpn, provider: result.provider, skipped: false };
            }
        } catch (err) {
            const name = check.name.replace('check', '');
            const isTimeout = err.code === 'ECONNABORTED' || err.message.includes('timeout');
            console.warn(`  [VPN:${name}] ❌  ${isTimeout ? 'Timeout' : 'Error'}: ${err.message} — trying next provider...`);
        }
    }

    // All providers failed — fail open
    console.warn(`⚠️  [VPN Check] All providers failed for IP ${ip} — allowing request (fail-open) | Total: ${ms(totalStart)}\n`);
    return { isVpn: false, provider: null, skipped: true };
}

/**
 * Extract the real client IP from the request, handling reverse proxies.
 * @param {import('express').Request} req
 * @returns {string}
 */
function getClientIp(req) {
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }
    return req.socket.remoteAddress || '127.0.0.1';
}

module.exports = { checkVpn, getClientIp };
