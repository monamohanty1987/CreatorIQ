import React, { useState, useEffect } from 'react';
import { getContentByTopic } from '../services/api';

const TopicProductMatching = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await getContentByTopic();
      setData(result.data || result);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error loading content by topic:', err);
    } finally {
      setLoading(false);
    }
  };

  const productSuggestions = {
    Tech: [
      { name: 'Gumroad', commission: '10-30%', desc: 'Digital course platform. Perfect for coding tutorials.' },
      { name: 'Udemy Affiliate', commission: '20%', desc: 'Course marketplace. High conversion.' },
      { name: 'Skillshare', commission: 'Flat rate', desc: 'Learning platform. Revenue share model.' },
      { name: 'GitHub Copilot', commission: 'Referral bonus', desc: 'AI code assistant. High-value product.' },
      { name: 'Notion Affiliate', commission: '10-15%', desc: 'Productivity tool. Great for developers.' }
    ],
    Finance: [
      { name: 'Interactive Brokers', commission: '25-50/sign-up', desc: 'Trading platform. Premium audience.' },
      { name: 'Stripe Affiliate', commission: 'Referral', desc: 'Payment processor. B2B angle.' },
      { name: 'Crypto Exchanges', commission: '10-30%', desc: 'Coinbase, Kraken. High value per user.' },
      { name: 'Booking.com', commission: '1-10%', desc: 'Travel booking. Travel finance content.' },
      { name: 'Premium Finance Tools', commission: 'Varies', desc: 'Bloomberg, TradingView subscriptions.' }
    ],
    Business: [
      { name: 'Shopify', commission: 'Recurring', desc: 'E-commerce. Continuous revenue.' },
      { name: 'HubSpot', commission: 'Referral bonus', desc: 'CRM platform. Sales-focused.' },
      { name: 'Stripe', commission: 'Referral', desc: 'Payments for businesses.' },
      { name: 'ConvertKit', commission: '30%', desc: 'Creator email platform.' },
      { name: 'Substack Pro', commission: 'Revenue share', desc: 'Newsletter platform.' }
    ],
    Fitness: [
      { name: 'Myprotein', commission: '12-15%', desc: 'Supplements. Great affiliate payouts.' },
      { name: 'Audible', commission: '10%', desc: 'Audiobooks for fitness journeys.' },
      { name: 'Fitbit/Garmin', commission: '5-8%', desc: 'Fitness trackers.' },
      { name: 'Lose It!', commission: 'Referral', desc: 'Diet tracking app.' },
      { name: 'Apple Fitness+', commission: 'Referral', desc: 'Fitness subscription.' }
    ],
    Productivity: [
      { name: 'Notion', commission: '10-15%', desc: 'Workspace tool. High conversion.' },
      { name: 'Todoist', commission: '10%', desc: 'Task management.' },
      { name: 'Zapier', commission: '30%', desc: 'Automation platform.' },
      { name: 'Calendly', commission: '10-20%', desc: 'Scheduling tool.' },
      { name: 'Asana/Monday.com', commission: 'Referral', desc: 'Project management.' }
    ],
    Education: [
      { name: 'Udemy', commission: '20%', desc: 'Online courses.' },
      { name: 'MasterClass', commission: '5-15%', desc: 'Premium learning.' },
      { name: 'Skillshare', commission: 'Revenue share', desc: 'Creative courses.' },
      { name: 'Coursera', commission: 'Affiliate', desc: 'University courses.' },
      { name: 'LinkedIn Learning', commission: '15%', desc: 'Professional development.' }
    ],
    Lifestyle: [
      { name: 'Amazon', commission: '5-10%', desc: 'Everything. Highest conversion.' },
      { name: 'Fashion Brands', commission: '10-20%', desc: 'ASOS, H&M, Shein.' },
      { name: 'Home Decor', commission: '8-15%', desc: 'Wayfair, Etsy.' },
      { name: 'Travel', commission: '5-10%', desc: 'Booking.com, Airbnb.' },
      { name: 'Furniture', commission: '12-15%', desc: 'Article, West Elm, etc.' }
    ]
  };

  if (loading) return <div className="loading">🎯 Analyzing topics...</div>;
  if (error) return <div className="error">❌ Error: {error}</div>;
  if (!data) return <div className="error">No data available</div>;

  const stats = data.by_topic || data;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>🎯 Topic → Product Matching</h1>
        <p>Best affiliate products for each content topic</p>
      </div>

      <div className="topics-grid">
        {stats.map((stat) => (
          <div key={stat.topic} className="topic-card">
            <div className="topic-header">
              <h3>{stat.topic}</h3>
              <span className="revenue-badge">${(stat.avg_revenue || 0).toLocaleString()}</span>
            </div>

            <p className="topic-count">{stat.count} videos in this topic</p>

            <div className="products-list">
              <h4>📦 Recommended Products:</h4>
              {productSuggestions[stat.topic] ? (
                <ul>
                  {productSuggestions[stat.topic].map((product, idx) => (
                    <li key={idx}>
                      <strong>{product.name}</strong>
                      <span className="commission">{product.commission}</span>
                      <p className="product-desc">{product.desc}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="fallback">General affiliate products available</p>
              )}
            </div>

            <div className="action-buttons">
              <button className="btn-secondary">💰 Get Affiliate Links</button>
              <button className="btn-secondary">📋 Draft Promotion</button>
            </div>
          </div>
        ))}
      </div>

      <div className="strategy-section">
        <h2>💡 Matching Strategy</h2>
        <table className="strategy-table">
          <thead>
            <tr>
              <th>Topic</th>
              <th>Best Product Type</th>
              <th>Commission Range</th>
              <th>Strategy</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Tech</strong></td>
              <td>Courses, Software, Tools</td>
              <td>10-30%</td>
              <td>Recommend in tutorials. High intent buyers.</td>
            </tr>
            <tr>
              <td><strong>Finance</strong></td>
              <td>Brokers, Investment Tools</td>
              <td>$25-50/signup</td>
              <td>Per-signup bonus. Premium audience.</td>
            </tr>
            <tr>
              <td><strong>Business</strong></td>
              <td>SaaS, E-commerce Tools</td>
              <td>Recurring</td>
              <td>Recurring revenue. MRR growth.</td>
            </tr>
            <tr>
              <td><strong>Fitness</strong></td>
              <td>Supplements, Gear</td>
              <td>12-15%</td>
              <td>Physical products. Higher AOV.</td>
            </tr>
            <tr>
              <td><strong>Lifestyle</strong></td>
              <td>General Retail</td>
              <td>5-10%</td>
              <td>Amazon Associates. Highest conversion.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="quick-wins">
        <h2>🚀 Quick Wins</h2>
        <ul className="wins-list">
          <li>📊 <strong>Highest Commission:</strong> Finance products pay $25-50 per signup</li>
          <li>🔄 <strong>Best Recurring:</strong> SaaS tools (Stripe, Shopify) = passive income</li>
          <li>📈 <strong>Highest Conversion:</strong> Amazon Associates (5-10% across all topics)</li>
          <li>💎 <strong>Premium Angle:</strong> Finance & Tech audiences have higher purchase power</li>
          <li>🎯 <strong>Matching Rule:</strong> Only recommend products you actually use</li>
        </ul>
      </div>
    </div>
  );
};

export default TopicProductMatching;
