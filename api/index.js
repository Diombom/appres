// /api/index.js

const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const serverless = require('serverless-http');

// Init express
const app = express();
app.use(cors());
app.use(express.json());

// Load environment variables (only for local dev)
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

// Nodemailer configuration
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Root route
app.get('/', (req, res) => {
  res.send('Hello from Express on Vercel');
});

// Test email route
app.get('/test-email', async (req, res) => {
  try {
    await transporter.sendMail({
      from: `"Appointment System" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: 'Appointment Reschedule Request',
      text: 'This is a test email from your Hostinger setup',
    });

    console.log('Test email sent successfully');
    res.send('Test email sent successfully');
  } catch (error) {
    console.error('Test email failed:', error);
    res.status(500).send('Error sending test email');
  }
});

// Handle appointment submission
app.post('/appointments', async (req, res) => {
  try {
    const formData = req.body;

    const mailOptions = {
      from: `"Appointment System" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: 'New Appointment Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2d3748;">New Appointment Request Received</h2>
          <div style="background: #f7fafc; padding: 20px; border-radius: 8px;">
            <p><strong>Name:</strong> ${formData.fullName}</p>
            <p><strong>Email:</strong> ${formData.email}</p>
            <p><strong>Phone:</strong> <a href="https://wa.me/${formData.phone}">${formData.phone}</a></p>
            <p><strong>Current Appointment:</strong> ${new Date(formData.currentDate).toLocaleString()}</p>
            <p><strong>New Appointment:</strong> ${new Date(formData.newDate).toLocaleDateString()} at ${formData.time}</p>
            <p><strong>Location:</strong> ${formData.location}</p>
          </div>
          <p style="margin-top: 20px; color: #718096;">This message was sent from your website's appointment system.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: 'Appointment request submitted successfully!',
    });
  } catch (error) {
    console.error('Submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting appointment request',
    });
  }
});

// ✅ Export as a serverless function
module.exports = serverless(app);
