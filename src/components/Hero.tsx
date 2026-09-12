import { ArrowRight, MapPin } from 'lucide-react';
import { scrollToSection } from '../utils/scroll';

export function Hero() {
  return (
    <section id="home" className="relative min-h-[100dvh] flex flex-col bg-dark pt-[105px] sm:pt-[125px] md:pt-[150px] pb-14 sm:pb-20 md:pb-32 overflow-visible z-20">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0 h-full w-full">
        <img
          src="/hero-bg.webp"
          alt="Ayushman Residency Indore - Luxury G+6 Residential Building in Rau near Medicaps"
          title="Ayushman Residency Indore Luxury Apartments"
          className="w-full h-full object-cover"
          fetchPriority="high"
          decoding="async"
        />
        <div className="absolute inset-0 bg-dark/75 backdrop-blur-[1px]" />
      </div>

      <div className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full animate-hero-slide">
        <div className="max-w-3xl">
          <div className="p-1 sm:p-2 md:p-0">
            <a
              href="https://maps.app.goo.gl/EUKjJBXYGgxubYUm8"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 sm:space-x-2 text-[#D4AF37] mb-3.5 sm:mb-6 hover:text-white transition-colors duration-300 group cursor-pointer w-fit p-1.5 sm:p-2 -ml-1 sm:-ml-2 rounded-lg"
            >
              <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:scale-110 transition-transform duration-300 shrink-0" />
              <span className="text-[10.5px] sm:text-xs md:text-sm font-bold uppercase tracking-[0.2em] sm:tracking-[0.3em] group-hover:underline underline-offset-4">Rau, near Medicaps University, Indore, M.P.</span>
            </a>

            <h1 className="text-4xl sm:text-6xl md:text-8xl text-white font-serif leading-[0.95] sm:leading-[0.9] mb-4 sm:mb-8">
              Ayushman <br />
              <span className="italic text-[#D4AF37]">Residency</span>
            </h1>

            <p className="text-xs sm:text-base md:text-xl text-[#F2F2F2]/90 font-light max-w-2xl mb-4 sm:mb-8 leading-relaxed">
              Premium G+6 Multi-Story Residences (Blocks A to K). Discover meticulously crafted living spaces featuring <strong className="font-semibold text-white">1 BHK (540 sq.ft)</strong>, <strong className="font-semibold text-white">2 BHK (1050 sq.ft)</strong>, and <strong className="font-semibold text-white">3 BHK (1200 sq.ft)</strong> flats.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 mb-6 sm:mb-10 text-[11.5px] sm:text-sm text-[#F2F2F2] font-medium">
              <div className="flex items-center space-x-1.5"><span className="text-[#D4AF37] text-xs">✦</span> <span>Garden & Play Zone</span></div>
              <div className="flex items-center space-x-1.5"><span className="text-[#D4AF37] text-xs">✦</span> <span>Temple & Wide Roads</span></div>
              <div className="flex items-center space-x-1.5"><span className="text-[#D4AF37] text-xs">✦</span> <span>Ground Parking</span></div>
              <div className="flex items-center space-x-1.5"><span className="text-[#D4AF37] text-xs">✦</span> <span>24x7 Water Supply</span></div>
            </div>

            <div className="grid grid-cols-2 sm:flex sm:flex-row sm:flex-wrap gap-2.5 sm:gap-4">
              <button
                onClick={() => scrollToSection('features')}
                className="inline-flex items-center justify-center px-4 sm:px-8 py-2.5 sm:py-3.5 border border-white/40 text-white text-xs sm:text-sm md:text-base font-bold rounded-full hover:bg-white/10 transition-colors duration-300"
              >
                View Flats
              </button>
              <button
                onClick={() => scrollToSection('gallery')}
                className="inline-flex items-center justify-center px-4 sm:px-8 py-2.5 sm:py-3.5 border border-white/40 text-white text-xs sm:text-sm md:text-base font-bold rounded-full hover:bg-white/10 transition-colors duration-300"
              >
                View Gallery
              </button>
              <button
                onClick={() => scrollToSection('why-choose-us')}
                className="inline-flex items-center justify-center px-4 sm:px-8 py-2.5 sm:py-3.5 border border-white text-white text-xs sm:text-sm md:text-base font-bold rounded-full hover:bg-white/10 transition-colors duration-300"
              >
                Why Choose Us?
              </button>
              <button
                onClick={() => scrollToSection('contact')}
                className="inline-flex items-center justify-center px-4 sm:px-8 py-2.5 sm:py-3.5 bg-[#D4AF37] text-dark text-xs sm:text-sm md:text-base font-bold rounded-full hover:scale-105 transition-transform duration-300 group shadow-lg shadow-[#D4AF37]/20"
              >
                <span>Book Site Visit</span>
                <ArrowRight className="ml-1 sm:ml-2 w-3.5 sm:w-4 md:w-5 h-3.5 sm:h-4 md:h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-10 right-10 hidden lg:block">
        <div className="flex items-center space-x-4">
          <div className="w-20 h-[1px] bg-[#D4AF37]/50" />
          <span className="text-white/40 text-xs font-mono tracking-widest uppercase">Ayushman Residency © 2026</span>
        </div>
      </div>
    </section>
  );
}
