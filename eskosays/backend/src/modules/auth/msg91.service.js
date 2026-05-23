const axios = require('axios');

// ─── Development Mode ─────────────────────────────────────────────────────────
// When MSG91_DEV_MODE=true, no real API calls are made.
// Use OTP "123456" and any identifier to test the full login flow locally.
// Set MSG91_DEV_MODE=false (or remove it) before deploying to production.

const DEV_OTP = '123456';
const DEV_MODE = process.env.MSG91_DEV_MODE === 'true';

if (DEV_MODE) {
    console.warn('[MSG91] ⚠️  Running in DEV MODE — all OTPs are mocked. Use OTP: ' + DEV_OTP);
}

// ─────────────────────────────────────────────────────────────────────────────

class Msg91Service {
    constructor() {
        this.authKey = process.env.MSG91_AUTH_KEY;
        this.widgetId = process.env.MSG91_WIDGET_ID;
        this.baseUrl = 'https://api.msg91.com/api/v5/widget';
    }

    /**
     * Send OTP to a mobile number or email
     * @param {string} identifier - mobile number or email
     */
    async sendOtp(identifier) {
        if (DEV_MODE) {
            console.log(`[MSG91 DEV] sendOtp called for: ${identifier} — simulated success`);
            return { status: 'success', message: `[DEV] OTP sent to ${identifier}. Use code: ${DEV_OTP}` };
        }

        try {
            const response = await axios.post(`${this.baseUrl}/sendOtp`, {
                identifier: identifier,
                widgetId: this.widgetId
            }, {
                headers: {
                    'authkey': this.authKey,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error('MSG91 Send OTP Error:', error.response?.data || error.message);
            throw new Error(error.response?.data?.message || 'Failed to send OTP');
        }
    }

    /**
     * Retry sending OTP
     * @param {string} identifier - mobile number or email
     * @param {string} retryType - 'voice' or 'text' (default)
     */
    async retryOtp(identifier, retryType = 'text') {
        if (DEV_MODE) {
            console.log(`[MSG91 DEV] retryOtp called for: ${identifier} — simulated success`);
            return { status: 'success', message: `[DEV] OTP resent to ${identifier}. Use code: ${DEV_OTP}` };
        }

        try {
            const response = await axios.post(`${this.baseUrl}/retryOtp`, {
                identifier: identifier,
                retryType: retryType,
                widgetId: this.widgetId
            }, {
                headers: {
                    'authkey': this.authKey,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error('MSG91 Retry OTP Error:', error.response?.data || error.message);
            throw new Error(error.response?.data?.message || 'Failed to retry OTP');
        }
    }

    /**
     * Verify the OTP
     * @param {string} identifier - mobile number or email
     * @param {string} otp - the OTP to verify
     */
    async verifyOtp(identifier, otp) {
        if (DEV_MODE) {
            console.log(`[MSG91 DEV] verifyOtp called for: ${identifier} with OTP: ${otp}`);
            if (otp === DEV_OTP) {
                return {
                    status: 'success',
                    data: `dev_widget_token_${identifier}`,
                    message: '[DEV] OTP verified successfully'
                };
            } else {
                throw new Error(`[DEV] Invalid OTP. Use "${DEV_OTP}" in development mode.`);
            }
        }

        try {
            const response = await axios.post(`${this.baseUrl}/verifyOtp`, {
                identifier: identifier,
                otp: otp,
                widgetId: this.widgetId
            }, {
                headers: {
                    'authkey': this.authKey,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error('MSG91 Verify OTP Error:', error.response?.data || error.message);
            throw new Error(error.response?.data?.message || 'Invalid OTP');
        }
    }

    /**
     * Verify the Access Token received after OTP verification
     * @param {string} widgetToken - the token received from MSG91
     */
    async verifyAccessToken(widgetToken) {
        if (DEV_MODE) {
            // Dev tokens are formatted as dev_widget_token_{identifier}
            const identifier = widgetToken.replace('dev_widget_token_', '');
            console.log(`[MSG91 DEV] verifyAccessToken called — resolved identifier: ${identifier}`);
            const isEmail = identifier.includes('@');
            return {
                status: 'success',
                data: {
                    mobile_number: isEmail ? null : identifier,
                    email: isEmail ? identifier : null
                }
            };
        }

        try {
            const response = await axios.post(`${this.baseUrl}/verifyAccessToken`, {
                widgetToken: widgetToken
            }, {
                headers: {
                    'authkey': this.authKey,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error('MSG91 Verify Access Token Error:', error.response?.data || error.message);
            throw new Error(error.response?.data?.message || 'Failed to verify access token');
        }
    }
}

module.exports = new Msg91Service();
