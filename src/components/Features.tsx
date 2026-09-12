import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Maximize2, Ruler, Box, Play, X, Download, Tag } from 'lucide-react';
import { useCMS } from '../context/CMSContext';

const properties = [
  {
    key: '1bhk',
    title: '1 BHK Flats',
    desc: '540 sq.ft tailored for compact & modern living.',
    defaultPrice: '₹18.5 - ₹22.5 Lakhs*',
    image: '/1bhk.webp',
    details: 'Spacious balcony, Modern kitchen, Smart layout.',
    videoUrl: '/video/2bhk.webm',
    features: ['1 Bedroom', '1 Bathroom', '1 Balcony', 'G+6 View', 'Modular Kitchen', 'Vitrified Tiles'],
    brochureUrl: '/brochure-1bhk.pdf'
  },
  {
    key: '2bhk',
    title: '2 BHK Flats',
    desc: '1050 sq.ft designed for growing families.',
    defaultPrice: '₹27.5 - ₹33.0 Lakhs*',
    image: '/2bhk-plan.webp',
    details: 'Master bedroom with en-suite, ample sunlight, 3 spacious balconies.',
    videoUrl: '/video/2bhk.webm',
    features: ['2 Bedrooms', '2 Washrooms', '3 Balconies', '1 Living Room', 'Kitchen & Wash', 'G+6 View'],
    brochureUrl: '/brochure.pdf'
  },
  {
    key: '3bhk',
    title: '3 BHK Flats',
    desc: '1200 sq.ft of expansive luxury and comfort.',
    defaultPrice: '₹38.0 - ₹44.5 Lakhs*',
    image: '/3bhk-plan.webp',
    details: 'Premium corner views, Vast Living Area, Dual Balconies.',
    videoUrl: '/video/3bhk.webm',
    features: ['3 Bedrooms', '3 Washrooms', '2 Balconies', 'Vast Living Area', 'Large Kitchen', 'Premium Fittings'],
    brochureUrl: '/brochure.pdf'
  }
];

export function Features({ onOpen3D }: { onOpen3D?: () => void }) {
  const { data: cms } = useCMS();
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [show3DDialog, setShow3DDialog] = useState(false);

  const handleDownload = (prop: typeof properties[0]) => {
    const link = document.createElement('a');
    link.href = prop.brochureUrl;
    link.download = `Ayushman_Residency_${prop.key.toUpperCase()}_Brochure.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const dynamicProperties = properties.map(p => {
    let customImage = p.image;
    let customVideo = p.videoUrl;
    let customPrice = p.defaultPrice;
    let isSold = false;

    if (p.key === '1bhk') {
      customImage = cms.main_photo_1bhk || p.image;
      customVideo = cms.video_url_1bhk || p.videoUrl;
      customPrice = cms.price_1bhk || p.defaultPrice;
      isSold = cms.status_1bhk === 'sold';
    } else if (p.key === '2bhk') {
      customImage = cms.main_photo_2bhk || p.image;
      customVideo = cms.video_url_2bhk || p.videoUrl;
      customPrice = cms.price_2bhk || p.defaultPrice;
      isSold = cms.status_2bhk === 'sold';
    } else if (p.key === '3bhk') {
      customImage = cms.main_photo_3bhk || p.image;
      customVideo = cms.video_url_3bhk || p.videoUrl;
      customPrice = cms.price_3bhk || p.defaultPrice;
      isSold = cms.status_3bhk === 'sold';
    }

    return {
      ...p,
      image: customImage,
      videoUrl: customVideo,
      price: customPrice,
      isSold
    };
  });

  return (
    <section id="features" className="py-10 sm:py-16 md:py-20 bg-white scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-16">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-gold font-bold uppercase tracking-[0.25em] text-[10.5px] sm:text-xs mb-1.5 block"
          >
            Floor Plans & Estimates
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-2xl sm:text-3xl md:text-5xl font-serif text-dark"
          >
            Meticulously Designed <span className="italic text-gold">Residences</span>
          </motion.h2>
          <p className="text-dark/60 text-xs sm:text-sm mt-1.5 max-w-lg mx-auto">
            Explore our ready-to-move 1, 2, and 3 BHK apartment floor plans in Rau, Indore.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
          {dynamicProperties.map((prop, index) => (
            <motion.div
              key={prop.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`group relative bg-paper rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg shadow-dark/5 border border-dark/5 flex flex-col justify-between ${prop.isSold ? 'opacity-80' : ''}`}
            >
              <div>
                {/* Image Section */}
                <div className="aspect-[4/3] overflow-hidden relative bg-zinc-100">
                  <img
                    src={prop.image}
                    alt={`Ayushman Residency Rau Indore - ${prop.title} Floor Plan Layout`}
                    title={`Ayushman Residency ${prop.title} Floor Plan`}
                    width={800}
                    height={600}
                    className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${prop.isSold ? 'grayscale' : ''}`}
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    decoding="async"
                  />
                  
                  {prop.isSold && (
                    <div className="absolute inset-0 bg-dark/40 flex items-center justify-center z-10">
                      <span className="px-5 py-1.5 sm:px-6 sm:py-2 bg-red-600 text-white font-bold text-sm sm:text-lg rotate-[-12deg] border-2 border-white uppercase tracking-wider shadow-2xl">
                        Sold Out
                      </span>
                    </div>
                  )}

                  {!prop.isSold && (
                    <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 flex space-x-1.5 sm:space-x-2">
                      <button
                        onClick={() => setShow3DDialog(true)}
                        title="3D Virtual Tour"
                        className="p-2 sm:p-2.5 bg-white/90 backdrop-blur-sm rounded-full text-dark hover:bg-gold transition-colors shadow-md group/btn"
                        aria-label="View 3D"
                      >
                        <Box className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover/btn:scale-110 transition-transform" />
                      </button>
                      <button 
                        onClick={() => setActiveVideo(prop.videoUrl)}
                        title="Video Tour"
                        className="p-2 sm:p-2.5 bg-white/90 backdrop-blur-sm rounded-full text-dark hover:bg-gold transition-colors shadow-md group/btn"
                        aria-label="Play video"
                      >
                        <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-dark group-hover/btn:scale-110 transition-transform" />
                      </button>
                    </div>
                  )}

                  <div className="absolute bottom-2.5 left-2.5 sm:bottom-3 sm:left-3 bg-dark/80 backdrop-blur-sm px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-white text-[10px] sm:text-[11px] font-bold">
                    {prop.key.toUpperCase()}
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-4 sm:p-6">
                  <div className="flex justify-between items-start mb-2.5">
                    <div>
                      <h3 className="text-lg sm:text-xl font-serif font-bold text-dark">{prop.title}</h3>
                      <p className="text-dark/50 text-[11px] sm:text-xs mt-0.5">{prop.desc}</p>
                    </div>
                  </div>

                  {/* Estimated Price Tag */}
                  <div className="mb-3.5 p-2 sm:p-2.5 bg-gold/10 border border-gold/30 rounded-xl flex items-center justify-between">
                    <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-bold text-dark/70 flex items-center gap-1">
                      <Tag className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gold" /> Est. Price:
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-gold font-mono">
                      {prop.price}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 sm:gap-2 mb-4 sm:mb-6">
                    {prop.features.map((feature) => (
                      <div key={feature} className="flex items-center space-x-1.5 text-[11px] sm:text-xs text-dark/70">
                        <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gold shrink-0" />
                        <span className="truncate">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 sm:p-6 pt-0 grid grid-cols-2 gap-2 sm:gap-3 mt-auto">
                <button
                  onClick={() => handleDownload(prop)}
                  className="py-2 sm:py-2.5 px-2.5 sm:px-3 border border-dark/15 rounded-xl text-[11px] sm:text-xs font-bold uppercase tracking-wider text-dark hover:bg-dark hover:text-white transition-all flex items-center justify-center gap-1 sm:gap-1.5"
                >
                  <Download className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Brochure
                </button>
                <button
                  disabled={prop.isSold}
                  onClick={() => setActiveVideo(prop.videoUrl)}
                  className={`py-2 sm:py-2.5 px-2.5 sm:px-3 bg-gold text-dark rounded-xl text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1 sm:gap-1.5 ${prop.isSold ? 'opacity-30 cursor-not-allowed' : 'hover:scale-[1.02] shadow-md shadow-gold/20'}`}
                >
                  <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-dark" /> Video Tour
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 3D Coming Soon Dialog */}
      <AnimatePresence>
        {show3DDialog && (
          <div
            className="fixed inset-0 z-[120] bg-dark/85 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setShow3DDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-dark border border-gold/30 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl text-white"
            >
              <button
                onClick={() => setShow3DDialog(false)}
                className="absolute top-4 right-4 p-2 bg-white/10 rounded-full text-white hover:bg-red-500/80 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="w-14 h-14 bg-gold/10 border border-gold/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Box className="w-7 h-7 text-gold" />
              </div>
              <h3 className="text-xl font-serif text-white mb-2">3D Virtual Model</h3>
              <p className="text-white/60 text-xs leading-relaxed">
                Our interactive 3D floor plan viewer is coming soon! Stay tuned for an immersive walkthrough of your future home.
              </p>
              <div className="mt-5 px-5 py-2 bg-gold/10 border border-gold/30 rounded-full text-gold text-[10px] font-bold uppercase tracking-widest inline-block">
                Coming Soon
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Video Modal */}
      <AnimatePresence>
        {activeVideo && (
          <div 
            className="fixed inset-0 z-[120] bg-dark/95 flex items-center justify-center p-4 md:p-12 backdrop-blur-sm"
            onClick={() => setActiveVideo(null)}
          >
            <button
              onClick={() => setActiveVideo(null)}
              className="absolute top-4 right-4 md:top-8 md:right-8 p-3 bg-white/20 rounded-full text-white hover:bg-gold hover:text-dark transition-all z-[130]"
            >
              <X className="w-6 h-6" />
            </button>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`rounded-3xl overflow-hidden shadow-2xl bg-black ${
                activeVideo.includes('.webm') || activeVideo.includes('.mp4')
                  ? 'w-[90vw] max-w-[420px] aspect-[9/16] max-h-[85vh]' 
                  : 'w-full max-w-5xl aspect-video'
              }`}
              onClick={(e) => e.stopPropagation()}
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
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
