import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import {
    User, Mail, Lock, Building2, MapPin, AlertCircle, ArrowRight,
    ShieldCheck, UserCheck, Landmark, Sparkles
} from 'lucide-react';
import ShieldOrb from '../components/three/ShieldOrb';

const Signup = () => {
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'verifier',
        institutionName: '',
        institutionAddress: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const res = await register(formData);
        if (!res.success) setError(res.message);
        setLoading(false);
    };

    const roleOptions = [
        { value: 'verifier', label: 'Verifier', desc: 'Public — verify documents', icon: UserCheck },
        { value: 'uploader', label: 'Uploader', desc: 'Institution — anchor documents', icon: Landmark },
    ];

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 md:p-8 py-10 animate-fade-in">
            <div className="w-full max-w-4xl grid md:grid-cols-2 rounded-[2rem] overflow-hidden shadow-2xl border border-white/40">
                {/* Visual panel */}
                <div className="hidden md:flex relative flex-col justify-between bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-8 overflow-hidden">
                    <ShieldOrb className="absolute inset-0 opacity-90" />
                    <div className="relative z-10 flex items-center gap-2">
                        <ShieldCheck className="w-6 h-6 text-indigo-300" />
                        <span className="text-white font-black tracking-tight font-display">DocVerifyChain</span>
                    </div>
                    <div className="relative z-10">
                        <p className="text-white text-2xl font-bold font-display leading-snug mb-2">
                            Join the ledger of trust.
                        </p>
                        <p className="text-slate-400 text-sm leading-relaxed max-w-xs flex items-start gap-1.5">
                            <Sparkles className="w-4 h-4 text-cyan-300 shrink-0 mt-0.5" />
                            Create an account to verify documents or register your institution as an issuer.
                        </p>
                    </div>
                </div>

                {/* Form panel */}
                <Motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass p-8 md:p-10 flex flex-col justify-center max-h-[85vh] overflow-y-auto"
                >
                    <h2 className="text-3xl font-black text-slate-800 font-display mb-1">Create account</h2>
                    <p className="text-slate-500 text-sm mb-6">Get started in under a minute</p>

                    {error && (
                        <Motion.p
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-2 text-red-600 text-sm font-semibold bg-red-50 border border-red-100 p-3 rounded-xl mb-5"
                        >
                            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                        </Motion.p>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Full Name"
                                className="w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-xl bg-white/70 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="email"
                                placeholder="Email address"
                                className="w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-xl bg-white/70 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="password"
                                placeholder="Password"
                                className="w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-xl bg-white/70 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <label className="block mb-2 text-xs font-black text-slate-500 uppercase tracking-widest">I am a...</label>
                            <div className="grid grid-cols-2 gap-3">
                                {roleOptions.map((opt) => {
                                    const Icon = opt.icon;
                                    const active = formData.role === opt.value;
                                    return (
                                        <button
                                            type="button"
                                            key={opt.value}
                                            onClick={() => setFormData({ ...formData, role: opt.value })}
                                            className={`text-left p-3.5 rounded-xl border-2 transition-all ${active
                                                ? 'border-indigo-500 bg-indigo-50 shadow-sm'
                                                : 'border-slate-200 bg-white/60 hover:border-slate-300'
                                                }`}
                                        >
                                            <Icon className={`w-5 h-5 mb-1.5 ${active ? 'text-indigo-600' : 'text-slate-400'}`} />
                                            <p className={`text-sm font-bold ${active ? 'text-indigo-700' : 'text-slate-700'}`}>{opt.label}</p>
                                            <p className="text-[11px] text-slate-500 mt-0.5">{opt.desc}</p>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <AnimatePresence>
                            {formData.role === 'uploader' && (
                                <Motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="bg-indigo-50/70 p-4 rounded-xl border border-indigo-100 space-y-3">
                                        <h3 className="font-bold text-indigo-800 text-sm flex items-center gap-1.5">
                                            <Building2 className="w-4 h-4" /> Institution Request
                                        </h3>
                                        <p className="text-xs text-indigo-600/80 -mt-2">Requires admin approval before you can anchor documents.</p>
                                        <div className="relative">
                                            <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type="text"
                                                placeholder="Institution Name"
                                                className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white/80 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                value={formData.institutionName}
                                                onChange={(e) => setFormData({ ...formData, institutionName: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="relative">
                                            <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                                            <textarea
                                                placeholder="Institution Address"
                                                rows={2}
                                                className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white/80 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                                                value={formData.institutionAddress}
                                                onChange={(e) => setFormData({ ...formData, institutionAddress: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                </Motion.div>
                            )}
                        </AnimatePresence>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-indigo-600 to-cyan-500 text-white py-3.5 rounded-xl font-bold shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:translate-y-0 flex items-center justify-center gap-2 group"
                        >
                            {loading ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Sign Up
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-slate-500">
                        Already have an account? <Link to="/login" className="text-indigo-600 font-semibold hover:text-indigo-700">Login</Link>
                    </p>
                </Motion.div>
            </div>
        </div>
    );
};

export default Signup;
