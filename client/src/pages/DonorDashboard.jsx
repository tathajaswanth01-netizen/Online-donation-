import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  MessageCircle,
  ToggleLeft,
  ToggleRight,
  PlusCircle,
  Layers,
  MapPin,
  Calendar,
  AlertCircle,
  KeyRound,
  ShieldAlert,
  ShieldCheck,
  X
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import api from '../services/api';
import VerificationBadge from '../components/VerificationBadge';
import ChatDrawer from '../components/ChatDrawer';
import toast from 'react-hot-toast';

const DonorDashboard = () => {
  const [activeTab, setActiveTab] = useState('listings');
  const [donations, setDonations] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Chat Drawer state
  const [chatRequestId, setChatRequestId] = useState(null);
  const [chatRequest, setChatRequest] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Per-request OTP input & verification states for accepted requests
  const [otpInputs, setOtpInputs] = useState({});
  const [otpErrors, setOtpErrors] = useState({});
  const [isVerifying, setIsVerifying] = useState({});
  const [isCompleting, setIsCompleting] = useState({});

  // Completion Verification Modal State (Two-step flow)
  const [verifyModal, setVerifyModal] = useState({
    isOpen: false,
    request: null,
    otp: '',
    verified: false,
    loading: false,
    completing: false,
    error: ''
  });

  const handleInlineVerifyOTP = async (requestId) => {
    const code = (otpInputs[requestId] || '').trim();
    if (!code || code.length !== 6) {
      setOtpErrors(prev => ({ ...prev, [requestId]: 'Please enter a complete 6-digit OTP code.' }));
      return;
    }

    try {
      setIsVerifying(prev => ({ ...prev, [requestId]: true }));
      setOtpErrors(prev => ({ ...prev, [requestId]: '' }));

      const res = await api.post(`/requests/${requestId}/verify-otp`, { otp: code });
      if (res.data.success) {
        toast.success('OTP verified successfully! You can now finalize completion.');
        setRequests(prev => prev.map(r => r._id === requestId ? { ...r, otpVerified: true } : r));
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid OTP. Please check the code shared by the receiver.';
      setOtpErrors(prev => ({ ...prev, [requestId]: msg }));
      toast.error(msg);
    } finally {
      setIsVerifying(prev => ({ ...prev, [requestId]: false }));
    }
  };

  const handleInlineComplete = async (requestId) => {
    try {
      setIsCompleting(prev => ({ ...prev, [requestId]: true }));
      const res = await api.post(`/requests/${requestId}/complete`);
      if (res.data.success) {
        toast.success('Donation completed successfully!');
        await fetchData();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to complete donation.';
      toast.error(msg);
    } finally {
      setIsCompleting(prev => ({ ...prev, [requestId]: false }));
    }
  };

  const handleModalVerifyOTP = async (e) => {
    e.preventDefault();
    if (!verifyModal.otp || verifyModal.otp.trim().length !== 6) {
      setVerifyModal(prev => ({ ...prev, error: 'Please enter the complete 6-digit OTP code.' }));
      return;
    }

    try {
      setVerifyModal(prev => ({ ...prev, loading: true, error: '' }));
      const res = await api.post(`/requests/${verifyModal.request._id}/verify-otp`, {
        otp: verifyModal.otp.trim()
      });

      if (res.data.success) {
        toast.success('OTP verified successfully! You can now finalize completion.');
        setVerifyModal(prev => ({
          ...prev,
          loading: false,
          verified: true,
          error: ''
        }));
        setRequests(prev => prev.map(r => r._id === verifyModal.request._id ? { ...r, otpVerified: true } : r));
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid OTP. Please check with receiver and try again.';
      setVerifyModal(prev => ({
        ...prev,
        loading: false,
        error: msg
      }));
    }
  };

  const handleModalComplete = async () => {
    try {
      setVerifyModal(prev => ({ ...prev, completing: true, error: '' }));
      const res = await api.post(`/requests/${verifyModal.request._id}/complete`);
      if (res.data.success) {
        toast.success('Donation completed successfully!');
        setVerifyModal({
          isOpen: false,
          request: null,
          otp: '',
          verified: false,
          loading: false,
          completing: false,
          error: ''
        });
        await fetchData();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to complete donation.';
      setVerifyModal(prev => ({ ...prev, completing: false, error: msg }));
      toast.error(msg);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [donRes, reqRes] = await Promise.all([
        api.get('/donations/my-donations'),
        api.get('/requests/incoming')
      ]);

      if (donRes.data.success) {
        setDonations(donRes.data.donations || []);
      }
      if (reqRes.data.success) {
        setRequests(reqRes.data.requests || []);
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleAvailability = async (id) => {
    try {
      const res = await api.patch(`/donations/${id}/availability`);
      if (res.data.success) {
        toast.success(res.data.message);
        setDonations(prev =>
          prev.map(d => (d._id === id ? { ...d, status: res.data.donation.status } : d))
        );
      }
    } catch (err) {
      toast.error('Could not change availability.');
    }
  };

  const handleDeleteDonation = async (id) => {
    if (!window.confirm('Are you sure you want to delete this donation listing?')) return;
    try {
      const res = await api.delete(`/donations/${id}`);
      if (res.data.success) {
        toast.success('Listing deleted.');
        setDonations(prev => prev.filter(d => d._id !== id));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed.');
    }
  };

  const handleUpdateRequestStatus = async (requestId, newStatus, rejectionReason = '') => {
    try {
      const res = await api.put(`/requests/${requestId}/status`, {
        status: newStatus,
        rejectionReason
      });
      if (res.data.success) {
        toast.success(`Request marked as ${newStatus}`);
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update request status.');
    }
  };

  const handleOpenChat = (request) => {
    setChatRequestId(request._id);
    setChatRequest(request);
    setIsChatOpen(true);
  };

  // Metrics
  const totalDonations = donations.length;
  const activeDonations = donations.filter(d => d.status === 'Available').length;
  const pendingRequests = requests.filter(r => r.status === 'Pending').length;
  const acceptedRequests = requests.filter(r => ['Accepted', 'Ready for Pickup', 'Handed Over'].includes(r.status)).length;
  const completedDonations = donations.filter(d => d.status === 'Completed').length;
  const rejectedRequests = requests.filter(r => r.status === 'Rejected').length;

  // Chart data: donations by status
  const chartData = [
    { name: 'Available', count: activeDonations },
    { name: 'Reserved', count: donations.filter(d => d.status === 'Reserved').length },
    { name: 'Completed', count: completedDonations },
    { name: 'Unavailable', count: donations.filter(d => d.status === 'Unavailable').length }
  ];

  const incomingPending = requests.filter(r => r.status === 'Pending');
  const activeCoordinations = requests.filter(r => ['Accepted', 'Ready for Pickup', 'Handed Over'].includes(r.status));
  const completedTransfers = requests.filter(r => r.status === 'Completed');

  return (
    <div className="bg-cream-100 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Dashboard Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-forest-700">Donor Workspace</span>
            <h1 className="text-3xl font-extrabold text-charcoal-900 mt-0.5">
              Donor Dashboard
            </h1>
            <p className="text-xs text-charcoal-500 mt-1">
              Manage your published donation listings, review incoming receiver requests, and coordinate transparent handovers.
            </p>
          </div>

          <Link
            to="/donate"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-forest-700 hover:bg-forest-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
          >
            <PlusCircle size={16} />
            <span>List New Donation</span>
          </Link>
        </div>

        {/* Metric Cards Row */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          
          <div className="bg-white p-4 rounded-2xl border border-cream-300 shadow-xs">
            <span className="text-xs text-charcoal-500 block font-medium">Total Listings</span>
            <span className="text-2xl font-extrabold text-charcoal-900 mt-1 block">{totalDonations}</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-cream-300 shadow-xs">
            <span className="text-xs text-forest-700 block font-medium">Active Available</span>
            <span className="text-2xl font-extrabold text-forest-700 mt-1 block">{activeDonations}</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-cream-300 shadow-xs">
            <span className="text-xs text-amberGold-600 block font-medium">Pending Requests</span>
            <span className="text-2xl font-extrabold text-amberGold-600 mt-1 block">{pendingRequests}</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-cream-300 shadow-xs">
            <span className="text-xs text-teal-700 block font-medium">Accepted / In Progress</span>
            <span className="text-2xl font-extrabold text-teal-700 mt-1 block">{acceptedRequests}</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-cream-300 shadow-xs">
            <span className="text-xs text-emerald-700 block font-medium">Completed</span>
            <span className="text-2xl font-extrabold text-emerald-700 mt-1 block">{completedDonations}</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-cream-300 shadow-xs">
            <span className="text-xs text-rose-600 block font-medium">Rejected</span>
            <span className="text-2xl font-extrabold text-rose-600 mt-1 block">{rejectedRequests}</span>
          </div>

        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl border border-cream-300 shadow-sm overflow-hidden">
          <div className="flex border-b border-cream-200 overflow-x-auto text-xs font-bold">
            <button
              onClick={() => setActiveTab('listings')}
              className={`px-5 py-3.5 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
                activeTab === 'listings'
                  ? 'border-forest-700 text-forest-700 bg-forest-50/50'
                  : 'border-transparent text-charcoal-600 hover:text-charcoal-900'
              }`}
            >
              <span>My Donations ({donations.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('incoming')}
              className={`px-5 py-3.5 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
                activeTab === 'incoming'
                  ? 'border-forest-700 text-forest-700 bg-forest-50/50'
                  : 'border-transparent text-charcoal-600 hover:text-charcoal-900'
              }`}
            >
              <span>Incoming Requests ({incomingPending.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('accepted')}
              className={`px-5 py-3.5 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
                activeTab === 'accepted'
                  ? 'border-forest-700 text-forest-700 bg-forest-50/50'
                  : 'border-transparent text-charcoal-600 hover:text-charcoal-900'
              }`}
            >
              <span>Accepted & Handover ({activeCoordinations.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('completed')}
              className={`px-5 py-3.5 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
                activeTab === 'completed'
                  ? 'border-forest-700 text-forest-700 bg-forest-50/50'
                  : 'border-transparent text-charcoal-600 hover:text-charcoal-900'
              }`}
            >
              <span>Completed History ({completedTransfers.length})</span>
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

          {/* TAB 1: MY DONATIONS LISTINGS */}
          {activeTab === 'listings' && (
            <div className="p-6">
              {donations.length === 0 ? (
                <div className="text-center py-12 text-xs text-charcoal-400">
                  You haven't listed any items for donation yet.{' '}
                  <Link to="/donate" className="text-forest-700 font-bold underline">
                    Publish your first listing.
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-cream-200 text-[11px] font-bold text-charcoal-400 uppercase tracking-wider">
                        <th className="pb-3 px-2">Item</th>
                        <th className="pb-3 px-2">Category</th>
                        <th className="pb-3 px-2">Type / Price</th>
                        <th className="pb-3 px-2">Qty</th>
                        <th className="pb-3 px-2">Status</th>
                        <th className="pb-3 px-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-cream-100 text-xs text-charcoal-700">
                      {donations.map((d) => (
                        <tr key={d._id} className="hover:bg-cream-50/50">
                          <td className="py-3.5 px-2">
                            <div className="flex items-center gap-3">
                              <img
                                src={d.images?.[0] || 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb7?auto=format&fit=crop&w=150&q=80'}
                                alt=""
                                className="w-12 h-12 rounded-xl object-cover border border-cream-300 flex-shrink-0"
                              />
                              <div>
                                <Link to={`/donations/${d._id}`} className="font-bold text-charcoal-900 hover:text-forest-700 line-clamp-1">
                                  {d.title}
                                </Link>
                                <span className="text-[11px] text-charcoal-400 block mt-0.5">
                                  Condition: {d.condition} • {d.location?.city}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-2 font-medium">
                            {d.categoryId?.name}
                          </td>

                          <td className="py-3.5 px-2">
                            {d.donationType === 'Paid' ? (
                              <span className="font-bold text-amberGold-600 bg-amberGold-50 px-2 py-0.5 rounded border border-amberGold-200 text-[11px]">
                                ₹{d.price?.toLocaleString()}
                              </span>
                            ) : (
                              <span className="font-bold text-forest-700 bg-forest-50 px-2 py-0.5 rounded border border-forest-200 text-[11px]">
                                FREE
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-2">
                            <span className="font-semibold text-charcoal-900">{d.availableQuantity}</span> / {d.quantity}
                          </td>

                          <td className="py-3.5 px-2">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                              d.status === 'Available'
                                ? 'bg-forest-100 text-forest-800'
                                : d.status === 'Completed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : d.status === 'Reserved'
                                ? 'bg-teal-100 text-teal-800'
                                : 'bg-charcoal-200 text-charcoal-700'
                            }`}>
                              {d.status}
                            </span>
                          </td>

                          <td className="py-3.5 px-2 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Link
                                to={`/donations/${d._id}`}
                                className="p-1.5 rounded-lg text-charcoal-500 hover:bg-cream-200"
                                title="View public listing"
                              >
                                <Eye size={15} />
                              </Link>
                              
                              <Link
                                to={`/edit-donation/${d._id}`}
                                className="p-1.5 rounded-lg text-charcoal-500 hover:bg-cream-200"
                                title="Edit listing"
                              >
                                <Edit size={15} />
                              </Link>

                              <button
                                onClick={() => handleToggleAvailability(d._id)}
                                className="p-1.5 rounded-lg text-charcoal-500 hover:bg-cream-200"
                                title={d.status === 'Available' ? 'Mark Unavailable' : 'Mark Available'}
                              >
                                {d.status === 'Available' ? (
                                  <ToggleRight size={18} className="text-forest-600" />
                                ) : (
                                  <ToggleLeft size={18} className="text-charcoal-400" />
                                )}
                              </button>

                              <button
                                onClick={() => handleDeleteDonation(d._id)}
                                className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50"
                                title="Delete listing"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: INCOMING REQUESTS */}
          {activeTab === 'incoming' && (
            <div className="p-6 space-y-4">
              {incomingPending.length === 0 ? (
                <div className="text-center py-12 text-xs text-charcoal-400">
                  No new pending requests to review.
                </div>
              ) : (
                incomingPending.map((req) => (
                  <div key={req._id} className="p-5 rounded-2xl bg-cream-50 border border-cream-200 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-cream-200">
                      <div>
                        <h4 className="font-bold text-sm text-charcoal-900">
                          Request for: <Link to={`/donations/${req.donationId?._id}`} className="text-forest-700 hover:underline">{req.donationId?.title}</Link>
                        </h4>
                        <span className="text-xs text-charcoal-500">
                          Requested Qty: <strong>{req.requestedQuantity}</strong> • Total Value: <strong>{req.agreedPrice > 0 ? `₹${req.agreedPrice}` : 'FREE'}</strong>
                        </span>
                      </div>
                      <span className="text-[11px] bg-amberGold-100 text-amberGold-800 font-bold px-2 py-0.5 rounded-full w-fit">
                        Pending Your Approval
                      </span>
                    </div>

                    {/* Receiver details */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-forest-100 text-forest-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                        {req.receiverId?.name?.charAt(0) || 'R'}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-charcoal-800">{req.receiverId?.name}</span>
                          <VerificationBadge status={req.receiverId?.verificationStatus} size="sm" />
                        </div>
                        <span className="text-[11px] text-charcoal-500">
                          {req.receiverId?.address?.city || 'Local area'} • Pickup: {req.preferredPickupMethod}
                        </span>
                      </div>
                    </div>

                    {/* Reasons */}
                    <div className="p-3 bg-white rounded-xl border border-cream-200 space-y-1 text-xs">
                      <p>
                        <strong className="text-charcoal-700">Need Explanation:</strong>{' '}
                        <span className="text-charcoal-600">{req.reason}</span>
                      </p>
                      <p>
                        <strong className="text-charcoal-700">Intended Purpose:</strong>{' '}
                        <span className="text-charcoal-600">{req.intendedUse}</span>
                      </p>
                      {req.message && (
                        <p>
                          <strong className="text-charcoal-700">Note:</strong>{' '}
                          <span className="text-charcoal-600 italic">"{req.message}"</span>
                        </p>
                      )}
                    </div>

                    {/* Accept / Reject actions */}
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={() => {
                          const r = window.prompt('Optional rejection reason to assist the receiver:');
                          handleUpdateRequestStatus(req._id, 'Rejected', r || '');
                        }}
                        className="px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg"
                      >
                        Decline
                      </button>

                      <button
                        onClick={() => handleUpdateRequestStatus(req._id, 'Accepted')}
                        className="px-5 py-2 text-xs font-semibold text-white bg-forest-700 hover:bg-forest-800 rounded-lg shadow-sm"
                      >
                        Accept Request & Coordinate
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: ACCEPTED & HANDOVER */}
          {activeTab === 'accepted' && (
            <div className="p-6 space-y-6">
              {activeCoordinations.length === 0 ? (
                <div className="text-center py-12 text-xs text-charcoal-400">
                  No active handovers in progress.
                </div>
              ) : (
                activeCoordinations.map((req) => {
                  const isVerified = Boolean(req.otpVerified);
                  const currentOtp = otpInputs[req._id] || '';
                  const currentError = otpErrors[req._id];
                  const verifying = Boolean(isVerifying[req._id]);
                  const completing = Boolean(isCompleting[req._id]);

                  return (
                    <div key={req._id} className="p-5 rounded-2xl bg-white border border-forest-200 shadow-xs space-y-4">
                      {/* Top Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-cream-200">
                        <div className="flex items-start gap-3">
                          <img
                            src={req.donationId?.images?.[0] || 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb7?auto=format&fit=crop&w=150&q=80'}
                            alt=""
                            className="w-14 h-14 rounded-xl object-cover border border-cream-300 flex-shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-bold text-sm text-charcoal-900">
                                {req.donationId?.title}
                              </h4>
                              <span className="font-mono text-[10px] bg-cream-100 text-charcoal-600 px-2 py-0.5 rounded border border-cream-300 font-bold">
                                ID: #{req._id.toString().slice(-6).toUpperCase()}
                              </span>
                            </div>
                            <p className="text-xs text-charcoal-500 mt-1">
                              Receiver: <strong className="text-charcoal-800">{req.receiverId?.name}</strong>{' '}
                              ({req.receiverId?.phone || 'No phone'}) • Requested Qty: <strong>{req.requestedQuantity}</strong> • Pickup: <strong>{req.preferredPickupMethod}</strong>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                            isVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-forest-100 text-forest-800'
                          }`}>
                            {isVerified ? 'OTP Verified' : req.status}
                          </span>
                          <button
                            onClick={() => handleOpenChat(req)}
                            className="px-3 py-1.5 rounded-lg bg-forest-700 text-white font-semibold text-xs flex items-center gap-1 shadow-sm hover:bg-forest-800"
                          >
                            <MessageCircle size={14} />
                            <span>Open Chat</span>
                          </button>
                        </div>
                      </div>

                      {/* Handover Status Flow Controls */}
                      <div className="p-3 bg-cream-50 rounded-xl border border-cream-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div>
                          <span className="font-semibold text-charcoal-800 block">Handover Progress Tracker</span>
                          <span className="text-charcoal-500">
                            Coordinate physical handover with the receiver. Receiver will provide a 6-digit OTP code.
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {req.status === 'Accepted' && (
                            <button
                              onClick={() => handleUpdateRequestStatus(req._id, 'Ready for Pickup')}
                              className="px-3.5 py-1.5 bg-forest-700 hover:bg-forest-800 text-white font-semibold rounded-lg text-xs"
                            >
                              Mark Ready for Pickup
                            </button>
                          )}

                          {req.status === 'Ready for Pickup' && (
                            <button
                              onClick={() => handleUpdateRequestStatus(req._id, 'Handed Over')}
                              className="px-3.5 py-1.5 bg-forest-700 hover:bg-forest-800 text-white font-semibold rounded-lg text-xs"
                            >
                              Mark as Handed Over
                            </button>
                          )}

                          <button
                            onClick={() => setVerifyModal({
                              isOpen: true,
                              request: req,
                              otp: '',
                              verified: isVerified,
                              loading: false,
                              completing: false,
                              error: ''
                            })}
                            className={`px-3.5 py-1.5 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-sm ${
                              isVerified ? 'bg-emerald-700 hover:bg-emerald-800' : 'bg-forest-700 hover:bg-forest-800'
                            }`}
                          >
                            <KeyRound size={13} />
                            <span>{isVerified ? 'Complete Handover' : 'Verify Handover OTP'}</span>
                          </button>
                        </div>
                      </div>

                      {/* TWO-STEP OTP VERIFICATION & COMPLETION WORKFLOW SECTION */}
                      <div className="p-4 rounded-xl border border-cream-200 bg-cream-50/70 space-y-3">
                        <div className="flex items-center gap-2 text-xs font-bold text-charcoal-800 uppercase tracking-wider">
                          <KeyRound size={15} className="text-forest-700" />
                          <span>Verify Handover OTP</span>
                        </div>

                        {!isVerified ? (
                          /* STEP 1: Enter OTP & [Verify OTP] - [Complete Donation] is strictly hidden */
                          <div className="space-y-3">
                            <p className="text-xs text-charcoal-600">
                              Please ask the receiver for the <strong>6-digit OTP</strong> displayed on their dashboard after physically handing over the item.
                            </p>

                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 max-w-md">
                              <input
                                type="text"
                                maxLength={6}
                                placeholder="Enter 6-digit OTP"
                                value={currentOtp}
                                onChange={(e) => {
                                  const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                                  setOtpInputs(prev => ({ ...prev, [req._id]: val }));
                                  if (currentError) setOtpErrors(prev => ({ ...prev, [req._id]: '' }));
                                }}
                                className="flex-1 font-mono text-center text-lg font-bold tracking-widest py-2 px-3 bg-white border border-cream-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-forest-600 text-charcoal-900"
                              />

                              <button
                                onClick={() => handleInlineVerifyOTP(req._id)}
                                disabled={verifying || currentOtp.length !== 6}
                                className={`px-5 py-2.5 rounded-xl font-bold text-xs text-white shadow-sm transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
                                  verifying || currentOtp.length !== 6
                                    ? 'bg-charcoal-300 cursor-not-allowed'
                                    : 'bg-forest-700 hover:bg-forest-800'
                                }`}
                              >
                                <ShieldCheck size={15} />
                                <span>{verifying ? 'Verifying...' : 'Verify OTP'}</span>
                              </button>
                            </div>

                            {currentError && (
                              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-xs text-rose-800">
                                <ShieldAlert size={14} className="text-rose-600 flex-shrink-0" />
                                <span>{currentError}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          /* STEP 2: OTP Verified successfully -> Reveal [Complete Donation] button */
                          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3">
                            <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold">
                              <CheckCircle size={16} className="text-emerald-600 flex-shrink-0" />
                              <span>OTP verified successfully.</span>
                            </div>
                            <p className="text-xs text-emerald-700">
                              The receiver's verification code has been authenticated. Click the button below to finalize this donation.
                            </p>

                            <button
                              onClick={() => handleInlineComplete(req._id)}
                              disabled={completing}
                              className={`px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 ${
                                completing ? 'opacity-70 cursor-not-allowed' : ''
                              }`}
                            >
                              <Package size={15} />
                              <span>{completing ? 'Finalizing Handover...' : 'Complete Donation'}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 4: COMPLETED TRANSFERS */}
          {activeTab === 'completed' && (
            <div className="p-6 space-y-3">
              {completedTransfers.length === 0 ? (
                <div className="text-center py-12 text-xs text-charcoal-400">
                  No completed transfers yet.
                </div>
              ) : (
                completedTransfers.map((req) => (
                  <div key={req._id} className="p-4 rounded-xl bg-cream-50 border border-cream-200 flex items-center justify-between text-xs">
                    <div>
                      <h4 className="font-bold text-charcoal-900">{req.donationId?.title}</h4>
                      <p className="text-charcoal-500">
                        Handed over to <strong>{req.receiverId?.name}</strong> • Completed on {new Date(req.completedDate || req.updatedAt).toLocaleDateString()}
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
              <h3 className="font-bold text-sm text-charcoal-900">Donation Listings Breakdown</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ece7db" />
                    <XAxis dataKey="name" stroke="#585c58" fontSize={12} />
                    <YAxis stroke="#585c58" fontSize={12} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#285943" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Real-time Handover Chat Drawer */}
      <ChatDrawer
        requestId={chatRequestId}
        request={chatRequest}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />

      {/* Verify Handover OTP Modal */}
      {verifyModal.isOpen && verifyModal.request && (
        <div className="fixed inset-0 z-50 bg-charcoal-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-cream-300 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="bg-forest-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-forest-800 rounded-xl text-amberGold-400">
                  <KeyRound size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">Verify Handover Completion</h3>
                  <p className="text-[11px] text-forest-200">Cryptographic proof of physical handover</p>
                </div>
              </div>
              <button
                onClick={() => setVerifyModal(prev => ({ ...prev, isOpen: false, error: '' }))}
                className="p-1.5 rounded-lg text-forest-300 hover:text-white hover:bg-forest-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              
              {/* Donation & Receiver summary */}
              <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200 space-y-3 text-xs">
                <div className="flex items-center gap-3">
                  <img
                    src={verifyModal.request.donationId?.images?.[0] || 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb7?auto=format&fit=crop&w=150&q=80'}
                    alt=""
                    className="w-12 h-12 rounded-xl object-cover border border-cream-300 flex-shrink-0"
                  />
                  <div>
                    <h4 className="font-bold text-charcoal-900 text-sm line-clamp-1">
                      {verifyModal.request.donationId?.title}
                    </h4>
                    <p className="text-charcoal-500 text-[11px]">
                      Quantity: <strong>{verifyModal.request.requestedQuantity}</strong> • Contribution:{' '}
                      <strong>{verifyModal.request.agreedPrice > 0 ? `₹${verifyModal.request.agreedPrice}` : 'FREE'}</strong>
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-cream-200 flex items-center justify-between text-[11px]">
                  <div>
                    <span className="text-charcoal-400">Receiver:</span>{' '}
                    <strong className="text-charcoal-800">{verifyModal.request.receiverId?.name}</strong>{' '}
                    <span className="text-charcoal-500">({verifyModal.request.receiverId?.phone})</span>
                  </div>
                  <span className="font-mono text-charcoal-400">
                    ID: #{verifyModal.request._id.toString().slice(-6).toUpperCase()}
                  </span>
                </div>
              </div>

              {!(verifyModal.verified || verifyModal.request?.otpVerified) ? (
                /* STEP 1: VERIFY OTP (Complete button NEVER visible before this step) */
                <form onSubmit={handleModalVerifyOTP} className="space-y-4">
                  {/* Instructions */}
                  <div className="text-xs text-charcoal-600 bg-amberGold-50 p-3.5 rounded-xl border border-amberGold-200 space-y-1">
                    <p className="font-bold text-amberGold-900 flex items-center gap-1.5">
                      <ShieldCheck size={14} className="text-forest-700" />
                      <span>Receiver Verification Code</span>
                    </p>
                    <p className="text-[11px] text-charcoal-700">
                      Please ask the receiver for their <strong>6-digit verification OTP</strong> shown on their dashboard upon handing over the item.
                    </p>
                  </div>

                  {/* OTP Input */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-charcoal-800 uppercase tracking-wider text-center">
                      Enter 6-Digit Verification OTP
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      autoFocus
                      placeholder="••••••"
                      value={verifyModal.otp}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setVerifyModal(prev => ({ ...prev, otp: val, error: '' }));
                      }}
                      className="w-full text-center font-mono text-3xl font-extrabold tracking-[0.4em] py-3.5 px-4 bg-cream-50 border-2 border-forest-600 rounded-2xl focus:outline-none focus:ring-4 focus:ring-forest-500/20 text-forest-900 select-all"
                    />
                  </div>

                  {/* Error Alert */}
                  {verifyModal.error && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-xs text-rose-800">
                      <ShieldAlert size={16} className="text-rose-600 flex-shrink-0 mt-0.5" />
                      <span>{verifyModal.error}</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setVerifyModal(prev => ({ ...prev, isOpen: false, error: '' }))}
                      className="px-4 py-2.5 rounded-xl border border-cream-300 text-charcoal-700 font-semibold text-xs hover:bg-cream-100 transition-colors"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={verifyModal.loading || verifyModal.otp.length !== 6}
                      className={`px-6 py-2.5 rounded-xl font-bold text-xs text-white shadow-md transition-all flex items-center gap-1.5 ${
                        verifyModal.loading || verifyModal.otp.length !== 6
                          ? 'bg-charcoal-300 cursor-not-allowed'
                          : 'bg-forest-700 hover:bg-forest-800 hover:shadow-lg'
                      }`}
                    >
                      <ShieldCheck size={15} />
                      <span>{verifyModal.loading ? 'Verifying OTP...' : 'Verify OTP'}</span>
                    </button>
                  </div>
                </form>
              ) : (
                /* STEP 2: OTP VERIFIED -> SHOW COMPLETE DONATION BUTTON */
                <div className="space-y-5">
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
                    <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                      <CheckCircle size={18} className="text-emerald-600 flex-shrink-0" />
                      <span>OTP verified successfully.</span>
                    </div>
                    <p className="text-xs text-emerald-700">
                      The receiver's verification OTP has been confirmed in the database. You may now finalize and record this donation.
                    </p>
                  </div>

                  {verifyModal.error && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-xs text-rose-800">
                      <ShieldAlert size={16} className="text-rose-600 flex-shrink-0 mt-0.5" />
                      <span>{verifyModal.error}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setVerifyModal(prev => ({ ...prev, isOpen: false, error: '' }))}
                      className="px-4 py-2.5 rounded-xl border border-cream-300 text-charcoal-700 font-semibold text-xs hover:bg-cream-100 transition-colors"
                    >
                      Close
                    </button>

                    <button
                      type="button"
                      onClick={handleModalComplete}
                      disabled={verifyModal.completing}
                      className={`px-6 py-2.5 rounded-xl font-extrabold text-xs text-white shadow-md transition-all flex items-center gap-2 ${
                        verifyModal.completing
                          ? 'bg-charcoal-400 cursor-not-allowed'
                          : 'bg-emerald-700 hover:bg-emerald-800 hover:shadow-lg'
                      }`}
                    >
                      <Package size={16} />
                      <span>{verifyModal.completing ? 'Finalizing Handover...' : 'Complete Donation'}</span>
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default DonorDashboard;
