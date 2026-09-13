import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Hero } from './components/Hero';
import { Analytics } from '@vercel/analytics/react';

import { useState, Suspense, lazy } from 'react';

const Navbar = lazy(() => import('./components/Navbar').then(m => ({ default: m.Navbar })));
const Footer = lazy(() => import('./components/Footer').then(m => ({ default: m.Footer })));
import { Features } from './components/Features';
const Gallery = lazy(() => import('./components/Gallery').then(m => ({ default: m.Gallery })));
const LeadForm = lazy(() => import('./components/LeadForm').then(m => ({ default: m.LeadForm })));
const AdminDashboard = lazy(() => import('./components/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const MapSection = lazy(() => import('./components/MapSection').then(m => ({ default: m.MapSection })));
const Promotions = lazy(() => import('./components/Promotions').then(m => ({ default: m.Promotions })));
const Developer = lazy(() => import('./components/Developer').then(m => ({ default: m.Developer })));
const PrivacyPolicy = lazy(() => import('./components/PrivacyPolicy').then(m => ({ default: m.PrivacyPolicy })));
const TermsOfService = lazy(() => import('./components/TermsOfService').then(m => ({ default: m.TermsOfService })));
const SuperAdminPortal = lazy(() => import('./components/portal/SuperAdminPortal').then(m => ({ default: m.SuperAdminPortal })));
const BrokerPortal = lazy(() => import('./components/portal/BrokerPortal').then(m => ({ default: m.BrokerPortal })));
const ClientPortal = lazy(() => import('./components/portal/ClientPortal').then(m => ({ default: m.ClientPortal })));
const ComingSoon = lazy(() => import('./components/ComingSoon').then(m => ({ default: m.ComingSoon })));
const Blog = lazy(() => import('./components/Blog').then(m => ({ default: m.Blog })));

import { LazySection } from './components/LazySection';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      setTimeout(() => {
        scrollToSection(hash);
      }, 150);
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);
  return null;
}

import { HeroPopup } from './components/HeroPopup';
const WhyChooseUs = lazy(() => import('./components/WhyChooseUs').then(m => ({ default: m.WhyChooseUs })));

function HomePage() {
  const [selectedOffers, setSelectedOffers] = useState<string[]>([]);

  const handleClaim = (offers: string[]) => {
    setSelectedOffers(offers);
    setTimeout(() => {
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 250);
  };

  return (
    <div>
      {/* 1. Hero Section + 5-Sec Interaction Popup */}
      <Hero />
      <HeroPopup />

      {/* 2. Flats & Floor Plans */}
      <Features onOpen3D={() => {}} />

      {/* 3. Gallery (Just below Flats) */}
      <div id="gallery" className="scroll-mt-24">
        <Suspense fallback={<div className="h-64 flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-gold border-t-transparent animate-spin"></div></div>}>
          <Gallery />
        </Suspense>
      </div>

      {/* 4. Amenities & Benefits (Why Choose Us) */}
      <div id="why-choose-us" className="scroll-mt-24">
        <Suspense fallback={<div className="h-48 flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-gold border-t-transparent animate-spin"></div></div>}>
          <WhyChooseUs />
        </Suspense>
      </div>

      {/* 5. Special Deals & Rewards (Just above the Contact Form) */}
      <div id="offers-section" className="scroll-mt-24">
        <Suspense fallback={<div className="h-48 flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-gold border-t-transparent animate-spin"></div></div>}>
          <Promotions onClaim={handleClaim} />
        </Suspense>
      </div>

      {/* 6. Lead Form (Contact Us) */}
      <div id="contact" className="scroll-mt-24">
        <Suspense fallback={<div className="h-64 flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-gold border-t-transparent animate-spin"></div></div>}>
          <LeadForm preselectedOffers={selectedOffers} />
        </Suspense>
      </div>

      {/* 7. Map & Neighborhood Nexus (At the very bottom above Footer) */}
      <div id="location" className="scroll-mt-24">
        <Suspense fallback={<div className="h-64 flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-gold border-t-transparent animate-spin"></div></div>}>
          <MapSection />
        </Suspense>
      </div>
    </div>
  );
}

import { CMSProvider } from './context/CMSContext';

export default function App() {
  return (
    <CMSProvider>
      <Router>
        <ScrollToTop />
        <div className="min-h-screen bg-paper overflow-x-hidden w-full">
          <Suspense fallback={null}>
            <Navbar />
          </Suspense>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/admin" element={
                <Suspense fallback={<div className="h-screen w-full bg-dark flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-gold border-t-transparent animate-spin"></div></div>}>
                  <AdminDashboard />
                </Suspense>
              } />
              <Route path="/admin/super" element={
                <Suspense fallback={null}>
                  <SuperAdminPortal />
                </Suspense>
              } />
              <Route path="/admin/broker" element={
                <Suspense fallback={null}>
                  <BrokerPortal />
                </Suspense>
              } />
              <Route path="/admin/client" element={
                <Suspense fallback={null}>
                  <ClientPortal />
                </Suspense>
              } />
              <Route path="/developer" element={
                <Suspense fallback={null}>
                  <Developer />
                </Suspense>
              } />
              <Route path="/privacy-policy" element={
                <Suspense fallback={null}>
                  <PrivacyPolicy />
                </Suspense>
              } />
              <Route path="/terms-of-service" element={
                <Suspense fallback={null}>
                  <TermsOfService />
                </Suspense>
              } />
              <Route path="/coming-soon" element={
                <Suspense fallback={null}>
                  <ComingSoon />
                </Suspense>
              } />
              <Route path="/blog" element={
                <Suspense fallback={null}>
                  <Blog />
                </Suspense>
              } />
            </Routes>
          <Suspense fallback={<div className="h-24" />}>
            <Footer />
          </Suspense>
          <Analytics />
        </div>
      </Router>
    </CMSProvider>
  );
}
