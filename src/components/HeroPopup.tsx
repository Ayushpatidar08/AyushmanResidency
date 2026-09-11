import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Send, CheckCircle2 } from 'lucide-react';

export function HeroPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '+91 ',
    property_type: '2BHK',
    claimed_offers: ['Special Priority Site Visit']
  });

  useEffect(() => {
    // Check if user already dismissed popup in this session
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
      // Only pop up if user has interacted/scrolled
      if (hasInteracted) {
        setIsOpen(true);
      } else {
        // Wait another 2 seconds for interaction check
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
          ...formData,
          email: '',
          message: 'Quick Inquiry Popup from Website Visitor'
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="relative w-full max-w-md bg-dark border border-gold/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-white overflow-hidden"
          >
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-gold/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gold/5 rounded-full blur-3xl pointer-events-none -ml-16 -mb-16" />

            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors"
              aria-label="Close form"
            >
              <X className="w-5 h-5" />
            </button>

            {status === 'success' ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-serif font-bold text-white mb-2">Inquiry Received!</h3>
                <p className="text-white/60 text-sm">
                  Our property consultant will contact you shortly with exclusive prices and availability.
                </p>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2 text-gold text-xs font-bold uppercase tracking-widest mb-2">
                  <Sparkles className="w-4 h-4" /> Quick Priority Visit
                </div>
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-2">
                  Book a Site Visit
                </h3>
                <p className="text-white/60 text-xs sm:text-sm mb-6 leading-relaxed">
                  Get instant pricing, payment schedule & a complimentary VIP site visit at Ayushman Residency, Rau.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs uppercase font-bold tracking-wider text-white/70 mb-1.5">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-gold transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase font-bold tracking-wider text-white/70 mb-1.5">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: formatPhoneNumber(e.target.value) })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-gold transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase font-bold tracking-wider text-white/70 mb-1.5">
                      Interested Configuration
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {['1BHK', '2BHK', '3BHK'].map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setFormData({ ...formData, property_type: type })}
                          className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                            formData.property_type === type
                              ? 'bg-gold text-dark shadow-md shadow-gold/20'
                              : 'bg-white/5 border border-white/10 text-white/60 hover:text-white'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  {status === 'error' && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">
                      {errorMessage}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'submitting'}
                    className="w-full py-3.5 mt-2 bg-gold hover:bg-gold/90 text-dark font-bold text-sm uppercase tracking-wider rounded-xl transition-all hover:scale-[1.02] flex items-center justify-center gap-2 shadow-lg shadow-gold/20 disabled:opacity-50"
                  >
                    {status === 'submitting' ? (
                      <span className="animate-pulse">Submitting...</span>
                    ) : (
                      <>
                        <span>Get Instant Details</span>
                        <Send className="w-4 h-4" />
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
