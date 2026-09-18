import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import { User } from '../models/User.js';
import { Movie } from '../models/Movie.js';
import { Theatre } from '../models/Theatre.js';
import { Screen } from '../models/Screen.js';
import { Seat } from '../models/Seat.js';
import { Show } from '../models/Show.js';
import { FoodItem } from '../models/FoodItem.js';
import { Coupon } from '../models/Coupon.js';
import { Review } from '../models/Review.js';
import { Booking } from '../models/Booking.js';
import { Notification } from '../models/Notification.js';

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cineai');
    console.log('[Seeder] Connected to MongoDB...');

    console.log('[Seeder] Dropping old indexes and clearing collections...');
    try {
      await mongoose.connection.db.dropDatabase();
    } catch (e) {
      console.log('[Seeder] Notice on dropDatabase:', e.message);
    }

    // 1. Create Demo Users
    console.log('[Seeder] Creating users...');
    const adminUser = await User.create({
      name: 'Alexander Vance (Admin)',
      email: 'admin@cineai.com',
      password: 'Admin@123',
      role: 'admin',
      city: 'Mumbai',
      loyaltyPoints: 1250,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    });

    const ownerUser = await User.create({
      name: 'Rajesh Singhania (Owner)',
      email: 'owner@cineai.com',
      password: 'Owner@123',
      role: 'theatreOwner',
      city: 'Mumbai',
      loyaltyPoints: 500,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    });

    const regularUser = await User.create({
      name: 'Rohan Sharma',
      email: 'user@cineai.com',
      password: 'User@123',
      role: 'user',
      city: 'Mumbai',
      favouriteGenres: ['Sci-Fi', 'Action', 'Thriller'],
      favouriteLanguages: ['English', 'Hindi'],
      loyaltyPoints: 340,
      walletBalance: 250,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    });

    // 2. Create Blockbuster Movies
    console.log('[Seeder] Creating blockbuster movies...');
    const moviesData = [
      {
        title: 'Dune: Part Two',
        slug: 'dune-part-two',
        description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the universe, he endeavors to prevent a terrible future.',
        poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
        backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=Way9Dexny3w',
        genres: ['Sci-Fi', 'Adventure', 'Action'],
        languages: ['English', 'Hindi'],
        duration: 166,
        releaseDate: new Date('2024-03-01'),
        certification: 'UA',
        rating: 8.8,
        reviewCount: 4200,
        formats: ['IMAX', '4DX', '3D', '2D'],
        status: 'now_showing',
        trendingScore: 98,
        cast: [
          { name: 'Timothée Chalamet', role: 'Paul Atreides', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80' },
          { name: 'Zendaya', role: 'Chani', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80' },
          { name: 'Rebecca Ferguson', role: 'Lady Jessica', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80' },
        ],
        crew: [
          { name: 'Denis Villeneuve', role: 'Director' },
          { name: 'Hans Zimmer', role: 'Music Composer' },
        ],
      },
      {
        title: 'Oppenheimer',
        slug: 'oppenheimer',
        description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II, unravelling profound moral questions and political betrayal.',
        poster: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=800&q=80',
        backdrop: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=uYPbbksJxIg',
        genres: ['Drama', 'History', 'Biography'],
        languages: ['English', 'Hindi'],
        duration: 180,
        releaseDate: new Date('2023-07-21'),
        certification: 'A',
        rating: 8.9,
        reviewCount: 5800,
        formats: ['IMAX', '2D'],
        status: 'now_showing',
        trendingScore: 95,
        cast: [
          { name: 'Cillian Murphy', role: 'J. Robert Oppenheimer', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80' },
          { name: 'Emily Blunt', role: 'Katherine Oppenheimer', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80' },
          { name: 'Robert Downey Jr.', role: 'Lewis Strauss', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80' },
        ],
        crew: [
          { name: 'Christopher Nolan', role: 'Director' },
          { name: 'Ludwig Göransson', role: 'Music Composer' },
        ],
      },
      {
        title: 'Interstellar: 10th Anniversary IMAX',
        slug: 'interstellar-imax',
        description: 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans.',
        poster: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=800&q=80',
        backdrop: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
        genres: ['Sci-Fi', 'Drama', 'Adventure'],
        languages: ['English', 'Hindi'],
        duration: 169,
        releaseDate: new Date('2024-09-01'),
        certification: 'UA',
        rating: 9.1,
        reviewCount: 9200,
        formats: ['IMAX', '4DX', '2D'],
        status: 'now_showing',
        trendingScore: 99,
        cast: [
          { name: 'Matthew McConaughey', role: 'Cooper', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80' },
          { name: 'Anne Hathaway', role: 'Brand', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80' },
        ],
        crew: [
          { name: 'Christopher Nolan', role: 'Director' },
          { name: 'Hans Zimmer', role: 'Music Composer' },
        ],
      },
      {
        title: 'Kalki 2898 AD',
        slug: 'kalki-2898-ad',
        description: 'A modern-day avatar of Vishnu, a Hindu god, who is believed to have descended to the earth to protect the world from evil forces in a dystopian future where water and hope are scarce.',
        poster: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
        backdrop: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1600&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=kQDd1AhGIHk',
        genres: ['Action', 'Sci-Fi', 'Fantasy'],
        languages: ['Hindi', 'Telugu', 'Tamil'],
        duration: 181,
        releaseDate: new Date('2024-06-27'),
        certification: 'UA',
        rating: 8.4,
        reviewCount: 3800,
        formats: ['3D', 'IMAX', '2D'],
        status: 'now_showing',
        trendingScore: 93,
        cast: [
          { name: 'Prabhas', role: 'Bhairava', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80' },
          { name: 'Amitabh Bachchan', role: 'Ashwatthama', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80' },
          { name: 'Deepika Padukone', role: 'SUM-80', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80' },
        ],
        crew: [{ name: 'Nag Ashwin', role: 'Director' }],
      },
      {
        title: 'Spider-Man: Beyond the Spider-Verse',
        slug: 'spider-man-beyond-spider-verse',
        description: 'Miles Morales journeys across the Multiverse to unite with Gwen Stacy and a new coalition of Spider-People against the cosmic menace known as the Spot.',
        poster: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80',
        backdrop: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=1600&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=shW9i6k8cB0',
        genres: ['Animation', 'Action', 'Adventure'],
        languages: ['English', 'Hindi', 'Tamil'],
        duration: 140,
        releaseDate: new Date('2026-11-15'),
        certification: 'U',
        rating: 9.0,
        reviewCount: 4600,
        formats: ['3D', 'IMAX', '4DX', '2D'],
        status: 'upcoming',
        trendingScore: 97,
        cast: [
          { name: 'Shameik Moore', role: 'Miles Morales', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80' },
          { name: 'Hailee Steinfeld', role: 'Gwen Stacy', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80' },
        ],
        crew: [{ name: 'Joaquim Dos Santos', role: 'Director' }],
      },
      {
        title: 'Fighter',
        slug: 'fighter',
        description: 'An elite Indian Air Force combat aviator unit is assembled in the face of imminent national threats, bonding as comrades while engaging in high-stakes supersonic dogfights.',
        poster: 'https://images.unsplash.com/photo-1517976487507-5b3a4a03496f?auto=format&fit=crop&w=800&q=80',
        backdrop: 'https://images.unsplash.com/photo-1519074069444-1ba4ea16e6f1?auto=format&fit=crop&w=1600&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=6amIq_mP4xM',
        genres: ['Action', 'Thriller'],
        languages: ['Hindi'],
        duration: 166,
        releaseDate: new Date('2024-01-25'),
        certification: 'UA',
        rating: 8.1,
        reviewCount: 2900,
        formats: ['3D', 'IMAX', '2D'],
        status: 'now_showing',
        trendingScore: 88,
        cast: [
          { name: 'Hrithik Roshan', role: 'Shamsher Pathania', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80' },
          { name: 'Deepika Padukone', role: 'Minal Rathore', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80' },
        ],
        crew: [{ name: 'Siddharth Anand', role: 'Director' }],
      },
    ];

    const movies = await Movie.insertMany(moviesData);

    // 3. Create Theatres in Major Cities
    console.log('[Seeder] Creating theatres & multiplexes...');
    const theatresData = [
      {
        name: 'PVR INOX Palladium Grand',
        owner: ownerUser._id,
        city: 'Mumbai',
        address: 'High Street Phoenix, Senapati Bapat Marg, Lower Parel',
        facilities: ['IMAX with Laser', 'Dolby Atmos', 'Recliner Lounges', 'Valet Parking', 'Gourmet Bar'],
        rating: 4.9,
        images: ['https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80'],
      },
      {
        name: 'Cinepolis Nexus Seawoods',
        owner: ownerUser._id,
        city: 'Mumbai',
        address: 'Sector 40, Nerul, Navi Mumbai',
        facilities: ['4DX', 'VIP Recliner', 'Dolby 7.1', 'Food Court'],
        rating: 4.7,
        images: ['https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80'],
      },
      {
        name: 'PVR Director’s Cut Vasant Kunj',
        owner: ownerUser._id,
        city: 'Delhi-NCR',
        address: 'Ambience Mall, Nelson Mandela Marg, Vasant Kunj, New Delhi',
        facilities: ['Director’s Cut Luxury', 'Dolby Atmos', 'In-Seat Chef Service', 'Ultra Recliners'],
        rating: 4.9,
        images: ['https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80'],
      },
      {
        name: 'INOX Garuda Mall',
        owner: ownerUser._id,
        city: 'Bengaluru',
        address: 'Magrath Road, Ashok Nagar, Bengaluru',
        facilities: ['IMAX', 'Dolby Atmos', 'Gourmet Snacks', 'Wheelchair Access'],
        rating: 4.8,
        images: ['https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80'],
      },
      {
        name: 'Prasads Multiplex Large Screen',
        owner: ownerUser._id,
        city: 'Hyderabad',
        address: 'Necklace Road, Khairatabad, Hyderabad',
        facilities: ['Giant Screen', 'Dual 4K Laser Projection', 'Dolby Atmos', 'Gaming Zone'],
        rating: 4.8,
        images: ['https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80'],
      },
    ];

    const theatres = await Theatre.insertMany(theatresData);

    // Assign first theatre to owner user
    ownerUser.theatre = theatres[0]._id;
    await ownerUser.save();

    // 4. Create Screens and Seats for each Theatre
    console.log('[Seeder] Creating screens and matrix seats...');
    const allScreens = [];
    const rows = 8;
    const columns = 12;
    const rowLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

    for (const theatre of theatres) {
      // Screen 1: IMAX Laser
      const screen1 = await Screen.create({
        theatre: theatre._id,
        name: 'Audi 1 - IMAX Laser',
        screenType: 'IMAX',
        rows,
        columns,
        totalSeats: rows * columns,
        seatCategories: [
          { name: 'Regular', rows: ['A', 'B'], basePrice: 280 },
          { name: 'Premium', rows: ['C', 'D', 'E'], basePrice: 420 },
          { name: 'Recliner', rows: ['F', 'G'], basePrice: 650 },
          { name: 'VIP', rows: ['H'], basePrice: 850 },
        ],
      });

      // Screen 2: Dolby Cinema
      const screen2 = await Screen.create({
        theatre: theatre._id,
        name: 'Audi 2 - Dolby Cinema',
        screenType: 'Dolby Cinema',
        rows,
        columns,
        totalSeats: rows * columns,
        seatCategories: [
          { name: 'Regular', rows: ['A', 'B'], basePrice: 220 },
          { name: 'Premium', rows: ['C', 'D', 'E'], basePrice: 350 },
          { name: 'Recliner', rows: ['F', 'G'], basePrice: 550 },
          { name: 'VIP', rows: ['H'], basePrice: 750 },
        ],
      });

      theatre.screens = [screen1._id, screen2._id];
      await theatre.save();

      allScreens.push(screen1, screen2);

      // Populate Seats for screen1 and screen2
      for (const scr of [screen1, screen2]) {
        const seats = [];
        rowLetters.forEach((r) => {
          let category = 'Regular';
          if (['C', 'D', 'E'].includes(r)) category = 'Premium';
          else if (['F', 'G'].includes(r)) category = 'Recliner';
          else if (r === 'H') category = 'VIP';

          for (let c = 1; c <= columns; c++) {
            seats.push({
              screen: scr._id,
              row: r,
              number: c,
              seatId: `${r}${c}`,
              category,
              priceMultiplier: category === 'VIP' ? 2.2 : category === 'Recliner' ? 1.8 : category === 'Premium' ? 1.35 : 1.0,
            });
          }
        });
        await Seat.insertMany(seats);
      }
    }

    // 5. Create Shows for Today, Tomorrow, and Next Day
    console.log('[Seeder] Creating showtimes...');
    const today = new Date();
    const formatDate = (d) => d.toISOString().split('T')[0];

    const todayStr = formatDate(today);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = formatDate(tomorrow);

    const showSlots = [
      { startTime: '10:30', endTime: '13:15' },
      { startTime: '14:00', endTime: '16:45' },
      { startTime: '18:15', endTime: '21:00' },
      { startTime: '21:45', endTime: '00:30' },
    ];

    const createdShows = [];

    for (const theatre of theatres) {
      const screen = allScreens.find((s) => s.theatre.toString() === theatre._id.toString());
      if (!screen) continue;

      for (const movie of movies.slice(0, 4)) {
        for (const dateStr of [todayStr, tomorrowStr]) {
          const slot = showSlots[Math.floor(Math.random() * showSlots.length)];
          const occupied = ['C5', 'C6', 'D7', 'D8', 'F4', 'F5']; // pre-occupied demo seats

          const show = await Show.create({
            movie: movie._id,
            theatre: theatre._id,
            screen: screen._id,
            date: dateStr,
            startTime: slot.startTime,
            endTime: slot.endTime,
            language: movie.languages[0],
            format: movie.formats[0] || '2D',
            pricing: {
              Regular: 260,
              Premium: 390,
              Recliner: 590,
              VIP: 790,
            },
            totalSeats: 96,
            availableSeatsCount: 96 - occupied.length,
            occupiedSeats: occupied,
            status: 'scheduled',
          });
          createdShows.push(show);
        }
      }
    }

    // 6. Create Food & Beverage Concessions
    console.log('[Seeder] Creating concessions & snacks...');
    const foodItemsData = [
      {
        name: 'Gourmet Golden Popcorn (Large)',
        description: 'Warm freshly popped corn drizzled with gourmet salted butter.',
        image: 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?auto=format&fit=crop&w=600&q=80',
        price: 320,
        category: 'Popcorn',
        isVeg: true,
      },
      {
        name: 'Artisan Caramel Crunch Popcorn',
        description: 'Crunchy butterfly corn coated in rich handcrafted English toffee caramel.',
        image: 'https://images.unsplash.com/photo-1585647347483-22b66260dfff?auto=format&fit=crop&w=600&q=80',
        price: 360,
        category: 'Popcorn',
        isVeg: true,
      },
      {
        name: 'Loaded Mexican Nachos Supreme',
        description: 'Crispy corn tortilla chips topped with melted jalapeño cheese dip and spicy salsa.',
        image: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&w=600&q=80',
        price: 290,
        category: 'Hot Snacks',
        isVeg: true,
      },
      {
        name: 'Chilled Fountain Coca-Cola (750ml)',
        description: 'Ice-cold carbonated beverage served with lemon twist.',
        image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80',
        price: 180,
        category: 'Beverages',
        isVeg: true,
      },
      {
        name: 'CineAI Signature Duo Combo',
        description: '1 Large Tub Gourmet Butter Popcorn + 2 Cold Drinks + Free Sweet Dispenser.',
        image: 'https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?auto=format&fit=crop&w=600&q=80',
        price: 590,
        category: 'Combos',
        isVeg: true,
      },
      {
        name: 'Molten Belgian Choco Lava Cake',
        description: 'Warm chocolate sponge with gooey molten fudge center.',
        image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80',
        price: 240,
        category: 'Desserts',
        isVeg: true,
      },
    ];

    await FoodItem.insertMany(foodItemsData);

    // 7. Create Active Coupons
    console.log('[Seeder] Creating promotional coupons...');
    const couponsData = [
      {
        code: 'WELCOME10',
        discountType: 'percentage',
        discountValue: 10,
        minimumAmount: 300,
        maximumDiscount: 200,
        expiryDate: new Date('2027-12-31'),
        active: true,
      },
      {
        code: 'MOVIENIGHT',
        discountType: 'flat',
        discountValue: 100,
        minimumAmount: 500,
        maximumDiscount: 100,
        expiryDate: new Date('2027-12-31'),
        active: true,
      },
      {
        code: 'CINEAI20',
        discountType: 'percentage',
        discountValue: 20,
        minimumAmount: 600,
        maximumDiscount: 350,
        expiryDate: new Date('2027-12-31'),
        active: true,
      },
    ];

    await Coupon.insertMany(couponsData);

    // 8. Create Realistic Reviews for Movies
    console.log('[Seeder] Creating initial reviews...');
    await Review.create({
      user: regularUser._id,
      movie: movies[0]._id, // Dune 2
      rating: 5,
      comment: 'An absolute cinematic masterpiece! Denis Villeneuve has delivered one of the greatest sci-fi spectacles in film history. The IMAX sound design literally shook my seat.',
      aspects: { story: 5, acting: 5, direction: 5, music: 5, visuals: 5, pacing: 4 },
      sentiment: 'positive',
    });

    await Review.create({
      user: ownerUser._id,
      movie: movies[1]._id, // Oppenheimer
      rating: 5,
      comment: 'Cillian Murphy gives the performance of a lifetime. The Trinity test sequence was nerve-shredding. Essential viewing in IMAX 70mm.',
      aspects: { story: 5, acting: 5, direction: 5, music: 4, visuals: 5, pacing: 4 },
      sentiment: 'positive',
    });

    // 9. Create A Past Demo Booking
    console.log('[Seeder] Creating past confirmed demo booking...');
    const demoShow = createdShows[0];
    await Booking.create({
      user: regularUser._id,
      movie: demoShow.movie,
      theatre: demoShow.theatre,
      screen: demoShow.screen,
      show: demoShow._id,
      seats: [
        { seatId: 'D7', row: 'D', number: 7, category: 'Premium', price: 390 },
        { seatId: 'D8', row: 'D', number: 8, category: 'Premium', price: 390 },
      ],
      foodItems: [
        { name: 'Artisan Caramel Crunch Popcorn', quantity: 1, price: 360 },
        { name: 'Chilled Fountain Coca-Cola (750ml)', quantity: 2, price: 180 },
      ],
      subtotal: 1500,
      discount: 150,
      couponCode: 'WELCOME10',
      tax: 70,
      totalAmount: 1420,
      bookingStatus: 'confirmed',
      paymentStatus: 'paid',
      paymentId: 'pay_demo_seed_987654',
      bookingReference: 'CINE-2026-DEMO01',
      qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    });

    // Add watch history
    regularUser.watchHistory.push({
      movie: demoShow.movie,
      watchedAt: new Date(),
    });
    await regularUser.save();

    console.log('[Seeder] Database successfully seeded with rich cinematic data!');
    console.log('----------------------------------------------------');
    console.log('DEMO ACCOUNTS:');
    console.log('1. Admin:         admin@cineai.com  / Admin@123');
    console.log('2. Theatre Owner: owner@cineai.com  / Owner@123');
    console.log('3. Regular User:  user@cineai.com   / User@123');
    console.log('----------------------------------------------------');

    process.exit(0);
  } catch (err) {
    console.error('[Seeder Error]', err);
    process.exit(1);
  }
};

seedDatabase();
