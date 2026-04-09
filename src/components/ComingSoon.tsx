import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Construction, Bell, Hammer, Paintbrush } from 'lucide-react';

export function ComingSoon() {
  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl -mr-48 -mt-48" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl -ml-48 -mb-48" />
      
      <div className="max-w-2xl w-full text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center justify-center p-4 bg-gold/10 rounded-3xl mb-8 border border-gold/20">
            <Construction className="w-12 h-12 text-gold animate-pulse" />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6 tracking-tight">
            Something <span className="text-gold">Exceptional</span> is Coming Soon
          </h1>
          
          <p className="text-white/60 text-lg mb-12 leading-relaxed max-w-lg mx-auto">
            We're currently crafting a premium digital experience at Ayushman Residency. Our YouTube channel and more content will be live very shortly.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
            {[
              { icon: Hammer, label: 'Crafting UI' },
              { icon: Paintbrush, label: 'Refining Design' },
              { icon: Bell, label: 'Stay Tuned' }
            ].map((item, i) => (
              <div key={i} className="p-6 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center gap-3">
                <item.icon className="w-6 h-6 text-gold/60" />
                <span className="text-xs font-bold uppercase tracking-widest text-white/40">{item.label}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 px-8 py-4 bg-gold text-dark font-bold rounded-2xl hover:scale-105 transition-all shadow-lg shadow-gold/20"
            >
              <ArrowLeft className="w-5 h-5" /> Back to Home
            </Link>
            <button 
              className="px-8 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-2xl hover:bg-white/10 transition-all"
              onClick={() => alert('We will notify you soon!')}
            >
              Notify Me
            </button>
          </div>
        </motion.div>
        
        <p className="mt-16 text-white/20 text-xs uppercase tracking-[0.3em]">
          © {new Date().getFullYear()} Ayushman Residency · Luxury Reimagined
        </p>
      </div>
    </div>
  );
}
