"use client";

import { useState } from 'react';
import styles from './page.module.css';

export default function Home() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    service: '',
    date: '',
    time: ''
  });
  const [status, setStatus] = useState({ loading: false, error: null, success: false });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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

          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="date">Date</label>
              <input 
                type="date" 
                id="date" 
                name="date" 
                className={styles.input} 
                value={formData.date} 
                onChange={handleChange}
                required 
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="time">Time</label>
              <input 
                type="time" 
                id="time" 
                name="time" 
                className={styles.input} 
                value={formData.time} 
                onChange={handleChange}
                required 
              />
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
