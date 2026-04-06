import { useState } from 'react';
import { color, motion } from 'motion/react';
import { Tag, Zap, Bell, ShieldCheck, Home, Banknote, Car, TreePine, Wind, Droplets, Users, TrendingUp, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const benefits = [
  {
    id: 1,
    icon: <ShieldCheck className="w-8 h-8" />,
    title: 'Secure Living',
    description: '24x7 Security, CCTV Covered Campus, and a Single Gated Entry/Exit for Total Safety.',
    color: 'bg-blue-50 text-blue-600'
  },
  {
    id: 2,
    icon: <Home className="w-8 h-8" />,
    title: 'Ready to Move',
    description: 'Beautifully planned 2 & 3 BHK Luxury Flats with Instant Possession available.',
    color: 'bg-emerald-50 text-emerald-600'
  },
  {
    id: 3,
    icon: <Banknote className="w-8 h-8" />,
    title: 'Easy Financing',
    description: 'Up To 95 Loan Available From All Major Banks Perfect For First Time Buyers.',
    color: 'bg-indigo-50 text-indigo-600'
  },
  {
    id: 4,
    icon: <Wind className="w-8 h-8" />,
    title: 'Superior Ventilation',
    description: '50 Feet Wide Gaps between Buildings ensure Natural Light and Fresh Air and get the Ventilation Gaps on the Floor and Flats.',
    color: 'bg-cyan-50 text-cyan-600'
  },
  {
    id: 5,
    icon: <Droplets className="w-8 h-8" />,
    title: '24/7 Utilities',
    description: 'Enjoy uninterrupted 24 Hour Water And Electricity Supply for a hassle-free lifestyle.',
    color: 'bg-amber-50 text-amber-600'
  },
  {
    id: 6,
    icon: <Users className="w-8 h-8" />,
    title: 'Thriving Community',
    description: 'Join over 400+ Families Already Living Peacefully in our established residency.',
    color: 'bg-orange-50 text-orange-600'
  },
  {
    id: 7,
    icon: <TrendingUp className="w-8 h-8" />,
    title: 'Investment Gold',
    description: 'High appreciation potential makes it the Best Opportunity For Real Estate Investment',
    color: 'bg-rose-50 text-rose-600'
  },
  {
    id: 8,
    icon: <TreePine className="w-8 h-8" />,
    title: 'Premium Amenities',
    description: 'Lush green gardens, Mahadev temple, 50-feet wide roads, and ample parking space.',
    color: 'bg-emerald-50 text-emerald-600'
  },
  {
    id: 10,
    icon: <Sparkles className="w-8 h-8" />,
    title: 'Luxury Lifestyle',
    description: 'Premium Architecture With High End Finishes Designed For A Modern Standard Of Living',
    color: 'bg-gold/10 text-gold'
  }
];

const offers = [
  {
    id: 1,
    icon: <Tag className="w-6 h-6" />,
    title: 'Free Maintenance for 2 Years',
    description: 'Enjoy ZERO MAINTENANCE charges for the First Two Yearsof your flat ownership.',
    badge: 'Limited Time'
  },
  {
    id: 2,
    icon: <Zap className="w-6 h-6" />,
    title: 'Free Registry & GST',
    description: 'We bear the Registry, GST, and MPEB charges! Huge savings on your property purchase.',
    badge: 'Hot Deal'
  },
  {
    id: 3,
    icon: <Bell className="w-6 h-6" />,
    title: 'Book from ₹11,000 only',
    description: 'Secure your dream home with just ₹11,000 initial booking amount and get up to 95 LOAN AVAILABLE.',
    badge: 'Limited Offer'
  }
];

export function Promotions({ onClaim }: { onClaim: (offers: string[]) => void }) {
  const [claimingId, setClaimingId] = useState<number | 'all' | null>(null);

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
    <section className="py-24 bg-paper overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.span 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-gold font-bold uppercase tracking-[0.4em] text-xs mb-4 block"
          >
            Exclusive Benefits
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-serif text-dark"
          >
            Why Choose <span className="italic">Ayushman Residency?</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-32">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-8 rounded-[2rem] shadow-lg shadow-dark/5 border border-dark/5 hover:-translate-y-2 transition-all duration-300 group"
            >
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${benefit.color}`}>
                {benefit.icon}
              </div>
              <h3 className="text-xl font-serif font-bold mb-3">{benefit.title}</h3>
              <p className="text-dark/60 text-sm leading-relaxed">{benefit.description}</p>
            </motion.div>
          ))}
        </div>

        <div className="text-center mb-16">
          <motion.span 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-gold font-bold uppercase tracking-[0.4em] text-xs mb-4 block"
          >
            Special Rewards
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-serif text-dark"
          >
            Current <span className="italic">Deals & Offers</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {offers.map((offer, index) => (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-dark/5 border border-dark/5 relative group hover:-translate-y-2 transition-all duration-500"
            >
              <div className="absolute top-6 right-6 px-3 py-1 bg-dark text-white text-[10px] font-bold uppercase tracking-widest rounded-full">
                {offer.badge}
              </div>
              
              <div className="w-14 h-14 bg-gold/10 rounded-2xl flex items-center justify-center text-gold mb-8 group-hover:bg-gold group-hover:text-dark transition-colors duration-300">
                {offer.icon}
              </div>
              
              <h3 className="text-2xl font-serif font-bold mb-4">{offer.title}</h3>
              <p className="text-dark/60 leading-relaxed">{offer.description}</p>
              
              <button 
                onClick={() => handleClaimOffer(offer.id, offer.title)}
                className="mt-8 text-sm font-bold text-gold flex items-center group-hover:translate-x-2 transition-transform"
              >
                {claimingId === offer.id ? 'Claimed! ✓' : 'Claim Offer'} 
                {claimingId !== offer.id && <Zap className="ml-2 w-4 h-4" />}
              </button>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 flex justify-center">
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            onClick={handleClaimAll}
            className="inline-flex items-center space-x-2 bg-gold text-dark px-8 py-4 rounded-full font-bold hover:scale-105 transition-transform shadow-xl shadow-gold/20"
          >
            <span>{claimingId === 'all' ? 'All Offers Claimed! ✓' : 'Claim All Offers'}</span>
            {claimingId !== 'all' && <Tag className="w-5 h-5 ml-2" />}
          </motion.button>
        </div>
      </div>
    </section>
  );
}
