import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  X,
  Plus,
  Info,
  Gift,
  ShieldCheck,
  CheckCircle2,
  DollarSign
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const DonateItemPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [condition, setCondition] = useState('Good');
  const [quantity, setQuantity] = useState(1);
  const [donationType, setDonationType] = useState('Free');
  const [price, setPrice] = useState('');
  
  // Location
  const [street, setStreet] = useState(user?.address?.street || '');
  const [city, setCity] = useState(user?.address?.city || '');
  const [state, setState] = useState(user?.address?.state || '');
  const [pincode, setPincode] = useState(user?.address?.pincode || '');
  const [landmark, setLandmark] = useState('');

  const [contactPreference, setContactPreference] = useState('Platform Chat');
  const [availabilityDate, setAvailabilityDate] = useState(new Date().toISOString().split('T')[0]);
  const [additionalInstructions, setAdditionalInstructions] = useState('');
  const [termsAgreed, setTermsAgreed] = useState(false);

  // Images
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [extraImageUrls, setExtraImageUrls] = useState([]);

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await api.get('/categories');
        if (res.data.success) {
          setCategories(res.data.categories || []);
          if (res.data.categories?.length > 0) {
            setCategoryId(res.data.categories[0]._id);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingCats(false);
      }
    };
    loadCategories();
  }, []);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + selectedFiles.length + extraImageUrls.length > 6) {
      toast.error('You can upload a maximum of 6 images.');
      return;
    }

    const newFiles = [...selectedFiles, ...files];
    setSelectedFiles(newFiles);

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...newPreviews]);
  };

  const removeFile = (index) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);

    const newPreviews = [...previewUrls];
    newPreviews.splice(index, 1);
    setPreviewUrls(newPreviews);
  };

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    if (selectedFiles.length + extraImageUrls.length >= 6) {
      toast.error('Maximum of 6 images allowed.');
      return;
    }
    setExtraImageUrls([...extraImageUrls, imageUrlInput.trim()]);
    setImageUrlInput('');
  };

  const removeImageUrl = (index) => {
    const newUrls = [...extraImageUrls];
    newUrls.splice(index, 1);
    setExtraImageUrls(newUrls);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Please log in to publish a donation.');
      navigate('/login');
      return;
    }

    if (!title.trim() || !description.trim()) {
      toast.error('Please fill in title and description.');
      return;
    }

    if (!categoryId) {
      toast.error('Please select a category.');
      return;
    }

    if (!city.trim() || !pincode.trim() || !state.trim()) {
      toast.error('Please provide city, state, and pincode.');
      return;
    }

    if (donationType === 'Paid' && (!price || parseFloat(price) <= 0)) {
      toast.error('Please provide a valid price for a paid donation.');
      return;
    }

    if (selectedFiles.length === 0 && extraImageUrls.length === 0) {
      toast.error('Please upload or provide at least one photo of the item.');
      return;
    }

    if (!termsAgreed) {
      toast.error('Please accept the platform donation guidelines.');
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('categoryId', categoryId);
      formData.append('condition', condition);
      formData.append('quantity', quantity);
      formData.append('donationType', donationType);
      formData.append('price', donationType === 'Paid' ? price : 0);
      formData.append('contactPreference', contactPreference);
      formData.append('availabilityDate', availabilityDate);
      formData.append('additionalInstructions', additionalInstructions);

      const locationObj = {
        street,
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        landmark: landmark.trim()
      };
      formData.append('location', JSON.stringify(locationObj));

      if (extraImageUrls.length > 0) {
        formData.append('imageUrls', JSON.stringify(extraImageUrls));
      }

      selectedFiles.forEach((file) => {
        formData.append('images', file);
      });

      const res = await api.post('/donations', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        toast.success('Your donation listing is now live for community requests!');
        navigate(`/donations/${res.data.donation._id}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to list donation. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-cream-100 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-100 text-forest-800 text-xs font-semibold">
            <Gift size={14} />
            <span>Community Resource Transfer</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-charcoal-900 tracking-tight">
            Donate an Unused Resource
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-600">
            Fill in the details below to offer books, clothes, electronics, furniture, or groceries to someone who genuinely needs them.
          </p>
        </div>

        {/* Donation Form Card */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-cream-300 shadow-sm p-6 sm:p-10 space-y-8">
          
          {/* Section 1: Item Basic Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-forest-800 pb-2 border-b border-cream-200">
              1. Basic Information
            </h3>

            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                Item Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={150}
                placeholder="e.g. Complete NCERT Class 11 Science Books Set or Lenovo 14-inch Laptop"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 text-charcoal-800"
              />
            </div>

            {/* Category & Condition */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                  Category <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 text-charcoal-800"
                >
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                  Condition <span className="text-rose-500">*</span>
                </label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 text-charcoal-800"
                >
                  <option value="New">New (Unopened / Unused)</option>
                  <option value="Like New">Like New (Barely used, mint shape)</option>
                  <option value="Good">Good (Working fine, minor signs of use)</option>
                  <option value="Usable">Usable (Functional with noticeable wear)</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                Full Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows="4"
                maxLength={3000}
                placeholder="Describe the item's history, dimensions, specifications, compatibility, and who could benefit most..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 text-charcoal-800 placeholder:text-charcoal-400"
              />
            </div>

            {/* Quantity */}
            <div className="w-full sm:w-1/3">
              <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                Quantity Available <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 text-charcoal-800"
              />
            </div>
          </div>

          {/* Section 2: Photos */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-forest-800 pb-2 border-b border-cream-200">
              2. Product Photos (Up to 6)
            </h3>

            {/* File Upload Area */}
            <div className="border-2 border-dashed border-cream-300 hover:border-forest-400 rounded-2xl p-6 text-center bg-cream-50/50 transition-colors">
              <UploadCloud size={36} className="mx-auto text-forest-600 mb-2" />
              <p className="text-xs font-semibold text-charcoal-800">
                Click to browse images or drag and drop
              </p>
              <p className="text-[11px] text-charcoal-400 mt-0.5">
                PNG, JPG, WEBP up to 5MB each
              </p>
              <input
                type="file"
                multiple
                accept="image/png, image/jpeg, image/webp"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="mt-3 inline-block px-4 py-2 bg-white border border-cream-300 hover:bg-cream-100 rounded-lg text-xs font-semibold text-charcoal-700 cursor-pointer shadow-sm"
              >
                Select Files
              </label>
            </div>

            {/* Or Add Image URL */}
            <div className="flex items-center gap-2">
              <input
                type="url"
                placeholder="Or paste an image web link (Unsplash, etc.)..."
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                className="flex-1 px-3.5 py-2 bg-cream-50 border border-cream-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-forest-600"
              />
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="px-4 py-2 bg-cream-200 hover:bg-cream-300 text-charcoal-800 rounded-xl text-xs font-semibold"
              >
                Add Link
              </button>
            </div>

            {/* Image Previews */}
            {(previewUrls.length > 0 || extraImageUrls.length > 0) && (
              <div className="flex flex-wrap gap-3 pt-2">
                {previewUrls.map((url, idx) => (
                  <div key={idx} className="relative w-24 h-24 rounded-xl overflow-hidden border border-cream-300 group">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="absolute top-1 right-1 p-1 bg-charcoal-900/80 hover:bg-rose-600 text-white rounded-full transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}

                {extraImageUrls.map((url, idx) => (
                  <div key={idx} className="relative w-24 h-24 rounded-xl overflow-hidden border border-cream-300 group">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImageUrl(idx)}
                      className="absolute top-1 right-1 p-1 bg-charcoal-900/80 hover:bg-rose-600 text-white rounded-full transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 3: Donation Type (Free vs Paid) */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-forest-800 pb-2 border-b border-cream-200">
              3. Donation Type & Valuation
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Free Option */}
              <div
                onClick={() => setDonationType('Free')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  donationType === 'Free'
                    ? 'border-forest-700 bg-forest-50/50 shadow-sm'
                    : 'border-cream-300 bg-cream-50 hover:bg-cream-100/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-bold text-sm text-forest-900">100% Free Donation</h4>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-forest-700 text-white">
                    FREE
                  </span>
                </div>
                <p className="text-xs text-charcoal-600 leading-relaxed">
                  Provide this item completely free of charge to help someone without any financial requirement.
                </p>
              </div>

              {/* Paid Option */}
              <div
                onClick={() => setDonationType('Paid')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  donationType === 'Paid'
                    ? 'border-amberGold-500 bg-amberGold-50/50 shadow-sm'
                    : 'border-cream-300 bg-cream-50 hover:bg-cream-100/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-bold text-sm text-charcoal-900">Subsidized Paid Transfer</h4>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amberGold-400 text-white">
                    PAID
                  </span>
                </div>
                <p className="text-xs text-charcoal-600 leading-relaxed">
                  Specify a nominal, reasonable amount to recover basic refurbishing or subsidized item value.
                </p>
              </div>

            </div>

            {/* If Paid, show price input */}
            {donationType === 'Paid' && (
              <div className="p-4 bg-amberGold-50 rounded-2xl border border-amberGold-200 space-y-2">
                <label className="block text-xs font-semibold text-charcoal-800 uppercase tracking-wider">
                  Requested Amount (in ₹) <span className="text-rose-500">*</span>
                </label>
                <div className="relative w-full sm:w-1/2">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-charcoal-500">₹</span>
                  <input
                    type="number"
                    min="1"
                    required={donationType === 'Paid'}
                    placeholder="e.g. 500"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 bg-white border border-amberGold-300 rounded-xl text-sm font-bold text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-amberGold-400"
                  />
                </div>
                <p className="text-[11px] text-amberGold-800">
                  Transparency Notice: Paid listings are treated as explicitly priced resource transfers rather than pure charitable gifts. No hidden charges are permitted.
                </p>
              </div>
            )}
          </div>

          {/* Section 4: Location & Handover Coordination */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-forest-800 pb-2 border-b border-cream-200">
              4. Location & Handover Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                  City <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mumbai"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                  State <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maharashtra"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                  PIN Code <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 400050"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                  Area / Neighborhood / Landmark
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bandra West, Near Railway Station"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                  Preferred Contact Method
                </label>
                <select
                  value={contactPreference}
                  onChange={(e) => setContactPreference(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600"
                >
                  <option value="Platform Chat">Platform Chat (Privacy protected)</option>
                  <option value="Phone Call">Phone Call</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Email">Email</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                Additional Instructions for Handover
              </label>
              <input
                type="text"
                placeholder="e.g. Available on weekday evenings after 6 PM. Please bring your own carry bag."
                value={additionalInstructions}
                onChange={(e) => setAdditionalInstructions(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600"
              />
            </div>
          </div>

          {/* Section 5: Transparency Agreement */}
          <div className="p-4 bg-forest-50 border border-forest-200 rounded-2xl space-y-2">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={termsAgreed}
                onChange={(e) => setTermsAgreed(e.target.checked)}
                className="mt-1 rounded text-forest-700 focus:ring-forest-600 w-4 h-4"
              />
              <span className="text-xs text-charcoal-700 leading-relaxed">
                <strong>Donor Declaration:</strong> I confirm that the item description and condition are accurate to the best of my knowledge, and that I hold rightful ownership of this resource. I agree that this listing adheres to platform community safety standards.
              </span>
            </label>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t border-cream-200">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3 rounded-xl text-xs font-semibold text-charcoal-600 hover:bg-cream-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`px-8 py-3.5 rounded-xl text-xs font-bold text-white bg-forest-700 hover:bg-forest-800 shadow-md shadow-forest-900/10 transition-all ${
                submitting ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            >
              {submitting ? 'Publishing Listing...' : 'Publish Donation Listing'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default DonateItemPage;
