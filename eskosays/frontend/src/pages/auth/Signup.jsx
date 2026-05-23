import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, User, ShieldCheck, RefreshCw, MailCheck } from 'lucide-react';
import { auth, googleProvider } from '../../config/firebase';
import { createUserWithEmailAndPassword, updateProfile, sendSignInLinkToEmail, signInWithPopup } from 'firebase/auth';
import api from '../../services/api';
import { collectFingerprint } from '../../utils/fingerprint';
import logo from '../../assets/logo.png';

// Where Firebase redirects after the user clicks the magic link
const ACTION_URL = `${window.location.origin}/finish-signup`;

const Signup = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [agreed, setAgreed] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    // ── Google Sign-Up (already verified by Google) ───────────────────────────
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

    // ── Email + Password Sign-Up ───────────────────────────────────────────────
    const handleSignup = async (e) => {
        e.preventDefault();
        if (!agreed) { setError('Please agree to the Terms of Service and Privacy Policy.'); return; }
        setError('');
        setLoading(true);

        try {
            // 1. Create the Firebase account (so they have a password for future logins)
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(userCredential.user, { displayName: name });

            // 2. Send magic link for one-time email verification
            await sendSignInLinkToEmail(auth, email, {
                url: ACTION_URL,
                handleCodeInApp: true,
            });

            // 3. Save email locally so /finish-signup can auto-fill it
            window.localStorage.setItem('emailForSignIn', email);
            window.localStorage.setItem('displayNameForSignIn', name);

            // 4. Pre-create the user on backend (non-blocking)
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

    // ── "Check your email" confirmation screen ────────────────────────────────
    if (emailSent) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white p-6">
                <div className="max-w-md w-full text-center space-y-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-[#5B6CFF] to-[#4FD1E8] rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-blue-500/25">
                        <MailCheck className="w-10 h-10 text-white" />
                    </div>

                    <div>
                        <h1 className="text-2xl font-bold text-[#0F1E3A] mb-2">Check your inbox</h1>
                        <p className="text-gray-500 leading-relaxed">
                            We sent a sign-in link to<br />
                            <span className="font-semibold text-[#0F1E3A]">{email}</span>
                            <br /><br />
                            Click the link in that email to verify your account and complete sign-up. The link is valid for 1 hour.
                        </p>
                    </div>

                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-left space-y-2">
                        <p className="text-sm font-semibold text-[#0F1E3A]">☑ What to do next</p>
                        <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                            <li>Open your email inbox</li>
                            <li>Click the verification link from Eskosays</li>
                            <li>You'll be signed in automatically</li>
                        </ol>
                    </div>

                    <Link
                        to="/login"
                        className="block w-full h-12 bg-gradient-to-r from-[#5B6CFF] to-[#4FD1E8] text-white font-bold rounded-2xl hover:shadow-lg transition-all flex items-center justify-center"
                    >
                        Go to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex bg-white">
            {/* Left: Signup Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-20">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:text-left">
                        <Link to="/" className="inline-flex items-center mb-8 gap-3">
                                <img src={logo} alt="Eskosays Logo" className="h-14 w-auto" />
                            <span className="text-black font-bold text-xl">Eskosays</span>
                        </Link>
                        <h1 className="text-3xl font-bold text-[#0F1E3A] tracking-tight">Create Account</h1>
                        <p className="text-gray-500 mt-2">Join our global community and start earning.</p>
                    </div>

                    {/* Google Sign-Up */}
                    <button
                        type="button"
                        onClick={handleGoogleSignup}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-200 rounded-2xl font-semibold text-[#0F1E3A] hover:bg-gray-50 transition-all active:scale-[0.98] disabled:opacity-60"
                    >
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                        Continue with Google
                    </button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-100" /></div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-4 text-gray-400 font-medium tracking-widest">Or register with email</span>
                        </div>
                    </div>

                    <form onSubmit={handleSignup} className="space-y-5">
                        <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-[#5B6CFF] transition-colors" />
                            <input
                                type="text"
                                placeholder="Full Name"
                                className="w-full h-14 pl-12 pr-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#5B6CFF]/20 focus:bg-white transition-all"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>

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
                                placeholder="Create Password (min 6 chars)"
                                className="w-full h-14 pl-12 pr-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#5B6CFF]/20 focus:bg-white transition-all"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                disabled={loading}
                            />
                        </div>

                        <div className="flex items-start gap-3">
                            <input
                                type="checkbox"
                                id="terms"
                                className="mt-1 w-4 h-4 rounded border-gray-300 text-[#5B6CFF]"
                                checked={agreed}
                                onChange={(e) => setAgreed(e.target.checked)}
                            />
                            <label htmlFor="terms" className="text-sm text-gray-500 leading-relaxed">
                                I agree to the{' '}
                                <Link to="/terms-of-service" className="text-[#5B6CFF] font-semibold hover:underline">Terms of Service</Link>
                                {' '}and{' '}
                                <Link to="/privacy-policy" className="text-[#5B6CFF] font-semibold hover:underline">Privacy Policy</Link>.
                            </label>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-14 bg-gradient-to-r from-[#5B6CFF] to-[#4FD1E8] text-white font-bold rounded-2xl hover:shadow-lg hover:shadow-blue-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60"
                        >
                            {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <><ShieldCheck className="w-5 h-5" /> Create Account</>}
                        </button>
                    </form>

                    <p className="text-center text-gray-600 font-medium">
                        Already have an account?{' '}
                        <Link to="/login" className="text-[#5B6CFF] font-bold hover:underline">Log in</Link>
                    </p>
                </div>
            </div>

            {/* Right: Visual Banner */}
            <div className="hidden lg:flex lg:w-1/2 bg-[#0F1E3A] relative overflow-hidden items-center justify-center p-20">
                <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#5B6CFF]/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#4FD1E8]/10 rounded-full blur-[120px]" />
                <div className="relative z-10 text-center max-w-md">
                    <h2 className="text-5xl font-bold text-white mb-6 tracking-tight leading-[1.1]">
                        Your Opinion <br />
                        <span className="text-cyan-400">Actually Matters</span>
                    </h2>
                    <p className="text-blue-100/60 text-xl max-w-sm mx-auto leading-relaxed font-medium">
                        Join the global community contributing to the world's leading brands.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Signup;
