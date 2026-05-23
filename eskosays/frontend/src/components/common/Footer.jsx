import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo.png';
import footerLogo from '../../assets/logo foot.png';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-[#0F1E3A] text-white pt-16 pb-8 border-t border-white/5 relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-[#5B6CFF]/20 to-transparent" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-8 mb-16">

                    {/* Column 1: Company Info */}
                    <div className="space-y-6">
                        <Link to="/" className="flex items-center gap-2 group">
                            <img src={footerLogo} alt="Eskosays Logo" className="h-24 w-auto" />
                        </Link>
                        <p className="text-gray-400 leading-relaxed text-[15px] max-w-xs">
                            <span className="text-white font-semibold">Eskosays</span> is a premier market research platform connecting voices globally. We empower individuals to monetize their time through meaningful surveys while helping organizations gain verified, actionable insights.
                        </p>
                    </div>

                    {/* Column 2: Legal & Support */}
                    <div>
                        <h4 className="text-lg font-semibold mb-6 text-white/90">Legal & Support</h4>
                        <ul className="space-y-4">
                            {[
                                { label: 'Terms of Service', path: '/terms-of-service' },
                                { label: 'Privacy Policy', path: '/privacy-policy' },
                                { label: 'Cookie Policy', path: '/cookie-policy' },
                                { label: 'FAQs', path: '/faqs' }
                            ].map((item) => (
                                <li key={item.label}>
                                    <Link
                                        to={item.path}
                                        className="text-gray-400 hover:text-[#4FD1E8] transition-colors duration-200 text-base"
                                    >
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 3: Contact */}
                    <div className="space-y-6">
                        <h4 className="text-lg font-semibold mb-2 text-white/90">Contact Us</h4>
                        <div className="space-y-4">
                            <a
                                href="mailto:support@eskosays.com"
                                className="flex items-center gap-3 text-gray-400 hover:text-[#4FD1E8] transition-all duration-200 group"
                            >
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-[#5B6CFF]/10 group-hover:text-[#4FD1E8]">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <span className="text-base font-medium">support@eskosays.com</span>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-500 text-sm">
                    <p>© {currentYear} Eskosays. All rights reserved.</p>
                    <div className="flex gap-8">
                        <Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <Link to="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
