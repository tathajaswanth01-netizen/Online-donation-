import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  Gift,
  Search,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Users,
  Package,
  Layers,
  Sparkles,
  MapPin,
  RefreshCw,
  ExternalLink,
  Quote
} from 'lucide-react';
import api from '../services/api';
import DonationCard from '../components/DonationCard';
import RequestModal from '../components/RequestModal';

const HomePage = () => {
  const navigate = useNavigate();
  const [homeData, setHomeData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDonationForRequest, setSelectedDonationForRequest] = useState(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const [homeRes, catRes] = await Promise.all([
          api.get('/donations/home-data'),
          api.get('/categories')
        ]);

        if (homeRes.data.success) {
          setHomeData(homeRes.data);
        }
        if (catRes.data.success) {
          setCategories(catRes.data.categories || []);
        }
      } catch (err) {
        console.error('Error fetching home page data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const handleOpenRequest = (donation) => {
    setSelectedDonationForRequest(donation);
    setIsRequestModalOpen(true);
  };

  const sections = homeData?.sections || {};
  const stats = homeData?.stats || {
    totalDonations: 0,
    completedDonations: 0,
    totalUsers: 0,
    verifiedUsers: 0,
    totalCategories: 0
  };

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* 1. HERO SECTION */}
      <section className="relative bg-gradient-to-b from-forest-50/60 via-cream-100 to-cream-100 pt-10 pb-20 border-b border-cream-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-forest-100/80 border border-forest-200 text-forest-800 text-xs font-semibold tracking-wide">
                <Sparkles size={14} className="text-forest-600" />
                <span>Pan-India Community Resource Sharing</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-charcoal-900 tracking-tight leading-[1.15]">
                Give What You Don't Need.{' '}
                <span className="text-forest-700 block mt-1">
                  Help Someone Who Does.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-charcoal-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                A community platform to donate clothes, books, electronics, food, and essentials directly to verified individuals and families. Promoting reuse, eliminating waste, and ensuring transparency.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/donate"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold text-white bg-forest-700 hover:bg-forest-800 shadow-md shadow-forest-900/10 transition-all hover:translate-y-[-1px]"
                >
                  <Gift size={18} />
                  <span>Donate an Item</span>
                </Link>

                <Link
                  to="/donations"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold text-charcoal-800 bg-white hover:bg-cream-200 border border-cream-300 shadow-sm transition-all"
                >
                  <Search size={18} className="text-forest-600" />
                  <span>Find Donations</span>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-charcoal-500 font-medium">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck size={16} className="text-forest-600" />
                  <span>Identity Verified Donors</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={16} className="text-forest-600" />
                  <span>Anti-Resale Pledge</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Heart size={16} className="text-forest-600" />
                  <span>100% Direct Community Handover</span>
                </div>
              </div>

            </div>

            {/* Right Genuine Photograph */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-[4/3] sm:aspect-[5/4] lg:aspect-auto lg:h-[460px]">
                <img
                  src="https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=1200&q=80"
                  alt="Community members packaging and sharing food rations and essential donations"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/60 via-transparent to-transparent" />
                
                {/* Floating Glass Pill */}
                <div className="absolute bottom-5 left-5 right-5 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-white/40 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-charcoal-900">Direct Resource Handover</p>
                    <p className="text-[11px] text-charcoal-500">Every listing reaches verified receivers with zero middleman fee.</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-forest-50 text-forest-700 flex items-center justify-center flex-shrink-0">
                    <Heart size={20} className="fill-forest-600 text-forest-600" />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. LIVE COMMUNITY IMPACT STATS */}
      <section className="py-10 bg-white border-b border-cream-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            
            <div className="p-4 rounded-xl bg-cream-50 border border-cream-200">
              <p className="text-3xl font-extrabold text-forest-700">{stats.totalDonations}</p>
              <p className="text-xs font-medium text-charcoal-600 mt-1 uppercase tracking-wider">Total Items Listed</p>
            </div>

            <div className="p-4 rounded-xl bg-cream-50 border border-cream-200">
              <p className="text-3xl font-extrabold text-forest-700">{stats.completedDonations}</p>
              <p className="text-xs font-medium text-charcoal-600 mt-1 uppercase tracking-wider">Successful Handovers</p>
            </div>

            <div className="p-4 rounded-xl bg-cream-50 border border-cream-200">
              <p className="text-3xl font-extrabold text-forest-700">{stats.totalUsers}</p>
              <p className="text-xs font-medium text-charcoal-600 mt-1 uppercase tracking-wider">Registered Members</p>
            </div>

            <div className="p-4 rounded-xl bg-cream-50 border border-cream-200">
              <p className="text-3xl font-extrabold text-amberGold-600">{stats.verifiedUsers}</p>
              <p className="text-xs font-medium text-charcoal-600 mt-1 uppercase tracking-wider">Verified Accounts</p>
            </div>

          </div>
        </div>
      </section>

      {/* 3. POPULAR DONATION CATEGORIES */}
      <section className="py-16 bg-cream-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-forest-700">Explore by Category</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 mt-1">
                Popular Donation Categories
              </h2>
            </div>
            <Link
              to="/donations"
              className="mt-3 sm:mt-0 inline-flex items-center gap-1.5 text-xs font-bold text-forest-700 hover:text-forest-800"
            >
              Browse all categories <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {categories.map((cat) => (
              <div
                key={cat._id}
                onClick={() => navigate(`/donations?category=${cat._id}`)}
                className="bg-white rounded-2xl p-4 border border-cream-300 hover:border-forest-300 shadow-sm hover:shadow-md transition-all cursor-pointer group text-center flex flex-col items-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-cream-100 group-hover:bg-forest-50 flex items-center justify-center mb-3 transition-colors overflow-hidden">
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                  ) : (
                    <Package size={24} className="text-forest-700" />
                  )}
                </div>
                <h4 className="font-bold text-xs text-charcoal-900 group-hover:text-forest-700 transition-colors">
                  {cat.name}
                </h4>
                <p className="text-[11px] text-charcoal-400 mt-1">
                  {cat.availableCount || 0} available
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. RECENTLY ADDED DONATIONS */}
      <section className="py-16 bg-white border-t border-cream-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-forest-700">Fresh Resources</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 mt-1">
                Recently Added Donations
              </h2>
            </div>
            <Link
              to="/donations?sort=newest"
              className="text-xs font-bold text-forest-700 hover:text-forest-800 flex items-center gap-1"
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>

          {sections.recentDonations?.length === 0 ? (
            <p className="text-sm text-charcoal-400 py-8 text-center">No recent donations available right now.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sections.recentDonations?.slice(0, 6).map((donation) => (
                <DonationCard
                  key={donation._id}
                  donation={donation}
                  onRequestClick={handleOpenRequest}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 5. AVAILABLE FREE DONATIONS */}
      <section className="py-16 bg-forest-50/40 border-t border-forest-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-forest-700">100% Free Gifts</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 mt-1">
                Available Free Donations
              </h2>
              <p className="text-xs text-charcoal-500 mt-1">
                Provided by generous donors without charging any item fee.
              </p>
            </div>
            <Link
              to="/donations?type=Free"
              className="text-xs font-bold text-forest-700 hover:text-forest-800 flex items-center gap-1"
            >
              See all free items <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sections.freeDonations?.slice(0, 6).map((donation) => (
              <DonationCard
                key={donation._id}
                donation={donation}
                onRequestClick={handleOpenRequest}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 6. AVAILABLE PAID DONATIONS (Subsidized Transfers) */}
      <section className="py-16 bg-white border-t border-cream-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amberGold-600">Fair Value Transfers</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 mt-1">
                Subsidized Paid Items
              </h2>
              <p className="text-xs text-charcoal-500 mt-1">
                Transparently priced second-hand equipment offered at a fraction of retail cost.
              </p>
            </div>
            <Link
              to="/donations?type=Paid"
              className="text-xs font-bold text-forest-700 hover:text-forest-800 flex items-center gap-1"
            >
              View all paid items <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sections.paidDonations?.slice(0, 6).map((donation) => (
              <DonationCard
                key={donation._id}
                donation={donation}
                onRequestClick={handleOpenRequest}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 7. HOW IT WORKS */}
      <section className="py-20 bg-cream-200 border-t border-cream-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-forest-700">Simple & Organized Process</span>
            <h2 className="text-3xl font-extrabold text-charcoal-900 mt-1">
              How GiveCare Works
            </h2>
            <p className="text-sm text-charcoal-600 mt-2">
              Whether you have items to pass on or are seeking essential support, our workflow is transparent and direct.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            
            {/* For Donors */}
            <div className="bg-white rounded-3xl p-8 border border-cream-300 shadow-sm">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-cream-200">
                <div className="w-10 h-10 rounded-xl bg-forest-100 text-forest-700 flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-bold text-lg text-charcoal-900">For Donors</h3>
                  <p className="text-xs text-charcoal-500">Give your gently used items a purposeful second life</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-cream-200 text-charcoal-700 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
                  <div>
                    <h5 className="text-sm font-semibold text-charcoal-900">List Your Item</h5>
                    <p className="text-xs text-charcoal-500">Upload photos, set condition, pickup city, and choose Free or Paid donation.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-cream-200 text-charcoal-700 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
                  <div>
                    <h5 className="text-sm font-semibold text-charcoal-900">Review Genuine Requests</h5>
                    <p className="text-xs text-charcoal-500">Read why receivers need the item and check their verified identity badges.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-cream-200 text-charcoal-700 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
                  <div>
                    <h5 className="text-sm font-semibold text-charcoal-900">Accept & Coordinate Handover</h5>
                    <p className="text-xs text-charcoal-500">Coordinate pickup via platform chat, hand over the item, and mark completed.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* For Receivers */}
            <div className="bg-white rounded-3xl p-8 border border-cream-300 shadow-sm">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-cream-200">
                <div className="w-10 h-10 rounded-xl bg-amberGold-100 text-amberGold-600 flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-bold text-lg text-charcoal-900">For Receivers</h3>
                  <p className="text-xs text-charcoal-500">Find useful resources you need without middlemen</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-cream-200 text-charcoal-700 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
                  <div>
                    <h5 className="text-sm font-semibold text-charcoal-900">Explore & Search</h5>
                    <p className="text-xs text-charcoal-500">Filter by category, city, condition, and free or subsidized pricing.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-cream-200 text-charcoal-700 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
                  <div>
                    <h5 className="text-sm font-semibold text-charcoal-900">Submit a Genuine Request</h5>
                    <p className="text-xs text-charcoal-500">State your intended use and accept the non-resale community pledge.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-cream-200 text-charcoal-700 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
                  <div>
                    <h5 className="text-sm font-semibold text-charcoal-900">Collect & Confirm</h5>
                    <p className="text-xs text-charcoal-500">Meet or receive dispatch safely, inspect the item, and confirm receipt.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 8. WHY CHOOSE OUR PLATFORM? */}
      <section className="py-20 bg-white border-t border-cream-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-forest-700">Trust & Transparency</span>
            <h2 className="text-3xl font-extrabold text-charcoal-900 mt-1">
              Why Choose Our Platform?
            </h2>
            <p className="text-sm text-charcoal-600 mt-2">
              Unlike anonymous classifieds, GiveCare is specifically built to prevent misuse and promote direct social good.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="p-6 rounded-2xl bg-cream-50 border border-cream-200 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-forest-100 text-forest-700 flex items-center justify-center">
                <ShieldCheck size={24} />
              </div>
              <h4 className="font-bold text-base text-charcoal-900">Strict Anti-Misuse Architecture</h4>
              <p className="text-xs text-charcoal-600 leading-relaxed">
                Verification badges, request reason reviews, and anti-resale terms safeguard donations from opportunistic commercial exploitation.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-cream-50 border border-cream-200 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amberGold-100 text-amberGold-600 flex items-center justify-center">
                <RefreshCw size={24} />
              </div>
              <h4 className="font-bold text-base text-charcoal-900">Circular Sustainability</h4>
              <p className="text-xs text-charcoal-600 leading-relaxed">
                Keep useful books, clothes, furniture, and electronics out of landfills by diverting them directly into deserving hands.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-cream-50 border border-cream-200 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-forest-100 text-forest-700 flex items-center justify-center">
                <Heart size={24} />
              </div>
              <h4 className="font-bold text-base text-charcoal-900">Direct Human Connection</h4>
              <p className="text-xs text-charcoal-600 leading-relaxed">
                Connect directly with members in your city, coordinate handovers cleanly via platform chat, and witness your real impact.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 9. RECENTLY COMPLETED DONATIONS (Proof of impact) */}
      {sections.completedDonations?.length > 0 && (
        <section className="py-16 bg-cream-50 border-t border-cream-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <span className="text-xs font-bold uppercase tracking-wider text-forest-700">Transparency In Action</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 mt-1">
                Recently Completed Donations
              </h2>
              <p className="text-xs text-charcoal-500 mt-1">
                Every completed resource transfer represents real community impact and reduced waste.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sections.completedDonations?.map((donation) => (
                <DonationCard
                  key={donation._id}
                  donation={donation}
                  onRequestClick={handleOpenRequest}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 10. TESTIMONIALS */}
      <section className="py-20 bg-white border-t border-cream-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-forest-700">Community Voices</span>
            <h2 className="text-3xl font-extrabold text-charcoal-900 mt-1">
              Words From Our Donors & Receivers
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="p-6 rounded-2xl bg-cream-50 border border-cream-200 flex flex-col justify-between">
              <div>
                <Quote size={28} className="text-forest-400 mb-3" />
                <p className="text-xs text-charcoal-700 italic leading-relaxed">
                  "I had a working ThinkPad laptop sitting in a drawer after an office upgrade. Within 2 days on GiveCare, I connected with an engineering student who genuinely needed it for coding assignments. Handing it over directly was deeply gratifying."
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-cream-200 flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
                  alt="Rahul Sharma"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h5 className="text-xs font-bold text-charcoal-900">Rahul Sharma</h5>
                  <p className="text-[11px] text-charcoal-500">Donor • Bengaluru</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-cream-50 border border-cream-200 flex flex-col justify-between">
              <div>
                <Quote size={28} className="text-forest-400 mb-3" />
                <p className="text-xs text-charcoal-700 italic leading-relaxed">
                  "As a college student supporting my own education, textbook sets are often out of budget. Sarah's NCERT reference set helped me prepare for my entrance exams without straining my family's savings."
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-cream-200 flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80"
                  alt="Arjun Verma"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h5 className="text-xs font-bold text-charcoal-900">Arjun Verma</h5>
                  <p className="text-[11px] text-charcoal-500">Receiver • Pune</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-cream-50 border border-cream-200 flex flex-col justify-between">
              <div>
                <Quote size={28} className="text-forest-400 mb-3" />
                <p className="text-xs text-charcoal-700 italic leading-relaxed">
                  "Our elderly care trust needed sturdy wheelchairs. Finding one donated in pristine condition by David right here in Hyderabad made a tangible difference for our rehabilitation ward."
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-cream-200 flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80"
                  alt="Priya Sundaram"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h5 className="text-xs font-bold text-charcoal-900">Priya Sundaram</h5>
                  <p className="text-[11px] text-charcoal-500">Community Worker • Chennai</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 11. FINAL COMMUNITY CALL TO ACTION */}
      <section className="py-16 bg-forest-700 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Make a Meaningful Difference?
          </h2>
          <p className="text-sm sm:text-base text-cream-200 max-w-xl mx-auto leading-relaxed">
            Join thousands of thoughtful donors and genuine receivers making everyday resource sharing reliable, safe, and transparent.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              to="/donate"
              className="w-full sm:w-auto px-7 py-3 rounded-xl text-xs font-bold text-forest-800 bg-cream-200 hover:bg-white transition-all shadow-md"
            >
              Start Donating Today
            </Link>
            <Link
              to="/donations"
              className="w-full sm:w-auto px-7 py-3 rounded-xl text-xs font-bold text-white bg-forest-800 hover:bg-forest-900 border border-forest-600 transition-all"
            >
              Browse Available Items
            </Link>
          </div>
        </div>
      </section>

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
            // refresh home data
            api.get('/donations/home-data').then(res => setHomeData(res.data));
          }}
        />
      )}

    </div>
  );
};

export default HomePage;
