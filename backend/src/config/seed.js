import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Pickup from '../models/Pickup.js';
import Donation from '../models/Donation.js';
import Reward from '../models/Reward.js';
import Ewaste from '../models/Ewaste.js';
import Counter from '../models/Counter.js';

dotenv.config();

export const seedDatabase = async () => {
  try {
    const userCount = await User.countDocuments();
    let seededUsers = [];
    if (userCount === 0) {
      console.log('[Seeder] Populating initial demo users into MongoDB...');

      seededUsers = await User.create([
        {
          name: 'Aarav Sharma',
          email: 'user@econexis.com',
          password: 'Password123',
          role: 'user',
          phone: '+91 98765 43210',
          college: 'National Institute of Technology',
          address: 'Room 304, Block B, Campus Hostel',
          ecoPoints: 1250,
          recycledKg: 24.5,
          co2SavedKg: 18.2,
          greenLevel: 'Eco Hero',
          status: 'Active',
        },
        {
          name: 'Dr. Sunita Rao',
          email: 'admin@econexis.com',
          password: 'Password123',
          role: 'admin',
          phone: '+91 98450 11223',
          college: 'National Institute of Technology',
          address: 'Admin HQ, EcoNexis Operations Center',
          department: 'Sustainability & Operations Admin',
          ecoPoints: 9800,
          recycledKg: 1240.0,
          co2SavedKg: 930.0,
          greenLevel: 'Eco Legend',
          status: 'Active',
        },
        {
          name: 'Vikram Singh',
          email: 'delivery@econexis.com',
          password: 'Password123',
          role: 'delivery',
          phone: '+91 91234 56789',
          college: 'National Institute of Technology',
          address: 'Campus Fleet Logistics Hub',
          vehicleNumber: 'EV-VAN-4022',
          assignedArea: 'North City Campus Hub',
          ecoPoints: 3400,
          recycledKg: 310.0,
          co2SavedKg: 232.5,
          greenLevel: 'Eco Champion',
          status: 'Active',
        },
      ]);
      console.log(`[Seeder] Seeded ${seededUsers.length} initial users into MongoDB.`);
    } else {
      seededUsers = await User.find();
    }

    const regularUser = seededUsers.find((u) => u.email === 'user@econexis.com') || seededUsers[0];
    const deliveryUser = seededUsers.find((u) => u.email === 'delivery@econexis.com');

    const pickupCount = await Pickup.countDocuments();
    if (pickupCount === 0) {
      console.log('[Seeder] Populating initial pickups into MongoDB...');
      await Pickup.create([
        {
          trackingId: 'ECO-1024',
          userName: 'Aarav Sharma',
          userPhone: '+91 98765 43210',
          pickupAddress: 'Room 304, Block B, Campus Hostel, National Institute of Technology',
          item: 'Laptop & 3 Power Adapters',
          category: 'Smartphones & Laptops',
          quantity: 1,
          pickupDate: '2026-08-25',
          pickupTime: '02:00 PM - 04:00 PM',
          notes: 'Please call when arriving at Gate 3',
          status: 'Assigned',
          deliveryAgent: 'Vikram Singh',
        },
        {
          trackingId: 'ECO-1025',
          userName: 'Keerthana Reddy',
          userPhone: '+91 98222 33445',
          pickupAddress: 'Apt 502, Green Meadows Residency, College Road',
          item: 'Desktop CPU, Monitor & Keyboard',
          category: 'Desktop CPU, Monitor & Keyboard',
          quantity: 3,
          pickupDate: '2026-08-25',
          pickupTime: '10:00 AM - 12:00 PM',
          notes: 'Leave with security guard if not available',
          status: 'Pending',
          deliveryAgent: 'Unassigned',
        },
        {
          trackingId: 'ECO-1022',
          userName: 'Rohan Varma',
          userPhone: '+91 99112 88440',
          pickupAddress: 'House 14B, Faculty Quarters, Campus East',
          item: '2 Smartphones & Old Tablet',
          category: 'Smartphones & Laptops',
          quantity: 3,
          pickupDate: '2026-08-22',
          pickupTime: '04:00 PM - 06:00 PM',
          notes: 'Batteries taped safely',
          status: 'Completed',
          deliveryAgent: 'Vikram Singh',
          measuredWeight: 2.4,
          pointsAwarded: 100,
        },
      ]);
      console.log('[Seeder] Initial pickups seeded successfully.');
    }

    const donationCount = await Donation.countDocuments();
    if (donationCount === 0) {
      console.log('[Seeder] Populating initial donations into MongoDB...');
      await Donation.create([
        {
          donationId: 'DON-1001',
          userName: 'Keerthana Reddy',
          item: 'Lenovo ThinkPad Yoga',
          category: 'Laptops',
          quantity: 1,
          condition: 'Good',
          description: 'Working core i5 laptop with charger',
          deliveryMethod: 'Doorstep Pickup',
          beneficiaryOption: 'Underserved School Students',
          status: 'Received',
          ecoPointsAwarded: 150,
        },
        {
          donationId: 'DON-1002',
          userName: 'Aarav Sharma',
          item: 'Apple iPad 8th Gen',
          category: 'Tablets',
          quantity: 1,
          condition: 'Fully Functional',
          description: 'Used for coursework, screen in great condition',
          deliveryMethod: 'Campus Collection Kiosk Drop-off',
          beneficiaryOption: 'Underserved School Students',
          status: 'Allocated',
          ecoPointsAwarded: 150,
        },
      ]);
      console.log('[Seeder] Initial donations seeded successfully.');
    }

    const rewardCount = await Reward.countDocuments();
    if (rewardCount === 0) {
      console.log('[Seeder] Populating initial EcoRewards into MongoDB...');
      await Reward.create([
        {
          rewardCode: 'REW-101',
          title: 'Eco Badge (Verified Recycler)',
          points: 200,
          category: 'Digital',
          icon: 'Award',
          description: 'Display an exclusive eco-warrior badge on your student profile and resume.',
          claimed: true,
        },
        {
          rewardCode: 'REW-102',
          title: 'Plant a Tree in Your Name',
          points: 500,
          category: 'Impact',
          icon: 'TreePine',
          description: 'We partner with local forestry to plant a geo-tagged sapling in your honour.',
          claimed: false,
        },
        {
          rewardCode: 'REW-103',
          title: 'EcoNexis Reusable Bottle',
          points: 750,
          category: 'Merchandise',
          icon: 'CupSoda',
          description: 'Insulated stainless steel thermal water bottle made from recycled metals.',
          claimed: false,
        },
        {
          rewardCode: 'REW-104',
          title: 'Campus Cafeteria Eco Voucher (₹250)',
          points: 1000,
          category: 'Voucher',
          icon: 'Gift',
          description: 'Redeemable for delicious meals & green beverages at campus eateries.',
          claimed: false,
        },
        {
          rewardCode: 'REW-105',
          title: 'Green Champion Trophy & Certificate',
          points: 1500,
          category: 'Honor',
          icon: 'Medal',
          description: 'Physical award presented during the annual University Sustainability Gala.',
          claimed: false,
        },
        {
          rewardCode: 'REW-106',
          title: 'Solar-Powered Pocket Power Bank',
          points: 2000,
          category: 'Gadgets',
          icon: 'Sun',
          description: 'High-efficiency 10,000mAh solar charging pack for your smartphones & gadgets.',
          claimed: false,
        },
      ]);
      console.log('[Seeder] Initial EcoRewards seeded successfully.');
    }

    const ewasteCount = await Ewaste.countDocuments();
    if (ewasteCount === 0) {
      console.log('[Seeder] Populating initial E-Waste inventory into MongoDB...');
      await Ewaste.create([
        {
          objectId: 'OBJ-000001',
          itemId: 'OBJ-000001',
          type: 'Laptop / Notebook Computer',
          itemName: 'Laptop / Notebook Computer',
          category: 'Computing & IT Equipment',
          aiDetection: 'laptop',
          aiConfidence: 94,
          quantity: 1,
          condition: 'Refurbishable / Recyclable',
          status: 'Registered',
          pickupStatus: 'Pending',
          recyclingStatus: 'Pending',
          weightKg: 2.2,
          owner: regularUser?.name || 'Aarav Sharma',
          ownerId: regularUser?._id,
          user: regularUser?._id,
          userName: regularUser?.name || 'Aarav Sharma',
        },
        {
          objectId: 'OBJ-000002',
          itemId: 'OBJ-000002',
          type: 'Smartphone / Mobile Device',
          itemName: 'Smartphone / Mobile Device',
          category: 'Small Electronics & Mobile',
          aiDetection: 'cell phone',
          aiConfidence: 89,
          quantity: 1,
          condition: 'Scrap',
          status: 'Picked Up',
          pickupStatus: 'Picked Up',
          recyclingStatus: 'Collected',
          weightKg: 0.3,
          owner: 'Keerthana Reddy',
          deliveryPartner: deliveryUser?._id,
          deliveryPartnerName: deliveryUser?.name || 'Vikram Singh',
          pickupConfirmedAt: new Date(),
        },
      ]);

      // Initialize counter to 2
      await Counter.findByIdAndUpdate(
        'ewasteObjectId',
        { seq: 2 },
        { upsert: true }
      );

      console.log('[Seeder] Initial E-Waste inventory seeded successfully with permanent objectId.');
    }
  } catch (error) {
    console.error(`[Seeder Error] Failed to seed initial data: ${error.message}`);
  }
};

// If run directly via node command
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  mongoose
    .connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/econexis')
    .then(async () => {
      console.log('[Seeder] Connected to MongoDB.');
      await seedDatabase();
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
