import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Lead, Broker, Notice, LeaderboardEntry } from '../../types';
import {
  ArrowLeft, Building2, Phone, Mail, MapPin, Wallet, Calendar,
  Search, RefreshCw, Trophy, Bell, Clock, CheckCircle2, Award,
  Users, TrendingUp, Target, CalendarDays, Plus, X, Eye, FileDown,
  Filter, FileText, Upload
} from 'lucide-react';
import { setupAutoLogout, authFetch, logout } from '../../utils/auth';

type Tab = 'dashboard' | 'leads' | 'leads_list' | 'visits' | 'documents';

export function BrokerPortal() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [selectedBrokerId, setSelectedBrokerId] = useState<number | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [brokerStats, setBrokerStats] = useState<any>({});
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [siteVisits, setSiteVisits] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Site visit form
  const [visitForm, setVisitForm] = useState({ lead_id: '', visit_date: '', notes: '' });
  
  // Manual Lead Form
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [manualLeadForm, setManualLeadForm] = useState<{
    name: string; phone: string; property_type: string; location_pref: string; budget: string; email: string; message: string; claimed_offers: string[];
  }>({ name: '', phone: '', property_type: '2BHK', location_pref: '', budget: '', email: '', message: '', claimed_offers: [] });
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);

  // Download Leads List Filters
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadFilters, setDownloadFilters] = useState({ status: 'all', sort: 'date', time: 'all' });

  // Document Upload State
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docLeadId, setDocLeadId] = useState('');

  useEffect(() => { 
    if (localStorage.getItem('auth_role') !== 'broker') {
      window.location.href = '/admin';
      return;
    }
    window.scrollTo(0, 0); 
    setupAutoLogout();
    fetchBrokers(); 
  }, []);


  useEffect(() => {
    if (selectedBrokerId) fetchBrokerData();
  }, [selectedBrokerId]);

  useEffect(() => {
    if (selectedBrokerId) fetchBrokerData();
  }, [selectedBrokerId]);

  const fetchBrokers = async () => {
    try {
      const res = await authFetch('/api/brokers');
      const data = await res.json();
      const activeBrokers = data.filter((b: Broker) => b.is_active);
      setBrokers(activeBrokers);

      // Lock to logged-in broker if auth_broker_id exists
      const authBrokerId = localStorage.getItem('auth_broker_id');
      if (authBrokerId) {
        setSelectedBrokerId(parseInt(authBrokerId));
      } else if (activeBrokers.length > 0 && !selectedBrokerId) {
        setSelectedBrokerId(activeBrokers[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch brokers');
    }
  };

  const fetchBrokerData = async () => {
    if (!selectedBrokerId) return;
    setLoading(true);
    try {
      const brokerName = brokers.find(b => b.id === selectedBrokerId)?.name || 'Broker';
      const [leadsRes, statsRes, lbRes, visitsRes, docsRes] = await Promise.all([
        authFetch(`/api/leads/broker/${selectedBrokerId}`),
        authFetch(`/api/stats/broker/${selectedBrokerId}`),
        authFetch('/api/leaderboard'),
        authFetch(`/api/site-visits/${selectedBrokerId}`),
        authFetch(`/api/client-documents/${selectedBrokerId}`)
      ]);
      setLeads(await leadsRes.json());
      setBrokerStats(await statsRes.json());
      setLeaderboard(await lbRes.json());
      setSiteVisits(await visitsRes.json());
      setDocuments(await docsRes.json());
    } catch (err) {
      console.error('Failed to fetch broker data');
    } finally {
      setLoading(false);
    }
  };

  const updateLeadStatus = async (leadId: number, status: string) => {
    await authFetch(`/api/leads/${leadId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
    fetchBrokerData();
  };

  const createSiteVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitForm.lead_id || !visitForm.visit_date || !selectedBrokerId) return;
    await authFetch('/api/site-visits', {
      method: 'POST',
      body: JSON.stringify({
        broker_id: selectedBrokerId,
        lead_id: parseInt(visitForm.lead_id),
        visit_date: visitForm.visit_date,
        notes: visitForm.notes
      })
    });
    setVisitForm({ lead_id: '', visit_date: '', notes: '' });
    fetchBrokerData();
  };

  const createManualLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualLeadForm.name || !manualLeadForm.phone || !selectedBrokerId) return;
    setIsSubmittingLead(true);
    
    try {
      await authFetch('/api/leads', {
        method: 'POST',
        body: JSON.stringify({
          ...manualLeadForm,
          phone: manualLeadForm.phone.startsWith('+91') ? manualLeadForm.phone : `+91${manualLeadForm.phone}`,
          referral: brokers.find(b => b.id === selectedBrokerId)?.name || 'Direct Entry',
          assigned_broker_id: selectedBrokerId
        })
      });
      setManualLeadForm({ name: '', phone: '', property_type: '2BHK', location_pref: '', budget: '', email: '', message: '', claimed_offers: [] });
      setShowAddLeadModal(false);
      fetchBrokerData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingLead(false);
    }
  };

  const uploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docFile || !docLeadId || !selectedBrokerId) return;

    setUploadingDoc(true);
    const formData = new FormData();
    formData.append('file', docFile);
    formData.append('broker_id', selectedBrokerId.toString());
    formData.append('lead_id', docLeadId);

    try {
      const res = await authFetch('/api/client-documents', {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        setDocFile(null);
        setDocLeadId('');
        fetchBrokerData();
      } else {
        alert('Failed to upload document');
      }
    } catch (error) {
      console.error('Error uploading document', error);
      alert('Error uploading document');
    } finally {
      setUploadingDoc(false);
    }
  };

  const downloadLeads = (format: 'csv' | 'pdf') => {
    let target = leads;
    
    // Status Filter
    if (downloadFilters.status !== 'all') {
      target = target.filter(l => l.status === downloadFilters.status);
    }
    
    // Time Filter
    if (downloadFilters.time !== 'all') {
      const now = new Date();
      target = target.filter(l => {
         const d = new Date(l.created_at);
         if (downloadFilters.time === 'today') return d.toDateString() === now.toDateString();
         if (downloadFilters.time === 'month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
         return true;
      });
    }

    // Sort Filter
    if (downloadFilters.sort === 'a-z') {
      target = [...target].sort((a,b) => a.name.localeCompare(b.name));
    } else {
      target = [...target].sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    if (format === 'csv') {
      const headers = ['Name', 'Phone', 'Status', 'Property Type', 'Location', 'Budget', 'Date'];
      const csv = [headers.join(',')];
      target.forEach(l => {
        csv.push([
          `"${l.name}"`, 
          `"${l.phone}"`, 
          `"${l.status}"`, 
          `"${l.property_type}"`, 
          `"${l.location_pref || ''}"`, 
          `"${l.budget || ''}"`, 
          `"${new Date(l.created_at).toLocaleDateString()}"`
        ].join(','));
      });
      const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `leads_list_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    } else if (format === 'pdf') {
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;
      printWindow.document.write(`
        <html>
        <head>
          <title>Leads List</title>
          <style>
            body { font-family: sans-serif; padding: 20px; color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            th { background-color: #f5f5f5; }
            h2 { color: #c9a050; border-bottom: 2px solid #ddd; padding-bottom: 10px; }
          </style>
        </head>
        <body>
          <h2>Leads List (Total: ${target.length})</h2>
          <table>
            <tr>
              <th>Name</th><th>Phone</th><th>Status</th><th>Property Type</th><th>Location</th><th>Date</th>
            </tr>
            ${target.map(l => `<tr><td>${l.name}</td><td>${l.phone}</td><td style="text-transform: capitalize;">${l.status}</td><td>${l.property_type}</td><td>${l.location_pref||'N/A'}</td><td>${new Date(l.created_at).toLocaleDateString()}</td></tr>`).join('')}
          </table>
          <script>
            window.onload = () => { window.print(); window.close(); }
          </script>
        </body>
        </html>
      `);
      printWindow.document.close();
    }
    setShowDownloadModal(false);
  };

  const filteredLeads = leads.filter(l =>
    l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.phone.includes(searchTerm)
  );

  const filteredVisits = siteVisits.filter(v =>
    v.lead_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.lead_phone?.includes(searchTerm)
  );

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20',
    contacted: 'bg-blue-400/10 text-blue-400 border-blue-400/20',
    connected: 'bg-green-400/10 text-green-400 border-green-400/20',
    closed: 'bg-purple-400/10 text-purple-400 border-purple-400/20',
  };

  const currentBrokerRank = leaderboard.find(e => e.broker_id === selectedBrokerId);

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: TrendingUp },
    { key: 'leads', label: 'My Leads', icon: Users },
    { key: 'leads_list', label: 'Leads List', icon: Target },
    { key: 'visits', label: 'Site Visits', icon: CalendarDays },
    { key: 'documents', label: 'Documents', icon: FileText },
  ];

  return (
    <div className="pt-24 pb-12 min-h-screen bg-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <Link to="/admin" className="inline-flex items-center text-white/40 hover:text-gold text-sm mb-3 mt-4 transition-colors group p-2 -m-2">
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              All Portals
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-xl">
                <Building2 className="w-6 h-6 text-blue-400" />
              </div>
              <h1 className="text-3xl font-serif font-bold">Broker Portal</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Broker Selector - Read only if logged in as specific broker */}
            <select
              value={selectedBrokerId || ''}
              onChange={e => setSelectedBrokerId(parseInt(e.target.value))}
              disabled={!!localStorage.getItem('auth_broker_id')}
              className={`bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white outline-none text-sm appearance-none cursor-pointer hover:border-gold/50 transition-colors ${localStorage.getItem('auth_broker_id') ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {brokers.length === 0 && <option value="" className="bg-zinc-900 text-white">No brokers available</option>}
              {brokers.map(b => (
                <option key={b.id} value={b.id} className="bg-zinc-900 text-white">{b.name}</option>
              ))}
            </select>
            <button onClick={fetchBrokerData} className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-gold hover:text-dark transition-all">
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {!selectedBrokerId ? (
          <div className="text-center py-20 text-white/30 italic">
            No brokers exist yet. Ask the Super Admin to create broker accounts.
          </div>
        ) : (
          <>
            {/* Tab Navigation */}
            <div className="flex overflow-x-auto gap-2 mb-8 pb-2">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${activeTab === tab.key
                    ? 'bg-gold text-dark'
                    : 'bg-white/5 text-white/50 hover:text-white hover:bg-white/10'}`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* ── Dashboard Tab ──────────────────────────────────── */}
            {activeTab === 'dashboard' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                  {[
                    { label: 'Total Assigned', value: brokerStats.totalAssigned || 0, icon: Users, color: 'text-gold', bg: 'bg-gold/10' },
                    { label: 'Pending', value: brokerStats.pending || 0, icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
                    { label: 'Contacted', value: brokerStats.contacted || 0, icon: Phone, color: 'text-blue-400', bg: 'bg-blue-400/10' },
                    { label: 'Connected', value: brokerStats.connected || 0, icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-400/10' },
                    { label: 'Closed', value: brokerStats.closed || 0, icon: Award, color: 'text-purple-400', bg: 'bg-purple-400/10' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white/5 p-6 rounded-2xl border border-white/10">
                      <div className={`p-2 ${stat.bg} rounded-lg w-fit mb-3`}>
                        <stat.icon className={`w-5 h-5 ${stat.color}`} />
                      </div>
                      <h3 className="text-3xl font-serif font-bold">{stat.value}</h3>
                      <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-1">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Quick Lead Overview */}
                {leads.length > 0 && (
                  <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
                    <h3 className="text-lg font-serif font-bold mb-4">Recent Leads</h3>
                    <div className="space-y-3">
                      {leads.slice(0, 5).map(lead => (
                        <div key={lead.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                          <div>
                            <span className="font-bold">{lead.name}</span>
                            <span className="text-white/40 text-sm ml-3">{lead.property_type}</span>
                          </div>
                          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${statusColors[lead.status]}`}>
                            {lead.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* ── Leads Tab ──────────────────────────────────────── */}
            {activeTab === 'leads' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  {/* Search */}
                  <div className="bg-white/5 p-3 rounded-2xl border border-white/10 flex-1">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <input
                        type="text" placeholder="Search assigned leads..."
                        className="w-full pl-11 pr-4 py-3 bg-dark rounded-xl border border-white/10 text-white placeholder:text-white/20 outline-none focus:ring-2 ring-gold/20"
                        value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => setShowAddLeadModal(true)}
                    className="bg-gold text-dark font-bold px-8 py-3 rounded-2xl hover:bg-white transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" /> Add Manual Lead
                  </button>
                </div>

                {/* Leads Table */}
                <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-white/5">
                          <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-white/50">Customer</th>
                           <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-white/50">Property & Location</th>
                           <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-white/50">Budget</th>
                           <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-white/50">Status</th>
                           <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-white/50">Details</th>
                           <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-white/50">Deadline</th>
                         </tr>
                       </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredLeads.map(lead => {
                          const isOverdue = lead.last_connect_date && new Date(lead.last_connect_date) < new Date() && lead.status === 'pending';
                          return (
                            <tr key={lead.id} className={`hover:bg-white/5 transition-colors ${isOverdue ? 'bg-red-500/5' : ''}`}>
                              <td className="px-6 py-4">
                                <div className="font-bold">{lead.name}</div>
                                <div className="text-sm text-gold mt-1 font-medium">{lead.phone}</div>
                                {lead.email && <div className="text-[10px] text-white/30 truncate">{lead.email}</div>}
                               </td>
                               <td className="px-6 py-4">
                                 <div className="text-sm bg-white/5 px-3 py-1 rounded-full border border-white/10 w-fit">{lead.property_type}</div>
                                 {lead.location_pref && (
                                   <div className="flex items-center text-[10px] text-white/30 mt-1">
                                     <MapPin className="w-2.5 h-2.5 mr-1" />{lead.location_pref}
                                   </div>
                                 )}
                               </td>
                              <td className="px-6 py-4 text-sm">
                                <div className="flex items-center text-white/60">
                                  <Wallet className="w-3 h-3 mr-1 text-gold" />{lead.budget || 'N/A'}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <select
                                  value={lead.status}
                                  onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                                  className={`text-xs font-bold px-3 py-1.5 rounded-full border outline-none cursor-pointer bg-dark transition-all ${statusColors[lead.status]}`}
                                >
                                  <option value="pending" className="bg-zinc-900 text-white">Pending</option>
                                  <option value="contacted" className="bg-zinc-900 text-white">Contacted</option>
                                  <option value="connected" className="bg-zinc-900 text-white">Connected</option>
                                  <option value="closed" className="bg-zinc-900 text-white">Closed</option>
                                </select>
                               </td>
                               <td className="px-6 py-4">
                                 <button 
                                   onClick={() => setSelectedLead(lead)}
                                   className="text-xs font-bold text-gold hover:underline flex items-center gap-1"
                                 >
                                   <Eye className="w-3 h-3" /> View Information
                                 </button>
                               </td>
                               <td className="px-6 py-4">
                                 {lead.last_connect_date ? (
                                   <div className={`text-sm flex items-center gap-1 ${isOverdue ? 'text-red-400' : 'text-white/40'}`}>
                                     <Clock className="w-3 h-3" />
                                     {new Date(lead.last_connect_date).toLocaleDateString()}
                                     {isOverdue && <span className="text-[10px] text-red-400 font-black block mt-1">OVERDUE</span>}
                                   </div>
                                 ) : (
                                   <span className="text-white/20 text-sm">—</span>
                                 )}
                               </td>
                             </tr>
                           );
                         })}
                         {filteredLeads.length === 0 && (
                           <tr><td colSpan={6} className="px-6 py-16 text-center text-white/30 italic">No assigned leads</td></tr>
                         )}
                       </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── Site Visits Tab ────────────────────────────────── */}
            {activeTab === 'visits' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {/* Schedule Visit */}
                <div className="bg-white/5 rounded-2xl border border-white/10 p-6 mb-8">
                  <h3 className="text-lg font-serif font-bold mb-4 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-gold" /> Schedule Site Visit
                  </h3>
                  <form onSubmit={createSiteVisit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <select
                      className="bg-dark border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
                      value={visitForm.lead_id} onChange={e => setVisitForm({ ...visitForm, lead_id: e.target.value })}
                      required
                    >
                      <option value="">Select Lead *</option>
                      {leads.map(l => (
                        <option key={l.id} value={l.id}>{l.name} — {l.phone}</option>
                      ))}
                    </select>
                    <input
                      type="date"
                      max={new Date().toISOString().split('T')[0]}
                      className="bg-dark border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
                      value={visitForm.visit_date} onChange={e => setVisitForm({ ...visitForm, visit_date: e.target.value })}
                      required
                    />
                    <input
                      type="text" placeholder="Notes"
                      className="bg-dark border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 outline-none"
                      value={visitForm.notes} onChange={e => setVisitForm({ ...visitForm, notes: e.target.value })}
                    />
                    <button type="submit" className="px-6 py-3 bg-gold text-dark font-bold rounded-xl hover:bg-white transition-colors">
                      Schedule
                    </button>
                  </form>
                </div>

                {/* Visit List */}
                <div className="space-y-4">
                  {siteVisits.map(visit => (
                    <div key={visit.id} className="bg-white/5 rounded-2xl border border-white/10 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h4 className="font-bold">{visit.lead_name}</h4>
                        <p className="text-white/40 text-sm flex items-center gap-1 mt-1">
                          <Phone className="w-3 h-3" />{visit.lead_phone.replace('+91', '')} · {visit.property_type}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm flex items-center gap-1 text-white/60">
                          <CalendarDays className="w-4 h-4 text-gold" />
                          {new Date(visit.visit_date).toLocaleDateString()}
                        </span>
                        {visit.notes && <span className="text-sm text-white/30">"{visit.notes}"</span>}
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${visit.status === 'scheduled' ? 'bg-blue-400/10 text-blue-400' : 'bg-green-400/10 text-green-400'}`}>
                          {visit.status}
                        </span>
                      </div>
                    </div>
                  ))}
                  {filteredVisits.length === 0 && (
                    <div className="text-center py-16 text-white/30 italic">No site visits scheduled</div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ── Leads List Tab ─────────────────────────────────── */}
            {activeTab === 'leads_list' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                   <h2 className="text-2xl font-serif font-bold flex items-center gap-3">
                     <Target className="w-6 h-6 text-gold" /> Leads List
                   </h2>
                   <button 
                     onClick={() => setShowDownloadModal(true)}
                     className="bg-zinc-800 border border-white/10 hover:border-gold/50 text-white font-bold px-6 py-3 rounded-2xl flex items-center gap-2 transition-all"
                   >
                     <FileDown className="w-4 h-4 text-gold" /> Download List
                   </button>
                </div>

                {/* Leads List Detailed Table */}
                <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-white/5 border-b border-white/5">
                          <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-white/50">Name</th>
                          <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-white/50">Phone/Email</th>
                          <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-white/50">Status</th>
                          <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-white/50">Requirement</th>
                          <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-white/50">Referral</th>
                          <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-white/50">Date Added</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {leads.map(lead => (
                           <tr key={lead.id} className="hover:bg-white/5 transition-colors">
                             <td className="px-6 py-4 font-bold">{lead.name}</td>
                             <td className="px-6 py-4">
                               <div className="text-sm">{lead.phone}</div>
                               {lead.email && <div className="text-[10px] text-white/40">{lead.email}</div>}
                             </td>
                             <td className="px-6 py-4">
                               <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${statusColors[lead.status]}`}>
                                 {lead.status}
                               </span>
                             </td>
                             <td className="px-6 py-4">
                                <div className="text-sm font-medium">{lead.property_type}</div>
                                <div className="text-xs text-white/40 max-w-[150px] truncate">{lead.location_pref || 'No pref'}</div>
                             </td>
                             <td className="px-6 py-4">
                                <div className="text-xs text-gold font-medium">{lead.referral || 'Direct'}</div>
                             </td>
                             <td className="px-6 py-4 text-xs text-white/50">
                                {new Date(lead.created_at).toLocaleDateString()}
                             </td>
                           </tr>
                        ))}
                        {leads.length === 0 && (
                          <tr><td colSpan={6} className="px-6 py-16 text-center text-white/30 italic">No leads available</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── Documents Tab ─────────────────────────────────────── */}
            {activeTab === 'documents' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <h2 className="text-2xl font-serif font-bold flex items-center gap-3">
                    <FileText className="w-6 h-6 text-gold" /> Client Documents
                  </h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Upload Form */}
                  <div className="bg-white/5 p-6 rounded-2xl border border-white/10 h-fit">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <Upload className="w-4 h-4 text-gold" /> Upload New Document
                    </h3>
                    <form onSubmit={uploadDocument} className="space-y-4">
                      <div>
                        <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1 mb-1 block">
                          Select Client (Closed Deals)
                        </label>
                        <select 
                          required
                          value={docLeadId}
                          onChange={(e) => setDocLeadId(e.target.value)}
                          className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3 text-sm outline-none text-white focus:ring-2 ring-gold/20"
                        >
                          <option value="">Select a client...</option>
                          {leads.filter(l => l.status === 'closed').map(lead => (
                            <option key={lead.id} value={lead.id}>{lead.name} ({lead.phone})</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1 mb-1 block">
                          Document File
                        </label>
                        <input 
                          required type="file"
                          onChange={(e) => setDocFile(e.target.files ? e.target.files[0] : null)}
                          className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3 text-sm outline-none text-white focus:ring-2 ring-gold/20 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-gold/10 file:text-gold hover:file:bg-gold/20"
                        />
                      </div>

                      <button 
                        type="submit" disabled={uploadingDoc || !docFile || !docLeadId}
                        className="w-full py-3 bg-gold text-dark font-bold rounded-xl hover:bg-white transition-all disabled:opacity-50"
                      >
                        {uploadingDoc ? 'Uploading...' : 'Save Document'}
                      </button>
                    </form>
                  </div>

                  {/* Documents List */}
                  <div className="lg:col-span-2 bg-white/5 rounded-2xl border border-white/10 p-6 overflow-hidden">
                    <h3 className="font-bold text-lg mb-4">Saved Documents</h3>
                    <div className="space-y-3">
                      {documents.map((doc: any) => (
                        <div key={doc.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:border-gold/30 transition-all">
                          <div>
                            <div className="font-bold text-sm mb-1">{doc.lead_name}</div>
                            <div className="flex items-center gap-3 text-[10px] text-white/50">
                              <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {doc.lead_phone}</span>
                              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(doc.uploaded_at).toLocaleDateString()}</span>
                            </div>
                            <div className="text-xs text-gold mt-2 font-mono bg-gold/10 px-2 py-0.5 rounded w-fit">{doc.file_name}</div>
                          </div>
                          <a 
                            href={doc.file_url} 
                            target="_blank" 
                            rel="noreferrer"
                            className="p-3 bg-gold/10 hover:bg-gold text-gold hover:text-dark rounded-xl transition-all font-bold"
                          >
                            <FileDown className="w-5 h-5" />
                          </a>
                        </div>
                      ))}
                      {documents.length === 0 && (
                        <div className="py-12 text-center text-white/30 italic">No documents uploaded yet.</div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

           </>
         )}

         {/* Add Manual Lead Modal */}
         {showAddLeadModal && (
           <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-dark/90 backdrop-blur-md">
             <motion.div 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               className="bg-zinc-900 border border-white/10 p-8 rounded-3xl w-full max-w-lg shadow-2xl"
             >
               <div className="flex justify-between items-center mb-6">
                 <h3 className="text-2xl font-serif font-bold flex items-center gap-3">
                   <div className="p-2 bg-gold/10 rounded-lg">
                     <Plus className="w-5 h-5 text-gold" />
                   </div>
                   Add Manual Lead
                 </h3>
                 <button onClick={() => setShowAddLeadModal(false)} className="p-2 hover:bg-white/5 rounded-full text-white/40">
                   <X className="w-6 h-6" />
                 </button>
               </div>

               <form onSubmit={createManualLead} className="space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar pr-2">
                 <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                     <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Full Name *</label>
                     <input
                       type="text" required
                       className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 ring-gold/20"
                       value={manualLeadForm.name} onChange={e => setManualLeadForm({ ...manualLeadForm, name: e.target.value })}
                     />
                   </div>
                   <div className="space-y-1">
                     <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Phone *</label>
                     <div className="flex items-center bg-dark border border-white/10 rounded-xl px-4 py-3">
                        <span className="text-white/40 font-bold mr-2">+91</span>
                        <input
                          type="tel" required maxLength={10}
                          className="w-full bg-transparent text-white outline-none"
                          value={manualLeadForm.phone} onChange={e => setManualLeadForm({ ...manualLeadForm, phone: e.target.value.replace(/\D/g, '') })}
                        />
                     </div>
                   </div>
                 </div>

                 <div className="space-y-1">
                   <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Email (Optional)</label>
                   <input
                     type="email"
                     className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 ring-gold/20"
                     value={manualLeadForm.email} onChange={e => setManualLeadForm({ ...manualLeadForm, email: e.target.value })}
                   />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                     <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Property Type</label>
                     <select
                       className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 ring-gold/20"
                       value={manualLeadForm.property_type} onChange={e => setManualLeadForm({ ...manualLeadForm, property_type: e.target.value })}
                     >
                       <option value="2BHK">2 BHK Executive</option>
                       <option value="3BHK">3 BHK Premium</option>
                     </select>
                   </div>
                   <div className="space-y-1">
                     <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Budget</label>
                     <input
                       type="text" placeholder="e.g. 50L - 60L"
                       className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 ring-gold/20"
                       value={manualLeadForm.budget} onChange={e => setManualLeadForm({ ...manualLeadForm, budget: e.target.value })}
                     />
                   </div>
                 </div>

                 <div className="space-y-1">
                   <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Location Preference</label>
                   <input
                     type="text"
                     className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 ring-gold/20"
                     value={manualLeadForm.location_pref} onChange={e => setManualLeadForm({ ...manualLeadForm, location_pref: e.target.value })}
                   />
                 </div>

                 <div className="space-y-1">
                   <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Additional Message</label>
                   <textarea
                     rows={3}
                     placeholder="Client requirements or notes..."
                     className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 ring-gold/20 resize-none"
                     value={manualLeadForm.message} onChange={e => setManualLeadForm({ ...manualLeadForm, message: e.target.value })}
                   />
                 </div>

                 <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-3">
                       <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Select Offers to Claim</label>
                       <button 
                         type="button" 
                         onClick={() => {
                           const offerList = ['Free Maintenance for 2 Years', 'Free Registry & GST', 'Book from ₹11,000 only'];
                           if (manualLeadForm.claimed_offers.length === offerList.length) {
                             setManualLeadForm({ ...manualLeadForm, claimed_offers: [] });
                           } else {
                             setManualLeadForm({ ...manualLeadForm, claimed_offers: offerList });
                           }
                         }}
                         className="text-[10px] font-bold text-gold hover:text-white transition-colors uppercase tracking-widest"
                       >
                         {manualLeadForm.claimed_offers.length === 3 ? 'Deselect All' : 'Select All'}
                       </button>
                    </div>
                    <div className="space-y-2">
                       {['Free Maintenance for 2 Years', 'Free Registry & GST', 'Book from ₹11,000 only'].map(offer => (
                         <label key={offer} className="flex items-center space-x-3 cursor-pointer group">
                           <div className={`w-4 h-4 rounded flex items-center justify-center transition-colors border ${manualLeadForm.claimed_offers.includes(offer) ? 'bg-gold border-gold' : 'border-white/20 group-hover:border-gold/50'}`}>
                             {manualLeadForm.claimed_offers.includes(offer) && <CheckCircle2 className="w-3 h-3 text-dark" />}
                           </div>
                           <span className="text-xs text-white/80 group-hover:text-white transition-colors">{offer}</span>
                           <input
                             type="checkbox" className="hidden"
                             checked={manualLeadForm.claimed_offers.includes(offer)}
                             onChange={() => {
                               setManualLeadForm(prev => {
                                 if (prev.claimed_offers.includes(offer)) {
                                   return { ...prev, claimed_offers: prev.claimed_offers.filter(o => o !== offer) };
                                 }
                                 return { ...prev, claimed_offers: [...prev.claimed_offers, offer] };
                               });
                             }}
                           />
                         </label>
                       ))}
                    </div>
                 </div>

                 <div className="pt-4 flex gap-3">
                   <button
                     type="button" onClick={() => setShowAddLeadModal(false)}
                     className="flex-1 py-4 rounded-xl font-bold bg-white/5 text-white/50 hover:bg-white/10 transition-all"
                   >
                     Cancel
                   </button>
                   <button
                     type="submit" disabled={isSubmittingLead}
                     className="flex-[2] py-4 rounded-xl font-bold bg-gold text-dark hover:bg-white transition-all disabled:opacity-50"
                   >
                     {isSubmittingLead ? 'Adding...' : 'Add Lead'}
                   </button>
                 </div>
               </form>
             </motion.div>
           </div>
         )}

         {/* Download Leads Modal */}
         {showDownloadModal && (
           <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-dark/90 backdrop-blur-md">
             <motion.div 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               className="bg-zinc-900 border border-white/10 p-8 rounded-3xl w-full max-w-sm shadow-2xl"
             >
               <div className="flex justify-between items-center mb-6">
                 <h3 className="text-xl font-serif font-bold flex items-center gap-3">
                   <Filter className="w-5 h-5 text-gold" /> Filter & Download
                 </h3>
                 <button onClick={() => setShowDownloadModal(false)} className="p-2 hover:bg-white/5 rounded-full text-white/40">
                   <X className="w-5 h-5" />
                 </button>
               </div>

               <div className="space-y-5">
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Lead Status</label>
                    <select
                      value={downloadFilters.status} onChange={e => setDownloadFilters({ ...downloadFilters, status: e.target.value })}
                      className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
                    >
                      <option value="all">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="contacted">Contacted</option>
                      <option value="connected">Connected</option>
                      <option value="closed">Closed</option>
                    </select>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Sort By</label>
                    <select
                      value={downloadFilters.sort} onChange={e => setDownloadFilters({ ...downloadFilters, sort: e.target.value })}
                      className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
                    >
                      <option value="date">Date Added (Newest)</option>
                      <option value="a-z">Name (A-Z)</option>
                    </select>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Time Period</label>
                    <select
                      value={downloadFilters.time} onChange={e => setDownloadFilters({ ...downloadFilters, time: e.target.value })}
                      className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
                    >
                      <option value="all">All Time</option>
                      <option value="today">Today</option>
                      <option value="month">This Month</option>
                    </select>
                 </div>

                 <div className="pt-4 grid grid-cols-2 gap-3">
                    <button
                      onClick={() => downloadLeads('pdf')}
                      className="py-3 rounded-xl font-bold bg-white/5 text-white/80 hover:bg-white/10 hover:text-white transition-all text-sm"
                    >
                      Export PDF
                    </button>
                    <button
                      onClick={() => downloadLeads('csv')}
                      className="py-3 rounded-xl font-bold bg-gold text-dark hover:bg-white transition-all text-sm"
                    >
                      Download Excel
                    </button>
                 </div>
               </div>
             </motion.div>
           </div>
         )}

         {/* Lead Details Modal */}
         {selectedLead && (
           <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/80 backdrop-blur-md">
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="bg-zinc-900 border border-white/10 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl"
             >
               <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                 <div className="flex items-center gap-3">
                   <div className="p-2 bg-gold/10 rounded-lg">
                     <Users className="w-5 h-5 text-gold" />
                   </div>
                   <h3 className="text-xl font-serif font-bold">Customer Details</h3>
                 </div>
                 <button onClick={() => setSelectedLead(null)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                   <X className="w-5 h-5 text-white/40" />
                 </button>
               </div>
               
               <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-4">
                     <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold/60">Lead Information</h4>
                     <div className="space-y-4">
                       <div>
                         <p className="text-xs text-white/30 mb-1">Full Name</p>
                         <p className="font-bold text-lg">{selectedLead.name}</p>
                       </div>
                       <div>
                         <p className="text-xs text-white/30 mb-1">Phone Number</p>
                         <a href={`tel:${selectedLead.phone}`} className="font-bold text-gold hover:underline flex items-center gap-2">
                           <Phone className="w-4 h-4" /> {selectedLead.phone}
                         </a>
                       </div>
                       {selectedLead.email && (
                         <div>
                           <p className="text-xs text-white/30 mb-1">Email Address</p>
                           <a href={`mailto:${selectedLead.email}`} className="font-bold text-white/80 hover:text-white flex items-center gap-2">
                             <Mail className="w-4 h-4" /> {selectedLead.email}
                           </a>
                         </div>
                       )}
                     </div>
                   </div>

                   <div className="space-y-4">
                     <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold/60">Interest Details</h4>
                     <div className="space-y-4">
                       <div>
                         <p className="text-xs text-white/30 mb-1">Interested In</p>
                         <span className="font-bold inline-block px-3 py-1 bg-white/5 rounded-lg border border-white/10">{selectedLead.property_type}</span>
                       </div>
                       <div>
                         <p className="text-xs text-white/30 mb-1">Planned Budget</p>
                         <p className="font-bold text-white/80">{selectedLead.budget || 'Not provided'}</p>
                       </div>
                        <div>
                          <p className="text-xs text-white/30 mb-1">Preferred Office/Residency Location</p>
                          <p className="font-bold text-white/80">{selectedLead.location_pref || 'Not provided'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-white/30 mb-1">Referral Source</p>
                          <p className="font-bold text-gold">{selectedLead.referral || 'Direct Inquiry'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                 {/* Message & Offers */}
                 {(selectedLead.message || (selectedLead.claimed_offers && selectedLead.claimed_offers.length > 0)) && (
                   <div className="pt-8 border-t border-white/5 space-y-6">
                     {selectedLead.message && (
                       <div>
                         <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold/60 mb-3">Customer Message</h4>
                         <div className="bg-white/5 p-5 rounded-2xl border border-white/10 text-white/70 italic text-sm leading-relaxed relative">
                           <span className="absolute -top-3 left-4 px-2 bg-zinc-900 text-[10px] text-white/20 font-bold uppercase tracking-widest">Client Note</span>
                           "{selectedLead.message}"
                         </div>
                       </div>
                     )}
                     
                     {selectedLead.claimed_offers && selectedLead.claimed_offers.length > 0 && (
                       <div>
                         <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold/60 mb-3">Claimed Offers</h4>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                           {selectedLead.claimed_offers.map((offer, idx) => (
                             <div key={idx} className="flex items-center gap-2.5 px-4 py-2.5 bg-green-500/5 text-green-400 text-xs font-bold rounded-xl border border-green-500/10">
                               <CheckCircle2 className="w-4 h-4 shrink-0" />
                               {offer}
                             </div>
                           ))}
                         </div>
                       </div>
                     )}
                   </div>
                 )}

                 {/* System Info */}
                 <div className="pt-8 border-t border-white/5 flex flex-wrap items-center gap-x-8 gap-y-4">
                   <div className="flex items-center gap-2 text-white/20">
                     <Calendar className="w-4 h-4" />
                     <span className="text-[10px] font-bold uppercase tracking-widest">Sourced: {new Date(selectedLead.created_at).toLocaleDateString()}</span>
                   </div>
                   {selectedLead.last_connect_date && (
                     <div className="flex items-center gap-2 text-white/20">
                       <Clock className="w-4 h-4" />
                       <span className="text-[10px] font-bold uppercase tracking-widest">Connect By: {new Date(selectedLead.last_connect_date).toLocaleDateString()}</span>
                     </div>
                   )}
                 </div>
               </div>
               
               <div className="p-6 bg-white/5 border-t border-white/5 flex justify-end gap-3">
                 <button 
                   onClick={() => setSelectedLead(null)}
                   className="px-8 py-3 bg-white/5 text-white/60 font-bold rounded-xl hover:bg-white/10 transition-all text-xs"
                 >
                   Dismiss
                 </button>
                 <a 
                   href={`tel:${selectedLead.phone}`}
                   className="px-8 py-3 bg-gold text-dark font-bold rounded-xl hover:scale-105 transition-all text-xs flex items-center gap-2 shadow-lg shadow-gold/20"
                 >
                   <Phone className="w-4 h-4" /> Call Now
                 </a>
               </div>
             </motion.div>
           </div>
         )}

       </div>
     </div>
  );
}
