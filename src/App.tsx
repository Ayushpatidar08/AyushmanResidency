import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Hero } from './components/Hero';
import { Analytics } from '@vercel/analytics/react';

import { useState, Suspense, lazy } from 'react';

const Navbar = lazy(() => import('./components/Navbar').then(m => ({ default: m.Navbar })));
const Footer = lazy(() => import('./components/Footer').then(m => ({ default: m.Footer })));
const Gallery = lazy(() => import('./components/Gallery').then(m => ({ default: m.Gallery })));
const Features = lazy(() => import('./components/Features').then(m => ({ default: m.Features })));
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

import { LazySection } from './components/LazySection';

function HomePage() {
  const [selectedOffers, setSelectedOffers] = useState<string[]>([]);

  const handleClaim = (offers: string[]) => {
    setSelectedOffers(offers);
    setTimeout(() => {
      const offersSection = document.getElementById('offers-section');
      if (offersSection) {
        offersSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        const contactSection = document.getElementById('contact');
        contactSection?.scrollIntoView({ behavior: 'smooth' });
      }
    }, 400);
  };

  return (
    <div>
      <Hero />
      <LazySection minHeight="1200px">
        <Suspense fallback={<div className="h-64 flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-gold border-t-transparent animate-spin"></div></div>}>
          <Features onOpen3D={() => {}} />
        </Suspense>
      </LazySection>
      
      <LazySection minHeight="1000px">
        <Suspense fallback={<div className="h-64 flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-gold border-t-transparent animate-spin"></div></div>}>
          <Promotions onClaim={handleClaim} />
        </Suspense>
      </LazySection>
      
      <LazySection minHeight="2000px">
        <Suspense fallback={<div className="h-96 flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-gold border-t-transparent animate-spin"></div></div>}>
          <Gallery />
        </Suspense>
      </LazySection>
      
      <LazySection minHeight="800px">
        <Suspense fallback={<div className="h-64 flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-gold border-t-transparent animate-spin"></div></div>}>
          <MapSection />
        </Suspense>
      </LazySection>

      <div id="contact" className="scroll-mt-32">
        <LazySection minHeight="1200px">
          <Suspense fallback={<div className="h-96 flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-gold border-t-transparent animate-spin"></div></div>}>
            <LeadForm preselectedOffers={selectedOffers} />
          </Suspense>
        </LazySection>
      </div>

    </div>
  );
}

import { CMSProvider } from './context/CMSContext';

export default function App() {
  return (
    <CMSProvider>
      <Router>
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
