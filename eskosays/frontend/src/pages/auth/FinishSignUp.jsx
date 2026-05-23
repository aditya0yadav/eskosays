import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, RefreshCw, AlertCircle } from 'lucide-react';
import { auth } from '../../config/firebase';
import { isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import api from '../../services/api';
import { collectFingerprint } from '../../utils/fingerprint';

/**
 * FinishSignUp
 * This page handles the Firebase magic link callback.
 * Firebase redirects here after the user clicks the sign-in link in their email.
 */
const FinishSignUp = () => {
    const [status, setStatus] = useState('verifying'); // 'verifying' | 'success' | 'error' | 'needEmail'
    const [errorMsg, setErrorMsg] = useState('');
    const [manualEmail, setManualEmail] = useState('');

    const completeSignIn = async (email) => {
        try {
            // Sign in with the magic link — this also marks emailVerified: true
            const result = await signInWithEmailLink(auth, email, window.location.href);

            // Clean up localStorage
            window.localStorage.removeItem('emailForSignIn');
            window.localStorage.removeItem('displayNameForSignIn');

            // Sync with backend — non-blocking, don't let a server error stop the user
            try {
                const idToken = await result.user.getIdToken();
                const deviceFingerprint = await collectFingerprint();
                const response = await api.post('/auth/firebase', { idToken, deviceFingerprint });
                if (response.data.success) {
                    const { user, accessToken, refreshToken } = response.data;
                    localStorage.setItem('accessToken', accessToken);
                    localStorage.setItem('refreshToken', refreshToken);
                    localStorage.setItem('user', JSON.stringify(user));
                }
            } catch (backendErr) {
                // Backend unreachable — tokens will sync on next login
                console.warn('Backend sync failed (non-fatal):', backendErr.message);
            }

            // Email is verified — always proceed to onboarding
            setStatus('success');
            setTimeout(() => { window.location.href = '/onboarding'; }, 1500);
        } catch (err) {
            console.error('FinishSignUp error:', err);
            if (err.code === 'auth/invalid-action-code' || err.code === 'auth/expired-action-code') {
                setErrorMsg('This link has expired or already been used. Please sign up again.');
            } else if (err.code === 'auth/invalid-email') {
                setErrorMsg('email mismatch. Please enter the email you used to sign up.');
                setStatus('needEmail');
                return;
            } else {
                setErrorMsg(err.message || 'Verification failed. Please try again.');
            }
            setStatus('error');
        }
    };

    useEffect(() => {
        if (!isSignInWithEmailLink(auth, window.location.href)) {
            setErrorMsg('Invalid or missing sign-in link. Please sign up again.');
            setStatus('error');
            return;
        }

        // Try to get email from localStorage (same device)
        const savedEmail = window.localStorage.getItem('emailForSignIn');
        if (savedEmail) {
            completeSignIn(savedEmail);
        } else {
            // User opened the link on a different device — ask for email
            setStatus('needEmail');
        }
    }, []);

    const handleManualSubmit = (e) => {
        e.preventDefault();
        setStatus('verifying');
        completeSignIn(manualEmail);
    };

    // ── States ────────────────────────────────────────────────────────────────
    if (status === 'verifying') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#5B6CFF] to-[#4FD1E8] rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                        <RefreshCw className="w-8 h-8 text-white animate-spin" />
                    </div>
                    <h2 className="text-xl font-bold text-[#0F1E3A]">Verifying your email…</h2>
                    <p className="text-gray-500 text-sm">Just a moment, completing your sign-in.</p>
                </div>
            </div>
        );
    }

    if (status === 'success') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                        <ShieldCheck className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-[#0F1E3A]">email verified!</h2>
                    <p className="text-gray-500 text-sm">Redirecting you to complete your profile…</p>
                </div>
            </div>
        );
    }

    if (status === 'needEmail') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white p-6">
                <div className="max-w-md w-full text-center space-y-6">
                    <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto">
                        <AlertCircle className="w-8 h-8 text-amber-500" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-[#0F1E3A] mb-2">Confirm your email</h2>
                        <p className="text-gray-500 text-sm">It looks like you opened this link on a different device. Please enter the email you used to sign up.</p>
                    </div>
                    <form onSubmit={handleManualSubmit} className="space-y-4">
                        <input
                            type="email"
                            placeholder="Your email address"
                            className="w-full h-14 px-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#5B6CFF]/20 focus:bg-white transition-all text-center"
                            value={manualEmail}
                            onChange={(e) => setManualEmail(e.target.value)}
                            required
                        />
                        <button
                            type="submit"
                            className="w-full h-14 bg-gradient-to-r from-[#5B6CFF] to-[#4FD1E8] text-white font-bold rounded-2xl hover:shadow-lg transition-all"
                        >
                            Confirm & Sign In
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // error state
    return (
        <div className="min-h-screen flex items-center justify-center bg-white p-6">
            <div className="max-w-md w-full text-center space-y-6">
                <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-[#0F1E3A] mb-2">Verification failed</h2>
                    <p className="text-gray-500 text-sm">{errorMsg}</p>
                </div>
                <Link
                    to="/signup"
                    className="block w-full h-12 bg-gradient-to-r from-[#5B6CFF] to-[#4FD1E8] text-white font-bold rounded-2xl hover:shadow-lg transition-all flex items-center justify-center"
                >
                    Back to Sign Up
                </Link>
            </div>
        </div>
    );
};

export default FinishSignUp;
