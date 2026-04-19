import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Maximize2, Ruler, Box, Play, X } from 'lucide-react';

const properties = [
  {
    title: '1 BHK Flats',
    desc: '540 sq.ft tailored for Compact, Efficient, and Luxurious living.',
    price: 'Unavailable',
    image: '/1bhk.webp',
    details: 'Spacious balcony, Modern kitchen, Smart layout.',
    videoUrl: '/video/2bhk.webm',
    features: ['1 Bedroom', '1 Bathroom', '1 Balcony', 'G+6 View'],
    isSold: true
  },
  {
    title: '2 BHK Flats',
    desc: '1050 sq.ft designed for Growing Families with Premium Amenities.',
    image: '/2bhk-plan.webp',
    details: 'Master bedroom with en-suite, ample sunlight, 3 spacious balconies.',
    videoUrl: '/video/2bhk.webm',
    features: ['2 Bedrooms', '2 Washrooms', '3 Balconies', '1 Living Room', 'Kitchen', 'G+6 View'],
    isSold: false
  },
  {
    title: '3 BHK Flats',
    desc: 'Experience 1,200 sq.ft of Exquisite Luxury, Meticulously designed for Ultimate comfort.',
    image: '/3bhk-plan.webp',
    details: 'Premium corner views, Vast Living Area, Dual Balconies.',
    videoUrl: '/video/3bhk.webm',
    features: ['3 Bedrooms', '3 Washrooms', '1 Balcony', '1 Living Area', 'Large Kitchen', 'Premium Fittings'],
    isSold: false
  }
];

import { useCMS } from '../context/CMSContext';

export function Features({ onOpen3D }: { onOpen3D?: () => void }) {
  const { data: cms } = useCMS();
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [show3DDialog, setShow3DDialog] = useState(false);

  const handleDownload = (type: string) => {
    // Redirect to the actual brochure PDF file in public folder
    const link = document.createElement('a');
    link.href = '/brochure.pdf';
    link.download = `Ayushman_Residency_${type.replace(' ', '_')}_Brochure.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const dynamicProperties = properties.map(p => {
    if (p.title === '2 BHK Flats') {
      return { ...p, image: cms.main_photo_2bhk || p.image };
    }
    if (p.title === '3 BHK Flats') {
      return { ...p, image: cms.main_photo_3bhk || p.image, videoUrl: cms.video_url_3bhk || p.videoUrl };
    }
    return p;
  });

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.origin.includes('youtube.com')) return;
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data.event === 'onStateChange' && data.info === 0) {
          const source = event.source as MessageEventSource || (event.currentTarget as any)?.contentWindow;
          if (source) {
            (source as Window).postMessage(JSON.stringify({ event: 'command', func: 'seekTo', args: [1, true] }), '*');
            (source as Window).postMessage(JSON.stringify({ event: 'command', func: 'playVideo', args: [] }), '*');
          }
        }
      } catch (e) {}
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-gold font-bold uppercase tracking-[0.4em] text-xs mb-4 block"
          >
            Floor Plans & Pricing
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-serif text-dark"
          >
            Designed for <span className="italic">Modernity</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {dynamicProperties.map((prop, index) => (
            <motion.div
              key={prop.title}
              initial={{ opacity: 0, x: index === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className={`group relative bg-paper rounded-3xl overflow-hidden shadow-2xl shadow-dark/5 ${prop.isSold ? 'opacity-80' : ''}`}
            >
              <div className="aspect-[4/3] overflow-hidden relative">
                <img
                  src={prop.image}
                  alt={prop.title}
                  width={800}
                  height={600}
                  className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ${prop.isSold ? 'grayscale' : ''}`}
                  referrerPolicy="no-referrer"
                  decoding="async"
                />
                
                {prop.isSold && (
                  <div className="absolute inset-0 bg-dark/40 flex items-center justify-center z-10">
                    <span className="px-8 py-3 bg-red-600 text-white font-bold text-2xl rotate-[-15deg] border-4 border-white uppercase tracking-wider shadow-2xl">
                      Sold Out
                    </span>
                  </div>
                )}

                {!prop.isSold && (
                  <div className="absolute top-4 right-4 flex space-x-2">
                    <button
                      onClick={() => setShow3DDialog(true)}
                      title="3D Virtual Tour"
                      className="p-3 bg-white/90 backdrop-blur-sm rounded-full text-dark hover:bg-gold transition-colors shadow-lg group/btn"
                    >
                      <Box className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                    </button>
                    <button 
                      onClick={() => setActiveVideo(prop.videoUrl)}
                      title="Video Tour"
                      className="p-3 bg-white/90 backdrop-blur-sm rounded-full text-dark hover:bg-gold transition-colors shadow-lg group/btn"
                    >
                      <Play className="w-5 h-5 group-hover/btn:scale-110 transition-transform fill-dark" />
                    </button>
                  </div>
                )}
              </div>

              <div className="p-8 md:p-12">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-3xl font-serif font-bold mb-2">{prop.title}</h3>
                    <div className="flex items-center text-dark/50 space-x-4">
                      <span className="flex items-center text-sm">
                        <Ruler className="w-4 h-4 mr-1" />
                        {prop.desc}
                      </span>
                      <span className="flex items-center text-sm">
                        <Maximize2 className="w-4 h-4 mr-1" />
                        G+6 Floor
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <a 
                      href="#contact"
                      className={`px-6 py-2 rounded-full font-bold text-sm transition-all duration-300 flex items-center justify-center ${prop.isSold ? 'hidden' : 'bg-gold text-dark hover:scale-105 shadow-lg shadow-gold/20'}`}
                    >
                      Get the Price
                    </a>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  {prop.features.map((feature) => (
                    <div key={feature} className="flex items-center space-x-2 text-sm text-dark/70">
                      <div className="w-5 h-5 rounded-full bg-gold/10 flex items-center justify-center">
                        <Check className="w-3 h-3 text-gold" />
                      </div>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    disabled={prop.isSold}
                    onClick={() => handleDownload(prop.title)}
                    className={`py-4 border border-dark/10 rounded-full font-bold transition-all duration-300 ${prop.isSold ? 'cursor-not-allowed opacity-20' : 'hover:bg-dark hover:text-white'}`}
                  >
                    Brochure
                  </button>
                  <button
                    disabled={prop.isSold}
                    onClick={() => setActiveVideo(prop.videoUrl)}
                    className={`py-4 bg-gold text-dark rounded-full font-bold transition-all duration-300 flex items-center justify-center group/play ${prop.isSold ? 'cursor-not-allowed opacity-20 grayscale' : 'hover:scale-105'}`}
                  >
                    Video Tour <Play className="ml-2 w-4 h-4 fill-dark group-hover/play:scale-110 transition-transform" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
          
          {/* Quote Section */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col justify-center items-center lg:items-start p-8 md:p-12 text-center lg:text-left"
          >
            <h3 className="text-3xl md:text-5xl font-serif text-dark/80 mb-2 leading-tight">
              Home that match your
            </h3>
            <h3 className="text-4xl md:text-7xl font-sans font-black text-gold tracking-tighter leading-none uppercase italic">
              LUXURY <br className="hidden md:block" /> LIFESTYLE
            </h3>
            <div className="w-24 h-1 bg-gold mt-6 rounded-full opacity-50" />
          </motion.div>
        </div>
      </div>

      {/* 3D Coming Soon Dialog */}
      <AnimatePresence>
        {show3DDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-dark/80 flex items-center justify-center p-6 backdrop-blur-sm"
            onClick={() => setShow3DDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-gradient-to-br from-dark to-dark/90 border border-gold/30 rounded-3xl p-10 max-w-sm w-full text-center shadow-2xl shadow-gold/10"
            >
              <button
                onClick={() => setShow3DDialog(false)}
                className="absolute top-4 right-4 p-2 bg-white/10 rounded-full text-white hover:bg-red-500/80 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="w-16 h-16 bg-gold/10 border border-gold/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Box className="w-8 h-8 text-gold" />
              </div>
              <h3 className="text-2xl font-serif text-white mb-3">3D Model</h3>
              <p className="text-white/50 text-sm leading-relaxed">Our interactive 3D model experience is coming soon! Stay tuned for an immersive virtual tour of your future home.</p>
              <div className="mt-6 px-6 py-2 bg-gold/10 border border-gold/30 rounded-full text-gold text-xs font-bold uppercase tracking-widest inline-block">
                Coming Soon
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Modal */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-dark/95 flex items-center justify-center p-4 md:p-20 backdrop-blur-sm"
          >
            <button
              onClick={() => setActiveVideo(null)}
              className="absolute top-4 right-4 md:top-10 md:right-10 p-3 bg-white/20 rounded-full text-white hover:bg-gold hover:text-dark transition-all z-[210] flex items-center justify-center shadow-lg"
            >
              <X className="w-6 h-6 md:w-8 md:h-8" />
            </button>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`rounded-3xl overflow-hidden shadow-2xl bg-black relative ${
                activeVideo.includes('.webm') || activeVideo.includes('.mp4')
                  ? 'w-[85vw] max-w-[420px] aspect-[9/16] max-h-[85vh]' 
                  : 'w-full max-w-6xl aspect-video'
              }`}
            >
              {activeVideo.endsWith('.webm') || activeVideo.endsWith('.mp4') ? (
                <video 
                  src={activeVideo} 
                  autoPlay 
                  controls 
                  playsInline
                  className="w-full h-full object-contain"
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <iframe
                  src={`${activeVideo}${activeVideo.includes('?') ? '&' : '?'}enablejsapi=1&autoplay=1&rel=0&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
