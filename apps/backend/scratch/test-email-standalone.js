const nodemailer = require('nodemailer');
require('dotenv').config({ path: '../.env' });

async function testEmail() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  console.log(`Config: ${host}:${port} (User: ${user})`);

  const transporter = nodemailer.createTransport({
    host,
    port: Number(port),
    secure: Number(port) === 465,
    auth: user && pass ? { user, pass } : undefined,
  });

  try {
    console.log('Sending test email...');
    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || 'Test'}" <${process.env.SMTP_FROM_EMAIL || user}>`,
      to: 'karthikpalanipk@gmail.com',
      subject: 'Test Email',
      text: 'This is a test email.',
    });
    console.log('✅ Email sent:', info.messageId);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testEmail();
