"use client";

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import { formatTime12Hour } from '@/lib/utils';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterTab, setFilterTab] = useState('All');

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

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchAppointments();
      }
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this appointment?')) return;
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchAppointments();
      }
    } catch (err) {
      console.error("Failed to delete appointment", err);
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
          Lock Console
        </button>
      </header>

      {isAuthenticated && (
        <div className={styles.tabsContainer}>
          {['All', 'Pending', 'Confirmed', 'Cancelled'].map(tab => (
            <button 
              key={tab} 
              onClick={() => setFilterTab(tab)}
              className={`${styles.tabBtn} ${filterTab === tab ? styles.tabActive : ''}`}
            >
              {tab}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading appointments...</p>
      ) : (
        <div className={styles.grid}>
          {appointments.filter(apt => filterTab === 'All' || apt.status === filterTab).length === 0 ? (
            <div className={styles.emptyState}>
              <p>No {filterTab !== 'All' ? filterTab.toLowerCase() : ''} appointments found.</p>
            </div>
          ) : (
            appointments.filter(apt => filterTab === 'All' || apt.status === filterTab).map((apt) => (
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
                    <span>{formatTime12Hour(apt.time)}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Booked:</span>
                    <span style={{color: 'var(--text-muted)'}}>
                      {new Date(apt.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
                
                <div className={styles.actionButtons}>
                  {apt.status !== 'Confirmed' && (
                    <button 
                      onClick={() => handleUpdateStatus(apt._id, 'Confirmed')} 
                      className={`${styles.actionBtn} ${styles.confirmBtn}`}
                    >
                      Confirm
                    </button>
                  )}
                  {apt.status !== 'Cancelled' && (
                    <button 
                      onClick={() => handleUpdateStatus(apt._id, 'Cancelled')} 
                      className={`${styles.actionBtn} ${styles.cancelBtn}`}
                    >
                      Cancel
                    </button>
                  )}
                  <button 
                    onClick={() => handleDelete(apt._id)} 
                    className={`${styles.actionBtn} ${styles.deleteBtn}`}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
