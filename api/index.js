'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const serverless = require('serverless-http');

const app = express();
app.use(cors());
app.use(express.json());

// Email transporter config
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Root endpoint
app.get('/', (req, res) => {
  res.send('Hello from Express on Vercel');
});

// Email test endpoint
app.get('/test-email', async (req, res) => {
  try {
    const mail = await transporter.sendMail({
      from: `"Appointment System" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: 'Appointment Reschedule Test',
      text: 'This is a test email from your Hostinger setup via Vercel.',
    });
    console.log('✅ Test email sent:', mail.messageId);
    res.send('Test email sent successfully');
  } catch (error) {
    console.error('❌ Email test failed:', error);
    res.status(500).send('Error sending test email');
  }
});

// Appointment form submission endpoint
app.post('/appointments', async (req, res) => {
  console.log('📨 /appointments endpoint hit');

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
            <p><strong>Phone:</strong><a href="https://wa.me/${formData.phone}"> ${formData.phone}</a></p>
            <p><strong>Has online visa portal:</strong> ${formData.currentDate}</p>
            <p><strong>New Appointment:</strong> ${new Date(formData.newDate).toLocaleDateString()} at ${formData.time}</p>
            <p><strong>Location:</strong> ${formData.location}</p>
          </div>
          <p style="margin-top: 20px; color: #718096;">
            This message was sent from your website's appointment system.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    console.log('✅ Appointment email sent');
    return res.status(200).json({
      success: true,
      message: 'Appointment request submitted successfully!',
    });
  } catch (error) {
    console.error('❌ Submission error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error submitting appointment request',
      error: error.message, // Optional: Include error details for debugging
    });
  }
});

module.exports = app;
module.exports.handler = serverless(app);
