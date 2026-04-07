import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Appointment from '@/models/Appointment';
import { sendClientConfirmation, sendClientCancellation } from '@/lib/email';

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const { status } = await request.json();
    
    await connectToDatabase();
    
    const validStatuses = ['Pending', 'Confirmed', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ success: false, message: 'Invalid status' }, { status: 400 });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!appointment) {
      return NextResponse.json({ success: false, message: 'Appointment not found' }, { status: 404 });
    }

    // Send email to client based on the updated status
    if (status === 'Confirmed') {
      await sendClientConfirmation(appointment).catch(console.error);
    } else if (status === 'Cancelled') {
      await sendClientCancellation(appointment).catch(console.error);
    }

    return NextResponse.json({ success: true, data: appointment }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await connectToDatabase();

    const deletedAppointment = await Appointment.findByIdAndDelete(id);

    if (!deletedAppointment) {
      return NextResponse.json({ success: false, message: 'Appointment not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Appointment deleted successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
