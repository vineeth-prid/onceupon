const fs = require('fs');
const path = require('path');
const Razorpay = require('razorpay');

// Simplified .env parser
let key_id, key_secret;
try {
  const envContent = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
  const lines = envContent.split('\n');
  for (const line of lines) {
    if (line.includes('RAZORPAY_KEY_ID=')) key_id = line.split('=')[1].trim();
    if (line.includes('RAZORPAY_KEY_SECRET=')) key_secret = line.split('=')[1].trim();
  }
} catch (e) {
  console.error('Error reading .env file:', e.message);
  process.exit(1);
}

if (!key_id || !key_secret) {
  console.error('Error: RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET missing in .env');
  process.exit(1);
}

const razorpay = new Razorpay({ key_id, key_secret });

async function createCoupon() {
  const couponData = {
    name: 'WELCOME20',
    type: 'percentage',
    value: 20, // 20% discount
  };

  console.log(`Creating coupon ${couponData.name} in Razorpay...`);

  try {
    const coupon = await razorpay.coupons.create(couponData);
    console.log('Successfully created coupon in Razorpay!');
    console.log('Coupon Details:', JSON.stringify(coupon, null, 2));
    console.log('\nNote: To use this in your app, ensure your backend database is running and the coupon is also added to the Coupon table.');
  } catch (error) {
    console.error('Failed to create coupon:');
    console.error(error.description || error.message || error);
  }
}

createCoupon();
