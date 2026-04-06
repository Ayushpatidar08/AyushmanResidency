import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Building2, User, ArrowLeft, Lock, UserRound, Phone, Mail, KeyRound, AlertCircle, Eye, EyeOff } from 'lucide-react';

export function PortalHub() {
  const navigate = useNavigate();
  const location = useLocation();
  const [view, setView] = useState<'selection' | 'login' | 'forgot' | 'reset' | 'apply'>('selection');
  const [role, setRole] = useState<'admin' | 'broker' | 'client' | null>(null);

  // Check for role=admin query parameter to show login form for hidden admin
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('role') === 'admin') {
      setRole('admin');
      setView('login');
      // Clear params without navigation refresh
      navigate('/admin', { replace: true });
    }
  }, [location.search, navigate]);

  // Form states
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [forgotForm, setForgotForm] = useState({ email: '', mobile: '' });
  const [resetForm, setResetForm] = useState({ code: '', newPassword: '', confirmPassword: '' });
  const [applyForm, setApplyForm] = useState({ name: '', phone: '', email: '', area: '' });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  useEffect(() => { window.scrollTo(0, 0); }, [view]);

  const handleSelectRole = (selected: 'admin' | 'broker' | 'client') => {
    setRole(selected);
    setError('');
    setSuccess('');
    if (selected === 'client') {
       navigate('/admin/client');
    } else {
       setView('login');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...loginForm, role })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      
      localStorage.setItem('auth_role', role!);
      localStorage.setItem('auth_token', data.token);
      if (data.brokerId) localStorage.setItem('auth_broker_id', data.brokerId.toString());
      navigate(role === 'admin' ? '/admin/super' : '/admin/broker');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, ...forgotForm })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send verification code');
      
      setSuccess('Verification code sent to your email!');
      setTimeout(() => {
        setView('reset');
        setSuccess('');
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    if (resetForm.newPassword !== resetForm.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          role, 
          identifier: `${forgotForm.email}:${forgotForm.mobile}`,
          code: resetForm.code, 
          newPassword: resetForm.newPassword 
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset password');
      setSuccess('Password reset successful! You can login now.');
      setTimeout(() => {
        setView('login');
        setSuccess('');
        setResetForm({ code: '', newPassword: '', confirmPassword: '' });
      }, 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/brokers/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(applyForm)
      });
      if (!res.ok) throw new Error('Failed to submit application');
      setSuccess('Application submitted successfully. Awaiting admin approval.');
      setTimeout(() => {
        setView('login');
        setApplyForm({ name: '', phone: '', email: '', area: '' });
        setSuccess('');
      }, 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const portals = [
    // Admin hidden from public — access via direct URL /admin/super
    // { id: 'admin', title: 'Admin', icon: Shield, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/30' },
    { id: 'broker', title: 'Broker', icon: Building2, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/30' },
    { id: 'client', title: 'Client', icon: User, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/30' }
  ] as const;

  return (
    <div className="pt-28 pb-16 min-h-screen bg-dark text-white flex items-center justify-center">
      <div className="max-w-md w-full mx-auto px-4">
        
        {view === 'selection' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
             <Link to="/" className="inline-flex items-center space-x-2 text-white/40 hover:text-gold mb-8 transition-colors">
               <ArrowLeft className="w-4 h-4" /> <span>Back to Website</span>
             </Link>
             <h1 className="text-4xl font-serif mb-8">Access Portal</h1>
             <div className="grid gap-4">
               {portals.map(p => (
                 <button
                   key={p.id}
                   onClick={() => handleSelectRole(p.id)}
                   className={`flex items-center gap-4 p-5 rounded-2xl border ${p.border} bg-white/5 hover:bg-white/10 transition-all text-left`}
                 >
                   <div className={`p-4 rounded-xl ${p.bg}`}><p.icon className={`w-6 h-6 ${p.color}`} /></div>
                   <div>
                     <h3 className="text-xl font-bold font-serif">{p.title} Portal</h3>
                     <p className="text-sm text-white/50">Login as {p.title}</p>
                   </div>
                 </button>
               ))}
             </div>
          </motion.div>
        )}

        {view !== 'selection' && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-md">
            <button onClick={() => { setView('selection'); setError(''); setSuccess(''); }} className="text-white/40 hover:text-white mb-6 flex items-center gap-2 text-sm">
              <ArrowLeft className="w-4 h-4" /> Back to roles
            </button>
            <h2 className="text-3xl font-serif text-center mb-2 capitalize">{role} Login</h2>
            <p className="text-center text-white/40 text-sm mb-8">
              {view === 'login' && 'Enter your credentials to access the portal'}
              {view === 'forgot' && 'Verification code will be sent to your registered email'}
              {view === 'reset' && 'Enter the verification code and your new password'}
              {view === 'apply' && 'Submit an application to work with us'}
            </p>

            {error && <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm flex gap-2 items-center"><AlertCircle className="w-4 h-4" /> {error}</div>}
            {success && <div className="mb-6 p-3 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl text-sm flex gap-2 items-center"><AlertCircle className="w-4 h-4" /> {success}</div>}

            {view === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="relative">
                  <UserRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                  <input type="text" placeholder="User ID" className="w-full bg-dark border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white outline-none focus:border-gold" required value={loginForm.username} onChange={e => setLoginForm({...loginForm, username: e.target.value})} />
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                  <input type={showPass ? "text" : "password"} placeholder="Password" className="w-full bg-dark border border-white/10 rounded-xl pl-12 pr-12 py-3 text-white outline-none focus:border-gold" required value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex justify-end">
                  <button type="button" onClick={() => setView('forgot')} className="text-sm text-gold hover:underline">Forgot Password?</button>
                </div>
                <button type="submit" disabled={loading} className="w-full py-3 bg-gold text-dark font-bold rounded-xl hover:bg-white transition-colors">{loading ? 'Verifying...' : 'Login'}</button>
                {role === 'broker' && (
                  <div className="text-center mt-4">
                    <span className="text-sm text-white/40">New broker? </span>
                    <button type="button" onClick={() => setView('apply')} className="text-sm text-gold hover:underline">Apply to work with us</button>
                  </div>
                )}
              </form>
            )}

            {view === 'forgot' && (
              <form onSubmit={handleForgot} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                  <input type="email" placeholder="Username (Email Address)" className="w-full bg-dark border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white outline-none focus:border-gold" required value={forgotForm.email} onChange={e => setForgotForm({...forgotForm, email: e.target.value})} />
                </div>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                  <div className="w-full bg-dark border border-white/10 rounded-xl pl-12 pr-4 py-3 flex items-center focus-within:border-gold transition-colors">
                    <span className="text-white/40 font-bold mr-2">+91</span>
                    <input type="tel" placeholder="Mobile Number" className="bg-transparent text-white outline-none w-full" maxLength={10} required value={forgotForm.mobile} onChange={e => setForgotForm({...forgotForm, mobile: e.target.value.replace(/\D/g, '')})} />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="w-full py-3 bg-gold text-dark font-bold rounded-xl hover:bg-white transition-colors">{loading ? 'Sending Code...' : 'Get Verification Code'}</button>
              </form>
            )}

            {view === 'reset' && (
              <form onSubmit={handleReset} className="space-y-4">
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                  <input type="text" placeholder="6-digit Code" autoComplete="one-time-code" className="w-full bg-dark border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white outline-none focus:border-gold" maxLength={6} required value={resetForm.code} onChange={e => setResetForm({...resetForm, code: e.target.value.replace(/\D/g, '')})} />
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                  <input type={showNewPass ? "text" : "password"} placeholder="New Password" minLength={6} autoComplete="new-password" className="w-full bg-dark border border-white/10 rounded-xl pl-12 pr-12 py-3 text-white outline-none focus:border-gold" required value={resetForm.newPassword} onChange={e => setResetForm({...resetForm, newPassword: e.target.value})} />
                  <button type="button" onClick={() => setShowNewPass(!showNewPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white">
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                  <input type={showConfirmPass ? "text" : "password"} placeholder="Confirm New Password" minLength={6} autoComplete="new-password" className="w-full bg-dark border border-white/10 rounded-xl pl-12 pr-12 py-3 text-white outline-none focus:border-gold" required value={resetForm.confirmPassword} onChange={e => setResetForm({...resetForm, confirmPassword: e.target.value})} />
                  <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white">
                    {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <button type="submit" disabled={loading} className="w-full py-3 bg-gold text-dark font-bold rounded-xl hover:bg-white transition-colors">{loading ? 'Resetting...' : 'Reset Password'}</button>
                <button type="button" onClick={() => setView('forgot')} className="w-full text-center text-sm text-white/40 hover:text-gold mt-2">Didn't get code? Resend</button>
              </form>
            )}

            {view === 'apply' && (
              <form onSubmit={handleApply} className="space-y-4">
                <input type="text" placeholder="Full Name *" required className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-gold" value={applyForm.name} onChange={e => setApplyForm({...applyForm, name: e.target.value})} />
                <input type="tel" placeholder="Mobile Number *" required className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-gold" value={applyForm.phone} onChange={e => setApplyForm({...applyForm, phone: e.target.value})} />
                <input type="email" placeholder="Email Address" className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-gold" value={applyForm.email} onChange={e => setApplyForm({...applyForm, email: e.target.value})} />
                <input type="text" placeholder="Operating Area" className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-gold" value={applyForm.area} onChange={e => setApplyForm({...applyForm, area: e.target.value})} />
                <button type="submit" disabled={loading} className="w-full py-3 bg-gold text-dark font-bold rounded-xl hover:bg-white transition-colors">{loading ? 'Submitting...' : 'Submit Form'}</button>
              </form>
            )}

          </motion.div>
        )}

      </div>
    </div>
  );
}
