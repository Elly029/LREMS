
import mongoose from 'mongoose';
import User from '../src/models/User';
import Evaluator from '../src/models/Evaluator';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const checkUsers = async () => {
    const logFile = path.join(__dirname, '../../user_check_output.txt');
    const log = (msg: string) => {
        console.log(msg);
        fs.appendFileSync(logFile, msg + '\n');
    };

    try {
        fs.writeFileSync(logFile, 'Starting user check...\n');
        const dbUrl = process.env.DATABASE_URL || 'mongodb://localhost:27017/book_management';
        log(`Connecting to ${dbUrl}`);

        await mongoose.connect(dbUrl);
        log('Connected to MongoDB');

        const users = await User.find({}).lean();
        log(`Total Users: ${users.length}`);

        const admins = users.filter(u => u.is_admin_access);
        const evaluators = users.filter(u => u.evaluator_id);
        const regularUsers = users.filter(u => !u.is_admin_access && !u.evaluator_id);

        log(`Admins: ${admins.length}`);
        log(`Evaluators (with evaluator_id): ${evaluators.length}`);
        log(`Regular Users: ${regularUsers.length}`);

        log('\n--- Sample Evaluator Users ---');
        evaluators.slice(0, 5).forEach(u => {
            log(`Name: ${u.name}, Username: ${u.username}, Evaluator ID: ${u.evaluator_id}`);
        });

        log('\n--- Sample Regular Users ---');
        regularUsers.slice(0, 5).forEach(u => {
            log(`Name: ${u.name}, Username: ${u.username}, Evaluator ID: ${u.evaluator_id}`);
        });

        // Check specific users from the screenshot
        const screenshotUsers = ['Mak', 'Rejoice', 'Lanie', 'Rhod', 'Micah', 'Ven'];
        log('\n--- Screenshot Users Check ---');
        for (const name of screenshotUsers) {
            const user = users.find(u => u.name.includes(name) || u.username.includes(name.toLowerCase()));
            if (user) {
                log(`Found ${name}: Role=${user.is_admin_access ? 'admin' : (user.evaluator_id ? 'evaluator' : 'user')}, EvaluatorID=${user.evaluator_id}`);
            } else {
                log(`Could not find user matching "${name}"`);
            }
        }

    } catch (error) {
        log(`Error: ${error}`);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

checkUsers();
