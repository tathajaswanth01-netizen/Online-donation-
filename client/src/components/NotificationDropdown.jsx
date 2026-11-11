import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck, ExternalLink } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const NotificationDropdown = () => {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // Poll every 15s
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-charcoal-600 hover:text-forest-700 hover:bg-cream-200 rounded-full transition-colors"
        aria-label="View notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-amberGold-400 rounded-full ring-2 ring-white animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-cream-300 py-2 z-50 animate-fadeIn">
          <div className="flex items-center justify-between px-4 py-2 border-b border-cream-200">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-charcoal-800 text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-[11px] bg-forest-100 text-forest-700 px-1.5 py-0.5 rounded-full font-medium">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-forest-700 hover:text-forest-800 font-medium flex items-center gap-1"
              >
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-cream-100">
            {notifications.length === 0 ? (
              <div className="px-4 py-6 text-center text-charcoal-400 text-sm">
                No notifications yet.
              </div>
            ) : (
              notifications.slice(0, 6).map((n) => (
                <div
                  key={n._id}
                  onClick={() => handleMarkAsRead(n._id, { stopPropagation: () => {} })}
                  className={`p-3 text-left hover:bg-cream-50 transition-colors cursor-pointer ${
                    !n.isRead ? 'bg-forest-50/40' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-xs ${!n.isRead ? 'font-semibold text-forest-900' : 'font-medium text-charcoal-800'}`}>
                      {n.title}
                    </p>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-amberGold-400 flex-shrink-0 mt-1" />
                    )}
                  </div>
                  <p className="text-xs text-charcoal-600 mt-1 line-clamp-2">
                    {n.message}
                  </p>
                  <span className="text-[10px] text-charcoal-400 mt-1.5 block">
                    {new Date(n.createdAt).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-cream-200 px-4 py-2 text-center bg-cream-50/50">
            <Link
              to="/notifications"
              onClick={() => setIsOpen(false)}
              className="text-xs font-medium text-forest-700 hover:text-forest-800 inline-flex items-center gap-1"
            >
              View all notifications <ExternalLink size={12} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
