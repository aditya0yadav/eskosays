import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo.png';
import footerLogo from '../../assets/logo foot.png';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="text-white pt-16 pb-8 border-t border-white/5 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #0022FF 0%, #0F1E3A 60%, #0F1E3A 100%)' }}>
            {/* Constellation accent */}
            <svg className="absolute inset-0 w-full h-full opacity-[0.06] pointer-events-none" viewBox="0 0 1200 400" preserveAspectRatio="xMidYMid slice">
                {[[100,80],[280,40],[480,100],[700,60],[900,100],[1100,50],[200,200],[500,220],[800,200],[1050,220],[350,320],[650,300],[950,340]].map(([cx,cy], i) => (
                    <circle key={i} cx={cx} cy={cy} r="3" fill="white" />
                ))}
                {[[100,80,280,40],[280,40,480,100],[480,100,700,60],[700,60,900,100],[900,100,1100,50],[200,200,500,220],[500,220,800,200],[800,200,1050,220],[350,320,650,300],[650,300,950,340]].map(([x1,y1,x2,y2], i) => (
                    <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="white" strokeWidth="0.8" strokeDasharray="4 8" />
                ))}
            </svg>
            {/* Top gradient accent */}
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(79,209,232,0.6), transparent)' }} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-8 mb-16">

                    {/* Column 1: Company Info */}
                    <div className="space-y-6">
                        <Link to="/" className="flex items-center gap-2 group">
                            <img src={footerLogo} alt="Eskosays Logo" className="h-12 w-auto object-contain" />
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
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 group-hover:text-[#4FD1E8]">
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
