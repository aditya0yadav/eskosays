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

    // Unverified email wall
    const [unverified, setUnverified] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [resendSent, setResendSent] = useState(false);

    // ── Google Sign-In (no email verification needed) ─────────────────────
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

            // ── Gate: email must be verified ─────────────────────────────────
            if (!firebaseUser.emailVerified) {
                setUnverified(true);
                setLoading(false);
                return;
            }

            // ── Sync verified user with backend ───────────────────────────────
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
            <div className="min-h-screen flex items-center justify-center bg-white p-6">
                <div className="max-w-md w-full text-center space-y-6">
                    <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center mx-auto">
                        <AlertCircle className="w-10 h-10 text-amber-500" />
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
                        <button
                            onClick={handleResendVerification}
                            disabled={resendLoading}
                            className="w-full h-14 bg-gradient-to-r from-[#5B6CFF] to-[#4FD1E8] text-white font-bold rounded-2xl hover:shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60"
                        >
                            {resendLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Resend verification email'}
                        </button>
                    )}

                    <button
                        onClick={() => { setUnverified(false); setResendSent(false); }}
                        className="text-sm text-gray-500 hover:text-[#5B6CFF] transition-colors"
                    >
                        ← Back to login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex bg-white">
            {/* Left Side: Visual Banner */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden items-center justify-center p-16">
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}
                />
                <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-cyan-400/10 rounded-full blur-3xl" />
                <div className="relative z-10 text-center max-w-md">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-blue-500/30">
                        <ShieldCheck className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-4xl font-bold text-white mb-4 tracking-tight leading-tight">
                        Secure <span className="text-cyan-400">Verified</span> Access
                    </h2>
                    <p className="text-slate-400 text-lg leading-relaxed">
                        Your account is protected with email verification on every sign-in.
                    </p>
                </div>
            </div>

            {/* Right Side: Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-20">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:text-left">
                        <Link to="/" className="inline-flex items-center mb-8 gap-3">
                            <img src={logo} alt="Eskosays" className="h-14 w-auto" />
                            <span className="text-black font-bold text-xl">Eskosays</span>
                        </Link>
                        <h1 className="text-3xl font-bold text-[#0F1E3A] tracking-tight">Welcome back</h1>
                        <p className="text-gray-500 mt-2">Sign in with your verified email to continue.</p>
                    </div>

                    {/* Google Sign-In */}
                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-200 rounded-2xl font-semibold text-[#0F1E3A] hover:bg-gray-50 transition-all active:scale-[0.98] disabled:opacity-60"
                    >
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                        Continue with Google
                    </button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-100" /></div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-4 text-gray-400 font-medium tracking-widest">Or sign in with email</span>
                        </div>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-[#5B6CFF] transition-colors" />
                            <input
                                type="email"
                                placeholder="email address"
                                className="w-full h-14 pl-12 pr-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#5B6CFF]/20 focus:bg-white transition-all"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-[#5B6CFF] transition-colors" />
                            <input
                                type="password"
                                placeholder="Password"
                                className="w-full h-14 pl-12 pr-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#5B6CFF]/20 focus:bg-white transition-all"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>

                        {error && (
                            <div className={`px-4 py-3 rounded-xl text-sm font-medium border ${error.includes('VPN')
                                ? 'bg-orange-50 border-orange-100 text-orange-700'
                                : 'bg-red-50 border-red-100 text-red-600'
                                }`}>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-14 bg-gradient-to-r from-[#5B6CFF] to-[#4FD1E8] text-white font-bold rounded-2xl hover:shadow-lg hover:shadow-blue-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60"
                        >
                            {loading ? (
                                <RefreshCw className="w-5 h-5 animate-spin" />
                            ) : (
                                <>Sign In <ArrowRight className="w-5 h-5" /></>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-gray-600 font-medium">
                        Don't have an account?{' '}
                        <Link to="/signup" className="text-[#5B6CFF] font-bold hover:underline">Sign up</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
