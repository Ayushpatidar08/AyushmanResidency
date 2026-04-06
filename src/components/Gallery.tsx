import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Camera, X, Volume2, VolumeX, Pause } from 'lucide-react';    

const STATIC_IMAGES = [
  '/gallery-5.webp',
  '/gallery-1.webp',
  '/gallery-2.webp',
  '/gallery-3.webp',
  '/gallery-4.webp',
  '/gallery-6.webp',
  '/gallery-7.webp',
];

const YOUTUBE_URL = "https://www.youtube.com/embed/vSvJb9Lpvzc?start=1&end=118";
const YOUTUBE_EMBED_URL = "https://www.youtube.com/embed/vSvJb9Lpvzc?start=1&end=118";

import { useCMS } from '../context/CMSContext';

export function Gallery() {
  const { data: cms } = useCMS();
  const [galleryImages, setGalleryImages] = useState<string[]>(STATIC_IMAGES);

  useEffect(() => {
    if (cms.gallery_photos) {
      try {
        const parsed = JSON.parse(cms.gallery_photos);
        if (parsed && parsed.length > 0) {
          setGalleryImages([...STATIC_IMAGES, ...parsed]);
        }
      } catch(e) {}
    }
  }, [cms.gallery_photos]);

  const currentVideoUrl = cms.gallery_videos || YOUTUBE_EMBED_URL;

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [deferredFlatVideoSrc, setDeferredFlatVideoSrc] = useState('');
  const [deferredDroneVideoSrc, setDeferredDroneVideoSrc] = useState('');
  const videoRef = useRef<HTMLDivElement>(null);
  const droneVideoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Defer loading of non-critical flat visit video to optimize performance (LCP)
    const handleLoad = () => {
      setTimeout(() => setDeferredFlatVideoSrc('/video/2bhk.webm'), 14000);
      setTimeout(() => setDeferredDroneVideoSrc('/video/drone.webm'), 12000);
    };

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, []);

  useEffect(() => {
    if (deferredDroneVideoSrc && droneVideoRef.current) {
      droneVideoRef.current.play().catch(() => {});
    }
  }, [deferredDroneVideoSrc]);

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
      { threshold: 0.5 }
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    const handleMessage = (event: MessageEvent) => {
      // Allow both standard and nocookie origins
      if (!event.origin.includes('youtube.com')) return;
      
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        
        // When video ends (state 0), loop back to start
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
    return () => {
      observer.disconnect();
      window.removeEventListener('message', handleMessage);
    };
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

  return (
    <section id="gallery" className="py-24 bg-dark text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div className="max-w-xl">
            <motion.span 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-gold font-bold uppercase tracking-[0.4em] text-xs mb-4 block"
            >
              Visual Experience
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="text-4xl md:text-6xl font-serif"
            >
              A Glimpse into <br />
              <span className="italic text-gold">Your Future Home</span>
            </motion.h2>
          </div>
          <div className="flex space-x-4">
            <button className="px-6 py-3 border border-white/20 rounded-full text-sm font-bold hover:bg-white/10 transition-colors">
              View All Photos
            </button>
            <button 
              onClick={() => {
                setSelectedVideo(currentVideoUrl);
                setIsVideoModalOpen(true);
              }}
              className="px-6 py-3 bg-gold text-dark rounded-full text-sm font-bold hover:scale-105 transition-transform flex items-center shrink-0"
            >
              Watch Video Tour <Play className="ml-2 w-4 h-4 fill-dark" />
            </button>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6 mb-16">
          {/* Feature Drone Video Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative group rounded-2xl overflow-hidden break-inside-avoid inline-block w-full mb-6 bg-dark/40 border border-gold/20 shadow-lg shadow-gold/5 min-h-[300px]"
          >
            <video 
              ref={droneVideoRef}
              src={deferredDroneVideoSrc}
              autoPlay
              muted
              preload="metadata"
              loop
              playsInline
              className={`w-full h-full object-cover aspect-[4/5] md:aspect-auto transition-opacity duration-1000 ${deferredDroneVideoSrc ? 'opacity-100' : 'opacity-40'}`}
            />
            <div className="absolute inset-0 bg-dark/40 group-hover:bg-dark/10 transition-colors" />
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1 bg-gold text-dark text-[10px] font-bold uppercase tracking-widest rounded-full">Drone Shot</span>
            </div>
          </motion.div>

          {galleryImages.map((url, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8, delay: index * 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="relative group cursor-pointer rounded-2xl overflow-hidden break-inside-avoid inline-block w-full mt-0 mb-6 bg-dark/20"
              onClick={() => setSelectedImage(url)}
            >
              <img 
                src={url} 
                alt={`Gallery image ${index + 1}`} 
                width={600}
                height={400}
                className="w-full h-auto object-contain group-hover:scale-105 transition-transform duration-700 ease-out"
                referrerPolicy="no-referrer"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 bg-dark/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="text-center">
                  <Camera className="w-12 h-12 text-gold mx-auto mb-2" />
                  <p className="text-sm font-bold tracking-widest uppercase">View Detail</p>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Flat Visit Video Card - Small version at the end */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative group cursor-pointer rounded-2xl overflow-hidden break-inside-avoid inline-block w-full mb-6 bg-dark/40 border border-white/5 shadow-xl min-h-[220px]"
          >
            <video 
              src={deferredFlatVideoSrc}
              autoPlay 
              muted 
              loop 
              playsInline
              className={`w-full h-auto object-cover aspect-video transition-opacity duration-1000 ${deferredFlatVideoSrc ? 'opacity-100' : 'opacity-0'}`}
            />
            <div className="absolute inset-0 bg-dark/30 group-hover:bg-transparent transition-colors" />
            <div className="absolute top-3 left-3">
              <span className="px-2 py-0.5 bg-white/20 backdrop-blur-md text-white text-[9px] font-bold uppercase tracking-widest rounded-full border border-white/10">Flat Visit</span>
            </div>
          </motion.div>

          {/* Conditional "Add More" Placeholder - Automatically hides if images are already plentiful */}
          {galleryImages.length < 10 ? (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="relative group rounded-2xl overflow-hidden break-inside-avoid inline-block w-full mb-6 border-2 border-dashed border-white/10 p-8 bg-white/5 flex flex-col items-center justify-center text-center opacity-40 hover:opacity-100 transition-opacity min-h-[180px]"
            >
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
                <Camera className="w-6 h-6 text-white/20" />
              </div>
              <p className="text-xs font-serif italic text-white/30 tracking-wide">More coming soon...</p>
            </motion.div>
          ) : null}
        </div>

        {/* Video Player Embed with Auto-Scroll Control */}
        <motion.div 
          ref={videoRef}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="w-full aspect-video rounded-2xl overflow-hidden shadow-2xl relative border-4 border-white/10 group"
        >
          <iframe 
            ref={iframeRef}
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
            src={`${currentVideoUrl}${currentVideoUrl.includes('?') ? '&' : '?'}enablejsapi=1&autoplay=1&mute=1&controls=0&rel=0&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`} 
            title="Ayushman Residency Video Tour" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
            referrerPolicy="strict-origin-when-cross-origin" 
          ></iframe>
          
          {/* Unmute Hint (Visible only when muted and playing) */}
          {isMuted && isPlaying && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute top-6 right-6 z-10"
            >
              <button 
                onClick={toggleMute}
                className="flex items-center space-x-2 bg-gold px-4 py-2 rounded-full text-dark font-bold shadow-xl animate-bounce"
              >
                <VolumeX className="w-4 h-4" />
                <span className="text-xs uppercase">Tap to Unmute</span>
              </button>
            </motion.div>
          )}

          {/* Custom Controls Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
            <div className="flex items-center space-x-6">
              <button 
                onClick={togglePlay}
                className="w-12 h-12 flex items-center justify-center bg-gold rounded-full text-dark hover:scale-110 transition-transform"
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 fill-dark" />}
              </button>
              <button 
                onClick={toggleMute}
                className="w-12 h-12 flex items-center justify-center bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-all"
              >
                {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
              </button>
              <span className="text-sm font-bold tracking-widest uppercase">
                {isPlaying ? 'Now Playing' : 'Paused'}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

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
              className="absolute top-6 right-6 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors z-50"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage(null);
              }}
            >
              <X className="w-8 h-8 text-white" />
            </button>
            
            <motion.img 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={selectedImage}
              alt="Preview"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
      {/* Video Preview Modal */}
      <AnimatePresence>
        {isVideoModalOpen && selectedVideo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-dark/95 flex items-center justify-center p-4 md:p-20 backdrop-blur-sm"
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
              className="absolute top-4 right-4 md:top-10 md:right-10 p-3 bg-white/20 rounded-full text-white hover:bg-gold hover:text-dark transition-all z-[210] flex items-center justify-center shadow-lg"
            >
              <X className="w-6 h-6 md:w-8 md:h-8" />
            </button>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full h-full max-w-6xl aspect-video rounded-3xl overflow-hidden shadow-2xl bg-black"
              onClick={(e) => e.stopPropagation()}
            >
              {(() => {
                const tourVideo = selectedVideo;
                return tourVideo.endsWith('.webm') || tourVideo.endsWith('.mp4') ? (
                  <video 
                    key={tourVideo}
                    src={tourVideo}
                    autoPlay 
                    controls 
                    playsInline
                    className="w-full h-full object-contain"
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <iframe
                    key={tourVideo}
                    src={`${tourVideo}${tourVideo.includes('?') ? '&' : '?'}enablejsapi=1&autoplay=1&rel=0&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`}
                    referrerPolicy="strict-origin-when-cross-origin"
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
