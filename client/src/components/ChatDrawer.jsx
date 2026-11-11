import React, { useState, useEffect, useRef } from 'react';
import { X, Send, MessageCircle, User } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import toast from 'react-hot-toast';

const ChatDrawer = ({ requestId, request, isOpen, onClose }) => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const fetchMessages = async () => {
    if (!requestId) return;
    try {
      setLoading(true);
      const res = await api.get(`/messages/request/${requestId}`);
      if (res.data.success) {
        setMessages(res.data.messages || []);
      }
    } catch (err) {
      console.error('Error fetching chat messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && requestId) {
      fetchMessages();

      if (socket) {
        socket.emit('join_chat_room', requestId);

        const handleReceiveMessage = (msg) => {
          if (msg.requestId === requestId) {
            setMessages((prev) => [...prev, msg]);
          }
        };

        socket.on('receive_message', handleReceiveMessage);

        return () => {
          socket.emit('leave_chat_room', requestId);
          socket.off('receive_message', handleReceiveMessage);
        };
      }
    }
  }, [isOpen, requestId, socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const text = newMessage.trim();
      setNewMessage('');
      const res = await api.post('/messages', {
        requestId,
        message: text
      });

      if (res.data.success) {
        // Optimistically add if not already received via socket
        setMessages((prev) => {
          if (prev.some(m => m._id === res.data.message._id)) return prev;
          return [...prev, res.data.message];
        });
      }
    } catch (err) {
      toast.error('Failed to send message. Please try again.');
    }
  };

  if (!isOpen) return null;

  const otherPerson = request?.donorId?._id === user?._id || request?.donorId === user?._id
    ? request?.receiverId
    : request?.donorId;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-white shadow-2xl border-l border-cream-300 flex flex-col animate-slideLeft">
      
      {/* Chat Header */}
      <div className="p-4 bg-forest-700 text-white flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          {otherPerson?.profileImage ? (
            <img
              src={otherPerson.profileImage}
              alt={otherPerson.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-forest-500"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-forest-800 text-cream-200 flex items-center justify-center font-bold text-sm">
              {otherPerson?.name?.charAt(0) || 'U'}
            </div>
          )}
          <div>
            <h3 className="font-bold text-sm leading-tight">
              {otherPerson?.name || 'Coordination Chat'}
            </h3>
            <p className="text-[11px] text-cream-200 opacity-90 truncate max-w-[180px]">
              {request?.donationId?.title || 'Handover coordination'}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-cream-200 hover:text-white hover:bg-forest-800 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Safety Notice Banner */}
      <div className="px-4 py-2 bg-cream-100 border-b border-cream-300 text-[11px] text-charcoal-600">
        Coordinate pickup timing and location safely. Do not share banking passwords.
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-cream-50/50">
        {loading && messages.length === 0 ? (
          <div className="text-center py-8 text-xs text-charcoal-400">
            Loading discussion...
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12 px-4 text-xs text-charcoal-500">
            <MessageCircle size={32} className="mx-auto mb-2 text-forest-300" />
            <p className="font-semibold text-charcoal-700">No messages yet</p>
            <p className="mt-1">Say hello to coordinate pickup details and timing.</p>
          </div>
        ) : (
          messages.map((m) => {
            const isMe = m.senderId?._id === user?._id || m.senderId === user?._id;
            return (
              <div
                key={m._id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs shadow-sm ${
                    isMe
                      ? 'bg-forest-700 text-white rounded-br-none'
                      : 'bg-white border border-cream-300 text-charcoal-800 rounded-bl-none'
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-wrap">{m.message}</p>
                </div>
                <span className="text-[9px] text-charcoal-400 mt-1 px-1">
                  {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Footer */}
      <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-cream-300 flex items-center gap-2">
        <input
          type="text"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 px-3 py-2 border border-cream-300 rounded-full text-xs focus:outline-none focus:ring-2 focus:ring-forest-600 bg-cream-50"
        />
        <button
          type="submit"
          disabled={!newMessage.trim()}
          className={`p-2 rounded-full text-white bg-forest-700 hover:bg-forest-800 transition-colors flex-shrink-0 ${
            !newMessage.trim() ? 'opacity-40 cursor-not-allowed' : ''
          }`}
        >
          <Send size={15} />
        </button>
      </form>

    </div>
  );
};

export default ChatDrawer;
