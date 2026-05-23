import React from 'react';
import { Routes, Route } from 'react-router-dom';
import RootLayout from '../layouts/RootLayout';
import Home from '../pages/Home';
import ScrollToTop from '../components/common/ScrollToTop';

// Legal Pages
import TermsOfService from '../pages/legal/TermsOfService';
import PrivacyPolicy from '../pages/legal/PrivacyPolicy';
import CookiePolicy from '../pages/legal/CookiePolicy';

// Auth Pages
import Login from '../pages/auth/Login';
import Signup from '../pages/auth/Signup';
import FinishSignUp from '../pages/auth/FinishSignUp';
import Onboarding from '../pages/onboarding/Onboarding';
import Dashboard from '../pages/dashboard/Dashboard';
import SurveyStatus from '../pages/survey/SurveyStatus';

// Info Pages
import ResearchPanels from '../pages/info/ResearchPanels';
import FAQ from '../pages/info/FAQ';
import AboutUs from '../pages/info/AboutUs';

// Admin Pages
import QualificationMapping from '../pages/admin/QualificationMapping';
import AdminLogin from '../pages/admin/AdminLogin';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminLayout from '../pages/admin/AdminLayout';
import AdminAnalytics from '../pages/admin/AdminAnalytics';
import AdminUsers from '../pages/admin/AdminUsers';
import AdminPanelAnalytics from '../pages/admin/AdminPanelAnalytics';
import AdminUserDetails from '../pages/admin/AdminUserDetails';
import AdminProviderFilter from '../pages/admin/AdminProviderFilter';
import AdminBlogList from '../pages/admin/AdminBlogList';
import AdminBlogEditor from '../pages/admin/AdminBlogEditor';

// Blog Pages
import BlogList from '../pages/blog/BlogList';
import BlogDetail from '../pages/blog/BlogDetail';

import { Navigate } from 'react-router-dom';

const AppRoutes = () => {
    return (
        <>
            <ScrollToTop />
            <Routes>
                {/* Auth Routes (Standalone) */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/finish-signup" element={<FinishSignUp />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/survey-status" element={<SurveyStatus />} />
                <Route path="/admin/login" element={<AdminLogin />} />

                <Route path="/" element={<RootLayout />}>
                    <Route index element={<Home />} />

                    {/* Information Routes */}
                    <Route path="research-panels" element={<ResearchPanels />} />
                    <Route path="faqs" element={<FAQ />} />
                    <Route path="about-us" element={<AboutUs />} />

                    {/* Legal Routes */}
                    <Route path="terms-of-service" element={<TermsOfService />} />
                    <Route path="privacy-policy" element={<PrivacyPolicy />} />
                    <Route path="cookie-policy" element={<CookiePolicy />} />

                    {/* Blog Routes */}
                    <Route path="blog" element={<BlogList />} />
                    <Route path="blog/:slug" element={<BlogDetail />} />
                </Route>

                {/* Admin Routes with Layout */}
                <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<Navigate to="/admin/dashboard" replace />} />
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="analytics" element={<AdminAnalytics />} />
                    <Route path="panels" element={<AdminPanelAnalytics />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="users/:id" element={<AdminUserDetails />} />
                    <Route path="mappings" element={<QualificationMapping />} />
                    <Route path="filter" element={<AdminProviderFilter />} />
                    <Route path="blogs" element={<AdminBlogList />} />
                    <Route path="blogs/new" element={<AdminBlogEditor />} />
                    <Route path="blogs/:id/edit" element={<AdminBlogEditor />} />
                </Route>
            </Routes>
        </>
    );
};

export default AppRoutes;
