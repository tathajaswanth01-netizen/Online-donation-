import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
  PackageOpen,
  ArrowUpDown
} from 'lucide-react';
import api from '../services/api';
import DonationCard from '../components/DonationCard';
import RequestModal from '../components/RequestModal';

const BrowseDonationsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [donations, setDonations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter States
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [selectedType, setSelectedType] = useState(searchParams.get('type') || 'all');
  const [selectedCondition, setSelectedCondition] = useState(searchParams.get('condition') || 'all');
  const [cityInput, setCityInput] = useState(searchParams.get('city') || '');
  const [sortOption, setSortOption] = useState(searchParams.get('sort') || 'newest');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');

  // Mobile filter sidebar toggle
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // Request Modal State
  const [selectedDonationForRequest, setSelectedDonationForRequest] = useState(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(searchInput);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // Fetch categories on load
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await api.get('/categories');
        if (res.data.success) {
          setCategories(res.data.categories || []);
        }
      } catch (err) {
        console.error('Error loading categories:', err);
      }
    };
    loadCategories();
  }, []);

  // Fetch donations with active filters
  const fetchDonations = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 12,
        sort: sortOption
      };

      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (selectedCategory && selectedCategory !== 'all') params.category = selectedCategory;
      if (selectedType && selectedType !== 'all') params.type = selectedType;
      if (selectedCondition && selectedCondition !== 'all') params.condition = selectedCondition;
      if (cityInput.trim()) params.city = cityInput.trim();
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;

      // Sync with URL search params
      setSearchParams(params, { replace: true });

      const res = await api.get('/donations', { params });
      if (res.data.success) {
        setDonations(res.data.donations || []);
        setTotal(res.data.total || 0);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (err) {
      console.error('Error fetching donations:', err);
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    searchQuery,
    selectedCategory,
    selectedType,
    selectedCondition,
    cityInput,
    sortOption,
    minPrice,
    maxPrice,
    setSearchParams
  ]);

  useEffect(() => {
    fetchDonations();
  }, [fetchDonations]);

  const handleResetFilters = () => {
    setSearchInput('');
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedType('all');
    setSelectedCondition('all');
    setCityInput('');
    setMinPrice('');
    setMaxPrice('');
    setSortOption('newest');
    setCurrentPage(1);
  };

  const handleOpenRequest = (donation) => {
    setSelectedDonationForRequest(donation);
    setIsRequestModalOpen(true);
  };

  const activeFiltersCount = [
    selectedCategory !== 'all',
    selectedType !== 'all',
    selectedCondition !== 'all',
    cityInput.trim() !== '',
    minPrice !== '',
    maxPrice !== '',
    searchQuery.trim() !== ''
  ].filter(Boolean).length;

  return (
    <div className="bg-cream-100 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-forest-700">Explore Resources</span>
          <h1 className="text-3xl font-extrabold text-charcoal-900 mt-1">
            Browse Community Donations
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-600 mt-1 max-w-2xl">
            Discover gently used items, from study materials and laptops to winter clothing and mobility aids, ready for direct community handover.
          </p>
        </div>

        {/* Live Search & Controls Bar */}
        <div className="bg-white p-4 rounded-2xl border border-cream-300 shadow-sm mb-8 flex flex-col md:flex-row items-center gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-400" />
            <input
              type="text"
              placeholder="Search by title, description, city, or pincode..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 text-charcoal-800 placeholder:text-charcoal-400"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-600"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
              <select
                value={sortOption}
                onChange={(e) => {
                  setSortOption(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full md:w-48 pl-3 pr-8 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs font-medium text-charcoal-700 focus:outline-none focus:ring-2 focus:ring-forest-600"
              >
                <option value="newest">Sort: Newest First</option>
                <option value="oldest">Sort: Oldest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="views">Most Viewed</option>
              </select>
            </div>

            {/* Mobile Filter Toggle Button */}
            <button
              onClick={() => setFilterDrawerOpen(!filterDrawerOpen)}
              className="lg:hidden px-3.5 py-2.5 bg-forest-50 text-forest-700 border border-forest-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 flex-shrink-0"
            >
              <SlidersHorizontal size={15} />
              <span>Filters ({activeFiltersCount})</span>
            </button>
          </div>

        </div>

        {/* Layout Grid: Sidebar Filters + Products Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* Desktop Filter Sidebar */}
          <div className={`lg:block ${filterDrawerOpen ? 'block' : 'hidden'} bg-white p-5 rounded-2xl border border-cream-300 shadow-sm space-y-6`}>
            
            <div className="flex items-center justify-between pb-3 border-b border-cream-200">
              <div className="flex items-center gap-2 font-bold text-sm text-charcoal-900">
                <Filter size={16} className="text-forest-700" />
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="text-[10px] bg-forest-100 text-forest-700 font-bold px-1.5 py-0.5 rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
              </div>
              {activeFiltersCount > 0 && (
                <button
                  onClick={handleResetFilters}
                  className="text-xs text-forest-700 hover:text-forest-900 font-medium"
                >
                  Reset all
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-2">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full p-2 bg-cream-50 border border-cream-300 rounded-lg text-xs text-charcoal-700 focus:outline-none focus:ring-2 focus:ring-forest-600"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} ({c.availableCount || 0})
                  </option>
                ))}
              </select>
            </div>

            {/* Donation Type (Free vs Paid) */}
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-2">
                Donation Type
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { label: 'All', value: 'all' },
                  { label: 'FREE', value: 'Free' },
                  { label: 'PAID', value: 'Paid' }
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => {
                      setSelectedType(item.value);
                      setCurrentPage(1);
                    }}
                    className={`py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                      selectedType === item.value
                        ? 'bg-forest-700 text-white border-forest-700 shadow-sm'
                        : 'bg-cream-50 text-charcoal-600 border-cream-300 hover:bg-cream-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Item Condition */}
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-2">
                Condition
              </label>
              <select
                value={selectedCondition}
                onChange={(e) => {
                  setSelectedCondition(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full p-2 bg-cream-50 border border-cream-300 rounded-lg text-xs text-charcoal-700 focus:outline-none focus:ring-2 focus:ring-forest-600"
              >
                <option value="all">Any Condition</option>
                <option value="New">New (Unused in box)</option>
                <option value="Like New">Like New (Barely used)</option>
                <option value="Good">Good (Working fine)</option>
                <option value="Usable">Usable (Functional)</option>
              </select>
            </div>

            {/* City Location */}
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-2">
                Location / City
              </label>
              <input
                type="text"
                placeholder="e.g. Mumbai, Delhi, Bengaluru..."
                value={cityInput}
                onChange={(e) => {
                  setCityInput(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full p-2 bg-cream-50 border border-cream-300 rounded-lg text-xs text-charcoal-700 focus:outline-none focus:ring-2 focus:ring-forest-600 placeholder:text-charcoal-400"
              />
            </div>

            {/* Price Range (Only if not Free) */}
            {selectedType !== 'Free' && (
              <div>
                <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-2">
                  Price Range (₹)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => {
                      setMinPrice(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-1/2 p-2 bg-cream-50 border border-cream-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-forest-600"
                  />
                  <span className="text-charcoal-400 text-xs">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => {
                      setMaxPrice(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-1/2 p-2 bg-cream-50 border border-cream-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-forest-600"
                  />
                </div>
              </div>
            )}

            {/* Reset button inside mobile drawer */}
            <div className="pt-2 lg:hidden">
              <button
                onClick={() => setFilterDrawerOpen(false)}
                className="w-full py-2 bg-forest-700 text-white font-semibold text-xs rounded-lg"
              >
                Apply Filters
              </button>
            </div>

          </div>

          {/* Right Product Grid */}
          <div className="lg:col-span-3">
            
            {/* Results count header */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-charcoal-600 font-medium">
                Showing <strong className="text-charcoal-900">{donations.length}</strong> of{' '}
                <strong className="text-charcoal-900">{total}</strong> available resource listings
              </p>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center space-y-3">
                <div className="w-9 h-9 border-4 border-forest-200 border-t-forest-700 rounded-full animate-spin" />
                <p className="text-xs text-charcoal-500 font-medium">Loading donations...</p>
              </div>
            ) : donations.length === 0 ? (
              /* Empty State */
              <div className="bg-white rounded-2xl border border-cream-300 p-12 text-center space-y-4 shadow-sm">
                <div className="w-16 h-16 rounded-full bg-cream-100 text-forest-700 flex items-center justify-center mx-auto">
                  <PackageOpen size={32} />
                </div>
                <h3 className="text-base font-bold text-charcoal-900">No matching donations found</h3>
                <p className="text-xs text-charcoal-500 max-w-sm mx-auto leading-relaxed">
                  We couldn't find any donations matching your current filters. Try expanding your search keyword or clearing the filters.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-5 py-2 rounded-lg text-xs font-semibold text-white bg-forest-700 hover:bg-forest-800 transition-colors shadow-sm"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              /* Product Grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {donations.map((donation) => (
                  <DonationCard
                    key={donation._id}
                    donation={donation}
                    onRequestClick={handleOpenRequest}
                  />
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  className="p-2 rounded-lg border border-cream-300 bg-white text-charcoal-600 hover:bg-cream-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-9 h-9 rounded-lg text-xs font-semibold border transition-all ${
                      currentPage === page
                        ? 'bg-forest-700 text-white border-forest-700 shadow-sm'
                        : 'bg-white text-charcoal-700 border-cream-300 hover:bg-cream-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  className="p-2 rounded-lg border border-cream-300 bg-white text-charcoal-600 hover:bg-cream-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Request Modal */}
      {selectedDonationForRequest && (
        <RequestModal
          donation={selectedDonationForRequest}
          isOpen={isRequestModalOpen}
          onClose={() => {
            setIsRequestModalOpen(false);
            setSelectedDonationForRequest(null);
          }}
          onSuccess={() => {
            fetchDonations();
          }}
        />
      )}

    </div>
  );
};

export default BrowseDonationsPage;
