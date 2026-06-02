import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Review from '../models/Review.js';
import Message from '../models/Message.js';

dotenv.config();

const seedData = async () => {
  try {
    console.log('⚡ Starting database seed process...');
    
    // Connect to database (either Mongoose connects or we initialize local JSON db)
    await connectDB();

    // 1. Clean previous data
    if (global.isLocalDB) {
      console.log('🧹 Purging local database local_db.json...');
      const dbPath = path.resolve('local_db.json');
      const cleanDB = { users: [], products: [], messages: [], reviews: [] };
      fs.writeFileSync(dbPath, JSON.stringify(cleanDB, null, 2), 'utf-8');
    } else {
      console.log('🧹 Purging MongoDB Collections...');
      await User.MongoUser.deleteMany({});
      await Product.MongoProduct.deleteMany({});
      await Review.MongoReview.deleteMany({});
      await Message.MongoMessage.deleteMany({});
    }

    // 2. Create sample password hash
    const salt = await bcrypt.genSalt(10);
    const commonPassword = await bcrypt.hash('student123', salt);

    console.log('👤 Seeding Users...');
    // Seed admin & students
    const adminUser = await User.create({
      name: 'Professor Dave (Admin)',
      email: 'admin@college.edu',
      password: commonPassword,
      role: 'admin',
      contactInfo: { phone: '1234567890', whatsapp: 'https://wa.me/1234567890', telegram: 't.me/prof_dave' },
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=admin'
    });

    const seniorUser = await User.create({
      name: 'Alex Rivera (Senior)',
      email: 'alex@college.edu',
      password: commonPassword,
      role: 'student',
      contactInfo: { phone: '9876543210', whatsapp: 'https://wa.me/9876543210', telegram: 't.me/alex_rivera' },
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=alex'
    });

    const robotechUser = await User.create({
      name: 'Rohan Sharma (Robotech Core)',
      email: 'rohan@college.ac.in',
      password: commonPassword,
      role: 'student',
      contactInfo: { phone: '8887776665', whatsapp: 'https://wa.me/8887776665', telegram: 't.me/rohan_sharma' },
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=rohan'
    });

    const droneUser = await User.create({
      name: 'Emily Davis (Aero Club)',
      email: 'emily@college.edu',
      password: commonPassword,
      role: 'student',
      contactInfo: { phone: '5556667777', whatsapp: 'https://wa.me/5556667777', telegram: 't.me/emily_aero' },
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=emily'
    });

    console.log('🛒 Seeding Products and Hardware...');
    
    // Seed Electronic components
    const p1 = await Product.create({
      title: 'ESP32 NodeMCU Development Board',
      description: 'Brand new ESP32 WiFi + Bluetooth board, excellent for IoT projects. Fully tested, micro-USB interface, pre-flashed with MicroPython but works great on Arduino IDE.',
      price: 250,
      condition: 'New',
      category: 'Arduino & ESP Boards',
      images: ['https://images.unsplash.com/photo-1553406830-ef2513450d76?w=500&auto=format&fit=crop'],
      seller: seniorUser._id.toString(),
      sellerName: seniorUser.name,
      sellerEmail: seniorUser.email,
      status: 'available',
      isKit: false,
      views: 12
    });

    const p2 = await Product.create({
      title: 'Arduino Uno Starter Kit (Complete)',
      description: 'Used for one semester. Includes Arduino Uno R3 board, USB cable, breadboard, 65 jumper wires, LCD 1602 module, 5V relay, active buzzers, and a bundle of LEDs/Resistors in a plastic storage organizer box.',
      price: 499,
      condition: 'Good',
      category: 'Arduino & ESP Boards',
      images: ['https://images.unsplash.com/photo-1561736778-92e52a7769ef?w=500&auto=format&fit=crop'],
      seller: seniorUser._id.toString(),
      sellerName: seniorUser.name,
      sellerEmail: seniorUser.email,
      status: 'available',
      isKit: true,
      views: 34
    });

    const p3 = await Product.create({
      title: 'Quadcopter Carbon Fiber Frame (QAV250)',
      description: 'Heavy-duty 250mm pure carbon fiber quadcopter frame. Extremely durable and crash-resistant. Ideal for FPV racing drones or college aero-modeling projects. Weight is only 140g.',
      price: 900,
      condition: 'Used',
      category: 'Drone Components',
      images: ['https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=500&auto=format&fit=crop'],
      seller: droneUser._id.toString(),
      sellerName: droneUser.name,
      sellerEmail: droneUser.email,
      status: 'available',
      isKit: false,
      views: 18
    });

    const p4 = await Product.create({
      title: 'Lipo Battery 3S 2200mAh 35C (XT60)',
      description: '2 units of Orange LiPo batteries. Used only 3 times for my drone testing. Well-balanced, cell voltage is perfectly stable at 3.8V storage charge. Standard XT60 discharge connector and JST-XH balance plug.',
      price: 650,
      condition: 'Good',
      category: 'Batteries',
      images: ['https://images.unsplash.com/photo-1548142813-c348350df52b?w=500&auto=format&fit=crop'],
      seller: droneUser._id.toString(),
      sellerName: droneUser.name,
      sellerEmail: droneUser.email,
      status: 'available',
      isKit: false,
      views: 29
    });

    const p5 = await Product.create({
      title: 'MG996R Metal Gear High Torque Servo',
      description: '4 heavy-duty metal gear servos. 12kg torque, ideal for robotic arms, steering mechanisms, or hexapods. Selling all 4 as a package.',
      price: 350,
      condition: 'New',
      category: 'Motors & Drivers',
      images: ['https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=500&auto=format&fit=crop'],
      seller: robotechUser._id.toString(),
      sellerName: robotechUser.name,
      sellerEmail: robotechUser.email,
      status: 'available',
      isKit: false,
      views: 7
    });

    const p6 = await Product.create({
      title: 'Ultrasonic Sensors HC-SR04 (Pack of 5)',
      description: '5 high-accuracy distance measuring sensors. Ranges from 2cm to 400cm. Fully functional. Used for obstacle avoidance on my smart car. Selling the excess.',
      price: 150,
      condition: 'Good',
      category: 'Sensors',
      images: ['https://images.unsplash.com/photo-1581092334651-ddf26d9aae9f?w=500&auto=format&fit=crop'],
      seller: robotechUser._id.toString(),
      sellerName: robotechUser.name,
      sellerEmail: robotechUser.email,
      status: 'available',
      isKit: false,
      views: 22
    });

    const p7 = await Product.create({
      title: 'Soldering Iron Kit with Temperature Adjuster',
      description: 'Adjustable temperature soldering iron (60W) with 5 replacement tips, soldering wire tube, desoldering pump, tweezers, and simple iron stand. Ideal kit for electronic prototyping.',
      price: 450,
      condition: 'Good',
      category: 'Tools',
      images: ['https://images.unsplash.com/photo-1504148455328-c376907d081c?w=500&auto=format&fit=crop'],
      seller: seniorUser._id.toString(),
      sellerName: seniorUser.name,
      sellerEmail: seniorUser.email,
      status: 'available',
      isKit: false,
      views: 45
    });

    const p8 = await Product.create({
      title: 'Line Follower Robot (LFR) Complete Project Kit',
      description: 'Full college-ready project. Includes pre-assembled chassis, Arduino Uno, L293D motor driver shield, 5-array IR sensor board, 2x 300RPM geared motors, and chassis battery holder. Ready-to-flash code file included inside local repository!',
      price: 1200,
      condition: 'Good',
      category: 'Robotics Parts',
      images: ['https://images.unsplash.com/photo-1531747118685-ca8fa6e08806?w=500&auto=format&fit=crop'],
      seller: robotechUser._id.toString(),
      sellerName: robotechUser.name,
      sellerEmail: robotechUser.email,
      status: 'available',
      isKit: true,
      views: 67
    });

    const p9 = await Product.create({
      title: 'Laptop Cooling Pad with 4 Blue LED Fans',
      description: 'Ergonomic dual-angle cooling pad with 4 high-speed quiet fans. Powered by USB cable, extra pass-through USB port. Suitable for gaming or programming laptops up to 17 inches.',
      price: 300,
      condition: 'Good',
      category: 'Laptop Accessories',
      images: ['https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop'],
      seller: seniorUser._id.toString(),
      sellerName: seniorUser.name,
      sellerEmail: seniorUser.email,
      status: 'available',
      isKit: false,
      views: 9
    });

    const p10 = await Product.create({
      title: 'Fake SparkFun Breadboard - Mock Spam Post',
      description: 'This is a test spam post that violates guidelines. It sells commercial replica items at astronomical prices and does not allow student exchanges. It should be flagged and removed by an Administrator.',
      price: 99999,
      condition: 'New',
      category: 'Miscellaneous',
      images: ['https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop'],
      seller: seniorUser._id.toString(),
      sellerName: seniorUser.name,
      sellerEmail: seniorUser.email,
      status: 'available',
      isKit: false,
      views: 1
    });

    console.log('⭐ Seeding Reviews...');
    
    // Seed reviews
    await Review.create({
      reviewer: robotechUser._id.toString(),
      reviewerName: robotechUser.name,
      seller: seniorUser._id.toString(),
      rating: 5,
      comment: 'Alex was super helpful! The soldering iron was in pristine condition, and he even gave me some extra soldering wire for free!'
    });

    await Review.create({
      reviewer: seniorUser._id.toString(),
      reviewerName: seniorUser.name,
      seller: droneUser._id.toString(),
      rating: 4,
      comment: 'Battery operates beautifully! It was storage-charged as described. Smooth transaction inside the central library cafeteria.'
    });

    await Review.create({
      reviewer: seniorUser._id.toString(),
      reviewerName: seniorUser.name,
      seller: robotechUser._id.toString(),
      rating: 5,
      comment: 'Rohan is a robotics expert! He explained the entire LFR schematic during handover. Outstanding!'
    });

    console.log('💬 Seeding Messages...');
    
    // Seed dummy messages to simulate active chats
    const roomId = [seniorUser._id.toString(), robotechUser._id.toString()].sort().join('-');
    await Message.create({
      sender: robotechUser._id.toString(),
      receiver: seniorUser._id.toString(),
      senderName: robotechUser.name,
      receiverName: seniorUser.name,
      content: 'Hey Alex, is the Soldering Iron Kit still available? I can meet you at the Student Union building tomorrow.',
      roomId
    });

    await Message.create({
      sender: seniorUser._id.toString(),
      receiver: robotechUser._id.toString(),
      senderName: seniorUser.name,
      receiverName: robotechUser.name,
      content: 'Hey Rohan! Yes, it is still available. Tomorrow at the Student Union works perfectly. Any time after 2 PM is fine with me.',
      roomId
    });

    await Message.create({
      sender: robotechUser._id.toString(),
      receiver: seniorUser._id.toString(),
      senderName: robotechUser.name,
      receiverName: seniorUser.name,
      content: 'Great! Let us meet at 3 PM near the main cafeteria entrance. I will bring cash.',
      roomId
    });

    console.log('🎉 Seeding successfully completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding process error:', error);
    process.exit(1);
  }
};

seedData();
