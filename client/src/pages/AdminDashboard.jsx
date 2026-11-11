import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Package,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Inbox,
  Layers,
  Search,
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  Edit,
  Plus,
  RefreshCw,
  Clock,
  KeyRound,
  FileText,
  MapPin,
  Calendar,
  ExternalLink,
  Info,
  Check,
  X,
  Activity,
  DollarSign,
  TrendingUp,
  SlidersHorizontal,
  ChevronRight,
  UserCheck,
  UserX,
  AlertCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import api from '../services/api';
import VerificationBadge from '../components/VerificationBadge';
import toast from 'react-hot-toast';

const COLORS = ['#285943', '#d99155', '#4e826e', '#cb7a3d', '#9cbfae', '#757a75'];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Users state
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userDocModal, setUserDocModal] = useState({ isOpen: false, user: null });
  const [userActionModal, setUserActionModal] = useState({
    isOpen: false,
    user: null,
    actionType: '',
    reason: '',
    loading: false
  });

  // Donations Moderation state
  const [donations, setDonations] = useState([]);
  const [moderationSummary, setModerationSummary] = useState({ pending: 0, approved: 0, rejected: 0, suspended: 0, total: 0 });
  const [donationFilter, setDonationFilter] = useState('all');
  const [donationSearch, setDonationSearch] = useState('');
  const [donationLoading, setDonationLoading] = useState(false);
  const [donationError, setDonationError] = useState(null);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [moderationModal, setModerationModal] = useState({
    isOpen: false,
    donation: null,
    targetStatus: '',
    reason: '',
    loading: false
  });

  // Donation Tracking state
  const [trackingRecords, setTrackingRecords] = useState([]);
  const [trackingAnalytics, setTrackingAnalytics] = useState({
    totalTracked: 0,
    completedCount: 0,
    activeHandoverCount: 0,
    successRate: 0,
    totalPaidVolume: 0
  });
  const [trackingSearch, setTrackingSearch] = useState('');
  const [trackingStatusFilter, setTrackingStatusFilter] = useState('all');
  const [trackingTypeFilter, setTrackingTypeFilter] = useState('all');
  const [trackingOtpFilter, setTrackingOtpFilter] = useState('all');
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingModal, setTrackingModal] = useState({
    isOpen: false,
    record: null,
    timeline: [],
    loading: false
  });

  // Reports & Categories & Support state
  const [reports, setReports] = useState([]);
  const [categories, setCategories] = useState([]);
  const [contactMessages, setContactMessages] = useState([]);

  // New category inputs
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('Package');
  const [isAddingCat, setIsAddingCat] = useState(false);

  // Fetch overview statistics
  const fetchOverview = async () => {
    try {
      setLoading(true);
      const [statsRes, catRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/categories')
      ]);

      if (statsRes.data.success) {
        setStatsData(statsRes.data);
      }
      if (catRes.data.success) {
        setCategories(catRes.data.categories || []);
      }
    } catch (err) {
      toast.error('Could not load administrative analytics.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Users
  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users', {
        params: { search: userSearch, role: userRoleFilter }
      });
      if (res.data.success) {
        setUsers(res.data.users || []);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  // Fetch Donations for Moderation
  const fetchDonations = async () => {
    try {
      setDonationLoading(true);
      setDonationError(null);
      const params = {};
      if (donationFilter !== 'all') params.moderationStatus = donationFilter;
      if (donationSearch.trim()) params.search = donationSearch.trim();

      const res = await api.get('/admin/donations', { params });
      if (res.data.success) {
        setDonations(res.data.donations || []);
        if (res.data.summary) {
          setModerationSummary(res.data.summary);
        }
      }
    } catch (err) {
      console.error('Error loading donations for moderation:', err);
      setDonationError('Failed to load donation listings. Please try again.');
    } finally {
      setDonationLoading(false);
    }
  };

  // Fetch Donation Tracking Records
  const fetchTracking = async () => {
    try {
      setTrackingLoading(true);
      const params = {};
      if (trackingSearch.trim()) params.search = trackingSearch.trim();
      if (trackingStatusFilter !== 'all') params.status = trackingStatusFilter;
      if (trackingTypeFilter !== 'all') params.type = trackingTypeFilter;
      if (trackingOtpFilter !== 'all') params.otpStatus = trackingOtpFilter;

      const res = await api.get('/admin/tracking', { params });
      if (res.data.success) {
        setTrackingRecords(res.data.trackingRecords || []);
        if (res.data.analytics) {
          setTrackingAnalytics(res.data.analytics);
        }
      }
    } catch (err) {
      console.error('Error fetching tracking records:', err);
      toast.error('Could not load donation tracking records.');
    } finally {
      setTrackingLoading(false);
    }
  };

  // Open Tracking Lifecycle Details Modal
  const openTrackingDetails = async (recordId) => {
    try {
      setTrackingModal({ isOpen: true, record: null, timeline: [], loading: true });
      const res = await api.get(`/admin/tracking/${recordId}`);
      if (res.data.success) {
        setTrackingModal({
          isOpen: true,
          record: res.data.request,
          timeline: res.data.timeline || [],
          loading: false
        });
      }
    } catch (err) {
      toast.error('Failed to load tracking timeline details.');
      setTrackingModal(prev => ({ ...prev, isOpen: false, loading: false }));
    }
  };

  // Fetch Reports
  const fetchReports = async () => {
    try {
      const res = await api.get('/reports/admin');
      if (res.data.success) {
        setReports(res.data.reports || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch Support Messages
  const fetchContactMessages = async () => {
    try {
      const res = await api.get('/contact/admin');
      if (res.data.success) {
        setContactMessages(res.data.messages || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'donations') fetchDonations();
    if (activeTab === 'tracking') fetchTracking();
    if (activeTab === 'reports') fetchReports();
    if (activeTab === 'support') fetchContactMessages();
  }, [activeTab]);

  // Execute Donation Moderation (Approve / Reject / Suspend) with instant state update
  const handleModerateDonationSubmit = async (e) => {
    e.preventDefault();
    const { donation, targetStatus, reason } = moderationModal;
    if (!donation || !targetStatus) return;

    if (['Rejected', 'Suspended'].includes(targetStatus) && !reason.trim()) {
      toast.error(`Please provide a reason for marking the listing as ${targetStatus}.`);
      return;
    }

    try {
      setModerationModal(prev => ({ ...prev, loading: true }));
      const res = await api.put(`/admin/donations/${donation._id}/moderate`, {
        moderationStatus: targetStatus,
        reason: reason.trim()
      });

      if (res.data.success) {
        toast.success(`Donation listing marked as ${targetStatus}`);
        
        // Immediate UI state update without page refresh
        setDonations(prev =>
          prev.map(d =>
            d._id === donation._id
              ? {
                  ...d,
                  moderationStatus: targetStatus,
                  moderationReason: reason.trim()
                }
              : d
          )
        );

        // Update selected donation if open in view modal
        if (selectedDonation && selectedDonation._id === donation._id) {
          setSelectedDonation(prev => ({
            ...prev,
            moderationStatus: targetStatus,
            moderationReason: reason.trim()
          }));
        }

        setModerationModal({ isOpen: false, donation: null, targetStatus: '', reason: '', loading: false });
        fetchOverview();
        fetchDonations();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Moderation action failed.');
      setModerationModal(prev => ({ ...prev, loading: false }));
    }
  };

  // Quick Approve Donation without modal
  const handleQuickApproveDonation = async (donationId) => {
    try {
      const res = await api.put(`/admin/donations/${donationId}/moderate`, {
        moderationStatus: 'Approved'
      });
      if (res.data.success) {
        toast.success('Donation approved and published!');
        setDonations(prev =>
          prev.map(d => (d._id === donationId ? { ...d, moderationStatus: 'Approved' } : d))
        );
        fetchOverview();
      }
    } catch (err) {
      toast.error('Failed to approve donation.');
    }
  };

  // Execute User Verification Action (Approve, Reject, Reconsider, Revoke) with instant state update
  const handleUserActionSubmit = async (e) => {
    e.preventDefault();
    const { user, actionType, reason } = userActionModal;
    if (!user || !actionType) return;

    try {
      setUserActionModal(prev => ({ ...prev, loading: true }));

      // Account suspension or reactivation
      if (actionType === 'suspend' || actionType === 'reactivate') {
        const nextAccountStatus = actionType === 'suspend' ? 'suspended' : 'active';
        const res = await api.put(`/admin/users/${user._id}/status`, {
          accountStatus: nextAccountStatus,
          suspensionReason: actionType === 'suspend' ? reason.trim() : ''
        });

        if (res.data.success) {
          toast.success(`Account marked as ${nextAccountStatus}`);
          setUsers(prev =>
            prev.map(u => (u._id === user._id ? { ...u, accountStatus: nextAccountStatus } : u))
          );
          setUserActionModal({ isOpen: false, user: null, actionType: '', reason: '', loading: false });
        }
        return;
      }

      // Verification actions: verified, rejected, pending
      let targetVerif = 'verified';
      if (actionType === 'reject') targetVerif = 'rejected';
      if (actionType === 'revoke') targetVerif = 'rejected';
      if (actionType === 'reconsider') targetVerif = 'verified';

      const res = await api.put(`/admin/users/${user._id}/verification`, {
        verificationStatus: targetVerif,
        adminNotes: reason.trim()
      });

      if (res.data.success) {
        toast.success(`User verification status set to ${targetVerif}`);
        
        // Immediate UI state update without page reload
        setUsers(prev =>
          prev.map(u =>
            u._id === user._id
              ? {
                  ...u,
                  verificationStatus: targetVerif,
                  verificationDocuments: u.verificationDocuments?.map((doc, idx) =>
                    idx === u.verificationDocuments.length - 1
                      ? { ...doc, adminNotes: reason.trim(), reviewedAt: new Date() }
                      : doc
                  )
                }
              : u
          )
        );

        setUserActionModal({ isOpen: false, user: null, actionType: '', reason: '', loading: false });
        if (userDocModal.isOpen && userDocModal.user?._id === user._id) {
          setUserDocModal(prev => ({
            ...prev,
            user: { ...prev.user, verificationStatus: targetVerif }
          }));
        }
        fetchOverview();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed.');
      setUserActionModal(prev => ({ ...prev, loading: false }));
    }
  };

  const handleReportAction = async (reportId, action, status) => {
    const notes = window.prompt(`Action notes for ${action}:`) || '';
    try {
      const res = await api.put(`/reports/admin/${reportId}`, {
        status,
        adminAction: action,
        adminNotes: notes
      });
      if (res.data.success) {
        toast.success(res.data.message);
        fetchReports();
        fetchOverview();
      }
    } catch (err) {
      toast.error('Failed to update report.');
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim() || !newCatDesc.trim()) return;

    try {
      const res = await api.post('/categories', {
        name: newCatName.trim(),
        description: newCatDesc.trim(),
        icon: newCatIcon
      });
      if (res.data.success) {
        toast.success('Category created successfully!');
        setNewCatName('');
        setNewCatDesc('');
        setIsAddingCat(false);
        const catRes = await api.get('/categories');
        if (catRes.data.success) setCategories(catRes.data.categories || []);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not create category.');
    }
  };

  const stats = statsData?.stats || {};
  const charts = statsData?.charts || {};

  return (
    <div className="bg-cream-100 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amberGold-100 text-amberGold-800 text-[11px] font-bold uppercase tracking-wider">
              <ShieldCheck size={13} />
              <span>Administrator Portal</span>
            </div>
            <h1 className="text-3xl font-extrabold text-charcoal-900 mt-1">
              Platform Administration
            </h1>
            <p className="text-xs text-charcoal-500 mt-0.5">
              Review donation listings, audit handover verification lifecycles, inspect identity proofs, and manage users.
            </p>
          </div>

          <button
            onClick={() => {
              fetchOverview();
              if (activeTab === 'users') fetchUsers();
              if (activeTab === 'donations') fetchDonations();
              if (activeTab === 'tracking') fetchTracking();
              toast.success('Admin data refreshed');
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-cream-300 rounded-xl text-xs font-semibold text-charcoal-700 hover:bg-cream-50 shadow-xs transition-colors"
          >
            <RefreshCw size={14} />
            <span>Refresh Portal</span>
          </button>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="bg-white rounded-2xl border border-cream-300 shadow-sm overflow-hidden">
          <div className="flex border-b border-cream-200 overflow-x-auto text-xs font-bold">
            {[
              { id: 'overview', label: 'Overview & Charts' },
              {
                id: 'donations',
                label: `Donation Moderation`,
                badge: moderationSummary.pending > 0 ? `${moderationSummary.pending} Pending` : null,
                badgeColor: 'bg-amberGold-500 text-white'
              },
              {
                id: 'tracking',
                label: `Donation Tracking`,
                badge: trackingAnalytics.activeHandoverCount > 0 ? `${trackingAnalytics.activeHandoverCount} Active` : null,
                badgeColor: 'bg-forest-600 text-white'
              },
              {
                id: 'users',
                label: `Users & Verifications`,
                badge: stats.users?.pendingVerifications ? `${stats.users.pendingVerifications} Pending` : null,
                badgeColor: 'bg-amberGold-500 text-white'
              },
              { id: 'reports', label: `Misuse Reports (${stats.moderation?.pendingReports || 0})` },
              { id: 'categories', label: `Categories (${categories.length})` },
              { id: 'support', label: `Support Messages (${stats.moderation?.newSupportMessages || 0})` }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-3.5 border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-forest-700 text-forest-700 bg-forest-50/50'
                    : 'border-transparent text-charcoal-600 hover:text-charcoal-900'
                }`}
              >
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${tab.badgeColor}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* TAB 1: OVERVIEW & ANALYTICS */}
          {activeTab === 'overview' && (
            <div className="p-6 space-y-8">
              
              {/* Metric Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="p-4 bg-cream-50 rounded-2xl border border-cream-200">
                  <span className="text-[11px] text-charcoal-500 uppercase font-bold tracking-wider">Total Users</span>
                  <span className="text-2xl font-extrabold text-charcoal-900 block mt-1">{stats.users?.total || 0}</span>
                  <span className="text-[10px] text-charcoal-400 block mt-0.5">{stats.users?.donors || 0} Donors • {stats.users?.receivers || 0} Receivers</span>
                </div>

                <div className="p-4 bg-cream-50 rounded-2xl border border-cream-200">
                  <span className="text-[11px] text-amberGold-700 uppercase font-bold tracking-wider">Pending Verif.</span>
                  <span className="text-2xl font-extrabold text-amberGold-700 block mt-1">{stats.users?.pendingVerifications || 0}</span>
                  <span className="text-[10px] text-charcoal-400 block mt-0.5">Awaiting Doc Review</span>
                </div>

                <div className="p-4 bg-cream-50 rounded-2xl border border-cream-200">
                  <span className="text-[11px] text-forest-700 uppercase font-bold tracking-wider">Total Listings</span>
                  <span className="text-2xl font-extrabold text-forest-700 block mt-1">{stats.donations?.total || 0}</span>
                  <span className="text-[10px] text-charcoal-400 block mt-0.5">{stats.donations?.available || 0} Available</span>
                </div>

                <div className="p-4 bg-cream-50 rounded-2xl border border-cream-200">
                  <span className="text-[11px] text-emerald-700 uppercase font-bold tracking-wider">Completed</span>
                  <span className="text-2xl font-extrabold text-emerald-700 block mt-1">{stats.donations?.completed || 0}</span>
                  <span className="text-[10px] text-charcoal-400 block mt-0.5">Verified Handovers</span>
                </div>

                <div className="p-4 bg-cream-50 rounded-2xl border border-cream-200">
                  <span className="text-[11px] text-rose-700 uppercase font-bold tracking-wider">Misuse Reports</span>
                  <span className="text-2xl font-extrabold text-rose-700 block mt-1">{stats.moderation?.pendingReports || 0}</span>
                  <span className="text-[10px] text-charcoal-400 block mt-0.5">Pending Action</span>
                </div>

                <div className="p-4 bg-cream-50 rounded-2xl border border-cream-200">
                  <span className="text-[11px] text-charcoal-700 uppercase font-bold tracking-wider">Support Inquiries</span>
                  <span className="text-2xl font-extrabold text-charcoal-900 block mt-1">{stats.moderation?.newSupportMessages || 0}</span>
                  <span className="text-[10px] text-charcoal-400 block mt-0.5">New Messages</span>
                </div>
              </div>

              {/* Recharts Analytics Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Donations by Category Chart */}
                <div className="p-5 rounded-2xl bg-cream-50 border border-cream-200 space-y-4">
                  <h3 className="font-bold text-sm text-charcoal-900">Donations Distributed by Category</h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={charts.categoryStats || []}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ece7db" />
                        <XAxis dataKey="name" stroke="#585c58" fontSize={10} angle={-15} textAnchor="end" height={45} />
                        <YAxis stroke="#585c58" fontSize={11} allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#285943" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Free vs Paid Split Chart */}
                <div className="p-5 rounded-2xl bg-cream-50 border border-cream-200 space-y-4">
                  <h3 className="font-bold text-sm text-charcoal-900">Free vs Subsidized Paid Transfers</h3>
                  <div className="h-64 w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={charts.typeStats?.map(t => ({ name: t._id, value: t.count })) || []}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        >
                          {charts.typeStats?.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry._id === 'Free' ? '#285943' : '#d99155'} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: DONATION MODERATION (FIXED & EXPANDED) */}
          {activeTab === 'donations' && (
            <div className="p-6 space-y-6">
              
              {/* Header & Filter Controls */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                
                {/* Status Pills */}
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { id: 'all', label: 'All Listings', count: moderationSummary.total },
                    { id: 'Pending Review', label: 'Pending Review', count: moderationSummary.pending, color: 'text-amberGold-800 bg-amberGold-100' },
                    { id: 'Approved', label: 'Approved', count: moderationSummary.approved, color: 'text-emerald-800 bg-emerald-100' },
                    { id: 'Rejected', label: 'Rejected', count: moderationSummary.rejected, color: 'text-rose-800 bg-rose-100' },
                    { id: 'Suspended', label: 'Suspended', count: moderationSummary.suspended, color: 'text-charcoal-800 bg-charcoal-200' }
                  ].map(pill => (
                    <button
                      key={pill.id}
                      onClick={() => {
                        setDonationFilter(pill.id);
                        setTimeout(fetchDonations, 10);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                        donationFilter === pill.id
                          ? 'bg-forest-700 text-white border-forest-700 shadow-xs'
                          : 'bg-white text-charcoal-700 border-cream-300 hover:bg-cream-50'
                      }`}
                    >
                      <span>{pill.label}</span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                        donationFilter === pill.id ? 'bg-white/20 text-white' : pill.color || 'bg-cream-200 text-charcoal-600'
                      }`}>
                        {pill.count || 0}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Search Bar */}
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <div className="relative flex-1 md:w-64">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400" />
                    <input
                      type="text"
                      placeholder="Search title, donor, city..."
                      value={donationSearch}
                      onChange={(e) => setDonationSearch(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && fetchDonations()}
                      className="w-full pl-9 pr-3 py-2 bg-cream-50 border border-cream-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-forest-600"
                    />
                  </div>
                  <button
                    onClick={fetchDonations}
                    className="px-3.5 py-2 bg-forest-700 hover:bg-forest-800 text-white font-semibold text-xs rounded-xl shadow-xs"
                  >
                    Filter
                  </button>
                </div>

              </div>

              {/* Error handling with retry button */}
              {donationError && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between text-xs text-rose-800">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={16} />
                    <span>{donationError}</span>
                  </div>
                  <button
                    onClick={fetchDonations}
                    className="px-3 py-1 bg-white border border-rose-300 rounded-lg font-bold text-rose-700 hover:bg-rose-100"
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* Table of Listings */}
              {donationLoading ? (
                <div className="text-center py-16 text-xs text-charcoal-400 flex items-center justify-center gap-2">
                  <RefreshCw size={16} className="animate-spin text-forest-600" />
                  <span>Loading donation listings...</span>
                </div>
              ) : donations.length === 0 ? (
                <div className="text-center py-16 text-charcoal-400 space-y-2 bg-cream-50 rounded-2xl border border-cream-200">
                  <Package size={32} className="mx-auto text-charcoal-300" />
                  <p className="font-semibold text-sm text-charcoal-700">No Donation Listings Found</p>
                  <p className="text-xs text-charcoal-500">
                    No items match "{donationFilter}" moderation status or search criteria.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto border border-cream-200 rounded-2xl">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-cream-50/80 border-b border-cream-200 text-[11px] font-bold text-charcoal-400 uppercase tracking-wider">
                        <th className="py-3 px-3">Item Details</th>
                        <th className="py-3 px-3">Category</th>
                        <th className="py-3 px-3">Donor</th>
                        <th className="py-3 px-3">Type & Price</th>
                        <th className="py-3 px-3">Moderation Status</th>
                        <th className="py-3 px-3 text-right">Moderation Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-cream-100">
                      {donations.map((d) => {
                        const mStatus = d.moderationStatus || 'Approved';
                        return (
                          <tr key={d._id} className="hover:bg-cream-50/50 transition-colors">
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-3">
                                <img
                                  src={d.images?.[0] || 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb7?auto=format&fit=crop&w=150&q=80'}
                                  alt=""
                                  className="w-12 h-12 rounded-xl object-cover border border-cream-300 flex-shrink-0"
                                />
                                <div>
                                  <Link
                                    to={`/donations/${d._id}`}
                                    className="font-bold text-charcoal-900 hover:text-forest-700 line-clamp-1 text-xs"
                                  >
                                    {d.title}
                                  </Link>
                                  <span className="text-[11px] text-charcoal-400">
                                    Condition: <strong>{d.condition}</strong> • Qty: <strong>{d.quantity}</strong>
                                  </span>
                                </div>
                              </div>
                            </td>

                            <td className="py-3 px-3">
                              <span className="font-semibold text-charcoal-800">{d.categoryId?.name || 'General'}</span>
                            </td>

                            <td className="py-3 px-3">
                              <div>
                                <p className="font-bold text-charcoal-900">{d.donorId?.name || 'Unknown'}</p>
                                <p className="text-[11px] text-charcoal-400">{d.donorId?.email}</p>
                              </div>
                            </td>

                            <td className="py-3 px-3">
                              <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase ${
                                d.donationType === 'Paid' ? 'bg-amberGold-100 text-amberGold-800' : 'bg-forest-100 text-forest-800'
                              }`}>
                                {d.donationType === 'Paid' ? `₹${d.price}` : 'FREE'}
                              </span>
                            </td>

                            <td className="py-3 px-3">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide inline-flex items-center gap-1 ${
                                  mStatus === 'Approved'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : mStatus === 'Pending Review'
                                    ? 'bg-amberGold-100 text-amberGold-800 animate-pulse'
                                    : mStatus === 'Rejected'
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-charcoal-200 text-charcoal-800'
                                }`}
                              >
                                {mStatus === 'Approved' && <CheckCircle size={11} />}
                                {mStatus === 'Rejected' && <XCircle size={11} />}
                                {mStatus === 'Pending Review' && <Clock size={11} />}
                                {mStatus === 'Suspended' && <AlertTriangle size={11} />}
                                <span>{mStatus}</span>
                              </span>
                              {d.moderationReason && (
                                <p className="text-[10px] text-rose-700 italic mt-0.5 line-clamp-1" title={d.moderationReason}>
                                  Reason: "{d.moderationReason}"
                                </p>
                              )}
                            </td>

                            <td className="py-3 px-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {/* View Details Modal */}
                                <button
                                  onClick={() => setSelectedDonation(d)}
                                  className="px-2.5 py-1 bg-cream-200 hover:bg-cream-300 text-charcoal-800 rounded-lg font-semibold text-[11px]"
                                  title="Inspect full details"
                                >
                                  View
                                </button>

                                {/* Approve */}
                                {mStatus !== 'Approved' && (
                                  <button
                                    onClick={() => handleQuickApproveDonation(d._id)}
                                    className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-lg font-bold text-[11px]"
                                  >
                                    Approve
                                  </button>
                                )}

                                {/* Reject with Reason */}
                                {mStatus !== 'Rejected' && (
                                  <button
                                    onClick={() =>
                                      setModerationModal({
                                        isOpen: true,
                                        donation: d,
                                        targetStatus: 'Rejected',
                                        reason: '',
                                        loading: false
                                      })
                                    }
                                    className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-lg font-bold text-[11px]"
                                  >
                                    Reject
                                  </button>
                                )}

                                {/* Suspend */}
                                {mStatus === 'Approved' && (
                                  <button
                                    onClick={() =>
                                      setModerationModal({
                                        isOpen: true,
                                        donation: d,
                                        targetStatus: 'Suspended',
                                        reason: '',
                                        loading: false
                                      })
                                    }
                                    className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg font-bold text-[11px]"
                                  >
                                    Suspend
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: COMPLETE DONATION AND RECEIVER TRACKING (NEW) */}
          {activeTab === 'tracking' && (
            <div className="p-6 space-y-6">
              
              {/* Top Numerical Analytics Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                <div className="p-4 bg-cream-50 rounded-2xl border border-cream-200">
                  <span className="text-[11px] text-charcoal-500 uppercase font-bold tracking-wider">Total Handaways</span>
                  <span className="text-2xl font-extrabold text-charcoal-900 block mt-1">{trackingAnalytics.totalTracked}</span>
                  <span className="text-[10px] text-charcoal-400 block mt-0.5">Tracked Requests</span>
                </div>

                <div className="p-4 bg-cream-50 rounded-2xl border border-cream-200">
                  <span className="text-[11px] text-forest-700 uppercase font-bold tracking-wider">Active Handovers</span>
                  <span className="text-2xl font-extrabold text-forest-700 block mt-1">{trackingAnalytics.activeHandoverCount}</span>
                  <span className="text-[10px] text-charcoal-400 block mt-0.5">Awaiting Physical Handover</span>
                </div>

                <div className="p-4 bg-cream-50 rounded-2xl border border-cream-200">
                  <span className="text-[11px] text-emerald-700 uppercase font-bold tracking-wider">Completed</span>
                  <span className="text-2xl font-extrabold text-emerald-700 block mt-1">{trackingAnalytics.completedCount}</span>
                  <span className="text-[10px] text-charcoal-400 block mt-0.5">Cryptographically Verified</span>
                </div>

                <div className="p-4 bg-cream-50 rounded-2xl border border-cream-200">
                  <span className="text-[11px] text-amberGold-700 uppercase font-bold tracking-wider">Handover Success</span>
                  <span className="text-2xl font-extrabold text-amberGold-700 block mt-1">{trackingAnalytics.successRate}%</span>
                  <span className="text-[10px] text-charcoal-400 block mt-0.5">Completion Ratio</span>
                </div>

                <div className="p-4 bg-cream-50 rounded-2xl border border-cream-200">
                  <span className="text-[11px] text-charcoal-700 uppercase font-bold tracking-wider">Paid Transfers</span>
                  <span className="text-2xl font-extrabold text-charcoal-900 block mt-1">₹{trackingAnalytics.totalPaidVolume}</span>
                  <span className="text-[10px] text-charcoal-400 block mt-0.5">Subsidized Value Moved</span>
                </div>
              </div>

              {/* Advanced Search & Filtering Bar */}
              <div className="p-4 rounded-2xl bg-cream-50/70 border border-cream-200 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  {/* Search Input */}
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400" />
                    <input
                      type="text"
                      placeholder="Search item, donor, receiver, ID..."
                      value={trackingSearch}
                      onChange={(e) => setTrackingSearch(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && fetchTracking()}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-cream-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-600"
                    />
                  </div>

                  {/* Status Filter */}
                  <div>
                    <select
                      value={trackingStatusFilter}
                      onChange={(e) => {
                        setTrackingStatusFilter(e.target.value);
                        setTimeout(fetchTracking, 10);
                      }}
                      className="w-full px-3 py-2 bg-white border border-cream-300 rounded-xl font-medium text-charcoal-700"
                    >
                      <option value="all">All Process Statuses</option>
                      <option value="Pending">Pending Approval</option>
                      <option value="Accepted">Accepted</option>
                      <option value="Ready for Pickup">Ready for Pickup</option>
                      <option value="Handed Over">Handed Over</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>

                  {/* Type Filter */}
                  <div>
                    <select
                      value={trackingTypeFilter}
                      onChange={(e) => {
                        setTrackingTypeFilter(e.target.value);
                        setTimeout(fetchTracking, 10);
                      }}
                      className="w-full px-3 py-2 bg-white border border-cream-300 rounded-xl font-medium text-charcoal-700"
                    >
                      <option value="all">All Types (Free & Paid)</option>
                      <option value="Free">Free Donations Only</option>
                      <option value="Paid">Subsidized Paid Only</option>
                    </select>
                  </div>

                  {/* OTP Filter */}
                  <div>
                    <select
                      value={trackingOtpFilter}
                      onChange={(e) => {
                        setTrackingOtpFilter(e.target.value);
                        setTimeout(fetchTracking, 10);
                      }}
                      className="w-full px-3 py-2 bg-white border border-cream-300 rounded-xl font-medium text-charcoal-700"
                    >
                      <option value="all">All OTP States</option>
                      <option value="verified">Verified OTP (Completed)</option>
                      <option value="active">Active OTP (Pending Handover)</option>
                      <option value="expired">Expired OTP</option>
                      <option value="pending">Pending Handover Generation</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Tracking Table */}
              {trackingLoading ? (
                <div className="text-center py-16 text-xs text-charcoal-400 flex items-center justify-center gap-2">
                  <RefreshCw size={16} className="animate-spin text-forest-600" />
                  <span>Loading donation tracking records...</span>
                </div>
              ) : trackingRecords.length === 0 ? (
                <div className="text-center py-16 text-charcoal-400 space-y-2 bg-cream-50 rounded-2xl border border-cream-200">
                  <Activity size={32} className="mx-auto text-charcoal-300" />
                  <p className="font-semibold text-sm text-charcoal-700">No Tracking Records Found</p>
                  <p className="text-xs text-charcoal-500">
                    No requests match the selected search and filter criteria.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto border border-cream-200 rounded-2xl">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-cream-50/80 border-b border-cream-200 text-[11px] font-bold text-charcoal-400 uppercase tracking-wider">
                        <th className="py-3 px-3">Donation Item</th>
                        <th className="py-3 px-3">Donor</th>
                        <th className="py-3 px-3">Receiver</th>
                        <th className="py-3 px-3">Type & Value</th>
                        <th className="py-3 px-3">Dates (Req / Acc / Done)</th>
                        <th className="py-3 px-3">OTP State</th>
                        <th className="py-3 px-3">Process Status</th>
                        <th className="py-3 px-3 text-right">Audit Trail</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-cream-100">
                      {trackingRecords.map((t) => (
                        <tr key={t._id} className="hover:bg-cream-50/50 transition-colors">
                          
                          {/* Item Details */}
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={t.donation?.images?.[0] || 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb7?auto=format&fit=crop&w=150&q=80'}
                                alt=""
                                className="w-10 h-10 rounded-xl object-cover border border-cream-200 flex-shrink-0"
                              />
                              <div>
                                <p className="font-bold text-charcoal-900 line-clamp-1">{t.donation?.title || 'Item'}</p>
                                <p className="text-[10px] text-charcoal-400 font-mono">
                                  ID: #{t._id.toString().slice(-6).toUpperCase()} • {t.donation?.category}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Donor */}
                          <td className="py-3 px-3">
                            <div>
                              <p className="font-bold text-charcoal-900">{t.donor?.name || 'Unknown'}</p>
                              <p className="text-[10px] text-charcoal-400">{t.donor?.city || 'Local area'}</p>
                            </div>
                          </td>

                          {/* Receiver */}
                          <td className="py-3 px-3">
                            <div>
                              <p className="font-bold text-charcoal-900">{t.receiver?.name || 'Unknown'}</p>
                              <p className="text-[10px] text-charcoal-400">{t.receiver?.phone || t.receiver?.email}</p>
                            </div>
                          </td>

                          {/* Type & Value */}
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase ${
                              t.donation?.donationType === 'Paid' ? 'bg-amberGold-100 text-amberGold-800' : 'bg-forest-100 text-forest-800'
                            }`}>
                              {t.donation?.donationType === 'Paid' ? `₹${t.agreedPrice || t.donation?.price}` : 'FREE'}
                            </span>
                          </td>

                          {/* Dates */}
                          <td className="py-3 px-3">
                            <div className="text-[11px] text-charcoal-600 space-y-0.5">
                              <p>Req: {new Date(t.requestDate).toLocaleDateString()}</p>
                              {t.acceptedDate && <p className="text-[10px] text-forest-700">Acc: {new Date(t.acceptedDate).toLocaleDateString()}</p>}
                              {t.completedDate && <p className="text-[10px] text-emerald-700 font-semibold">Done: {new Date(t.completedDate).toLocaleDateString()}</p>}
                            </div>
                          </td>

                          {/* OTP State */}
                          <td className="py-3 px-3">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide inline-flex items-center gap-1 ${
                              t.otpStatus === 'Verified'
                                ? 'bg-emerald-100 text-emerald-800'
                                : t.otpStatus === 'Active'
                                ? 'bg-forest-100 text-forest-800'
                                : t.otpStatus === 'Expired'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-charcoal-100 text-charcoal-600'
                            }`}>
                              <KeyRound size={11} />
                              <span>{t.otpStatus}</span>
                            </span>
                          </td>

                          {/* Process Status */}
                          <td className="py-3 px-3">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                              t.status === 'Completed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : ['Accepted', 'Ready for Pickup', 'Handed Over'].includes(t.status)
                                ? 'bg-forest-100 text-forest-800'
                                : t.status === 'Pending'
                                ? 'bg-amberGold-100 text-amberGold-800'
                                : 'bg-charcoal-200 text-charcoal-700'
                            }`}>
                              {t.status}
                            </span>
                          </td>

                          {/* Action */}
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => openTrackingDetails(t._id)}
                              className="px-3 py-1.5 rounded-lg bg-forest-700 hover:bg-forest-800 text-white font-semibold text-xs inline-flex items-center gap-1 shadow-xs"
                            >
                              <span>View Timeline</span>
                              <ChevronRight size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: USERS & VERIFICATIONS (FIXED & CONTEXTUALIZED) */}
          {activeTab === 'users' && (
            <div className="p-6 space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-3 justify-between">
                <div className="relative flex-1 w-full sm:max-w-xs">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400" />
                  <input
                    type="text"
                    placeholder="Search user name, email, phone..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
                    className="w-full pl-9 pr-3 py-2 bg-cream-50 border border-cream-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-forest-600"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <select
                    value={userRoleFilter}
                    onChange={(e) => {
                      setUserRoleFilter(e.target.value);
                      setTimeout(fetchUsers, 50);
                    }}
                    className="px-3 py-2 bg-cream-50 border border-cream-300 rounded-xl text-xs font-medium text-charcoal-700"
                  >
                    <option value="all">All Roles</option>
                    <option value="donor">Donors</option>
                    <option value="receiver">Receivers</option>
                    <option value="admin">Administrators</option>
                  </select>

                  <button
                    onClick={fetchUsers}
                    className="px-4 py-2 bg-forest-700 text-white font-semibold text-xs rounded-xl shadow-xs"
                  >
                    Search
                  </button>
                </div>
              </div>

              {/* Users Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-cream-200 text-[11px] font-bold text-charcoal-400 uppercase tracking-wider">
                      <th className="pb-3 px-2">Member</th>
                      <th className="pb-3 px-2">Role / Type</th>
                      <th className="pb-3 px-2">Verification Status</th>
                      <th className="pb-3 px-2">Account State</th>
                      <th className="pb-3 px-2 text-right">Contextual Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cream-100 text-xs text-charcoal-700">
                    {users.map((u) => {
                      const vStatus = u.verificationStatus || 'pending';
                      const aStatus = u.accountStatus || 'active';
                      const lastDoc = u.verificationDocuments?.[u.verificationDocuments.length - 1];

                      return (
                        <tr key={u._id} className="hover:bg-cream-50/50">
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-2.5">
                              {u.profileImage ? (
                                <img src={u.profileImage} alt="" className="w-9 h-9 rounded-full object-cover border border-cream-300" />
                              ) : (
                                <div className="w-9 h-9 rounded-full bg-forest-100 text-forest-700 flex items-center justify-center font-bold text-xs">
                                  {u.name?.charAt(0) || 'U'}
                                </div>
                              )}
                              <div>
                                <p className="font-bold text-charcoal-900">{u.name}</p>
                                <p className="text-[11px] text-charcoal-400">{u.email} • {u.phone}</p>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-2">
                            <span className="capitalize font-semibold text-charcoal-800">{u.accountType}</span>
                            <span className="text-[10px] text-charcoal-400 block">{u.roles?.join(', ')}</span>
                          </td>

                          <td className="py-3 px-2">
                            <div className="flex items-center gap-1.5">
                              <VerificationBadge status={vStatus} size="sm" />
                              {lastDoc && (
                                <button
                                  onClick={() => setUserDocModal({ isOpen: true, user: u })}
                                  className="text-[10px] text-forest-700 hover:underline font-bold inline-flex items-center gap-0.5 ml-1"
                                >
                                  <FileText size={11} />
                                  <span>View Docs</span>
                                </button>
                              )}
                            </div>
                            {vStatus === 'rejected' && lastDoc?.adminNotes && (
                              <p className="text-[10px] text-rose-700 italic mt-0.5 line-clamp-1" title={lastDoc.adminNotes}>
                                Rejection Note: "{lastDoc.adminNotes}"
                              </p>
                            )}
                          </td>

                          <td className="py-3 px-2">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              aStatus === 'active' ? 'bg-forest-100 text-forest-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {aStatus}
                            </span>
                            {aStatus === 'suspended' && u.suspensionReason && (
                              <p className="text-[10px] text-rose-700 italic mt-0.5 line-clamp-1" title={u.suspensionReason}>
                                Reason: "{u.suspensionReason}"
                              </p>
                            )}
                          </td>

                          <td className="py-3 px-2 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              
                              {/* 1. View Docs Button */}
                              {lastDoc && (
                                <button
                                  onClick={() => setUserDocModal({ isOpen: true, user: u })}
                                  className="px-2.5 py-1 rounded bg-cream-200 hover:bg-cream-300 text-charcoal-800 font-semibold text-[11px]"
                                  title="Inspect supporting identity documents"
                                >
                                  Docs
                                </button>
                              )}

                              {/* 2. Contextual Actions based on verificationStatus */}
                              
                              {/* CASE A: Pending */}
                              {vStatus === 'pending' && (
                                <>
                                  <button
                                    onClick={() =>
                                      setUserActionModal({
                                        isOpen: true,
                                        user: u,
                                        actionType: 'verified',
                                        reason: '',
                                        loading: false
                                      })
                                    }
                                    className="px-2.5 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] border border-emerald-300"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() =>
                                      setUserActionModal({
                                        isOpen: true,
                                        user: u,
                                        actionType: 'reject',
                                        reason: '',
                                        loading: false
                                      })
                                    }
                                    className="px-2.5 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] border border-rose-300"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}

                              {/* CASE B: Verified -> No Approve/Reject! Only Revoke */}
                              {vStatus === 'verified' && (
                                <button
                                  onClick={() =>
                                    setUserActionModal({
                                      isOpen: true,
                                      user: u,
                                      actionType: 'revoke',
                                      reason: '',
                                      loading: false
                                    })
                                  }
                                  className="px-2.5 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-[11px] border border-amber-300"
                                  title="Revoke verification badge"
                                >
                                  Revoke
                                </button>
                              )}

                              {/* CASE C: Rejected -> Reconsider */}
                              {vStatus === 'rejected' && (
                                <button
                                  onClick={() =>
                                    setUserActionModal({
                                      isOpen: true,
                                      user: u,
                                      actionType: 'reconsider',
                                      reason: '',
                                      loading: false
                                    })
                                  }
                                  className="px-2.5 py-1 rounded bg-forest-50 hover:bg-forest-100 text-forest-700 font-bold text-[11px] border border-forest-300"
                                  title="Re-verify after corrections"
                                >
                                  Reconsider
                                </button>
                              )}

                              {/* 3. Decoupled Account Status (Suspend / Reactivate) */}
                              <button
                                onClick={() =>
                                  setUserActionModal({
                                    isOpen: true,
                                    user: u,
                                    actionType: aStatus === 'suspended' ? 'reactivate' : 'suspend',
                                    reason: '',
                                    loading: false
                                  })
                                }
                                className={`px-2.5 py-1 rounded font-semibold text-[11px] border ${
                                  aStatus === 'suspended'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                                    : 'bg-charcoal-100 text-charcoal-700 border-charcoal-300 hover:bg-charcoal-200'
                                }`}
                              >
                                {aStatus === 'suspended' ? 'Reactivate' : 'Suspend'}
                              </button>

                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: MISUSE REPORTS */}
          {activeTab === 'reports' && (
            <div className="p-6 space-y-4">
              {reports.length === 0 ? (
                <div className="text-center py-12 text-xs text-charcoal-400">
                  No misuse or resale reports currently pending review.
                </div>
              ) : (
                reports.map((rep) => (
                  <div key={rep._id} className="p-5 rounded-2xl bg-cream-50 border border-rose-200 space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-rose-800 flex items-center gap-1.5">
                        <AlertTriangle size={16} />
                        {rep.reason}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        rep.status === 'Resolved' ? 'bg-forest-100 text-forest-800' : 'bg-amberGold-100 text-amberGold-800'
                      }`}>
                        {rep.status}
                      </span>
                    </div>

                    <p className="text-charcoal-700">
                      <strong>Details: </strong>{rep.description}
                    </p>

                    <div className="text-[11px] text-charcoal-500 flex items-center gap-4">
                      <span>Reporter: <strong>{rep.reporterId?.name}</strong></span>
                      {rep.reportedUserId && <span>Reported User: <strong>{rep.reportedUserId?.name}</strong></span>}
                      {rep.donationId && <span>Item: <strong>{rep.donationId?.title}</strong></span>}
                    </div>

                    {rep.status === 'Pending' && (
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-cream-200">
                        <button
                          onClick={() => handleReportAction(rep._id, 'Dismissed', 'Dismissed')}
                          className="px-3 py-1.5 text-xs text-charcoal-600 hover:bg-cream-200 rounded-lg"
                        >
                          Dismiss Report
                        </button>
                        <button
                          onClick={() => handleReportAction(rep._id, 'Listing Removed', 'Resolved')}
                          className="px-3 py-1.5 text-xs text-rose-700 bg-rose-100 hover:bg-rose-200 font-bold rounded-lg"
                        >
                          Take Action & Resolve
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 6: CATEGORIES */}
          {activeTab === 'categories' && (
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-charcoal-900">Platform Categories</h3>
                  <p className="text-xs text-charcoal-500">Categories organize donations and streamline discovery.</p>
                </div>
                <button
                  onClick={() => setIsAddingCat(!isAddingCat)}
                  className="px-4 py-2 bg-forest-700 hover:bg-forest-800 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-xs"
                >
                  <Plus size={14} />
                  <span>{isAddingCat ? 'Cancel' : 'New Category'}</span>
                </button>
              </div>

              {isAddingCat && (
                <form onSubmit={handleCreateCategory} className="p-5 rounded-2xl bg-cream-50 border border-cream-300 space-y-4">
                  <h4 className="font-bold text-xs text-charcoal-900">Add New Category</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="Category name"
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      className="px-3 py-2 bg-white border border-cream-300 rounded-xl text-xs"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Short description"
                      value={newCatDesc}
                      onChange={(e) => setNewCatDesc(e.target.value)}
                      className="px-3 py-2 bg-white border border-cream-300 rounded-xl text-xs"
                      required
                    />
                    <select
                      value={newCatIcon}
                      onChange={(e) => setNewCatIcon(e.target.value)}
                      className="px-3 py-2 bg-white border border-cream-300 rounded-xl text-xs font-medium"
                    >
                      <option value="Package">Package</option>
                      <option value="Shirt">Shirt (Clothes)</option>
                      <option value="BookOpen">BookOpen (Books)</option>
                      <option value="Utensils">Utensils (Food)</option>
                      <option value="Laptop">Laptop (Electronics)</option>
                      <option value="Armchair">Armchair (Furniture)</option>
                      <option value="Home">Home (Household)</option>
                      <option value="HeartPulse">HeartPulse (Medical)</option>
                      <option value="Gamepad2">Gamepad2 (Toys)</option>
                    </select>
                  </div>
                  <div className="flex justify-end">
                    <button type="submit" className="px-5 py-2 bg-forest-700 text-white rounded-xl text-xs font-bold shadow-xs">
                      Create Category
                    </button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((cat) => (
                  <div key={cat._id} className="p-4 rounded-xl bg-white border border-cream-300 flex items-start gap-3 shadow-2xs">
                    <div className="p-2.5 rounded-xl bg-forest-50 text-forest-700 mt-0.5">
                      <Layers size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-charcoal-900">{cat.name}</h4>
                      <p className="text-[11px] text-charcoal-500 line-clamp-2 mt-0.5">{cat.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: SUPPORT MESSAGES */}
          {activeTab === 'support' && (
            <div className="p-6 space-y-4">
              {contactMessages.length === 0 ? (
                <div className="text-center py-12 text-xs text-charcoal-400">
                  No public support inquiry messages received.
                </div>
              ) : (
                contactMessages.map((msg) => (
                  <div key={msg._id} className="p-5 rounded-2xl bg-cream-50 border border-cream-200 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-charcoal-900">{msg.subject}</h4>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        msg.status === 'New' ? 'bg-amberGold-100 text-amberGold-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {msg.status}
                      </span>
                    </div>
                    <p className="text-charcoal-700">{msg.message}</p>
                    <div className="text-[11px] text-charcoal-400 pt-1 flex items-center justify-between">
                      <span>From: <strong>{msg.name}</strong> ({msg.email})</span>
                      <span>Received: {new Date(msg.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

        </div>

      </div>

      {/* ================= MODALS ================= */}

      {/* 1. DONATION DETAILS MODAL (MODERATION PREVIEW) */}
      {selectedDonation && (
        <div className="fixed inset-0 z-50 bg-charcoal-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-cream-300 overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-forest-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package size={18} className="text-amberGold-400" />
                <h3 className="font-bold text-base text-white">Donation Listing Details</h3>
              </div>
              <button
                onClick={() => setSelectedDonation(null)}
                className="p-1.5 rounded-lg text-forest-300 hover:text-white hover:bg-forest-800"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs text-charcoal-700">
              {/* Image Preview Gallery */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {selectedDonation.images?.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt=""
                    className="w-32 h-32 rounded-2xl object-cover border border-cream-300 flex-shrink-0"
                  />
                ))}
              </div>

              <div>
                <h2 className="text-lg font-black text-charcoal-900">{selectedDonation.title}</h2>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="font-bold text-forest-700">{selectedDonation.categoryId?.name}</span>
                  <span>•</span>
                  <span>Condition: <strong>{selectedDonation.condition}</strong></span>
                  <span>•</span>
                  <span>Available Qty: <strong>{selectedDonation.availableQuantity} / {selectedDonation.quantity}</strong></span>
                  <span>•</span>
                  <span className="font-bold uppercase text-amberGold-700">
                    {selectedDonation.donationType === 'Paid' ? `₹${selectedDonation.price}` : 'FREE'}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-cream-50 border border-cream-200">
                <h4 className="font-bold text-charcoal-800 uppercase tracking-wider text-[10px] mb-1">Item Description</h4>
                <p className="leading-relaxed text-charcoal-600">{selectedDonation.description}</p>
              </div>

              {/* Location & Instructions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 rounded-xl bg-cream-50 border border-cream-200 space-y-1">
                  <span className="font-bold uppercase text-[10px] text-charcoal-400">Pickup Location</span>
                  <p className="font-semibold text-charcoal-800">
                    {selectedDonation.location?.city}, {selectedDonation.location?.state} ({selectedDonation.location?.pincode})
                  </p>
                  {selectedDonation.location?.landmark && (
                    <p className="text-[11px] text-charcoal-500">Landmark: {selectedDonation.location?.landmark}</p>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-cream-50 border border-cream-200 space-y-1">
                  <span className="font-bold uppercase text-[10px] text-charcoal-400">Donor Information</span>
                  <p className="font-bold text-charcoal-800">{selectedDonation.donorId?.name}</p>
                  <p className="text-[11px] text-charcoal-500">{selectedDonation.donorId?.email}</p>
                </div>
              </div>

              {/* Moderation Status Banner */}
              <div className="p-3.5 rounded-xl border flex items-center justify-between bg-cream-50 border-cream-200">
                <div>
                  <span className="text-[10px] uppercase font-bold text-charcoal-400">Current Moderation Status</span>
                  <p className="font-extrabold text-sm text-charcoal-900">{selectedDonation.moderationStatus || 'Approved'}</p>
                  {selectedDonation.moderationReason && (
                    <p className="text-[11px] text-rose-700 mt-0.5">Note: {selectedDonation.moderationReason}</p>
                  )}
                </div>
                <Link
                  to={`/donations/${selectedDonation._id}`}
                  target="_blank"
                  className="px-3 py-1.5 bg-white border border-cream-300 rounded-lg font-bold text-forest-700 hover:bg-cream-100 flex items-center gap-1 shadow-2xs"
                >
                  <span>Open Public Page</span>
                  <ExternalLink size={12} />
                </Link>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 border-t border-cream-200 flex items-center justify-end gap-2 bg-cream-50">
              <button
                onClick={() => setSelectedDonation(null)}
                className="px-4 py-2 rounded-xl text-charcoal-600 font-semibold hover:bg-cream-200 text-xs"
              >
                Close
              </button>
              
              {selectedDonation.moderationStatus !== 'Approved' && (
                <button
                  onClick={() => {
                    handleQuickApproveDonation(selectedDonation._id);
                    setSelectedDonation(null);
                  }}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs shadow-xs"
                >
                  Approve Listing
                </button>
              )}

              {selectedDonation.moderationStatus !== 'Rejected' && (
                <button
                  onClick={() => {
                    setModerationModal({
                      isOpen: true,
                      donation: selectedDonation,
                      targetStatus: 'Rejected',
                      reason: '',
                      loading: false
                    });
                  }}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-xs"
                >
                  Reject Listing
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. MODERATION REASON MODAL (REJECT / SUSPEND) */}
      {moderationModal.isOpen && moderationModal.donation && (
        <div className="fixed inset-0 z-50 bg-charcoal-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-cream-300 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-forest-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle size={18} className="text-amberGold-400" />
                <h3 className="font-bold text-base text-white">
                  {moderationModal.targetStatus} Donation Listing
                </h3>
              </div>
              <button
                onClick={() => setModerationModal(prev => ({ ...prev, isOpen: false }))}
                className="p-1 rounded-lg text-forest-300 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleModerateDonationSubmit} className="p-6 space-y-4">
              <div className="text-xs text-charcoal-600 space-y-1">
                <p>
                  Listing: <strong>{moderationModal.donation.title}</strong>
                </p>
                <p className="text-[11px] text-charcoal-500">
                  Please provide a clear reason so the donor understands why this listing is being {moderationModal.targetStatus.toLowerCase()}.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-charcoal-800 uppercase tracking-wider">
                  Moderation Reason <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder={`E.g., Inappropriate item photo, prohibited item category, misleading description...`}
                  value={moderationModal.reason}
                  onChange={(e) => setModerationModal(prev => ({ ...prev, reason: e.target.value }))}
                  className="w-full p-3 bg-cream-50 border border-cream-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-forest-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModerationModal(prev => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2 rounded-xl text-charcoal-600 font-semibold text-xs hover:bg-cream-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={moderationModal.loading || !moderationModal.reason.trim()}
                  className={`px-5 py-2 rounded-xl font-bold text-xs text-white shadow-xs ${
                    moderationModal.targetStatus === 'Rejected'
                      ? 'bg-rose-600 hover:bg-rose-700'
                      : 'bg-charcoal-800 hover:bg-charcoal-900'
                  }`}
                >
                  {moderationModal.loading ? 'Updating...' : `Confirm ${moderationModal.targetStatus}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. USER VERIFICATION DOCUMENT VIEWER MODAL */}
      {userDocModal.isOpen && userDocModal.user && (
        <div className="fixed inset-0 z-50 bg-charcoal-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-cream-300 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-forest-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-amberGold-400" />
                <h3 className="font-bold text-base text-white">Submitted Identity Documents</h3>
              </div>
              <button
                onClick={() => setUserDocModal({ isOpen: false, user: null })}
                className="p-1 rounded-lg text-forest-300 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs text-charcoal-700">
              <div className="flex items-center justify-between border-b border-cream-200 pb-3">
                <div>
                  <h4 className="font-bold text-sm text-charcoal-900">{userDocModal.user.name}</h4>
                  <p className="text-[11px] text-charcoal-500">{userDocModal.user.email} • {userDocModal.user.phone}</p>
                </div>
                <VerificationBadge status={userDocModal.user.verificationStatus} />
              </div>

              {/* Documents List */}
              {userDocModal.user.verificationDocuments?.length === 0 ? (
                <p className="text-center py-6 text-charcoal-400">No identity documents submitted by this member.</p>
              ) : (
                userDocModal.user.verificationDocuments?.map((doc, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-cream-50 border border-cream-200 space-y-3">
                    <div className="flex items-center justify-between font-bold text-charcoal-900">
                      <span>Doc Type: {doc.docType || 'Government ID'}</span>
                      <span className="font-mono text-charcoal-500">#{doc.docNumber || 'N/A'}</span>
                    </div>

                    {doc.fileUrl && (
                      <div className="space-y-1">
                        <img
                          src={doc.fileUrl}
                          alt="ID Document"
                          className="w-full max-h-56 rounded-xl object-contain bg-white border border-cream-300"
                        />
                        <div className="text-right">
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] text-forest-700 font-bold hover:underline inline-flex items-center gap-1"
                          >
                            <span>Open full resolution image</span>
                            <ExternalLink size={11} />
                          </a>
                        </div>
                      </div>
                    )}

                    {doc.notes && (
                      <p className="text-[11px] text-charcoal-600 bg-white p-2.5 rounded-xl border border-cream-200">
                        <strong>User Note:</strong> {doc.notes}
                      </p>
                    )}

                    {doc.adminNotes && (
                      <p className="text-[11px] text-amberGold-900 bg-amberGold-50 p-2.5 rounded-xl border border-amberGold-200">
                        <strong>Admin Review Note:</strong> {doc.adminNotes}
                      </p>
                    )}
                  </div>
                ))
              )}

              {/* Action buttons inside doc modal */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-cream-200">
                <button
                  onClick={() => setUserDocModal({ isOpen: false, user: null })}
                  className="px-4 py-2 rounded-xl text-charcoal-600 font-semibold text-xs hover:bg-cream-100"
                >
                  Close
                </button>

                {userDocModal.user.verificationStatus !== 'verified' && (
                  <button
                    onClick={() => {
                      setUserDocModal({ isOpen: false, user: null });
                      setUserActionModal({
                        isOpen: true,
                        user: userDocModal.user,
                        actionType: 'verified',
                        reason: '',
                        loading: false
                      });
                    }}
                    className="px-4 py-2 bg-emerald-700 text-white font-bold rounded-xl text-xs hover:bg-emerald-800"
                  >
                    Approve Verification
                  </button>
                )}

                {userDocModal.user.verificationStatus === 'pending' && (
                  <button
                    onClick={() => {
                      setUserDocModal({ isOpen: false, user: null });
                      setUserActionModal({
                        isOpen: true,
                        user: userDocModal.user,
                        actionType: 'reject',
                        reason: '',
                        loading: false
                      });
                    }}
                    className="px-4 py-2 bg-rose-600 text-white font-bold rounded-xl text-xs hover:bg-rose-700"
                  >
                    Reject Verification
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. USER VERIFICATION & STATUS ACTION REASON MODAL */}
      {userActionModal.isOpen && userActionModal.user && (
        <div className="fixed inset-0 z-50 bg-charcoal-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-cream-300 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-forest-900 text-white p-5 flex items-center justify-between">
              <h3 className="font-bold text-base text-white capitalize">
                {userActionModal.actionType === 'verified' && 'Approve Identity Verification'}
                {userActionModal.actionType === 'reject' && 'Reject Identity Verification'}
                {userActionModal.actionType === 'revoke' && 'Revoke Verified Status'}
                {userActionModal.actionType === 'reconsider' && 'Reconsider Verification'}
                {userActionModal.actionType === 'suspend' && 'Suspend User Account'}
                {userActionModal.actionType === 'reactivate' && 'Reactivate User Account'}
              </h3>
              <button
                onClick={() => setUserActionModal({ isOpen: false, user: null, actionType: '', reason: '', loading: false })}
                className="p-1 rounded-lg text-forest-300 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleUserActionSubmit} className="p-6 space-y-4">
              <div className="text-xs text-charcoal-600 space-y-1">
                <p>Member: <strong>{userActionModal.user.name}</strong> ({userActionModal.user.email})</p>
                <p className="text-[11px] text-charcoal-500">
                  {userActionModal.actionType === 'verified' && 'This user will be granted a verified badge and approved profile.'}
                  {userActionModal.actionType === 'reject' && 'Please state why the submitted document was rejected.'}
                  {userActionModal.actionType === 'revoke' && 'This will remove the verification badge from the user profile.'}
                  {userActionModal.actionType === 'suspend' && 'Suspended users cannot log in or make donation requests.'}
                  {userActionModal.actionType === 'reactivate' && 'Reactivating will restore account access.'}
                </p>
              </div>

              {userActionModal.actionType !== 'reactivate' && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-charcoal-800 uppercase tracking-wider">
                    {userActionModal.actionType === 'verified' ? 'Admin Approval Note (Optional)' : 'Reason / Notes'}
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide details for the audit log and notification..."
                    value={userActionModal.reason}
                    onChange={(e) => setUserActionModal(prev => ({ ...prev, reason: e.target.value }))}
                    className="w-full p-3 bg-cream-50 border border-cream-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-forest-600"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setUserActionModal({ isOpen: false, user: null, actionType: '', reason: '', loading: false })}
                  className="px-4 py-2 rounded-xl text-charcoal-600 font-semibold text-xs hover:bg-cream-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={userActionModal.loading}
                  className={`px-5 py-2 rounded-xl font-bold text-xs text-white shadow-xs ${
                    ['reject', 'revoke', 'suspend'].includes(userActionModal.actionType)
                      ? 'bg-rose-600 hover:bg-rose-700'
                      : 'bg-forest-700 hover:bg-forest-800'
                  }`}
                >
                  {userActionModal.loading ? 'Updating...' : 'Confirm Action'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. DONATION LIFECYCLE AUDIT TIMELINE MODAL */}
      {trackingModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-charcoal-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-cream-300 overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-forest-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity size={18} className="text-amberGold-400" />
                <h3 className="font-bold text-base text-white">Donation Process Lifecycle & Audit Timeline</h3>
              </div>
              <button
                onClick={() => setTrackingModal({ isOpen: false, record: null, timeline: [], loading: false })}
                className="p-1 rounded-lg text-forest-300 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-xs text-charcoal-700">
              {trackingModal.loading ? (
                <div className="text-center py-16 text-xs text-charcoal-400 flex items-center justify-center gap-2">
                  <RefreshCw size={16} className="animate-spin text-forest-600" />
                  <span>Loading chronological audit trail...</span>
                </div>
              ) : (
                <>
                  {/* Overview Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Item Card */}
                    <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200 space-y-2">
                      <span className="text-[10px] uppercase font-bold text-charcoal-400">Donation Item</span>
                      <h4 className="font-extrabold text-sm text-charcoal-900">
                        {trackingModal.record?.donationId?.title}
                      </h4>
                      <div className="text-[11px] text-charcoal-500 space-y-0.5">
                        <p>Category: <strong>{trackingModal.record?.donationId?.categoryId?.name || 'General'}</strong></p>
                        <p>Type: <strong>{trackingModal.record?.donationId?.donationType}</strong> (Agreed Price: ₹{trackingModal.record?.agreedPrice || 0})</p>
                        <p>Pickup: <strong>{trackingModal.record?.preferredPickupMethod}</strong></p>
                      </div>
                    </div>

                    {/* Parties Card */}
                    <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200 space-y-2">
                      <span className="text-[10px] uppercase font-bold text-charcoal-400">Parties Involved</span>
                      <div className="space-y-1.5 text-[11px]">
                        <div>
                          <span className="text-charcoal-400">Donor:</span>{' '}
                          <strong className="text-charcoal-800">{trackingModal.record?.donorId?.name}</strong>{' '}
                          <span className="text-charcoal-500">({trackingModal.record?.donorId?.phone || trackingModal.record?.donorId?.email})</span>
                        </div>
                        <div>
                          <span className="text-charcoal-400">Receiver:</span>{' '}
                          <strong className="text-charcoal-800">{trackingModal.record?.receiverId?.name}</strong>{' '}
                          <span className="text-charcoal-500">({trackingModal.record?.receiverId?.phone || trackingModal.record?.receiverId?.email})</span>
                        </div>
                        <div>
                          <span className="text-charcoal-400">Current Status:</span>{' '}
                          <strong className="text-forest-700">{trackingModal.record?.status}</strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Chronological Process Timeline */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-charcoal-900 flex items-center gap-1.5">
                      <Clock size={14} className="text-forest-700" />
                      <span>Chronological Milestone Audit Log ({trackingModal.timeline?.length || 0} Events)</span>
                    </h4>

                    {trackingModal.timeline?.length === 0 ? (
                      <p className="text-center py-6 text-charcoal-400">No milestone events logged for this transfer yet.</p>
                    ) : (
                      <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-cream-300">
                        {trackingModal.timeline?.map((evt, idx) => {
                          const isSuccess = ['DONATION_COMPLETED', 'OTP_VERIFIED', 'DONATION_MODERATED'].includes(evt.eventType);
                          const isWarning = ['REQUEST_REJECTED', 'REQUEST_CANCELLED'].includes(evt.eventType);

                          return (
                            <div key={idx} className="relative space-y-1">
                              {/* Node indicator */}
                              <div
                                className={`absolute -left-6 top-1 w-4 h-4 rounded-full border-2 border-white shadow-xs ${
                                  isSuccess ? 'bg-emerald-600' : isWarning ? 'bg-rose-600' : 'bg-forest-600'
                                }`}
                              />

                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                <span className="font-bold text-xs text-charcoal-900">{evt.title}</span>
                                <span className="text-[11px] text-charcoal-400 font-mono">
                                  {new Date(evt.timestamp).toLocaleString()}
                                </span>
                              </div>

                              <p className="text-xs text-charcoal-600 leading-relaxed">
                                {evt.description}
                              </p>

                              <div className="text-[10px] text-charcoal-400 flex items-center gap-2 pt-0.5">
                                <span className="capitalize px-1.5 py-0.2 rounded bg-cream-200 text-charcoal-600 font-semibold">
                                  Role: {evt.actorRole}
                                </span>
                                {evt.actorId?.name && (
                                  <span>Actor: <strong>{evt.actorId.name}</strong></span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="p-4 border-t border-cream-200 flex justify-end bg-cream-50">
              <button
                onClick={() => setTrackingModal({ isOpen: false, record: null, timeline: [], loading: false })}
                className="px-5 py-2 rounded-xl bg-forest-700 text-white font-bold text-xs hover:bg-forest-800"
              >
                Close Audit Timeline
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
