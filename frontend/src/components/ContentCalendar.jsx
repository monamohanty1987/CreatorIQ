import React, { useState, useEffect } from 'react';
import { getContentCalendar } from '../services/api';

const ContentCalendar = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await getContentCalendar();
      setData(result.data || result);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error loading calendar:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">📅 Loading calendar...</div>;
  if (error) return <div className="error">❌ Error: {error}</div>;

  const calendar = data?.calendar || [];
  const totalExpectedRevenue = calendar.reduce((sum, day) => sum + (day.expected_revenue || 0), 0);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>📅 Content Calendar with Commerce Spots</h1>
        <p>Plan where to add affiliate links and product recommendations</p>
      </div>

      <div className="calendar-summary">
        <div className="summary-card">
          <span className="label">Content Pieces This Week</span>
          <span className="value">{calendar.length} videos</span>
        </div>
        <div className="summary-card">
          <span className="label">Total Expected Revenue</span>
          <span className="value">${totalExpectedRevenue.toLocaleString()}</span>
        </div>
        <div className="summary-card">
          <span className="label">Avg Revenue Per Video</span>
          <span className="value">${calendar.length > 0 ? (totalExpectedRevenue / calendar.length).toLocaleString() : 0}</span>
        </div>
      </div>

      <div className="calendar-grid">
        <div className="calendar-header">
          <h3>📅 Weekly Schedule</h3>
          <p style={{ color: '#666', fontSize: '0.9rem' }}>Recommendations for commerce integration</p>
        </div>

        {calendar.map((day, idx) => (
          <div key={idx} className="calendar-day">
            <div className="day-header">
              <h4>Day {idx + 1}</h4>
              <span className={`priority ${(day.commerce_recommendation || '').toLowerCase()}`}>
                {day.commerce_recommendation === 'Add 2-3 links' && '⭐⭐⭐'}
                {day.commerce_recommendation === 'Add 1 link' && '⭐⭐'}
                {day.commerce_recommendation === 'Skip' && '⚪'}
              </span>
            </div>

            <div className="day-content">
              <p className="content-title">
                <strong>{day.title || 'Content Title'}</strong>
              </p>
              <p className="content-type">
                Type: <span>{day.content_type}</span> | Topic: <span>{day.topic}</span>
              </p>

              <div className="commerce-rec">
                <h5>💰 Commerce Recommendation:</h5>
                <p className="recommendation">{day.commerce_recommendation}</p>
              </div>

              {day.commerce_recommendation !== 'Skip' && (
                <>
                  <div className="suggested-products">
                    <h5>📦 Suggested Products:</h5>
                    <ul>
                      {day.suggested_products && day.suggested_products.length > 0 ? (
                        day.suggested_products.map((product, i) => (
                          <li key={i}>{product}</li>
                        ))
                      ) : (
                        <li>Use affiliate products from {day.topic} category</li>
                      )}
                    </ul>
                  </div>

                  <div className="suggested-moments">
                    <h5>⏱️ Suggested Moments:</h5>
                    <ul>
                      {day.suggested_moments && day.suggested_moments.length > 0 ? (
                        day.suggested_moments.map((moment, i) => (
                          <li key={i}>{moment.time} - {moment.type}</li>
                        ))
                      ) : (
                        <li>Intro (0-10%), MidPoint (40-60%), Outro (90-100%)</li>
                      )}
                    </ul>
                  </div>
                </>
              )}

              <div className="revenue-forecast">
                <strong>📈 Expected Revenue:</strong> ${(day.expected_revenue || 0).toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </div>

      {calendar.length === 0 && (
        <div className="empty-state">
          <p>No content scheduled. Upload content to see recommendations.</p>
        </div>
      )}

      <div className="implementation-guide">
        <h2>🛠️ Implementation Guide</h2>
        <div className="guide-steps">
          <div className="step">
            <span className="step-num">1</span>
            <div>
              <h4>Pick Your Moment</h4>
              <p>Intro = Hook. MidPoint = Solve problem. Outro = Close.</p>
            </div>
          </div>
          <div className="step">
            <span className="step-num">2</span>
            <div>
              <h4>Add The Product Link</h4>
              <p>Description box, pinned comment, or affiliate link shortener.</p>
            </div>
          </div>
          <div className="step">
            <span className="step-num">3</span>
            <div>
              <h4>Track Clicks</h4>
              <p>Use UTM parameters or discount codes to measure performance.</p>
            </div>
          </div>
          <div className="step">
            <span className="step-num">4</span>
            <div>
              <h4>Enter Actual Sales</h4>
              <p>Go to Content Dashboard → Update Manual Sales to track ROI.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="best-practices">
        <h2>✨ Best Practices</h2>
        <ul>
          <li>✅ <strong>Only recommend</strong> products you actually use</li>
          <li>✅ <strong>Disclose</strong> affiliate relationships (FTC requirement)</li>
          <li>✅ <strong>Match products</strong> to content topic for highest conversion</li>
          <li>✅ <strong>Test timing</strong> - don't mention product in first 10 seconds</li>
          <li>✅ <strong>Use discount codes</strong> to track which videos drive sales</li>
          <li>✅ <strong>Monitor performance</strong> - which moments convert best?</li>
        </ul>
      </div>
    </div>
  );
};

export default ContentCalendar;
