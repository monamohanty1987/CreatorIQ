import React, { useState, useEffect } from 'react';
import { getDealsHistory, getContractsHistory, getCampaignsHistory } from '../services/api';

function History({ creatorName }) {
  const [deals, setDeals] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('deals');

  useEffect(() => {
    loadHistory();
  }, [creatorName]);

  const loadHistory = async () => {
    try {
      const filter = creatorName || undefined;
      const [dealsData, contractsData, campaignsData] = await Promise.all([
        getDealsHistory(filter),
        getContractsHistory(filter),
        getCampaignsHistory(filter),
      ]);
      setDeals(dealsData);
      setContracts(contractsData);
      setCampaigns(campaignsData);
    } catch (err) {
      console.error('Error loading history:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div>Loading history...</div>;
  }

  return (
    <div className="history">
      <h2 style={{ marginBottom: '30px', color: '#0066cc' }}>📜 Analysis History</h2>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', borderBottom: '1px solid #e0e0e0' }}>
        <button
          onClick={() => setActiveTab('deals')}
          style={{
            padding: '10px 20px',
            background: activeTab === 'deals' ? '#0066cc' : 'transparent',
            color: activeTab === 'deals' ? 'white' : '#0066cc',
            border: 'none',
            cursor: 'pointer',
            borderRadius: '6px 6px 0 0',
            fontWeight: activeTab === 'deals' ? 'bold' : 'normal',
          }}
        >
          💰 Deals ({deals.length})
        </button>
        <button
          onClick={() => setActiveTab('contracts')}
          style={{
            padding: '10px 20px',
            background: activeTab === 'contracts' ? '#0066cc' : 'transparent',
            color: activeTab === 'contracts' ? 'white' : '#0066cc',
            border: 'none',
            cursor: 'pointer',
            borderRadius: '6px 6px 0 0',
            fontWeight: activeTab === 'contracts' ? 'bold' : 'normal',
          }}
        >
          ⚖️ Contracts ({contracts.length})
        </button>
        <button
          onClick={() => setActiveTab('campaigns')}
          style={{
            padding: '10px 20px',
            background: activeTab === 'campaigns' ? '#0066cc' : 'transparent',
            color: activeTab === 'campaigns' ? 'white' : '#0066cc',
            border: 'none',
            cursor: 'pointer',
            borderRadius: '6px 6px 0 0',
            fontWeight: activeTab === 'campaigns' ? 'bold' : 'normal',
          }}
        >
          📧 Campaigns ({campaigns.length})
        </button>
      </div>

      {activeTab === 'deals' && (
        <div>
          {deals.length === 0 ? (
            <p style={{ color: '#666' }}>No deals analyzed yet.</p>
          ) : (
            <div>
              {deals.map(deal => (
                <div key={deal.id} className="result-card" style={{ marginBottom: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ margin: '0 0 5px 0' }}>{deal.creator_name}</h4>
                      <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>
                        {deal.niche} • {deal.platform} • {deal.followers.toLocaleString()} followers
                      </p>
                    </div>
                    <div className={`verdict-badge ${deal.verdict.toLowerCase()}`}>
                      {deal.verdict === 'BELOW_MARKET' ? '⚠️ Below' : '✅ Good'}
                    </div>
                  </div>
                  <div style={{ marginTop: '10px', fontSize: '14px' }}>
                    <p>Offered: <strong>${deal.offered_rate}</strong> | Market: <strong>${deal.market_rate}</strong> | Gap: <strong style={{ color: deal.gap_usd < 0 ? '#d32f2f' : '#10b981' }}>${deal.gap_usd} ({deal.gap_pct}%)</strong></p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'contracts' && (
        <div>
          {contracts.length === 0 ? (
            <p style={{ color: '#666' }}>No contracts analyzed yet.</p>
          ) : (
            <div>
              {contracts.map(contract => (
                <div key={contract.id} className="result-card" style={{ marginBottom: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ margin: '0 0 5px 0' }}>{contract.brand_name}</h4>
                      <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>
                        {contract.creator_name}
                      </p>
                    </div>
                    <div className={`verdict-badge ${contract.verdict.toLowerCase()}`}>
                      {contract.verdict === 'REJECT' ? '🚫 Reject' : contract.verdict === 'NEGOTIATE' ? '⚠️ Negotiate' : '✅ Pass'}
                    </div>
                  </div>
                  <div style={{ marginTop: '10px', fontSize: '14px' }}>
                    <p>Health: <strong>{contract.health_score}/100</strong> | Red Flags: <strong>{contract.red_flags_count}</strong> | Critical: <strong style={{ color: '#d32f2f' }}>{contract.critical_flags_count}</strong></p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'campaigns' && (
        <div>
          {campaigns.length === 0 ? (
            <p style={{ color: '#666' }}>No campaigns generated yet.</p>
          ) : (
            <div>
              {campaigns.map(campaign => (
                <div key={campaign.id} className="result-card" style={{ marginBottom: '15px' }}>
                  <div>
                    <h4 style={{ margin: '0 0 5px 0' }}>{campaign.product_name}</h4>
                    <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#666' }}>
                      {campaign.creator_name} • ${campaign.product_price} • {campaign.product_type}
                    </p>
                  </div>
                  <div style={{ fontSize: '14px' }}>
                    <p>Emails Queued: <strong>{campaign.email_subjects ? campaign.email_subjects.length : 5}</strong></p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default History;
