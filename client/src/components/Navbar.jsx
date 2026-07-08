import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Menu, X, LogOut, LayoutDashboard, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NavLink = ({ to, children, active }) => (
    <Link
        to={to}
        className={`relative px-3 py-2 text-sm font-semibold rounded-lg transition-colors ${active ? 'text-white' : 'text-slate-300 hover:text-white'
            }`}
    >
        {active && (
            <Motion.span
                layoutId="nav-active-pill"
                className="absolute inset-0 bg-indigo-600 rounded-lg -z-10"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
        )}
        {children}
    </Link>
);

const Navbar = () => {
    const { user, logout } = useAuth();
    const { pathname } = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);

    const isActive = (path) => pathname === path;

    return (
        <nav className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-xl border-b border-white/5 shadow-lg shadow-black/10">
            <div className="max-w-6xl mx-auto px-4 md:px-6">
                <div className="flex items-center justify-between h-16">
                    <Link to="/" className="flex items-center gap-2 group" onClick={() => setMenuOpen(false)}>
                        <span className="relative p-1.5 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
                            <ShieldCheck className="w-5 h-5 text-white" />
                        </span>
                        <span className="text-lg font-black tracking-tight text-white font-display">
                            DocVerify<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-300">Chain</span>
                        </span>
                    </Link>

                    {/* Desktop nav */}
                    <div className="hidden md:flex items-center gap-1">
                        <NavLink to="/verifier" active={isActive('/verifier')}>Verify</NavLink>

                        {user?.role === 'uploader' && (
                            <NavLink to="/uploader" active={isActive('/uploader')}>Dashboard</NavLink>
                        )}
                        {user?.role === 'admin' && (
                            <NavLink to="/admin" active={isActive('/admin')}>Admin</NavLink>
                        )}

                        {user ? (
                            <div className="flex items-center gap-3 ml-4 pl-4 border-l border-white/10">
                                <span className="hidden lg:flex items-center gap-1.5 text-sm text-slate-400">
                                    {user.role === 'admin' ? <ShieldAlert className="w-3.5 h-3.5" /> : <LayoutDashboard className="w-3.5 h-3.5" />}
                                    Hi, <span className="text-slate-200 font-semibold">{user.name || 'User'}</span>
                                </span>
                                <button
                                    onClick={logout}
                                    className="flex items-center gap-1.5 bg-red-600/90 hover:bg-red-600 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white transition-all hover:shadow-lg hover:shadow-red-600/30"
                                >
                                    <LogOut className="w-3.5 h-3.5" /> Logout
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 ml-4 pl-4 border-l border-white/10">
                                <Link to="/login" className="px-4 py-1.5 text-sm font-semibold text-slate-300 hover:text-white rounded-lg hover:bg-white/5 transition">
                                    Login
                                </Link>
                                <Link
                                    to="/signup"
                                    className="bg-gradient-to-r from-indigo-600 to-cyan-500 px-4 py-1.5 rounded-lg text-sm font-bold text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 transition-all"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile toggle */}
                    <button
                        onClick={() => setMenuOpen((v) => !v)}
                        className="md:hidden p-2 text-slate-200 hover:bg-white/10 rounded-lg transition"
                        aria-label="Toggle menu"
                    >
                        {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            <AnimatePresence>
                {menuOpen && (
                    <Motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="md:hidden overflow-hidden border-t border-white/5 bg-slate-900/95"
                    >
                        <div className="px-4 py-4 flex flex-col gap-2">
                            <Link to="/verifier" onClick={() => setMenuOpen(false)} className="px-3 py-2.5 rounded-lg text-slate-200 font-semibold hover:bg-white/5">Verify</Link>
                            {user?.role === 'uploader' && (
                                <Link to="/uploader" onClick={() => setMenuOpen(false)} className="px-3 py-2.5 rounded-lg text-slate-200 font-semibold hover:bg-white/5">Dashboard</Link>
                            )}
                            {user?.role === 'admin' && (
                                <Link to="/admin" onClick={() => setMenuOpen(false)} className="px-3 py-2.5 rounded-lg text-slate-200 font-semibold hover:bg-white/5">Admin</Link>
                            )}

                            {user ? (
                                <button
                                    onClick={() => { setMenuOpen(false); logout(); }}
                                    className="mt-2 flex items-center justify-center gap-2 bg-red-600 px-4 py-2.5 rounded-lg text-sm font-bold text-white"
                                >
                                    <LogOut className="w-4 h-4" /> Logout ({user.name || 'User'})
                                </button>
                            ) : (
                                <div className="mt-2 flex flex-col gap-2">
                                    <Link to="/login" onClick={() => setMenuOpen(false)} className="text-center px-4 py-2.5 rounded-lg text-slate-200 font-semibold border border-white/10">Login</Link>
                                    <Link to="/signup" onClick={() => setMenuOpen(false)} className="text-center bg-gradient-to-r from-indigo-600 to-cyan-500 px-4 py-2.5 rounded-lg text-sm font-bold text-white">Sign Up</Link>
                                </div>
                            )}
                        </div>
                    </Motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
