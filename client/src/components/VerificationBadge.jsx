import React from 'react';
import { ShieldCheck, Clock, AlertCircle, XCircle } from 'lucide-react';

const VerificationBadge = ({ status = 'unsubmitted', size = 'sm', showLabel = true }) => {
  const iconSize = size === 'lg' ? 18 : size === 'md' ? 16 : 14;

  if (status === 'verified') {
    return (
      <span
        title="Verified Genuine Identity"
        className={`inline-flex items-center gap-1 font-medium text-forest-700 bg-forest-50 border border-forest-200 rounded-full ${
          size === 'lg' ? 'px-3 py-1 text-xs' : 'px-2 py-0.5 text-[11px]'
        }`}
      >
        <ShieldCheck size={iconSize} className="text-forest-600 fill-forest-100" />
        {showLabel && <span>Verified</span>}
      </span>
    );
  }

  if (status === 'pending') {
    return (
      <span
        title="Verification Under Review"
        className={`inline-flex items-center gap-1 font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-full ${
          size === 'lg' ? 'px-3 py-1 text-xs' : 'px-2 py-0.5 text-[11px]'
        }`}
      >
        <Clock size={iconSize} className="text-amber-600" />
        {showLabel && <span>Pending Review</span>}
      </span>
    );
  }

  if (status === 'rejected') {
    return (
      <span
        title="Verification Documents Rejected"
        className={`inline-flex items-center gap-1 font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-full ${
          size === 'lg' ? 'px-3 py-1 text-xs' : 'px-2 py-0.5 text-[11px]'
        }`}
      >
        <XCircle size={iconSize} className="text-rose-500" />
        {showLabel && <span>Verification Rejected</span>}
      </span>
    );
  }

  return (
    <span
      title="Unverified Account"
      className={`inline-flex items-center gap-1 font-medium text-charcoal-500 bg-charcoal-100 border border-charcoal-200 rounded-full ${
        size === 'lg' ? 'px-3 py-1 text-xs' : 'px-2 py-0.5 text-[11px]'
      }`}
    >
      <AlertCircle size={iconSize} className="text-charcoal-400" />
      {showLabel && <span>Unverified</span>}
    </span>
  );
};

export default VerificationBadge;
