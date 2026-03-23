import React, { useState, useEffect } from 'react';
import './App.css';
import Layout from './components/Layout';
import DashboardHome from './pages/DashboardHome';
import DealAnalyzer from './components/DealAnalyzer';
import ContractAnalyzer from './components/ContractAnalyzer';
import CampaignGenerator from './components/CampaignGenerator';
import ContentTypeAnalysis from './components/ContentTypeAnalysis';
import CommerceMomentTemplates from './components/CommerceMomentTemplates';
import TopicProductMatching from './components/TopicProductMatching';
import ContentCalendar from './components/ContentCalendar';
import ContentInsights from './components/ContentInsights';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import { healthCheck } from './services/api';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [apiStatus, setApiStatus] = useState('checking');
  const [creatorName, setCreatorName] = useState('');

  useEffect(() => {
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
        return <DashboardHome />;
      case 'deals':
        return <DealAnalyzer />;
      case 'contracts':
        return <ContractAnalyzer />;
      case 'campaigns':
        return <CampaignGenerator />;
      case 'content-analysis':
        return <ContentTypeAnalysis />;
      case 'commerce-templates':
        return <CommerceMomentTemplates />;
      case 'topic-matching':
        return <TopicProductMatching />;
      case 'content-calendar':
        return <ContentCalendar />;
      case 'content-insights':
        return <ContentInsights />;
      case 'dashboard':
        return <Dashboard creatorName={creatorName} />;
      case 'history':
        return <History creatorName={creatorName} />;
      default:
        return <DashboardHome />;
    }
  };

  return (
    <Layout
      currentPage={currentPage}
      onNavigate={setCurrentPage}
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
    >
      {renderPage()}
    </Layout>
  );
}

export default App;
