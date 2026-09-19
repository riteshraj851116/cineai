import mongoose from 'mongoose';
import { Movie } from '../models/Movie.js';
import { Show } from '../models/Show.js';
import { Theatre } from '../models/Theatre.js';
import { Booking } from '../models/Booking.js';
import { Review } from '../models/Review.js';
import { Coupon } from '../models/Coupon.js';
import { FoodItem } from '../models/FoodItem.js';

const isDbConnected = () => Boolean(mongoose.connection && mongoose.connection.readyState >= 1);

export class AIService {
  /**
   * Safe caller for Google Gemini 1.5 Flash grounded with real database context
   */
  static async callGeminiLLM({ message, systemContext }) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || !apiKey.trim()) return null;

    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const payload = {
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `${systemContext}\n\nUSER QUERY:\n${message}\n\nRESPONSE (concise, cinema-focused, strictly truthful to the given data):`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.6,
          maxOutputTokens: 250,
        },
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        console.warn(`[Gemini LLM] API call returned status ${res.status}`);
        return null;
      }

      const data = await res.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
    } catch (err) {
      console.warn('[Gemini LLM] Service call warning:', err.message);
      return null;
    }
  }

  /**
   * Process user conversational query with intent recognition, semantic database matching & safe LLM fallback
   */
  static async handleChatQuery({ message, userId = null, sessionId = 'default-session', city = 'Mumbai' }) {
    if (!message || typeof message !== 'string') {
      return {
        intent: 'GENERAL',
        reply: `Namaste! I am your CineAI cinema concierge for ${city}. Ask me for movie suggestions, IMAX shows, ticket booking status, or seat recommendations!`,
        actionData: null,
        suggestions: ['Top Rated Movies', 'Hindi Action Movies', 'Show Today Offers', 'Recommend IMAX'],
      };
    }

    const text = message.trim().toLowerCase();

    // 1. Greetings & Persona introduction
    const isGreeting = /^(hi|hello|hey|namaste|greetings|howdy|sup|hola|tum kaun ho|who are you|help|what can you do|features|kya kar sakte ho)/i.test(text);
    if (isGreeting) {
      return {
        intent: 'GREETING',
        reply: `Namaste! I am CineAI Concierge, your neural cinema companion in ${city}. I have live telemetry on IMAX 70mm & laser auditoriums, Dolby Atmos acoustics, gourmet concessions, and real-time seat availability. What would you like to explore?`,
        actionData: null,
        suggestions: ['Trending Movies in IMAX', 'Gourmet Snacks Menu', `Shows Tonight in ${city}`, 'Dolby Atmos Sweet Spot'],
      };
    }

    // 2. Concessions & Food Menu Inquiry
    const isFoodQuery = /(snack|food|popcorn|coke|pepsi|beverage|nachos|burger|combo|canteen|khana|khane|menu)/i.test(text);
    if (isFoodQuery) {
      let foods = [];
      if (mongoose.connection.readyState >= 1) {
        try {
          foods = await FoodItem.find().limit(6);
        } catch (fErr) {
          console.warn('Food query notice:', fErr.message);
        }
      }

      if (!foods || foods.length === 0) {
        foods = [
          { name: 'Truffle Butter Popcorn', category: 'Popcorn', price: 280, isVeg: true, description: 'Artisanal kernels tossed in white truffle oil and sea salt.' },
          { name: 'Caramel & Cheese Monster Combo', category: 'Combos', price: 420, isVeg: true, description: 'Dual jumbo tub with two 500ml ice-cold fountain beverages.' },
          { name: 'Loaded Queso Nachos', category: 'Snacks', price: 240, isVeg: true, description: 'Crisp stone-ground corn chips with jalapeño salsa and warm cheddar.' },
          { name: 'Pepsi Black Nitro Cold', category: 'Beverages', price: 160, isVeg: true, description: 'Zero sugar nitrogen-infused draught cola.' },
        ];
      }

      return {
        intent: 'FOOD_MENU',
        reply: `Here is today's gourmet CineAI concession menu in ${city}. You can pre-order refreshments to skip theatre queues:`,
        actionData: {
          type: 'FOOD_MENU',
          foods: foods.map((f) => ({
            id: f._id || f.name,
            name: f.name,
            category: f.category || 'Concessions',
            price: f.price || 250,
            isVeg: f.isVeg !== false,
            description: f.description || 'Cinema snack pre-order',
          })),
        },
        suggestions: foods.slice(0, 3).map((f) => `Pre-order ${f.name}`),
      };
    }

    // 3. Check for cancellation intent
    if (text.includes('cancel') && (text.includes('booking') || text.includes('ticket'))) {
      if (userId) {
        const latestBooking = await Booking.findOne({ user: userId, bookingStatus: 'confirmed' })
          .populate('movie', 'title poster')
          .sort({ createdAt: -1 });

        if (latestBooking) {
          return {
            intent: 'CANCEL_BOOKING',
            reply: `I found your confirmed booking for "${latestBooking.movie.title}" (Ref: ${latestBooking.bookingReference}). Cancellation requires your confirmation. Would you like to proceed with the cancellation and refund?`,
            actionData: {
              type: 'CONFIRM_CANCELLATION',
              bookingId: latestBooking._id,
              bookingReference: latestBooking.bookingReference,
              movieTitle: latestBooking.movie.title,
              amount: latestBooking.totalAmount,
            },
            suggestions: ['Confirm Cancellation', 'Keep My Booking'],
          };
        } else {
          return {
            intent: 'CANCEL_BOOKING',
            reply: "I couldn't locate any active confirmed booking on your account to cancel.",
            actionData: null,
            suggestions: ['Show My Bookings', 'Book a Movie'],
          };
        }
      } else {
        return {
          intent: 'CANCEL_BOOKING',
          reply: 'Please log in to your CineAI account so I can look up your active bookings.',
          actionData: null,
          suggestions: ['Log In', 'Explore Movies'],
        };
      }
    }

    // 4. Check for booking / ticket check intent
    if (text.includes('my booking') || text.includes('my ticket') || text.includes('status of my booking')) {
      if (userId) {
        const bookings = await Booking.find({ user: userId })
          .populate('movie', 'title poster')
          .populate('theatre', 'name city')
          .populate('show', 'startTime date format')
          .sort({ createdAt: -1 })
          .limit(3);

        if (bookings.length > 0) {
          const b = bookings[0];
          return {
            intent: 'CHECK_BOOKING',
            reply: `You have ${bookings.length} recent booking(s). Here is your latest: ${b.movie?.title || 'Screening'} at ${b.theatre?.name || 'Multiplex'} (${b.show?.date || ''} at ${b.show?.startTime || ''}).`,
            actionData: {
              type: 'BOOKING_LIST',
              bookings: bookings.map((item) => ({
                id: item._id,
                reference: item.bookingReference,
                movie: item.movie?.title,
                poster: item.movie?.poster,
                status: item.bookingStatus,
                seats: item.seats?.map((s) => s.seatId).join(', '),
              })),
            },
            suggestions: ['View Ticket', 'Check Offers'],
          };
        } else {
          return {
            intent: 'CHECK_BOOKING',
            reply: "You don't have any bookings yet. How about finding a great movie tonight?",
            actionData: null,
            suggestions: ['Trending Movies', 'IMAX Specials'],
          };
        }
      } else {
        return {
          intent: 'CHECK_BOOKING',
          reply: 'Please log in to check your booking history and digital tickets.',
          actionData: null,
          suggestions: ['Log In', 'Search Movies'],
        };
      }
    }

    // 5. Specific Movie Deep Dive / Inquiries (e.g. "Tell me about Kalki", "Interstellar synopsis", "is Fighter good?")
    let allMovies = [];
    if (mongoose.connection.readyState >= 1) {
      try {
        allMovies = await Movie.find();
      } catch (dbErr) {
        console.warn('[AI Service] Movies fetch notice:', dbErr.message);
      }
    }
    if (!allMovies || allMovies.length === 0) {
      allMovies = [
        { _id: 'interstellar', title: 'Interstellar: 10th Anniversary IMAX', slug: 'interstellar-imax', rating: 9.1, duration: 169, genres: ['Sci-Fi', 'Drama'], formats: ['IMAX', '4DX', '2D'], poster: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=800&q=80', description: 'When Earth becomes uninhabitable, a team of researchers undertakes a perilous voyage through a wormhole.' },
        { _id: 'dune-2', title: 'Dune: Part Two', slug: 'dune-part-two', rating: 8.8, duration: 166, genres: ['Sci-Fi', 'Adventure'], formats: ['IMAX', '4DX'], poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80', description: 'Paul Atreides unites with Chani and the Fremen to wage revenge against conspirators.' },
        { _id: 'kalki-2898', title: 'Kalki 2898 AD', slug: 'kalki-2898-ad', rating: 8.4, duration: 181, genres: ['Action', 'Sci-Fi'], formats: ['3D', 'IMAX'], poster: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80', description: 'A modern-day avatar of Vishnu descends to Earth to protect humanity against dark forces in a dystopian futuristic city.' },
        { _id: 'oppenheimer', title: 'Oppenheimer', slug: 'oppenheimer', rating: 8.9, duration: 180, genres: ['Drama', 'History'], formats: ['IMAX 70mm', '2D'], poster: 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?auto=format&fit=crop&w=800&q=80', description: 'The story of J. Robert Oppenheimers role in the development of the atomic bomb during World War II.' },
        { _id: 'fighter', title: 'Fighter', slug: 'fighter', rating: 8.1, duration: 166, genres: ['Action', 'Thriller'], formats: ['3D', 'IMAX'], poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80', description: 'An elite Air Force squadron confronts sudden airborne aggression and defends the skies with supreme tactical skill.' },
      ];
    }
    const matchedSpecificMovie = allMovies.find((m) => {
      const titleLower = m.title.toLowerCase();
      const slugClean = m.slug.toLowerCase().replace(/-/g, ' ');
      return text.includes(titleLower) || text.includes(slugClean) || titleLower.split(' ').some((w) => w.length > 3 && text.includes(w));
    });

    const isDirectMovieQuery = matchedSpecificMovie && (
      text.includes('about') || text.includes('tell me') || text.includes('review') ||
      text.includes('kaisi') || text.includes('kaisa') || text.includes('rating') ||
      text.includes('synopsis') || text.includes('story') || text.includes('worth') ||
      text.includes('watch') || text.includes('good') || text.split(' ').length <= 4
    );

    if (isDirectMovieQuery) {
      let shows = [];
      if (mongoose.connection.readyState >= 1 && mongoose.Types.ObjectId.isValid(matchedSpecificMovie._id)) {
        try {
          shows = await Show.find({ movie: matchedSpecificMovie._id }).populate('theatre', 'name city').limit(3);
        } catch (sErr) {
          console.warn('Show find notice:', sErr.message);
        }
      }
      const genres = Array.isArray(matchedSpecificMovie.genres) ? matchedSpecificMovie.genres.join(', ') : matchedSpecificMovie.genres;
      const formats = matchedSpecificMovie.formats?.join(', ') || 'IMAX, 3D, 2D';

      return {
        intent: 'MOVIE_DETAILS',
        reply: `"${matchedSpecificMovie.title}" is rated ${matchedSpecificMovie.rating}/10. Genre: ${genres}. Runtime: ${matchedSpecificMovie.duration}m. Formats: ${formats}.\n\nDirectorial Note: ${matchedSpecificMovie.description}`,
        actionData: {
          type: 'MOVIE_LIST',
          movies: [{
            _id: matchedSpecificMovie._id,
            id: matchedSpecificMovie._id,
            title: matchedSpecificMovie.title,
            slug: matchedSpecificMovie.slug,
            rating: matchedSpecificMovie.rating,
            genres: matchedSpecificMovie.genres,
            poster: matchedSpecificMovie.poster,
            backdrop: matchedSpecificMovie.backdrop,
            duration: matchedSpecificMovie.duration,
            formats: matchedSpecificMovie.formats,
            description: matchedSpecificMovie.description,
          }],
          shows: shows.map((s) => ({
            id: s._id,
            theatre: s.theatre?.name || 'Multiplex',
            startTime: s.startTime,
            date: s.date,
            price: s.pricing?.STANDARD || 250,
          })),
        },
        suggestions: [`Book ${matchedSpecificMovie.title}`, `Shows in ${city}`, `Similar to ${matchedSpecificMovie.title}`],
      };
    }

    // 6. Movie Comparison (e.g. "Dune vs Interstellar", "compare dune and kalki")
    if (text.includes(' vs ') || text.includes('compare') || text.includes('which is better')) {
      const matchedPair = allMovies.filter((m) => {
        const titleLower = m.title.toLowerCase();
        return text.includes(titleLower) || titleLower.split(' ').some((w) => w.length > 4 && text.includes(w));
      });

      if (matchedPair.length >= 2) {
        const [m1, m2] = matchedPair;
        return {
          intent: 'MOVIE_COMPARISON',
          reply: `Cinematic Comparison Analysis:\n• ${m1.title}: Rated ${m1.rating}/10 (${m1.duration}m) — Renowned for scale and directorial craft.\n• ${m2.title}: Rated ${m2.rating}/10 (${m2.duration}m) — Celebrated for sensory adrenaline and visual prowess.\n\nCineAI Verdict: For maximum acoustic and IMAX immersion, we recommend ${m1.rating >= m2.rating ? m1.title : m2.title}.`,
          actionData: {
            type: 'MOVIE_LIST',
            movies: [m1, m2].map((m) => ({
              _id: m._id,
              id: m._id,
              title: m.title,
              slug: m.slug,
              rating: m.rating,
              genres: m.genres,
              poster: m.poster,
              duration: m.duration,
            })),
          },
          suggestions: [`Book ${m1.title}`, `Book ${m2.title}`],
        };
      }
    }

    // 7. Check for coupons / offers intent
    if (text.includes('offer') || text.includes('coupon') || text.includes('discount') || text.includes('promo')) {
      let coupons = [];
      if (isDbConnected()) {
        try {
          coupons = await Coupon.find({ active: true }).limit(4);
        } catch (cErr) {
          console.warn('[AI Service] Coupon fetch error:', cErr.message);
        }
      }
      if (!coupons || coupons.length === 0) {
        coupons = [
          { code: 'CINEAI20', discountType: 'percentage', discountValue: 20, minimumAmount: 300 },
          { code: 'IMAX50', discountType: 'flat', discountValue: 50, minimumAmount: 400 },
          { code: 'POPCORNFREE', discountType: 'flat', discountValue: 100, minimumAmount: 500 },
          { code: 'FIRSTCINE', discountType: 'percentage', discountValue: 25, minimumAmount: 250 },
        ];
      }
      return {
        intent: 'FIND_OFFERS',
        reply: `Here are today's top CineAI discount codes you can apply during checkout:`,
        actionData: {
          type: 'COUPON_LIST',
          coupons: coupons.map((c) => ({
            code: c.code,
            discount: c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue} FLAT OFF`,
            minAmount: `Min spend ₹${c.minimumAmount || 250}`,
          })),
        },
        suggestions: coupons.map((c) => `Use ${c.code}`),
      };
    }

    // 8. Check for sound quality / acoustic cinema inquiry
    if (text.includes('sound') || text.includes('atmos') || text.includes('acoustics') || text.includes('audio') || text.includes('audi')) {
      let theatres = [];
      if (isDbConnected()) {
        try {
          theatres = await Theatre.find({
            facilities: { $in: [/atmos/i, /imax/i, /sound/i, /laser/i] },
          }).limit(3);
        } catch (tErr) {
          console.warn('[AI Service] Theatre fetch error:', tErr.message);
        }
      }
      if (!theatres || theatres.length === 0) {
        theatres = [
          { _id: 'th-1', name: 'CineAI IMAX & Dolby Atmos Luxe', city: city || 'Mumbai', location: 'Phoenix Palladium, Lower Parel', facilities: ['IMAX 3D Laser', 'Dolby Atmos 64-Ch', 'VIP Recliners'] },
          { _id: 'th-2', name: 'CineAI Grand Auditorium', city: city || 'Mumbai', location: 'Bandra Kurla Complex (BKC)', facilities: ['Dolby Atmos', '4DX', 'Gourmet Lounge'] },
          { _id: 'th-3', name: 'CineAI Cinema Matrix', city: city || 'Mumbai', location: 'Infinity Mall, Malad', facilities: ['IMAX 70mm', 'Barco Laser', 'Christie Vive Audio'] },
        ];
      }

      return {
        intent: 'ACOUSTIC_CINEMAS',
        reply: "For superior acoustic fidelity, CineAI recommends auditoriums calibrated with Dolby Atmos 64-channel spatial sound and Christie Vive audio. In a standard 12-row hall, Rows D through F in the center cluster yield zero phase distortion and balanced 120° visual throw.",
        actionData: {
          type: 'THEATRE_LIST',
          theatres: theatres.map((t) => ({
            id: t._id,
            name: t.name,
            city: t.city,
            location: t.location,
            facilities: t.facilities,
          })),
        },
        suggestions: theatres.map((t) => `View shows at ${t.name}`),
      };
    }

    // 9. Check for seat guidance / arrangement for friends
    if (text.includes('seat') || text.includes('sweet spot') || text.includes('friends') || text.includes('together')) {
      const matchParty = text.match(/(\d+)\s*(?:friends|people|seats|tickets)/);
      const partySize = matchParty ? parseInt(matchParty[1], 10) : 2;

      return {
        intent: 'FIND_SEATS',
        reply: `For a party of ${partySize}, CineAI recommends rows D through F in the central auditorium cluster. This zone guarantees zero geometric peripheral distortion and optimal surround channel balance.`,
        actionData: {
          type: 'SEAT_GUIDANCE',
          partySize,
          preferredRows: ['D', 'E', 'F'],
          tip: `${partySize} contiguous seats in central rows avoid peripheral geometric distortion and ear-level acoustic phase cancellation.`,
        },
        suggestions: ['Select a Movie', 'Find Tonight Shows'],
      };
    }

    // 10. Check for budget constraints
    const budgetMatch = text.match(/(?:under|budget|₹|rs\.?)\s*(\d{3,4})/i) || text.match(/(\d{3,4})\s*(?:rs|rupees|inr)/i);
    const budgetLimit = budgetMatch ? parseInt(budgetMatch[1], 10) : null;

    // 11. Check for similarity (e.g. "similar to dune", "like interstellar")
    let similarMovie = null;
    if (text.includes('similar to') || text.includes('like ')) {
      const parts = text.split(/similar to|like /);
      if (parts[1]) {
        const queryTitle = parts[1].trim().split(' ')[0].toLowerCase();
        if (isDbConnected()) {
          try {
            similarMovie = await Movie.findOne({ title: new RegExp(queryTitle, 'i') });
          } catch (_) {}
        }
        if (!similarMovie) {
          similarMovie = allMovies.find((m) => m.title.toLowerCase().includes(queryTitle));
        }
      }
    }

    // 12. General Natural Language Movie & Showtime search
    const isHinglish = /(batao|kaisi hai|kaisa hai|dekhu|acchi|achhi|sasti|sasta|kitne|kya chal raha|kuch badhiya|dikhau)/i.test(text);

    let matchedMovies = [];
    if (isDbConnected()) {
      try {
        const query = {};
        if (text.includes('action')) query.genres = 'Action';
        else if (text.includes('sci-fi') || text.includes('scifi')) query.genres = 'Sci-Fi';
        else if (text.includes('thriller')) query.genres = 'Thriller';
        else if (text.includes('comedy')) query.genres = 'Comedy';
        else if (text.includes('drama')) query.genres = 'Drama';
        else if (text.includes('animation') || text.includes('family')) query.genres = { $in: ['Animation', 'Adventure', 'Family'] };

        if (text.includes('hindi')) query.languages = 'Hindi';
        else if (text.includes('english')) query.languages = 'English';
        else if (text.includes('tamil')) query.languages = 'Tamil';
        else if (text.includes('telugu')) query.languages = 'Telugu';

        if (text.includes('imax')) query.formats = 'IMAX';
        else if (text.includes('3d') && !text.includes('2d')) query.formats = '3D';
        else if (text.includes('4dx')) query.formats = '4DX';

        if (text.includes('under 2 hours') || text.includes('under 120')) query.duration = { $lte: 120 };
        else if (text.includes('under 2.5 hours') || text.includes('under 150')) query.duration = { $lte: 150 };

        if (similarMovie) {
          query.genres = { $in: similarMovie.genres };
          if (mongoose.Types.ObjectId.isValid(similarMovie._id)) {
            query._id = { $ne: similarMovie._id };
          }
        }

        matchedMovies = await Movie.find(Object.keys(query).length ? query : { status: 'now_showing' })
          .sort({ rating: -1, trendingScore: -1 })
          .limit(4);
      } catch (mFindErr) {
        console.warn('Matched movie find notice:', mFindErr.message);
      }
    }

    // In-memory filter fallback from allMovies if DB search was skipped or yielded empty
    if (!matchedMovies || matchedMovies.length === 0) {
      let filtered = [...allMovies];
      if (text.includes('action')) filtered = filtered.filter((m) => m.genres?.includes('Action'));
      else if (text.includes('sci-fi') || text.includes('scifi')) filtered = filtered.filter((m) => m.genres?.includes('Sci-Fi'));
      else if (text.includes('thriller')) filtered = filtered.filter((m) => m.genres?.includes('Thriller'));
      else if (text.includes('imax')) filtered = filtered.filter((m) => m.formats?.includes('IMAX'));

      matchedMovies = (filtered.length > 0 ? filtered : allMovies).slice(0, 4);
    }

    // Check tonight shows if requested
    let matchedShows = [];
    if ((text.includes('tonight') || text.includes('today') || text.includes('evening') || budgetLimit) && isDbConnected()) {
      try {
        const showQuery = { status: 'scheduled' };
        if (budgetLimit) {
          showQuery['pricing.STANDARD'] = { $lte: budgetLimit };
        }
        matchedShows = await Show.find(showQuery)
          .populate('movie', 'title poster duration rating')
          .populate('theatre', 'name city address')
          .limit(3);
      } catch (_) {}
    }

    let replyNarrative = isHinglish
      ? `Aaj ${city} multiplexes me top-rated cinematic exhibitions chal rahi hain! Yeh dekhiye CineAI ke curated recommendation matches:`
      : `I analyzed today's cinematic index and identified ${matchedMovies.length} top-tier matches`;

    if (!isHinglish) {
      if (budgetLimit) replyNarrative += ` within your ₹${budgetLimit} budget`;
      if (text.includes('tonight')) replyNarrative += ` scheduled for tonight in ${city}`;
      if (similarMovie) replyNarrative += ` sharing narrative DNA with "${similarMovie.title}"`;
      replyNarrative += `:`;
    }

    if (process.env.GEMINI_API_KEY) {
      const movieSummaries = matchedMovies.map((m) => `${m.title} (${m.genres.join(', ')}, rating ${m.rating}/10, duration ${m.duration}m)`).join('; ');
      const systemContext = `You are CineAI Concierge, an expert cinema AI assistant. Current movies in CineAI index: ${movieSummaries}. Provide a concise, engaging recommendation based strictly on these available movies.`;
      const geminiReply = await AIService.callGeminiLLM({ message, systemContext });
      if (geminiReply) {
        replyNarrative = geminiReply;
      }
    }

    return {
      intent: 'SEARCH_MOVIES',
      reply: replyNarrative,
      actionData: {
        type: 'MOVIE_LIST',
        movies: matchedMovies.map((m) => ({
          _id: m._id,
          id: m._id,
          title: m.title,
          slug: m.slug,
          rating: m.rating,
          genres: Array.isArray(m.genres) ? m.genres : [m.genres],
          poster: m.poster,
          backdrop: m.backdrop,
          duration: m.duration,
          languages: Array.isArray(m.languages) ? m.languages : [m.languages],
          formats: m.formats || ['Standard'],
          description: m.description,
        })),
        shows: matchedShows.map((s) => ({
          id: s._id,
          movie: s.movie?.title,
          theatre: s.theatre?.name,
          startTime: s.startTime,
          date: s.date,
          price: s.pricing?.STANDARD || 250,
        })),
      },
      suggestions: matchedMovies.map((m) => `Book ${m.title}`),
    };
  }

  /**
   * Parse natural language search into structured query filters
   */
  static parseNaturalLanguageSearch(prompt) {
    const text = (prompt || '').toLowerCase();
    const filters = {
      genres: [],
      languages: [],
      formats: [],
      maxDuration: null,
      sortBy: 'rating',
    };

    const genreKeywords = ['action', 'sci-fi', 'drama', 'comedy', 'thriller', 'adventure', 'horror', 'romance', 'crime', 'animation'];
    genreKeywords.forEach((g) => {
      if (text.includes(g)) filters.genres.push(g.charAt(0).toUpperCase() + g.slice(1));
    });

    const langKeywords = ['hindi', 'english', 'tamil', 'telugu', 'kannada', 'malayalam'];
    langKeywords.forEach((l) => {
      if (text.includes(l)) filters.languages.push(l.charAt(0).toUpperCase() + l.slice(1));
    });

    if (text.includes('imax')) filters.formats.push('IMAX');
    if (text.includes('3d') && !text.includes('2d')) filters.formats.push('3D');
    if (text.includes('4dx')) filters.formats.push('4DX');
    if (text.includes('2d')) filters.formats.push('2D');

    if (text.includes('under 2 hours') || text.includes('under 120')) filters.maxDuration = 120;
    else if (text.includes('under 2.5 hours') || text.includes('under 150')) filters.maxDuration = 150;
    else if (text.includes('under 3 hours') || text.includes('under 180')) filters.maxDuration = 180;

    if (text.includes('popular') || text.includes('trending')) filters.sortBy = 'popularity';
    else if (text.includes('new') || text.includes('latest')) filters.sortBy = 'newest';
    else filters.sortBy = 'rating';

    return filters;
  }

  /**
   * AI Review Summarizer
   */
  static async summarizeReviews(movieId) {
    let reviews = [];
    if (isDbConnected() && mongoose.Types.ObjectId.isValid(movieId)) {
      try {
        reviews = await Review.find({ movie: movieId }).populate('user', 'name');
      } catch (_) {}
    }

    if (!reviews || reviews.length === 0) {
      return {
        overallSentiment: 'Highly Anticipated',
        summary: 'Early critical acclaim highlights breathtaking cinematic spectacle, technical prowess, and resonant directorial execution.',
        aspects: {
          story: 4.5,
          acting: 4.8,
          direction: 4.7,
          music: 4.6,
          visuals: 4.9,
          pacing: 4.3,
        },
        positiveThemes: [
          'Spectacular visual effects and IMAX scale',
          'Gripping background score and sound design',
          'Compelling lead performance',
        ],
        mixedThemes: ['High narrative density requires active attention'],
        commonComplaints: ['Runtime extends beyond 2.5 hours'],
      };
    }

    const aspectTotals = { story: 0, acting: 0, direction: 0, music: 0, visuals: 0, pacing: 0 };
    let positiveCount = 0;
    let mixedCount = 0;
    let negativeCount = 0;

    reviews.forEach((r) => {
      if (r.sentiment === 'positive') positiveCount++;
      else if (r.sentiment === 'mixed') mixedCount++;
      else negativeCount++;

      if (r.aspects) {
        aspectTotals.story += r.aspects.story || 4;
        aspectTotals.acting += r.aspects.acting || 4;
        aspectTotals.direction += r.aspects.direction || 4;
        aspectTotals.music += r.aspects.music || 4;
        aspectTotals.visuals += r.aspects.visuals || 5;
        aspectTotals.pacing += r.aspects.pacing || 4;
      }
    });

    const count = reviews.length;
    const avgAspects = {
      story: Number((aspectTotals.story / count).toFixed(1)),
      acting: Number((aspectTotals.acting / count).toFixed(1)),
      direction: Number((aspectTotals.direction / count).toFixed(1)),
      music: Number((aspectTotals.music / count).toFixed(1)),
      visuals: Number((aspectTotals.visuals / count).toFixed(1)),
      pacing: Number((aspectTotals.pacing / count).toFixed(1)),
    };

    let overallSentiment = 'Universally Acclaimed';
    if (negativeCount > positiveCount) overallSentiment = 'Mixed to Critical';
    else if (mixedCount > positiveCount) overallSentiment = 'Divided Opinions';
    else if (positiveCount > count * 0.7) overallSentiment = 'Overwhelmingly Positive';

    return {
      overallSentiment,
      summary: `Audience consensus across ${count} verified review(s): High marks for visual grandeur and technical prowess with an average score of ${(avgAspects.visuals + avgAspects.acting) / 2}/5.`,
      aspects: avgAspects,
      positiveThemes: [
        'Mesmerizing cinematography and immersive sound',
        'Stellar lead performances and character depth',
        'Remarkable high-concept narrative',
      ],
      mixedThemes: ['Intense runtime and complex subplots'],
      commonComplaints: ['Pacing dips briefly around the mid-point'],
    };
  }

  /**
   * Smart Seat Recommendation Algorithm
   */
  static recommendSeats({
    rows = 8,
    columns = 12,
    occupiedSeats = [],
    lockedSeats = [],
    preference = 'Best overall',
    partySize = 2,
    seatCategories = [],
  }) {
    const occupiedSet = new Set([...occupiedSeats, ...lockedSeats.map((l) => l.seatId)]);
    const rowLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'].slice(0, rows);

    const candidates = [];
    const centerCol = (columns + 1) / 2;
    const centerRowIndex = Math.floor(rows / 2);

    rowLetters.forEach((row, rIdx) => {
      for (let col = 1; col <= columns - partySize + 1; col++) {
        const seatGroup = [];
        let isAvailable = true;

        for (let i = 0; i < partySize; i++) {
          const seatId = `${row}${col + i}`;
          if (occupiedSet.has(seatId)) {
            isAvailable = false;
            break;
          }
          seatGroup.push({ row, number: col + i, seatId });
        }

        if (isAvailable) {
          const groupCenterCol = col + (partySize - 1) / 2;
          const colDistance = Math.abs(groupCenterCol - centerCol);
          let rowDistance = Math.abs(rIdx - centerRowIndex);

          if (preference === 'Away from screen') {
            rowDistance = rows - 1 - rIdx;
          } else if (preference === 'Budget') {
            rowDistance = rIdx;
          } else if (preference === 'Premium') {
            rowDistance = Math.abs(rIdx - (rows - 2));
          }

          const score = 100 - (colDistance * 8 + rowDistance * 12);
          candidates.push({ seats: seatGroup, score, row, startCol: col });
        }
      }
    });

    candidates.sort((a, b) => b.score - a.score);

    if (candidates.length > 0) {
      return {
        recommendedSeats: candidates[0].seats.map((s) => s.seatId),
        reason: `Optimal ${preference.toLowerCase()} acoustics and viewing angle for ${partySize} seat(s) in Row ${candidates[0].row}.`,
        alternatives: candidates.slice(1, 3).map((c) => c.seats.map((s) => s.seatId)),
      };
    }

    return {
      recommendedSeats: [],
      reason: 'No contiguous group available matching your preference. Please select individual seats.',
      alternatives: [],
    };
  }

  /**
   * Explain Movie Insights
   */
  static async explainMovie(movieDoc) {
    if (!movieDoc) return null;

    const runtimeCategory = movieDoc.duration > 150
      ? 'Epic Length (Plan for 2.5h+ immersion)'
      : movieDoc.duration > 110
      ? 'Feature Standard (Well-balanced pacing)'
      : 'Brisk Runtime (Zero filler)';

    return {
      movieId: movieDoc._id,
      title: movieDoc.title,
      whyWatch: `Directorial vision paired with state-of-the-art ${movieDoc.formats?.join('/') || 'large-format'} exhibition. Certified ${movieDoc.rating}/10 critical rating.`,
      whoMayEnjoy: `Audiences fond of high-stakes ${movieDoc.genres?.join(' and ') || 'cinema'} seeking high sensory immersion.`,
      mood: movieDoc.genres?.includes('Sci-Fi') ? 'Awe & Intellectual Thrill' : movieDoc.genres?.includes('Action') ? 'Adrenaline & Kinetic Momentum' : 'Cathartic & Deep',
      runtimeSuitability: runtimeCategory,
      bestFormat: movieDoc.formats?.includes('IMAX') ? 'IMAX 70mm / Dual Laser' : 'Dolby Cinema',
      auditoryProfile: 'High Dynamic Range (Calibrated for Dolby Atmos & DTS:X)',
    };
  }
}
