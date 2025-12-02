import fs from 'fs';
import path from 'path';

const exportPath = path.join(__dirname, '..', 'database_export.json');

try {
    if (!fs.existsSync(exportPath)) {
        console.log('❌ database_export.json not found');
    } else {
        const data = fs.readFileSync(exportPath, 'utf8');
        const json = JSON.parse(data);
        console.log('📁 Keys in export file:', Object.keys(json));

        if (json.books) {
            console.log(`📚 Found ${json.books.length} books in export file.`);
        } else {
            console.log('❌ No "books" key found in export file.');
        }

        if (json.users) {
            console.log(`👤 Found ${json.users.length} users in export file.`);
        }
    }
} catch (error) {
    console.error('Error reading export file:', error);
}
