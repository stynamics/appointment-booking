"use client";

import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import styles from './page.module.css';
import { formatTime12Hour } from '@/lib/utils';

const BUSINESS_HOURS = [
  '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
];

export default function Home() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    service: '',
    date: '',
    time: ''
  });
  const [status, setStatus] = useState({ loading: false, error: null, success: false });
  const [unavailableSlots, setUnavailableSlots] = useState([]);

  useEffect(() => {
    // Clear previously selected time when date changes
    if (formData.date) {
      const fetchAvailability = async () => {
        try {
          const res = await fetch(`/api/availability?date=${formData.date.toISOString()}`);
          if (res.ok) {
            const data = await res.json();
            setUnavailableSlots(data.data || []);
          }
        } catch (error) {
          console.error("Failed to fetch availability", error);
        }
      };
      
      fetchAvailability();
    }
  }, [formData.date]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDateChange = (date) => {
    setFormData({ ...formData, date });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent past bookings
    if (formData.date && formData.time) {
      const now = new Date();
      const selectedDateTime = new Date(formData.date);
      const [hours, minutes] = formData.time.split(':');
      selectedDateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

      if (selectedDateTime < now) {
        setStatus({ loading: false, error: "You cannot book an appointment in the past. Please select a valid future time.", success: false });
        return;
      }
    }

    setStatus({ loading: true, error: null, success: false });

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      setStatus({ loading: false, error: null, success: true });
      setFormData({ name: '', email: '', service: '', date: '', time: '' });
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setStatus(prev => ({ ...prev, success: false }));
      }, 5000);

    } catch (error) {
      setStatus({ loading: false, error: error.message, success: false });
    }
  };

  return (
    <main className={styles.container}>
      <div className={styles.hero}>
        <h1 className={styles.title}>Book Your Session</h1>
        <p className={styles.subtitle}>
          Experience world-class service. Select your preferred date and time below to secure your appointment.
        </p>
      </div>

      <div className={styles.formCard}>
        {status.error && <div className={`${styles.alert} ${styles.alertError}`}>{status.error}</div>}
        {status.success && <div className={`${styles.alert} ${styles.alertSuccess}`}>Your appointment has been successfully booked!</div>}

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="name">Full Name</label>
            <input 
              type="text" 
              id="name" 
              name="name" 
              className={styles.input} 
              value={formData.name} 
              onChange={handleChange}
              placeholder="John Doe"
              required 
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="email">Email Address</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              className={styles.input} 
              value={formData.email} 
              onChange={handleChange}
              placeholder="john@example.com"
              required 
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="service">Service Type</label>
            <select 
              id="service" 
              name="service" 
              className={styles.select} 
              value={formData.service} 
              onChange={handleChange}
              required
            >
              <option value="" disabled>Select a service</option>
              <option value="Consultation">Initial Consultation</option>
              <option value="Therapy">Therapy Session</option>
              <option value="Coaching">Career Coaching</option>
              <option value="Follow-up">Follow-up</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Select Date</label>
            <div className={styles.calendarWrapper}>
              <Calendar 
                onChange={handleDateChange} 
                value={formData.date || null}
                minDate={new Date()}
                maxDate={new Date(new Date().setMonth(new Date().getMonth() + 2))}
                className={styles.customCalendar}
                next2Label={null}
                prev2Label={null}
              />
            </div>
            {/* Hidden required input to ensure form validation triggers if date isn't picked */}
            <input type="date" value={formData.date ? formData.date.toISOString().split('T')[0] : ''} style={{display: 'none'}} name="date" required onChange={()=>{}}/>
          </div>

          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Select Time</label>
              {formData.date ? (
                <div className={styles.timeGrid}>
                  {BUSINESS_HOURS.map(time => {
                    const isUnavailable = unavailableSlots.includes(time);
                    
                    const now = new Date();
                    const targetDate = new Date(formData.date);
                    const [hours, minutes] = time.split(':');
                    targetDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
                    const isPast = targetDate < now;
                    
                    const disabled = isUnavailable || isPast;

                    return (
                      <button
                        key={time}
                        type="button"
                        disabled={disabled}
                        onClick={() => setFormData({ ...formData, time })}
                        className={`${styles.timeSlotBtn} ${formData.time === time ? styles.timeSlotActive : ''}`}
                      >
                        {formatTime12Hour(time)}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p style={{color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem'}}>Please select a date first to see available times.</p>
              )}
              {/* Hidden required input to ensure form validation triggers if time isn't picked */}
              <input type="time" value={formData.time} style={{display: 'none'}} name="time" required onChange={()=>{}}/>
            </div>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={status.loading}>
            {status.loading ? 'Processing...' : 'Confirm Booking'}
          </button>
        </form>
      </div>
    </main>
  );
}
