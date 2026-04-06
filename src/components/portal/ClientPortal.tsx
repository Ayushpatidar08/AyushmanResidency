import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { Lead, UserDocument } from '../../types';
import {
  ArrowLeft, User, Phone, Search, Clock, CheckCircle2, Award,
  Heart, FileText, UserCircle, Building2, Upload, Trash2, File, 
  Image as ImageIcon, Download, Plus, X, Camera, Bell
} from 'lucide-react';

type Tab = 'inquiries' | 'profile';

export function ClientPortal() {
  const [activeTab, setActiveTab] = useState<Tab>('inquiries');
  const [phone, setPhone] = useState('');
  const [leads, setLeads] = useState<any[]>([]);
  const [clientVisits, setClientVisits] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState<UserDocument[]>(() => {
    const saved = localStorage.getItem('client_documents');
    return saved ? JSON.parse(saved) : [];
  });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    localStorage.setItem('client_documents', JSON.stringify(documents));
  }, [documents]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length !== 10) {
      alert("Please enter exactly 10 digits.");
      return;
    }
    setLoading(true);
    try {
      const formattedSearchPhone = `+91 ${phone}`;
      const [leadsRes, visitsRes] = await Promise.all([
        fetch(`/api/leads/phone/${encodeURIComponent(formattedSearchPhone)}`),
        fetch(`/api/site-visits/client/${encodeURIComponent(formattedSearchPhone)}`)
      ]);
      setLeads(await leadsRes.json());
      setClientVisits(await visitsRes.json());
      setSearched(true);
    } catch (err) {
      console.error('Failed to search');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    
    // Simulate Cloud Upload
    setTimeout(() => {
      const newDocs: UserDocument[] = Array.from(files).map((file: File) => ({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: file.type,
        size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
        url: URL.createObjectURL(file), // Using local URL as mock cloud URL
        created_at: new Date().toISOString()
      }));

      setDocuments(prev => [...newDocs, ...prev]);
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }, 1500);
  };

  const removeDocument = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  const statusConfig: Record<string, { label: string; color: string; icon: any; bg: string }> = {
    pending: { label: 'Pending', color: 'text-yellow-400', icon: Clock, bg: 'bg-yellow-400/10 border-yellow-400/20' },
    contacted: { label: 'Contacted', color: 'text-blue-400', icon: Phone, bg: 'bg-blue-400/10 border-blue-400/20' },
    connected: { label: 'Connected', color: 'text-green-400', icon: CheckCircle2, bg: 'bg-green-400/10 border-green-400/20' },
    closed: { label: 'Closed', color: 'text-purple-400', icon: Award, bg: 'bg-purple-400/10 border-purple-400/20' },
  };

  return (
    <div className="pt-24 pb-12 min-h-screen bg-dark text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/admin" className="inline-flex items-center text-white/40 hover:text-gold text-sm mb-3 mt-4 transition-colors group p-2 -m-2">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            All Portals
          </Link>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mt-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10 rounded-2xl">
                <UserCircle className="w-8 h-8 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-3xl font-serif font-bold tracking-tight">Client Hub</h1>
                <p className="text-white/40 text-sm">Securely track and manage your property journey.</p>
              </div>
            </div>
            
            {/* Tab Navigation */}
            <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10 self-start md:self-center">
              {[
                { key: 'inquiries', label: 'My Inquiries', icon: Search },
                /* { key: 'profile', label: 'Document Saver', icon: FileText }, */
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as Tab)}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all ${activeTab === tab.key
                    ? 'bg-gold text-dark shadow-lg shadow-gold/20'
                    : 'text-white/50 hover:text-white hover:bg-white/5'}`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {activeTab === 'inquiries' ? (
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
            {/* Search by Phone */}
            <div className="bg-gradient-to-br from-white/10 to-transparent rounded-3xl border border-white/10 p-8 mb-8 shadow-2xl overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
                <Search className="w-48 h-48" />
              </div>
              <div className="relative z-10">
                <h3 className="text-xl font-serif font-bold mb-2">Track Your Inquiries</h3>
                <p className="text-white/40 text-sm mb-8 max-w-md">Enter your phone number to see the current stage of your residential or commercial requests.</p>
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gold" />
                      <span className="text-white/40 font-bold select-none">+91</span>
                    </div>
                    <input
                      type="tel"
                      placeholder="9876543210"
                      maxLength={10}
                      className="w-full pl-20 pr-4 py-4 bg-dark/50 rounded-2xl border border-white/10 text-white text-lg placeholder:text-white/10 outline-none focus:ring-2 ring-gold/40 transition-all focus:bg-dark"
                      value={phone}
                      onChange={e => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setPhone(val);
                      }}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-10 py-4 bg-gold text-dark font-black rounded-2xl hover:bg-white hover:scale-105 transition-all disabled:opacity-50 shadow-lg shadow-gold/10"
                  >
                    {loading ? 'Searching...' : 'Check Status'}
                  </button>
                </form>
              </div>
            </div>

            {/* Results */}
            <AnimatePresence mode="wait">
              {searched && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  {leads.length > 0 ? (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-serif font-bold">Applications Found ({leads.length})</h3>
                        <div className="h-px bg-white/10 flex-1 ml-6"></div>
                      </div>
                      {leads.map(lead => {
                        const config = statusConfig[lead.status] || statusConfig.pending;
                        const StatusIcon = config.icon;
                        const leadVisits = clientVisits.filter(v => v.lead_id === lead.id);

                        return (
                          <motion.div 
                            key={lead.id} 
                            className="bg-zinc-900 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden group"
                          >
                            <div className={`h-2 w-full ${config.bg.split(' ')[0]} bg-opacity-100`}></div>
                            <div className={`absolute top-0 right-0 w-64 h-64 -mr-32 -mt-32 opacity-5 rounded-full blur-3xl ${config.bg.split(' ')[0]}`}></div>
                            
                            <div className="p-8 relative z-10">
                              {/* Header & Main Info */}
                              <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-white/5 pb-8 mb-8">
                                <div className="space-y-4">
                                  <div className="flex items-center gap-4">
                                    <div className="p-4 bg-gold/10 rounded-2xl">
                                      <Building2 className="w-8 h-8 text-gold" />
                                    </div>
                                    <div>
                                      <h4 className="font-bold text-3xl mb-1 tracking-tight">{lead.property_type}</h4>
                                      <p className="text-gold text-sm font-bold uppercase tracking-widest">{lead.location_pref || 'Ayushmaan residency'}</p>
                                    </div>
                                  </div>
                                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/50 font-medium">
                                    <span className="flex items-center gap-2"><User className="w-4 h-4" /> {lead.name}</span>
                                    <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> Filed: {new Date(lead.created_at).toLocaleDateString()}</span>
                                  </div>
                                </div>
                                
                                <div className="flex flex-col items-end gap-3 w-full md:w-auto">
                                  <div className={`flex w-full md:w-auto items-center justify-center gap-3 px-6 py-3 rounded-2xl border text-sm font-black uppercase tracking-widest ${config.bg} ${config.color}`}>
                                    <StatusIcon className="w-5 h-5" />
                                    {config.label}
                                  </div>
                                  
                                  {lead.assigned_broker_name ? (
                                    <div className="bg-white/5 w-full md:w-auto p-4 rounded-xl border border-white/5 text-right">
                                      <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mb-1">Assigned Executive</p>
                                      <p className="font-bold text-sm">{lead.assigned_broker_name}</p>
                                      {lead.assigned_broker_phone && (
                                        <a href={`tel:${lead.assigned_broker_phone}`} className="text-gold flex items-center justify-end gap-1 mt-1 text-xs font-bold hover:underline">
                                          <Phone className="w-3 h-3" /> Call {lead.assigned_broker_phone}
                                        </a>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="bg-white/5 px-4 py-3 rounded-xl text-xs font-bold text-white/30 border border-white/5 text-center">
                                      Executive will be assigned soon
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Advanced Profile Breakdown */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                {/* Left Col: Details */}
                                <div className="space-y-6">
                                  <div>
                                    <h5 className="text-[10px] font-bold uppercase tracking-widest text-gold/60 mb-3">Your Requirements</h5>
                                    <div className="space-y-4 bg-white/5 p-5 rounded-2xl border border-white/5">
                                      <div>
                                        <p className="text-xs text-white/40 mb-1">Budget</p>
                                        <p className="font-bold">{lead.budget || 'Not specified'}</p>
                                      </div>
                                      {lead.message && (
                                        <div>
                                          <p className="text-xs text-white/40 mb-1">Additional Message</p>
                                          <p className="text-white/80 text-sm italic">"{lead.message}"</p>
                                        </div>
                                      )}
                                      {lead.claimed_offers && lead.claimed_offers.length > 0 && (
                                        <div>
                                          <p className="text-xs text-white/40 mb-2">Claimed Offers</p>
                                          <div className="flex flex-wrap gap-2">
                                            {lead.claimed_offers.map((offer: string, i: number) => (
                                              <span key={i} className="text-[10px] font-bold px-2 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg">
                                                {offer}
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Download Brochures Area */}
                                  <div>
                                    <h5 className="text-[10px] font-bold uppercase tracking-widest text-gold/60 mb-3">Downloads</h5>
                                    <div className="flex gap-3">
                                      <a href="/brochures/2bhk.pdf" onClick={(e) => { e.preventDefault(); alert('2 BHK Brochure Downloading...'); }} className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold transition-colors">
                                        <Download className="w-4 h-4 text-gold" /> 2 BHK Brochure
                                      </a>
                                      <a href="/brochures/3bhk.pdf" onClick={(e) => { e.preventDefault(); alert('3 BHK Brochure Downloading...'); }} className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold transition-colors">
                                        <Download className="w-4 h-4 text-gold" /> 3 BHK Brochure
                                      </a>
                                    </div>
                                  </div>
                                </div>

                                {/* Right Col: Meetings & Activity */}
                                <div className="space-y-6">
                                  <h5 className="text-[10px] font-bold uppercase tracking-widest text-gold/60 mb-3">Site Visits & Meetings</h5>
                                  <div className="bg-white/5 p-5 rounded-2xl border border-white/5 h-full min-h-[12rem]">
                                    {leadVisits.length > 0 ? (
                                      <div className="space-y-4">
                                        {leadVisits.map(visit => (
                                          <div key={visit.id} className="flex gap-4 items-start pb-4 border-b border-white/5 last:border-0 last:pb-0">
                                            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                                              <Clock className="w-4 h-4 text-blue-400" />
                                            </div>
                                            <div>
                                              <p className="font-bold text-sm">Site Visit Scheduled</p>
                                              <p className="text-white/50 text-xs mt-1">{new Date(visit.visit_date).toLocaleDateString()}</p>
                                              <p className="text-white/40 text-xs mt-1 italic">"{visit.notes || 'No specific notes'}"</p>
                                              <span className="inline-block px-2 py-0.5 mt-2 bg-white/5 border border-white/10 text-[10px] font-bold uppercase rounded text-white/60">
                                                Status: {visit.status}
                                              </span>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <div className="h-full flex flex-col items-center justify-center text-center opacity-50 space-y-3 py-6">
                                        <Clock className="w-8 h-8 mx-auto text-white" />
                                        <p className="text-sm">No site visits scheduled yet.</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-white/5 rounded-3xl border border-white/10 p-20 text-center shadow-xl">
                      <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Search className="w-10 h-10 text-white/10" />
                      </div>
                      <h3 className="text-2xl font-serif font-bold mb-3">Record Not Found</h3>
                      <p className="text-white/30 text-base max-w-sm mx-auto leading-relaxed">We couldn't locate any inquiries under <span className="text-gold">"{phone}"</span>. Please verify your number or contact support.</p>
                      <button 
                        onClick={() => setSearched(false)} 
                        className="mt-8 text-gold font-bold hover:underline underline-offset-8"
                      >
                        Try a different number
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : null}

        {/* Info Footer */}
        <div className="mt-12 pt-8 border-t border-white/5 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="flex items-center gap-3 text-white/30">
            <Award className="w-5 h-5 text-gold/40" />
            <span className="text-xs font-bold uppercase tracking-widest">Premium Support</span>
          </div>
          <div className="flex items-center gap-3 text-white/30">
            <CheckCircle2 className="w-5 h-5 text-emerald-500/40" />
            <span className="text-xs font-bold uppercase tracking-widest">End-to-End Encryption</span>
          </div>
          <div className="flex items-center gap-3 text-white/30">
            <Clock className="w-5 h-5 text-gold/40" />
            <span className="text-xs font-bold uppercase tracking-widest">24/7 Monitoring</span>
          </div>
        </div>
      </div>
    </div>
  );
}
