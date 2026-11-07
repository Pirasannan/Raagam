import assert from 'node:assert/strict';

const origin = process.env.TEST_URL || 'http://localhost:3000';
const request = (path, options) => fetch(new URL(path, origin), options);
const post = (body) => ({
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
});

const home = await request('/');
assert.equal(home.status, 200);
const html = await home.text();
assert.match(html, /<title>Raagam/);
assert.doesNotMatch(html, /open_auth_modal|raga_user_session|>Login<|>Sign Up</);

for (const path of ['/melakarta', '/privacy', '/?tab=ragas', '/?tab=radio', '/?tab=downloads', '/?tab=sos', '/?tab=updates']) {
  assert.equal((await request(path)).status, 200, `${path} must work anonymously`);
}
for (const path of ['/api/auth/login', '/api/auth/signup']) {
  assert.equal((await request(path, post({ email: 'smoke@example.invalid' }))).status, 404, `${path} must not accept accounts`);
}
assert.equal((await request('/api/admin/rules')).status, 401);
assert.equal((await request('/api/admin/verify', post({ secretKey: 'ragamaster2026' }))).status, 401);

const identified = await request('/api/identify-raga', post({
  mode: 'swaras', swaras: ['S', 'R2', 'G3', 'P', 'D2'], traditionPreference: 'Carnatic',
  // A visitor's key must not be needed or used by the public endpoint.
  aiApiKey: 'invalid-visitor-key', aiProvider: 'openai',
}));
assert.equal(identified.status, 200);
const result = await identified.json();
assert.equal(result.success, true, JSON.stringify(result));
assert.ok(result.raga?.name);
console.log(`Passed: anonymous pages, removed account endpoints, protected admin, and raga search (${result.raga.name}).`);
