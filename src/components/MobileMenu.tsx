import { motion, AnimatePresence } from 'motion/react';
import { Building2, X, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

const menuItems = [
  { label: 'Home', href: '/#home' },
  { label: 'Residences', href: '/#features' },
  { label: 'Gallery', href: '/#gallery' },
  { label: 'Contact', href: '/#contact' },
];

interface MobileMenuProps {
  onClose: () => void;
}

export default function MobileMenu({ onClose }: MobileMenuProps) {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 500); // Wait for exit animation
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="pointer-events-auto fixed inset-0 z-50 md:hidden"
        >
          {/* Background with radial gradient */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse at top right, rgba(212,175,55,0.15) 0%, rgba(10,10,10,1) 50%, rgba(10,10,10,1) 100%)',
            }}
          />

          {/* Gold decorative line */}
          <motion.div
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            exit={{ scaleY: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="absolute left-8 top-0 bottom-0 w-px origin-top"
            style={{ background: 'linear-gradient(180deg, transparent 0%, #D4AF37 30%, #D4AF37 70%, transparent 100%)' }}
          />

          {/* Close button */}
          <motion.button
            initial={{ opacity: 0, rotate: -90 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 90 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="absolute top-8 right-6 z-[60] w-11 h-11 flex items-center justify-center rounded-full border border-white/20 bg-white/5 text-white"
            onClick={handleClose}
            aria-label="Close mobile menu"
          >
            <X className="w-5 h-5" />
          </motion.button>

          {/* Menu Content */}
          <div className="relative z-10 h-full flex flex-col justify-center pl-16 pr-8">
            {/* Logo at top */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="absolute top-10 left-6 flex items-center space-x-3"
            >
              <div className="p-2 bg-gold/20 rounded-xl border border-gold/30">
                <Building2 className="w-5 h-5 text-gold" />
              </div>
              <span className="text-sm font-serif tracking-[0.25em] text-white/60 uppercase">Ayushman</span>
            </motion.div>

            {/* Navigation Links */}
            <nav className="space-y-2">
              {menuItems.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.4, delay: 0.15 + i * 0.08 }}
                >
                  <a
                    href={item.href}
                    className="group flex items-center gap-4 py-4"
                    onClick={handleClose}
                  >
                    {/* Number */}
                    <span className="text-xs font-mono text-gold/50 w-6">0{i + 1}</span>
                    {/* Link Text */}
                    <span className="text-4xl font-serif text-white group-hover:text-gold transition-colors duration-300">
                      {item.label}
                    </span>
                    {/* Arrow on hover */}
                    <motion.div
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-gold"
                      initial={false}
                    >
                      <ArrowRight className="w-5 h-5" />
                    </motion.div>
                  </a>
                  {/* Separator line */}
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 + i * 0.08 }}
                    className="h-px bg-white/5 origin-left"
                  />
                </motion.div>
              ))}
            </nav>

            {/* Broker Portal CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4, delay: 0.55 }}
              className="mt-10"
            >
              <Link
                to="/admin"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full text-dark text-sm font-bold uppercase tracking-[0.2em] transition-all duration-500 hover:scale-105 hover:shadow-lg hover:shadow-gold/30"
                style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #F9E29C 50%, #D4AF37 100%)' }}
                onClick={handleClose}
              >
                Broker Portal
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

            {/* Footer text */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="absolute bottom-10 left-16 text-xs text-white/30 tracking-widest uppercase"
            >
              Ultra Luxury Living · Rau, Indore
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
