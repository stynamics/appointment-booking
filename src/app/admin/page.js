"use client";

import { useState, useEffect } from 'react';
import styles from './page.module.css';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  // MVP level passcode protection
  const handleLogin = (e) => {
    e.preventDefault();
    if (passcode === 'admin123') {
      setIsAuthenticated(true);
      fetchAppointments();
    } else {
      setError('Invalid passcode');
      setPasscode('');
    }
  };

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/appointments');
      const data = await res.json();
      if (data.success) {
        setAppointments(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch appointments", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className={styles.container}>
        <div className={styles.authCard}>
          <h2>Admin Access</h2>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              className={styles.input}
              placeholder="Enter passcode"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              autoFocus
            />
            <button type="submit" className={styles.submitBtn}>Unlock Dashboard</button>
            {error && <p className={styles.errorText}>{error}</p>}
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Appointments</h1>
        <button onClick={() => setIsAuthenticated(false)} className={styles.logoutBtn}>
          Lock Output
        </button>
      </header>

      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading appointments...</p>
      ) : (
        <div className={styles.grid}>
          {appointments.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No appointments found.</p>
            </div>
          ) : (
            appointments.map((apt) => (
              <div key={apt._id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <div>
                    <h3 className={styles.clientName}>{apt.name}</h3>
                    <p className={styles.clientEmail}>{apt.email}</p>
                  </div>
                  <span className={`${styles.statusBadge} ${styles[`status${apt.status}`]}`}>
                    {apt.status}
                  </span>
                </div>
                
                <div className={styles.cardBody}>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Service:</span>
                    <span>{apt.service}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Date:</span>
                    <span>{new Date(apt.date).toLocaleDateString()}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Time:</span>
                    <span>{apt.time}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Booked:</span>
                    <span style={{color: 'var(--text-muted)'}}>
                      {new Date(apt.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
