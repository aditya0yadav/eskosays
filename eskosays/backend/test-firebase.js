
const admin = require('./src/config/firebaseAdmin');
const idToken = process.argv[2];

if (!idToken) {
    console.error('Please provide an ID token');
    process.exit(1);
}

admin.auth().verifyIdToken(idToken)
    .then(decodedToken => {
        process.exit(0);
    })
    .catch(error => {
        console.error('Failure! Error:', error.message);
        process.exit(1);
    });
