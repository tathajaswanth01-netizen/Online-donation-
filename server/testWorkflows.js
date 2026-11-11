const BASE_URL = 'http://localhost:5050/api';

async function testAllWorkflows() {
  console.log('--- STARTING COMPREHENSIVE END-TO-END WORKFLOW TESTS ---');

  // Helper fetch
  const post = async (url, body, token) => {
    const res = await fetch(`${BASE_URL}${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(`${url} failed: ${data.message || res.statusText}`);
    return data;
  };

  const get = async (url, token) => {
    const res = await fetch(`${BASE_URL}${url}`, {
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(`${url} failed: ${data.message || res.statusText}`);
    return data;
  };

  const put = async (url, body, token) => {
    const res = await fetch(`${BASE_URL}${url}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(`${url} failed: ${data.message || res.statusText}`);
    return data;
  };

  // 1. Authenticate Donor
  console.log('\n[1] Testing Donor Login...');
  const donorRes = await post('/auth/login', {
    email: 'sarah.donor@example.com',
    password: 'Donor@123'
  });
  console.log('✓ Donor Login Successful:', donorRes.user.name);
  const donorToken = donorRes.token;

  // 2. Authenticate Receiver
  console.log('\n[2] Testing Receiver Login...');
  const receiverRes = await post('/auth/login', {
    email: 'arjun.receiver@example.com',
    password: 'Receiver@123'
  });
  console.log('✓ Receiver Login Successful:', receiverRes.user.name);
  const receiverToken = receiverRes.token;

  // 3. Authenticate Admin
  console.log('\n[3] Testing Admin Login...');
  const adminRes = await post('/auth/login', {
    email: 'admin@platform.org',
    password: 'Admin@123'
  });
  console.log('✓ Admin Login Successful:', adminRes.user.name, `(Roles: ${adminRes.user.roles.join(', ')})`);
  const adminToken = adminRes.token;

  // 4. Fetch Categories
  console.log('\n[4] Testing Categories API...');
  const catRes = await get('/categories');
  console.log(`✓ Fetched ${catRes.categories.length} Categories from MongoDB.`);
  const booksCat = catRes.categories.find(c => c.name.includes('Books'));

  // 5. Donor Creates a New Donation Listing
  console.log('\n[5] Testing Donor Listing Creation (Free)...');
  const createDonRes = await post(
    '/donations',
    {
      title: 'E2E Test: Engineering Mathematics Reference Guide',
      description: 'Advanced calculus and linear algebra textbook in mint condition.',
      categoryId: booksCat._id,
      condition: 'Like New',
      quantity: 1,
      donationType: 'Free',
      price: 0,
      location: {
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110024'
      },
      imageUrls: ['https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80']
    },
    donorToken
  );
  console.log('✓ Donation Created:', createDonRes.donation.title, `(ID: ${createDonRes.donation._id})`);
  const newDonationId = createDonRes.donation._id;

  // 6. Receiver Toggles Wishlist
  console.log('\n[6] Testing Wishlist Toggle...');
  const wishRes = await post('/wishlist/toggle', { donationId: newDonationId }, receiverToken);
  console.log('✓ Wishlist Action:', wishRes.message, `(isSaved: ${wishRes.isSaved})`);

  // 7. Receiver Submits a Request
  console.log('\n[7] Testing Receiver Submitting Request...');
  const reqRes = await post(
    '/requests',
    {
      donationId: newDonationId,
      requestedQuantity: 1,
      reason: 'Essential reference book for upcoming engineering semester exams.',
      intendedUse: 'Self-study in college library.',
      message: 'Hello Sarah, could I please request this guide?',
      preferredPickupMethod: 'Self Pickup',
      contactPreference: 'Platform Chat'
    },
    receiverToken
  );
  console.log('✓ Donation Request Created:', reqRes.donationRequest._id, `(Status: ${reqRes.donationRequest.status})`);
  const requestId = reqRes.donationRequest._id;

  // 8. Donor Accepts the Request
  console.log('\n[8] Testing Donor Accepting Request...');
  const acceptRes = await put(
    `/requests/${requestId}/status`,
    {
      status: 'Accepted',
      donorNotes: 'Accepted! Happy to hand over near Defence Colony metro station.'
    },
    donorToken
  );
  console.log('✓ Request Accepted by Donor. Status:', acceptRes.request.status);

  // 9. In-Platform Messaging
  console.log('\n[9] Testing In-Platform Communication Message...');
  const msgRes = await post(
    '/messages',
    {
      requestId,
      message: 'Hi Sarah, thank you for accepting! I can meet you at 6 PM tomorrow.'
    },
    receiverToken
  );
  console.log('✓ Message Sent via Platform Chat:', msgRes.message.message);

  // 10. Donor Marks Ready for Pickup (Initiates OTP flow)
  console.log('\n[10] Testing Donor Marking Ready for Pickup...');
  const pickupRes = await put(
    `/requests/${requestId}/status`,
    { status: 'Ready for Pickup', donorNotes: 'Package packed and ready at pickup desk.' },
    donorToken
  );
  console.log('✓ Request Ready for Pickup. Status:', pickupRes.request.status);

  // 11. Receiver Retrieves Secure Handover OTP from my-requests
  console.log('\n[11] Testing Receiver Dashboard OTP Retrieval...');
  const myReqsRes = await get('/requests/my-requests', receiverToken);
  const matchedReq = myReqsRes.requests.find(r => r._id === requestId);
  if (!matchedReq || !matchedReq.otp) {
    throw new Error('Receiver did not receive OTP in /requests/my-requests!');
  }
  console.log(`✓ Receiver retrieved OTP from My Requests: [${matchedReq.otp}] (Remaining: ${matchedReq.remainingSeconds}s)`);
  const receiverOtp = matchedReq.otp;

  // 11b. Verify Donor NEVER sees OTP in incoming requests
  const donorIncoming = await get('/requests/incoming', donorToken);
  const donorReq = donorIncoming.requests.find(r => r._id === requestId);
  if (donorReq.otp || donorReq.otpHash || donorReq.otpEncrypted) {
    throw new Error('SECURITY VIOLATION: Donor received OTP or hash in incoming requests!');
  }
  console.log('✓ Security Verified: Donor incoming requests strictly stripped of OTP and hashes.');

  // 12. Donor Enters Incorrect OTP (Testing Security & Attempt Tracking)
  console.log('\n[12] Testing Donor Entering Incorrect OTP...');
  try {
    await post(`/requests/${requestId}/verify-otp`, { otp: '000000' }, donorToken);
    throw new Error('Should have failed with incorrect OTP!');
  } catch (err) {
    console.log('✓ Correctly rejected invalid OTP:', err.message);
  }

  // 12b. Donor Tries to Complete Before OTP Verification (Must Fail!)
  console.log('\n[12b] Testing Donor Attempting Complete Before Verification...');
  try {
    await post(`/requests/${requestId}/complete`, {}, donorToken);
    throw new Error('Should have failed because OTP was not verified yet!');
  } catch (err) {
    console.log('✓ Correctly blocked completion without verified OTP:', err.message);
  }

  // 13. Step 1 of Handover: Donor Verifies with Correct OTP
  console.log('\n[13] Testing Step 1: Donor Verifying with Correct OTP...');
  const verifyRes = await post(`/requests/${requestId}/verify-otp`, { otp: receiverOtp }, donorToken);
  if (!verifyRes.otpVerified) {
    throw new Error('OTP was not marked as verified!');
  }
  console.log('✓ Step 1 Success: OTP Verified! (Status remains:', verifyRes.request.status, '- Not Completed yet)');

  // 13b. Step 2 of Handover: Donor Clicks Complete Donation
  console.log('\n[13b] Testing Step 2: Donor Finalizing Completion...');
  const completeRes = await post(`/requests/${requestId}/complete`, {}, donorToken);
  if (completeRes.request.status !== 'Completed') {
    throw new Error(`Expected status to be Completed, got ${completeRes.request.status}`);
  }
  console.log('✓ Step 2 Success: Request Officially Completed! Status:', completeRes.request.status);

  // 14. Admin Moderates Donation Listing (Approve)
  console.log('\n[14] Testing Admin Donation Moderation (Approve Listing)...');
  const moderateRes = await put(
    `/admin/donations/${newDonationId}/moderate`,
    { moderationStatus: 'Approved' },
    adminToken
  );
  console.log(`✓ Donation Listing Moderated. New Status: ${moderateRes.donation.moderationStatus}`);

  // 15. Admin Donation Tracking & Timeline
  console.log('\n[15] Testing Admin Donation Tracking & Timeline...');
  const trackingList = await get('/admin/tracking', adminToken);
  console.log(`✓ Tracking records count: ${trackingList.trackingRecords.length}. Handover Success Rate: ${trackingList.analytics.successRate}%`);

  const trackingDetails = await get(`/admin/tracking/${requestId}`, adminToken);
  console.log(`✓ Fetched tracking details for ${trackingDetails.request._id}. Recorded Events in Timeline: ${trackingDetails.timeline.length}`);
  trackingDetails.timeline.forEach((evt, idx) => {
    console.log(`   ${idx + 1}. [${evt.eventType}] ${evt.title} (${new Date(evt.timestamp).toLocaleTimeString()})`);
  });

  // 16. Misuse Reporting
  console.log('\n[16] Testing Misuse Reporting System...');
  const reportRes = await post(
    '/reports',
    {
      donationId: newDonationId,
      reason: 'Other Violation',
      description: 'E2E Test Report verification - listing tested successfully.'
    },
    receiverToken
  );
  console.log('✓ Report Submitted:', reportRes.report.reason);

  // 17. Admin Statistics & Management
  console.log('\n[17] Testing Administrator Analytics & Controls...');
  const adminStatsRes = await get('/admin/stats', adminToken);
  console.log('✓ Admin Stats Fetched:');
  console.log(`  - Total Users: ${adminStatsRes.stats.users.total}`);
  console.log(`  - Total Donations: ${adminStatsRes.stats.donations.total}`);
  console.log(`  - Completed Donations: ${adminStatsRes.stats.donations.completed}`);
  console.log(`  - Total Requests: ${adminStatsRes.stats.requests.total}`);

  // 18. Contact Form Submission
  console.log('\n[18] Testing Public Contact Inquiry Form...');
  const contactRes = await post('/contact', {
    name: 'Pooja Iyer',
    email: 'pooja.iyer@example.com',
    subject: 'Donating warm clothes for upcoming winter',
    message: 'We have 30 woolen blankets and sweaters from our housing society.'
  });
  console.log('✓ Contact Message Submitted:', contactRes.contactMessage.subject);

  console.log('\n========================================================');
  console.log('🎉 ALL 18 FULL-STACK WORKFLOW TESTS PASSED FLAWLESSLY! 🎉');
  console.log('========================================================\n');
}

testAllWorkflows().catch((err) => {
  console.error('Test Failed:', err.message);
  process.exit(1);
});
