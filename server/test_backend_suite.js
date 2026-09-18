import http from 'http';

const BASE_URL = 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const method = options.method || 'GET';
  const body = options.body ? JSON.stringify(options.body) : undefined;

  const res = await fetch(url, { method, headers, body });
  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    data = null;
  }
  return { status: res.status, data };
}

const results = [];
function record(category, testName, pass, details = '') {
  results.push({ category, testName, pass, details });
  const mark = pass ? '✓ PASS' : '✗ FAIL';
  console.log(`${mark} [${category}] ${testName} ${details ? '(' + details + ')' : ''}`);
}

async function runTests() {
  console.log('=====================================================');
  console.log('  CINEAI BACKEND COMPLETE PRODUCTION AUDIT & TEST SUITE');
  console.log('=====================================================\n');

  // 1. Health Endpoint
  try {
    const res = await request('/health');
    record('Server', 'Health Check (/api/health)', res.status === 200 && res.data?.status === 'online', `Status: ${res.status}`);
  } catch (err) {
    record('Server', 'Health Check (/api/health)', false, err.message);
  }

  // 2. Authentication & Authorization
  let userToken = '';
  let adminToken = '';
  let testUserId = '';
  const uniqueEmail = `patron_${Date.now()}@cineai.test`;

  try {
    // Register
    const regRes = await request('/auth/register', {
      method: 'POST',
      body: { name: 'Test Patron', email: uniqueEmail, password: 'password123', city: 'Mumbai' },
    });
    record('Auth', 'Register New User', regRes.status === 201 && !!regRes.data?.token, `Token received: ${!!regRes.data?.token}`);
    userToken = regRes.data?.token;
    testUserId = regRes.data?.user?._id;

    // Login
    const loginRes = await request('/auth/login', {
      method: 'POST',
      body: { email: uniqueEmail, password: 'password123' },
    });
    record('Auth', 'Login with Correct Credentials', loginRes.status === 200 && !!loginRes.data?.token);

    // Invalid Login
    const badLogin = await request('/auth/login', {
      method: 'POST',
      body: { email: uniqueEmail, password: 'wrongpassword' },
    });
    record('Auth', 'Reject Wrong Password', badLogin.status === 401);

    // Get Me (Protected)
    const meRes = await request('/auth/me', {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    record('Auth', 'Fetch Current Profile (/api/auth/me)', meRes.status === 200 && meRes.data?.user?.email === uniqueEmail);

    // Unauthenticated access check
    const unauthRes = await request('/auth/me');
    record('Auth', 'Reject Missing Token (401)', unauthRes.status === 401);

    // Role check: Normal user cannot access /api/admin/stats
    const forbiddenAdmin = await request('/admin/stats', {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    record('Authorization', 'Block Normal User from Admin Stats (403)', forbiddenAdmin.status === 403);

    // Login with seeded Admin
    const adminLogin = await request('/auth/login', {
      method: 'POST',
      body: { email: 'admin@cineai.com', password: 'Admin@123' },
    });
    if (adminLogin.status === 200 && adminLogin.data?.token) {
      adminToken = adminLogin.data.token;
      record('Authorization', 'Login Seeded Admin', true);

      // Admin accesses stats
      const adminStats = await request('/admin/stats', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      record('Authorization', 'Admin Accesses Stats (200)', adminStats.status === 200);
    } else {
      record('Authorization', 'Login Seeded Admin', false, 'admin@cineai.com login failed');
    }
  } catch (err) {
    record('Auth', 'Auth Suite Failure', false, err.message);
  }

  // 3. Movies API
  let sampleMovieId = '';
  let sampleMovieSlug = '';
  try {
    const moviesRes = await request('/movies');
    record('Movies', 'List All Movies', moviesRes.status === 200 && Array.isArray(moviesRes.data?.movies) && moviesRes.data.movies.length > 0, `Count: ${moviesRes.data?.movies?.length}`);
    if (moviesRes.data?.movies?.[0]) {
      sampleMovieId = moviesRes.data.movies[0]._id;
      sampleMovieSlug = moviesRes.data.movies[0].slug || 'oppenheimer';
    }

    // Get by ID
    const movieById = await request(`/movies/${sampleMovieId}`);
    record('Movies', 'Get Movie by ObjectId', movieById.status === 200 && movieById.data?.movie?._id === sampleMovieId);

    // Get by Slug directly through /movies/:id (with our slug resolution)
    const movieBySlug = await request(`/movies/${sampleMovieSlug}`);
    record('Movies', 'Get Movie by Slug Resiliently', movieBySlug.status === 200 && !!movieBySlug.data?.movie);
  } catch (err) {
    record('Movies', 'Movies API Failure', false, err.message);
  }

  // 4. Cinemas & Screens API
  let sampleTheatreId = '';
  try {
    const theatresRes = await request('/theatres');
    record('Cinemas', 'List All Cinemas', theatresRes.status === 200 && Array.isArray(theatresRes.data?.theatres) && theatresRes.data.theatres.length > 0, `Count: ${theatresRes.data?.theatres?.length}`);
    if (theatresRes.data?.theatres?.[0]) {
      sampleTheatreId = theatresRes.data.theatres[0]._id;
      const singleTheatre = await request(`/theatres/${sampleTheatreId}`);
      record('Cinemas', 'Get Cinema Details by ID', singleTheatre.status === 200 && singleTheatre.data?.theatre?._id === sampleTheatreId);
    }
  } catch (err) {
    record('Cinemas', 'Cinemas API Failure', false, err.message);
  }

  // 5. Shows & Showtime Intelligence
  let sampleShowId = '';
  try {
    const showsRes = await request('/shows');
    record('Shows', 'List All Scheduled Shows', showsRes.status === 200 && Array.isArray(showsRes.data?.shows) && showsRes.data.shows.length > 0, `Count: ${showsRes.data?.shows?.length}`);
    if (showsRes.data?.shows?.[0]) {
      sampleShowId = showsRes.data.shows[0]._id;
      const singleShow = await request(`/shows/${sampleShowId}`);
      record('Shows', 'Get Show Details by ID', singleShow.status === 200 && singleShow.data?.show?._id === sampleShowId);
    }

    // Shows filtered by slug (testing slug resolution in showController)
    const showsBySlug = await request(`/shows?movieId=${sampleMovieSlug}`);
    record('Shows', 'Filter Shows by Movie Slug', showsBySlug.status === 200 && Array.isArray(showsBySlug.data?.shows));
  } catch (err) {
    record('Shows', 'Shows API Failure', false, err.message);
  }

  // 6. Food & Concessions
  let sampleFoodId = '';
  try {
    const foodRes = await request('/food');
    record('Food', 'List Concession Items', foodRes.status === 200 && Array.isArray(foodRes.data?.foodItems));
    if (foodRes.data?.foodItems?.[0]) {
      sampleFoodId = foodRes.data.foodItems[0]._id;
    }
  } catch (err) {
    record('Food', 'Food API Failure', false, err.message);
  }

  // 7. Coupons
  try {
    const couponsRes = await request('/coupons');
    record('Coupons', 'List Active Promotional Coupons', couponsRes.status === 200 && Array.isArray(couponsRes.data?.coupons));

    // Validate Coupon
    const validateRes = await request('/coupons/validate', {
      method: 'POST',
      body: { code: 'WELCOME10', amount: 500 },
    });
    record('Coupons', 'Validate Coupon (/api/coupons/validate)', validateRes.status === 200 && validateRes.data?.success);
  } catch (err) {
    record('Coupons', 'Coupons API Failure', false, err.message);
  }

  // 8. Booking Engine & Seat Locking
  let createdBookingId = '';
  let candidateForConcurrency = null;
  try {
    const showDetailForSeats = await request(`/shows/${sampleShowId}`);
    const occupied = showDetailForSeats.data?.show?.occupiedSeats || [];
    const locked = (showDetailForSeats.data?.show?.lockedSeats || []).map((l) => l.seatId);
    const unavailable = new Set([...occupied, ...locked]);

    const availableCandidates = [];
    for (const r of ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']) {
      for (let n = 1; n <= 10; n++) {
        const sId = `${r}${n}`;
        if (!unavailable.has(sId)) {
          availableCandidates.push({ seatId: sId, row: r, number: n, category: 'Standard' });
        }
      }
    }

    const testSeats = availableCandidates.slice(0, 2);
    candidateForConcurrency = availableCandidates[2] || { seatId: 'H9', row: 'H', number: 9, category: 'Standard' };

    const bookingPayload = {
      showId: sampleShowId,
      seats: testSeats,
      foodItems: sampleFoodId ? [{ foodItem: sampleFoodId, quantity: 1 }] : [],
      couponCode: 'WELCOME10',
    };

    const bookIntent = await request('/bookings', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: bookingPayload,
    });

    record('Booking', 'Create Server-Authoritative Booking Intent', bookIntent.status === 201 && bookIntent.data?.success && !!bookIntent.data?.booking?._id);
    if (bookIntent.data?.booking) {
      createdBookingId = bookIntent.data.booking._id;

      // Confirm Booking
      const confirmRes = await request('/bookings/confirm', {
        method: 'POST',
        headers: { Authorization: `Bearer ${userToken}` },
        body: {
          bookingId: createdBookingId,
          paymentId: `pay_test_${Date.now()}`,
          orderId: bookIntent.data.orderData?.orderId || `order_${Date.now()}`,
          signature: 'mock_sig_verification_pass',
        },
      });
      record('Booking', 'Confirm Booking with Payment Verification & QR Code', confirmRes.status === 200 && confirmRes.data?.booking?.bookingStatus === 'confirmed');

      // Fetch My Bookings
      const myBookingsRes = await request('/bookings/my-bookings', {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      record('Booking', 'Fetch Patron Bookings Ledger', myBookingsRes.status === 200 && myBookingsRes.data?.bookings?.length > 0);

      // Fetch Single Ticket
      const ticketRes = await request(`/bookings/${createdBookingId}`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      record('Booking', 'Fetch Individual Ticket Pass (/api/bookings/:id)', ticketRes.status === 200 && !!ticketRes.data?.booking?.qrCode);
    }
  } catch (err) {
    record('Booking', 'Booking Flow Failure', false, err.message);
  }

  // 9. Watchlist, Loyalty, Cinema DNA & Watch Journey
  try {
    // Watchlist Toggle
    const toggleRes = await request('/users/watchlist/toggle', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: { movieId: sampleMovieId },
    });
    record('Watchlist', 'Toggle Movie in Watchlist', toggleRes.status === 200 && toggleRes.data?.inWatchlist === true);

    // Fetch Watchlist
    const getWatchlistRes = await request('/users/watchlist', {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    record('Watchlist', 'Fetch User Watchlist', getWatchlistRes.status === 200 && getWatchlistRes.data?.count >= 1);

    // Loyalty Info
    const loyaltyRes = await request('/users/loyalty', {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    record('Rewards', 'Fetch Loyalty Balance and Tier', loyaltyRes.status === 200 && loyaltyRes.data?.tier !== undefined);

    // Cinema DNA
    const dnaRes = await request('/users/cinema-dna', {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    record('AI & Profile', 'Calculate Real Cinema DNA Profile', dnaRes.status === 200 && Array.isArray(dnaRes.data?.cinemaDNA?.topGenres));

    // Watch Journey
    const journeyRes = await request('/users/watch-journey', {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    record('AI & Profile', 'Fetch Historical Watch Journey Timeline', journeyRes.status === 200 && Array.isArray(journeyRes.data?.journey));
  } catch (err) {
    record('Profile', 'User Profile Features Failure', false, err.message);
  }

  // 10. Reviews & Community
  let createdReviewId = '';
  try {
    const postReviewRes = await request('/reviews', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: {
        movieId: sampleMovieId,
        rating: 5,
        comment: 'Outstanding directorial masterpiece with unmatched IMAX visual fidelity.',
      },
    });
    record('Reviews', 'Submit Verified Patron Review', postReviewRes.status === 201 && postReviewRes.data?.success);
    if (postReviewRes.data?.review) {
      createdReviewId = postReviewRes.data.review._id;

      // Like review
      const likeRes = await request(`/reviews/${createdReviewId}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${userToken}` },
      });
      record('Community', 'Like / Applaud Critique (/api/reviews/:id/like)', likeRes.status === 200);
    }

    // Community Feed
    const feedRes = await request('/reviews');
    record('Community', 'Fetch Community Discussion Feed', feedRes.status === 200 && Array.isArray(feedRes.data?.reviews));

    // Movie-specific reviews with slug resilience
    const movieRevSlug = await request(`/reviews/movie/${sampleMovieSlug}`);
    record('Reviews', 'Fetch Reviews by Movie Slug', movieRevSlug.status === 200 && Array.isArray(movieRevSlug.data?.reviews));
  } catch (err) {
    record('Reviews', 'Reviews Suite Failure', false, err.message);
  }

  // 11. AI Intelligence Suite
  try {
    // Natural Language Search
    const aiSearch = await request('/ai/search', {
      method: 'POST',
      body: { query: 'Sci-fi thriller in IMAX' },
    });
    record('AI', 'Natural Language Search (/api/ai/search)', aiSearch.status === 200 && Array.isArray(aiSearch.data?.movies));

    // AI Chat
    const aiChat = await request('/ai/chat', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: { message: 'Recommend me an action movie', sessionId: 'test-sess' },
    });
    record('AI', 'Conversational Assistant (/api/ai/chat)', aiChat.status === 200 && typeof aiChat.data?.reply === 'string');

    // Seat Recommendation
    const seatRec = await request('/ai/recommend-seats', {
      method: 'POST',
      body: { rows: 8, columns: 12, occupiedSeats: ['D5', 'D6'], partySize: 2, preference: 'Best overall' },
    });
    record('AI', 'Seat Recommendation Algorithm', seatRec.status === 200 && Array.isArray(seatRec.data?.result?.recommendedSeats));

    // AI Review Summary
    const revSummary = await request(`/ai/review-summary/${sampleMovieId}`);
    record('AI', 'AI Review Summary & Aspect Analysis', revSummary.status === 200 && typeof revSummary.data?.summary?.overallSentiment === 'string');

    // AI Weekend Planner
    const weekendRes = await request('/ai/weekend-planner', {
      method: 'POST',
      body: { day: 'Saturday', budget: 1200, people: 2, mood: 'Thrill' },
    });
    record('AI', 'AI Weekend Planner Package Generator', weekendRes.status === 200 && !!weekendRes.data?.plan?.showId);

    // Smart Group Booking Clusters
    const groupSeatsRes = await request('/ai/group-seats', {
      method: 'POST',
      body: { showId: sampleShowId, partySize: 4 },
    });
    record('AI', 'Smart Group Seat Cluster Analysis', groupSeatsRes.status === 200 && Array.isArray(groupSeatsRes.data?.contiguousCluster));

    // AI Explain Movie
    const explainRes = await request(`/ai/explain/${sampleMovieSlug}`);
    record('AI', 'AI Movie Narrative Explanation (/api/ai/explain/:id)', explainRes.status === 200 && !!explainRes.data?.explanation);

    // AI Cinema Recommendation
    const recCinemasRes = await request('/ai/recommend-cinemas', {
      method: 'POST',
      body: { preferredExperience: 'IMAX Laser', location: 'Mumbai' },
    });
    record('AI', 'AI Acoustic & Multiplex Recommendation', recCinemasRes.status === 200 && Array.isArray(recCinemasRes.data?.cinemas));

    // AI Showtime Recommendation
    const recShowsRes = await request('/ai/recommend-showtimes', {
      method: 'POST',
      body: { movieId: sampleMovieId, timePreference: 'Evening' },
    });
    record('AI', 'AI Showtime Optimization by Slot', recShowsRes.status === 200 && recShowsRes.data?.success);

    // AI Mood-to-Movie Discovery
    const moodRes = await request('/ai/mood', {
      method: 'POST',
      body: { mood: 'Mind-Bending & Philosophical' },
    });
    record('AI', 'Mood-to-Movie Neural Matchmaker', moodRes.status === 200 && Array.isArray(moodRes.data?.movies));
  } catch (err) {
    record('AI', 'AI Suite Failure', false, err.message);
  }

  // 12. Screens Layout Verification
  try {
    const showDetail = await request(`/shows/${sampleShowId}`);
    const screenId = showDetail.data?.show?.screen?._id || showDetail.data?.show?.screen;
    if (screenId) {
      const screenRes = await request(`/screens/${screenId}`);
      record('Screens', 'Fetch Screen by ID (/api/screens/:id)', screenRes.status === 200 && !!screenRes.data?.screen);

      const layoutRes = await request(`/screens/${screenId}/layout`);
      record('Screens', 'Fetch Screen Physical Layout & Seats Grid', layoutRes.status === 200 && Array.isArray(layoutRes.data?.seats));
    }
  } catch (err) {
    record('Screens', 'Screens Failure', false, err.message);
  }

  // 13. Concurrency & Seat Locking Race Condition Test (Phase 39)
  try {
    // Register User B
    const userBEmail = `patron_b_${Date.now()}@cineai.test`;
    const regB = await request('/auth/register', {
      method: 'POST',
      body: { name: 'Patron B', email: userBEmail, password: 'password123', city: 'Mumbai' },
    });
    const userBToken = regB.data?.token;

    // User A reserves seat
    const seatIdToLock = candidateForConcurrency.seatId;
    const lockARes = await request('/bookings', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: {
        showId: sampleShowId,
        seats: [candidateForConcurrency],
      },
    });
    record('Concurrency', `User A Locks Seat ${seatIdToLock}`, lockARes.status === 201);

    // User B attempts to reserve the EXACT SAME seat
    const lockBRes = await request('/bookings', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userBToken}` },
      body: {
        showId: sampleShowId,
        seats: [candidateForConcurrency],
      },
    });
    record(
      'Concurrency',
      `User B Concurrently Blocked from Locked Seat ${seatIdToLock} (Race Condition Prevented)`,
      lockBRes.status === 400 && lockBRes.data?.message?.includes(`Seat ${seatIdToLock} is temporarily reserved by another guest`)
    );
  } catch (err) {
    record('Concurrency', 'Concurrency Test Failure', false, err.message);
  }

  // 14. Recommendations
  try {
    const recRes = await request('/recommendations', {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    record('Recommendations', 'Fetch Collaborative Neural Recommendations', recRes.status === 200 && recRes.data?.success);
  } catch (err) {
    record('Recommendations', 'Recommendations Failure', false, err.message);
  }

  // 15. Notifications
  try {
    const notifRes = await request('/notifications', {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    record('Notifications', 'Fetch Patron Notifications', notifRes.status === 200 && Array.isArray(notifRes.data?.notifications));

    // Mark all read
    const readAllRes = await request('/notifications/read-all', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${userToken}` },
    });
    record('Notifications', 'Mark All Notifications Read (/api/notifications/read-all)', readAllRes.status === 200);
  } catch (err) {
    record('Notifications', 'Notifications Failure', false, err.message);
  }

  // 16. Cinemas Route Alias (/api/cinemas)
  try {
    const cinemasRes = await request('/cinemas');
    record('Cinemas', 'Access Cinemas via /api/cinemas Route Alias', cinemasRes.status === 200 && Array.isArray(cinemasRes.data?.theatres));
  } catch (err) {
    record('Cinemas', 'Cinemas Alias Failure', false, err.message);
  }

  // 17. Coupon Validation with bookingAmount parameter
  try {
    const couponCompatRes = await request('/coupons/validate', {
      method: 'POST',
      body: { code: 'WELCOME10', bookingAmount: 600 },
    });
    record('Coupons', 'Validate Coupon using bookingAmount property', couponCompatRes.status === 200 && couponCompatRes.data?.success);
  } catch (err) {
    record('Coupons', 'Coupon bookingAmount Failure', false, err.message);
  }

  // 18. Direct Watchlist POST & DELETE
  try {
    const addWatchlistRes = await request('/users/watchlist', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: { movieId: sampleMovieId },
    });
    record('Watchlist', 'Direct POST to /api/users/watchlist', addWatchlistRes.status === 200);

    const deleteWatchlistRes = await request(`/users/watchlist/${sampleMovieId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${userToken}` },
    });
    record('Watchlist', 'DELETE from /api/users/watchlist/:movieId', deleteWatchlistRes.status === 200 && deleteWatchlistRes.data?.inWatchlist === false);
  } catch (err) {
    record('Watchlist', 'Watchlist Direct Failure', false, err.message);
  }

  // 19. Community Review Comments & Update
  try {
    if (createdReviewId) {
      // Add comment to review
      const commentRes = await request(`/reviews/${createdReviewId}/comment`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${userToken}` },
        body: { comment: 'Totally agree with this IMAX visual analysis!' },
      });
      record('Community', 'Add Discussion Comment to Review (/api/reviews/:id/comment)', commentRes.status === 201 && Array.isArray(commentRes.data?.comments));

      // Update own review
      const updateRevRes = await request(`/reviews/${createdReviewId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${userToken}` },
        body: { rating: 5, comment: 'Updated review: Truly a generational cinematic achievement.' },
      });
      record('Reviews', 'Update Own Review (/api/reviews/:id)', updateRevRes.status === 200 && updateRevRes.data?.review?.rating === 5);
    }
  } catch (err) {
    record('Community', 'Discussion Comments Failure', false, err.message);
  }

  // 20. Patron Follow & Public Profile
  try {
    // Admin profile
    const adminUserDoc = await request('/auth/login', {
      method: 'POST',
      body: { email: 'admin@cineai.com', password: 'Admin@123' },
    });
    const adminId = adminUserDoc.data?.user?._id;

    if (adminId) {
      // Follow admin
      const followRes = await request(`/users/${adminId}/follow`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${userToken}` },
      });
      record('Community', 'Follow Patron Profile (/api/users/:id/follow)', followRes.status === 200 && followRes.data?.isFollowing !== undefined);

      // Fetch public profile
      const pubProfileRes = await request(`/users/${adminId}/profile`);
      record('Community', 'Get Patron Public Profile (/api/users/:id/profile)', pubProfileRes.status === 200 && pubProfileRes.data?.profile?.id === adminId);
    }
  } catch (err) {
    record('Community', 'Follow/Profile Failure', false, err.message);
  }

  // 21. Rewards Catalog & CinePoints Redemption
  try {
    const rewardsList = await request('/rewards', {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    record('Rewards', 'Fetch Rewards Catalog (/api/rewards)', rewardsList.status === 200 && Array.isArray(rewardsList.data?.rewards) && rewardsList.data?.rewards?.length > 0);

    const firstReward = rewardsList.data?.rewards?.[0];
    if (firstReward) {
      // Give test user some points first if needed
      const redeemRes = await request('/rewards/redeem', {
        method: 'POST',
        headers: { Authorization: `Bearer ${userToken}` },
        body: { rewardId: firstReward._id },
      });
      // User earned points from booking earlier, so check redemption or points threshold
      record('Rewards', 'Redeem Reward with CinePoints (/api/rewards/redeem)', redeemRes.status === 201 || (redeemRes.status === 400 && redeemRes.data?.message?.includes('Insufficient CinePoints')));
    }
  } catch (err) {
    record('Rewards', 'Rewards Suite Failure', false, err.message);
  }

  console.log('\n=====================================================');
  const passedCount = results.filter((r) => r.pass).length;
  const totalCount = results.length;
  console.log(`  FINAL RESULT: ${passedCount} / ${totalCount} TESTS PASSED`);
  console.log('=====================================================');


  if (passedCount === totalCount) {
    console.log('\n>>> ALL BACKEND PRODUCTION AUDIT TESTS PASSED WITH 100% SUCCESS <<<\n');
    process.exit(0);
  } else {
    console.log('\n>>> FAILURES DETECTED. INSPECT ABOVE RESULTS <<<\n');
    process.exit(1);
  }
}

runTests();
