import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="bg-cream-100 min-h-[75vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-4">
        <span className="text-6xl font-black text-forest-700 block">404</span>
        <h2 className="text-2xl font-bold text-charcoal-900">Page Not Found</h2>
        <p className="text-xs text-charcoal-500">
          The page or donation listing you are looking for may have been removed or is temporarily unavailable.
        </p>
        <div className="pt-2 flex items-center justify-center gap-3">
          <Link
            to="/"
            className="px-5 py-2.5 bg-forest-700 hover:bg-forest-800 text-white rounded-xl text-xs font-semibold shadow-sm inline-flex items-center gap-1.5"
          >
            <Home size={14} />
            <span>Go to Homepage</span>
          </Link>
          <Link
            to="/donations"
            className="px-5 py-2.5 bg-white border border-cream-300 text-charcoal-700 rounded-xl text-xs font-semibold hover:bg-cream-200"
          >
            Browse Donations
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
