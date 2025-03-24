require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const { createClient } = require('@sanity/client');

const app = express();
app.use(cors());
app.use(express.json());

const corsOptions = {
  // origin: 'http://localhost:5173',
  origin: 'https://reschedulingdates.com/',
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Sanity.io configuration
const sanity = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET,
  token: process.env.SANITY_TOKEN,
  useCdn: false,
  apiVersion: '2023-05-03' // Add API version
});

// Nodemailer configuration
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    // Do not fail on invalid certs
    rejectUnauthorized: false
  }
});

// Test email endpoint
app.get('/test-email', async (req, res) => {
  try {
    await transporter.sendMail({
      from: `"Appointment System" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: 'Appointment Reschedule Request',
      text: 'This is a test email from your Hostinger setup'
    });
    console.log('Test email sent successfull')
    res.send('Test email sent successfully');
  } catch (error) {
    console.log('User', process.env.EMAIL_USER, 'Admin', process.env.ADMIN_EMAIL, 'Host', process.env.EMAIL_HOST, 'Port', process.env.EMAIL_PORT)
    console.error('Test email failed:', error);
    res.status(500).send('Error sending test email');
  }
});

// API endpoint to handle form submission
app.post('/api/appointments', async (req, res) => {
  try {
    const formData = req.body;
    
    // 1. Save to Sanity.io
    const sanityResponse = await sanity.create({
      _type: 'appointment',
      ...formData,
      currentDate: formData.currentDate,
      newDate: formData.newDate
    });

    // 2. Send email to admin
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
            <p><strong>Current Appointment:</strong> ${new Date(formData.currentDate).toLocaleString()}</p>
            <p><strong>New Appointment:</strong> ${new Date(formData.newDate).toLocaleDateString()} at ${formData.time}</p>
            <p><strong>Location:</strong> ${formData.location}</p>
          </div>
          <p style="margin-top: 20px; color: #718096;">
            This message was sent from your website's appointment system.
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ 
      success: true, 
      message: 'Appointment request submitted successfully!' 
    });
    
  } catch (error) {
    console.error('Submission error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error submitting appointment request' 
    });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});