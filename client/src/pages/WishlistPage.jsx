import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowRight, PackageOpen } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import DonationCard from '../components/DonationCard';

const WishlistPage = () => {
  const { wishlist, refreshWishlist } = useWishlist();

  useEffect(() => {
    refreshWishlist();
  }, []);

  return (
    <div className="bg-cream-100 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-xs font-semibold">
              <Heart size={14} className="fill-rose-500 text-rose-500" />
              <span>Saved Items</span>
            </div>
            <h1 className="text-3xl font-extrabold text-charcoal-900 mt-1">
              My Saved Donations
            </h1>
            <p className="text-xs text-charcoal-500 mt-0.5">
              Keep track of items you are interested in requesting. Status tags show live availability.
            </p>
          </div>

          <Link
            to="/donations"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-cream-300 rounded-xl text-xs font-semibold text-charcoal-700 hover:bg-cream-50"
          >
            <span>Explore More</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Content */}
        {wishlist.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 border border-cream-300 shadow-sm text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
              <Heart size={32} />
            </div>
            <h3 className="text-lg font-bold text-charcoal-900">Your wishlist is currently empty</h3>
            <p className="text-xs text-charcoal-500 max-w-sm mx-auto">
              Tap the heart icon on any donation card while browsing to save it here for easy reference.
            </p>
            <Link
              to="/donations"
              className="inline-block px-6 py-2.5 bg-forest-700 hover:bg-forest-800 text-white font-semibold text-xs rounded-xl shadow-sm"
            >
              Browse Donations
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
    </div>
  );
};

export default WishlistPage;
