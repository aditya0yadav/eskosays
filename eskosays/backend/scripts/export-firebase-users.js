/**
 * Export all Firebase Auth users to console / JSON file
 * Run: node scripts/export-firebase-users.js
 */
require('dotenv').config();
const admin = require('../src/config/firebaseAdmin');
const fs = require('fs');

async function exportUsers() {
    const allUsers = [];
    let pageToken;

    console.log('Fetching Firebase users...');

    do {
        const result = await admin.auth().listUsers(1000, pageToken);
        result.users.forEach(user => {
            allUsers.push({
                uid: user.uid,
                email: user.email || '—',
                displayName: user.displayName || '—',
                provider: user.providerData.map(p => p.providerId).join(', '),
                emailVerified: user.emailVerified,
                createdAt: user.metadata.creationTime,
                lastSignIn: user.metadata.lastSignInTime,
            });
        });
        pageToken = result.pageToken;
    } while (pageToken);

    console.log(`\nTotal users: ${allUsers.length}\n`);
    console.table(allUsers.map(u => ({
        email: u.email,
        provider: u.provider,
        verified: u.emailVerified,
        created: u.createdAt
    })));

    // Also save to file
    fs.writeFileSync('scripts/firebase-users-export.json', JSON.stringify(allUsers, null, 2));
    console.log('\n✅ Saved to scripts/firebase-users-export.json');
}

exportUsers().catch(console.error);
