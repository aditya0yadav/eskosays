/**
 * Browser Device Fingerprinting Utility
 *
 * Collects stable, privacy-safe browser signals and returns a SHA-256 hash.
 * No external libraries required — uses the built-in Web Crypto API.
 *
 * Signals used:
 * - userAgent       → browser + OS identifier
 * - screenResolution → "1920x1080"
 * - timezone        → "Asia/Kolkata"
 * - language        → "en-US"
 * - platform        → "MacIntel" / "Win32" etc.
 * - colorDepth      → 24
 * - cookiesEnabled  → true/false
 * - hardwareConcurrency → CPU core count
 */

/**
 * SHA-256 hash a string using the Web Crypto API.
 * @param {string} message
 * @returns {Promise<string>} hex string
 */
async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Collect browser signals and return a stable SHA-256 fingerprint hash.
 * @returns {Promise<string>} 64-char hex SHA-256 hash, or empty string on failure
 */
export async function collectFingerprint() {
    try {
        const signals = [
            navigator.userAgent,
            `${screen.width}x${screen.height}`,
            Intl.DateTimeFormat().resolvedOptions().timeZone,
            navigator.language,
            navigator.platform,
            screen.colorDepth,
            navigator.cookieEnabled ? '1' : '0',
            navigator.hardwareConcurrency ?? 'unknown'
        ].join('|');

        const hash = await sha256(signals);
        console.debug(`[Fingerprint] Collected: ${hash.slice(0, 16)}...`);
        return hash;
    } catch (err) {
        console.warn('[Fingerprint] Failed to collect fingerprint:', err.message);
        return '';
    }
}
