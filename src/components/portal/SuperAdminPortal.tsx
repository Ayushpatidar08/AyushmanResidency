import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Lead, Broker, Notice } from '../../types';
import {
  ArrowLeft, Users, UserPlus, TrendingUp, Bell, Settings,
  Phone, Mail, MapPin, Wallet, Calendar, Search, RefreshCw, Send,
  ChevronDown, X, Eye, Award, BarChart3, Megaphone, FileText,
  Shield, CheckCircle2, Clock, AlertCircle, Ban, Edit2, Save, LogOut,
  FileDown, EyeOff, ShieldAlert, Download, Filter, Trash2
} from 'lucide-react';
import { setupAutoLogout, authFetch, logout } from '../../utils/auth';

type Tab = 'dashboard' | 'leads' | 'brokers' | 'cms';

export function SuperAdminPortal() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [cms, setCms] = useState<Record<string, string>>({});
  const [globalStats, setGlobalStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Broker form
  const [brokerForm, setBrokerForm] = useState({ name: '', email: '', phone: '', area: '' });
  const [editingBroker, setEditingBroker] = useState<Broker | null>(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '', area: '' });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadFilters, setDownloadFilters] = useState({ status: 'all', sort: 'date', time: 'all' });
  const [showHiddenLeads, setShowHiddenLeads] = useState(false);

  useEffect(() => { 
    if (localStorage.getItem('auth_role') !== 'admin') {
      window.location.href = '/admin?role=admin';
      return;
    }
    window.scrollTo(0, 0); 
    setupAutoLogout();
    fetchAll(); 
  }, []);

  const handleLogout = () => {
    logout();
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [leadsRes, brokersRes, cmsRes, statsRes] = await Promise.all([
        authFetch('/api/leads'),
        authFetch('/api/brokers'),
        authFetch('/api/cms'),
        authFetch('/api/stats/global')
      ]);
      setLeads(await leadsRes.json());
      setBrokers(await brokersRes.json());
      setCms(await cmsRes.json());
      setGlobalStats(await statsRes.json());
    } catch (err) {
      console.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const assignLead = async (leadId: number, brokerId: number) => {
    await authFetch(`/api/leads/${leadId}/assign`, {
      method: 'POST',
      body: JSON.stringify({ broker_id: brokerId })
    });
    fetchAll();
  };

  const updateLeadStatus = async (leadId: number, status: string) => {
    await authFetch(`/api/leads/${leadId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
    fetchAll();
  };

  const createBroker = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { [key: string]: string } = {};

    // Validate Name: No numbers
    if (!brokerForm.name.trim()) {
      errors.name = 'Name is required';
    } else if (/\d/.test(brokerForm.name)) {
      errors.name = 'Name should not contain numbers';
    }

    // Validate Phone: 10 digits
    const phoneRegex = /^\d{10}$/;
    if (!brokerForm.phone.trim()) {
      errors.phone = 'Phone is required';
    } else if (!phoneRegex.test(brokerForm.phone)) {
      errors.phone = 'Enter 10-digit number';
    }

    // Validate Email
    if (brokerForm.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(brokerForm.email)) {
        errors.email = 'Invalid email format';
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    await authFetch('/api/brokers', {
      method: 'POST',
      body: JSON.stringify({ ...brokerForm, phone: `+91${brokerForm.phone}` })
    });
    setBrokerForm({ name: '', email: '', phone: '', area: '' });
    fetchAll();
  };

  const toggleBrokerStatus = async (id: number, currentStatus: boolean) => {
    await authFetch(`/api/brokers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ is_active: !currentStatus })
    });
    fetchAll();
  };

  const deleteBroker = async (id: number) => {
    if (!confirm('Delete this broker? Their leads will be unassigned and site visits will be removed.')) return;
    await authFetch(`/api/brokers/${id}`, { method: 'DELETE' });
    fetchAll();
  };

  const startEditingBroker = (broker: Broker) => {
    setEditingBroker(broker);
    setEditForm({ 
      name: broker.name, 
      email: broker.email || '', 
      phone: broker.phone.replace('+91', ''), 
      area: broker.area || '' 
    });
  };

  const updateBroker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBroker) return;
    
    // Validate
    const errors: { [key: string]: string } = {};
    if (!editForm.name.trim()) errors.name = 'Name is required';
    if (!/^\d{10}$/.test(editForm.phone)) errors.phone = '10-digit number required';
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    await authFetch(`/api/brokers/${editingBroker.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ 
        ...editForm, 
        phone: editForm.phone.startsWith('+91') ? editForm.phone : `+91${editForm.phone}` 
      })
    });
    setEditingBroker(null);
    fetchAll();
  };

  const updateCMS = async (key: string, value: string) => {
    await authFetch('/api/cms', {
      method: 'POST',
      body: JSON.stringify({ key, value })
    });
    setCms(prev => ({ ...prev, [key]: value }));
  };

  const toggleLeadVisibility = async (leadId: number, type: 'is_hidden_for_admin' | 'is_deleted_for_brokers', currentVal: boolean) => {
    await authFetch(`/api/leads/${leadId}/visibility`, {
      method: 'PATCH',
      body: JSON.stringify({ [type]: !currentVal })
    });
    fetchAll();
  };

  const downloadLeads = (format: 'csv' | 'pdf') => {
    let target = leads;
    
    if (downloadFilters.status !== 'all') {
      target = target.filter(l => l.status === downloadFilters.status);
    }
    
    if (downloadFilters.time !== 'all') {
      const now = new Date();
      target = target.filter(l => {
         const d = new Date(l.created_at);
         if (downloadFilters.time === 'today') return d.toDateString() === now.toDateString();
         if (downloadFilters.time === 'month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
         return true;
      });
    }

    if (downloadFilters.sort === 'a-z') {
      target = [...target].sort((a,b) => a.name.localeCompare(b.name));
    } else {
      target = [...target].sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    if (format === 'csv') {
      const headers = ['Name', 'Phone', 'Status', 'Property Type', 'Location', 'Budget', 'Date', 'Broker'];
      const csv = [headers.join(',')];
      target.forEach(l => {
        csv.push([
          `"${l.name}"`, 
          `"${l.phone}"`, 
          `"${l.status}"`, 
          `"${l.property_type}"`, 
          `"${l.location_pref || ''}"`, 
          `"${l.budget || ''}"`, 
          `"${new Date(l.created_at).toLocaleDateString()}"`,
          `"${l.assigned_broker_name || 'Unassigned'}"`
        ].join(','));
      });
      const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `superadmin_leads_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    } else if (format === 'pdf') {
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;
      printWindow.document.write(`
        <html>
        <head>
          <title>Leads List Export</title>
          <style>
            body { font-family: sans-serif; padding: 20px; color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 12px; }
            th { background-color: #f5f5f5; }
            h2 { color: #c9a050; border-bottom: 2px solid #ddd; padding-bottom: 10px; }
          </style>
        </head>
        <body>
          <h2>Total Leads Export (${target.length})</h2>
          <table>
            <tr>
              <th>Name</th><th>Phone</th><th>Status</th><th>Type</th><th>Broker</th><th>Date</th>
            </tr>
            ${target.map(l => `<tr><td>${l.name}</td><td>${l.phone}</td><td style="text-transform: capitalize;">${l.status}</td><td>${l.property_type}</td><td>${l.assigned_broker_name || 'N/A'}</td><td>${new Date(l.created_at).toLocaleDateString()}</td></tr>`).join('')}
          </table>
          <script>window.onload = () => { window.print(); window.close(); }</script>
        </body>
        </html>
      `);
      printWindow.document.close();
    }
    setShowDownloadModal(false);
  };

  const handleFileUpload = async (key: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await authFetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) updateCMS(key, data.url);
    } catch (err) {
      console.error('Upload failed', err);
    }
  };

  const handleMultipleFileUpload = async (key: string, files: FileList) => {
    const formData = new FormData();
    Array.from(files).forEach(file => formData.append('files', file));
    try {
      const res = await authFetch('/api/upload-multiple', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        const currentUrls = cms[key] ? JSON.parse(cms[key]) : [];
        const newUrls = [...currentUrls, ...data.urls];
        updateCMS(key, JSON.stringify(newUrls));
      }
    } catch (err) {
      console.error('Upload failed', err);
    }
  };

  const filteredLeads = leads.filter(l => {
    const matchesSearch = l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.phone.includes(searchTerm) ||
      l.property_type.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!showHiddenLeads && l.is_hidden_for_admin) return false;
    return matchesSearch;
  });

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { key: 'leads', label: 'Leads', icon: Users },
    { key: 'brokers', label: 'Brokers', icon: UserPlus },
    { key: 'cms', label: 'CMS', icon: FileText },
  ];

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20',
    contacted: 'bg-blue-400/10 text-blue-400 border-blue-400/20',
    connected: 'bg-green-400/10 text-green-400 border-green-400/20',
    closed: 'bg-purple-400/10 text-purple-400 border-purple-400/20',
  };

  const statusIcons: Record<string, any> = {
    pending: Clock,
    contacted: Phone,
    connected: CheckCircle2,
    closed: Award,
  };

  const assignAllToVivek = async () => {
    const vivek = brokers.find(b => b.name.toLowerCase() === 'vivek singh');
    if (!vivek) {
      alert("No broker named 'Vivek Singh' found.");
      return;
    }

    if (!confirm(`Are you sure you want to assign ALL leads and tasks to ${vivek.name}?`)) return;

    setLoading(true);
    try {
      const res = await authFetch('/api/leads/assign-bulk', {
        method: 'POST',
        body: JSON.stringify({ broker_id: vivek.id })
      });
      if (res.ok) {
        alert("Operation successful. All leads and tasks assigned to Vivek.");
        fetchAll();
      } else {
        throw new Error("Failed to assign leads");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

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
              <div className="p-2 bg-amber-500/10 rounded-xl">
                <Shield className="w-6 h-6 text-amber-400" />
              </div>
              <h1 className="text-3xl font-serif font-bold">Super Admin</h1>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={fetchAll} 
              className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-gold hover:text-dark transition-all"
              title="Refresh Data"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button 
              onClick={handleLogout} 
              className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center gap-2 font-bold"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto gap-2 mb-8 pb-2 scrollbar-hide">
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

        {/* ── Dashboard Tab ────────────────────────────────────────── */}
        {activeTab === 'dashboard' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Total Leads', value: globalStats.totalLeads || 0, icon: Users, color: 'text-gold', bg: 'bg-gold/10' },
                { label: 'Assigned', value: globalStats.assignedLeads || 0, icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-400/10' },
                { label: 'Unassigned', value: globalStats.unassignedLeads || 0, icon: AlertCircle, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
                { label: 'Active Brokers', value: globalStats.totalBrokers || 0, icon: UserPlus, color: 'text-blue-400', bg: 'bg-blue-400/10' },
              ].map((stat, i) => (
                <div key={i} className="bg-white/5 p-6 rounded-2xl border border-white/10">
                  <div className={`p-2 ${stat.bg} rounded-lg w-fit mb-3`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <h3 className="text-3xl font-serif font-bold">{stat.value}</h3>
                  <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-1">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="mb-8 flex flex-wrap gap-4">
              <button
                onClick={assignAllToVivek}
                className="flex items-center gap-2 px-6 py-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-500 font-bold hover:bg-amber-500 hover:text-dark transition-all group"
              >
                <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                Assign All to Vivek
              </button>
            </div>

            {/* Status Breakdown + Conversion */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              {[
                { label: 'Pending', value: globalStats.pendingLeads || 0, color: 'text-yellow-400' },
                { label: 'Contacted', value: globalStats.contactedLeads || 0, color: 'text-blue-400' },
                { label: 'Connected', value: globalStats.connectedLeads || 0, color: 'text-green-400' },
                { label: 'Closed', value: globalStats.closedLeads || 0, color: 'text-purple-400' },
                { label: 'Conversion', value: `${globalStats.conversionRate || 0}%`, color: 'text-gold' },
              ].map((stat, i) => (
                <div key={i} className="bg-white/5 p-5 rounded-2xl border border-white/10 text-center">
                  <h3 className={`text-2xl font-serif font-bold ${stat.color}`}>{stat.value}</h3>
                  <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-1">{stat.label}</p>
                </div>
              ))}
            </div>


          </motion.div>
        )}

        {/* ── Leads Tab ────────────────────────────────────────────── */}
        {activeTab === 'leads' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Search */}
            <div className="bg-white/5 p-3 rounded-2xl border border-white/10 mb-6 flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="text"
                  placeholder="Search leads..."
                  className="w-full pl-11 pr-4 py-3 bg-dark rounded-xl border border-white/10 text-white placeholder:text-white/20 outline-none focus:ring-2 ring-gold/20"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowHiddenLeads(!showHiddenLeads)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-bold border transition-all ${showHiddenLeads ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' : 'bg-white/5 border-white/10 text-white/40 hover:text-white'}`}
                >
                  {showHiddenLeads ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  {showHiddenLeads ? 'Showing Hidden' : 'Show Hidden'}
                </button>
                <button
                  onClick={() => setShowDownloadModal(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-gold text-dark rounded-xl text-xs font-bold hover:bg-white transition-all shadow-lg"
                >
                  <FileDown className="w-4 h-4" /> Download Leads
                </button>
              </div>
            </div>

            {/* Leads Table */}
            <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-white/5">
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-white/50">Customer</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-white/50">Requirements</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-white/50">Status</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-white/50">Referral</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-white/50">Assigned To</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-white/50">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredLeads.map(lead => {
                      const StatusIcon = statusIcons[lead.status] || Clock;
                      return (
                        <tr key={lead.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-bold">{lead.name}</div>
                            <div className="flex items-center text-sm text-white/40 mt-1">
                              <Phone className="w-3 h-3 mr-1" />{lead.phone}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1.5">
                              <span className="text-sm bg-white/5 px-3 py-1 rounded-full border border-white/10 w-fit font-bold">
                                {lead.property_type}
                              </span>
                              {lead.budget && (
                                <div className="flex items-center text-xs text-gold font-bold">
                                  <Wallet className="w-3 h-3 mr-1" />{lead.budget}
                                </div>
                              )}
                              {lead.location_pref && (
                                <div className="flex items-center text-xs text-white/30">
                                  <MapPin className="w-3 h-3 mr-1" />{lead.location_pref}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <select
                              value={lead.status}
                              onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                              className={`text-xs font-bold px-3 py-1.5 rounded-full border outline-none cursor-pointer bg-dark ${statusColors[lead.status]}`}
                            >
                              <option value="pending">Pending</option>
                              <option value="contacted">Contacted</option>
                              <option value="connected">Connected</option>
                              <option value="closed">Closed</option>
                            </select>
                          </td>
                          <td className="px-6 py-4">
                            {lead.referral ? (
                              <div className="flex flex-col">
                                <span className="text-xs text-white/40 uppercase font-bold tracking-tighter">Broker</span>
                                <span className="text-sm font-bold text-gold">{lead.referral}</span>
                              </div>
                            ) : (
                              <span className="text-white/20 text-xs italic">Direct Inquiry</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <select
                              value={lead.assigned_broker_id || ''}
                              onChange={(e) => assignLead(lead.id, parseInt(e.target.value))}
                              className="text-sm bg-dark border border-white/10 rounded-lg px-3 py-2 text-white outline-none cursor-pointer"
                            >
                              <option value="">Unassigned</option>
                              {brokers.filter(b => b.is_active).map(b => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-2">
                              <button 
                                onClick={() => setSelectedLead(lead)}
                                className="text-xs font-bold text-gold hover:text-white transition-colors flex items-center gap-1.5 bg-gold/10 px-3 py-2 rounded-lg border border-gold/20 w-fit"
                              >
                                <Eye className="w-4 h-4" /> Inform.
                              </button>
                              
                              <div className="flex gap-1.5">
                                <button
                                  onClick={() => toggleLeadVisibility(lead.id, 'is_hidden_for_admin', !!lead.is_hidden_for_admin)}
                                  className={`p-2 rounded-lg border transition-all ${lead.is_hidden_for_admin ? 'bg-amber-500 text-dark border-amber-500' : 'bg-white/5 text-white/40 border-white/10 hover:text-amber-500 hover:border-amber-500/50'}`}
                                  title={lead.is_hidden_for_admin ? "Unmarshal Lead" : "Hide from Admin List"}
                                >
                                  {lead.is_hidden_for_admin ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                </button>
                                
                                <button
                                  onClick={() => toggleLeadVisibility(lead.id, 'is_deleted_for_brokers', !!lead.is_deleted_for_brokers)}
                                  className={`p-2 rounded-lg border transition-all ${lead.is_deleted_for_brokers ? 'bg-red-500 text-white border-red-500' : 'bg-white/5 text-white/40 border-white/10 hover:text-red-500 hover:border-red-500/50'}`}
                                  title={lead.is_deleted_for_brokers ? "Restore for Brokers" : "Delete from Broker Portals"}
                                >
                                  <ShieldAlert className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <div className="text-[9px] text-white/20 font-bold uppercase tracking-widest ml-1">
                                {new Date(lead.created_at).toLocaleDateString()}
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredLeads.length === 0 && (
                      <tr><td colSpan={6} className="px-6 py-16 text-center text-white/30 italic">No leads found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Brokers Tab ──────────────────────────────────────────── */}
        {activeTab === 'brokers' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Create Broker Form */}
            <div className="bg-white/5 rounded-2xl border border-white/10 p-6 mb-8">
              <h3 className="text-lg font-serif font-bold mb-4 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-gold" /> Add New Broker
              </h3>
              <form onSubmit={createBroker} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex flex-col gap-1">
                  <input
                    type="text" placeholder="Full Name *"
                    className={`bg-dark border rounded-xl px-4 py-3 text-white placeholder:text-white/20 outline-none focus:ring-2 ring-gold/20 ${formErrors.name ? 'border-red-500/50' : 'border-white/10'}`}
                    value={brokerForm.name} onChange={e => {
                      setBrokerForm({ ...brokerForm, name: e.target.value });
                      if (formErrors.name) setFormErrors({ ...formErrors, name: '' });
                    }}
                    required
                  />
                  {formErrors.name && <span className="text-[10px] text-red-400 font-bold ml-1">{formErrors.name}</span>}
                </div>
                
                <div className="flex flex-col gap-1">
                  <div className={`flex items-center bg-dark border rounded-xl px-4 py-3 focus-within:ring-2 ring-gold/20 transition-all ${formErrors.phone ? 'border-red-500/50' : 'border-white/10'}`}>
                    <span className="text-white/40 font-bold mr-2 text-sm select-none">+91</span>
                    <input
                      type="tel" placeholder="Mobile Number *"
                      className="bg-transparent flex-1 text-white placeholder:text-white/20 outline-none text-sm"
                      maxLength={10}
                      value={brokerForm.phone} onChange={e => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setBrokerForm({ ...brokerForm, phone: val });
                        if (formErrors.phone) setFormErrors({ ...formErrors, phone: '' });
                      }}
                      required
                    />
                  </div>
                  {formErrors.phone && <span className="text-[10px] text-red-400 font-bold ml-1">{formErrors.phone}</span>}
                </div>

                <div className="flex flex-col gap-1">
                  <input
                    type="email" placeholder="Email"
                    className={`bg-dark border rounded-xl px-4 py-3 text-white placeholder:text-white/20 outline-none focus:ring-2 ring-gold/20 ${formErrors.email ? 'border-red-500/50' : 'border-white/10'}`}
                    value={brokerForm.email} onChange={e => {
                      setBrokerForm({ ...brokerForm, email: e.target.value });
                      if (formErrors.email) setFormErrors({ ...formErrors, email: '' });
                    }}
                  />
                  {formErrors.email && <span className="text-[10px] text-red-400 font-bold ml-1">{formErrors.email}</span>}
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex gap-2">
                    <input
                      type="text" placeholder="Area"
                      className="flex-1 bg-dark border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 outline-none focus:ring-2 ring-gold/20"
                      value={brokerForm.area} onChange={e => setBrokerForm({ ...brokerForm, area: e.target.value })}
                    />
                    <button type="submit" className="px-6 py-3 bg-gold text-dark font-bold rounded-xl hover:bg-white transition-colors">
                      Add
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Brokers List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {brokers.map(broker => (
                <div key={broker.id} className={`p-6 rounded-2xl border transition-all ${broker.is_active ? 'bg-white/5 border-white/10' : 'bg-red-500/5 border-red-500/20 opacity-60'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-lg">{broker.name}</h4>
                      <p className="text-white/40 text-sm flex items-center gap-1 mt-1">
                        <Phone className="w-3 h-3" />{broker.phone}
                      </p>
                      {broker.email && (
                        <p className="text-white/40 text-sm flex items-center gap-1">
                          <Mail className="w-3 h-3" />{broker.email}
                        </p>
                      )}
                      {broker.area && (
                        <p className="text-white/40 text-sm flex items-center gap-1">
                          <MapPin className="w-3 h-3" />{broker.area}
                        </p>
                      )}
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${broker.is_active ? 'bg-green-400/10 text-green-400' : 'bg-red-400/10 text-red-400'}`}>
                      {broker.is_active ? 'Active' : 'Blocked'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEditingBroker(broker)}
                      className="p-2.5 rounded-lg bg-gold/10 text-gold hover:bg-gold hover:text-dark transition-all"
                      title="Edit Details"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => toggleBrokerStatus(broker.id, !!broker.is_active)}
                      className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-colors ${broker.is_active ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'}`}
                    >
                      {broker.is_active ? 'Block' : 'Unblock'}
                    </button>
                    <button
                      onClick={() => deleteBroker(broker.id)}
                      className="px-4 py-2.5 rounded-lg text-xs font-bold bg-white/5 text-white/40 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              {brokers.length === 0 && (
                <div className="col-span-full text-center py-16 text-white/30 italic">No brokers yet. Add one above.</div>
              )}
            </div>

            {/* Edit Broker Modal/Overlay */}
            {editingBroker && (
              <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-dark/90 backdrop-blur-md">
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-zinc-900 border border-white/10 p-8 rounded-3xl w-full max-w-lg shadow-2xl"
                >
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-serif font-bold flex items-center gap-3">
                      <div className="p-2 bg-gold/10 rounded-lg">
                        <Edit2 className="w-5 h-5 text-gold" />
                      </div>
                      Edit Broker Details
                    </h3>
                    <button onClick={() => setEditingBroker(null)} className="p-2 hover:bg-white/5 rounded-full text-white/40">
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <form onSubmit={updateBroker} className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">Full Name</label>
                      <input
                        type="text"
                        className={`w-full bg-dark border rounded-xl px-4 py-3 text-white outline-none focus:ring-2 ring-gold/20 ${formErrors.name ? 'border-red-500' : 'border-white/10'}`}
                        value={editForm.name}
                        onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">Phone Number (+91)</label>
                      <div className="flex items-center bg-dark border border-white/10 rounded-xl px-4 py-3 focus-within:ring-2 ring-gold/20">
                        <span className="text-white/40 font-bold mr-2">+91</span>
                        <input
                          type="tel"
                          className="bg-transparent flex-1 text-white outline-none"
                          maxLength={10}
                          value={editForm.phone}
                          onChange={e => setEditForm({ ...editForm, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">Email Address</label>
                      <input
                        type="email"
                        className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 ring-gold/20"
                        value={editForm.email}
                        onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                        placeholder="Optional"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">Assigned Area</label>
                      <input
                        type="text"
                        className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 ring-gold/20"
                        value={editForm.area}
                        onChange={e => setEditForm({ ...editForm, area: e.target.value })}
                        placeholder="Optional"
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setEditingBroker(null)}
                        className="flex-1 py-4 rounded-xl font-bold bg-white/5 text-white/50 hover:bg-white/10 hover:text-white transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-[2] py-4 rounded-xl font-bold bg-gold text-dark hover:bg-white transition-all flex items-center justify-center gap-2"
                      >
                        <Save className="w-5 h-5" />
                        Save Changes
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}
          </motion.div>
        )}



        {/* ── CMS Tab ──────────────────────────────────────────────── */}
        {activeTab === 'cms' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { key: 'main_photo_2bhk', label: '2 BHK Main Photo', type: 'file', defaultValue: '/2bhk-plan.webp' },
                { key: 'main_photo_3bhk', label: '3 BHK Main Photo', type: 'file', defaultValue: '/3bhk-plan.webp' },
                { key: 'video_url_3bhk', label: '3 BHK Walkthrough Video URL', type: 'text', defaultValue: 'https://www.youtube.com/embed/vSvJb9Lpvzc?start=1&end=118', placeholder: 'e.g., https://youtube.com/embed/...' },
                { key: 'offer_text', label: 'Promotional Offer Text', type: 'textarea', defaultValue: 'Active: Free Maintenance 2yr, Free Registry & GST, Book from ₹11,000 only', placeholder: 'e.g., Avail exclusive festival discounts...' },
                { key: 'gallery_photos', label: 'Gallery Photos (Upload multiple)', type: 'file_multiple', defaultValue: JSON.stringify(['/gallery-5.webp','/gallery-1.webp','/gallery-2.webp','/gallery-3.webp','/gallery-4.webp','/gallery-6.webp','/gallery-7.webp']) },
                { key: 'gallery_videos', label: 'Gallery Video URL', type: 'text', defaultValue: 'https://www.youtube.com/embed/vSvJb9Lpvzc?start=1&end=118' },
                { key: 'map_location', label: 'Map Embed URL', type: 'text', defaultValue: 'https://maps.google.com/maps?q=Ayushman%20Residency%20Rau%20Indore&t=&z=15&ie=UTF8&iwloc=&output=embed' },
                { key: 'all_location_link', label: 'Get Directions Link', type: 'text', defaultValue: 'https://maps.app.goo.gl/EUKjJBXYGgxubYUm8' },
                { key: 'contact_email_footer', label: 'Email in Footer', type: 'text', defaultValue: 'residencyayushman@gmail.com' },
                { key: 'contact_phone_footer', label: 'Mobile No in Footer', type: 'text', defaultValue: '+91 78696 12823' },
                { key: 'social_insta', label: 'Instagram Link', type: 'text', defaultValue: 'https://www.instagram.com/shrigirirajrealty_official' },
                { key: 'social_facebook', label: 'Facebook Link', type: 'text', defaultValue: 'https://www.facebook.com/shrigirirajrealty' },
                { key: 'social_whatsapp', label: 'WhatsApp Link', type: 'text', defaultValue: 'https://wa.me/message/GHSV5MRVCN6SK1' },
                { key: 'social_youtube', label: 'YouTube Link', type: 'text', defaultValue: 'https://www.youtube.com/@shrigirirajrealty' },
              ].map(field => {
                const rawVal = cms[field.key];
                const isEffectivelyEmpty = !rawVal || rawVal === '' || rawVal === '[]';
                const displayValue = isEffectivelyEmpty ? field.defaultValue : rawVal;
                const isCustomized = !isEffectivelyEmpty;
                return (
                  <div key={field.key} className="bg-white/5 rounded-2xl border border-white/10 p-6 flex flex-col justify-between">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-white/40 mb-3">{field.label}</label>
                    
                    <div className="mb-4 p-3 bg-black/40 rounded-xl border border-white/5">
                      <p className="text-[10px] text-white/40 mb-2 uppercase tracking-wider">
                        {isCustomized ? <span className="text-green-400">Currently Customized</span> : 'Default on Website'}
                      </p>
                      {displayValue ? (
                        <>
                          {field.type === 'file' ? (
                            <div className="h-24 w-36 bg-dark rounded-lg overflow-hidden border border-white/10 relative">
                              <img src={displayValue} alt="Preview" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                            </div>
                          ) : field.type === 'file_multiple' ? (
                            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                              {(() => {
                                 try { 
                                   const parsed = JSON.parse(displayValue);
                                   if (parsed.length === 0) return <span className="text-xs text-white/30 italic">No gallery photos.</span>;
                                   return parsed.map((url: string, i: number) => (
                                     <div key={i} className="h-16 w-16 bg-dark rounded-lg overflow-hidden border border-white/10 shrink-0">
                                       <img src={url} className="w-full h-full object-cover" alt="Preview" onError={(e) => { e.currentTarget.style.display = 'none'; }}/>
                                     </div>
                                   ));
                                 } catch { return <span className="text-xs text-white/30 truncate">{displayValue}</span> }
                              })()}
                            </div>
                          ) : displayValue.startsWith('http') || displayValue.startsWith('mailto:') || displayValue.startsWith('tel:') ? (
                            <a href={displayValue} target="_blank" rel="noreferrer" className="text-xs text-gold underline break-all line-clamp-2 hover:text-white transition-colors">
                              {displayValue}
                            </a>
                          ) : (
                            <p className="text-xs text-white/70 line-clamp-2 break-all italic">"{displayValue}"</p>
                          )}
                        </>
                      ) : (
                        <p className="text-xs text-white/30 italic">Empty/Not Visible</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-auto">
                    {field.type === 'file' ? (
                      <div className="space-y-3">
                         <input 
                           type="file" 
                           onChange={(e) => {
                             if (e.target.files && e.target.files[0]) {
                               handleFileUpload(field.key, e.target.files[0]);
                             }
                           }} 
                           className="w-full text-sm text-white/50 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-gold file:text-dark hover:file:bg-white transition-all cursor-pointer"
                         />
                      </div>
                    ) : field.type === 'file_multiple' ? (
                       <div className="space-y-3">
                         <input 
                           type="file" 
                           multiple
                           onChange={(e) => {
                             if (e.target.files && e.target.files.length > 0) {
                               handleMultipleFileUpload(field.key, e.target.files);
                             }
                           }} 
                           className="w-full text-sm text-white/50 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-gold file:text-dark hover:file:bg-white transition-all cursor-pointer"
                         />
                         {cms[field.key] && (
                             <div className="flex items-center">
                                 <button onClick={() => updateCMS(field.key, '[]')} className="text-xs font-bold text-red-500 bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20 hover:bg-red-500 hover:text-white transition-all">Clear All Photos</button>
                             </div>
                         )}
                      </div>
                    ) : field.type === 'textarea' ? (
                      <textarea
                        rows={2}
                        placeholder={`Enter ${field.label}`}
                        className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 ring-gold/20 resize-none"
                        value={cms[field.key] || ''}
                        onChange={e => updateCMS(field.key, e.target.value)}
                      />
                    ) : (
                      <input
                        type="text"
                        placeholder={`Enter ${field.label}`}
                        className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 ring-gold/20"
                        value={cms[field.key] || ''}
                        onChange={e => updateCMS(field.key, e.target.value)}
                      />
                    )}
                  </div>
                </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Download Modal - Reused logic from Broker Portal */}
        {showDownloadModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-dark/95 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-zinc-900 border border-white/10 p-8 rounded-3xl w-full max-w-md shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-serif font-bold flex items-center gap-3">
                  <div className="p-2 bg-gold/10 rounded-lg">
                    <FileDown className="w-5 h-5 text-gold" />
                  </div>
                  Export Leads List
                </h3>
                <button onClick={() => setShowDownloadModal(false)} className="p-2 hover:bg-white/5 rounded-full text-white/40">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Status</label>
                    <select 
                      className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3 text-sm outline-none text-white focus:ring-2 ring-gold/20"
                      value={downloadFilters.status} onChange={e => setDownloadFilters({ ...downloadFilters, status: e.target.value })}
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="contacted">Contacted</option>
                      <option value="connected">Connected</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Timeframe</label>
                    <select 
                      className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3 text-sm outline-none text-white focus:ring-2 ring-gold/20"
                      value={downloadFilters.time} onChange={e => setDownloadFilters({ ...downloadFilters, time: e.target.value })}
                    >
                      <option value="all">Forever</option>
                      <option value="today">Today</option>
                      <option value="month">This Month</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => downloadLeads('csv')}
                    className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl flex flex-col items-center gap-2 transition-all border border-white/10 group"
                  >
                    <div className="p-3 bg-white/5 rounded-xl group-hover:text-gold transition-colors"><FileText className="w-6 h-6" /></div>
                    Excel (CSV)
                  </button>
                  <button 
                    onClick={() => downloadLeads('pdf')}
                    className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl flex flex-col items-center gap-2 transition-all border border-white/10 group"
                  >
                    <div className="p-3 bg-white/5 rounded-xl group-hover:text-gold transition-colors"><FileDown className="w-6 h-6" /></div>
                    Printable (PDF)
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Lead Details Modal */}
        {selectedLead && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-zinc-900 border border-white/10 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                <h3 className="text-xl font-serif font-bold">Lead Information</h3>
                <button onClick={() => setSelectedLead(null)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                  <X className="w-5 h-5 text-white/40" />
                </button>
              </div>
              
              <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Basic Info */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-gold/60">Contact Details</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/5 rounded-lg"><Users className="w-4 h-4 text-white/40" /></div>
                        <div><p className="text-xs text-white/40">Name</p><p className="font-bold">{selectedLead.name}</p></div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/5 rounded-lg"><Phone className="w-4 h-4 text-white/40" /></div>
                        <div><p className="text-xs text-white/40">Phone</p><p className="font-bold">{selectedLead.phone}</p></div>
                      </div>
                      {selectedLead.email && (
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white/5 rounded-lg"><Mail className="w-4 h-4 text-white/40" /></div>
                          <div><p className="text-xs text-white/40">Email</p><p className="font-bold">{selectedLead.email}</p></div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Requirements */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-gold/60">Requirements</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/5 rounded-lg"><TrendingUp className="w-4 h-4 text-white/40" /></div>
                        <div><p className="text-xs text-white/40">Property Type</p><p className="font-bold">{selectedLead.property_type}</p></div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/5 rounded-lg"><Wallet className="w-4 h-4 text-white/40" /></div>
                        <div><p className="text-xs text-white/40">Budget</p><p className="font-bold">{selectedLead.budget || 'Not specified'}</p></div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/5 rounded-lg"><MapPin className="w-4 h-4 text-white/40" /></div>
                        <div><p className="text-xs text-white/40">Preferred Location</p><p className="font-bold">{selectedLead.location_pref || 'Not specified'}</p></div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/5 rounded-lg"><UserPlus className="w-4 h-4 text-gold" /></div>
                        <div><p className="text-xs text-white/40">Referred By (Broker)</p><p className="font-bold text-gold">{selectedLead.referral || 'Direct Entry'}</p></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Details */}
                {(selectedLead.message || (selectedLead.claimed_offers && selectedLead.claimed_offers.length > 0)) && (
                  <div className="grid grid-cols-1 gap-8 pt-6 border-t border-white/5">
                    {selectedLead.message && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-gold/60">Message</h4>
                        <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-white/70 italic text-sm leading-relaxed">
                          "{selectedLead.message}"
                        </div>
                      </div>
                    )}
                    {selectedLead.claimed_offers && selectedLead.claimed_offers.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-gold/60">Claimed Offers</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedLead.claimed_offers.map((offer, idx) => (
                            <span key={idx} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-400/10 text-green-400 text-xs font-bold rounded-lg border border-green-400/20">
                              <CheckCircle2 className="w-3 h-3" /> {offer}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Timeline & Assignment */}
                <div className="pt-6 border-t border-white/5 flex flex-wrap gap-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-white/20" />
                    <span className="text-xs text-white/40">Submitted: {new Date(selectedLead.created_at).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-white/20" />
                    <span className="text-xs text-white/40">Assigned: {selectedLead.assigned_broker_name || 'Unassigned'}</span>
                  </div>
                </div>
              </div>
              
              <div className="p-6 bg-white/5 border-t border-white/5 flex justify-end">
                <button 
                  onClick={() => setSelectedLead(null)}
                  className="px-6 py-2.5 bg-gold text-dark font-bold rounded-xl hover:scale-105 transition-all text-sm"
                >
                  Close View
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
