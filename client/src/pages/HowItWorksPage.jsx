import React from 'react';
import { Link } from 'react-router-dom';
import {
  Gift,
  Search,
  CheckCircle2,
  ShieldCheck,
  MessageCircle,
  Truck,
  HeartHandshake,
  ArrowRight,
  AlertTriangle
} from 'lucide-react';

const HowItWorksPage = () => {
  const donorSteps = [
    { title: '1. Register & Verify', desc: 'Create an account and submit verification documents to earn a verified donor badge.' },
    { title: '2. Upload Item Details', desc: 'Add photos, condition (New / Like New / Good / Usable), quantity, and choose Free or Paid.' },
    { title: '3. Receive Requests', desc: 'Interested community members submit requests detailing their genuine need and intended use.' },
    { title: '4. Review & Accept', desc: 'Review receiver profiles, verified identity status, and approve the most deserving request.' },
    { title: '5. Coordinate Handover', desc: 'Use internal platform chat to align on pickup time, location, or courier details securely.' },
    { title: '6. Hand Over Item', desc: 'Transfer the item to the recipient and mark it as Handed Over in your donor dashboard.' },
    { title: '7. Confirm Completion', desc: 'Once the receiver confirms receipt, the donation transaction is permanently archived.' }
  ];

  const receiverSteps = [
    { title: '1. Register & Verify', desc: 'Join GiveCare as a receiver and submit student or identity credentials for priority matching.' },
    { title: '2. Browse Resource Listings', desc: 'Search by category, city, condition, and filter between 100% Free or subsidized transfers.' },
    { title: '3. Submit a Thoughtful Request', desc: 'Explain why you need the item, how it will be used, and accept the anti-resale agreement.' },
    { title: '4. Await Donor Approval', desc: 'The donor reviews your explanation and accepts the request.' },
    { title: '5. Coordinate Safe Pickup', desc: 'Chat directly with the donor to organize self-pickup, community drop-off, or shipping.' },
    { title: '6. Receive & Inspect Item', desc: 'Collect the item at the agreed location and verify condition matches the listing.' },
    { title: '7. Confirm Receipt', desc: 'Tap "Confirm Receipt" in your dashboard to close the handover and thank the donor.' }
  ];

  return (
    <div className="bg-cream-100 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-forest-700">Step-by-Step Guide</span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-charcoal-900 tracking-tight">
            How GiveCare Works
          </h1>
          <p className="text-sm sm:text-base text-charcoal-600 leading-relaxed">
            Our platform connects generous donors with people in genuine need through a simple, organized, transparent, and anti-misuse workflow.
          </p>
        </div>

        {/* Dual Workflows Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* For Donors */}
          <div className="bg-white rounded-3xl p-8 border border-cream-300 shadow-sm space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-cream-200">
              <div className="w-12 h-12 rounded-2xl bg-forest-100 text-forest-700 flex items-center justify-center font-bold">
                <Gift size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-charcoal-900">For Donors</h2>
                <p className="text-xs text-charcoal-500">How to give your unused resources a purposeful second life</p>
              </div>
            </div>

            <div className="space-y-4">
              {donorSteps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3.5 p-3 rounded-2xl hover:bg-cream-50 transition-colors">
                  <span className="w-7 h-7 rounded-xl bg-forest-700 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-charcoal-900">{step.title}</h4>
                    <p className="text-xs text-charcoal-600 mt-0.5 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <Link
                to="/donate"
                className="w-full text-center py-3 bg-forest-700 hover:bg-forest-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all block"
              >
                Upload an Item to Donate
              </Link>
            </div>
          </div>

          {/* For Receivers */}
          <div className="bg-white rounded-3xl p-8 border border-cream-300 shadow-sm space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-cream-200">
              <div className="w-12 h-12 rounded-2xl bg-amberGold-100 text-amberGold-600 flex items-center justify-center font-bold">
                <HeartHandshake size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-charcoal-900">For Receivers</h2>
                <p className="text-xs text-charcoal-500">How to request and receive resources you need</p>
              </div>
            </div>

            <div className="space-y-4">
              {receiverSteps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3.5 p-3 rounded-2xl hover:bg-cream-50 transition-colors">
                  <span className="w-7 h-7 rounded-xl bg-amberGold-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-charcoal-900">{step.title}</h4>
                    <p className="text-xs text-charcoal-600 mt-0.5 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <Link
                to="/donations"
                className="w-full text-center py-3 bg-white hover:bg-cream-200 text-charcoal-800 border border-cream-300 rounded-xl text-xs font-bold shadow-sm transition-all block"
              >
                Browse Available Donations
              </Link>
            </div>
          </div>

        </div>

        {/* Anti-Misuse Standards Box */}
        <div className="bg-forest-50 border border-forest-200 rounded-3xl p-8 space-y-4">
          <div className="flex items-center gap-2.5 text-forest-900">
            <ShieldCheck size={24} className="text-forest-700" />
            <h3 className="font-extrabold text-lg">Our Anti-Misuse & Transparency Guarantee</h3>
          </div>
          <p className="text-xs sm:text-sm text-charcoal-700 leading-relaxed">
            Every donated item is meant to assist individuals or community facilities in need. All members pledge under legally binding community terms that items obtained through free donation listings will never be commercialized, resold on external marketplaces, or hoarded for profit. Suspicious accounts are investigated by our administrators and immediately banned upon confirmation of resale behavior.
          </p>
        </div>

      </div>
    </div>
  );
};

export default HowItWorksPage;
