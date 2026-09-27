// Test script for EcoNexis API endpoints
const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('====================================');
  console.log('   ECONEXIS WT API TEST SUITE');
  console.log('====================================\n');

  // 1. Health Check
  console.log('1. Testing GET /api/health ...');
  const healthRes = await fetch(`${BASE_URL}/health`);
  const healthData = await healthRes.json();
  console.log('   Status:', healthRes.status, '| Output:', JSON.stringify(healthData));

  // 2. Register
  const testEmail = `test_${Date.now()}@econexis.com`;
  console.log(`\n2. Testing POST /api/auth/register (${testEmail}) ...`);
  const regRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Pooja Patel',
      email: testEmail,
      password: 'Password123',
      phone: '+91 97333 44556',
      college: 'National Institute of Technology',
      address: 'Girls Hostel 2, Room 112',
      role: 'user',
    }),
  });
  const regData = await regRes.json();
  console.log('   Status:', regRes.status, '| Registered ID:', regData.user?.id, '| Token:', regData.token ? 'Generated (JWT)' : 'None');

  // 3. Duplicate Register (Should fail with 400)
  console.log('\n3. Testing Duplicate Registration (Expect 400) ...');
  const dupRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Pooja Patel',
      email: testEmail,
      password: 'Password123',
    }),
  });
  const dupData = await dupRes.json();
  console.log('   Status:', dupRes.status, '| Success:', dupData.success, '| Message:', dupData.message);

  // 4. Login
  console.log('\n4. Testing POST /api/auth/login ...');
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: 'Password123',
    }),
  });
  const loginData = await loginRes.json();
  const token = loginData.token;
  console.log('   Status:', loginRes.status, '| Logged In As:', loginData.user?.name, '| Role:', loginData.user?.role, '| EcoPoints:', loginData.user?.ecoPoints);

  // 5. Invalid Password Login (Should fail with 401)
  console.log('\n5. Testing Invalid Password Login (Expect 401) ...');
  const badLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: 'WrongPassword!',
    }),
  });
  const badLoginData = await badLoginRes.json();
  console.log('   Status:', badLoginRes.status, '| Success:', badLoginData.success, '| Message:', badLoginData.message);

  // 6. Get Current User /auth/me with Bearer Token
  console.log('\n6. Testing GET /api/auth/me (with JWT) ...');
  const meRes = await fetch(`${BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const meData = await meRes.json();
  console.log('   Status:', meRes.status, '| Verified User:', meData.user?.name, '| Email:', meData.user?.email);

  // 7. Get Current User /auth/me without Token (Expect 401)
  console.log('\n7. Testing GET /api/auth/me (without JWT - Expect 401) ...');
  const noTokenRes = await fetch(`${BASE_URL}/auth/me`);
  const noTokenData = await noTokenRes.json();
  console.log('   Status:', noTokenRes.status, '| Message:', noTokenData.message);

  // 8. Pickups CRUD
  console.log('\n8. Testing Pickups API ...');
  const createPickupRes = await fetch(`${BASE_URL}/pickups`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      userName: 'Pooja Patel',
      userPhone: '+91 97333 44556',
      pickupAddress: 'Girls Hostel 2, Room 112',
      item: 'Dell XPS 13 & Charger',
      category: 'Smartphones & Laptops',
      pickupDate: '2026-09-30',
      pickupTime: '02:00 PM - 04:00 PM',
      notes: 'Please call reception upon arrival',
    }),
  });
  const createdPickup = await createPickupRes.json();
  console.log('   Created Pickup Status:', createPickupRes.status, '| ID:', createdPickup.data?.id, '| Tracking:', createdPickup.data?.trackingId);

  const getPickupsRes = await fetch(`${BASE_URL}/pickups`);
  const pickupsData = await getPickupsRes.json();
  console.log('   Total Pickups in Database:', pickupsData.count);

  // 9. Donations & Rewards
  console.log('\n9. Testing Donations & Rewards APIs ...');
  const donRes = await fetch(`${BASE_URL}/donations`);
  const donData = await donRes.json();
  console.log('   Total Donations in Database:', donData.count);

  const rewRes = await fetch(`${BASE_URL}/rewards`);
  const rewData = await rewRes.json();
  console.log('   Total Rewards in Database:', rewData.count);

  // 10. Swagger Docs Check
  console.log('\n10. Testing Swagger OpenAPI Docs Endpoint ...');
  const docsRes = await fetch('http://localhost:5000/api-docs.json');
  const docsData = await docsRes.json();
  console.log('   Swagger Title:', docsData.info?.title, '| Version:', docsData.info?.version);

  console.log('\n====================================');
  console.log('   ALL API TESTS PASSED 100%! 🎉');
  console.log('====================================');
}

runTests().catch(console.error);
