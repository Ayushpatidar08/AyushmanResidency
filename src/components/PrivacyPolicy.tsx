import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';

export function PrivacyPolicy() {
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
          <h1 className="text-4xl md:text-5xl font-serif mb-8 text-gold">Privacy Policy</h1>
          <div className="space-y-6 text-white/80 font-light leading-relaxed">
            <p><strong>Last Updated:</strong> March 25, 2026</p>
            
            <p>
              At Ayushmaan Residency, we value the trust you place in us when sharing your personal information. This Privacy Policy outlines how we collect, use, protect, and handle your data throughout your journey with us—from your initial inquiry on our website to the final verification of documents during the property acquisition process.
            </p>

            <h2 className="text-2xl font-serif text-white mt-8 mb-4">1. Information We Collect</h2>
            <p>We collect information at two distinct stages of our relationship with you:</p>
            
            <div className="pl-6 space-y-4">
              <h3 className="text-lg font-bold text-white/90">A. Inquiry & Lead Generation (Digital)</h3>
              <p>When you interact with our website via contact forms, lead forms, or our broker portal, we may collect:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Identity Data:</strong> Full name and title.</li>
                <li><strong>Contact Data:</strong> Email address, phone number, and mailing address.</li>
                <li><strong>Preference Data:</strong> Your interest in specific floor plans, budget ranges, or investment types.</li>
              </ul>

              <h3 className="text-lg font-bold text-white/90">B. Sales & Verification (Post-Booking)</h3>
              <p>Once you proceed toward a purchase or lease, we are legally required to collect sensitive documentation for verification, including:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Government Identifiers:</strong> PAN Card, Aadhaar Card, Passport, or Voter ID.</li>
                <li><strong>Financial Records:</strong> Income proof, bank statements, or loan approval letters.</li>
                <li><strong>Legal Status:</strong> Proof of address and photographs for KYC (Know Your Customer) compliance.</li>
              </ul>
            </div>

            <h2 className="text-2xl font-serif text-white mt-8 mb-4">2. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Communication:</strong> To provide updates on project milestones, pricing, and availability.</li>
              <li><strong>Verification:</strong> To authenticate your identity and ensure compliance with Real Estate Regulatory Authority (RERA) guidelines and anti-money laundering laws.</li>
              <li><strong>Personalization:</strong> To tailor our luxury offerings to your specific lifestyle needs.</li>
              <li><strong>Legal Obligations:</strong> To process sale deeds, registration papers, and other statutory requirements.</li>
            </ul>

            <h2 className="text-2xl font-serif text-white mt-8 mb-4">3. Data Protection & Security</h2>
            <p>We implement a variety of security measures to maintain the safety of your personal information.</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Encryption:</strong> Sensitive documents collected for verification are stored in encrypted environments with restricted access.</li>
              <li><strong>No Third-Party Selling:</strong> We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties for marketing purposes.</li>
              <li><strong>Authorized Access:</strong> Access to your verification documents is strictly limited to authorized legal and compliance officers within Ayushmaan Residency.</li>
            </ul>

            <h2 className="text-2xl font-serif text-white mt-8 mb-4">4. Data Retention</h2>
            <p>We retain your personal information only as long as necessary to fulfill the purposes outlined in this policy, or as required by Indian law (e.g., keeping records of property transactions for tax and legal audits).</p>

            <h2 className="text-2xl font-serif text-white mt-8 mb-4">5. Your Rights</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Access:</strong> Request a copy of the personal data we hold about you.</li>
              <li><strong>Correction:</strong> Ask us to correct any inaccurate or incomplete information.</li>
              <li><strong>Withdrawal:</strong> Withdraw consent for marketing communications at any time.</li>
            </ul>

            <h2 className="text-2xl font-serif text-white mt-8 mb-4">6. Contact Us</h2>
            <p>
              If there are any questions regarding this privacy policy, you may contact our compliance team:
            </p>
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-2">
              <p><strong>Email:</strong> <a href="mailto:residencyayushman@gmail.com" className="text-gold hover:underline">residencyayushman@gmail.com</a></p>
              <p><strong>Address:</strong> Rau, near Medicaps University, Indore, M.P.</p>
              <p><strong>Phone:</strong> +91 78696-12823</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
