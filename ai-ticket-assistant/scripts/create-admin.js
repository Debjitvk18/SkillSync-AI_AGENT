// Script to create the first admin user
// Run this with: node scripts/create-admin.js

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

// Define User schema (copy from models/user.js)
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'moderator', 'admin'],
        default: 'user'
    },
    skills: {
        type: [String],
        default: []
    }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function createAdmin() {
    try {
        // Connect to MongoDB
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Get admin details from command line or use defaults
        const email = process.argv[2] || 'admin@example.com';
        const password = process.argv[3] || 'admin123';
        const skills = process.argv[4] ? process.argv[4].split(',') : ['Support', 'System'];

        console.log(`\nCreating admin user with:`);
        console.log(`  Email: ${email}`);
        console.log(`  Password: ${password}`);
        console.log(`  Skills: ${skills.join(', ')}`);

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log(`\n⚠️  User with email ${email} already exists.`);
            console.log(`Current role: ${existingUser.role}`);

            // Update to admin if not already
            if (existingUser.role !== 'admin') {
                existingUser.role = 'admin';
                existingUser.skills = skills;
                await existingUser.save();
                console.log(`✅ Updated user to admin role!`);
            } else {
                console.log(`ℹ️  User is already an admin.`);
            }
        } else {
            // Create new admin user
            const hashedPassword = await bcrypt.hash(password, 10);
            const admin = await User.create({
                email,
                password: hashedPassword,
                role: 'admin',
                skills
            });
            console.log(`\n✅ Admin user created successfully!`);
            console.log(`   ID: ${admin._id}`);
        }

        console.log(`\n🎉 You can now login with:`);
        console.log(`   Email: ${email}`);
        console.log(`   Password: ${password}`);
        console.log(`\n🔗 Login at: http://localhost:5173/login`);

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('\n✅ Database connection closed');
        process.exit(0);
    }
}

// Run the script
createAdmin();
