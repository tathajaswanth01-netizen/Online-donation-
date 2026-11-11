import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  Heart,
  Share2,
  AlertTriangle,
  ShieldCheck,
  Package,
  Layers,
  ChevronLeft,
  CheckCircle2,
  Clock,
  Info,
  PhoneCall,
  UserCheck
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import VerificationBadge from '../components/VerificationBadge';
import RequestModal from '../components/RequestModal';
import ReportModal from '../components/ReportModal';
import DonationCard from '../components/DonationCard';
import toast from 'react-hot-toast';

const DonationDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { isSaved, toggleWishlist } = useWishlist();

  const [donation, setDonation] = useState(null);
  const [similarDonations, setSimilarDonations] = useState([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const fetchDonation = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/donations/${id}`);
      if (res.data.success) {
        setDonation(res.data.donation);
        setSimilarDonations(res.data.similarDonations || []);
        setActiveImageIndex(0);
      }
    } catch (err) {
      toast.error('Donation listing not found.');
      navigate('/donations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonation();
    window.scrollTo(0, 0);
  }, [id]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Listing link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3 bg-cream-100">
        <div className="w-10 h-10 border-4 border-forest-200 border-t-forest-700 rounded-full animate-spin" />
        <p className="text-xs text-charcoal-500 font-medium">Loading donation details...</p>
      </div>
    );
  }

  if (!donation) return null;

  const isOwner = isAuthenticated && (donation.donorId?._id === user?._id || donation.donorId === user?._id);
  const isPaid = donation.donationType === 'Paid';
  const isAvailable = donation.status === 'Available';
  const saved = isSaved(donation._id);

  const images = donation.images && donation.images.length > 0
    ? donation.images
    : ['https://images.unsplash.com/photo-1532629345422-7515f3d16bb7?auto=format&fit=crop&w=800&q=80'];

  return (
    <div className="bg-cream-100 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/donations"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-charcoal-600 hover:text-forest-700 transition-colors"
          >
            <ChevronLeft size={16} />
            <span>Back to Browse Donations</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 rounded-xl bg-white border border-cream-300 text-charcoal-600 hover:text-forest-700 hover:bg-cream-50 transition-colors shadow-sm text-xs font-medium inline-flex items-center gap-1.5"
              title="Share listing"
            >
              <Share2 size={15} />
              <span className="hidden sm:inline">Share</span>
            </button>

            <button
              onClick={() => setIsReportModalOpen(true)}
              className="p-2 rounded-xl bg-white border border-cream-300 text-charcoal-600 hover:text-rose-600 hover:bg-rose-50 transition-colors shadow-sm text-xs font-medium inline-flex items-center gap-1.5"
              title="Report listing"
            >
              <AlertTriangle size={15} />
              <span className="hidden sm:inline">Report</span>
            </button>
          </div>
        </div>

        {/* Main Details Card */}
        <div className="bg-white rounded-3xl border border-cream-300 shadow-sm overflow-hidden p-6 sm:p-8 lg:p-10 mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Left: Product Images Gallery */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* Main Active Image */}
              <div className="relative aspect-[4/3] bg-cream-200 rounded-2xl overflow-hidden border border-cream-300 shadow-inner">
                <img
                  src={images[activeImageIndex]}
                  alt={donation.title}
                  className="w-full h-full object-cover"
                />

                {/* Free or Paid Badge */}
                <div className="absolute top-4 left-4">
                  {isPaid ? (
                    <span className="px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-amberGold-400 text-white shadow-md">
                      Subsidized: ₹{donation.price?.toLocaleString()}
                    </span>
                  ) : (
                    <span className="px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-forest-700 text-white shadow-md">
                      FREE Resource
                    </span>
                  )}
                </div>

                {/* Wishlist Floating Button */}
                <button
                  onClick={() => toggleWishlist(donation._id)}
                  className={`absolute top-4 right-4 p-2.5 rounded-full backdrop-blur-md shadow-md transition-all ${
                    saved
                      ? 'bg-rose-500 text-white'
                      : 'bg-white/80 text-charcoal-700 hover:bg-white hover:text-rose-500'
                  }`}
                  title={saved ? 'Remove from saved' : 'Save to wishlist'}
                >
                  <Heart size={18} className={saved ? 'fill-white' : ''} />
                </button>

                {/* Availability status overlay */}
                {!isAvailable && (
                  <div className="absolute inset-0 bg-charcoal-950/40 backdrop-blur-xs flex items-center justify-center">
                    <span className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-white text-charcoal-900 shadow-lg">
                      {donation.status}
                    </span>
                  </div>
                )}
              </div>

              {/* Thumbnails Row */}
              {images.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-1">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                        activeImageIndex === idx
                          ? 'border-forest-700 ring-2 ring-forest-100 shadow-sm'
                          : 'border-cream-300 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

            </div>

            {/* Right: Item Metadata & Actions */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
              
              <div className="space-y-4">
                
                {/* Category & Condition Tags */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-semibold text-forest-800 bg-forest-50 px-2.5 py-1 rounded-md border border-forest-200">
                    {donation.categoryId?.name}
                  </span>
                  <span className="font-semibold text-charcoal-700 bg-cream-100 px-2.5 py-1 rounded-md border border-cream-300">
                    Condition: {donation.condition}
                  </span>
                  <span className="font-semibold text-charcoal-700 bg-cream-100 px-2.5 py-1 rounded-md border border-cream-300">
                    Qty: {donation.availableQuantity} of {donation.quantity}
                  </span>
                </div>

                {/* Title */}
                <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 leading-tight">
                  {donation.title}
                </h1>

                {/* Price Display */}
                <div className="p-4 bg-cream-50 rounded-2xl border border-cream-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-charcoal-500 block">Transfer Type</span>
                    <span className="text-sm font-bold text-charcoal-800">
                      {isPaid ? 'Subsidized Resource' : '100% Free Donation'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-charcoal-500 block">Required Contribution</span>
                    <span className="text-xl font-extrabold text-forest-800">
                      {isPaid ? `₹${donation.price?.toLocaleString()}` : 'FREE (₹0)'}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1.5">
                    Item Description
                  </h4>
                  <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed whitespace-pre-line">
                    {donation.description}
                  </p>
                </div>

                {/* Additional Instructions */}
                {donation.additionalInstructions && (
                  <div className="p-3 bg-amberGold-50/60 rounded-xl border border-amberGold-200/70 text-xs text-amberGold-800">
                    <strong className="block mb-0.5">Donor's Pickup Note:</strong>
                    <span>{donation.additionalInstructions}</span>
                  </div>
                )}

                {/* Location & Contact Preference */}
                <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                  <div className="p-3 bg-cream-100/60 rounded-xl border border-cream-300">
                    <span className="text-charcoal-400 block mb-0.5">Approx. Pickup Location</span>
                    <span className="font-semibold text-charcoal-800 flex items-center gap-1">
                      <MapPin size={13} className="text-forest-600 flex-shrink-0" />
                      {donation.location?.city}, {donation.location?.state}
                    </span>
                    <span className="text-[11px] text-charcoal-500 block mt-0.5">
                      PIN: {donation.location?.pincode}
                    </span>
                  </div>

                  <div className="p-3 bg-cream-100/60 rounded-xl border border-cream-300">
                    <span className="text-charcoal-400 block mb-0.5">Preferred Contact</span>
                    <span className="font-semibold text-charcoal-800">
                      {donation.contactPreference || 'Platform Chat'}
                    </span>
                    <span className="text-[11px] text-charcoal-500 block mt-0.5">
                      Listed: {new Date(donation.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-4 border-t border-cream-200">
                {isOwner ? (
                  <div className="space-y-2">
                    <Link
                      to={`/edit-donation/${donation._id}`}
                      className="w-full text-center py-3.5 rounded-xl text-xs font-bold text-forest-800 bg-forest-100 hover:bg-forest-200 transition-colors block"
                    >
                      Edit This Listing
                    </Link>
                    <p className="text-[11px] text-charcoal-500 text-center">
                      You are the author of this listing. Manage requests from your Donor Dashboard.
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsRequestModalOpen(true)}
                    disabled={!isAvailable}
                    className={`w-full py-4 rounded-xl text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 ${
                      isAvailable
                        ? 'text-white bg-forest-700 hover:bg-forest-800 shadow-forest-900/10'
                        : 'text-charcoal-400 bg-cream-300 cursor-not-allowed'
                    }`}
                  >
                    <span>{isAvailable ? 'Request This Item' : `Listing ${donation.status}`}</span>
                  </button>
                )}

                {/* Anti-misuse disclaimer */}
                <div className="flex items-center gap-1.5 text-[11px] text-charcoal-500 justify-center text-center">
                  <ShieldCheck size={14} className="text-forest-600 flex-shrink-0" />
                  <span>Subject to anti-resale policy. Not for commercial gain.</span>
                </div>
              </div>

            </div>

          </div>

          {/* Donor Information Card */}
          <div className="mt-10 pt-8 border-t border-cream-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {donation.donorId?.profileImage ? (
                <img
                  src={donation.donorId.profileImage}
                  alt={donation.donorId.name}
                  className="w-14 h-14 rounded-2xl object-cover border border-cream-300"
                />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-forest-100 text-forest-700 flex items-center justify-center font-bold text-lg">
                  {donation.donorId?.name?.charAt(0) || 'D'}
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-charcoal-900">
                    {donation.donorId?.name || 'Community Donor'}
                  </h3>
                  <VerificationBadge status={donation.donorId?.verificationStatus} size="sm" />
                </div>
                <p className="text-xs text-charcoal-500 mt-0.5">
                  Member since {new Date(donation.donorId?.createdAt || Date.now()).toLocaleDateString([], { month: 'short', year: 'numeric' })} • {donation.donorId?.address?.city || 'Local area'}
                </p>
                <p className="text-xs text-charcoal-600 mt-1 max-w-lg italic">
                  "{donation.donorId?.bio || 'Dedicated community donor sharing useful resources.'}"
                </p>
              </div>
            </div>

            <div className="text-xs text-charcoal-400 flex items-center gap-1.5">
              <Info size={14} />
              <span>Exact address & contact shared only after request approval.</span>
            </div>
          </div>

        </div>

        {/* Similar Donations Section */}
        {similarDonations.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-forest-700">Explore Related</span>
                <h3 className="text-xl font-bold text-charcoal-900 mt-0.5">
                  Similar Items in {donation.categoryId?.name}
                </h3>
              </div>
              <Link
                to={`/donations?category=${donation.categoryId?._id}`}
                className="text-xs font-bold text-forest-700 hover:text-forest-800"
              >
                View more
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarDonations.map((sim) => (
                <DonationCard
                  key={sim._id}
                  donation={sim}
                  onRequestClick={() => {
                    setDonation(sim);
                    setIsRequestModalOpen(true);
                  }}
                />
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Request Modal */}
      <RequestModal
        donation={donation}
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        onSuccess={() => {
          fetchDonation();
        }}
      />

      {/* Report Modal */}
      <ReportModal
        donation={donation}
        userToReport={donation.donorId}
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />

    </div>
  );
};

export default DonationDetailsPage;
