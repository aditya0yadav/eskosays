import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, ShieldCheck, RefreshCw, AlertCircle } from 'lucide-react';
import { auth, googleProvider } from '../../config/firebase';
import { signInWithEmailAndPassword, signInWithPopup, sendSignInLinkToEmail } from 'firebase/auth';
import api from '../../services/api';
import { collectFingerprint } from '../../utils/fingerprint';
import logo from '../../assets/logo.png';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const [unverified, setUnverified] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [resendSent, setResendSent] = useState(false);

    const handleGoogleLogin = async () => {
        setError('');
        setLoading(true);
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const idToken = await result.user.getIdToken();
            const deviceFingerprint = await collectFingerprint();
            const response = await api.post('/auth/firebase', { idToken, deviceFingerprint });
            if (response.data.success) {
                const { user, accessToken, refreshToken } = response.data;
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', refreshToken);
                localStorage.setItem('user', JSON.stringify(user));
                window.location.href = '/dashboard';
            }
        } catch (err) {
            console.error('Google Login Error:', err);
            if (err.response?.data?.code === 'VPN_DETECTED') {
                setError('VPN or proxy detected. Please disable it and try again.');
            } else {
                setError('Google sign-in failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setUnverified(false);
        setLoading(true);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const firebaseUser = userCredential.user;
            if (!firebaseUser.emailVerified) {
                setUnverified(true);
                setLoading(false);
                return;
            }
            const idToken = await firebaseUser.getIdToken();
            const deviceFingerprint = await collectFingerprint();
            const response = await api.post('/auth/firebase', { idToken, deviceFingerprint });
            if (response.data.success) {
                const { user, accessToken, refreshToken } = response.data;
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', refreshToken);
                localStorage.setItem('user', JSON.stringify(user));
                window.location.href = '/dashboard';
            }
        } catch (err) {
            console.error('Login Error:', err);
            if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
                setError('Invalid email or password.');
            } else if (err.response?.data?.code === 'VPN_DETECTED') {
                setError('VPN or proxy detected. Please disable it and try again.');
            } else {
                setError(err.response?.data?.message || 'Something went wrong. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResendVerification = async () => {
        setResendLoading(true);
        try {
            await sendSignInLinkToEmail(auth, email, {
                url: `${window.location.origin}/finish-signup`,
                handleCodeInApp: true,
            });
            window.localStorage.setItem('emailForSignIn', email);
            setResendSent(true);
        } catch (err) {
            setError('Failed to resend verification email. Please try again.');
        } finally {
            setResendLoading(false);
        }
    };

    // ── Unverified email wall ─────────────────────────────────────────────
    if (unverified) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #F5F7FA 100%)' }}>
                <div className="max-w-md w-full text-center space-y-6 depth-card p-10">
                    <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto"
                        style={{ background: 'linear-gradient(135deg, rgba(0,34,255,0.08), rgba(0,34,255,0.04))', border: '1px solid rgba(0,34,255,0.12)' }}>
                        <AlertCircle className="w-10 h-10" style={{ color: '#0022FF' }} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-[#0F1E3A] mb-2">Verify your email</h1>
                        <p className="text-gray-500 leading-relaxed">
                            We sent a verification link to<br />
                            <span className="font-semibold text-[#0F1E3A]">{email}</span>
                            <br /><br />
                            Click the link in that email to activate your account, then come back here to log in.
                        </p>
                    </div>
                    {resendSent ? (
                        <div className="bg-green-50 border border-green-100 text-green-700 px-4 py-3 rounded-xl text-sm font-medium">
                            ✓ Verification email resent successfully.
                        </div>
                    ) : (
                        <button onClick={handleResendVerification} disabled={resendLoading}
                            className="w-full h-14 text-white font-bold rounded-2xl hover:shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60"
                            style={{ background: '#0022FF' }}>
                            {resendLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Resend verification email'}
                        </button>
                    )}
                    <button onClick={() => { setUnverified(false); setResendSent(false); }}
                        className="text-sm text-gray-500 transition-colors" style={{ color: '' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#0022FF'}
                        onMouseLeave={e => e.currentTarget.style.color = ''}>
                        ← Back to login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #F5F7FA 100%)' }}>

            {/* ── Left Side: Realistic Product Visual Panel ─── */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center p-16"
                style={{ background: 'linear-gradient(135deg, #4A72FF 0%, #1E46FF 50%, #0022FF 100%)' }}>

                {/* Subtle Grid Background */}
                <svg className="absolute inset-0 w-full h-full opacity-[0.08] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="loginGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#loginGrid)" />
                </svg>

                {/* Glow blobs for premium feel */}
                <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full pointer-events-none"
                    style={{ background: 'radial-gradient(circle, rgba(150,180,255,0.4) 0%, transparent 75%)', filter: 'blur(60px)' }} />
                <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full pointer-events-none"
                    style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.18) 0%, transparent 70%)', filter: 'blur(45px)' }} />

                {/* Content Container */}
                <div className="relative z-10 text-center max-w-md w-full flex flex-col items-center">
                    
                    {/* Realistic Dashboard Mockups */}
                    <div className="relative w-full mb-12 select-none">
                        {/* Earnings Analytics Card */}
                        <div className="rounded-3xl p-6 text-left max-w-xs mx-auto border border-white/20"
                            style={{
                                backdropFilter: 'blur(16px)',
                                WebkitBackdropFilter: 'blur(16px)',
                                background: 'rgba(255,255,255,0.10)',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                            }}>
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-white/60 text-[10px] font-bold uppercase tracking-wider">Earnings Overview</span>
                                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full">+12.4%</span>
                            </div>
                            <div className="flex items-baseline gap-1 mb-5">
                                <span className="text-3xl font-black text-white">$432.50</span>
                                <span className="text-white/50 text-[10px] font-bold">USD</span>
                            </div>
                            {/* Sparkline chart */}
                            <div className="h-12 w-full mb-4">
                                <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
                                    <path d="M0,25 Q15,10 30,18 T60,5 T80,12 L100,2 L100,30 L0,30 Z" fill="rgba(79,209,232,0.15)" />
                                    <path d="M0,25 Q15,10 30,18 T60,5 T80,12 L100,2" fill="none" stroke="#4FD1E8" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            </div>
                            <div className="flex justify-between border-t border-white/10 pt-3 text-[11px]">
                                <div>
                                    <p className="text-white/40 font-semibold mb-0.5">Surveys Done</p>
                                    <p className="text-white font-bold">34</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-white/40 font-semibold mb-0.5">Earned Today</p>
                                    <p className="text-emerald-400 font-bold">+$24.50</p>
                                </div>
                            </div>
                        </div>

                        {/* Floating Cashout Success Badge */}
                        <div className="rounded-2xl p-4 text-left max-w-[200px] w-full border border-white/20 absolute -right-6 top-1/2 translate-y-6 rotate-3 hidden sm:block animate-float"
                            style={{
                                backdropFilter: 'blur(16px)',
                                WebkitBackdropFilter: 'blur(16px)',
                                background: 'rgba(255,255,255,0.14)',
                                boxShadow: '0 15px 30px rgba(0,0,0,0.15)',
                                zIndex: 5,
                            }}>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm flex-shrink-0">✓</div>
                                <div>
                                    <p className="text-white font-bold text-xs leading-snug">Payout Success</p>
                                    <p className="text-white/60 text-[10px]">Instant PayPal deposit</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Shield and Title Section */}
                    <div className="inline-flex items-center justify-center p-2.5 rounded-2xl bg-white/10 border border-white/20 mb-4">
                        <ShieldCheck className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-white mb-3 tracking-tight leading-snug">
                        Secure <span style={{ color: '#4FD1E8' }}>Verified</span> Access
                    </h2>
                    <p className="text-white/60 text-sm leading-relaxed max-w-xs">
                        Your account is protected with email verification on every sign-in.
                    </p>

                    {/* Stat pills */}
                    <div className="flex items-center justify-center gap-2 mt-8">
                        {[['50K+', 'Panelists'], ['$14K', 'Paid out'], ['4.9★', 'Rating']].map(([val, label]) => (
                            <div key={label} className="px-3.5 py-2.5 rounded-2xl text-center min-w-[90px]"
                                style={{
                                    backdropFilter: 'blur(12px)',
                                    WebkitBackdropFilter: 'blur(12px)',
                                    background: 'rgba(255,255,255,0.10)',
                                    border: '1px solid rgba(255,255,255,0.15)',
                                }}>
                                <p className="text-white font-black text-sm leading-none">{val}</p>
                                <p className="text-white/50 text-[10px] font-medium mt-0.5">{label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Right Side: Login Form ─── */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-20 relative overflow-hidden">
                {/* Background geometric shapes behind form */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.03] text-[#0022FF]">
                    <svg className="absolute -top-10 -right-10 w-44 h-44 animate-float" viewBox="0 0 100 100">
                        <polygon points="50,5 95,27 95,73 50,95 5,73 5,27" fill="none" stroke="currentColor" strokeWidth="1" />
                    </svg>
                    <svg className="absolute bottom-10 left-10 w-36 h-36" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="0.8" strokeDasharray="4 4" />
                    </svg>
                </div>
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:text-left">
                        <Link to="/" className="inline-flex items-center mb-8 gap-3 no-underline">
                            <img src={logo} alt="Eskosays" className="h-9 w-auto object-contain" />
                        </Link>
                        <h1 className="text-3xl font-bold text-[#0F1E3A] tracking-tight">Welcome back</h1>
                        <p className="text-gray-500 mt-2">Sign in with your verified email to continue.</p>
                    </div>

                    {/* Google Sign-In */}
                    <button type="button" onClick={handleGoogleLogin} disabled={loading}
                        className="w-full flex items-center justify-center gap-3 px-4 py-3.5 border border-gray-200 rounded-2xl font-semibold text-[#0F1E3A] hover:bg-gray-50 transition-all active:scale-[0.98] disabled:opacity-60 bg-white"
                        style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                        Continue with Google
                    </button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-100" /></div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="px-4 text-gray-400 font-medium tracking-widest" style={{ background: 'transparent', backgroundColor: 'rgba(255,255,255,0.8)' }}>Or sign in with email</span>
                        </div>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-[#0022FF] transition-colors" />
                            <input type="email" placeholder="Email address"
                                className="w-full h-14 pl-12 pr-4 bg-white border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                                style={{ '--tw-ring-color': 'rgba(0,34,255,0.15)' }}
                                onFocus={e => e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,34,255,0.12)'}
                                onBlur={e => e.currentTarget.style.boxShadow = ''}
                                value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} />
                        </div>

                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-[#0022FF] transition-colors" />
                            <input type="password" placeholder="Password"
                                className="w-full h-14 pl-12 pr-4 bg-white border border-gray-100 rounded-2xl focus:outline-none transition-all"
                                onFocus={e => e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,34,255,0.12)'}
                                onBlur={e => e.currentTarget.style.boxShadow = ''}
                                value={password} onChange={(e) => setPassword(e.target.value)} required disabled={loading} />
                        </div>

                        {error && (
                            <div className={`px-4 py-3 rounded-xl text-sm font-medium border ${error.includes('VPN')
                                ? 'bg-orange-50 border-orange-100 text-orange-700'
                                : 'bg-red-50 border-red-100 text-red-600'}`}>
                                {error}
                            </div>
                        )}

                        <button type="submit" disabled={loading}
                            className="w-full h-14 text-white font-bold rounded-2xl hover:shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60"
                            style={{ background: '#0022FF', boxShadow: '0 4px 20px rgba(0,34,255,0.25)' }}>
                            {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <>Sign In <ArrowRight className="w-5 h-5" /></>}
                        </button>
                    </form>

                    <p className="text-center text-gray-600 font-medium">
                        Don't have an account?{' '}
                        <Link to="/signup" className="font-bold no-underline" style={{ color: '#0022FF' }}>Sign up</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
