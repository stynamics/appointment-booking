import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Appointment from '@/models/Appointment';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateQuery = searchParams.get('date');

    if (!dateQuery) {
      return NextResponse.json({ success: false, message: 'Date parameter is required' }, { status: 400 });
    }

    await connectToDatabase();

    // Convert requested date to start and end of that local day
    const targetDate = new Date(dateQuery);
    
    // Set to local midnight to start of day
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    // Set to local 11:59:59 PM for end of day
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const appointments = await Appointment.find({
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $ne: 'Cancelled' } // Cancelled appointments free up the slot
    }).select('time');

    const bookedSlots = appointments.map(apt => apt.time);

    return NextResponse.json({ success: true, data: bookedSlots }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
