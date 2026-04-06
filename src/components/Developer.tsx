import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Github, Instagram, Linkedin, Mail, Globe, Send, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Developer() {
  const [formData, setFormData] = useState({ name: '', email: '', details: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch('/api/developer/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send message');
      
      setStatus('success');
      setMessage(data.message);
      setFormData({ name: '', email: '', details: '' });
      setTimeout(() => setStatus('idle'), 5000);
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message);
    }
  };

  const socialLinks = [
    { 
      name: 'LinkedIn', 
      Icon: Linkedin, 
      href: 'https://www.linkedin.com/in/ayush-patidar-3b4800279/',
      color: 'hover:text-[#0A66C2]'
    },
    { 
      name: 'GitHub', 
      Icon: Github, 
      href: 'https://github.com/Ayushpatidar08', 
      color: 'hover:text-white'
    },
    { 
      name: 'Instagram', 
      Icon: Instagram, 
      href: 'https://www.instagram.com/lucky__patidar_._/', 
      color: 'hover:text-[#E4405F]'
    },
    { 
      name: 'Portfolio', 
      Icon: Globe, 
      href: 'https://ayushpatidar.dev', 
      color: 'hover:text-[#D4AF37]'
    }
  ];

  return (
    <div className="min-h-screen bg-dark text-white pt-[120px] pb-20 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back navigation */}
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
        >
          {/* Header Section */}
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center mb-16 border-b border-white/10 pb-12">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-white/5 border-2 border-gold/30 flex items-center justify-center overflow-hidden shrink-0 relative group">
              <div className="relative aspect-square md:aspect-auto md:h-full group">
                <img 
                src="/developer.webp" 
                alt="Ayush Patidar" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  /* Fallback to initials if image is not found */
                  e.currentTarget.style.display = 'none';
                  const span = e.currentTarget.nextElementSibling as HTMLElement;
                  if (span) span.style.display = 'block';
                }}
                />
              </div>
              <span className="text-4xl md:text-5xl font-serif text-gold hidden">AP</span>
            </div>
            
            <div>
              <p className="text-gold font-mono text-sm tracking-widest uppercase mb-2">Developer of Ayushmaan Residency Website</p>
              <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-4 mb-4">
                <h1 className="text-4xl md:text-6xl font-serif">Ayush Patidar</h1>
                <h2 className="text-xl md:text-2xl text-gold/90 font-serif md:mt-0 mt-1"></h2>
              </div>
              <p className="text-white/60 text-lg md:text-xl font-light max-w-2xl leading-relaxed">
                A passionate Frontend Developer specializing in creating immersive, premium web experiences with 
                modern technologies like React, Tailwind, and Framer Motion.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div>
              <h2 className="text-2xl font-serif text-gold mb-6 border-b border-white/10 pb-4 inline-block">Connect With Me</h2>
              
              <div className="space-y-6">
                <a href="mailto:ayushpatidarmh2@gmail.com" className="flex items-center space-x-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-gold/50 transition-colors group">
                  <div className="p-3 bg-white/5 rounded-lg group-hover:bg-gold/10 transition-colors">
                    <Mail className="w-6 h-6 text-gold" />
                  </div>
                  <div>
                    <p className="text-white/50 text-xs tracking-widest uppercase mb-1">Email Me At</p>
                    <p className="text-white group-hover:text-gold transition-colors">ayushpatidarmh2@gmail.com</p>
                  </div>
                </a>

                <div className="grid grid-cols-2 gap-4">
                  {socialLinks.map((link) => (
                    <a 
                      key={link.name} 
                      href={link.href} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 transition-colors group"
                    >
                      <link.Icon className={`w-5 h-5 text-white/50 transition-colors ${link.color}`} />
                      <span className="text-white/80 group-hover:text-white">{link.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-serif text-gold mb-6 border-b border-white/10 pb-4 inline-block">Let's Work Together</h2>
              
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <input 
                    type="text" 
                    placeholder="Your Name" 
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/50 transition-all font-light"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                  <input 
                    type="email" 
                    placeholder="Your Email" 
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/50 transition-all font-light"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                  <textarea 
                    placeholder="Project Details" 
                    rows={4}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/50 transition-all font-light resize-none"
                    value={formData.details}
                    onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                  />
                </div>

                {status === 'success' && (
                  <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> {message}
                  </div>
                )}

                {status === 'error' && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> {message}
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full bg-gold text-dark font-bold rounded-xl px-6 py-4 flex items-center justify-center space-x-2 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {status === 'loading' ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Message</span>
                      <Send className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
