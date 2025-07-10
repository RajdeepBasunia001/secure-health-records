import React, { useEffect, useState } from 'react';
import { getBackendActor } from '../../dfinity';
import { Principal } from '@dfinity/principal';
import './Notifications.css';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      setError('');
      try {
        const actor = await getBackendActor();
        const notes = await actor.get_notifications();
        setNotifications(notes);
      } catch (err) {
        console.error('Backend fetch error:', err);
        setError('Failed to fetch notifications.');
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      const actor = await getBackendActor();
      await actor.mark_notification_read(id);
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (err) {
      setError('Failed to mark notification as read.');
    }
  };

  if (loading) return <div>Loading notifications...</div>;
  if (error) return <div className="upload-error">{error}</div>;

  return (
    <div className="notifications modern-notifications">
      <h2>Notifications</h2>
      {notifications.length === 0 ? (
        <div className="no-notifications">No notifications.</div>
      ) : (
        <ul className="notification-list">
          {notifications.map(note => (
            <li key={note.id} className="notification-item modern-card animate-in">
              <div className="notification-content">
                <span className="notification-icon">🔔</span>
                <div className="notification-message">{note.message}</div>
              </div>
              <div className="notification-meta">
                <span className="notification-date">{new Date(note.timestamp * 1000).toLocaleString()}</span>
                <button className="modern-btn" onClick={() => markAsRead(note.id)}>Mark as read</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notifications; 