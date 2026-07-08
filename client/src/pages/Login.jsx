import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import ShieldOrb from '../components/three/ShieldOrb';

const Login = () => {
    const { login } = useAuth();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const res = await login(formData.email, formData.password);
        if (!res.success) setError(res.message);
        setLoading(false);
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 md:p-8 animate-fade-in">
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
                            Trust, anchored on-chain.
                        </p>
                        <p className="text-slate-400 text-sm leading-relaxed max-w-xs flex items-start gap-1.5">
                            <Sparkles className="w-4 h-4 text-cyan-300 shrink-0 mt-0.5" />
                            Sign in to manage documents and verifications secured by immutable blockchain proofs.
                        </p>
                    </div>
                </div>

                {/* Form panel */}
                <Motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass p-8 md:p-10 flex flex-col justify-center"
                >
                    <h2 className="text-3xl font-black text-slate-800 font-display mb-1">Welcome back</h2>
                    <p className="text-slate-500 text-sm mb-8">Enter your credentials to continue</p>

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
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="email"
                                placeholder="Email address"
                                className="w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-xl bg-white/70 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                autoComplete="username"
                                required
                            />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Password"
                                className="w-full pl-11 pr-11 py-3.5 border border-slate-200 rounded-xl bg-white/70 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                autoComplete="current-password"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((v) => !v)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold shadow-xl hover:shadow-2xl hover:bg-black hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:translate-y-0 flex items-center justify-center gap-2 group"
                        >
                            {loading ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Login
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-slate-500">
                        Don't have an account? <Link to="/signup" className="text-indigo-600 font-semibold hover:text-indigo-700">Sign up</Link>
                    </p>
                </Motion.div>
            </div>
        </div>
    );
};

export default Login;
