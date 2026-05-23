import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, User, ShieldCheck, RefreshCw, MailCheck, ArrowRight } from 'lucide-react';
import { auth, googleProvider } from '../../config/firebase';
import { createUserWithEmailAndPassword, updateProfile, sendSignInLinkToEmail, signInWithPopup } from 'firebase/auth';
import api from '../../services/api';
import { collectFingerprint } from '../../utils/fingerprint';
import logo from '../../assets/logo.png';

const ACTION_URL = `${window.location.origin}/finish-signup`;

const Signup = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [agreed, setAgreed] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const handleGoogleSignup = async () => {
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
                window.location.href = '/onboarding';
            }
        } catch (err) {
            console.error('Google Signup Error:', err);
            setError('Google sign-up failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        if (!agreed) { setError('Please agree to the Terms of Service and Privacy Policy.'); return; }
        setError('');
        setLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(userCredential.user, { displayName: name });
            await sendSignInLinkToEmail(auth, email, { url: ACTION_URL, handleCodeInApp: true });
            window.localStorage.setItem('emailForSignIn', email);
            window.localStorage.setItem('displayNameForSignIn', name);
            try {
                const idToken = await userCredential.user.getIdToken();
                const deviceFingerprint = await collectFingerprint();
                await api.post('/auth/firebase', { idToken, deviceFingerprint });
            } catch (backendErr) {
                console.warn('Backend sync after signup failed (non-fatal):', backendErr.message);
            }
            setEmailSent(true);
        } catch (err) {
            console.error('Signup Error:', err);
            if (err.code === 'auth/email-already-in-use') {
                setError('That email is already registered. Try logging in instead.');
            } else if (err.code === 'auth/weak-password') {
                setError('Password must be at least 6 characters.');
            } else {
                setError(err.message || 'Signup failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    // ── Email confirmation screen ─────────────────────────────────────────
    if (emailSent) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #F5F7FA 100%)' }}>
                <div className="max-w-md w-full text-center space-y-6 depth-card p-10">
                    <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto shadow-lg"
                        style={{ background: 'linear-gradient(135deg, #0022FF, #4FD1E8)', boxShadow: '0 8px 30px rgba(0,34,255,0.3)' }}>
                        <MailCheck className="w-10 h-10 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-[#0F1E3A] mb-2">Check your inbox</h1>
                        <p className="text-gray-500 leading-relaxed">
                            We sent a sign-in link to<br />
                            <span className="font-semibold text-[#0F1E3A]">{email}</span>
                            <br /><br />
                            Click the link in that email to verify your account. The link is valid for 1 hour.
                        </p>
                    </div>
                    <div className="rounded-2xl p-4 text-left space-y-2" style={{ background: 'rgba(0,34,255,0.05)', border: '1px solid rgba(0,34,255,0.1)' }}>
                        <p className="text-sm font-semibold text-[#0F1E3A]">☑ What to do next</p>
                        <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                            <li>Open your email inbox</li>
                            <li>Click the verification link from Eskosays</li>
                            <li>You'll be signed in automatically</li>
                        </ol>
                    </div>
                    <Link to="/login"
                        className="block w-full h-12 text-white font-bold rounded-2xl hover:shadow-lg transition-all flex items-center justify-center no-underline"
                        style={{ background: '#0022FF', boxShadow: '0 4px 20px rgba(0,34,255,0.25)' }}>
                        Go to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #F5F7FA 100%)' }}>

            {/* ── Left: Signup Form ─── */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-20 relative overflow-hidden">
                {/* Background geometric shapes behind form */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.03] text-[#0022FF]">
                    <svg className="absolute -top-10 -left-10 w-44 h-44 animate-float" viewBox="0 0 100 100">
                        <polygon points="50,5 95,27 95,73 50,95 5,73 5,27" fill="none" stroke="currentColor" strokeWidth="1" />
                    </svg>
                    <svg className="absolute bottom-10 right-10 w-36 h-36" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="0.8" strokeDasharray="4 4" />
                    </svg>
                </div>
                <div className="w-full max-w-md space-y-7">
                    <div className="text-center lg:text-left">
                        <Link to="/" className="inline-flex items-center mb-8 gap-3 no-underline">
                            <img src={logo} alt="Eskosays Logo" className="h-9 w-auto object-contain" />
                        </Link>
                        <h1 className="text-3xl font-bold text-[#0F1E3A] tracking-tight">Create Account</h1>
                        <p className="text-gray-500 mt-2">Join our global community and start earning.</p>
                    </div>

                    {/* Google Sign-Up */}
                    <button type="button" onClick={handleGoogleSignup} disabled={loading}
                        className="w-full flex items-center justify-center gap-3 px-4 py-3.5 border border-gray-200 rounded-2xl font-semibold text-[#0F1E3A] hover:bg-gray-50 transition-all active:scale-[0.98] disabled:opacity-60 bg-white"
                        style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                        Continue with Google
                    </button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-100" /></div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="px-4 text-gray-400 font-medium tracking-widest bg-white/80">Or register with email</span>
                        </div>
                    </div>

                    <form onSubmit={handleSignup} className="space-y-4">
                        {[
                            { icon: <User className="w-5 h-5" />, type: 'text', placeholder: 'Full Name', value: name, onChange: setName, required: true },
                            { icon: <Mail className="w-5 h-5" />, type: 'email', placeholder: 'Email address', value: email, onChange: setEmail, required: true },
                            { icon: <Lock className="w-5 h-5" />, type: 'password', placeholder: 'Create Password (min 6 chars)', value: password, onChange: setPassword, required: true, minLength: 6 },
                        ].map(({ icon, type, placeholder, value, onChange, required, minLength }) => (
                            <div key={placeholder} className="relative group">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#0022FF] transition-colors" style={{ color: '' }}>
                                    {icon}
                                </span>
                                <input type={type} placeholder={placeholder}
                                    className="w-full h-14 pl-12 pr-4 bg-white border border-gray-100 rounded-2xl focus:outline-none transition-all"
                                    onFocus={e => e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,34,255,0.12)'}
                                    onBlur={e => e.currentTarget.style.boxShadow = ''}
                                    value={value} onChange={(e) => onChange(e.target.value)}
                                    required={required} minLength={minLength} disabled={loading} />
                            </div>
                        ))}

                        <div className="flex items-start gap-3">
                            <input type="checkbox" id="terms"
                                className="mt-1 w-4 h-4 rounded border-gray-300 accent-[#0022FF]"
                                checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
                            <label htmlFor="terms" className="text-sm text-gray-500 leading-relaxed">
                                I agree to the{' '}
                                <Link to="/terms-of-service" className="font-semibold hover:underline no-underline" style={{ color: '#0022FF' }}>Terms of Service</Link>
                                {' '}and{' '}
                                <Link to="/privacy-policy" className="font-semibold hover:underline no-underline" style={{ color: '#0022FF' }}>Privacy Policy</Link>.
                            </label>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">{error}</div>
                        )}

                        <button type="submit" disabled={loading}
                            className="w-full h-14 text-white font-bold rounded-2xl hover:shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60"
                            style={{ background: '#0022FF', boxShadow: '0 4px 20px rgba(0,34,255,0.25)' }}>
                            {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <><ShieldCheck className="w-5 h-5" /> Create Account</>}
                        </button>
                    </form>

                    <p className="text-center text-gray-600 font-medium">
                        Already have an account?{' '}
                        <Link to="/login" className="font-bold no-underline" style={{ color: '#0022FF' }}>Log in</Link>
                    </p>
                </div>
            </div>

            {/* ── Right: Realistic Product Visual Panel ─── */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center p-20"
                style={{ background: 'linear-gradient(135deg, #4A72FF 0%, #1E46FF 50%, #0022FF 100%)' }}>

                {/* Subtle Grid Background */}
                <svg className="absolute inset-0 w-full h-full opacity-[0.08] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="signupGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#signupGrid)" />
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
                        {/* Recommended Surveys Card */}
                        <div className="rounded-3xl p-5 text-left max-w-xs mx-auto border border-white/20"
                            style={{
                                backdropFilter: 'blur(16px)',
                                WebkitBackdropFilter: 'blur(16px)',
                                background: 'rgba(255,255,255,0.10)',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                            }}>
                            <p className="text-white/60 text-[10px] font-bold uppercase tracking-wider mb-3">Recommended Surveys</p>
                            <div className="space-y-2">
                                {[
                                    { title: "💻 AI Tech Trends", time: "15m", reward: "+$5.20" },
                                    { title: "🍔 Fast Food Habits", time: "8m", reward: "+$2.80" },
                                    { title: "🚗 Electric Vehicles", time: "12m", reward: "+$4.10" }
                                ].map((srv, i) => (
                                    <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
                                        <div>
                                            <p className="text-white font-bold text-xs">{srv.title}</p>
                                            <p className="text-white/40 text-[9px]">{srv.time} · Survey</p>
                                        </div>
                                        <span className="text-emerald-400 font-bold text-xs">{srv.reward}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Floating Testimonial/Live Activity Badge */}
                        <div className="rounded-2xl p-4 text-left max-w-[210px] w-full border border-white/20 absolute -left-6 top-1/2 translate-y-8 -rotate-3 hidden sm:block animate-float"
                            style={{
                                backdropFilter: 'blur(16px)',
                                WebkitBackdropFilter: 'blur(16px)',
                                background: 'rgba(255,255,255,0.14)',
                                boxShadow: '0 15px 30px rgba(0,0,0,0.15)',
                                zIndex: 5,
                            }}>
                            <div className="flex items-start gap-2.5">
                                <div className="w-7 h-7 rounded-full bg-blue-500/20 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">💬</div>
                                <div>
                                    <p className="text-white/80 text-[11px] leading-relaxed italic">"just withdrew $15.00 instantly. Easiest side cash!"</p>
                                    <p className="text-white/40 text-[9px] font-bold mt-1">— Elena R. (Panelist)</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Arrow / Title Section */}
                    <div className="inline-flex items-center justify-center p-2.5 rounded-2xl bg-white/10 border border-white/20 mb-4">
                        <ArrowRight className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-white mb-3 tracking-tight leading-snug">
                        Your Opinion <span style={{ color: '#4FD1E8' }}>Actually Matters</span>
                    </h2>
                    <p className="text-white/60 text-sm leading-relaxed max-w-xs">
                        Join the global community contributing to the world's leading brands.
                    </p>

                    {/* Glass feature pills */}
                    <div className="mt-8 space-y-2 w-full max-w-xs">
                        {['✓ Free to join — no hidden fees', '✓ Get paid within 24 hours', '✓ 50,000+ active panelists'].map(item => (
                            <div key={item} className="px-4 py-2 rounded-xl text-xs font-semibold text-white/80 text-center"
                                style={{
                                    backdropFilter: 'blur(10px)',
                                    WebkitBackdropFilter: 'blur(10px)',
                                    background: 'rgba(255,255,255,0.08)',
                                    border: '1px solid rgba(255,255,255,0.15)',
                                }}>
                                {item}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
