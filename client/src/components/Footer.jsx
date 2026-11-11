import React from 'react';
import { Link } from 'react-router-dom';
import { Gift, Heart, Shield, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-charcoal-900 text-charcoal-200 mt-auto border-t border-charcoal-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-forest-700 flex items-center justify-center text-white">
                <Gift size={20} className="text-cream-200" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Give<span className="text-amberGold-400">Care</span>
              </span>
            </Link>
            <p className="text-sm text-charcoal-300 leading-relaxed max-w-sm">
              A transparent, community-powered donation platform connecting unused, useful resources—clothes, books, food, devices, and furniture—directly with individuals and families in genuine need.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-amberGold-400">
              <Shield size={16} />
              <span>Strict anti-resale policy & verified community members.</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/donations" className="text-charcoal-400 hover:text-white transition-colors">
                  Browse All Donations
                </Link>
              </li>
              <li>
                <Link to="/donations?type=Free" className="text-charcoal-400 hover:text-white transition-colors">
                  Free Resource Transfers
                </Link>
              </li>
              <li>
                <Link to="/donations?type=Paid" className="text-charcoal-400 hover:text-white transition-colors">
                  Subsidized Paid Items
                </Link>
              </li>
              <li>
                <Link to="/donate" className="text-charcoal-400 hover:text-white transition-colors">
                  List an Item to Donate
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-charcoal-400 hover:text-white transition-colors">
                  How It Works
                </Link>
              </li>
            </ul>
          </div>

          {/* Resource Categories */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
              Categories
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/donations?category=clothes" className="text-charcoal-400 hover:text-white transition-colors">
                  Clothes & Apparel
                </Link>
              </li>
              <li>
                <Link to="/donations?category=books" className="text-charcoal-400 hover:text-white transition-colors">
                  Books & Study Materials
                </Link>
              </li>
              <li>
                <Link to="/donations?category=food" className="text-charcoal-400 hover:text-white transition-colors">
                  Food & Pantry Rations
                </Link>
              </li>
              <li>
                <Link to="/donations?category=electronics" className="text-charcoal-400 hover:text-white transition-colors">
                  Laptops & Electronics
                </Link>
              </li>
              <li>
                <Link to="/donations?category=medical" className="text-charcoal-400 hover:text-white transition-colors">
                  Medical & Mobility Aids
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust, Safety & Contact */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
              Community & Safety
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/about" className="text-charcoal-400 hover:text-white transition-colors">
                  About Our Mission
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-charcoal-400 hover:text-white transition-colors">
                  Support & Verification
                </Link>
              </li>
              <li className="flex items-center gap-2 text-charcoal-400 pt-1">
                <MapPin size={15} className="text-amberGold-400 flex-shrink-0" />
                <span>Pan-India Community Network</span>
              </li>
              <li className="flex items-center gap-2 text-charcoal-400">
                <Mail size={15} className="text-amberGold-400 flex-shrink-0" />
                <span>care@platform.org</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-charcoal-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-charcoal-500">
          <p>© {new Date().getFullYear()} Online Donation Platform. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Built with care for social impact</span>
            <span className="inline-flex items-center gap-1 text-forest-400">
              <Heart size={13} className="fill-forest-400 text-forest-400" /> Zero Waste Initiative
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
