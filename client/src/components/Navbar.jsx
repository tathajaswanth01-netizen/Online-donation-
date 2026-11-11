import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Heart,
  User,
  PlusCircle,
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  ShieldAlert,
  ChevronDown,
  Gift,
  HelpCircle,
  Info,
  PhoneCall,
  Search
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import NotificationDropdown from './NotificationDropdown';
import VerificationBadge from './VerificationBadge';

const Navbar = () => {
  const { user, isAuthenticated, isDonor, isReceiver, isAdmin, logout } = useAuth();
  const { wishlist } = useWishlist();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Close menus on route change
  useEffect(() => {
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Browse Donations', path: '/donations' },
    { label: 'Donate Items', path: '/donate' },
    { label: 'How It Works', path: '/how-it-works' },
    { label: 'About Us', path: '/about' },
    { label: 'Contact', path: '/contact' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-cream-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand Name */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-forest-700 flex items-center justify-center text-white shadow-md shadow-forest-900/10 group-hover:bg-forest-800 transition-all">
              <Gift size={22} className="text-cream-200" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-forest-900 block leading-tight">
                Give<span className="text-amberGold-400">Care</span>
              </span>
              <span className="text-[11px] font-medium text-charcoal-500 tracking-wider uppercase block">
                Online Donation Platform
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-forest-700 bg-forest-50 font-semibold'
                      : 'text-charcoal-600 hover:text-forest-700 hover:bg-cream-100'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Right Actions */}
          <div className="hidden lg:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* Wishlist Link */}
                <Link
                  to="/wishlist"
                  className="relative p-2 text-charcoal-600 hover:text-forest-700 hover:bg-cream-200 rounded-full transition-colors"
                  title="Saved Donations"
                >
                  <Heart size={20} />
                  {wishlist.length > 0 && (
                    <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-forest-700 rounded-full ring-2 ring-white">
                      {wishlist.length}
                    </span>
                  )}
                </Link>

                {/* Notifications Dropdown */}
                <NotificationDropdown />

                {/* Donate CTA button */}
                <Link
                  to="/donate"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-forest-700 hover:bg-forest-800 rounded-lg shadow-sm transition-all"
                >
                  <PlusCircle size={15} />
                  <span>Donate Item</span>
                </Link>

                {/* User Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full hover:bg-cream-100 border border-cream-300 transition-colors"
                  >
                    {user?.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover border border-forest-200"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-forest-100 text-forest-700 flex items-center justify-center font-bold text-xs">
                        {user?.name?.charAt(0) || 'U'}
                      </div>
                    )}
                    <span className="text-xs font-medium text-charcoal-800 max-w-[100px] truncate">
                      {user?.name?.split(' ')[0]}
                    </span>
                    <ChevronDown size={14} className="text-charcoal-400" />
                  </button>

                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-cream-300 py-2 z-50 animate-fadeIn">
                      <div className="px-4 py-3 border-b border-cream-200">
                        <p className="text-sm font-semibold text-charcoal-900 truncate">
                          {user?.name}
                        </p>
                        <p className="text-xs text-charcoal-500 truncate mb-1">
                          {user?.email}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <VerificationBadge status={user?.verificationStatus} size="sm" />
                          <span className="text-[10px] uppercase font-bold text-charcoal-400 bg-cream-200 px-1.5 py-0.5 rounded">
                            {user?.accountType || 'Member'}
                          </span>
                        </div>
                      </div>

                      <div className="py-1">
                        {/* Role specific dashboard links */}
                        {isDonor && (
                          <Link
                            to="/donor-dashboard"
                            className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-charcoal-700 hover:bg-forest-50 hover:text-forest-700 transition-colors"
                          >
                            <LayoutDashboard size={15} />
                            <span>Donor Dashboard</span>
                          </Link>
                        )}

                        {isReceiver && (
                          <Link
                            to="/receiver-dashboard"
                            className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-charcoal-700 hover:bg-forest-50 hover:text-forest-700 transition-colors"
                          >
                            <LayoutDashboard size={15} />
                            <span>Receiver Dashboard</span>
                          </Link>
                        )}

                        {isAdmin && (
                          <Link
                            to="/admin"
                            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-amber-700 bg-amber-50/60 hover:bg-amber-100/70 transition-colors"
                          >
                            <ShieldAlert size={15} />
                            <span>Administrator Panel</span>
                          </Link>
                        )}

                        <Link
                          to="/profile"
                          className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-charcoal-700 hover:bg-forest-50 hover:text-forest-700 transition-colors"
                        >
                          <User size={15} />
                          <span>My Profile & Verification</span>
                        </Link>
                      </div>

                      <div className="border-t border-cream-200 pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors text-left"
                        >
                          <LogOut size={15} />
                          <span>Log Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-forest-700 hover:text-forest-800 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-forest-700 hover:bg-forest-800 rounded-lg shadow-sm transition-all"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            {isAuthenticated && (
              <>
                <Link
                  to="/wishlist"
                  className="p-2 text-charcoal-600 rounded-full"
                >
                  <Heart size={20} />
                </Link>
                <NotificationDropdown />
              </>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-charcoal-700 hover:bg-cream-200 rounded-lg"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-cream-300 px-4 pt-2 pb-6 space-y-3 animate-fadeIn">
          {isAuthenticated && (
            <div className="p-3 bg-cream-50 rounded-lg flex items-center justify-between mb-3 border border-cream-200">
              <div className="flex items-center gap-2.5">
                {user?.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-forest-100 text-forest-700 flex items-center justify-center font-bold text-sm">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-charcoal-900">{user?.name}</p>
                  <VerificationBadge status={user?.verificationStatus} size="sm" />
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="text-xs text-rose-600 font-medium px-2 py-1 rounded bg-rose-50"
              >
                Log Out
              </button>
            </div>
          )}

          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-charcoal-700 hover:bg-cream-100"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="pt-2 border-t border-cream-200 space-y-1">
            {isAuthenticated ? (
              <>
                {isDonor && (
                  <Link
                    to="/donor-dashboard"
                    className="block px-3 py-2 text-sm font-medium text-charcoal-700 hover:bg-cream-100"
                  >
                    Donor Dashboard
                  </Link>
                )}
                {isReceiver && (
                  <Link
                    to="/receiver-dashboard"
                    className="block px-3 py-2 text-sm font-medium text-charcoal-700 hover:bg-cream-100"
                  >
                    Receiver Dashboard
                  </Link>
                )}
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="block px-3 py-2 text-sm font-semibold text-amber-700 bg-amber-50 rounded-lg"
                  >
                    Administrator Panel
                  </Link>
                )}
                <Link
                  to="/profile"
                  className="block px-3 py-2 text-sm font-medium text-charcoal-700 hover:bg-cream-100"
                >
                  My Profile & Verification
                </Link>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                <Link
                  to="/login"
                  className="w-full text-center py-2 text-sm font-semibold text-forest-700 bg-forest-50 rounded-lg"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="w-full text-center py-2 text-sm font-semibold text-white bg-forest-700 rounded-lg"
                >
                  Register Account
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
