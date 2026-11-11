import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  Gift,
  ShieldCheck,
  Recycle,
  Users,
  Target,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import api from '../services/api';

const AboutUsPage = () => {
  const [stats, setStats] = useState({
    totalDonations: 0,
    completedDonations: 0,
    totalUsers: 0,
    verifiedUsers: 0
  });

  useEffect(() => {
    api.get('/donations/home-data').then((res) => {
      if (res.data.success && res.data.stats) {
        setStats(res.data.stats);
      }
    }).catch(console.error);
  }, []);

  return (
    <div className="bg-cream-100 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Hero Banner */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-100 text-forest-800 text-xs font-semibold">
            <Sparkles size={14} />
            <span>Community-Driven Reuse</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-charcoal-900 tracking-tight">
            Connecting Resources with Genuine Need
          </h1>
          <p className="text-sm sm:text-base text-charcoal-600 leading-relaxed">
            GiveCare was founded to create a centralized, dignified, and completely transparent platform where useful resources—from clothes and study books to electronics and mobility equipment—find a second life with people who truly need them.
          </p>
        </div>

        {/* Impact Numbers */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-6 bg-white rounded-2xl border border-cream-300 text-center shadow-xs">
            <p className="text-3xl font-extrabold text-forest-700">{stats.totalDonations}</p>
            <p className="text-xs text-charcoal-500 uppercase font-semibold mt-1">Resources Donated</p>
          </div>
          <div className="p-6 bg-white rounded-2xl border border-cream-300 text-center shadow-xs">
            <p className="text-3xl font-extrabold text-forest-700">{stats.completedDonations}</p>
            <p className="text-xs text-charcoal-500 uppercase font-semibold mt-1">Verified Handovers</p>
          </div>
          <div className="p-6 bg-white rounded-2xl border border-cream-300 text-center shadow-xs">
            <p className="text-3xl font-extrabold text-forest-700">{stats.totalUsers}</p>
            <p className="text-xs text-charcoal-500 uppercase font-semibold mt-1">Community Members</p>
          </div>
          <div className="p-6 bg-white rounded-2xl border border-cream-300 text-center shadow-xs">
            <p className="text-3xl font-extrabold text-amberGold-600">{stats.verifiedUsers}</p>
            <p className="text-xs text-charcoal-500 uppercase font-semibold mt-1">Verified Donors & Receivers</p>
          </div>
        </div>

        {/* Pillars / Principles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="bg-white p-8 rounded-3xl border border-cream-300 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-forest-100 text-forest-700 flex items-center justify-center">
              <Recycle size={24} />
            </div>
            <h3 className="font-bold text-lg text-charcoal-900">Zero Waste Economy</h3>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              Every day, tons of functional appliances, textbooks, and clothing end up discarded or forgotten in closets. We divert these valuable items into direct, active community reuse.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-cream-300 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amberGold-100 text-amberGold-600 flex items-center justify-center">
              <ShieldCheck size={24} />
            </div>
            <h3 className="font-bold text-lg text-charcoal-900">Trust & Transparency</h3>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              We reject anonymous, opaque donation pipelines. Our identity verification, request reasoning, and admin moderation ensure items reach real individuals and families.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-cream-300 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-forest-100 text-forest-700 flex items-center justify-center">
              <Users size={24} />
            </div>
            <h3 className="font-bold text-lg text-charcoal-900">Direct Human Dignity</h3>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              We empower receivers to request items respectfully and connect directly with local donors in their cities, eliminating exploitative middlemen and administrative overhead.
            </p>
          </div>

        </div>

        {/* Anti-resale Commitment */}
        <div className="bg-white rounded-3xl p-8 border border-cream-300 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <h3 className="font-extrabold text-xl text-charcoal-900">Strict Anti-Resale Commitment</h3>
            <p className="text-xs sm:text-sm text-charcoal-600 max-w-2xl leading-relaxed">
              Items donated on GiveCare are dedicated to immediate personal or community welfare. We deploy reporting channels and administrative investigation tools to identify and permanently remove users attempting to commercialize donated resources.
            </p>
          </div>
          <Link
            to="/donate"
            className="px-6 py-3 bg-forest-700 hover:bg-forest-800 text-white rounded-xl text-xs font-bold shadow-sm whitespace-nowrap"
          >
            Join as a Donor
          </Link>
        </div>

      </div>
    </div>
  );
};

export default AboutUsPage;
