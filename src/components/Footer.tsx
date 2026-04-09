import { Building2, Instagram, Mail, Phone, MapPin, Youtube, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

export function Footer() {
  const [cms, setCms] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch('/api/cms').then(r => r.json()).then(setCms).catch(console.error);
  }, []);
  return (
    <footer className="relative bg-dark text-white pt-24 pb-12 overflow-hidden border-t border-gold/20">
      {/* Subtle Background Pattern or Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.05),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(212,175,55,0.05),transparent_50%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16 mb-16 border-b border-white/10 pb-16">
          {/* Brand & About */}
          <div className="col-span-1 md:col-span-5 lg:col-span-4">
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
              className="flex items-center space-x-3 mb-6 hover:opacity-80 transition-opacity text-left"
            >
              <div className="p-2 border border-gold/30 rounded-lg bg-gold/5">
                <Building2 className="w-6 h-6 text-gold" />
              </div>
              <span className="text-xl font-serif tracking-[0.25em] text-white">AYUSHMAN RESIDENCY</span>
            </button>
            <p className="text-white/60 leading-relaxed mb-6 font-light text-sm">
              Ayushman Residency is more than just a home; it's a sanctuary of modern luxury and serene living. Thoughtfully designed to blend nature with contemporary architecture, we offer a lifestyle of unparalleled comfort and elegance for you and your loved ones.
            </p>
            <p className="text-white/80 text-sm font-medium mb-3">Connect With Us On</p>
            <div className="flex space-x-3 mt-6">
              {[
                { Icon: Instagram, href: 'https://www.instagram.com/shreegirirajrealestate', label: 'Instagram' },
                { Icon: Youtube, href: 'https://youtu.be/vSvJb9Lpvzc?si=csaUNnCvRxoeg_kk', label: 'YouTube' },
                { Icon: MessageCircle, href: 'https://wa.me/917869612823?text=Hello-AyushmaanResidency,I-am-intrested', label: 'WhatsApp' }
              ].map((social, idx) => (
                <a key={idx} href={social.href} target="_blank" rel="noopener noreferrer" aria-label={social.label} className="p-2.5 bg-white/5 border border-white/10 rounded-full hover:bg-gold hover:border-gold hover:text-dark transition-all duration-300 group">
                  <social.Icon className="w-5 h-5 text-white/70 group-hover:text-dark" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-span-1 md:col-span-3 lg:col-span-3 lg:ml-auto">
            <h2 className="text-lg font-serif mb-6 text-gold tracking-wider">Explore</h2>
            <ul className="space-y-4">
              {[
                { label: 'Home', href: '#' },
                { label: 'Residences', href: '#features' },
                { label: 'Gallery', href: '#gallery' },
                { label: 'Contact Us', href: '#contact' },
                { label: 'Portal', href: '/admin' }
              ].map((link, idx) => (
                <li key={idx}>
                  <a href={link.href} className="text-white/60 hover:text-gold transition-all text-sm flex items-center group relative">
                    <span className="absolute left-0 w-0 h-[1px] bg-gold opacity-0 group-hover:opacity-100 group-hover:w-4 transition-all duration-300"></span>
                    <span className="transform translate-x-0 group-hover:translate-x-6 transition-transform duration-300">{link.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="col-span-1 md:col-span-4 lg:col-span-4 lg:ml-auto">
            <h2 className="text-lg font-serif mb-6 text-gold tracking-wider">Contact</h2>
            <ul className="space-y-6">
              <li>
                <a href="https://maps.app.goo.gl/EUKjJBXYGgxubYUm8" target="_blank" rel="noopener noreferrer" className="flex items-start space-x-4 group text-left">
                  <div className="p-2 bg-white/5 rounded-lg border border-white/10 mt-0.5 group-hover:border-gold/50 transition-colors">
                    <MapPin className="w-4 h-4 text-gold" />
                  </div>
                  <div>
                    <p className="text-white/80 text-sm font-medium mb-1 group-hover:text-white transition-colors">Location</p>
                    <p className="text-white/50 text-sm leading-relaxed group-hover:text-white/70 transition-colors">Rau, near Medicaps University,<br />Indore, M.P.</p>
                  </div>
                </a>
              </li>
              <li>
                <a href={cms.contact_phone_footer ? `tel:${cms.contact_phone_footer.replace(/[^0-9+]/g, '')}` : "tel:+917869612823"} className="flex items-start space-x-4 group text-left">
                  <div className="p-2 bg-white/5 rounded-lg border border-white/10 mt-0.5 group-hover:border-gold/50 transition-colors">
                    <Phone className="w-4 h-4 text-gold" />
                  </div>
                  <div>
                    <p className="text-white/80 text-sm font-medium mb-1 group-hover:text-white transition-colors">Phone</p>
                    <p className="text-white/50 text-sm group-hover:text-white/70 transition-colors">{cms.contact_phone_footer || '+91 78696 12823'}</p>
                  </div>
                </a>
              </li>
              <li>
                <a href={`mailto:${cms.contact_email_footer || 'residencyayushman@gmail.com'}`} className="flex items-start space-x-4 group text-left">
                  <div className="p-2 bg-white/5 rounded-lg border border-white/10 mt-0.5 group-hover:border-gold/50 transition-colors">
                    <Mail className="w-4 h-4 text-gold" />
                  </div>
                  <div>
                    <p className="text-white/80 text-sm font-medium mb-1 group-hover:text-white transition-colors">Email</p>
                    <p className="text-white/50 text-sm group-hover:text-white/70 transition-colors">{cms.contact_email_footer || 'residencyayushman@gmail.com'}</p>
                  </div>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center text-xs tracking-widest uppercase gap-6 md:gap-0">
          <p className="text-white/40 mb-4 md:mb-0 text-center md:text-left">
            © {new Date().getFullYear()} <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-gold/70 hover:text-gold uppercase tracking-widest transition-colors font-medium">Ayushman Residency</button>. All Rights Reserved.
          </p>
          
          <div className="flex flex-col items-center">
            <p className="text-white/50 mb-1">
              Developer of this website - <a href="/developer" className="text-gold hover:text-white transition-colors font-bold ml-1">Ayush Patidar</a>
            </p>
          </div>

          <div className="flex space-x-6 text-center md:text-right">
            <Link to="/privacy-policy" className="text-white/40 hover:text-gold transition-colors">Privacy Policy</Link>
            <Link to="/terms-of-service" className="text-white/40 hover:text-gold transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
