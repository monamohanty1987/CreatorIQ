import React, { useState, useEffect, Suspense, lazy } from 'react';
import './App.css';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import CookieConsentBanner from './components/CookieConsentBanner';
import { healthCheck } from './services/api';

// ===== LAZY LOADED COMPONENTS =====
// These are loaded only when needed, not on initial page load
// Reduces initial bundle size by ~75%

// Heavy feature components - loaded on demand
const DealAnalyzer = lazy(() => import('./components/DealAnalyzer'));
const ContractAnalyzer = lazy(() => import('./components/ContractAnalyzer'));
const CampaignGenerator = lazy(() => import('./components/CampaignGenerator'));
const ContentTypeAnalysis = lazy(() => import('./components/ContentTypeAnalysis'));
const AICommerceScripts = lazy(() => import('./components/AICommerceScripts'));
const TopicProductMatching = lazy(() => import('./components/TopicProductMatching'));
const ContentCalendar = lazy(() => import('./components/ContentCalendar'));
const ContentInsights = lazy(() => import('./components/ContentInsights'));
const ContentRepurposerAI = lazy(() => import('./components/ContentRepurposerAI'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const History = lazy(() => import('./pages/History'));
const DashboardHome = lazy(() => import('./pages/DashboardHome'));

// Footer pages - loaded on demand
const Privacy = lazy(() => import('./pages/Privacy'));
const DPA = lazy(() => import('./pages/DPA'));
const TermsOfUse = lazy(() => import('./pages/TermsOfUse'));
const TermsAndConditions = lazy(() => import('./pages/TermsAndConditions'));
const Security = lazy(() => import('./pages/Security'));
const Company = lazy(() => import('./pages/Company'));
const Careers = lazy(() => import('./pages/Careers'));
const Newsroom = lazy(() => import('./pages/Newsroom'));
const ContactUs = lazy(() => import('./pages/ContactUs'));

// Loading fallback component
const LoadingFallback = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: '#F9F7F4'
  }}>
    <div style={{
      textAlign: 'center',
      padding: '2rem'
    }}>
      <div style={{
        fontSize: '48px',
        marginBottom: '1rem'
      }}>⏳</div>
      <p style={{
        color: '#6B7280',
        fontSize: '16px',
        fontWeight: '500'
      }}>Loading...</p>
    </div>
  </div>
);

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [apiStatus, setApiStatus] = useState('checking');
  const [creatorName, setCreatorName] = useState('');

  useEffect(() => {
    // Read page from URL on load
    const params = new URLSearchParams(window.location.search);
    const page = params.get('page');
    if (page) {
      setCurrentPage(page);
    }

    checkApiHealth();
    const interval = setInterval(checkApiHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkApiHealth = async () => {
    const status = await healthCheck();
    setApiStatus(status.status === 'healthy' ? 'online' : 'offline');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <LandingPage onNavigate={handleNavigate} />;
      case 'deals':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <DealAnalyzer onNavigate={handleNavigate} />
          </Suspense>
        );
      case 'contracts':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <ContractAnalyzer />
          </Suspense>
        );
      case 'campaigns':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <CampaignGenerator />
          </Suspense>
        );
      case 'content-analysis':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <ContentTypeAnalysis />
          </Suspense>
        );
      case 'commerce-templates':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <AICommerceScripts onNavigate={handleNavigate} />
          </Suspense>
        );
      case 'topic-matching':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <TopicProductMatching />
          </Suspense>
        );
      case 'content-calendar':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <ContentCalendar />
          </Suspense>
        );
      case 'content-insights':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <ContentInsights />
          </Suspense>
        );
      case 'content-repurpose':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <ContentRepurposerAI onNavigate={handleNavigate} />
          </Suspense>
        );
      case 'dashboard':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <Dashboard creatorName={creatorName} />
          </Suspense>
        );
      case 'history':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <History creatorName={creatorName} />
          </Suspense>
        );
      case 'privacy':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <Privacy onNavigate={handleNavigate} />
          </Suspense>
        );
      case 'dpa':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <DPA onNavigate={handleNavigate} />
          </Suspense>
        );
      case 'terms-of-use':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <TermsOfUse onNavigate={handleNavigate} />
          </Suspense>
        );
      case 'terms-and-conditions':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <TermsAndConditions onNavigate={handleNavigate} />
          </Suspense>
        );
      case 'security':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <Security onNavigate={handleNavigate} />
          </Suspense>
        );
      case 'company':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <Company onNavigate={handleNavigate} />
          </Suspense>
        );
      case 'careers':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <Careers onNavigate={handleNavigate} />
          </Suspense>
        );
      case 'newsroom':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <Newsroom onNavigate={handleNavigate} />
          </Suspense>
        );
      case 'contact-us':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <ContactUs onNavigate={handleNavigate} />
          </Suspense>
        );
      default:
        return <LandingPage onNavigate={handleNavigate} />;
    }
  };

  const handleNavigate = (page) => {
    setCurrentPage(page);
    // Update URL to persist page selection
    window.history.pushState({}, '', `?page=${page}`);
  };

  // Don't wrap LandingPage in Layout
  if (currentPage === 'home') {
    return (
      <>
        <CookieConsentBanner />
        {renderPage()}
      </>
    );
  }

  return (
    <>
      <CookieConsentBanner />
      <Layout
        currentPage={currentPage}
        onNavigate={handleNavigate}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      >
        {renderPage()}
      </Layout>
    </>
  );
}

export default App;
