// Generate secure JWT secrets for Railway deployment
import crypto from 'crypto';

console.log('\n🔐 RAILWAY DEPLOYMENT - JWT SECRETS GENERATOR\n');
console.log('Copy these values to your Railway environment variables:\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('JWT_SECRET=');
console.log(crypto.randomBytes(32).toString('hex'));
console.log('\nJWT_REFRESH_SECRET=');
console.log(crypto.randomBytes(32).toString('hex'));

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('✅ Secrets generated successfully!');
console.log('💡 These are cryptographically secure random strings.');
console.log('⚠️  Keep these secret and never commit them to Git!\n');
