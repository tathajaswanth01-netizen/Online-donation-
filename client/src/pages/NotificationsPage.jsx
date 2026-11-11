import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, Clock, CheckCircle2, MessageCircle, AlertCircle } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = filter === 'unread'
    ? notifications.filter(n => !n.isRead)
    : notifications;

  return (
    <div className="bg-cream-100 min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-forest-700">Account Alerts</span>
            <h1 className="text-3xl font-extrabold text-charcoal-900 mt-0.5">
              Notifications
            </h1>
            <p className="text-xs text-charcoal-500 mt-1">
              Live updates about incoming requests, donor decisions, verification approvals, and messages.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                filter === 'all'
                  ? 'bg-forest-700 text-white border-forest-700'
                  : 'bg-white text-charcoal-700 border-cream-300'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                filter === 'unread'
                  ? 'bg-forest-700 text-white border-forest-700'
                  : 'bg-white text-charcoal-700 border-cream-300'
              }`}
            >
              Unread
            </button>
            <button
              onClick={handleMarkAllRead}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-cream-300 text-forest-700 hover:bg-cream-50 flex items-center gap-1.5"
            >
              <CheckCheck size={14} />
              <span>Mark all read</span>
            </button>
          </div>
        </div>

        {/* List */}
        <div className="bg-white rounded-3xl p-6 border border-cream-300 shadow-sm divide-y divide-cream-100">
          {loading ? (
            <div className="py-12 text-center text-xs text-charcoal-400">Loading notifications...</div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-xs text-charcoal-400">
              No notifications matching your filter.
            </div>
          ) : (
            filtered.map((n) => (
              <div
                key={n._id}
                onClick={() => !n.isRead && handleMarkAsRead(n._id)}
                className={`py-4 px-3 rounded-xl flex items-start justify-between gap-4 transition-colors cursor-pointer ${
                  !n.isRead ? 'bg-forest-50/50 hover:bg-forest-50' : 'hover:bg-cream-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    !n.isRead ? 'bg-forest-700 text-white' : 'bg-cream-200 text-charcoal-600'
                  }`}>
                    <Bell size={16} />
                  </div>
                  <div>
                    <h4 className={`text-sm ${!n.isRead ? 'font-bold text-forest-900' : 'font-semibold text-charcoal-800'}`}>
                      {n.title}
                    </h4>
                    <p className="text-xs text-charcoal-600 mt-0.5 leading-relaxed">
                      {n.message}
                    </p>
                    <span className="text-[10px] text-charcoal-400 mt-1 block">
                      {new Date(n.createdAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>

                {!n.isRead && (
                  <span className="w-2.5 h-2.5 rounded-full bg-amberGold-400 flex-shrink-0 mt-2" />
                )}
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};

export default NotificationsPage;
