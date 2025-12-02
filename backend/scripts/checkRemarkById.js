const mongoose = require('mongoose');

async function main() {
  const remarkId = process.argv[2];
  if (!remarkId) {
    console.error('Usage: node scripts/checkRemarkById.js <remarkId>');
    process.exit(1);
  }

  const uri = process.env.DATABASE_URL || 'mongodb://localhost:27017/book_management';
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    const isValid = mongoose.Types.ObjectId.isValid(remarkId);
    if (!isValid) {
      console.log(JSON.stringify({ exists: false, reason: 'invalid_id_format', remarkId }));
      return;
    }

    const Remark = mongoose.model('Remark', new mongoose.Schema({}, { strict: false }), 'remarks');
    const remark = await Remark.findById(remarkId).lean();
    if (!remark) {
      console.log(JSON.stringify({ exists: false, reason: 'not_found', remarkId }));
    } else {
      console.log(JSON.stringify({ exists: true, remarkId, book_code: remark.book_code }));
    }
  } catch (err) {
    console.error('Error checking remark:', err);
  } finally {
    await mongoose.connection.close();
  }
}

main();
