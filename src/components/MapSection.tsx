import { motion, AnimatePresence, useInView } from 'motion/react';
import { 
  MapPin, Navigation, School, Landmark, GraduationCap, 
  Train, Plane, HeartPulse, ShieldPlus, ShoppingCart, 
  Utensils, Film, Trees, ArrowRight, Compass, Info,
  LucideUniversity,
  ShoppingBagIcon
} from 'lucide-react';
import { useState, useRef, lazy, Suspense } from 'react';

const LazyLeafletMap = lazy(() => import('./LeafletMap'));

type Category = 'education' | 'transport' | 'healthcare' | 'lifestyle';

interface Amenity {
  name: string;
  dist: string;
  icon: any;
  desc: string;
}

const AMENITIES: Record<Category, Amenity[]> = {
  education: [
    { name: "Medicaps University", dist: "0.5 m", icon: GraduationCap, desc: "A leading technical institute right at your doorstep." },
    { name: "IIM Indore", dist: "3.0 km", icon: Landmark, desc: "Premier management institute reachable in minutes." },
    { name: "Medicaps International School", dist: "0.3 m", icon: School, desc: "Top-tier international schooling for your kids." },
    { name: "La Sagesse School", dist: "0.3 km", icon: School, desc: "Excellent secondary education within easy reach." },
    { name: "Emerald Heights International School", dist: "4.5 km", icon: School, desc: "Excellent secondary education within easy reach." },
  ],
  transport: [
    { name: "AB Road (NH-52)", dist: "1.0 km", icon: Navigation, desc: "Seamless connectivity to Indore and Mhow." },
    { name: "Rau Railway Station", dist: "2.0 km", icon: Train, desc: "Local transit access for long-distance travel." },
    { name: "Indore Airport", dist: "18.4 km", icon: Plane, desc: "Quick access to domestic and international flights." },
  ],
  healthcare: [
    { name: "Shree Minesh Hospital", dist: "1.5 km", icon: HeartPulse, desc: "Comprehensive medical care nearby for emergencies." },
    { name: "24x7 Multi-Speciality", dist: "1.5 km", icon: ShieldPlus, desc: "Round-the-clock intensive care and services." },
    { name: "Govt Civil Hospital", dist: "5.0 km", icon: Landmark, desc: "Secondary care facilities in Mhow." },
    { name: "Choithram Hospital", dist: "12.0 km", icon: Landmark, desc: "Secondary care facilities in Indore." },
  ],
  lifestyle: [
    { name: "D-mart & Markets", dist: "1.5 km", icon: ShoppingCart, desc: "One-stop destination for all your daily needs." },
    { name: "Trinity Mall", dist: "3.2 km", icon: ShoppingBagIcon, desc: "Shopping, dining, and premium entertainment." },
    { name: "Famous Restaurants", dist: "1.2 km", icon: Utensils, desc: "Fine dining, cafes and restaurants." },
    { name: "The Red Maple Mashal- Hill Hotel", dist: "0.5 km", icon: Utensils, desc: "Fine dining, cafes and restaurants." },
    { name: "Fundore Cinema", dist: "1.0 km", icon: Film, desc: "Enjoy the latest blockbusters with family." },
    { name: "Regional Park", dist: "9.0 km", icon: Trees, desc: "Serene greenery for your morning and evening walks." },
  ],
};

const CATEGORIES: { id: Category; label: string; icon: any }[] = [
  { id: 'education', label: 'Knowledge Hub', icon: School },
  { id: 'transport', label: 'Connectivity', icon: Navigation },
  { id: 'healthcare', label: 'Wellness', icon: HeartPulse },
  { id: 'lifestyle', label: 'Lifestyle', icon: ShoppingCart },
];

import { useCMS } from '../context/CMSContext';

export function MapSection() {
  const { data: cms } = useCMS();
  const position: [number, number] = [22.6141681, 75.8087054];
  const [activeTab, setActiveTab] = useState<Category>('education');
  const mapRef = useRef<HTMLDivElement>(null);
  const isMapInView = useInView(mapRef, { once: true, margin: "200px" });

  return (
    <section className="py-8 sm:py-12 bg-dark relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
        <div className="absolute top-1/4 -left-24 w-96 h-96 bg-gold/30 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-1/4 -right-24 w-96 h-96 bg-gold/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-6 gap-4">
          <div>
            <motion.span 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="text-gold font-bold uppercase tracking-[0.3em] text-[10px] sm:text-xs mb-1 block"
            >
              The Neighborhood Nexus
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-2xl sm:text-3xl md:text-4xl font-serif text-white leading-tight"
            >
              Location & <span className="italic text-gold">Connectivity</span>
            </motion.h2>
          </div>
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="flex flex-wrap gap-1.5 bg-white/5 p-1.5 rounded-xl border border-white/10 backdrop-blur-xl"
          >
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 ${
                  activeTab === cat.id 
                    ? 'bg-gold text-dark shadow-md shadow-gold/20' 
                    : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}
              >
                <cat.icon className="w-3.5 h-3.5" />
                {cat.label}
              </button>
            ))}
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-stretch">
          {/* Amenity List & Address Panel */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-3">
            <div className="space-y-2 max-h-[220px] sm:max-h-[260px] overflow-y-auto pr-1 custom-scrollbar">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-2"
                >
                  {AMENITIES[activeTab].map((item, idx) => (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      className="group p-2.5 bg-white/5 rounded-xl border border-white/10 hover:border-gold/50 hover:bg-white/[0.08] transition-all duration-300 flex items-center gap-3"
                    >
                      <div className="p-1.5 bg-gold/10 rounded-lg shrink-0">
                        <item.icon className="w-4 h-4 text-gold" />
                      </div>
                      <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                        <h4 className="font-bold text-white text-xs sm:text-sm group-hover:text-gold transition-colors truncate">{item.name}</h4>
                        <span className="px-2 py-0.5 bg-white/5 rounded-full text-[10px] font-black uppercase tracking-wider text-gold/80 border border-gold/20 shrink-0">
                          {item.dist}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Clear Address & Destination Card */}
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="p-3.5 sm:p-4 bg-gradient-to-br from-gold/15 to-white/5 rounded-2xl border border-gold/20 relative group overflow-hidden"
            >
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 text-gold font-bold text-[10px] uppercase tracking-widest">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Ayushman Residency, Rau
                  </div>
                  <span className="text-[10px] text-white/50">Near Medi-Caps University</span>
                </div>

                <div className="grid grid-cols-2 gap-2 my-2 p-2 bg-black/40 rounded-xl border border-white/5 text-center">
                  <div>
                    <p className="text-white/40 text-[9px] font-bold uppercase">NH-52 Highway</p>
                    <p className="text-gold text-sm font-black">1.0 km</p>
                  </div>
                  <div>
                    <p className="text-white/40 text-[9px] font-bold uppercase">Airport Drive</p>
                    <p className="text-gold text-sm font-black">25 Mins</p>
                  </div>
                </div>

                <a 
                  href={cms.all_location_link || "https://maps.app.goo.gl/EUKjJBXYGgxubYUm8"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2 bg-gold hover:bg-white text-dark rounded-lg font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-md shadow-gold/20"
                >
                  <span>Open Google Maps Directions</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </motion.div>
          </div>

          {/* Interactive Map Area */}
          <div className="lg:col-span-7 h-[280px] sm:h-[350px] lg:h-auto min-h-[280px] rounded-2xl relative group border border-white/10 shadow-xl overflow-hidden bg-dark">
            <div className="absolute top-3 left-3 z-20">
              <a 
                href="https://maps.app.goo.gl/EUKjJBXYGgxubYUm8"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-dark/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/15 flex items-center gap-2 shadow-lg hover:bg-gold/10 transition-colors"
              >
                <div className="w-6 h-6 bg-emerald-500/20 rounded flex items-center justify-center border border-emerald-500/30">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-[8px] font-bold uppercase text-white/40 tracking-wider">Site Location</p>
                  <p className="text-[10px] font-bold text-white uppercase">Ayushman Residency Rau</p>
                </div>
              </a>
            </div>

            <div ref={mapRef} className="absolute inset-0 transition-transform duration-1000 scale-[1.02] group-hover:scale-100">
              {isMapInView && (
                <Suspense fallback={
                  <div className="w-full h-full flex flex-col gap-2 items-center justify-center bg-dark text-gold font-bold uppercase tracking-widest text-[11px] animate-pulse opacity-50">
                    <MapPin className="w-6 h-6 opacity-50" />
                    Loading Maps...
                  </div>
                }>
                  <LazyLeafletMap position={position} />
                </Suspense>
              )}
            </div>

            {/* Glass Overlays for Depth */}
            <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-dark to-transparent pointer-events-none"></div>
          </div>
        </div>
      </div>
    </section>
  );
}

