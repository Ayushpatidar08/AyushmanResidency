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
    <section className="py-24 bg-dark relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
        <div className="absolute top-1/4 -left-24 w-96 h-96 bg-gold/30 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-1/4 -right-24 w-96 h-96 bg-gold/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-end justify-between mb-16 gap-8">
          <div className="max-w-2xl">
            <motion.span 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="text-gold font-bold uppercase tracking-[0.4em] text-xs mb-4 block"
            >
              The Neighborhood Nexus
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-serif text-white leading-tight"
            >
              Where Every Advantage <br />
              <span className="italic text-gold">Converges.</span>
            </motion.h2>
          </div>
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="flex flex-wrap gap-2 bg-white/5 p-2 rounded-2xl border border-white/10 backdrop-blur-xl"
          >
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-500 ${
                  activeTab === cat.id 
                    ? 'bg-gold text-dark shadow-xl shadow-gold/20' 
                    : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}
              >
                <cat.icon className="w-4 h-4" />
                {cat.label}
              </button>
            ))}
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
          {/* Amenity List Panel */}
          <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.4, ease: "circOut" }}
                  className="space-y-4"
                >
                  {AMENITIES[activeTab].map((item, idx) => (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="group p-5 bg-white/5 rounded-3xl border border-white/10 hover:border-gold/50 hover:bg-white/[0.08] transition-all duration-500 flex items-start gap-5 cursor-default"
                    >
                      <div className="p-4 bg-gold/10 rounded-2xl group-hover:scale-110 transition-transform duration-500">
                        <item.icon className="w-6 h-6 text-gold" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-bold text-white text-lg group-hover:text-gold transition-colors">{item.name}</h4>
                          <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-black uppercase tracking-widest text-gold/60 border border-gold/20">
                            {item.dist}
                          </span>
                        </div>
                        <p className="text-white/40 text-sm leading-relaxed">{item.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>

            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="mt-8 p-8 bg-gradient-to-br from-gold/20 to-transparent rounded-[2.5rem] border border-gold/20 relative group overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:rotate-12 transition-transform duration-700">
                <Compass className="w-24 h-24 text-gold" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 text-gold mb-3 font-black text-xs uppercase tracking-widest">
                  <Info className="w-4 h-4" /> Destination Stats
                </div>
                <h3 className="text-2xl font-serif text-white mb-6 italic">Strategically Located in <br /> Rau, Indore</h3>
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div>
                    <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-1">Commute Ease</p>
                    <p className="text-gold text-2xl font-black">1.0 km <span className="text-xs uppercase ml-1">to NH-52</span></p>
                  </div>
                  <div>
                    <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-1">Airport Reach</p>
                    <p className="text-gold text-2xl font-black">25 mins <span className="text-xs uppercase ml-1">Drive</span></p>
                  </div>
                </div>
                <a 
                  href={cms.all_location_link || "https://maps.app.goo.gl/EUKjJBXYGgxubYUm8"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 w-full py-5 bg-gold text-dark rounded-2xl font-black hover:bg-white hover:scale-[1.02] transition-all duration-500 shadow-2xl shadow-gold/20"
                >
                  EXPLORE FULL NEIGHBORHOOD <ArrowRight className="w-5 h-5" />
                </a>
              </div>
            </motion.div>
          </div>

          {/* Interactive Map Area */}
          <div className="lg:col-span-7 h-[500px] md:h-[600px] lg:h-[700px] max-h-[60vh] lg:max-h-[80vh] rounded-[3rem] relative group border border-white/10 shadow-3xl overflow-hidden bg-dark">
            <div className="absolute top-6 left-6 z-20 flex flex-col gap-3">
              <a 
                href="https://maps.app.goo.gl/EUKjJBXYGgxubYUm8"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-dark/80 backdrop-blur-xl p-4 rounded-2xl border border-white/10 flex items-center gap-3 shadow-2xl hover:bg-gold/10 transition-colors group/link"
              >
                <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/30 group-hover/link:bg-gold/20 group-hover/link:border-gold/30">
                  <MapPin className="w-5 h-5 text-emerald-400 animate-bounce group-hover/link:text-gold" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-white/40 tracking-widest">Your Future Address</p>
                  <p className="text-sm font-bold text-white uppercase tracking-tight group-hover/link:text-gold transition-colors">Ayushmaan Residency, Rau</p>
                </div>
              </a>
            </div>

            <div ref={mapRef} className="absolute inset-0 transition-transform duration-1000 scale-[1.02] group-hover:scale-100">
              {isMapInView && (
                <Suspense fallback={
                  <div className="w-full h-full flex flex-col gap-3 items-center justify-center bg-dark text-gold font-bold uppercase tracking-widest text-xs animate-pulse opacity-50">
                    <MapPin className="w-8 h-8 opacity-50" />
                    Loading Maps...
                  </div>
                }>
                  <LazyLeafletMap position={position} />
                </Suspense>
              )}
            </div>

            {/* Glass Overlays for Depth */}
            <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-dark to-transparent pointer-events-none"></div>
            <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-dark/20 to-transparent pointer-events-none"></div>
          </div>
        </div>
      </div>
    </section>
  );
}

