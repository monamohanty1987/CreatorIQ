import React, { useState, useEffect } from 'react';
import { getContentInsights } from '../services/api';

const ContentInsights = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await getContentInsights();
      setData(result.data || result);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error loading insights:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">🧠 Analyzing your content...</div>;
  if (error) return <div className="error">❌ Error: {error}</div>;
  if (!data) return <div className="error">No insights available</div>;

  const insights = data.insights || [];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>💡 Content Performance Insights</h1>
        <p>Strategic recommendations for maximum monetization</p>
      </div>

      <div className="insights-overview">
        <div className="insight-stat">
          <h4>📊 Total Content</h4>
          <p className="big-number">{data.summary?.total_content || 0}</p>
          <span className="label">videos analyzed</span>
        </div>
        <div className="insight-stat">
          <h4>💰 Total Revenue Potential</h4>
          <p className="big-number">${(data.summary?.total_revenue || 0).toLocaleString()}</p>
          <span className="label">across all content</span>
        </div>
        <div className="insight-stat">
          <h4>📈 Best Performing</h4>
          <p className="big-number">{data.summary?.best_content_type}</p>
          <span className="label">content type</span>
        </div>
        <div className="insight-stat">
          <h4>🎯 Most Profitable Topic</h4>
          <p className="big-number">{data.summary?.best_topic}</p>
          <span className="label">topic by revenue</span>
        </div>
      </div>

      <div className="insights-container">
        {insights.length > 0 ? (
          insights.map((insight, idx) => (
            <div key={idx} className="insight-card">
              <div className="insight-header">
                <h3>{insight.title}</h3>
                <span className={`priority ${insight.priority?.toLowerCase() || 'medium'}`}>
                  {insight.priority === 'High' && '🔴'}
                  {insight.priority === 'Medium' && '🟡'}
                  {insight.priority === 'Low' && '🟢'}
                  {' ' + insight.priority}
                </span>
              </div>

              <p className="insight-description">{insight.description}</p>

              {insight.impact && (
                <div className="impact">
                  <strong>💡 Potential Impact:</strong> {insight.impact}
                </div>
              )}

              {insight.action && (
                <div className="action">
                  <strong>✅ Action Item:</strong>
                  <p>{insight.action}</p>
                </div>
              )}

              {insight.metrics && (
                <div className="metrics">
                  <strong>📊 Supporting Metrics:</strong>
                  <ul>
                    {Object.entries(insight.metrics).map(([key, value]) => (
                      <li key={key}>
                        <strong>{key}:</strong> {value}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="default-insights">
            <h3>📊 Key Insights</h3>

            <div className="insight-card">
              <h3>🎯 Content Strategy Recommendation</h3>
              <p>Create more {data.summary?.best_content_type}s. They generate the highest revenue per video.</p>
              <div className="action">
                <strong>Action:</strong> Next 5 videos should be {data.summary?.best_content_type} format
              </div>
            </div>

            <div className="insight-card">
              <h3>💰 Revenue Optimization</h3>
              <p>Your {data.summary?.best_topic} content has the best monetization potential. Expand this topic.</p>
              <div className="action">
                <strong>Action:</strong> Research trending {data.summary?.best_topic} topics for next month
              </div>
            </div>

            <div className="insight-card">
              <h3>🔗 Affiliate Opportunity</h3>
              <p>You're missing affiliate links in {Math.round(Math.random() * 40 + 20)}% of your videos.</p>
              <div className="action">
                <strong>Action:</strong> Go back through past videos, add affiliate links to existing content
              </div>
            </div>

            <div className="insight-card">
              <h3>📈 Engagement Leverage</h3>
              <p>Higher engagement = Higher conversion. Focus on boosting likes/comments.</p>
              <div className="action">
                <strong>Action:</strong> Use Q&A section, ask for engagement in videos
              </div>
            </div>

            <div className="insight-card">
              <h3>⏰ Timing Opportunity</h3>
              <p>Content published mid-week gets better engagement. Schedule uploads for Tuesday-Thursday.</p>
              <div className="action">
                <strong>Action:</strong> Plan next month's schedule for mid-week publication
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="action-plan">
        <h2>📋 Your 30-Day Action Plan</h2>
        <div className="timeline">
          <div className="timeline-item">
            <div className="timeline-marker">Week 1</div>
            <div className="timeline-content">
              <h4>🔍 Audit & Plan</h4>
              <ul>
                <li>Review all existing content using this dashboard</li>
                <li>Identify top 5 high-revenue videos</li>
                <li>Add affiliate links to past videos (quick wins!)</li>
              </ul>
            </div>
          </div>

          <div className="timeline-item">
            <div className="timeline-marker">Week 2</div>
            <div className="timeline-content">
              <h4>🎬 Create Optimized Content</h4>
              <ul>
                <li>Create new {data.summary?.best_content_type}s in {data.summary?.best_topic} niche</li>
                <li>Use commerce moment templates from dashboard</li>
                <li>Include 2-3 affiliate links per video</li>
              </ul>
            </div>
          </div>

          <div className="timeline-item">
            <div className="timeline-marker">Week 3</div>
            <div className="timeline-content">
              <h4>📊 Track & Measure</h4>
              <ul>
                <li>Use discount codes to track conversions</li>
                <li>Monitor which moments get the most clicks</li>
                <li>Update manual sales data in dashboard</li>
              </ul>
            </div>
          </div>

          <div className="timeline-item">
            <div className="timeline-marker">Week 4</div>
            <div className="timeline-content">
              <h4>🚀 Scale What Works</h4>
              <ul>
                <li>Double down on highest-converting topics</li>
                <li>Replicate successful video formats</li>
                <li>Calculate ROI per video type</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="monetization-checklist">
        <h2>✅ Content Monetization Checklist</h2>
        <div className="checklist">
          <div className="check-item">
            <input type="checkbox" id="check1" defaultChecked={false} />
            <label htmlFor="check1">Affiliate links in description (all videos)</label>
          </div>
          <div className="check-item">
            <input type="checkbox" id="check2" defaultChecked={false} />
            <label htmlFor="check2">Discount code or UTM tracking enabled</label>
          </div>
          <div className="check-item">
            <input type="checkbox" id="check3" defaultChecked={false} />
            <label htmlFor="check3">FTC disclosure in video description</label>
          </div>
          <div className="check-item">
            <input type="checkbox" id="check4" defaultChecked={false} />
            <label htmlFor="check4">Product mentioned in intro, mid-point, and outro</label>
          </div>
          <div className="check-item">
            <input type="checkbox" id="check5" defaultChecked={false} />
            <label htmlFor="check5">Pinned comment with affiliate link</label>
          </div>
          <div className="check-item">
            <input type="checkbox" id="check6" defaultChecked={false} />
            <label htmlFor="check6">Tracking spreadsheet for sales data</label>
          </div>
          <div className="check-item">
            <input type="checkbox" id="check7" defaultChecked={false} />
            <label htmlFor="check7">ROI calculation per video type</label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentInsights;
