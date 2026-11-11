import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Heart, ShieldCheck, Tag } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import VerificationBadge from './VerificationBadge';

const DonationCard = ({ donation, onRequestClick }) => {
  const { isSaved, toggleWishlist } = useWishlist();

  if (!donation) return null;

  const saved = isSaved(donation._id);
  const isPaid = donation.donationType === 'Paid';
  const isAvailable = donation.status === 'Available';

  const conditionColors = {
    'New': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Like New': 'bg-teal-50 text-teal-700 border-teal-200',
    'Good': 'bg-blue-50 text-blue-700 border-blue-200',
    'Usable': 'bg-amber-50 text-amber-700 border-amber-200'
  };

  const imageSrc = donation.images && donation.images.length > 0
    ? donation.images[0]
    : 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb7?auto=format&fit=crop&w=600&q=80';

  return (
    <div className="bg-white rounded-2xl border border-cream-300 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group card-hover">
      
      {/* Card Image Container */}
      <div className="relative aspect-[4/3] bg-cream-200 overflow-hidden">
        <img
          src={imageSrc}
          alt={donation.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(donation._id);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all shadow-sm ${
            saved
              ? 'bg-rose-500 text-white'
              : 'bg-white/80 text-charcoal-700 hover:bg-white hover:text-rose-500'
          }`}
          title={saved ? 'Remove from saved' : 'Save to wishlist'}
        >
          <Heart size={16} className={saved ? 'fill-white' : ''} />
        </button>

        {/* Free or Paid Badge */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 items-start">
          {isPaid ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amberGold-400 text-white shadow-sm">
              ₹{donation.price?.toLocaleString()}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-forest-700 text-white shadow-sm">
              FREE
            </span>
          )}
          
          {/* Status badge if not available */}
          {!isAvailable && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-charcoal-800/80 text-white backdrop-blur-sm">
              {donation.status}
            </span>
          )}
        </div>

        {/* Condition tag */}
        <div className="absolute bottom-3 left-3">
          <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border backdrop-blur-md ${conditionColors[donation.condition] || 'bg-cream-100 text-charcoal-700'}`}>
            {donation.condition}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col">
        
        {/* Category & Date */}
        <div className="flex items-center justify-between text-xs text-charcoal-400 mb-1.5">
          <span className="font-medium text-forest-700">
            {donation.categoryId?.name || 'General Item'}
          </span>
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            {new Date(donation.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
          </span>
        </div>

        {/* Title */}
        <Link to={`/donations/${donation._id}`}>
          <h3 className="font-bold text-charcoal-900 text-base leading-snug line-clamp-1 group-hover:text-forest-700 transition-colors">
            {donation.title}
          </h3>
        </Link>

        {/* Short Description */}
        <p className="text-xs text-charcoal-500 mt-1 line-clamp-2 leading-relaxed flex-1">
          {donation.description}
        </p>

        {/* Donor & Location Footer */}
        <div className="mt-4 pt-3 border-t border-cream-200 flex items-center justify-between gap-2 text-xs">
          
          {/* Location */}
          <div className="flex items-center gap-1 text-charcoal-600 truncate max-w-[55%]">
            <MapPin size={13} className="text-forest-600 flex-shrink-0" />
            <span className="truncate">
              {donation.location?.city || 'Local area'}, {donation.location?.state || ''}
            </span>
          </div>

          {/* Donor badge */}
          <div className="flex items-center gap-1 text-charcoal-700 flex-shrink-0">
            <span className="text-[11px] font-medium max-w-[85px] truncate">
              {donation.donorId?.name || 'Donor'}
            </span>
            <VerificationBadge status={donation.donorId?.verificationStatus} size="sm" showLabel={false} />
          </div>

        </div>

        {/* Action Buttons */}
        <div className="mt-3.5 grid grid-cols-2 gap-2">
          <Link
            to={`/donations/${donation._id}`}
            className="w-full text-center py-2 px-3 rounded-lg text-xs font-semibold text-forest-700 bg-forest-50 hover:bg-forest-100 transition-colors"
          >
            View Details
          </Link>

          <button
            onClick={() => onRequestClick ? onRequestClick(donation) : null}
            disabled={!isAvailable}
            className={`w-full py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
              isAvailable
                ? 'text-white bg-forest-700 hover:bg-forest-800 shadow-sm'
                : 'text-charcoal-400 bg-cream-300 cursor-not-allowed'
            }`}
          >
            {isAvailable ? 'Request Item' : donation.status}
          </button>
        </div>

      </div>

    </div>
  );
};

export default DonationCard;
