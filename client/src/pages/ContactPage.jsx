import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, HelpCircle, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const ContactPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const faqs = [
    {
      q: 'Is GiveCare completely free to use?',
      a: 'Yes. Registering, browsing, listing items, and requesting free donations are 100% free of charge. Subsidized paid items feature transparent nominal pricing without any platform commission or hidden fee.'
    },
    {
      q: 'How does GiveCare prevent donated items from being resold for profit?',
      a: 'We require receivers to provide specific explanations of intended need, maintain donor verification badges, track complete handover histories, and maintain an active reporting system. Reselling items obtained through free listings violates platform terms and triggers immediate account suspension.'
    },
    {
      q: 'How is physical item pickup or delivery handled?',
      a: 'Once a donor accepts a request, both parties coordinate directly via the platform chat. You can arrange local in-person pickup in a safe public spot, use courier shipping (arranged between donor and receiver), or use a designated community drop-off point.'
    },
    {
      q: 'Can I both donate items and request items on the same account?',
      a: 'Absolutely! When signing up or editing your profile, select the "Both" account role. You can publish unused items from your home while simultaneously requesting items you need.'
    },
    {
      q: 'How do I earn a verified account badge?',
      a: 'Navigate to "My Profile & Verification" and upload a photo or scan of a recognized government ID, university student ID, or registered non-profit credential. Our admin moderation team verifies documents within 24-48 hours.'
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      toast.error('Please complete all contact fields.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/contact', {
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim(),
        message: message.trim()
      });

      if (res.data.success) {
        toast.success(res.data.message);
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not send message.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-cream-100 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-forest-700">Support & Feedback</span>
          <h1 className="text-4xl font-extrabold text-charcoal-900 tracking-tight">
            Contact Our Community Team
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-600">
            Have questions about identity verification, bulk NGO partnerships, or platform safety? Send us a note below.
          </p>
        </div>

        {/* Form & Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Contact Details & Direct Channels */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-cream-300 shadow-sm space-y-6">
              <h3 className="font-bold text-lg text-charcoal-900 pb-3 border-b border-cream-200">
                Direct Channels
              </h3>

              <div className="space-y-4 text-xs text-charcoal-700">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-forest-100 text-forest-700 flex items-center justify-center flex-shrink-0">
                    <Mail size={18} />
                  </div>
                  <div>
                    <strong className="block text-charcoal-900">Email Inquiries</strong>
                    <span className="text-charcoal-500">care@platform.org</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-forest-100 text-forest-700 flex items-center justify-center flex-shrink-0">
                    <Phone size={18} />
                  </div>
                  <div>
                    <strong className="block text-charcoal-900">Community Helpline</strong>
                    <span className="text-charcoal-500">+91 1800 200 4567 (Mon-Sat, 9AM-6PM)</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-forest-100 text-forest-700 flex items-center justify-center flex-shrink-0">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <strong className="block text-charcoal-900">Coordination Center</strong>
                    <span className="text-charcoal-500">14th Floor, Community Towers, BKC, Mumbai 400051</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-forest-50 border border-forest-200 rounded-2xl text-xs text-forest-800 space-y-1">
                <strong>Fastest Response for Reports:</strong>
                <p className="text-charcoal-600">
                  To report an active suspicious listing or account, use the "Report Listing" button on the item page for immediate administrative queuing.
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-7">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-cream-300 shadow-sm space-y-5">
              <h3 className="font-bold text-lg text-charcoal-900 pb-3 border-b border-cream-200">
                Send Us a Message
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                    Your Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Manoj Deshpande"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-forest-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-forest-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                  Subject <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bulk textbook donation from school library"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-forest-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                  Message <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows="4"
                  required
                  placeholder="Describe your inquiry or how we can assist you..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-forest-600"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-7 py-3 bg-forest-700 hover:bg-forest-800 text-white rounded-xl text-xs font-bold shadow-md shadow-forest-900/10 transition-all flex items-center gap-1.5 ${
                    submitting ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                >
                  <Send size={15} />
                  <span>{submitting ? 'Submitting...' : 'Send Inquiry'}</span>
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* FAQs Accordion */}
        <div className="bg-white rounded-3xl p-8 border border-cream-300 shadow-sm space-y-6">
          <div className="flex items-center gap-2">
            <HelpCircle size={22} className="text-forest-700" />
            <h2 className="text-xl font-bold text-charcoal-900">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="divide-y divide-cream-200">
            {faqs.map((faq, idx) => (
              <div key={idx} className="py-4">
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(openFaqIndex === idx ? -1 : idx)}
                  className="w-full flex items-center justify-between text-left font-bold text-sm text-charcoal-900 hover:text-forest-700 transition-colors"
                >
                  <span>{faq.q}</span>
                  {openFaqIndex === idx ? (
                    <ChevronUp size={18} className="text-forest-700 flex-shrink-0" />
                  ) : (
                    <ChevronDown size={18} className="text-charcoal-400 flex-shrink-0" />
                  )}
                </button>
                {openFaqIndex === idx && (
                  <p className="text-xs sm:text-sm text-charcoal-600 mt-2.5 leading-relaxed pr-6">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ContactPage;
