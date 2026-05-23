import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const RewardsSlider = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
        {
            id: 'paypal',
            title: 'PayPal',
            logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg',
            content: (
                <>
                    <p className="mb-4 hidden md:block">
                        PayPal is one of the world's leading payment platforms, and most of us have used it at some point, whether you're buying something on eBay, Amazon, or within your phone apps. This means you'll likely have many questions about how it works and how to use your PayPal cash. But wouldn't it be great to get some PayPal credit for free?
                    </p>
                    <p>
                        Earn free PayPal cash with <span className="font-bold text-slate-900">Eskosays</span>. Sign up, take surveys, and earn points convertible to cash. It's fast, easy, and rewarding.
                    </p>
                </>
            )
        },
        {
            id: 'amazon',
            title: 'Amazon',
            logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
            content: (
                <>
                    <p className="mb-4 hidden md:block">
                        Amazon is the go-to destination for almost anything you need, from daily essentials to tech gadgets. We all love the convenience of Prime delivery. But imagine filling up your cart and checking out without spending your own hard-earned money. That's the power of free Amazon Gift Cards.
                    </p>
                    <p>
                        Shop for free on Amazon with <span className="font-bold text-slate-900">Eskosays</span>. Share your feedback, earn points, and redeem them for Amazon Gift Cards. Your voice pays for your shopping!
                    </p>
                </>
            )
        }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 8000); // Auto-slide every 8 seconds

        return () => clearInterval(timer);
    }, [slides.length]);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    };

    return (
        <section className="py-12 md:py-20 bg-slate-50 overflow-hidden">
            <div className="max-w-6xl mx-auto px-0 md:px-8 relative">
                {/* Previous Button */}
                <button
                    onClick={prevSlide}
                    className="absolute left-2 md:-left-16 top-1/2 -translate-y-1/2 p-2 md:p-3 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all z-20 shadow-sm"
                    aria-label="Previous slide"
                >
                    <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
                </button>

                {/* Next Button */}
                <button
                    onClick={nextSlide}
                    className="absolute right-2 md:-right-16 top-1/2 -translate-y-1/2 p-2 md:p-3 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all z-20 shadow-sm"
                    aria-label="Next slide"
                >
                    <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                </button>

                {/* Main Content Box - Simplified */}
                <div className="bg-white md:rounded-[2rem] px-4 py-8 md:p-12 min-h-[300px] md:min-h-[250px] relative flex items-center justify-center border-y md:border border-slate-100 mx-0">

                    {/* Content */}
                    <div className="w-full transition-opacity duration-500 ease-in-out">
                        <div className="flex flex-col items-center text-center">
                            {/* Logo */}
                            <div className="h-10 md:h-16 mb-6 md:mb-8 flex items-center justify-center">
                                <img
                                    src={slides[currentSlide].logo}
                                    alt={slides[currentSlide].title}
                                    className="h-full w-auto object-contain"
                                />
                            </div>

                            {/* Text Content */}
                            <div className="text-slate-600 text-sm md:text-lg leading-relaxed max-w-3xl animate-fade-in">
                                {slides[currentSlide].content}
                            </div>
                        </div>
                    </div>

                    {/* Dots Indicator */}
                    <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
                        {slides.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentSlide(idx)}
                                className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full transition-all duration-300 ${currentSlide === idx
                                    ? 'bg-blue-600 w-4 md:w-6'
                                    : 'bg-slate-300 hover:bg-slate-400'
                                    }`}
                                aria-label={`Go to slide ${idx + 1}`}
                            />
                        ))}
                    </div>
                </div>

            </div>

            <style jsx>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.5s ease-out forwards;
                }
            `}</style>
        </section>
    );
};

export default RewardsSlider;
