import { useState, useEffect, FormEvent, useRef } from 'react';
import { motion } from 'motion/react';
import { Send, CheckCircle2, Phone, MapPin, Mail, Sparkles, Quote, Check } from 'lucide-react';

const defaultOfferList = [
  'Free Maintenance for 2 Years',
  'Free Registry & GST',
  'Book from ₹11,000 only'
];

const FLAT_OPTIONS = ['1BHK', '2BHK', '3BHK'];

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
    location_pref: '',
    budget: '',
    message: '',
    claimed_offers: preselectedOffers
  });

  const [selectedFlats, setSelectedFlats] = useState<string[]>(['2BHK']);

  const formatPhoneNumber = (value: string) => {
    if (!value.startsWith('+91 ')) return '+91 ';
    const number = value.slice(4).replace(/\D/g, '');
    return '+91 ' + number.slice(0, 10);
  };

  const formatName = (value: string) => {
    return value.replace(/[0-9]/g, '');
  };

  useEffect(() => {
    setFormData(prev => ({ ...prev, claimed_offers: preselectedOffers }));
  }, [preselectedOffers]);

  const toggleFlatSelection = (flat: string) => {
    setSelectedFlats(prev => {
      if (prev.includes(flat)) {
        if (prev.length === 1) return prev;
        return prev.filter(f => f !== flat);
      } else {
        return [...prev, flat];
      }
    });
  };

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
          property_type: selectedFlats.join(', ')
        })
      });

      if (res.ok) {
        setStatus('success');
        setTimeout(() => {
          sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
        setFormData({ name: '', email: '', phone: '+91 ', location_pref: '', budget: '', message: '', claimed_offers: [] });
      } else {
        setStatus('error');
      }
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <section ref={sectionRef} className="py-8 sm:py-14 md:py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-dark rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border border-gold/20 flex flex-col lg:flex-row">
          
          {/* Left Column: Contact Details + Funny Motivating Quotes */}
          <div className="lg:w-5/12 p-5 sm:p-7 md:p-8 bg-gradient-to-b from-gold/15 via-gold/5 to-transparent flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/10">
            <div>
              <div className="flex items-center gap-1.5 text-gold text-xs font-bold uppercase tracking-widest mb-1.5">
                <Sparkles className="w-4 h-4 text-gold" /> Direct Connect
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-serif text-white mb-2">
                Let's Lock Your <span className="italic text-gold">Dream Flat.</span>
              </h2>
              <p className="text-white/60 text-xs sm:text-sm leading-relaxed mb-6">
                Fill out the form below. Get instant e-brochures on your email & book VIP site visits!
              </p>

              {/* Direct Contact Info */}
              <div className="space-y-3 mb-6 bg-white/5 border border-white/10 p-3.5 rounded-xl">
                <a 
                  href="tel:+917869612823" 
                  className="flex items-center space-x-3 text-white hover:text-gold transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-gold/20 flex items-center justify-center text-gold group-hover:scale-110 transition-transform">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-white/50 uppercase font-bold">Call Builder Directly</span>
                    <span className="text-xs sm:text-sm font-bold tracking-wide">+91 78696 12823</span>
                  </div>
                </a>

                <div className="flex items-center space-x-3 text-white">
                  <div className="w-8 h-8 rounded-lg bg-gold/20 flex items-center justify-center text-gold shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-white/50 uppercase font-bold">Location</span>
                    <span className="text-xs text-white/80">Rau, near Medicaps Univ, Indore</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-white">
                  <div className="w-8 h-8 rounded-lg bg-gold/20 flex items-center justify-center text-gold shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-white/50 uppercase font-bold">Email</span>
                    <span className="text-xs text-white/80">residencyayushman@gmail.com</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Funny & Motivating Quotes */}
            <div className="space-y-2.5 pt-2">
              <div className="bg-gold/10 border border-gold/30 rounded-xl p-3 text-xs text-gold/90 relative">
                <Quote className="w-4 h-4 text-gold/40 absolute top-2 right-2" />
                <p className="font-serif italic leading-snug pr-4">
                  "Rent dene me kya rakha hai sir, jab utne monthly EMI me khud ka 2/3 BHK flat ho sakta hai! 🔑"
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white/70 relative">
                <Quote className="w-4 h-4 text-white/30 absolute top-2 right-2" />
                <p className="font-serif italic leading-snug pr-4">
                  "Rishtedaar puche 'Beta flat kab le rahe ho?' usse pehle Ayushman Residency me book kar lo! 😉"
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form with Brochure Selection */}
          <div className="lg:w-7/12 p-5 sm:p-7 md:p-8">
            {status === 'success' ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full flex flex-col items-center justify-center text-center text-white py-8"
              >
                <div className="w-14 h-14 bg-gold rounded-full flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-7 h-7 text-dark" />
                </div>
                <h3 className="text-xl sm:text-2xl font-serif mb-2">Inquiry Received Successfully!</h3>
                <p className="text-white/60 text-xs sm:text-sm max-w-sm">
                  {formData.email
                    ? `Thank you! E-Brochures and floor plan layouts for ${selectedFlats.join(', ')} have been sent to ${formData.email}. Our team will call you shortly!`
                    : `Thank you! Our property consultant will call you shortly to discuss your requirements and arrange a site visit.`}
                </p>
                <button 
                  onClick={() => setStatus('idle')}
                  className="mt-5 text-gold font-bold text-xs underline underline-offset-4"
                >
                  Send another inquiry
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-white/60 text-[10.5px] font-bold uppercase tracking-wider block mb-1">
                      Full Name <span className="text-gold">*</span>
                    </label>
                    <input 
                      required
                      type="text" 
                      placeholder="Rahul Sharma"
                      className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:border-gold outline-none transition-colors"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: formatName(e.target.value)})}
                    />
                  </div>

                  <div>
                    <label className="text-white/60 text-[10.5px] font-bold uppercase tracking-wider block mb-1">
                      Phone Number <span className="text-gold">*</span>
                    </label>
                    <input 
                      required
                      type="tel" 
                      placeholder="+91 98765 43210"
                      className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:border-gold outline-none transition-colors"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: formatPhoneNumber(e.target.value)})}
                      minLength={14}
                      maxLength={14}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-white/60 text-[10.5px] font-bold uppercase tracking-wider block mb-1 flex items-center justify-between">
                      <span>Gmail / Email</span>
                      <span className="text-[9px] text-gold font-normal">Brochure will be sent here</span>
                    </label>
                    <input 
                      type="email" 
                      placeholder="name@gmail.com"
                      className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:border-gold outline-none transition-colors"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="text-white/60 text-[10.5px] font-bold uppercase tracking-wider block mb-1">Budget Range</label>
                    <input 
                      type="text" 
                      placeholder="e.g. ₹25 - ₹35 Lakhs"
                      className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:border-gold outline-none transition-colors"
                      value={formData.budget}
                      onChange={(e) => setFormData({...formData, budget: e.target.value})}
                    />
                  </div>
                </div>

                {/* Multiple Flats Choice for Brochure */}
                <div>
                  <label className="text-white/60 text-[10.5px] font-bold uppercase tracking-wider block mb-1 flex justify-between">
                    <span>Select Flat Brochures (Multiple Allowed) *</span>
                    <span className="text-[10px] text-gold">{selectedFlats.join(', ')}</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {FLAT_OPTIONS.map((flat) => {
                      const isSelected = selectedFlats.includes(flat);
                      return (
                        <button
                          key={flat}
                          type="button"
                          onClick={() => toggleFlatSelection(flat)}
                          className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                            isSelected
                              ? 'bg-gold text-dark shadow-md shadow-gold/20 font-extrabold'
                              : 'bg-white/5 border border-white/10 text-white/50 hover:text-white'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          <span>{flat}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-white/60 text-[10.5px] font-bold uppercase tracking-wider block mb-1">Preferred Location / Note</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Near Rau / Medicaps or specific requirement"
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:border-gold outline-none transition-colors"
                    value={formData.location_pref}
                    onChange={(e) => setFormData({...formData, location_pref: e.target.value})}
                  />
                </div>

                {/* Claim Offers */}
                <div id="offers-section" className="bg-white/5 border border-white/10 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-white/50 text-[10px] font-bold uppercase tracking-wider">Select Offers to Claim</label>
                    <button 
                      type="button" 
                      onClick={handleClaimAll}
                      className="text-[10px] font-bold text-gold hover:text-white transition-colors"
                    >
                      {formData.claimed_offers.length === offerList.length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {offerList.map(offer => (
                      <label key={offer} className="flex items-center space-x-2 cursor-pointer group">
                        <div className={`w-3.5 h-3.5 rounded flex items-center justify-center transition-colors border ${formData.claimed_offers.includes(offer) ? 'bg-gold border-gold' : 'border-white/20 group-hover:border-gold/50'}`}>
                          {formData.claimed_offers.includes(offer) && <CheckCircle2 className="w-2.5 h-2.5 text-dark" />}
                        </div>
                        <span className="text-[11px] text-white/70 group-hover:text-white transition-colors truncate">{offer}</span>
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

                <button 
                  disabled={status === 'submitting'}
                  type="submit"
                  className="w-full py-3 bg-gold text-dark text-xs font-bold rounded-xl hover:scale-[1.01] transition-all duration-300 flex items-center justify-center disabled:opacity-50 tracking-wider uppercase shadow-md shadow-gold/20"
                >
                  {status === 'submitting' ? 'Submitting & Sending E-Brochure...' : 'Get Selected E-Brochures & Request Call Back'}
                  <Send className="ml-2 w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
