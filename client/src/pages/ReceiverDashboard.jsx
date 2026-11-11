import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  Clock,
  CheckCircle,
  XCircle,
  Package,
  MessageCircle,
  MapPin,
  Calendar,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  KeyRound,
  Copy,
  RefreshCw,
  Info,
  ShieldAlert
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import api from '../services/api';
import { useWishlist } from '../context/WishlistContext';
import VerificationBadge from '../components/VerificationBadge';
import ChatDrawer from '../components/ChatDrawer';
import DonationCard from '../components/DonationCard';
import toast from 'react-hot-toast';

const ReceiverDashboard = () => {
  const [activeTab, setActiveTab] = useState('requests');
  const [requests, setRequests] = useState([]);
  const [verificationItems, setVerificationItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [regeneratingId, setRegeneratingId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const { wishlist, refreshWishlist } = useWishlist();

  // Chat Drawer state
  const [chatRequestId, setChatRequestId] = useState(null);
  const [chatRequest, setChatRequest] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Interval ref for live countdown
  const timerRef = useRef(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get('/requests/my-requests');
      if (res.data.success) {
        setRequests(res.data.requests || []);
      }
    } catch (err) {
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchVerificationItems = async () => {
    try {
      const res = await api.get('/requests/completion-verification');
      if (res.data.success) {
        setVerificationItems(res.data.items || []);
      }
    } catch (err) {
      console.error('Error fetching verification items:', err);
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchVerificationItems();
    refreshWishlist();
  }, []);

  // Live timer tick for countdown on both requests and verificationItems
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setRequests(prev =>
        prev.map(r => {
          if (!r.remainingSeconds || r.remainingSeconds <= 0 || r.otpVerified) {
            return { ...r, isExpired: !r.otpVerified && ['Accepted', 'Ready for Pickup', 'Handed Over'].includes(r.status) };
          }
          const nextSec = r.remainingSeconds - 1;
          return {
            ...r,
            remainingSeconds: nextSec,
            isExpired: nextSec <= 0
          };
        })
      );

      setVerificationItems(prev =>
        prev.map(item => {
          if (!item.remainingSeconds || item.remainingSeconds <= 0 || item.otpVerified) {
            return { ...item, isExpired: !item.otpVerified };
          }
          const nextSec = item.remainingSeconds - 1;
          return {
            ...item,
            remainingSeconds: nextSec,
            isExpired: nextSec <= 0
          };
        })
      );
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, []);

  const handleCancelRequest = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this donation request?')) return;
    try {
      const res = await api.put(`/requests/${id}/cancel`);
      if (res.data.success) {
        toast.success('Request cancelled successfully');
        fetchRequests();
        fetchVerificationItems();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel request');
    }
  };

  const handleRegenerateOTP = async (requestId) => {
    try {
      setRegeneratingId(requestId);
      const res = await api.post(`/requests/${requestId}/regenerate-otp`);
      if (res.data.success) {
        toast.success(res.data.message || 'New OTP generated successfully!');
        
        // Update requests state
        setRequests(prev =>
          prev.map(r =>
            r._id === requestId
              ? {
                  ...r,
                  otp: res.data.otp,
                  expiresAt: res.data.expiresAt,
                  remainingSeconds: res.data.remainingSeconds || 600,
                  isExpired: false
                }
              : r
          )
        );

        // Update verification items state
        setVerificationItems(prev =>
          prev.map(item =>
            item._id === requestId
              ? {
                  ...item,
                  otp: res.data.otp,
                  expiresAt: res.data.expiresAt,
                  remainingSeconds: res.data.remainingSeconds || 600,
                  isExpired: false
                }
              : item
          )
        );
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to regenerate OTP. Please wait 30 seconds.');
    } finally {
      setRegeneratingId(null);
    }
  };

  const handleCopyOTP = (otp, id) => {
    if (!otp) return;
    navigator.clipboard.writeText(otp);
    setCopiedId(id);
    toast.success('OTP copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleOpenChat = (request) => {
    setChatRequestId(request._id);
    setChatRequest(request);
    setIsChatOpen(true);
  };

  const formatTimer = (totalSeconds) => {
    if (!totalSeconds || totalSeconds <= 0) return '00:00';
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Metrics
  const totalRequests = requests.length;
  const pendingRequests = requests.filter(r => r.status === 'Pending').length;
  const acceptedRequests = requests.filter(r => ['Accepted', 'Ready for Pickup', 'Handed Over'].includes(r.status)).length;
  const completedRequests = requests.filter(r => r.status === 'Completed').length;
  const rejectedRequests = requests.filter(r => r.status === 'Rejected').length;

  const activeCoordinations = requests.filter(r => ['Accepted', 'Ready for Pickup', 'Handed Over'].includes(r.status));
  const completedHistory = requests.filter(r => r.status === 'Completed');

  const chartData = [
    { name: 'Pending', count: pendingRequests },
    { name: 'Accepted', count: acceptedRequests },
    { name: 'Completed', count: completedRequests },
    { name: 'Rejected', count: rejectedRequests }
  ];

  return (
    <div className="bg-cream-100 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-forest-100 text-forest-800 text-[11px] font-bold uppercase tracking-wider">
              <ShieldCheck size={13} />
              <span>Receiver Workspace</span>
            </div>
            <h1 className="text-3xl font-extrabold text-charcoal-900 mt-1">
              Receiver Dashboard
            </h1>
            <p className="text-xs text-charcoal-500 mt-0.5">
              Track your item requests, access handover verification OTPs, and coordinate with donors.
            </p>
          </div>

          <Link
            to="/donations"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-forest-700 hover:bg-forest-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
          >
            <span>Browse Donations</span>
            <ArrowRight size={15} />
          </Link>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-cream-300 shadow-xs">
            <span className="text-xs text-charcoal-500 block font-medium">Total Requests</span>
            <span className="text-2xl font-extrabold text-charcoal-900 mt-1 block">{totalRequests}</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-cream-300 shadow-xs">
            <span className="text-xs text-amberGold-600 block font-medium">Pending Approval</span>
            <span className="text-2xl font-extrabold text-amberGold-600 mt-1 block">{pendingRequests}</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-cream-300 shadow-xs">
            <span className="text-xs text-forest-700 block font-medium">Accepted / Ready</span>
            <span className="text-2xl font-extrabold text-forest-700 mt-1 block">{acceptedRequests}</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-cream-300 shadow-xs">
            <span className="text-xs text-emerald-700 block font-medium">Completed Receipts</span>
            <span className="text-2xl font-extrabold text-emerald-700 mt-1 block">{completedRequests}</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-cream-300 shadow-xs">
            <span className="text-xs text-rose-600 block font-medium">Saved Items</span>
            <span className="text-2xl font-extrabold text-rose-600 mt-1 block">{wishlist.length}</span>
          </div>
        </div>

        {/* Tabs Container */}
        <div className="bg-white rounded-2xl border border-cream-300 shadow-sm overflow-hidden">
          <div className="flex border-b border-cream-200 overflow-x-auto text-xs font-bold">
            <button
              onClick={() => setActiveTab('requests')}
              className={`px-5 py-3.5 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
                activeTab === 'requests'
                  ? 'border-forest-700 text-forest-700 bg-forest-50/50'
                  : 'border-transparent text-charcoal-600 hover:text-charcoal-900'
              }`}
            >
              <span>My Requests ({requests.length})</span>
              {activeCoordinations.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-amberGold-500 text-white font-extrabold">
                  {activeCoordinations.length} Active OTP
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('accepted')}
              className={`px-5 py-3.5 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
                activeTab === 'accepted'
                  ? 'border-forest-700 text-forest-700 bg-forest-50/50'
                  : 'border-transparent text-charcoal-600 hover:text-charcoal-900'
              }`}
            >
              <span>Donation Completion Verification ({activeCoordinations.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('saved')}
              className={`px-5 py-3.5 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
                activeTab === 'saved'
                  ? 'border-forest-700 text-forest-700 bg-forest-50/50'
                  : 'border-transparent text-charcoal-600 hover:text-charcoal-900'
              }`}
            >
              <span>Saved Donations ({wishlist.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('completed')}
              className={`px-5 py-3.5 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
                activeTab === 'completed'
                  ? 'border-forest-700 text-forest-700 bg-forest-50/50'
                  : 'border-transparent text-charcoal-600 hover:text-charcoal-900'
              }`}
            >
              <span>Completed Transfers ({completedHistory.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-5 py-3.5 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
                activeTab === 'analytics'
                  ? 'border-forest-700 text-forest-700 bg-forest-50/50'
                  : 'border-transparent text-charcoal-600 hover:text-charcoal-900'
              }`}
            >
              <span>Activity Chart</span>
            </button>
          </div>

          {/* TAB 1: ALL SUBMITTED REQUESTS (MY REQUESTS) WITH INLINE OTP VERIFICATION */}
          {activeTab === 'requests' && (
            <div className="p-6 space-y-6">
              
              {/* Highlight Banner if receiver has active handovers */}
              {activeCoordinations.length > 0 && (
                <div className="p-4 rounded-2xl bg-amberGold-50 border border-amberGold-200 flex items-start gap-3.5 text-xs">
                  <div className="p-2 rounded-xl bg-amberGold-100 text-amberGold-800 flex-shrink-0 mt-0.5">
                    <KeyRound size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-amberGold-900 text-sm">
                      {activeCoordinations.length} Active Handover Verification Code(s) Ready
                    </h4>
                    <p className="text-charcoal-700 mt-0.5">
                      Your donation request has been accepted. Your 6-digit verification code is displayed below on the corresponding request. 
                      Share this code with the donor <strong>only after</strong> you physically receive and inspect the item.
                    </p>
                  </div>
                </div>
              )}

              {loading ? (
                <div className="text-center py-16 text-xs text-charcoal-400 flex items-center justify-center gap-2">
                  <RefreshCw size={16} className="animate-spin text-forest-600" />
                  <span>Loading your donation requests...</span>
                </div>
              ) : requests.length === 0 ? (
                <div className="text-center py-16 text-charcoal-400 space-y-2 bg-cream-50 rounded-2xl border border-cream-200">
                  <Package size={32} className="mx-auto text-charcoal-300" />
                  <p className="font-semibold text-sm text-charcoal-700">You Haven't Requested Any Items Yet</p>
                  <p className="text-xs text-charcoal-500">
                    Find clothes, books, groceries, and devices you need and submit your request.
                  </p>
                  <Link to="/donations" className="inline-block mt-2 text-forest-700 font-bold underline text-xs">
                    Browse Available Donations
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {requests.map((req) => {
                    const isAccepted = ['Accepted', 'Ready for Pickup', 'Handed Over'].includes(req.status);
                    const isCompleted = req.status === 'Completed';

                    return (
                      <div
                        key={req._id}
                        className={`p-6 rounded-3xl border transition-all space-y-4 ${
                          isAccepted
                            ? 'bg-white border-forest-300 shadow-md ring-1 ring-forest-100'
                            : isCompleted
                            ? 'bg-emerald-50/40 border-emerald-200'
                            : 'bg-cream-50 border-cream-200'
                        }`}
                      >
                        {/* Request Card Header */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <img
                              src={req.donationId?.images?.[0] || 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb7?auto=format&fit=crop&w=150&q=80'}
                              alt=""
                              className="w-16 h-16 rounded-2xl object-cover border border-cream-300 flex-shrink-0"
                            />
                            <div className="space-y-1">
                              <Link
                                to={`/donations/${req.donationId?._id}`}
                                className="font-extrabold text-base text-charcoal-900 hover:text-forest-700 line-clamp-1"
                              >
                                {req.donationId?.title || 'Donation Item'}
                              </Link>
                              <p className="text-xs text-charcoal-500">
                                Donor: <strong className="text-charcoal-800">{req.donorId?.name}</strong> • Requested Qty: <strong>{req.requestedQuantity}</strong> • Value: <strong>{req.agreedPrice > 0 ? `₹${req.agreedPrice}` : 'FREE'}</strong>
                              </p>
                              <p className="text-[11px] text-charcoal-400 font-mono">
                                Request ID: #{req._id.toString().slice(-6).toUpperCase()} • Submitted: {new Date(req.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 justify-end">
                            <span className={`px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wide ${
                              isAccepted
                                ? 'bg-forest-100 text-forest-800'
                                : isCompleted
                                ? 'bg-emerald-100 text-emerald-800'
                                : req.status === 'Pending'
                                ? 'bg-amberGold-100 text-amberGold-800'
                                : 'bg-charcoal-200 text-charcoal-700'
                            }`}>
                              {req.status}
                            </span>

                            {/* Chat button if accepted */}
                            {isAccepted && (
                              <button
                                onClick={() => handleOpenChat(req)}
                                className="px-3 py-1.5 rounded-xl bg-forest-700 hover:bg-forest-800 text-white font-semibold text-xs flex items-center gap-1 shadow-xs"
                              >
                                <MessageCircle size={13} />
                                <span>Chat with Donor</span>
                              </button>
                            )}

                            {/* Cancel pending button */}
                            {req.status === 'Pending' && (
                              <button
                                onClick={() => handleCancelRequest(req._id)}
                                className="px-3 py-1.5 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 text-xs font-semibold"
                              >
                                Cancel Request
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Reason / Intended Use description */}
                        <div className="p-3 bg-cream-50/80 rounded-xl border border-cream-200 text-xs text-charcoal-600">
                          <p><strong>Your Reason:</strong> {req.reason}</p>
                          {req.donorNotes && (
                            <p className="mt-1 text-forest-800">
                              <strong>Donor Instructions:</strong> {req.donorNotes}
                            </p>
                          )}
                        </div>

                        {/* ========================================================================= */}
                        {/* DONATION COMPLETION VERIFICATION (OTP) DISPLAY FOR ACCEPTED REQUESTS      */}
                        {/* ========================================================================= */}
                        {isAccepted && (
                          <div className="p-5 rounded-2xl bg-forest-900 text-white shadow-lg space-y-4">
                            
                            {/* Verification Header */}
                            <div className="flex items-center justify-between border-b border-forest-800 pb-3">
                              <div className="flex items-center gap-2">
                                <KeyRound size={17} className="text-amberGold-400" />
                                <span className="font-extrabold text-xs uppercase tracking-wider text-amberGold-400">
                                  Donation Completion Verification
                                </span>
                              </div>

                              {/* Countdown badge */}
                              <div className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                                req.isExpired
                                  ? 'bg-rose-900/80 text-rose-300'
                                  : (req.remainingSeconds || 0) < 120
                                  ? 'bg-amberGold-900 text-amberGold-300 animate-pulse'
                                  : 'bg-forest-800 text-amberGold-300'
                              }`}>
                                <Clock size={12} />
                                <span>
                                  {req.isExpired
                                    ? 'Expired'
                                    : `Expires in: ${formatTimer(req.remainingSeconds)}`}
                                </span>
                              </div>
                            </div>

                            {/* Overview Fields */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px] text-forest-200">
                              <div>
                                <span className="text-forest-400 block text-[10px] uppercase">Item</span>
                                <strong className="text-white block line-clamp-1">{req.donationId?.title}</strong>
                              </div>
                              <div>
                                <span className="text-forest-400 block text-[10px] uppercase">Donor</span>
                                <strong className="text-white block">{req.donorId?.name}</strong>
                              </div>
                              <div>
                                <span className="text-forest-400 block text-[10px] uppercase">Request Status</span>
                                <strong className="text-amberGold-400 block">{req.status}</strong>
                              </div>
                              <div>
                                <span className="text-forest-400 block text-[10px] uppercase">Request ID</span>
                                <strong className="text-forest-100 font-mono block">#{req._id.toString().slice(-6).toUpperCase()}</strong>
                              </div>
                            </div>

                            {/* OTP Display Box */}
                            {req.otpVerified ? (
                              <div className="p-3.5 bg-emerald-900/60 border border-emerald-500 rounded-xl text-center text-xs text-emerald-200">
                                ✓ OTP Verified! Awaiting donor to finalize completion.
                              </div>
                            ) : req.isExpired ? (
                              <div className="p-3.5 bg-rose-950/60 border border-rose-500 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-rose-200">
                                <span>OTP has expired. Please regenerate a new 6-digit code.</span>
                                <button
                                  onClick={() => handleRegenerateOTP(req._id)}
                                  disabled={regeneratingId === req._id}
                                  className="px-4 py-1.5 bg-white text-rose-900 font-bold rounded-lg hover:bg-cream-100 shadow-xs flex items-center gap-1.5 justify-center"
                                >
                                  <RefreshCw size={13} className={regeneratingId === req._id ? 'animate-spin' : ''} />
                                  <span>Regenerate OTP</span>
                                </button>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <span className="text-[11px] text-forest-300 block font-semibold">Your Verification OTP:</span>
                                
                                <div className="flex flex-col sm:flex-row items-center gap-3">
                                  {/* Big Monospace OTP Digits */}
                                  <div className="tracking-[0.45em] font-mono text-3xl font-black bg-white text-forest-950 px-6 py-2.5 rounded-xl border border-cream-300 shadow-inner select-all">
                                    {req.otp || '••••••'}
                                  </div>

                                  <button
                                    onClick={() => handleCopyOTP(req.otp, req._id)}
                                    className="px-4 py-2.5 bg-amberGold-500 hover:bg-amberGold-600 text-charcoal-900 font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
                                  >
                                    <Copy size={14} />
                                    <span>{copiedId === req._id ? 'Copied!' : 'Copy OTP'}</span>
                                  </button>

                                  <button
                                    onClick={() => handleRegenerateOTP(req._id)}
                                    disabled={regeneratingId === req._id}
                                    className="px-3 py-2 text-forest-300 hover:text-white text-xs font-semibold flex items-center gap-1"
                                    title="Regenerate a fresh 10-minute code"
                                  >
                                    <RefreshCw size={12} className={regeneratingId === req._id ? 'animate-spin' : ''} />
                                    <span>Regenerate</span>
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Security Notice */}
                            <p className="text-[11px] text-forest-300 italic border-t border-forest-800/80 pt-2.5">
                              "Please share this OTP with the donor after receiving the item. The donor must enter this code to verify the handover."
                            </p>
                          </div>
                        )}

                        {/* Completed celebration banner */}
                        {isCompleted && (
                          <div className="p-3 bg-emerald-100 text-emerald-900 rounded-xl text-xs flex items-center gap-2">
                            <CheckCircle size={16} className="text-emerald-700 flex-shrink-0" />
                            <span>
                              Handover verified & completed on {new Date(req.completedAt || req.completedDate || req.updatedAt).toLocaleDateString()}. Thank you!
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ACCEPTED & COORDINATED (DIRECT SHORTCUT) */}
          {activeTab === 'accepted' && (
            <div className="p-6 space-y-6">
              {activeCoordinations.length === 0 ? (
                <div className="text-center py-16 text-xs text-charcoal-400 bg-cream-50 rounded-2xl border border-cream-200">
                  No accepted handovers requiring coordination right now.
                </div>
              ) : (
                activeCoordinations.map((req) => (
                  <div key={req._id} className="p-6 rounded-3xl bg-white border border-forest-300 shadow-md space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-cream-200">
                      <div className="flex items-start gap-3.5">
                        <img
                          src={req.donationId?.images?.[0] || 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb7?auto=format&fit=crop&w=150&q=80'}
                          alt=""
                          className="w-16 h-16 rounded-2xl object-cover border border-cream-300 flex-shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-extrabold text-base text-charcoal-900">{req.donationId?.title}</h4>
                            <span className="font-mono text-[10px] bg-cream-100 text-charcoal-600 px-2 py-0.5 rounded border border-cream-300 font-bold">
                              ID: #{req._id.toString().slice(-6).toUpperCase()}
                            </span>
                          </div>
                          <p className="text-xs text-charcoal-500 mt-1">
                            Donor: <strong className="text-charcoal-800">{req.donorId?.name}</strong> • Accepted:{' '}
                            <strong>{new Date(req.acceptedAt || req.updatedAt).toLocaleDateString()}</strong>
                          </p>
                          <p className="text-[11px] text-charcoal-400">
                            Requested Qty: {req.requestedQuantity} • Pickup: {req.preferredPickupMethod}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap justify-end">
                        <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wide bg-forest-100 text-forest-800">
                          {req.status}
                        </span>
                        <button
                          onClick={() => handleOpenChat(req)}
                          className="px-3.5 py-1.5 rounded-xl bg-forest-700 hover:bg-forest-800 text-white font-semibold text-xs flex items-center gap-1 shadow-xs"
                        >
                          <MessageCircle size={14} />
                          <span>Open Donor Chat</span>
                        </button>
                      </div>
                    </div>

                    {/* Verification Box inside Accepted Tab */}
                    <div className="p-5 rounded-2xl bg-forest-900 text-white space-y-3">
                      <div className="flex items-center justify-between border-b border-forest-800 pb-2">
                        <span className="font-bold text-xs uppercase tracking-wider text-amberGold-400 flex items-center gap-1.5">
                          <KeyRound size={15} />
                          <span>Donation Completion Verification</span>
                        </span>
                        <div className="text-xs text-amberGold-300 flex items-center gap-1 font-bold">
                          <Clock size={12} />
                          <span>{req.isExpired ? 'Expired' : `Expires in: ${formatTimer(req.remainingSeconds)}`}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-forest-200">
                        <div>
                          <span className="text-forest-400 block text-[10px] uppercase">Item</span>
                          <span className="font-semibold text-white truncate block">{req.donationId?.title}</span>
                        </div>
                        <div>
                          <span className="text-forest-400 block text-[10px] uppercase">Donor</span>
                          <span className="font-semibold text-white block">{req.donorId?.name}</span>
                        </div>
                        <div>
                          <span className="text-forest-400 block text-[10px] uppercase">Current Status</span>
                          <span className="font-semibold text-amberGold-400 block">{req.status}</span>
                        </div>
                        <div>
                          <span className="text-forest-400 block text-[10px] uppercase">Verification Status</span>
                          <span className="font-semibold text-emerald-300 block">
                            {req.otpVerified ? 'Verified' : 'Awaiting Handover'}
                          </span>
                        </div>
                      </div>

                      {req.otpVerified ? (
                        <div className="p-3 bg-emerald-900/60 border border-emerald-500 rounded-xl text-center text-xs text-emerald-200 font-medium">
                          ✓ OTP has been verified by the donor! Finalizing handover completion...
                        </div>
                      ) : req.isExpired ? (
                        <div className="flex items-center justify-between text-xs text-rose-300 p-2.5 bg-rose-950/60 border border-rose-500 rounded-xl">
                          <span>Code expired. Please regenerate a new OTP.</span>
                          <button
                            onClick={() => handleRegenerateOTP(req._id)}
                            className="px-3 py-1 bg-white text-rose-900 font-bold rounded-lg shadow-xs"
                          >
                            Regenerate OTP
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2 pt-1">
                          <span className="text-[11px] text-forest-300 block font-semibold">Your Verification OTP:</span>
                          <div className="flex flex-col sm:flex-row items-center gap-3">
                            <div className="tracking-[0.45em] font-mono text-3xl font-black bg-white text-forest-950 px-6 py-2 rounded-xl select-all">
                              {req.otp || '••••••'}
                            </div>
                            <button
                              onClick={() => handleCopyOTP(req.otp, req._id)}
                              className="px-4 py-2 bg-amberGold-500 hover:bg-amberGold-600 text-charcoal-900 font-bold text-xs rounded-xl flex items-center gap-1 shadow-xs"
                            >
                              <Copy size={13} />
                              <span>{copiedId === req._id ? 'Copied!' : 'Copy OTP'}</span>
                            </button>
                            <button
                              onClick={() => handleRegenerateOTP(req._id)}
                              disabled={regeneratingId === req._id}
                              className="px-3 py-2 text-forest-300 hover:text-white text-xs font-semibold flex items-center gap-1"
                              title="Regenerate a fresh 10-minute code"
                            >
                              <RefreshCw size={12} className={regeneratingId === req._id ? 'animate-spin' : ''} />
                              <span>Regenerate</span>
                            </button>
                          </div>
                        </div>
                      )}

                      <p className="text-[11px] text-forest-300 italic pt-1">
                        "Please share this OTP with the donor after receiving the item. The donor must enter this code to verify the handover."
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: SAVED DONATIONS (Wishlist) */}
          {activeTab === 'saved' && (
            <div className="p-6">
              {wishlist.length === 0 ? (
                <div className="text-center py-12 text-xs text-charcoal-400">
                  You haven't saved any donations to your wishlist yet.{' '}
                  <Link to="/donations" className="text-forest-700 font-bold underline">
                    Browse and tap the heart icon.
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {wishlist.map((donation) => (
                    <DonationCard key={donation._id} donation={donation} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: COMPLETED TRANSFERS */}
          {activeTab === 'completed' && (
            <div className="p-6 space-y-3">
              {completedHistory.length === 0 ? (
                <div className="text-center py-12 text-xs text-charcoal-400">
                  No completed donations yet.
                </div>
              ) : (
                completedHistory.map((req) => (
                  <div key={req._id} className="p-4 rounded-2xl bg-cream-50 border border-cream-200 flex items-center justify-between text-xs">
                    <div>
                      <h4 className="font-bold text-charcoal-900">{req.donationId?.title}</h4>
                      <p className="text-charcoal-500">
                        Received from <strong>{req.donorId?.name}</strong> • Completed on {new Date(req.completedAt || req.completedDate || req.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold uppercase text-[10px]">
                      Completed
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 5: ACTIVITY CHART */}
          {activeTab === 'analytics' && (
            <div className="p-6 space-y-4">
              <h3 className="font-bold text-sm text-charcoal-900">Your Request History Breakdown</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ece7db" />
                    <XAxis dataKey="name" stroke="#585c58" fontSize={12} />
                    <YAxis stroke="#585c58" fontSize={12} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#4e826e" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Chat Drawer */}
      <ChatDrawer
        requestId={chatRequestId}
        request={chatRequest}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />

    </div>
  );
};

export default ReceiverDashboard;
