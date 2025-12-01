import mongoose from 'mongoose';
import User from '../models/User';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });

const checkUsers = async () => {
    try {
        if (!process.env.DATABASE_URL) {
            throw new Error("DATABASE_URL is not defined in .env");
        }
        await mongoose.connect(process.env.DATABASE_URL);
        console.log('Connected to DB');

        const usernamesToCheck = [
            'celso',
            'Mak',
            'Rhod',
            'ven',
            'micah',
            'leo',
            'rejoice',
            'jc',
            'nonie'
        ];

        // List all users to debug
        const allUsers = await User.find({});
        console.log(`Total users found: ${allUsers.length}`);
        allUsers.forEach(u => {
            if (u.username) {
                console.log(`- ${u.username} (Name: ${u.name})`);
            } else {
                console.log(`- [MISSING USERNAME] ID: ${u._id}`);
                console.log(`  Raw: ${JSON.stringify(u.toJSON(), null, 2)}`);
            }
        });

        console.log('\n--- User Assignments Verification ---\n');

        for (const username of usernamesToCheck) {
            const user = allUsers.find(u => u.username && u.username.toLowerCase() === username.toLowerCase());

            if (!user) {
                console.log(`User: ${username} - NOT FOUND`);
                continue;
            }

            console.log(`User: ${user.username}`);
            if (user.is_admin_access) {
                console.log('Role: Admin Access (Full Access)');
            }

            if (user.access_rules && user.access_rules.length > 0) {
                console.log('Access Rules:');
                user.access_rules.forEach((rule, index) => {
                    const areas = rule.learning_areas.join(', ');
                    const grades = rule.grade_levels.length > 0 ? rule.grade_levels.join(', ') : 'All Grades';
                    console.log(`  Rule ${index + 1}: Areas: [${areas}], Grades: [${grades}]`);
                });
            } else {
                console.log('Access Rules: None (or implied full access if admin)');
            }
            console.log('-----------------------------------');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from DB');
    }
};

checkUsers();
