
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User';
import { connectDatabase } from '../config/database';

// Load environment variables
dotenv.config();

const users = [
    {
        username: 'celso',
        name: 'Celso',
        access_rules: [{ learning_areas: ['Mathematics', 'EPP', 'TLE'], grade_levels: [] }],
        is_admin_access: true
    },
    {
        username: 'mak',
        name: 'Mak',
        access_rules: [{ learning_areas: ['English', 'Reading & Literature'], grade_levels: [] }]
    },
    {
        username: 'leo',
        name: 'Leo',
        access_rules: [{ learning_areas: ['Science'], grade_levels: [] }],
        is_admin_access: true
    },
    {
        username: 'rejoice',
        name: 'Rejoice',
        access_rules: [{ learning_areas: ['Filipino', 'Language'], grade_levels: [] }]
    },
    {
        username: 'lanie',
        name: 'Lanie',
        access_rules: [{ learning_areas: ['Filipino'], grade_levels: [] }]
    },
    {
        username: 'rhod',
        name: 'Rhod',
        access_rules: [{ learning_areas: ['GMRC', 'Values Education'], grade_levels: [] }]
    },
    {
        username: 'micah',
        name: 'Micah',
        access_rules: [{ learning_areas: ['MAKABANSA', 'Araling Panlipunan'], grade_levels: [] }]
    },
    {
        username: 'ven',
        name: 'Ven',
        access_rules: [{ learning_areas: ['English'], grade_levels: [] }]
    },
    {
        username: 'nonie',
        name: 'Nonie',
        access_rules: [{ learning_areas: ['*'], grade_levels: [] }], // Admin - Full Access
        is_admin_access: true
    },
    {
        username: 'jc',
        name: 'JC',
        access_rules: [{ learning_areas: ['*'], grade_levels: [] }], // Admin - Full Access
        is_admin_access: true
    },
    {
        username: 'admin-l',
        name: 'ADMIN-L',
        access_rules: [{ learning_areas: ['*'], grade_levels: [] }], // Admin - Full Access
        is_admin_access: true
    },
    {
        username: 'admin-c',
        name: 'ADMIN-C',
        access_rules: [{ learning_areas: ['*'], grade_levels: [] }], // Admin - Full Access
        is_admin_access: true
    }
];

async function seedUsers() {
    try {
        console.log('Connecting to database...');
        await connectDatabase();

        console.log('Seeding Users...');

        // Default password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('BLRFACI123', salt);

        for (const user of users) {
            const existingUser = await User.findOne({ username: user.username });
            if (existingUser) {
                console.log(`User ${user.username} already exists. Updating...`);
                existingUser.access_rules = user.access_rules;
                existingUser.is_admin_access = user.is_admin_access || false;
                // Optional: Reset password if needed, but let's keep existing password if user exists
                // existingUser.password = hashedPassword; 
                await existingUser.save();
            } else {
                console.log(`Creating user ${user.username}...`);
                await User.create({
                    ...user,
                    is_admin_access: user.is_admin_access || false,
                    password: hashedPassword
                });
            }
        }

        console.log('All users seeded successfully.');
    } catch (error) {
        console.error('Error seeding users:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from database.');
    }
}

seedUsers();
