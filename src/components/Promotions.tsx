import { useState } from 'react';
import { motion } from 'motion/react';
import { Tag, Zap, Bell, CheckCircle2 } from 'lucide-react';
import { useCMS } from '../context/CMSContext';

const defaultOffers = [
  {
    id: 1,
    icon: <Tag className="w-6 h-6" />,
    title: 'Free Maintenance for 2 Years',
    description: 'Enjoy ZERO maintenance charges for the first 2 years of your flat ownership.',
    badge: 'Limited Time'
  },
  {
    id: 2,
    icon: <Zap className="w-6 h-6" />,
    title: 'Free Registry & GST',
    description: 'Special developer discount bearing Registry, GST & MPEB charges on spot bookings.',
    badge: 'Hot Deal'
  },
  {
    id: 3,
    icon: <Bell className="w-6 h-6" />,
    title: 'Book from ₹11,000 only',
    description: 'Lock your flat with just ₹11,000 initial booking amount + easy 95% bank loan support.',
    badge: 'Special Offer'
  }
];

export function Promotions({ onClaim }: { onClaim: (offers: string[]) => void }) {
  const [claimingId, setClaimingId] = useState<number | 'all' | null>(null);
  const { data: cms } = useCMS();

  const offers = defaultOffers.map(o => {
    if (o.id === 1 && cms.offer_text && cms.offer_text.trim() !== '') {
      return { ...o, description: cms.offer_text };
    }
    return o;
  });

  const handleClaimOffer = (offerId: number, title: string) => {
    setClaimingId(offerId);
    onClaim([title]);
    setTimeout(() => setClaimingId(null), 2000);
  };

  const handleClaimAll = () => {
    setClaimingId('all');
    onClaim(offers.map(o => o.title));
    setTimeout(() => setClaimingId(null), 2000);
  };

  return (
    <section id="offers-section" className="py-14 md:py-20 bg-paper scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-14">
          <motion.span 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-gold font-bold uppercase tracking-[0.3em] text-xs mb-2 block"
          >
            Exclusive Privileges
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl font-serif text-dark"
          >
            Current <span className="italic text-gold">Deals & Offers</span>
          </motion.h2>
          <p className="text-dark/60 text-xs sm:text-sm mt-2 max-w-lg mx-auto">
            Claim an offer below to automatically apply exclusive discounts to your site visit booking.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-8">
          {offers.map((offer, index) => (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="bg-white p-6 sm:p-8 rounded-3xl shadow-lg shadow-dark/5 border border-dark/5 relative group hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="absolute top-5 right-5 px-3 py-1 bg-dark text-white text-[10px] font-bold uppercase tracking-widest rounded-full">
                  {offer.badge}
                </div>
                
                <div className="w-12 h-12 bg-gold/10 rounded-2xl flex items-center justify-center text-gold mb-5 group-hover:bg-gold group-hover:text-dark transition-colors duration-300">
                  {offer.icon}
                </div>
                
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-dark mb-2">{offer.title}</h3>
                <p className="text-dark/60 text-sm leading-relaxed">{offer.description}</p>
              </div>
              
              <button 
                onClick={() => handleClaimOffer(offer.id, offer.title)}
                className="mt-6 py-2.5 px-4 bg-paper hover:bg-gold hover:text-dark text-xs font-bold uppercase tracking-wider text-dark rounded-xl flex items-center justify-center transition-all w-full border border-dark/10"
              >
                {claimingId === offer.id ? (
                  <span className="text-emerald-700 flex items-center gap-1.5 font-bold">
                    <CheckCircle2 className="w-4 h-4" /> Applied to Form
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    Claim Offer <Zap className="w-3.5 h-3.5 text-gold" />
                  </span>
                )}
              </button>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <motion.button
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            onClick={handleClaimAll}
            className="inline-flex items-center space-x-2 bg-gold text-dark px-7 py-3.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider hover:scale-105 transition-transform shadow-xl shadow-gold/20"
          >
            <span>{claimingId === 'all' ? 'All Offers Applied! ✓' : 'Claim All 3 Offers'}</span>
            {claimingId !== 'all' && <Tag className="w-4 h-4 ml-1" />}
          </motion.button>
        </div>
      </div>
    </section>
  );
}

