import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Send, CheckCircle2, Check, Mail, Tag } from 'lucide-react';

const FLAT_OPTIONS = ['1BHK', '2BHK', '3BHK'];

const BUDGET_OPTIONS = [
  '₹20 - ₹30 Lakhs',
  '₹30 - ₹40 Lakhs',
  '₹40 - ₹50 Lakhs',
  '₹50+ Lakhs'
];

const OFFER_OPTIONS = [
  { id: 'maint', label: 'Free 2-Yr Maint.' },
  { id: 'reg', label: 'Free Registry & GST' },
  { id: 'book', label: 'Book @ ₹11k Only' }
];

export function HeroPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    phone: '+91 ',
    email: '',
    budget: '₹20 - ₹30 Lakhs',
  });

  const [selectedFlats, setSelectedFlats] = useState<string[]>(['2BHK']);
  const [selectedOffers, setSelectedOffers] = useState<string[]>(['Free 2-Yr Maint.']);

  useEffect(() => {
    if (sessionStorage.getItem('hero_popup_dismissed') === 'true') {
      return;
    }

    const handleUserActivity = () => {
      setHasInteracted(true);
      window.removeEventListener('scroll', handleUserActivity);
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('touchstart', handleUserActivity);
    };

    window.addEventListener('scroll', handleUserActivity, { passive: true });
    window.addEventListener('mousemove', handleUserActivity, { passive: true });
    window.addEventListener('touchstart', handleUserActivity, { passive: true });

    const timer = setTimeout(() => {
      if (hasInteracted) {
        setIsOpen(true);
      } else {
        const fallbackTimer = setTimeout(() => {
          setIsOpen(true);
        }, 2000);
        return () => clearTimeout(fallbackTimer);
      }
    }, 5000);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleUserActivity);
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('touchstart', handleUserActivity);
    };
  }, [hasInteracted]);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('hero_popup_dismissed', 'true');
  };

  const formatPhoneNumber = (value: string) => {
    if (!value.startsWith('+91 ')) return '+91 ';
    const number = value.slice(4).replace(/\D/g, '');
    return '+91 ' + number.slice(0, 10);
  };

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

  const toggleOfferSelection = (offerLabel: string) => {
    setSelectedOffers(prev => {
      if (prev.includes(offerLabel)) {
        return prev.filter(o => o !== offerLabel);
      } else {
        return [...prev, offerLabel];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.phone.trim().length < 14) {
      setErrorMessage('Please enter a valid 10-digit mobile number');
      setStatus('error');
      return;
    }

    setStatus('submitting');
    setErrorMessage('');

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          budget: formData.budget,
          property_type: selectedFlats.join(', '),
          claimed_offers: selectedOffers,
          message: `Popup Inquiry for ${selectedFlats.join(', ')} with budget ${formData.budget}`
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to submit inquiry');
      }

      setStatus('success');
      setTimeout(() => {
        handleClose();
      }, 3000);
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 15 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="relative w-full max-w-md bg-dark border border-gold/40 rounded-2xl p-4 sm:p-5 shadow-2xl text-white overflow-hidden max-h-[85vh] flex flex-col justify-center"
          >
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-gold/10 rounded-full blur-2xl pointer-events-none -mr-12 -mt-12" />

            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors z-20"
              aria-label="Close form"
            >
              <X className="w-4 h-4" />
            </button>

            {status === 'success' ? (
              <div className="text-center py-5">
                <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-2.5 border border-emerald-500/30">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-serif font-bold text-white mb-1">Inquiry Submitted!</h3>
                <p className="text-white/70 text-xs leading-relaxed max-w-xs mx-auto">
                  {formData.email
                    ? `Official brochures for ${selectedFlats.join(', ')} have been sent to ${formData.email}. Our team will call you shortly!`
                    : `Thank you! Our property consultant will contact you shortly with prices and VIP site visit arrangements.`}
                </p>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-1.5 text-gold text-[10px] font-bold uppercase tracking-widest mb-0.5">
                  <Sparkles className="w-3 h-3" /> Priority Visit & E-Brochure
                </div>
                <h3 className="text-base sm:text-lg font-serif font-bold text-white mb-0.5">
                  Book Site Visit & Get Brochure
                </h3>
                <p className="text-white/50 text-[11px] mb-3 leading-tight">
                  Instant pricing & PDF brochures sent directly to your mobile / email.
                </p>

                <form onSubmit={handleSubmit} className="space-y-2.5 text-left">
                  {/* Name & Phone in 2 cols */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] uppercase font-bold tracking-wider text-white/70 mb-0.5">
                        Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Rahul Sharma"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white/5 border border-white/15 rounded-lg text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-gold transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold tracking-wider text-white/70 mb-0.5">
                        Mobile *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: formatPhoneNumber(e.target.value) })}
                        className="w-full px-2.5 py-1.5 bg-white/5 border border-white/15 rounded-lg text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-gold transition-colors"
                      />
                    </div>
                  </div>

                  {/* Email & Budget in 2 cols */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] uppercase font-bold tracking-wider text-white/70 mb-0.5 flex justify-between">
                        <span>Email</span>
                        <span className="text-[9px] text-white/40">Optional</span>
                      </label>
                      <input
                        type="email"
                        placeholder="name@gmail.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white/5 border border-white/15 rounded-lg text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-gold transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold tracking-wider text-white/70 mb-0.5 flex justify-between">
                        <span>Budget</span>
                        <span className="text-[9px] text-white/40">Optional</span>
                      </label>
                      <select
                        value={formData.budget}
                        onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                        className="w-full px-2 py-1.5 bg-dark border border-white/15 rounded-lg text-white text-xs focus:outline-none focus:border-gold transition-colors cursor-pointer"
                      >
                        {BUDGET_OPTIONS.map((b) => (
                          <option key={b} value={b} className="bg-dark text-white">
                            {b}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Multiple Flats Selection */}
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-white/70 mb-1 flex justify-between items-center">
                      <span>Select Flats</span>
                      <span className="text-[9px] text-gold font-normal">Multiple allowed</span>
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {FLAT_OPTIONS.map((flat) => {
                        const isSelected = selectedFlats.includes(flat);
                        return (
                          <button
                            key={flat}
                            type="button"
                            onClick={() => toggleFlatSelection(flat)}
                            className={`py-1 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                              isSelected
                                ? 'bg-gold text-dark shadow-sm shadow-gold/20 font-extrabold'
                                : 'bg-white/5 border border-white/10 text-white/50 hover:text-white'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            <span>{flat}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Multiple Offers Selection */}
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-white/70 mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1"><Tag className="w-2.5 h-2.5 text-gold" /> Claim Offers</span>
                      <span className="text-[9px] text-white/40">Optional</span>
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {OFFER_OPTIONS.map((offer) => {
                        const isSelected = selectedOffers.includes(offer.label);
                        return (
                          <button
                            key={offer.id}
                            type="button"
                            onClick={() => toggleOfferSelection(offer.label)}
                            className={`py-1 px-1.5 rounded-lg text-[10.5px] font-medium transition-all text-center border truncate ${
                              isSelected
                                ? 'bg-gold/15 border-gold text-gold font-bold'
                                : 'bg-white/5 border-white/10 text-white/50 hover:text-white'
                            }`}
                            title={offer.label}
                          >
                            {offer.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {status === 'error' && (
                    <div className="p-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-[11px]">
                      {errorMessage}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'submitting'}
                    className="w-full py-2.5 mt-1 bg-gold hover:bg-gold/90 text-dark font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md shadow-gold/20 disabled:opacity-50"
                  >
                    {status === 'submitting' ? (
                      <span className="animate-pulse">Submitting...</span>
                    ) : (
                      <>
                        <span>Get Instant Details</span>
                        <Send className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
