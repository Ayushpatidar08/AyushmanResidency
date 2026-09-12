import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Camera, X, Volume2, VolumeX, Pause, Film } from 'lucide-react';
import { useCMS } from '../context/CMSContext';

const STATIC_IMAGES = [
  { url: '/gallery-5.webp', category: 'exterior', title: 'Grand Elevation Front View' },
  { url: '/gallery-1.webp', category: 'exterior', title: 'Modern Architecture Towers' },
  { url: '/gallery-2.webp', category: 'campus', title: 'Open Green Campus & Wide Roads' },
  { url: '/gallery-6.webp', category: 'amenities', title: 'Mahadev Temple & Garden' },
  { url: '/gallery-3.webp', category: 'interior', title: 'Sunlit Living Room & Balcony' },
  { url: '/gallery-4.webp', category: 'interior', title: 'Modern Finishes & Flooring' },
  { url: '/gallery-7.webp', category: 'exterior', title: 'G+6 Scenic Balcony View' },
];

const YOUTUBE_URL = "https://www.youtube.com/embed/wVUJOZ6ipDQ";

interface TourVideo {
  id: string;
  title: string;
  subtitle: string;
  url: string;
  thumbnail: string;
}

export function Gallery() {
  const { data: cms } = useCMS();
  const [activeCategory, setActiveCategory] = useState<'all' | 'exterior' | 'interior' | 'campus' | 'amenities'>('all');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // Video player and modal states
  const [selectedVideo, setSelectedVideo] = useState<TourVideo | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isVideoSelectorOpen, setIsVideoSelectorOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Media element refs
  const videoRef = useRef<HTMLDivElement>(null);
  const droneVideoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const mainPromoVideo = cms.gallery_videos || YOUTUBE_URL;

  const videoOptions: TourVideo[] = [
    {
      id: 'drone',
      title: 'Drone Aerial Campus Tour',
      subtitle: 'Panoramic view of towers, campus & 50-ft roads',
      url: '/video/drone.webm',
      thumbnail: '/drone-thumbnail.png'
    },
    {
      id: '1bhk',
      title: '1 BHK Sample Flat Tour',
      subtitle: '540 sq.ft tailored compact luxury layout',
      url: '/video/2bhk.webm',
      thumbnail: '/1bhk.webp'
    },
    {
      id: '2bhk',
      title: '2 BHK Sample Flat Tour',
      subtitle: '1050 sq.ft spacious family living with 3 balconies',
      url: '/video/2bhk.webm',
      thumbnail: '/2bhk-plan.webp'
    },
    {
      id: '3bhk',
      title: '3 BHK Luxury Flat Tour',
      subtitle: '1200 sq.ft premium residence with dual balconies',
      url: cms.video_url_3bhk || '/video/3bhk.webm',
      thumbnail: '/3bhk-plan.webp'
    },
    {
      id: 'promo',
      title: 'Official Promotional Tour',
      subtitle: 'Complete walkthrough of Ayushman Residency',
      url: mainPromoVideo,
      thumbnail: '/hero-bg.webp'
    }
  ];

  // IntersectionObserver for Drone Video (No hardcoded delays)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (droneVideoRef.current) {
            if (entry.isIntersecting) {
              droneVideoRef.current.play().catch(() => {});
            } else {
              droneVideoRef.current.pause();
            }
          }
        });
      },
      { threshold: 0.25 }
    );

    if (droneVideoRef.current) {
      observer.observe(droneVideoRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // IntersectionObserver for bottom promo iframe
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            playVideo();
          } else {
            pauseVideo();
          }
        });
      },
      { threshold: 0.4 }
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const sendCommand = (command: string, args: any[] = []) => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: command, args }),
        '*'
      );
    }
  };

  const playVideo = () => {
    sendCommand('playVideo');
    setIsPlaying(true);
  };

  const pauseVideo = () => {
    sendCommand('pauseVideo');
    setIsPlaying(false);
  };

  const togglePlay = () => {
    if (isPlaying) {
      pauseVideo();
    } else {
      playVideo();
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      sendCommand('unMute');
    } else {
      sendCommand('mute');
    }
    setIsMuted(!isMuted);
  };

  // Build image list including CMS photos
  let allImages = [...STATIC_IMAGES];
  if (cms.gallery_photos) {
    try {
      const parsed = JSON.parse(cms.gallery_photos);
      if (Array.isArray(parsed)) {
        parsed.forEach((url, i) => {
          allImages.push({
            url,
            category: 'exterior',
            title: `Ayushman Residency View ${i + 1}`
          });
        });
      }
    } catch (e) {}
  }

  const filteredImages = activeCategory === 'all'
    ? allImages
    : allImages.filter(img => img.category === activeCategory);

  return (
    <section id="gallery" className="py-10 sm:py-16 md:py-24 bg-dark text-white overflow-hidden scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header and Filter Buttons */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-8 md:mb-16 gap-5 sm:gap-6">
          <div className="max-w-xl">
            <motion.span 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-gold font-bold uppercase tracking-[0.25em] text-[10.5px] sm:text-xs mb-1.5 block"
            >
              Visual Experience
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-serif text-white"
            >
              A Glimpse into <br />
              <span className="italic text-gold">Your Future Home</span>
            </motion.h2>
          </div>

          <div className="flex flex-wrap gap-2.5 sm:gap-3 w-full lg:w-auto">
            {/* Category Filter Tabs */}
            <div className="flex flex-wrap gap-1 sm:gap-1.5 bg-white/5 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl border border-white/10">
              {[
                { id: 'all', label: 'All Photos' },
                { id: 'exterior', label: 'Exterior' },
                { id: 'interior', label: 'Interiors' },
                { id: 'campus', label: 'Campus' },
                { id: 'amenities', label: 'Amenities' },
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id as any)}
                  className={`px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all ${
                    activeCategory === cat.id
                      ? 'bg-gold text-dark shadow-md'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Video Tour Button */}
            <button 
              onClick={() => setIsVideoSelectorOpen(true)}
              className="px-3.5 sm:px-5 py-2 sm:py-2.5 bg-gold text-dark rounded-xl sm:rounded-2xl text-[11px] sm:text-xs md:text-sm font-bold uppercase tracking-wider hover:scale-105 transition-transform flex items-center gap-1.5 sm:gap-2 shadow-lg shadow-gold/20"
            >
              <Film className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-dark" />
              <span>Watch Video Tours</span>
              <span className="px-1.5 py-0.5 bg-dark text-gold text-[9px] sm:text-[10px] rounded-full">5</span>
            </button>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5 mb-14">
          
          {/* Feature Drone Video Card (Only in 'all' or 'campus' tabs) */}
          {(activeCategory === 'all' || activeCategory === 'campus' || activeCategory === 'exterior') && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative group rounded-2xl overflow-hidden break-inside-avoid inline-block w-full mb-5 bg-dark/40 border border-gold/30 shadow-xl"
            >
              <video 
                ref={droneVideoRef}
                src="/video/drone.webm"
                muted
                preload="metadata"
                loop
                playsInline
                className="w-full h-full object-cover aspect-[4/5] sm:aspect-auto"
              />
              <div className="absolute inset-0 bg-dark/40 group-hover:bg-dark/10 transition-colors pointer-events-none" />
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span className="px-3 py-1 bg-gold text-dark text-[10px] font-bold uppercase tracking-widest rounded-full shadow-md">
                  Aerial Drone Shot
                </span>
              </div>
              <div className="absolute bottom-3 right-3">
                <button
                  onClick={() => {
                    setSelectedVideo(videoOptions[0]);
                    setIsVideoModalOpen(true);
                  }}
                  className="p-2.5 bg-gold text-dark rounded-full shadow-xl hover:scale-110 transition-transform flex items-center justify-center"
                  aria-label="Expand drone video"
                >
                  <Play className="w-4 h-4 fill-dark" />
                </button>
              </div>
            </motion.div>
          )}

          {filteredImages.map((img, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="relative group cursor-pointer rounded-2xl overflow-hidden break-inside-avoid inline-block w-full mb-5 bg-dark/20 border border-white/5"
              onClick={() => setSelectedImage(img.url)}
            >
              <img 
                src={img.url} 
                alt={`Ayushman Residency Rau Indore - ${img.title}`}
                title={img.title}
                width={600}
                height={400}
                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                referrerPolicy="no-referrer"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 bg-dark/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4">
                <div className="text-center">
                  <Camera className="w-8 h-8 text-gold mx-auto mb-2" />
                  <p className="text-xs font-bold tracking-widest uppercase text-white">{img.title}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Embedded YouTube / Promo Tour Box */}
        <motion.div 
          ref={videoRef}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="w-full aspect-video rounded-3xl overflow-hidden shadow-2xl relative border border-white/10 group bg-black"
        >
          <iframe 
            ref={iframeRef}
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
            src={`${mainPromoVideo}${mainPromoVideo.includes('?') ? '&' : '?'}enablejsapi=1&autoplay=1&mute=1&controls=0&rel=0&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`} 
            title="Ayushman Residency Video Tour" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
            referrerPolicy="strict-origin-when-cross-origin" 
          />
          
          {isMuted && isPlaying && (
            <div className="absolute top-4 right-4 z-10">
              <button 
                onClick={toggleMute}
                className="flex items-center space-x-2 bg-gold px-3.5 py-1.5 rounded-full text-dark font-bold text-xs shadow-xl animate-bounce"
              >
                <VolumeX className="w-3.5 h-3.5" />
                <span>Tap to Unmute</span>
              </button>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-5">
            <div className="flex items-center space-x-4">
              <button 
                onClick={togglePlay}
                className="w-10 h-10 flex items-center justify-center bg-gold rounded-full text-dark hover:scale-110 transition-transform"
                aria-label="Toggle play"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-dark" />}
              </button>
              <button 
                onClick={toggleMute}
                className="w-10 h-10 flex items-center justify-center bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-all"
                aria-label="Toggle mute"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <span className="text-xs font-bold tracking-widest uppercase text-white/90">
                Official Campus Walkthrough
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Video Selector Modal: Lets user pick 1BHK, 2BHK, 3BHK, Drone, or Promo */}
      <AnimatePresence>
        {isVideoSelectorOpen && (
          <div 
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setIsVideoSelectorOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl bg-dark border border-gold/30 rounded-3xl p-6 sm:p-8 shadow-2xl text-white overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <span className="text-gold text-[10px] font-bold uppercase tracking-widest block">Video Gallery</span>
                  <h3 className="text-2xl font-serif font-bold text-white">Select a Video Tour</h3>
                </div>
                <button 
                  onClick={() => setIsVideoSelectorOpen(false)}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/70"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                {videoOptions.map((video) => (
                  <div
                    key={video.id}
                    onClick={() => {
                      setIsVideoSelectorOpen(false);
                      setSelectedVideo(video);
                      setIsVideoModalOpen(true);
                    }}
                    className="group p-3.5 sm:p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-gold/50 hover:bg-white/10 transition-all cursor-pointer flex items-center gap-4"
                  >
                    <div className="w-20 h-14 sm:w-24 sm:h-16 rounded-xl overflow-hidden relative shrink-0 bg-black">
                      <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Play className="w-5 h-5 text-gold fill-gold" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-sm sm:text-base text-white group-hover:text-gold transition-colors">
                        {video.title}
                      </h4>
                      <p className="text-white/50 text-xs line-clamp-1">{video.subtitle}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Video Player Modal */}
      <AnimatePresence>
        {isVideoModalOpen && selectedVideo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-dark/95 flex items-center justify-center p-4 md:p-12 backdrop-blur-md"
            onClick={() => {
              setIsVideoModalOpen(false);
              setSelectedVideo(null);
            }}
          >
            <button
              onClick={() => {
                setIsVideoModalOpen(false);
                setSelectedVideo(null);
              }}
              className="absolute top-4 right-4 md:top-8 md:right-8 p-3 bg-white/20 rounded-full text-white hover:bg-gold hover:text-dark transition-all z-[120]"
            >
              <X className="w-6 h-6" />
            </button>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`rounded-3xl overflow-hidden shadow-2xl bg-black ${
                selectedVideo.url.endsWith('.webm') || selectedVideo.url.endsWith('.mp4')
                  ? 'w-[90vw] max-w-[420px] aspect-[9/16] max-h-[85vh]'
                  : 'w-full h-full max-w-5xl aspect-video'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {selectedVideo.url.endsWith('.webm') || selectedVideo.url.endsWith('.mp4') ? (
                <video 
                  key={selectedVideo.url}
                  src={selectedVideo.url}
                  autoPlay 
                  controls 
                  playsInline
                  className="w-full h-full object-contain"
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <iframe
                  key={selectedVideo.url}
                  src={`${selectedVideo.url}${selectedVideo.url.includes('?') ? '&' : '?'}enablejsapi=1&autoplay=1&rel=0&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`}
                  referrerPolicy="strict-origin-when-cross-origin"
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Preview Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 md:p-8"
            onClick={() => setSelectedImage(null)}
          >
            <button 
              className="absolute top-6 right-6 p-2.5 bg-white/10 rounded-full hover:bg-white/20 transition-colors z-50 text-white"
              onClick={() => setSelectedImage(null)}
            >
              <X className="w-7 h-7" />
            </button>
            <motion.img 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={selectedImage}
              alt="Ayushman Residency Preview"
              className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

    </section>
  );
}
