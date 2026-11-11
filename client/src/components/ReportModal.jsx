import React, { useState } from 'react';
import { X, AlertTriangle, Shield } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ReportModal = ({ donation, userToReport, isOpen, onClose, onSuccess }) => {
  const { isAuthenticated } = useAuth();
  const [reason, setReason] = useState('Suspected Resale for Profit');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Please log in to report suspicious listings or members.');
      return;
    }

    if (!description.trim()) {
      toast.error('Please describe what happened or why you are reporting this.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/reports', {
        donationId: donation?._id,
        reportedUserId: userToReport?._id || donation?.donorId?._id || donation?.donorId,
        reason,
        description
      });

      if (res.data.success) {
        toast.success(res.data.message);
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit report.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-cream-300 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-rose-50/70 border-b border-rose-100">
          <div className="flex items-center gap-2 text-rose-800">
            <AlertTriangle size={20} />
            <h3 className="font-bold text-sm">Report Suspicious Activity</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-charcoal-400 hover:text-charcoal-700 hover:bg-white"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <p className="text-xs text-charcoal-600 leading-relaxed">
            Help us protect our community. If you suspect commercial resale, deceptive descriptions, fraud, or misuse, our trust & moderation team will investigate.
          </p>

          {donation && (
            <div className="p-2.5 bg-cream-100 rounded-lg text-xs">
              <span className="text-charcoal-500">Reporting item: </span>
              <strong className="text-charcoal-800">{donation.title}</strong>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
              Reason for Report
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-cream-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 bg-cream-50"
            >
              <option value="Suspected Resale for Profit">Suspected Resale for Profit</option>
              <option value="Misleading Description / Condition">Misleading Description / Condition</option>
              <option value="Commercial Seller masquerading as Donor">Commercial Seller masquerading as Donor</option>
              <option value="Inappropriate or Prohibited Item">Inappropriate or Prohibited Item</option>
              <option value="Harassment or Fraud">Harassment or Fraud</option>
              <option value="No-Show / Unresponsive Handover">No-Show / Unresponsive Handover</option>
              <option value="Other Violation">Other Violation</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
              Provide Context & Details <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows="3"
              placeholder="Explain why you suspect misuse or list any relevant observations..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-cream-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 bg-cream-50 placeholder:text-charcoal-400"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-charcoal-600 hover:bg-cream-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition-all"
            >
              {submitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default ReportModal;
