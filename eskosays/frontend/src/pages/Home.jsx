import React from 'react';
import Hero from '../components/home/Hero';
import EarnMoneySection from '../components/home/EarnMoneySection';
import RewardsSlider from '../components/home/RewardsSlider';

const Home = () => {
    return (
        <div className="min-h-screen bg-white">
            <Hero />
            <EarnMoneySection />
            <RewardsSlider />
        </div >
    );
};

export default Home;
