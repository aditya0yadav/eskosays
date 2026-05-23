import React from 'react';

const CookiePolicy = () => {
    return (
        <div className="py-20 lg:py-32 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold text-[#0F1E3A] mb-6 tracking-tight">Cookie Policy</h1>
                    <p className="text-gray-400 text-lg">Last Updated: February 4, 2026</p>
                </div>

                <div className="space-y-12 text-[#0F1E3A]/70 leading-relaxed text-lg">
                    <p>
                        Eskosays uses cookies and similar technologies to enhance your browsing experience and provide personalized survey matches. This policy explains what cookies are and how we use them.
                    </p>

                    <section>
                        <h2 className="text-2xl font-bold text-[#0F1E3A] mb-4">What are Cookies?</h2>
                        <p>
                            Cookies are small text files stored on your device when you visit a website. They help the website remember your preferences and recognize you during future sessions.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-[#0F1E3A] mb-4">How We Use Cookies</h2>
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-xl font-semibold mb-2">Essential Cookies</h3>
                                <p>Mandatory for the platform to function correctly. They manage your login session and security features.</p>
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold mb-2">Preference Cookies</h3>
                                <p>Allow us to remember your choices, such as your preferred language or region.</p>
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold mb-2">Performance & Analytics</h3>
                                <p>Help us understand how users navigate the platform so we can improve the layout and survey delivery.</p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-[#0F1E3A] mb-4">Managing Cookies</h2>
                        <p>
                            Most browsers allow you to control cookies through their settings. You can choose to block cookies or receive notification when a cookie is placed. Note that disabling essential cookies may impact your ability to use certain features of Eskosays.
                        </p>
                    </section>

                    <section className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                        <h2 className="text-2xl font-bold text-[#0F1E3A] mb-4">Consent</h2>
                        <p className="text-[#0F1E3A]/70">
                            By continuing to use our platform, you consent to our use of cookies as described in this policy.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default CookiePolicy;
