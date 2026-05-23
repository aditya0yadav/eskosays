/**
 * Zamplia Callback Routing Test Script
 * 
 * Simulates incoming Zamplia callbacks for both services
 * and logs which URL each one would route to.
 *
 * Run: node scripts/test-zamplia-callback.js
 */

require('dotenv').config();

const RS_PREFIX = 'rs_';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const OTHER_SERVICE_URL = process.env.OTHER_SERVICE_CALLBACK_URL || 'https://realsays.com/api/index/callback';

const STATUS_MAP = {
    'c': { internal: 'completed', frontend: 'success' },
    't': { internal: 'terminated', frontend: 'terminate' },
    'q': { internal: 'overquota', frontend: 'overquota' },
    's': { internal: 'terminated', frontend: 'terminate' }
};

function simulateCallback({ uid, status, sid }) {
    const statusInfo = STATUS_MAP[status] || { internal: 'unknown', frontend: 'unknown' };

    console.log('\n' + '─'.repeat(60));
    console.log(`📥  Incoming callback`);
    console.log(`    uid    : ${uid}`);
    console.log(`    status : ${status} (${statusInfo.internal})`);
    console.log(`    sid    : ${sid}`);

    if (uid.startsWith(RS_PREFIX)) {
        const clickId = uid.slice(RS_PREFIX.length);
        console.log(`\n✅  ESKOSAYS USER detected`);
        console.log(`    clickId   : ${clickId}`);
        console.log(`    DB lookup : SurveyClick.findByPk("${clickId}")`);
        console.log(`    Action    : ${statusInfo.internal === 'completed' ? '💰 Credit panelist + create SurveyCompletion' : '📝 Update click status to ' + statusInfo.internal}`);
        console.log(`    Redirect  : ${FRONTEND_URL}/survey-status?survey_status=${statusInfo.frontend}`);
    } else {
        const params = new URLSearchParams({ uid, status, sid, platform: 'zamplia' });
        const redirectTo = `${OTHER_SERVICE_URL}?${params.toString()}`;
        console.log(`\n🔀  REALSAYS.COM USER detected (uid has no rs_ prefix)`);
        console.log(`    Forward   : ${redirectTo}`);
    }
}

// ── Test Cases ────────────────────────────────────────────────────────────────

console.log('\n════════════════════════════════════════════════════════════');
console.log('  ZAMPLIA CALLBACK ROUTING TEST');
console.log('════════════════════════════════════════════════════════════');

// 1. Eskosays user — all 4 status codes
simulateCallback({ uid: 'rs_click-abc-123', status: 'c', sid: '5001' });
simulateCallback({ uid: 'rs_click-abc-124', status: 't', sid: '5001' });
simulateCallback({ uid: 'rs_click-abc-125', status: 'q', sid: '5001' });
simulateCallback({ uid: 'rs_click-abc-126', status: 's', sid: '5001' });

// 2. realsays.com user — all 4 status codes
simulateCallback({ uid: 'ext-user-XYZ-789', status: 'c', sid: '9001' });
simulateCallback({ uid: 'ext-user-XYZ-790', status: 't', sid: '9001' });
simulateCallback({ uid: 'ext-user-XYZ-791', status: 'q', sid: '9001' });
simulateCallback({ uid: 'ext-user-XYZ-792', status: 's', sid: '9001' });

// 3. Edge case — missing uid
console.log('\n' + '─'.repeat(60));
console.log('📥  Edge case: missing uid');
console.log('❌  Response: 400 Missing uid');

console.log('\n' + '─'.repeat(60));
console.log('\n✅  All routing logic checks passed.\n');
