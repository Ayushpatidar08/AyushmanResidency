import { Link } from 'react-router-dom';
import { Building2, Menu } from 'lucide-react';
import { useState, useEffect, lazy, Suspense } from 'react';

const MobileMenu = lazy(() => import('./MobileMenu'));

const menuItems = [
  { label: 'Home', href: '/#home' },
  { label: 'Residences', href: '/#features' },
  { label: 'Gallery', href: '/#gallery' },
  { label: 'Contact', href: '/#contact' },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <nav className={`absolute top-0 w-full z-50 transition-all duration-500 pointer-events-none ${scrolled ? 'py-4' : 'py-8'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`pointer-events-auto relative flex justify-between h-20 items-center px-8 rounded-[2rem] transition-all duration-500 ${scrolled ? 'bg-dark/80 backdrop-blur-xl shadow-2xl shadow-black/50 border border-white/10' : 'bg-transparent'}`}>
          <Link to="/" className="flex items-center space-x-3 group">
            <div
              className="p-2 bg-dark rounded-xl group-hover:bg-[#D4AF37] group-hover:rotate-180 transition-all duration-500"
            >
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-serif tracking-[0.2em] text-white">AYUSHMAN RESIDENCY</span>
          </Link>

          <div className="hidden md:flex items-center space-x-12">
            {menuItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-[14px] font-serif tracking-widest text-[#F2F2F2] hover:text-[#D4AF37] transition-all duration-300 drop-shadow-sm hover:drop-shadow-md py-2"
              >
                {item.label}
              </a>
            ))}
            <Link to="/admin" className="px-6 py-3 bg-transparent border border-white text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-full hover:bg-gold hover:text-dark hover:border-gold transition-all duration-500 shadow-lg hover:shadow-gold/20">
              Portals
            </Link>
          </div>

          {/* Mobile Hamburger - hidden when overlay is open */}
          {!isOpen && (
            <button
              className="md:hidden relative z-[60] w-11 h-11 flex items-center justify-center rounded-full border border-white/20 bg-white/5 backdrop-blur-sm text-white active:scale-95 transition-transform"
              onClick={() => setIsOpen(true)}
              aria-label="Open mobile menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Full-Screen Mobile Menu Overlay component lazy loaded */}
      {isOpen && (
        <Suspense fallback={null}>
          <MobileMenu onClose={() => setIsOpen(false)} />
        </Suspense>
      )}
    </nav>
  );
}
