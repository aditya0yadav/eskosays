const http = require('http');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const makeRequest = (data, ip) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: process.env.PORT || 5001,
      path: '/api/fraud/check',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        'X-Forwarded-For': ip
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => { responseData += chunk; });
      res.on('end', () => {
        try {
            const parsed = JSON.parse(responseData);
            if (res.statusCode >= 400) {
               console.log(`Status: ${res.statusCode} | Body: ${JSON.stringify(parsed)}`);
            } else {
               console.log(`Status: ${res.statusCode} | Score: ${parsed.score} | Allowed: ${parsed.allowed} | Reason: ${parsed.reason}`);
            }
            resolve(parsed);
        } catch (e) {
            console.log(`Status: ${res.statusCode} | Body: ${responseData}`);
            resolve(responseData);
        }
      });
    });

    req.on('error', (error) => {
      console.error(`[Error] ${error.message}`);
      reject(error);
    });

    req.write(data);
    req.end();
  });
};

async function runTests() {
  const ip1 = `203.0.113.${Math.floor(Math.random() * 255)}`;
  const fp1 = 'hash-user-A-' + Date.now();
  const fp2 = 'hash-user-B-' + Date.now();
  const surveyId1 = 'survey-test-1-' + Date.now();
  const surveyId2 = 'survey-test-2-' + Date.now();

  console.log("--- Request 1: Fresh User (Should be score 100, allowed) ---");
  await makeRequest(JSON.stringify({ fingerprintHash: fp1, surveyId: surveyId1, platform: "goweb", username: "userA" }), ip1);
  await delay(100);

  console.log("\n--- Request 2: Same User, Different Survey (Should deduct 10 -> score 90, allowed=true) ---");
  // Expected: score 90. allowed: true (since it's a different survey id)
  await makeRequest(JSON.stringify({ fingerprintHash: fp1, surveyId: surveyId2, platform: "goweb", username: "userA" }), ip1);
  await delay(100);

  console.log("\n--- Request 3: Different Fingerprint, Same IP, Same Survey (Should deduct 30 -> score 70) ---");
  // Same survey as request 2, same IP, different FP
  await makeRequest(JSON.stringify({ fingerprintHash: fp2, surveyId: surveyId2, platform: "goweb", username: "userB" }), ip1);
  await delay(100);

  console.log("\n--- Request 4: Identical User, Same Survey (Should deduct 40 -> score 60, blocked) ---");
  // Same survey 2 user from earlier (fp1)
  await makeRequest(JSON.stringify({ fingerprintHash: fp1, surveyId: surveyId2, platform: "goweb", username: "userA" }), ip1);
  await delay(100);

  console.log("\n--- Done ---");
}

runTests();
