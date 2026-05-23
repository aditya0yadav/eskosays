const admin = require("firebase-admin");

const fs = require('fs');
const path = require('path');

const credPath = path.join(process.cwd(), 'realsays-cred.json');
let serviceAccount;

if (fs.existsSync(credPath)) {
    try {
        serviceAccount = require(credPath);
    } catch (e) {
        console.error('Firebase: Error loading realsays-cred.json:', e.message);
    }
}

if (!serviceAccount && process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } catch (e) {
        console.error('Firebase: Error parsing FIREBASE_SERVICE_ACCOUNT env:', e.message);
    }
}

if (serviceAccount) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
} else {
    console.warn('Firebase: No credentials found. Admin features may be disabled.');
}

module.exports = admin;
