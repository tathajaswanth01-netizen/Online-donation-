const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const User = require('../models/User');
const Category = require('../models/Category');
const Donation = require('../models/Donation');
const DonationRequest = require('../models/DonationRequest');
const Notification = require('../models/Notification');
const Message = require('../models/Message');
const Wishlist = require('../models/Wishlist');
const Report = require('../models/Report');
const ContactMessage = require('../models/ContactMessage');
const Transaction = require('../models/Transaction');
const DonationEvent = require('../models/DonationEvent');
const { generate6DigitOTP, hashOTP, encryptOTP } = require('../utils/otpHelper');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/online_donation_platform');
    console.log('Connected to MongoDB for seeding...');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing collections
    await User.deleteMany();
    await Category.deleteMany();
    await Donation.deleteMany();
    await DonationRequest.deleteMany();
    await Notification.deleteMany();
    await Message.deleteMany();
    await Wishlist.deleteMany();
    await Report.deleteMany();
    await ContactMessage.deleteMany();
    await Transaction.deleteMany();
    await DonationEvent.deleteMany();

    console.log('Cleared existing database records.');

    // 1. Seed Categories
    const categoriesData = [
      {
        name: 'Clothes',
        description: 'Men, women, and children apparel, winter coats, school uniforms, and wearable textiles.',
        icon: 'Shirt',
        image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=600&q=80',
        isActive: true
      },
      {
        name: 'Books and Educational Materials',
        description: 'School textbooks, college study material, novels, encyclopedias, and stationery.',
        icon: 'BookOpen',
        image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80',
        isActive: true
      },
      {
        name: 'Food and Groceries',
        description: 'Packaged grains, non-perishable pantry goods, canned foods, baby formula, and dry rations.',
        icon: 'Utensils',
        image: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=600&q=80',
        isActive: true
      },
      {
        name: 'Electronic Devices',
        description: 'Laptops, study tablets, mobile phones, desktop accessories, calculators, and chargers.',
        icon: 'Laptop',
        image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80',
        isActive: true
      },
      {
        name: 'Furniture',
        description: 'Study tables, ergonomic chairs, bed frames, storage cupboards, and lightweight shelves.',
        icon: 'Armchair',
        image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80',
        isActive: true
      },
      {
        name: 'Household Items',
        description: 'Cookware, dinner sets, ceiling fans, heaters, storage containers, and daily home essentials.',
        icon: 'Home',
        image: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=600&q=80',
        isActive: true
      },
      {
        name: 'Medical and Essential Supplies',
        description: 'Wheelchairs, walking sticks, BP monitors, oxygen concentrators, and first-aid gear.',
        icon: 'HeartPulse',
        image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80',
        isActive: true
      },
      {
        name: 'Toys and Baby Products',
        description: 'Educational toys, infant strollers, cribs, baby carriers, and early learning games.',
        icon: 'Gamepad2',
        image: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=600&q=80',
        isActive: true
      },
      {
        name: 'Other Essential Products',
        description: 'Bicycles, sports kits, music instruments, sewing machines, and utility gear.',
        icon: 'Package',
        image: 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=600&q=80',
        isActive: true
      }
    ];

    const createdCategories = await Category.insertMany(categoriesData);
    const catMap = {};
    createdCategories.forEach(cat => {
      catMap[cat.name] = cat._id;
    });

    console.log(`Seeded ${createdCategories.length} categories.`);

    // 2. Seed Users
    const passwordHash = await bcrypt.hash('Admin@123', 10);
    const donorHash = await bcrypt.hash('Donor@123', 10);
    const receiverHash = await bcrypt.hash('Receiver@123', 10);
    const bothHash = await bcrypt.hash('Both@123', 10);

    const usersData = [
      {
        name: 'Platform Administrator',
        email: 'admin@platform.org',
        phone: '+91 9820011223',
        password: passwordHash,
        accountType: 'both',
        roles: ['admin', 'donor', 'receiver'],
        profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        address: {
          street: '14th Floor, Community Towers, BKC',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400051'
        },
        verificationStatus: 'verified',
        verificationDocuments: [
          {
            docType: 'Official Government Authorization',
            docNumber: 'GOV-ADM-99482',
            fileUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
            notes: 'Verified platform operations administrator.',
            reviewedAt: new Date()
          }
        ],
        accountStatus: 'active',
        bio: 'Chief community coordinator ensuring clean, secure, and genuine resource distribution across the country.'
      },
      {
        name: 'Sarah Jenkins',
        email: 'sarah.donor@example.com',
        phone: '+91 9845012345',
        password: donorHash,
        accountType: 'donor',
        roles: ['donor'],
        profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
        address: {
          street: '42, Defence Colony',
          city: 'New Delhi',
          state: 'Delhi',
          pincode: '110024'
        },
        verificationStatus: 'verified',
        verificationDocuments: [
          {
            docType: 'National ID / Aadhaar',
            docNumber: 'XXXX-XXXX-4921',
            fileUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
            notes: 'National identity verified with residential address.',
            reviewedAt: new Date()
          }
        ],
        accountStatus: 'active',
        bio: 'Passionate educator and sustainability advocate. Sharing gently used study books, tech, and warm clothes.'
      },
      {
        name: 'Rahul Sharma',
        email: 'rahul.donor@example.com',
        phone: '+91 9876543210',
        password: donorHash,
        accountType: 'donor',
        roles: ['donor'],
        profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
        address: {
          street: '108, 12th Main, Indiranagar',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560038'
        },
        verificationStatus: 'verified',
        verificationDocuments: [
          {
            docType: 'Driving License',
            docNumber: 'KA-03-2019-00918',
            fileUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
            notes: 'Verified Karnataka State Driving License.',
            reviewedAt: new Date()
          }
        ],
        accountStatus: 'active',
        bio: 'Software engineer who loves recycling refurbished electronics, monitor stands, and tech gadgets to students in need.'
      },
      {
        name: 'Arjun Verma',
        email: 'arjun.receiver@example.com',
        phone: '+91 9711223344',
        password: receiverHash,
        accountType: 'receiver',
        roles: ['receiver'],
        profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
        address: {
          street: 'Flat 3B, Sunshine Apartments, Kothrud',
          city: 'Pune',
          state: 'Maharashtra',
          pincode: '411038'
        },
        verificationStatus: 'verified',
        verificationDocuments: [
          {
            docType: 'University Student ID',
            docNumber: 'PUN-ENG-2024-88',
            fileUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
            notes: 'Enrolled undergraduate engineering scholar.',
            reviewedAt: new Date()
          }
        ],
        accountStatus: 'active',
        bio: 'First-generation college student studying computer science. Looking for educational reference books and digital devices.'
      },
      {
        name: 'Priya Sundaram',
        email: 'priya.receiver@example.com',
        phone: '+91 9444112233',
        password: receiverHash,
        accountType: 'receiver',
        roles: ['receiver'],
        profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
        address: {
          street: '19, Besant Nagar Beach Road',
          city: 'Chennai',
          state: 'Tamil Nadu',
          pincode: '600090'
        },
        verificationStatus: 'pending',
        verificationDocuments: [
          {
            docType: 'Voter Identification Card',
            docNumber: 'TN-CH-048201',
            fileUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
            notes: 'Submitted for community shelter volunteer verification.'
          }
        ],
        accountStatus: 'active',
        bio: 'Community worker organizing essential supplies and educational toys for an underprivileged children shelter.'
      },
      {
        name: 'David Thomas',
        email: 'david.both@example.com',
        phone: '+91 9898012345',
        password: bothHash,
        accountType: 'both',
        roles: ['donor', 'receiver'],
        profileImage: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=300&q=80',
        address: {
          street: '72, Jubilee Hills Road No. 10',
          city: 'Hyderabad',
          state: 'Telangana',
          pincode: '500033'
        },
        verificationStatus: 'verified',
        verificationDocuments: [
          {
            docType: 'Passport Verification',
            docNumber: 'P-9812401',
            fileUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
            notes: 'Passport verified with residential proof.',
            reviewedAt: new Date()
          }
        ],
        accountStatus: 'active',
        bio: 'Both an active donor of furniture & household tools, and coordinates medical equipment for elderly neighborhood care.'
      }
    ];

    const createdUsers = await User.insertMany(usersData);
    const userMap = {};
    createdUsers.forEach(u => {
      userMap[u.email] = u._id;
    });

    console.log(`Seeded ${createdUsers.length} users with hashed credentials.`);

    // 3. Seed Realistic Donations
    const donationsData = [
      {
        donorId: userMap['sarah.donor@example.com'],
        title: 'Complete NCERT & Reference Books Set for Class 11-12 Science',
        description: 'Complete collection of Physics, Chemistry, and Mathematics textbooks including HC Verma and SL Arora. In very clean condition with no torn pages. Ideal for a student preparing for competitive board or entrance exams who cannot afford high book costs.',
        categoryId: catMap['Books and Educational Materials'],
        images: [
          'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=800&q=80'
        ],
        condition: 'Like New',
        quantity: 1,
        availableQuantity: 1,
        donationType: 'Free',
        price: 0,
        location: {
          street: 'Defence Colony Market area',
          city: 'New Delhi',
          state: 'Delhi',
          pincode: '110024',
          landmark: 'Near Moolchand Metro Station'
        },
        contactPreference: 'Platform Chat',
        availabilityDate: new Date(),
        additionalInstructions: 'Can hand over on weekday evenings or Saturday afternoon near the metro station.',
        status: 'Available',
        views: 48
      },
      {
        donorId: userMap['sarah.donor@example.com'],
        title: 'Heavy Winter Fleece Jackets and Woolen Sweaters (Sizes M & L)',
        description: 'Bundle of 4 high quality winter jackets and thick woolen sweaters. Completely washed, sanitized, and stored in protective bags. Perfect for cold winter months for adults or teenagers.',
        categoryId: catMap['Clothes'],
        images: [
          'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80'
        ],
        condition: 'Good',
        quantity: 4,
        availableQuantity: 4,
        donationType: 'Free',
        price: 0,
        location: {
          street: 'Defence Colony Market',
          city: 'New Delhi',
          state: 'Delhi',
          pincode: '110024',
          landmark: 'Opposite Community Park'
        },
        contactPreference: 'Platform Chat',
        availabilityDate: new Date(),
        additionalInstructions: 'Individual pieces or the whole set can be collected upon request.',
        status: 'Available',
        views: 72
      },
      {
        donorId: userMap['rahul.donor@example.com'],
        title: 'Lenovo ThinkPad 14-inch Laptop (Core i5, 8GB RAM, 256GB SSD)',
        description: 'Refurbished working business laptop with fresh Linux / Windows 10 installation, working webcam, microphone, and charger included. Battery holds charge for 2.5 hours. Excellent machine for school coding, online classes, or entry-level freelance work.',
        categoryId: catMap['Electronic Devices'],
        images: [
          'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80'
        ],
        condition: 'Good',
        quantity: 1,
        availableQuantity: 1,
        donationType: 'Free',
        price: 0,
        location: {
          street: '12th Main Road, Indiranagar',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560038',
          landmark: 'Close to Indiranagar Metro Station'
        },
        contactPreference: 'Platform Chat',
        availabilityDate: new Date(),
        additionalInstructions: 'Priority will be given to genuine students who provide student verification or letter.',
        status: 'Available',
        views: 195
      },
      {
        donorId: userMap['rahul.donor@example.com'],
        title: 'Dell 24-inch Full HD IPS Monitor with HDMI & DisplayPort',
        description: 'Lightly used secondary monitor in pristine working shape. Includes HDMI cable and power cord. We upgraded our office setup and are passing this on at a minimal subsidized cost to support a student or non-profit creator.',
        categoryId: catMap['Electronic Devices'],
        images: [
          'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1585792180666-f7347c490ee2?auto=format&fit=crop&w=800&q=80'
        ],
        condition: 'Like New',
        quantity: 1,
        availableQuantity: 1,
        donationType: 'Paid',
        price: 1800,
        location: {
          street: 'Indiranagar 100ft Road',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560038',
          landmark: 'Near Domlur Flyover'
        },
        contactPreference: 'Platform Chat',
        availabilityDate: new Date(),
        additionalInstructions: 'Available for immediate pickup after testing screen display on site.',
        status: 'Available',
        views: 89
      },
      {
        donorId: userMap['david.both@example.com'],
        title: 'Foldable Lightweight Wheelchair with Handbrakes',
        description: 'Standard adult size wheelchair in sturdy chrome steel finish with comfortable padded seat and dual rear handbrakes. Folds compactly for car trunk transport. Used for only 2 months post-surgery and thoroughly sterilized.',
        categoryId: catMap['Medical and Essential Supplies'],
        images: [
          'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80'
        ],
        condition: 'Like New',
        quantity: 1,
        availableQuantity: 1,
        donationType: 'Free',
        price: 0,
        location: {
          street: 'Road No. 10, Jubilee Hills',
          city: 'Hyderabad',
          state: 'Telangana',
          pincode: '500033',
          landmark: 'Near Cancer Hospital Circle'
        },
        contactPreference: 'Phone Call',
        availabilityDate: new Date(),
        additionalInstructions: 'Urgent medical need requests will be prioritized. Self-pickup or volunteer delivery can be arranged.',
        status: 'Available',
        views: 110
      },
      {
        donorId: userMap['david.both@example.com'],
        title: 'Ergonomic Wooden Study Desk with Drawer Storage',
        description: 'Solid engineered wood writing table (dimensions 120cm x 60cm x 75cm) with smooth walnut finish, two drawers, and wire management grommet. Disassembled cleanly with all screws labeled for easy reassembly.',
        categoryId: catMap['Furniture'],
        images: [
          'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80'
        ],
        condition: 'Good',
        quantity: 1,
        availableQuantity: 1,
        donationType: 'Paid',
        price: 1200,
        location: {
          street: 'Jubilee Hills Check Post',
          city: 'Hyderabad',
          state: 'Telangana',
          pincode: '500033',
          landmark: 'Opposite Metro Pillar 18'
        },
        contactPreference: 'Platform Chat',
        availabilityDate: new Date(),
        additionalInstructions: 'Please bring an auto or tempo for transport.',
        status: 'Available',
        views: 64
      },
      {
        donorId: userMap['sarah.donor@example.com'],
        title: 'Dry Ration Pantry Kit: Rice, Lentils, Oil, Flour (Pack of 5 kits)',
        description: 'Essential sealed grocery care package. Each kit contains 5kg Basmati rice, 2kg Toor dal, 1L sunflower oil, and 5kg whole wheat flour. Packaged by local community initiative with 8 months remaining shelf life.',
        categoryId: catMap['Food and Groceries'],
        images: [
          'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=800&q=80'
        ],
        condition: 'New',
        quantity: 5,
        availableQuantity: 5,
        donationType: 'Free',
        price: 0,
        location: {
          street: 'Community Center, Hauz Khas',
          city: 'New Delhi',
          state: 'Delhi',
          pincode: '110016',
          landmark: 'Near Hauz Khas Market'
        },
        contactPreference: 'WhatsApp',
        availabilityDate: new Date(),
        additionalInstructions: 'Families or community shelters in need are welcome to request single or multiple kits.',
        status: 'Available',
        views: 140
      },
      {
        donorId: userMap['rahul.donor@example.com'],
        title: 'Chicco Foldable Baby Stroller & Pram with Sun Canopy',
        description: 'Multi-recline infant stroller suitable for ages 0 to 3 years. Sturdy wheels, smooth suspension, 5-point safety harness, and bottom grocery basket. Sanitized and fabric washed.',
        categoryId: catMap['Toys and Baby Products'],
        images: [
          'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80'
        ],
        condition: 'Good',
        quantity: 1,
        availableQuantity: 1,
        donationType: 'Paid',
        price: 950,
        location: {
          street: 'Koramangala 4th Block',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560034',
          landmark: 'Behind BDA Complex'
        },
        contactPreference: 'Platform Chat',
        availabilityDate: new Date(),
        additionalInstructions: 'Offered at nominal cost to support parents on a tight budget.',
        status: 'Available',
        views: 82
      },
      {
        donorId: userMap['david.both@example.com'],
        title: 'Prestige Stainless Steel Pressure Cooker & Pan Set (5L + 3L)',
        description: 'Induction and gas compatible pressure cooker with whistle and safety valve tested, plus an 8-inch non-stick skillet. Clean, well maintained, and fully functional.',
        categoryId: catMap['Household Items'],
        images: [
          'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?auto=format&fit=crop&w=800&q=80'
        ],
        condition: 'Good',
        quantity: 2,
        availableQuantity: 2,
        donationType: 'Free',
        price: 0,
        location: {
          street: 'Banjara Hills Road 12',
          city: 'Hyderabad',
          state: 'Telangana',
          pincode: '500034',
          landmark: 'Near City Center Mall'
        },
        contactPreference: 'Platform Chat',
        availabilityDate: new Date(),
        additionalInstructions: 'Ideal for students setting up a hostel kitchen or newly relocated families.',
        status: 'Available',
        views: 95
      },
      {
        donorId: userMap['sarah.donor@example.com'],
        title: 'Hercules 26T Mountain Bicycle with Front Suspension',
        description: 'Single-speed robust commuter bicycle with working bell, front basket, and new tube tires installed last month. Perfect for daily school commute or delivery work.',
        categoryId: catMap['Other Essential Products'],
        images: [
          'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80'
        ],
        condition: 'Good',
        quantity: 1,
        availableQuantity: 0,
        donationType: 'Free',
        price: 0,
        location: {
          street: 'South Extension Part 1',
          city: 'New Delhi',
          state: 'Delhi',
          pincode: '110049',
          landmark: 'Near Bengali Market'
        },
        contactPreference: 'Platform Chat',
        availabilityDate: new Date(),
        additionalInstructions: 'Completed handover to Arjun for his college commute.',
        status: 'Completed',
        views: 210
      }
    ];

    const createdDonations = await Donation.insertMany(donationsData);
    console.log(`Seeded ${createdDonations.length} realistic donation items.`);

    // 4. Seed Requests
    const bicycleDonation = createdDonations.find(d => d.title.includes('Bicycle'));
    const laptopDonation = createdDonations.find(d => d.title.includes('Laptop'));
    const monitorDonation = createdDonations.find(d => d.title.includes('Monitor'));

    const monitorOtp = generate6DigitOTP();
    const monitorOtpHash = hashOTP(monitorOtp);
    const monitorOtpEncrypted = encryptOTP(monitorOtp);

    const requestsData = [
      {
        donationId: bicycleDonation._id,
        donorId: bicycleDonation.donorId,
        receiverId: userMap['arjun.receiver@example.com'],
        requestedQuantity: 1,
        reason: 'I need a daily mode of transport to travel 5 kilometers to my university campus every day and save bus fare.',
        intendedUse: 'Personal daily commute for academic classes.',
        message: 'Thank you so much Sarah for offering this bicycle! I will take very good care of it.',
        preferredPickupMethod: 'Self Pickup',
        contactPreference: 'Platform Chat',
        agreedPrice: 0,
        paymentStatus: 'N/A',
        status: 'Completed',
        acceptedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        readyForPickupAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        handoverDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        completedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        otpVerified: true,
        otpVerifiedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        donationId: laptopDonation._id,
        donorId: laptopDonation.donorId,
        receiverId: userMap['arjun.receiver@example.com'],
        requestedQuantity: 1,
        reason: 'Currently studying Computer Engineering and preparing practical code assignments. Do not own a computer.',
        intendedUse: 'Programming lab work, algorithms coursework, and open-source learning.',
        message: 'Hello Rahul, I have submitted my college enrollment ID card on my profile. Would be deeply grateful for this laptop.',
        preferredPickupMethod: 'Self Pickup',
        contactPreference: 'Platform Chat',
        agreedPrice: 0,
        paymentStatus: 'N/A',
        status: 'Pending'
      },
      {
        donationId: monitorDonation._id,
        donorId: monitorDonation.donorId,
        receiverId: userMap['priya.receiver@example.com'],
        requestedQuantity: 1,
        reason: 'Needed for our community learning lab display in our children learning center.',
        intendedUse: 'Educational video screenings and digital literacy workshops.',
        message: 'We are happy to pay the nominal requested amount of Rs. 1800 from our community center fund.',
        preferredPickupMethod: 'Community Drop-off Point',
        contactPreference: 'Platform Chat',
        agreedPrice: 1800,
        paymentStatus: 'Pending',
        status: 'Ready for Pickup',
        acceptedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        readyForPickupAt: new Date(Date.now() - 30 * 60 * 1000),
        otpHash: monitorOtpHash,
        otpEncrypted: monitorOtpEncrypted,
        otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
        lastOtpGeneratedAt: new Date(),
        otpAttempts: 0,
        otpVerified: false
      }
    ];

    const createdRequests = await DonationRequest.insertMany(requestsData);
    console.log(`Seeded ${createdRequests.length} donation requests.`);

    // Seed Chronological DonationEvent Audit Trail for Tracking
    const bicycleReq = createdRequests[0];
    const laptopReq = createdRequests[1];
    const monitorReq = createdRequests[2];

    await DonationEvent.create([
      // Bicycle Handover Timeline
      {
        donationId: bicycleDonation._id,
        requestId: null,
        actorId: bicycleDonation.donorId,
        actorRole: 'donor',
        eventType: 'DONATION_CREATED',
        title: 'Donation Listing Published',
        description: 'Sarah Jenkins listed "Hercules Roadeo 26T Mountain Bicycle" for free donation.',
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      },
      {
        donationId: bicycleDonation._id,
        requestId: null,
        actorId: userMap['admin@platform.org'],
        actorRole: 'admin',
        eventType: 'DONATION_MODERATED',
        title: 'Listing Approved by Administration',
        description: 'Administrator approved listing for public viewing after verifying condition.',
        timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
      },
      {
        donationId: bicycleDonation._id,
        requestId: bicycleReq._id,
        actorId: bicycleReq.receiverId,
        actorRole: 'receiver',
        eventType: 'REQUEST_SUBMITTED',
        title: 'Receiver Requested Item',
        description: 'Arjun Verma submitted request for college commute assistance.',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        donationId: bicycleDonation._id,
        requestId: bicycleReq._id,
        actorId: bicycleDonation.donorId,
        actorRole: 'donor',
        eventType: 'REQUEST_ACCEPTED',
        title: 'Donor Accepted Request',
        description: 'Sarah accepted Arjun request and initiated handover coordination.',
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
      },
      {
        donationId: bicycleDonation._id,
        requestId: bicycleReq._id,
        actorId: null,
        actorRole: 'system',
        eventType: 'OTP_GENERATED',
        title: 'Handover Verification OTP Generated',
        description: 'Cryptographic 6-digit verification code created for receiver.',
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
      },
      {
        donationId: bicycleDonation._id,
        requestId: bicycleReq._id,
        actorId: bicycleDonation.donorId,
        actorRole: 'donor',
        eventType: 'READY_FOR_PICKUP',
        title: 'Item Ready for Handover',
        description: 'Bicycle tuned and ready for collection near metro station.',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        donationId: bicycleDonation._id,
        requestId: bicycleReq._id,
        actorId: bicycleDonation.donorId,
        actorRole: 'donor',
        eventType: 'OTP_VERIFIED',
        title: 'Handover OTP Verified',
        description: 'Donor successfully verified Arjun 6-digit receiver code.',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        donationId: bicycleDonation._id,
        requestId: bicycleReq._id,
        actorId: null,
        actorRole: 'system',
        eventType: 'DONATION_COMPLETED',
        title: 'Donation Officially Completed',
        description: 'Handover verified and marked completed with full proof of receipt.',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },

      // Monitor Handover Timeline (Active Handover)
      {
        donationId: monitorDonation._id,
        requestId: null,
        actorId: monitorDonation.donorId,
        actorRole: 'donor',
        eventType: 'DONATION_CREATED',
        title: 'Donation Listing Created',
        description: 'Rahul Sharma listed Dell 24-inch Monitor.',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        donationId: monitorDonation._id,
        requestId: monitorReq._id,
        actorId: monitorReq.receiverId,
        actorRole: 'receiver',
        eventType: 'REQUEST_SUBMITTED',
        title: 'Receiver Requested Item',
        description: 'Priya Sundaram requested monitor for community shelter learning lab.',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000)
      },
      {
        donationId: monitorDonation._id,
        requestId: monitorReq._id,
        actorId: monitorDonation.donorId,
        actorRole: 'donor',
        eventType: 'REQUEST_ACCEPTED',
        title: 'Donor Accepted Request',
        description: 'Rahul accepted Priya request for the children learning center.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        donationId: monitorDonation._id,
        requestId: monitorReq._id,
        actorId: null,
        actorRole: 'system',
        eventType: 'OTP_GENERATED',
        title: 'Handover Verification OTP Active',
        description: `Secure 6-digit OTP [${monitorOtp}] generated for receiver Priya Sundaram.`,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        donationId: monitorDonation._id,
        requestId: monitorReq._id,
        actorId: monitorDonation.donorId,
        actorRole: 'donor',
        eventType: 'READY_FOR_PICKUP',
        title: 'Item Ready for Pickup',
        description: 'Packed at Indiranagar office desk for pickup.',
        timestamp: new Date(Date.now() - 30 * 60 * 1000)
      }
    ]);

    // 5. Seed Messages for the completed Bicycle handover
    const completedReq = createdRequests[0];
    await Message.create([
      {
        requestId: completedReq._id,
        senderId: userMap['arjun.receiver@example.com'],
        receiverId: userMap['sarah.donor@example.com'],
        message: 'Hello Sarah, thank you for accepting my request! What time works best for you for the pickup?'
      },
      {
        requestId: completedReq._id,
        senderId: userMap['sarah.donor@example.com'],
        receiverId: userMap['arjun.receiver@example.com'],
        message: 'Hi Arjun! You can come by Thursday between 5 PM and 7 PM near South Extension market. The cycle is tuned and ready for you.'
      },
      {
        requestId: completedReq._id,
        senderId: userMap['arjun.receiver@example.com'],
        receiverId: userMap['sarah.donor@example.com'],
        message: 'Perfect! I have reached and collected the bicycle. Thank you again for your kindness!'
      }
    ]);

    // 6. Seed Notifications
    await Notification.create([
      {
        userId: userMap['sarah.donor@example.com'],
        title: 'Donation Successfully Completed',
        message: 'The handover of Hercules Mountain Bicycle to Arjun Verma has been completed.',
        type: 'donation_completed',
        isRead: true
      },
      {
        userId: userMap['rahul.donor@example.com'],
        title: 'New Donation Request',
        message: 'Arjun Verma requested "Lenovo ThinkPad 14-inch Laptop".',
        type: 'request_received',
        isRead: false
      },
      {
        userId: userMap['priya.receiver@example.com'],
        title: 'Request Accepted!',
        message: 'Rahul Sharma accepted your request for "Dell 24-inch Full HD IPS Monitor".',
        type: 'request_accepted',
        isRead: false
      }
    ]);

    // 7. Seed Wishlist
    await Wishlist.create({
      userId: userMap['arjun.receiver@example.com'],
      donations: [createdDonations[0]._id, createdDonations[3]._id]
    });

    // 8. Seed Contact Message
    await ContactMessage.create({
      name: 'Dr. Manoj Deshpande',
      email: 'manoj.deshpande@ngo-care.org',
      subject: 'Bulk medical equipment donation partnership',
      message: 'Hello GiveCare team, our hospital trust has 20 refurbished hospital beds and wheelchairs to donate. Can we partner for logistics assistance?',
      status: 'New'
    });

    console.log('Database seeded successfully with realistic full-stack data!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedData();
