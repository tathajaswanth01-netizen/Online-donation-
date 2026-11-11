import React, { useState, useEffect } from 'react';
import {
  User,
  ShieldCheck,
  Key,
  MapPin,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  Save,
  Trash2
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import VerificationBadge from '../components/VerificationBadge';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user, updateUser, refreshUser, logout } = useAuth();

  // Profile Information Tab
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [accountType, setAccountType] = useState(user?.accountType || 'both');
  const [street, setStreet] = useState(user?.address?.street || '');
  const [city, setCity] = useState(user?.address?.city || '');
  const [state, setState] = useState(user?.address?.state || '');
  const [pincode, setPincode] = useState(user?.address?.pincode || '');
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(user?.profileImage || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password Change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // Identity Verification
  const [docType, setDocType] = useState('National ID / Aadhaar');
  const [docNumber, setDocNumber] = useState('');
  const [docNotes, setDocNotes] = useState('');
  const [docFile, setDocFile] = useState(null);
  const [docHistory, setDocHistory] = useState([]);
  const [submittingDoc, setSubmittingDoc] = useState(false);

  useEffect(() => {
    const fetchVerificationHistory = async () => {
      try {
        const res = await api.get('/users/verification-status');
        if (res.data.success) {
          setDocHistory(res.data.documents || []);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchVerificationHistory();
  }, []);

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImageFile(file);
      setProfileImagePreview(URL.createObjectURL(file));
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      const formData = new FormData();
      formData.append('name', name);
      formData.append('phone', phone);
      formData.append('bio', bio);
      formData.append('accountType', accountType);

      const addressObj = { street, city, state, pincode };
      formData.append('address', JSON.stringify(addressObj));

      if (profileImageFile) {
        formData.append('profileImage', profileImageFile);
      }

      const res = await api.put('/auth/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        toast.success('Profile updated successfully!');
        updateUser(res.data.user);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      toast.error('New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }

    try {
      setChangingPassword(true);
      const res = await api.put('/auth/change-password', {
        currentPassword,
        newPassword
      });

      if (res.data.success) {
        toast.success('Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not change password.');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSubmitVerification = async (e) => {
    e.preventDefault();
    if (!docFile) {
      toast.error('Please attach a clear photo or scan of your document.');
      return;
    }

    try {
      setSubmittingDoc(true);
      const formData = new FormData();
      formData.append('docType', docType);
      formData.append('docNumber', docNumber);
      formData.append('notes', docNotes);
      formData.append('documentFile', docFile);

      const res = await api.post('/users/verify', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        toast.success(res.data.message);
        refreshUser();
        // Refresh verification history
        const vRes = await api.get('/users/verification-status');
        if (vRes.data.success) setDocHistory(vRes.data.documents || []);
        setDocNumber('');
        setDocNotes('');
        setDocFile(null);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed.');
    } finally {
      setSubmittingDoc(false);
    }
  };

  const handleDeactivate = async () => {
    if (!window.confirm('Are you sure you want to deactivate your account? You will be logged out.')) return;
    try {
      const res = await api.put('/auth/deactivate');
      if (res.data.success) {
        toast.success('Account deactivated.');
        logout();
      }
    } catch (err) {
      toast.error('Failed to deactivate.');
    }
  };

  return (
    <div className="bg-cream-100 min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        
        {/* Profile Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-300 shadow-sm flex flex-col sm:flex-row items-center gap-6">
          <div className="relative">
            {profileImagePreview ? (
              <img
                src={profileImagePreview}
                alt={user?.name}
                className="w-24 h-24 rounded-2xl object-cover border-2 border-forest-200 shadow-sm"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-forest-100 text-forest-700 flex items-center justify-center font-extrabold text-2xl">
                {user?.name?.charAt(0) || 'U'}
              </div>
            )}
            <label
              htmlFor="avatar-upload"
              className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-forest-700 text-white cursor-pointer hover:bg-forest-800 shadow-sm transition-colors"
              title="Change photo"
            >
              <UploadCloud size={14} />
            </label>
            <input
              type="file"
              id="avatar-upload"
              accept="image/*"
              onChange={handleProfileImageChange}
              className="hidden"
            />
          </div>

          <div className="text-center sm:text-left flex-1 space-y-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h2 className="text-2xl font-extrabold text-charcoal-900">{user?.name}</h2>
              <VerificationBadge status={user?.verificationStatus} size="md" />
            </div>
            <p className="text-xs text-charcoal-500">{user?.email} • {user?.phone}</p>
            <p className="text-xs text-charcoal-600 mt-1">
              Role: <strong className="capitalize">{user?.accountType || 'Both Donor & Receiver'}</strong> • Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString([], { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* 1. EDIT PROFILE FORM */}
        <form onSubmit={handleUpdateProfile} className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-300 shadow-sm space-y-5">
          <h3 className="text-sm font-bold uppercase tracking-wider text-forest-800 pb-2 border-b border-cream-200">
            Personal & Contact Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-forest-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1">
                Phone Number
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-forest-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1">
              Account Role
            </label>
            <select
              value={accountType}
              onChange={(e) => setAccountType(e.target.value)}
              className="w-full sm:w-1/2 px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-forest-600"
            >
              <option value="both">Both (Donate Items & Request Items)</option>
              <option value="donor">Donor Only</option>
              <option value="receiver">Receiver Only</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1">
              Short Bio
            </label>
            <textarea
              rows="2"
              placeholder="Tell other community members a bit about yourself..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-forest-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1">
                Street Address
              </label>
              <input
                type="text"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                className="w-full px-3 py-2 bg-cream-50 border border-cream-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1">
                City
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 bg-cream-50 border border-cream-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1">
                PIN Code
              </label>
              <input
                type="text"
                required
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="w-full px-3 py-2 bg-cream-50 border border-cream-300 rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingProfile}
              className="px-6 py-2.5 bg-forest-700 hover:bg-forest-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
            >
              {savingProfile ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>

        {/* 2. IDENTITY VERIFICATION SECTION */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-300 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-cream-200">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-forest-800">
                Identity & Supporting Documents Verification
              </h3>
              <p className="text-xs text-charcoal-500 mt-0.5">
                Verified members build trust. Approved profiles receive a green verified badge.
              </p>
            </div>
            <VerificationBadge status={user?.verificationStatus} size="lg" />
          </div>

          {user?.verificationStatus === 'verified' ? (
            <div className="p-4 bg-forest-50 border border-forest-200 rounded-2xl flex items-center gap-3 text-xs text-forest-800">
              <CheckCircle2 size={24} className="text-forest-600 flex-shrink-0" />
              <div>
                <p className="font-bold">Your Account is Verified!</p>
                <p className="text-charcoal-600 mt-0.5">Your submitted identity document was reviewed and approved by our trust team.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmitVerification} className="p-5 bg-cream-50 rounded-2xl border border-cream-200 space-y-4">
              <p className="text-xs text-charcoal-600 leading-relaxed">
                Upload a government-issued photo ID (Aadhaar, Passport, Voter ID, Driving License) or institutional ID (Student ID, NGO authorization). Sensitive numbers are strictly restricted to administrators.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1">
                    Document Type
                  </label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-cream-300 rounded-lg text-xs"
                  >
                    <option value="National ID / Aadhaar">National ID / Aadhaar</option>
                    <option value="Passport Verification">Passport Verification</option>
                    <option value="Driving License">Driving License</option>
                    <option value="Voter Identification Card">Voter Identification Card</option>
                    <option value="University Student ID">University Student ID</option>
                    <option value="NGO / Trust Registration">NGO / Trust Registration</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1">
                    Document / Registration ID Number
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DL-1234567 or PUN-ENG-88"
                    value={docNumber}
                    onChange={(e) => setDocNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-cream-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1">
                  Attach Document Image or PDF <span className="text-rose-500">*</span>
                </label>
                <input
                  type="file"
                  required
                  accept="image/png, image/jpeg, image/webp, application/pdf"
                  onChange={(e) => setDocFile(e.target.files[0])}
                  className="w-full text-xs text-charcoal-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-forest-100 file:text-forest-700 hover:file:bg-forest-200"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={submittingDoc}
                  className="px-6 py-2.5 bg-forest-700 hover:bg-forest-800 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  {submittingDoc ? 'Submitting Documents...' : 'Submit Verification Request'}
                </button>
              </div>
            </form>
          )}

          {/* Submitted Documents History */}
          {docHistory.length > 0 && (
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-bold text-charcoal-700 uppercase tracking-wider">Submitted Verification History</h4>
              <div className="space-y-2">
                {docHistory.map((d, idx) => (
                  <div key={idx} className="p-3 bg-cream-50 rounded-xl border border-cream-200 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-charcoal-800">{d.docType}</p>
                      <p className="text-[11px] text-charcoal-500">ID: {d.docNumber} • Submitted: {new Date(d.submittedAt).toLocaleDateString()}</p>
                      {d.adminNotes && (
                        <p className="text-[11px] text-amberGold-800 mt-0.5">Admin Note: {d.adminNotes}</p>
                      )}
                    </div>
                    {d.reviewedAt ? (
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Reviewed
                      </span>
                    ) : (
                      <span className="text-[10px] text-amberGold-700 font-bold bg-amberGold-50 px-2 py-0.5 rounded border border-amberGold-200">
                        In Queue
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 3. CHANGE PASSWORD */}
        <form onSubmit={handleChangePassword} className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-300 shadow-sm space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-forest-800 pb-2 border-b border-cream-200">
            Security & Password
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1">
                Current Password
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 bg-cream-50 border border-cream-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1">
                New Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 bg-cream-50 border border-cream-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="w-full px-3 py-2 bg-cream-50 border border-cream-300 rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={changingPassword}
              className="px-5 py-2 bg-forest-700 hover:bg-forest-800 text-white rounded-xl text-xs font-bold shadow-sm"
            >
              {changingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>

        {/* 4. DANGER ZONE */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-200 shadow-sm flex items-center justify-between">
          <div>
            <h4 className="font-bold text-sm text-rose-800">Account Deactivation</h4>
            <p className="text-xs text-charcoal-500 mt-0.5">
              Temporarily deactivate your account. Your listings will be hidden from public browsing.
            </p>
          </div>
          <button
            onClick={handleDeactivate}
            className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-semibold border border-rose-200 transition-colors"
          >
            Deactivate Account
          </button>
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;
