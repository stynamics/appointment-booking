import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Appointment from '@/models/Appointment';

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
    
    const appointment = await Appointment.create(body);
    
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
