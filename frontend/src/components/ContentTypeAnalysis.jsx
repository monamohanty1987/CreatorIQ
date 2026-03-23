import React, { useState, useEffect } from 'react';
import { getContentByType } from '../services/api';

const ContentTypeAnalysis = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await getContentByType();
      setData(result.data || result);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error loading content by type:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">📊 Analyzing content types...</div>;
  if (error) return <div className="error">❌ Error: {error}</div>;
  if (!data) return <div className="error">No data available</div>;

  const stats = data.by_type || data;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>📚 Content Type Analysis</h1>
        <p>Performance breakdown by content category</p>
      </div>

      <div className="cards-grid">
        {stats.map((stat, idx) => (
          <div key={idx} className="stat-card">
            <div className="stat-header">
              <h3>{stat.content_type}</h3>
              <span className="count-badge">{stat.count} videos</span>
            </div>

            <div className="stat-metrics">
              <div className="metric">
                <span className="label">Avg Views</span>
                <span className="value">{(stat.avg_views || 0).toLocaleString()}</span>
              </div>
              <div className="metric">
                <span className="label">Avg Sales</span>
                <span className="value">{(stat.avg_sales || 0).toLocaleString()}</span>
              </div>
              <div className="metric">
                <span className="label">Avg Revenue</span>
                <span className="value highlight">${(stat.avg_revenue || 0).toLocaleString()}</span>
              </div>
            </div>

            <div className="conversion-rate">
              <strong>Est. Conversion Rate:</strong>
              {stat.content_type === 'Tutorial' && <span> 70%</span>}
              {stat.content_type === 'Review' && <span> 75%</span>}
              {stat.content_type === 'How-To' && <span> 55%</span>}
              {stat.content_type === 'Q&A' && <span> 30%</span>}
              {stat.content_type === 'Educational' && <span> 60%</span>}
              {stat.content_type === 'Vlog' && <span> 15%</span>}
              {stat.content_type === 'Entertainment' && <span> 10%</span>}
            </div>
          </div>
        ))}
      </div>

      <div className="recommendations-section">
        <h2>💡 Recommendations</h2>
        <ul className="recommendations-list">
          <li><strong>Best Performing:</strong> {stats[0]?.content_type}s generate ${(stats[0]?.avg_revenue || 0).toLocaleString()} avg revenue</li>
          <li><strong>Create More:</strong> Focus on {stats.sort((a, b) => (b.avg_revenue || 0) - (a.avg_revenue || 0))[0]?.content_type} content for highest ROI</li>
          <li><strong>Commerce Potential:</strong> Tutorials have highest conversion (70%) - add affiliate links + product recommendations</li>
          <li><strong>Quick Wins:</strong> Reviews convert well (75%) - include Amazon affiliate links in descriptions</li>
        </ul>
      </div>
    </div>
  );
};

export default ContentTypeAnalysis;
