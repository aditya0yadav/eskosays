import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle } from 'lucide-react';
import earnImage from '../../assets/img1.png';

const EarnMoneySection = () => {
    return (
        <section className="py-12 md:py-20 px-4 md:px-8 bg-white relative overflow-hidden">
            <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

                {/* Image Side */}
                <div className="order-2 lg:order-1 w-full">
                    <img
                        src={earnImage}
                        alt="Earn Money with Eskosays"
                        className="w-full h-auto object-cover"
                    />
                </div>

                {/* Text Side */}
                <div className="order-1 lg:order-2 space-y-6 md:space-y-8">
                    <div className="space-y-4">
                        <span className="inline-block px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold uppercase tracking-wider">
                            Start Earning Today
                        </span>
                        <h2 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight">
                            Your Favorite Place <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                                To Earn Money
                            </span>
                        </h2>
                    </div>

                    <p className="text-base md:text-lg text-slate-600 leading-relaxed">
                        Turn your spare time into real cash. Whether you're on your daily commute or relaxing at home, Eskosays gives you the power to earn from anywhere. Join the community that pays you for your opinion.
                    </p>

                    <ul className="space-y-3 md:space-y-4">
                        {[
                            "High-paying surveys updated daily",
                            "Instant cashouts to your favorite wallets",
                            "Safe, secure, and transparent platform"
                        ].map((item, index) => (
                            <li key={index} className="flex items-center gap-3 text-slate-700 font-medium text-sm md:text-base">
                                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                    <CheckCircle className="w-4 h-4 text-blue-600" />
                                </div>
                                {item}
                            </li>
                        ))}
                    </ul>

                    <div className="pt-4">
                        <Link
                            to="/signup"
                            className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 md:px-8 md:py-4 rounded-full font-bold text-sm md:text-base transition-all hover:bg-blue-600 hover:shadow-lg hover:gap-4"
                        >
                            Start Earning Now
                            <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default EarnMoneySection;
