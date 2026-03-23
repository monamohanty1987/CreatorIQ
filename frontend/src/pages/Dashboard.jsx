import React, { useState, useEffect } from 'react';
import { getAllHistory } from '../services/api';

function Dashboard({ creatorName }) {
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, [creatorName]);

  const loadHistory = async () => {
    try {
      const data = await getAllHistory(creatorName || undefined);
      setHistory(data);
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div>Loading...</div>;
  }

  if (!history) {
    return <div className="error">Failed to load dashboard</div>;
  }

  return (
    <div className="dashboard">
      <h2 style={{ marginBottom: '30px', color: '#0066cc' }}>📊 Dashboard</h2>

      <div className="result-grid">
        <div className="result-item">
          <div className="result-item-label">Total Deals Analyzed</div>
          <div className="result-item-value">{history.summary.total_deals_analyzed}</div>
        </div>
        <div className="result-item">
          <div className="result-item-label">Total Contracts Reviewed</div>
          <div className="result-item-value">{history.summary.total_contracts_reviewed}</div>
        </div>
        <div className="result-item">
          <div className="result-item-label">Total Campaigns Created</div>
          <div className="result-item-value">{history.summary.total_campaigns_created}</div>
        </div>
      </div>

      <div style={{ marginTop: '40px' }}>
        <h3 style={{ marginBottom: '20px', color: '#333' }}>Recent Analyses</h3>

        {history.deals && history.deals.length > 0 && (
          <div style={{ marginBottom: '30px' }}>
            <h4 style={{ marginBottom: '12px', color: '#0066cc' }}>💰 Recent Deals</h4>
            {history.deals.map(deal => (
              <div key={deal.id} className="result-card" style={{ marginBottom: '12px' }}>
                <p><strong>{deal.creator_name}</strong> - {deal.niche} on {deal.platform}</p>
                <p>Offered: ${deal.offered_rate} | Market: ${deal.market_rate} | Verdict: {deal.verdict}</p>
              </div>
            ))}
          </div>
        )}

        {history.contracts && history.contracts.length > 0 && (
          <div style={{ marginBottom: '30px' }}>
            <h4 style={{ marginBottom: '12px', color: '#0066cc' }}>⚖️ Recent Contracts</h4>
            {history.contracts.map(contract => (
              <div key={contract.id} className="result-card" style={{ marginBottom: '12px' }}>
                <p><strong>{contract.brand_name}</strong> - {contract.creator_name}</p>
                <p>Health Score: {contract.health_score}/100 | Red Flags: {contract.red_flags_count} | Verdict: {contract.verdict}</p>
              </div>
            ))}
          </div>
        )}

        {history.campaigns && history.campaigns.length > 0 && (
          <div>
            <h4 style={{ marginBottom: '12px', color: '#0066cc' }}>📧 Recent Campaigns</h4>
            {history.campaigns.map(campaign => (
              <div key={campaign.id} className="result-card" style={{ marginBottom: '12px' }}>
                <p><strong>{campaign.product_name}</strong> - ${campaign.product_price}</p>
                <p>{campaign.creator_name} | {campaign.emails_queued} emails queued</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
