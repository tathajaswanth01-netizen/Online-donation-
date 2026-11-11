import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Trash2, AlertCircle } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const EditDonationPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [condition, setCondition] = useState('Good');
  const [quantity, setQuantity] = useState(1);
  const [donationType, setDonationType] = useState('Free');
  const [price, setPrice] = useState(0);
  const [status, setStatus] = useState('Available');
  
  // Location
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [landmark, setLandmark] = useState('');

  const [contactPreference, setContactPreference] = useState('Platform Chat');
  const [additionalInstructions, setAdditionalInstructions] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [catRes, donRes] = await Promise.all([
          api.get('/categories'),
          api.get(`/donations/${id}`)
        ]);

        if (catRes.data.success) {
          setCategories(catRes.data.categories || []);
        }

        if (donRes.data.success) {
          const d = donRes.data.donation;
          setTitle(d.title);
          setDescription(d.description);
          setCategoryId(d.categoryId?._id || d.categoryId);
          setCondition(d.condition);
          setQuantity(d.quantity);
          setDonationType(d.donationType);
          setPrice(d.price || 0);
          setStatus(d.status);
          setCity(d.location?.city || '');
          setState(d.location?.state || '');
          setPincode(d.location?.pincode || '');
          setLandmark(d.location?.landmark || '');
          setContactPreference(d.contactPreference || 'Platform Chat');
          setAdditionalInstructions(d.additionalInstructions || '');
        }
      } catch (err) {
        toast.error('Could not load donation listing.');
        navigate('/donor-dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await api.put(`/donations/${id}`, {
        title,
        description,
        categoryId,
        condition,
        quantity,
        donationType,
        price: donationType === 'Paid' ? price : 0,
        status,
        location: {
          city,
          state,
          pincode,
          landmark
        },
        contactPreference,
        additionalInstructions
      });

      if (res.data.success) {
        toast.success('Donation listing updated successfully!');
        navigate(`/donations/${id}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this donation listing? This action cannot be undone.')) {
      return;
    }
    try {
      const res = await api.delete(`/donations/${id}`);
      if (res.data.success) {
        toast.success('Donation listing deleted.');
        navigate('/donor-dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete donation listing.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-cream-100">
        <div className="w-8 h-8 border-4 border-forest-200 border-t-forest-700 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-cream-100 min-h-screen py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-charcoal-600 hover:text-forest-700"
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>

          <button
            onClick={handleDelete}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200"
          >
            <Trash2 size={14} />
            <span>Delete Listing</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-cream-300 p-6 sm:p-8 space-y-6 shadow-sm">
          <h2 className="text-xl font-bold text-charcoal-900 pb-3 border-b border-cream-200">
            Edit Donation Details
          </h2>

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1">
              Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-cream-50 border border-cream-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 bg-cream-50 border border-cream-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600"
              >
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1">
                Condition
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full px-3 py-2 bg-cream-50 border border-cream-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600"
              >
                <option value="New">New</option>
                <option value="Like New">Like New</option>
                <option value="Good">Good</option>
                <option value="Usable">Usable</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1">
              Description
            </label>
            <textarea
              rows="4"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-cream-50 border border-cream-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1">
                Quantity
              </label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 bg-cream-50 border border-cream-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1">
                Donation Type
              </label>
              <select
                value={donationType}
                onChange={(e) => setDonationType(e.target.value)}
                className="w-full px-3 py-2 bg-cream-50 border border-cream-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600"
              >
                <option value="Free">Free</option>
                <option value="Paid">Paid</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1">
                Listing Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 bg-cream-50 border border-cream-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600"
              >
                <option value="Available">Available</option>
                <option value="Unavailable">Unavailable</option>
                <option value="Reserved">Reserved</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          {donationType === 'Paid' && (
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1">
                Price (₹)
              </label>
              <input
                type="number"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full sm:w-1/3 px-3 py-2 bg-cream-50 border border-cream-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600"
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 bg-cream-50 border border-cream-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1">State</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-3 py-2 bg-cream-50 border border-cream-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1">PIN Code</label>
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="w-full px-3 py-2 bg-cream-50 border border-cream-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1">
              Handover Instructions
            </label>
            <input
              type="text"
              value={additionalInstructions}
              onChange={(e) => setAdditionalInstructions(e.target.value)}
              className="w-full px-3 py-2 bg-cream-50 border border-cream-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-cream-200">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 text-xs font-semibold text-charcoal-600 hover:bg-cream-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-forest-700 hover:bg-forest-800 shadow-sm flex items-center gap-1.5"
            >
              <Save size={14} />
              <span>{submitting ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default EditDonationPage;
