import { useState, useEffect, FormEvent, useRef } from 'react';
import { motion } from 'motion/react';
import { Send, CheckCircle2 } from 'lucide-react';

const defaultOfferList = [
  'Free Maintenance for 2 Years',
  'Free Registry & GST',
  'Book from ₹11,000 only'
];

export function LeadForm({ preselectedOffers = [] }: { preselectedOffers?: string[] }) {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const sectionRef = useRef<HTMLElement>(null);
  const [cms, setCms] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch('/api/cms').then(r => r.json()).then(setCms).catch(console.error);
  }, []);

  const offerList = cms.offer_text && cms.offer_text.trim() !== '' ? [...defaultOfferList, cms.offer_text] : defaultOfferList;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '+91 ',
    property_type: '2BHK',
    location_pref: '',
    budget: '',
    message: '',
    referral: '',
    claimed_offers: preselectedOffers
  });

  const formatPhoneNumber = (value: string) => {
    if (!value.startsWith('+91 ')) return '+91 ';
    const number = value.slice(4).replace(/\D/g, '');
    return '+91 ' + number.slice(0, 10);
  };

  const formatName = (value: string) => {
    // Remove all numeric digits
    return value.replace(/[0-9]/g, '');
  };

  useEffect(() => {
    setFormData(prev => ({ ...prev, claimed_offers: preselectedOffers }));
  }, [preselectedOffers]);

  const handleClaimAll = () => {
    if (formData.claimed_offers.length === offerList.length) {
      setFormData(prev => ({ ...prev, claimed_offers: [] }));
    } else {
      setFormData(prev => ({ ...prev, claimed_offers: offerList }));
    }
  };

  const handleOfferToggle = (offer: string) => {
    setFormData(prev => {
      const isSelected = prev.claimed_offers.includes(offer);
      if (isSelected) {
        return { ...prev, claimed_offers: prev.claimed_offers.filter(o => o !== offer) };
      } else {
        return { ...prev, claimed_offers: [...prev.claimed_offers, offer] };
      }
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validate phone number length (prefix + 10 digits = 14 chars)
    if (formData.phone.length < 14) {
      alert('Please enter a valid 10-digit phone number');
      return;
    }

    setStatus('submitting');
    
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          referral: formData.referral.trim()
        })
      });
      
      if (res.ok) {
        setStatus('success');
        setTimeout(() => {
          sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
        setFormData({ name: '', email: '', phone: '+91 ', property_type: '2BHK', location_pref: '', budget: '', message: '', referral: '', claimed_offers: [] });
      } else {
        setStatus('error');
      }
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <section ref={sectionRef} className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-dark rounded-[3rem] overflow-hidden shadow-2xl flex flex-col lg:flex-row">
          <div className="lg:w-1/3 p-12 lg:p-20 bg-gold flex flex-col justify-between">
            <div>
              <h2 className="text-4xl md:text-5xl font-serif text-dark mb-6">Let's Find Your <span className="italic">Dream Home.</span></h2>
              <p className="text-dark/70 text-lg leading-relaxed">
                Fill out the form and our senior property consultant will get in touch with you within 24 hours.
              </p>
            </div>
            
            <div className="mt-12 space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-dark/10 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-dark" />
                </div>
                <span className="font-bold text-dark">Personalized Site Visit</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-dark/10 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-dark" />
                </div>
                <span className="font-bold text-dark">Exclusive Launch Offers</span>
              </div>
            </div>
          </div>

          <div className="lg:w-2/3 p-12 lg:p-20">
            {status === 'success' ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full flex flex-col items-center justify-center text-center text-white"
              >
                <div className="w-20 h-20 bg-gold rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-10 h-10 text-dark" />
                </div>
                <h3 className="text-3xl font-serif mb-4">Inquiry Received Successfully!</h3>
                <p className="text-white/60 max-w-md">Thank you for your interest in Ayushmaan Residency. Our senior property consultant will reach out to you within 24 hours to discuss your requirements and schedule your personalized site visit.</p>
                <button 
                  onClick={() => setStatus('idle')}
                  className="mt-8 text-gold font-bold underline underline-offset-8"
                >
                  Send another inquiry
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-white/40 text-xs font-bold uppercase tracking-widest flex items-center gap-1">
                    Full Name <span className="text-gold">*</span>
                  </label>
                  <input 
                    required
                    type="text" 
                    placeholder="John Doe"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-white focus:border-gold outline-none transition-colors"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: formatName(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-white/40 text-xs font-bold uppercase tracking-widest">Referral (Broker Name)</label>
                  <input 
                    type="text" 
                    placeholder="Enter Broker Name (If any)"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-white focus:border-gold outline-none transition-colors"
                    value={formData.referral}
                    onChange={(e) => setFormData({...formData, referral: formatName(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-white/40 text-xs font-bold uppercase tracking-widest flex items-center gap-1">
                    Phone Number <span className="text-gold">*</span>
                  </label>
                  <input 
                    required
                    type="tel" 
                    placeholder="+91 98765 43210"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-white focus:border-gold outline-none transition-colors"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: formatPhoneNumber(e.target.value)})}
                    minLength={14}
                    maxLength={14}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-white/40 text-xs font-bold uppercase tracking-widest">Property Type</label>
                  <select 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-white focus:border-gold outline-none transition-colors appearance-none"
                    style={{ backgroundColor: '#111' }} /* Ensures dropdown context is dark */
                    value={formData.property_type}
                    onChange={(e) => setFormData({...formData, property_type: e.target.value})}
                  >
                    <option value="2BHK" className="bg-dark text-white">2 BHK Executive</option>
                    <option value="3BHK" className="bg-dark text-white">3 BHK Premium</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-white/40 text-xs font-bold uppercase tracking-widest">Budget Range</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 80L - 1Cr"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-white focus:border-gold outline-none transition-colors"
                    value={formData.budget}
                    onChange={(e) => setFormData({...formData, budget: e.target.value})}
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-white/40 text-xs font-bold uppercase tracking-widest">Preferred Location</label>
                  <input 
                    type="text" 
                    placeholder="City, Area, or Landmark"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-white focus:border-gold outline-none transition-colors"
                    value={formData.location_pref}
                    onChange={(e) => setFormData({...formData, location_pref: e.target.value})}
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-white/40 text-xs font-bold uppercase tracking-widest">Additional Message</label>
                  <textarea 
                    rows={4}
                    placeholder="Tell us more about your requirements..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-white focus:border-gold outline-none transition-colors resize-none"
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                  />
                </div>

                <div id="offers-section" className="md:col-span-2 space-y-4 bg-white/5 border border-white/10 rounded-xl p-6 scroll-mt-32">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-white/40 text-xs font-bold uppercase tracking-widest">Select Offers to Claim</label>
                    <button 
                      type="button" 
                      onClick={handleClaimAll}
                      className="text-xs font-bold text-gold hover:text-white transition-colors"
                    >
                      {formData.claimed_offers.length === offerList.length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {offerList.map(offer => (
                      <label key={offer} className="flex items-center space-x-3 cursor-pointer group">
                        <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors border ${formData.claimed_offers.includes(offer) ? 'bg-gold border-gold' : 'border-white/20 group-hover:border-gold/50'}`}>
                          {formData.claimed_offers.includes(offer) && <CheckCircle2 className="w-3 h-3 text-dark" />}
                        </div>
                        <span className="text-sm text-white/80 group-hover:text-white transition-colors">{offer}</span>
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={formData.claimed_offers.includes(offer)}
                          onChange={() => handleOfferToggle(offer)}
                        />
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <button 
                    disabled={status === 'submitting'}
                    type="submit"
                    className="w-full py-5 bg-gold text-dark font-bold rounded-xl hover:scale-[1.02] transition-all duration-300 flex items-center justify-center disabled:opacity-50"
                  >
                    {status === 'submitting' ? 'Processing...' : 'Submit Inquiry'}
                    <Send className="ml-2 w-5 h-5" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
