import { motion } from 'motion/react';
import { 
  ShieldCheck, Home, Banknote, Wind, Droplets, Users, TrendingUp, TreePine, Sparkles 
} from 'lucide-react';

const benefits = [
  {
    id: 1,
    icon: <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />,
    title: 'Secure Living',
    description: '24x7 Security, CCTV Covered Campus, Single Gated Entry.',
    color: 'bg-blue-50 text-blue-600'
  },
  {
    id: 2,
    icon: <Home className="w-5 h-5 sm:w-6 sm:h-6" />,
    title: 'Ready to Move',
    description: 'Planned 2 & 3 BHK Luxury Flats with Instant Possession.',
    color: 'bg-emerald-50 text-emerald-600'
  },
  {
    id: 3,
    icon: <Banknote className="w-5 h-5 sm:w-6 sm:h-6" />,
    title: 'Easy Financing',
    description: 'Up to 95% Loan available from all nationalized & private banks.',
    color: 'bg-indigo-50 text-indigo-600'
  },
  {
    id: 4,
    icon: <Wind className="w-5 h-5 sm:w-6 sm:h-6" />,
    title: 'Air & Light',
    description: '50-ft building gaps ensure fresh airflow and natural daylight.',
    color: 'bg-cyan-50 text-cyan-600'
  },
  {
    id: 5,
    icon: <Droplets className="w-5 h-5 sm:w-6 sm:h-6" />,
    title: '24/7 Utilities',
    description: 'Uninterrupted 24-hour sweet water and electricity supply.',
    color: 'bg-amber-50 text-amber-600'
  },
  {
    id: 6,
    icon: <Users className="w-5 h-5 sm:w-6 sm:h-6" />,
    title: '400+ Families',
    description: 'Join over 400+ happy families living peacefully in the society.',
    color: 'bg-orange-50 text-orange-600'
  },
  {
    id: 7,
    icon: <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />,
    title: 'High ROI Growth',
    description: 'Rapidly appreciating Rau prime location near Medicaps & AB Road.',
    color: 'bg-rose-50 text-rose-600'
  },
  {
    id: 8,
    icon: <TreePine className="w-5 h-5 sm:w-6 sm:h-6" />,
    title: 'Green Amenities',
    description: 'Mahadev temple, lush gardens, 50-ft wide internal roads & parking.',
    color: 'bg-emerald-50 text-emerald-600'
  }
];

export function WhyChooseUs() {
  return (
    <section id="why-choose-us" className="py-14 md:py-20 bg-paper scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-14">
          <motion.span 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-gold font-bold uppercase tracking-[0.3em] text-xs mb-2 block"
          >
            Exclusive Advantages
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl font-serif text-dark"
          >
            Why Choose <span className="italic text-gold">Ayushman Residency?</span>
          </motion.h2>
        </div>

        {/* Compact 2-column on mobile, 4-column on desktop */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-md shadow-dark/5 border border-dark/5 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mb-3 sm:mb-4 ${benefit.color}`}>
                  {benefit.icon}
                </div>
                <h3 className="text-sm sm:text-lg font-serif font-bold text-dark mb-1 sm:mb-2 line-clamp-1">
                  {benefit.title}
                </h3>
                <p className="text-dark/60 text-xs sm:text-sm leading-snug sm:leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
