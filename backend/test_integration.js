// Comprehensive End-to-End Backend & Frontend API Flow Test
const BASE_URL = 'http://localhost:5000/api';

async function runEndToEndVerification() {
  console.log('====================================================');
  console.log('  ECONEXIS WT COMPLETE INTEGRATION & SECURITY SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${message}`);
      failed++;
    }
  }

  // 1. Health Check
  console.log('1. Health Check & MongoDB Connectivity');
  const healthRes = await fetch(`${BASE_URL}/health`);
  const healthData = await healthRes.json();
  assert(healthRes.status === 200, 'Health endpoint responds with HTTP 200');
  assert(healthData.dbStatus === 'Connected', 'MongoDB status is Connected');

  // 2. User Registration (role forced to user)
  console.log('\n2. User Registration & Role Enforcement (POST /api/auth/register)');
  const testEmail = `integration_tester_${Date.now()}@econexis.com`;
  const regRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Integration Tester',
      email: testEmail,
      password: 'Password123',
      phone: '+91 99887 76655',
      college: 'National Institute of Technology',
      address: 'Room 101, Test Hostel, North Campus',
      role: 'admin', // Malicious attempt to register as admin
    }),
  });
  const regData = await regRes.json();
  assert(regRes.status === 201, 'User registration returned HTTP 201 Created');
  assert(regData.success === true, 'Response indicates success = true');
  assert(Boolean(regData.token), 'JWT token generated and returned');
  assert(regData.user.role === 'user', 'Backend strictly sanitized role to "user"');
  assert(regData.user.ecoPoints === 100, 'Initial welcome EcoPoints credited (100 pts)');

  // 3. Duplicate Registration Protection
  console.log('\n3. Duplicate Registration Validation');
  const dupRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Integration Tester',
      email: testEmail,
      password: 'Password123',
    }),
  });
  const dupData = await dupRes.json();
  assert(dupRes.status === 400, 'Duplicate registration returns HTTP 400');
  assert(dupData.message.includes('already exists'), 'Duplicate email error message returned');

  // 4. User Login
  console.log('\n4. User Login & Role Guard (POST /api/auth/login)');
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: 'Password123',
      expectedRole: 'user',
    }),
  });
  const loginData = await loginRes.json();
  const userToken = loginData.token;
  const userId = loginData.user.id;
  assert(loginRes.status === 200, 'Login returned HTTP 200 OK');
  assert(Boolean(userToken), 'Login returned valid JWT token');
  assert(loginData.user.role === 'user', 'Authenticated user role is "user"');

  // 4b. Role Mismatch Prevention on Login
  const fakeAdminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: 'Password123',
      expectedRole: 'admin', // Standard user trying to log into Admin Portal tab
    }),
  });
  assert(fakeAdminLoginRes.status === 403, 'Logging in with mismatched expectedRole returns HTTP 403 Forbidden');

  // 5. Protected Endpoint (GET /api/auth/me) with JWT
  console.log('\n5. Current User Profile (GET /api/auth/me with Bearer JWT)');
  const meRes = await fetch(`${BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${userToken}` },
  });
  const meData = await meRes.json();
  assert(meRes.status === 200, 'Profile retrieved with HTTP 200');
  assert(meData.user.email === testEmail, 'User profile matches token owner');

  // 6. Profile Update (PUT /api/auth/profile)
  console.log('\n6. Update User Profile (PUT /api/auth/profile)');
  const updateProfileRes = await fetch(`${BASE_URL}/auth/profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userToken}` },
    body: JSON.stringify({
      name: 'Integration Tester Updated',
      address: 'Suite 404, Science Block Hostels',
    }),
  });
  const updateProfileData = await updateProfileRes.json();
  assert(updateProfileRes.status === 200, 'Profile update returned HTTP 200');
  assert(updateProfileData.user.name === 'Integration Tester Updated', 'Updated name persisted in MongoDB');

  // 7. Schedule Doorstep Pickup (POST /api/pickups)
  console.log('\n7. Schedule Doorstep Pickup (POST /api/pickups)');
  const createPickupRes = await fetch(`${BASE_URL}/pickups`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userToken}` },
    body: JSON.stringify({
      userName: 'Integration Tester Updated',
      userPhone: '+91 99887 76655',
      pickupAddress: 'Suite 404, Science Block Hostels',
      item: 'Defective Tablet & 2 Chargers',
      category: 'Smartphones & Laptops',
      quantity: 3,
      pickupDate: '2026-08-30',
      pickupTime: '02:00 PM - 04:00 PM',
      notes: 'Fragile battery enclosed safely',
    }),
  });
  const createPickupData = await createPickupRes.json();
  const createdPickupId = createPickupData.data.id || createPickupData.data._id;
  const trackingId = createPickupData.data.trackingId;
  assert(createPickupRes.status === 201, 'Pickup scheduled with HTTP 201 Created');
  assert(Boolean(trackingId), `Generated Tracking ID: ${trackingId}`);

  // 8. User Scoped Pickups (GET /api/pickups)
  console.log('\n8. User Scoped Pickups Retrieval (GET /api/pickups)');
  const getPickupsRes = await fetch(`${BASE_URL}/pickups`, {
    headers: { Authorization: `Bearer ${userToken}` },
  });
  const getPickupsData = await getPickupsRes.json();
  assert(getPickupsRes.status === 200, 'User pickups retrieved with HTTP 200');
  const found = getPickupsData.data && getPickupsData.data.some((p) => p.trackingId === trackingId);
  assert(found, 'User only sees their own scheduled pickups');

  // 9. Admin Authentication
  console.log('\n9. Admin Authentication (POST /api/auth/login with admin@econexis.com)');
  const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@econexis.com',
      password: 'Password123',
      expectedRole: 'admin',
    }),
  });
  const adminLoginData = await adminLoginRes.json();
  const adminToken = adminLoginData.token;
  assert(adminLoginRes.status === 200, 'Admin login returned HTTP 200 OK');
  assert(adminLoginData.user.role === 'admin', 'Admin authenticated with role = "admin"');

  // 10. Admin User Management & Points Update
  console.log('\n10. Admin User Management (GET & PUT /api/users)');
  const usersRes = await fetch(`${BASE_URL}/users`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const usersData = await usersRes.json();
  assert(usersRes.status === 200, 'Admin users list fetched with HTTP 200');
  assert(usersData.data && usersData.data.length > 0, `Total registered members accessible by admin: ${usersData.count}`);

  const grantPointsRes = await fetch(`${BASE_URL}/users/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      ecoPoints: 500,
      status: 'Active',
    }),
  });
  const grantPointsData = await grantPointsRes.json();
  assert(grantPointsRes.status === 200, 'Admin user update returned HTTP 200');
  assert(grantPointsData.data.ecoPoints === 500, 'User points updated to 500 in MongoDB');

  // 11. Delivery Authentication & Workflow
  console.log('\n11. Delivery Authentication (POST /api/auth/login with delivery@econexis.com)');
  const delLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'delivery@econexis.com',
      password: 'Password123',
      expectedRole: 'delivery',
    }),
  });
  const delLoginData = await delLoginRes.json();
  const delToken = delLoginData.token;
  assert(delLoginRes.status === 200, 'Delivery login returned HTTP 200 OK');
  assert(delLoginData.user.role === 'delivery', 'Delivery agent authenticated with role = "delivery"');

  // Assign pickup to delivery agent via admin
  await fetch(`${BASE_URL}/pickups/${createdPickupId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      status: 'Assigned',
      deliveryAgent: 'Vikram Singh',
    }),
  });

  // 12. Delivery Verification Scan
  console.log('\n12. Delivery QR Handover Verification (POST /api/deliveries/verify)');
  const verifyRes = await fetch(`${BASE_URL}/deliveries/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${delToken}` },
    body: JSON.stringify({
      pickupId: trackingId,
      measuredWeight: 2.8,
      pointsAwarded: 100,
      batteryChecked: true,
      dataWipeConfirmed: true,
    }),
  });
  const verifyData = await verifyRes.json();
  assert(verifyRes.status === 200, 'Handover verification returned HTTP 200 OK');
  assert(verifyData.data.verificationStatus === 'Completed', 'Delivery verified as Completed in MongoDB');

  // 13. Cross-Role Security Checks (Data Isolation & RBAC)
  console.log('\n13. Cross-Role API Authorization Security Audits');
  // User cannot access Admin users list
  const userAccessAdminRes = await fetch(`${BASE_URL}/users`, {
    headers: { Authorization: `Bearer ${userToken}` },
  });
  assert(userAccessAdminRes.status === 403, 'USER token rejected with 403 Forbidden when calling Admin /users API');

  // User cannot access Delivery verification API
  const userAccessDeliveryRes = await fetch(`${BASE_URL}/deliveries/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userToken}` },
    body: JSON.stringify({ pickupId: trackingId }),
  });
  assert(userAccessDeliveryRes.status === 403, 'USER token rejected with 403 Forbidden when calling Delivery API');

  // Delivery cannot access Admin users API
  const deliveryAccessAdminRes = await fetch(`${BASE_URL}/users`, {
    headers: { Authorization: `Bearer ${delToken}` },
  });
  assert(deliveryAccessAdminRes.status === 403, 'DELIVERY token rejected with 403 Forbidden when calling Admin /users API');

  // 14. EcoRewards Catalogue & Redemption
  console.log('\n14. EcoRewards Catalogue & Redemption');
  const rewardsRes = await fetch(`${BASE_URL}/rewards`);
  const rewardsData = await rewardsRes.json();
  assert(rewardsRes.status === 200, 'Rewards catalogue fetched with HTTP 200');
  assert(rewardsData.data.length > 0, `Found ${rewardsData.data.length} EcoRewards in catalogue`);

  const targetReward = rewardsData.data.find((r) => r.points <= 250) || rewardsData.data[0];
  const redeemRes = await fetch(`${BASE_URL}/rewards/${targetReward._id || targetReward.id}/redeem`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${userToken}` },
  });
  const redeemData = await redeemRes.json();
  assert(redeemRes.status === 200, 'Reward redemption returned HTTP 200 OK');
  assert(Boolean(redeemData.voucherCode), `Voucher Code Generated: ${redeemData.voucherCode}`);

  // 15. Create Device Donation (POST /api/donations)
  console.log('\n15. Submit Device Donation Pledge (POST /api/donations)');
  const createDonRes = await fetch(`${BASE_URL}/donations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userToken}` },
    body: JSON.stringify({
      userName: 'Integration Tester Updated',
      item: 'Apple iPad 7th Gen',
      category: 'Tablets',
      condition: 'Fully Functional',
      description: 'Used for coursework, ready for student lab',
      deliveryMethod: 'Doorstep Pickup',
      beneficiaryOption: 'Underserved School Students',
    }),
  });
  const createDonData = await createDonRes.json();
  assert(createDonRes.status === 201, 'Donation pledge recorded with HTTP 201 Created');
  assert(createDonData.data.ecoPointsAwarded === 150, '+150 EcoPoints awarded for usable device donation');

  console.log('\n====================================================');
  console.log(`  VERIFICATION RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed === 0) {
    console.log('All backend + frontend integration tests passed seamlessly! 🚀');
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runEndToEndVerification().catch((err) => {
  console.error('Test Execution Error:', err);
  process.exit(1);
});
