import React from 'react';

const TermsOfService = () => {
    return (
        <div className="py-20 lg:py-32 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold text-[#0F1E3A] mb-6 tracking-tight">Terms of Service</h1>
                    <p className="text-gray-400 text-lg">Last Updated: February 4, 2026</p>
                </div>

                <div className="space-y-12 text-[#0F1E3A]/70 leading-relaxed text-lg">
                    <section>
                        <h2 className="text-2xl font-bold text-[#0F1E3A] mb-4">1. Acceptance of Terms</h2>
                        <p>
                            By accessing and using Eskosays ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services. We reserve the right to modify these terms at any time.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-[#0F1E3A] mb-4">2. Eligibility</h2>
                        <p>
                            You must be at least 18 years old to create an account on Eskosays. By creating an account, you represent and warrant that you meet this age requirement and that all information you provide is accurate and complete.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-[#0F1E3A] mb-4">3. User Accounts</h2>
                        <p>
                            You are responsible for maintaining the confidentiality of your account credentials. Any activity occurring under your account is your sole responsibility. Multiple accounts for a single user are strictly prohibited and may result in permanent suspension.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-[#0F1E3A] mb-4">4. Participation and Rewards</h2>
                        <p>
                            Eskosays provides opportunities to participate in market research surveys. Completion of these surveys may earn you rewards. We reserve the right to verify survey completion and may withhold rewards if we detect fraudulent activity or inconsistent responses.
                        </p>
                        <ul className="list-disc pl-6 mt-4 space-y-2">
                            <li>Rewards are non-transferable.</li>
                            <li>Payout thresholds must be met before withdrawal.</li>
                            <li>Survey availability depends on demographic requirements.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-[#0F1E3A] mb-4">5. Prohibited Conduct</h2>
                        <p>
                            Users may not use automated systems, bots, or any form of "screen scraping" on the Platform. Providing false information or attempting to manipulate survey results will lead to immediate account termination and forfeiture of earned rewards.
                        </p>
                    </section>

                    <section className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                        <h2 className="text-2xl font-bold text-[#0F1E3A] mb-4">6. Contact Information</h2>
                        <p className="text-[#0F1E3A]/70">
                            If you have any questions regarding these Terms of Service, please contact our support team at:
                        </p>
                        <p className="font-semibold text-[#5B6CFF] mt-2">support@eskosays.com</p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default TermsOfService;
