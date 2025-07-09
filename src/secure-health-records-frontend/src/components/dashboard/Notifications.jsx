import React, { useEffect, useState } from 'react';
import { getBackendActor } from '../../dfinity';
import { Principal } from '@dfinity/principal';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      setError('');
      try {
        const notes = await getBackendActor().get_notifications();
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
      await getBackendActor().mark_notification_read(id);
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (err) {
      setError('Failed to mark notification as read.');
    }
  };

  if (loading) return <div>Loading notifications...</div>;
  if (error) return <div className="upload-error">{error}</div>;

  return (
    <div className="notifications">
      <h2>Notifications</h2>
      {notifications.length === 0 ? (
        <div>No notifications.</div>
      ) : (
        <ul>
          {notifications.map(note => (
            <li key={note.id} className="notification-item">
              <div>{note.message}</div>
              <div className="notification-meta">
                <span>{new Date(note.timestamp * 1000).toLocaleString()}</span>
                <button onClick={() => markAsRead(note.id)}>Mark as read</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notifications; 