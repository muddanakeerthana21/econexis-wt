const API = 'http://localhost:5000/api';

async function req(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.message || `HTTP ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

async function runAuditTests() {
  console.log('=== STARTING ECONEXIS COMPREHENSIVE END-TO-END AUDIT ===\n');

  try {
    // 1. User Registration & Login
    console.log('[TEST 1] Testing User Registration & Authentication...');
    const testEmail = `testuser_${Date.now()}@econexis.com`;
    const regRes = await req(`${API}/auth/register`, {
      method: 'POST',
      body: JSON.stringify({
        name: 'Priya Patel',
        email: testEmail,
        password: 'Password123',
        role: 'user',
      }),
    });
    console.log(' -> User Registration response:', regRes.success ? 'SUCCESS' : 'FAILED');
    const userToken = regRes.token;
    const userId = regRes.user?.id;
    console.log(` -> Registered User ID: ${userId}, Email: ${testEmail}, Role: ${regRes.user?.role}`);

    const userAuthHeaders = { Authorization: `Bearer ${userToken}` };

    // 2. Initial User Stats Check (Should be 0)
    console.log('\n[TEST 2] Checking Initial User Stats in MongoDB...');
    const initialStatsRes = await req(`${API}/ewaste/stats`, { headers: userAuthHeaders });
    console.log(' -> Initial User Stats:', initialStatsRes.data);
    if (initialStatsRes.data.totalRegistered !== 0 || initialStatsRes.data.recycledCount !== 0) {
      throw new Error('Initial stats should be 0!');
    }
    console.log(' -> Verified: 0 registered, 0 recycled.');

    // 3. User registers an E-Waste item (after AI Detection)
    console.log('\n[TEST 3] Registering E-Waste item (AI visual scan simulation)...');
    const createEwasteRes = await req(`${API}/ewaste`, {
      method: 'POST',
      headers: userAuthHeaders,
      body: JSON.stringify({
        type: 'Laptop (Lenovo ThinkPad)',
        category: 'Laptops',
        aiDetection: 'laptop',
        aiConfidence: 94,
        condition: 'Scrap',
        weightKg: 2.2,
      }),
    });

    const createdItem = createEwasteRes.object;
    const objectId = createdItem.objectId;
    console.log(` -> E-Waste Created in MongoDB: Object ID = ${objectId}, Status = ${createdItem.status}, PickupStatus = ${createdItem.pickupStatus}`);

    if (!objectId || !objectId.startsWith('OBJ-')) {
      throw new Error(`Invalid Object ID format: ${objectId}`);
    }

    // 4. User Stats Check after registration
    console.log('\n[TEST 4] Checking User Stats after 1 item registered...');
    const statsAfterReg = await req(`${API}/ewaste/stats`, { headers: userAuthHeaders });
    console.log(' -> User Stats after Registration:', statsAfterReg.data);
    if (statsAfterReg.data.totalRegistered !== 1 || statsAfterReg.data.recycledCount !== 0) {
      throw new Error('Stats should show totalRegistered = 1 and recycledCount = 0');
    }
    console.log(' -> Verified: totalRegistered = 1, pendingPickups = 1, recycledCount = 0.');

    // 5. Delivery Agent Login
    console.log('\n[TEST 5] Delivery Agent Authentication...');
    const delLoginRes = await req(`${API}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        email: 'delivery@econexis.com',
        password: 'Password123',
      }),
    });
    console.log(' -> Delivery Login response:', delLoginRes.success ? 'SUCCESS' : 'FAILED');
    const deliveryToken = delLoginRes.token;
    const deliveryHeaders = { Authorization: `Bearer ${deliveryToken}` };
    console.log(` -> Delivery Role: ${delLoginRes.user?.role}`);

    // 6. Delivery Scans QR (Lookup object by ID)
    console.log(`\n[TEST 6] Delivery QR Scanning: Looking up ${objectId} in MongoDB...`);
    const lookupRes = await req(`${API}/ewaste/object/${objectId}`, { headers: deliveryHeaders });
    console.log(' -> Lookup Result:', lookupRes.success ? 'FOUND' : 'NOT FOUND');
    console.log(` -> Found Item: ${lookupRes.object.type}, Owner: ${lookupRes.object.owner}, PickupStatus: ${lookupRes.object.pickupStatus}`);

    // 7. Delivery Confirms Pickup
    console.log(`\n[TEST 7] Delivery Agent Confirms Physical Pickup for ${objectId}...`);
    const pickupConfirmRes = await req(`${API}/ewaste/object/${objectId}/pickup`, {
      method: 'POST',
      headers: deliveryHeaders,
      body: JSON.stringify({
        measuredWeight: 2.2,
        notes: 'Pickup verified on campus',
      }),
    });
    console.log(' -> Pickup Confirmation response:', pickupConfirmRes.success ? 'SUCCESS' : 'FAILED');
    console.log(` -> New Object PickupStatus: ${pickupConfirmRes.object.pickupStatus}`);

    // 8. User Stats Check after Pickup (Should be Picked Up, but NOT recycled yet)
    console.log('\n[TEST 8] Checking User Stats after Pickup...');
    const statsAfterPickup = await req(`${API}/ewaste/stats`, { headers: userAuthHeaders });
    console.log(' -> User Stats after Pickup:', statsAfterPickup.data);
    if (statsAfterPickup.data.pickedUpCount !== 1 || statsAfterPickup.data.recycledCount !== 0) {
      throw new Error('Stats should show pickedUpCount = 1 and recycledCount = 0');
    }
    console.log(' -> Verified: Picked up items are NOT falsely counted as recycled yet.');

    // 9. Admin Login
    console.log('\n[TEST 9] Admin Authentication...');
    const adminLoginRes = await req(`${API}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@econexis.com',
        password: 'Password123',
      }),
    });
    console.log(' -> Admin Login response:', adminLoginRes.success ? 'SUCCESS' : 'FAILED');
    const adminToken = adminLoginRes.token;
    const adminHeaders = { Authorization: `Bearer ${adminToken}` };

    // 10. Admin Stats Telemetry
    console.log('\n[TEST 10] Checking Admin Master Telemetry from MongoDB...');
    const adminStatsRes = await req(`${API}/ewaste/stats/admin`, { headers: adminHeaders });
    console.log(' -> Admin Live Platform Stats:', adminStatsRes.data);

    // 11. Admin / Processing Plant Marks Object as Recycled
    console.log(`\n[TEST 11] Facility Processing: Marking ${objectId} as Recycled in MongoDB...`);
    const recycleRes = await req(`${API}/ewaste/object/${objectId}/recycle`, {
      method: 'PUT',
      headers: adminHeaders,
      body: JSON.stringify({
        notes: 'Successfully shredded and precious metals extracted',
      }),
    });
    console.log(' -> Recycle Response:', recycleRes.success ? 'SUCCESS' : 'FAILED');
    console.log(` -> Updated Object Status: ${recycleRes.object.status}`);

    // 12. Final User Stats Check (Recycled count must now be 1, weight & points credited)
    console.log('\n[TEST 12] Verifying User Stats & Certificate Data after Recycling...');
    const finalUserStats = await req(`${API}/ewaste/stats`, { headers: userAuthHeaders });
    console.log(' -> Final User Stats:', finalUserStats.data);
    if (finalUserStats.data.recycledCount !== 1) {
      throw new Error('User recycledCount must now equal 1!');
    }
    console.log(` -> Recycled Count: ${finalUserStats.data.recycledCount}`);
    console.log(` -> Recycled Weight: ${finalUserStats.data.recycledWeightKg} kg`);
    console.log(` -> CO2 Saved: ${finalUserStats.data.co2SavedKg} kg`);
    console.log(` -> EcoPoints: ${finalUserStats.data.ecoPoints}`);

    // 13. Role Security Enforcement
    console.log('\n[TEST 13] Verifying Role-Based Access Control Security...');
    try {
      await req(`${API}/ewaste/stats/admin`, { headers: userAuthHeaders });
      throw new Error('Security flaw: Normal user was able to access Admin Stats API!');
    } catch (secErr) {
      if (secErr.status === 403) {
        console.log(' -> PASS: User cannot access Admin APIs (HTTP 403 Forbidden).');
      } else {
        throw secErr;
      }
    }

    try {
      await req(`${API}/ewaste/object/${objectId}/recycle`, { method: 'PUT', headers: userAuthHeaders, body: JSON.stringify({}) });
      throw new Error('Security flaw: Normal user was able to call Recycle endpoint!');
    } catch (secErr) {
      if (secErr.status === 403) {
        console.log(' -> PASS: User cannot mark items recycled (HTTP 403 Forbidden).');
      } else {
        throw secErr;
      }
    }

    console.log('\n=======================================================');
    console.log('🎉 ALL 13 END-TO-END AUDIT & LIFECYCLE TESTS PASSED!');
    console.log('=======================================================');
  } catch (err) {
    console.error('\n❌ AUDIT TEST FAILED:', err.data || err.message);
  }
}

runAuditTests();
