import { ArrowRight, MapPin } from 'lucide-react';

export function Hero() {
  return (
    <section id="home" className="relative min-h-[100dvh] flex flex-col bg-dark pt-[130px] md:pt-[150px] pb-24 md:pb-32 overflow-visible z-20">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0 h-full w-full">
        <img
          src="/hero-bg.webp"
          alt="Luxury Building"
          className="w-full h-full object-cover"
          fetchPriority="high"
          decoding="async"
        />
        <div className="absolute inset-0 bg-dark/70 backdrop-blur-[1px]" />
      </div>

      <div className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full animate-hero-slide">
        <div className="max-w-3xl">
          <div className="p-2 md:p-0">
            <a
              href="https://maps.app.goo.gl/EUKjJBXYGgxubYUm8"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-[#D4AF37] mb-6 hover:text-white transition-colors duration-300 group cursor-pointer w-fit p-2 -ml-2 rounded-lg"
            >
              <MapPin className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              <span className="text-sm font-bold uppercase tracking-[0.3em] group-hover:underline underline-offset-4">Rau, near Medicaps University, Indore, M.P.</span>
            </a>

            <h1 className="text-6xl md:text-8xl text-white font-serif leading-[0.9] mb-8">
              Ayushman <br />
              <span className="italic text-[#D4AF37]">Residency</span>
            </h1>

            <p className="text-lg md:text-xl text-[#F2F2F2] font-light max-w-2xl mb-8 leading-relaxed">
              Premium G+6 Multi-Story Residences (Blocks A to K). Discover meticulously crafted living spaces featuring <strong className="font-semibold text-white">1 BHK (540 sq.ft)</strong>, <strong className="font-semibold text-white">2 BHK (1050 sq.ft)</strong>, and <strong className="font-semibold text-white">3 BHK (1200 sq.ft)</strong> flats.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 text-sm text-[#F2F2F2] font-medium">
              <div className="flex items-center space-x-2"><span className="text-[#D4AF37]">✦</span> <span>Garden & Play Zone</span></div>
              <div className="flex items-center space-x-2"><span className="text-[#D4AF37]">✦</span> <span>Temple & Wide Roads</span></div>
              <div className="flex items-center space-x-2"><span className="text-[#D4AF37]">✦</span> <span>Massive Ground Parking</span></div>
              <div className="flex items-center space-x-2"><span className="text-[#D4AF37]">✦</span> <span>24x7 Water Supply</span></div>
            </div>

            <div className="flex flex-col sm:flex-row flex-wrap gap-4">
              <a
                href="#contact"
                className="inline-flex items-center justify-center px-8 py-4 bg-[#D4AF37] text-dark font-bold rounded-full hover:scale-105 transition-transform duration-300 group shadow-lg shadow-[#D4AF37]/20"
              >
                Book a Site Visit
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="#offers-section"
                className="inline-flex items-center justify-center px-8 py-4 border border-white text-white font-bold rounded-full hover:bg-white/10 transition-colors duration-300"
              >
                Why Choose Us?
              </a>
              <a
                href="#features"
                className="inline-flex items-center justify-center px-8 py-4 border border-white/40 text-white font-bold rounded-full hover:bg-white/10 transition-colors duration-300"
              >
                View Flats
              </a>
              <a
                href="#gallery"
                className="inline-flex items-center justify-center px-8 py-4 border border-white/40 text-white font-bold rounded-full hover:bg-white/10 transition-colors duration-300"
              >
                View Gallery
              </a>
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
