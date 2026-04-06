import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';

export function TermsOfService() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <div className="min-h-screen bg-dark text-white pt-[120px] pb-20 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <Link 
          to="/" 
          className="inline-flex items-center space-x-2 text-white/50 hover:text-gold mb-12 transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </Link>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="prose prose-invert prose-gold max-w-none"
        >
          <h1 className="text-4xl md:text-5xl font-serif mb-8 text-gold">Terms of Service</h1>
          <div className="space-y-6 text-white/80 font-light leading-relaxed">
            <p><strong>Effective Date:</strong> March 25, 2026</p>
            
            <p>
              Welcome to the official website of Ayushmaan Residency. By accessing or using our website, portals, or services, you agree to comply with and be bound by the following terms and conditions. Please read them carefully.
            </p>

            <h2 className="text-2xl font-serif text-white mt-8 mb-4">1. Acceptance of Terms</h2>
            <p>
              By using this website, you confirm that you are at least 18 years of age and possess the legal authority to enter into this agreement. These terms apply to all visitors, brokers, and potential buyers.
            </p>

            <h2 className="text-2xl font-serif text-white mt-8 mb-4">2. Nature of Information</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Marketing Material:</strong> The images, 3D renders, floor plans, and amenities shown on this website are for representational purposes only. Actual project deliverables may vary as per the final sanctioned plans.</li>
              <li><strong>No Binding Offer:</strong> Information on this website does not constitute a legal offer or a contract. A formal agreement for sale is required to initiate a property purchase.</li>
            </ul>

            <h2 className="text-2xl font-serif text-white mt-8 mb-4">3. User Conduct & Form Submission</h2>
            <p>When using our contact forms or broker portals:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>You agree to provide accurate, current, and complete information.</li>
              <li>You represent that any documents uploaded for verification (Aadhaar, PAN, etc.) are authentic.</li>
              <li>Unauthorized use of this website, including "scraping" data or attempting to bypass security protocols, is strictly prohibited.</li>
            </ul>

            <h2 className="text-2xl font-serif text-white mt-8 mb-4">4. Intellectual Property</h2>
            <p>
              All content on this site, including the Ayushmaan Residency logo, architectural designs, and text, is the exclusive property of the developer. No part of this site may be reproduced or reused without express written consent.
            </p>

            <h2 className="text-2xl font-serif text-white mt-8 mb-4">5. Document Verification & KYC</h2>
            <p>For users proceeding with a booking:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>You acknowledge that we are required by law to collect and verify KYC documents.</li>
              <li>Final allotment of any unit is subject to the successful verification of these documents and the realization of the booking amount.</li>
              <li>Any discrepancy found in submitted documents may lead to the cancellation of the inquiry or booking.</li>
            </ul>

            <h2 className="text-2xl font-serif text-white mt-8 mb-4">6. Limitation of Liability</h2>
            <p>
              Ayushmaan Residency shall not be liable for any direct or indirect damages arising from the use of this website or reliance on its content. While we strive for 100% accuracy, we do not warrant that the website will be error-free or constantly available.
            </p>

            <h2 className="text-2xl font-serif text-white mt-8 mb-4">7. Governing Law</h2>
            <p>
              These terms are governed by the laws of India. Any disputes arising from the use of this website or our services shall be subject to the exclusive jurisdiction of the courts in Indore, Madhya Pradesh.
            </p>

            <h2 className="text-2xl font-serif text-white mt-8 mb-4">8. Contact Information</h2>
            <p>
              For any legal inquiries regarding these terms, please reach out to us:
            </p>
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-2 text-sm">
              <p><strong>Location:</strong> Rau, near Medicaps University, Indore, M.P.</p>
              <p><strong>Phone:</strong> +91 78696-12823</p>
              <p><strong>Email:</strong> <a href="mailto:residencyayushman@gmail.com" className="text-gold hover:underline">residencyayushman@gmail.com</a></p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
