import nodemailer from 'nodemailer';
import { formatTime12Hour, generateGoogleCalendarLink } from './utils';



const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Sends a notification email to the admin for a new booking
 */
export const sendAdminNotification = async (appointment) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('Skipping email notification: SMTP credentials not set');
    return;
  }

  const { name, email, service, date, time } = appointment;
  const formattedDate = new Date(date).toLocaleDateString();
  const formattedTime = formatTime12Hour(time);

  const mailOptions = {
    from: `"Appointment Booking" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER, // send to admin
    subject: `New Booking Request: ${service} with ${name}`,
    html: `
      <h2>New Appointment Request</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Service:</strong> ${service}</p>
      <p><strong>Date:</strong> ${formattedDate}</p>
      <p><strong>Time:</strong> ${formattedTime}</p>
      <p>Please log in to the admin dashboard to confirm or cancel this request.</p>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Admin notification sent:', info.messageId);
  } catch (error) {
    console.error('Error sending admin notification:', error);
  }
};

/**
 * Sends a confirmation email to the client when approved
 */
export const sendClientConfirmation = async (appointment) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('Skipping email confirmation: SMTP credentials not set');
    return;
  }

  const { name, email, service, date, time } = appointment;
  const formattedDate = new Date(date).toLocaleDateString();
  const formattedTime = formatTime12Hour(time);
  const calendarLink = generateGoogleCalendarLink(service, date, time);

  const mailOptions = {
    from: `"Admin" <${process.env.EMAIL_USER}>`,
    to: email, // send to client
    subject: `Booking Confirmed: ${service}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #4ade80;">Your Appointment is Confirmed!</h2>
        <p>Hi ${name},</p>
        <p>Your appointment for <strong>${service}</strong> has been successfully confirmed. Here are the details:</p>
        <ul>
          <li><strong>Date:</strong> ${formattedDate}</li>
          <li><strong>Time:</strong> ${formattedTime}</li>
        </ul>
        
        <div style="margin: 24px 0;">
          <a href="${calendarLink}" target="_blank" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            Add to Google Calendar
          </a>
        </div>

        <p>We look forward to seeing you. If you need to cancel or reschedule, please reply to this email.</p>
        <br/>
        <p>Best regards,</p>
        <p>The Support Team</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Client confirmation sent:', info.messageId);
  } catch (error) {
    console.error('Error sending client confirmation:', error);
  }
};

/**
 * Sends a cancellation email to the client
 */
export const sendClientCancellation = async (appointment) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('Skipping email cancellation message: SMTP credentials not set');
    return;
  }

  const { name, email, service, date, time } = appointment;
  const formattedDate = new Date(date).toLocaleDateString();
  const formattedTime = formatTime12Hour(time);

  const mailOptions = {
    from: `"Admin" <${process.env.EMAIL_USER}>`,
    to: email, // send to client
    subject: `Notice: Booking Cancelled - ${service}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #f87171;">Your Appointment was Cancelled</h2>
        <p>Hi ${name},</p>
        <p>We regret to inform you that your request for <strong>${service}</strong> on ${formattedDate} at ${formattedTime} has been cancelled.</p>
        <p>If you believe this was a mistake or you would like to submit a new request, please visit our booking page again.</p>
        <br/>
        <p>Best regards,</p>
        <p>The Support Team</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Client cancellation sent:', info.messageId);
  } catch (error) {
    console.error('Error sending client cancellation:', error);
  }
};
