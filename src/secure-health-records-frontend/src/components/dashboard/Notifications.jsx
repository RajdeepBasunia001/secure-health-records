import React, { useEffect, useState } from 'react';
import { getBackendActor } from '../../dfinity';
import { Bell, CheckCircle, Info } from 'lucide-react';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const actor = await getBackendActor();
      const result = await actor.get_notifications();
      // Sort by recent
      setNotifications(result.sort((a, b) => Number(b.created_at) - Number(a.created_at)));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id) => {
    try {
      const actor = await getBackendActor();
      await actor.mark_notification_read(BigInt(id));
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading && notifications.length === 0) {
    return <div className="p-8 text-center text-gray-400">Loading notifications...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Bell className="text-indigo-600" /> Notifications
        </h2>
        <button onClick={fetchNotifications} className="text-sm text-indigo-600 font-medium hover:underline">
          Refresh
        </button>
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="bg-white p-8 rounded-xl text-center text-gray-500 border border-gray-100">
            <Bell className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            No notifications yet.
          </div>
        ) : (
          notifications.map(notif => (
            <div
              key={Number(notif.id)}
              className={`p-4 rounded-xl border flex gap-4 transition-all ${notif.read ? 'bg-gray-50 border-gray-100 text-gray-600' : 'bg-white border-indigo-100 shadow-sm'
                }`}
            >
              <div className={`mt-1 h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${notif.read ? 'bg-gray-200 text-gray-500' : 'bg-indigo-100 text-indigo-600'
                }`}>
                <Info size={18} />
              </div>
              <div className="flex-1">
                <p className={`text-sm ${notif.read ? 'text-gray-600' : 'text-gray-900 font-semibold'}`}>
                  {notif.message}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(Number(notif.created_at) / 1000000).toLocaleString()}
                </p>
              </div>
              {!notif.read && (
                <button
                  onClick={() => markRead(notif.id)}
                  className="text-indigo-600 hover:text-indigo-800 text-xs font-bold self-start mt-1"
                >
                  Mark as read
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;