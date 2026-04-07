import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Appointment from '@/models/Appointment';
import { sendAdminNotification } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectToDatabase();
    
    // Sort by date descending (newest first)
    const appointments = await Appointment.find({}).sort({ date: -1, createdAt: -1 });
    
    return NextResponse.json({ success: true, count: appointments.length, data: appointments });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    await connectToDatabase();
    
    // Check for Double-Booking
    if (body.date && body.time) {
      const targetDate = new Date(body.date);
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);

      const existingAppointment = await Appointment.findOne({
        date: { $gte: startOfDay, $lte: endOfDay },
        time: body.time,
        status: { $ne: 'Cancelled' }
      });

      if (existingAppointment) {
        return NextResponse.json({ success: false, message: 'This time slot is already booked.' }, { status: 400 });
      }
    }

    const appointment = await Appointment.create(body);
    
    // In serverless environments (Vercel), we must await the email 
    // to ensure the function doesn't terminate before the email is sent.
    await sendAdminNotification(appointment).catch(console.error);
    
    return NextResponse.json({ success: true, data: appointment }, { status: 201 });
  } catch (error) {
    // Basic formatting for validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return NextResponse.json({ success: false, message: messages.join(', ') }, { status: 400 });
    }
    console.error('API Error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Server Error' }, { status: 500 });
  }
}
