import React, { useState } from 'react';
import { generateCampaign } from '../services/api';

function CampaignGenerator() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const [formData, setFormData] = useState({
    creator_name: '',
    product_name: '',
    product_price: 97,
    product_type: 'course',
    creator_niche: 'lifestyle',
    subscriber_count: 5000,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: (name === 'product_price' || name === 'subscriber_count') ? parseFloat(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await generateCampaign(formData);
      setResult(response);
    } catch (err) {
      setError('Failed to generate campaign. ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: '8px',
    border: '1px solid #334155', background: '#1E293B',
    color: '#F1F5F9', fontSize: '14px', outline: 'none',
  };
  const labelStyle = { display: 'block', marginBottom: '6px', color: '#94A3B8', fontSize: '13px', fontWeight: '600' };
  const groupStyle = { marginBottom: '16px' };
  const SEND_DAYS = [0, 2, 6, 13, 29];

  return (
    <div style={{ padding: '32px', maxWidth: '900px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '26px', fontWeight: '800', color: '#F1F5F9', marginBottom: '8px' }}>
          📧 Campaign Generator
        </h2>
        <p style={{ color: '#94A3B8', fontSize: '15px' }}>
          Auto-generate a 5-email product launch sequence. Save 10+ hours of copywriting.
          Day 0 launch · Day 2 social proof · Day 6 value · Day 13 testimonials · Day 29 last chance.
        </p>
      </div>

      {/* Form Card */}
      <div style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: '16px', padding: '28px', marginBottom: '24px' }}>
        <h3 style={{ color: '#F1F5F9', fontWeight: '700', fontSize: '16px', marginBottom: '20px' }}>Campaign Details</h3>
        <form onSubmit={handleSubmit}>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={groupStyle}>
              <label style={labelStyle}>Your Name *</label>
              <input type="text" name="creator_name" value={formData.creator_name}
                onChange={handleChange} required placeholder="e.g., Sarah" style={inputStyle} />
            </div>
            <div style={groupStyle}>
              <label style={labelStyle}>Product Name *</label>
              <input type="text" name="product_name" value={formData.product_name}
                onChange={handleChange} required placeholder="e.g., Fitness Masterclass" style={inputStyle} />
            </div>
            <div style={groupStyle}>
              <label style={labelStyle}>Product Price (USD) *</label>
              <input type="number" name="product_price" value={formData.product_price}
                onChange={handleChange} required min="0" step="0.01"
                placeholder="e.g., 97" style={inputStyle} />
            </div>
            <div style={groupStyle}>
              <label style={labelStyle}>Product Type *</label>
              <select name="product_type" value={formData.product_type} onChange={handleChange} style={inputStyle}>
                <option value="course">Online Course</option>
                <option value="ebook">E-Book</option>
                <option value="template">Templates</option>
                <option value="coaching">Coaching Program</option>
                <option value="membership">Membership</option>
                <option value="software">Software</option>
                <option value="physical">Physical Product</option>
              </select>
            </div>
            <div style={groupStyle}>
              <label style={labelStyle}>Your Niche *</label>
              <select name="creator_niche" value={formData.creator_niche} onChange={handleChange} style={inputStyle}>
                <option value="fitness">Fitness & Health</option>
                <option value="finance">Finance</option>
                <option value="tech">Tech & Gaming</option>
                <option value="lifestyle">Lifestyle</option>
                <option value="business">Business & Entrepreneurship</option>
                <option value="beauty">Beauty & Fashion</option>
              </select>
            </div>
            <div style={groupStyle}>
              <label style={labelStyle}>Email Subscribers *</label>
              <input type="number" name="subscriber_count" value={formData.subscriber_count}
                onChange={handleChange} required min="100"
                placeholder="e.g., 5000" style={inputStyle} />
            </div>
          </div>

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '14px', borderRadius: '10px', border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            background: loading ? '#334155' : 'linear-gradient(135deg,#10B981,#059669)',
            color: '#F1F5F9', fontSize: '16px', fontWeight: '700', marginTop: '8px',
          }}>
            {loading ? '⏳ Generating...' : '📧 Generate 5-Email Sequence'}
          </button>
        </form>
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: '10px', padding: '14px', color: '#FCA5A5', marginBottom: '20px' }}>
          ❌ {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '32px', color: '#94A3B8' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>📧</div>
          <p style={{ fontSize: '15px' }}>Calling n8n, generating email sequence...</p>
        </div>
      )}

      {/* Result */}
      {result && (
        <div style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: '16px', padding: '28px' }}>

          <h3 style={{ color: '#10B981', fontWeight: '800', fontSize: '18px', marginBottom: '20px' }}>
            ✅ Campaign Generated
          </h3>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '24px' }}>
            {[
              { label: 'Product', value: result.product_name, color: '#F1F5F9' },
              { label: 'Price', value: `€${result.product_price}`, color: '#10B981' },
              { label: 'Emails Queued', value: result.emails_queued || 5, color: '#3B82F6' },
              { label: 'Time Saved', value: '10 hours', color: '#F59E0B' },
            ].map((item, i) => (
              <div key={i} style={{ background: '#0F172A', border: '1px solid #334155', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>{item.label}</div>
                <div style={{ fontSize: '16px', fontWeight: '800', color: item.color }}>{item.value}</div>
              </div>
            ))}
          </div>

          {/* Email Sequence */}
          {result.email_subjects && (
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ color: '#F1F5F9', fontWeight: '700', marginBottom: '12px' }}>📬 Email Sequence</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {result.email_subjects.map((subject, idx) => (
                  <div key={idx} style={{ background: '#0F172A', border: '1px solid #334155', borderRadius: '10px', padding: '14px', display: 'flex', gap: '14px', alignItems: 'center' }}>
                    <div style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '8px', padding: '6px 12px', textAlign: 'center', minWidth: '60px', flexShrink: 0 }}>
                      <div style={{ fontSize: '10px', color: '#64748B', fontWeight: '700' }}>DAY</div>
                      <div style={{ fontSize: '18px', fontWeight: '800', color: '#3B82F6' }}>{result.send_schedule_days ? result.send_schedule_days[idx] : SEND_DAYS[idx]}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '600', marginBottom: '4px' }}>EMAIL {idx + 1}</div>
                      <div style={{ color: '#F1F5F9', fontSize: '14px', fontWeight: '500' }}>{subject}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Value Metrics */}
          {result.value_metrics && (
            <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '12px', padding: '18px', marginBottom: '20px' }}>
              <h4 style={{ color: '#10B981', fontWeight: '700', marginBottom: '12px' }}>💰 Value Metrics</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
                {[
                  { label: 'Hours Saved', value: result.value_metrics.hours_saved },
                  { label: 'Early Bird Price', value: `€${result.value_metrics.early_bird_price}` },
                  { label: 'Expected Revenue', value: `€${result.value_metrics.expected_revenue?.toLocaleString()}` },
                ].map((m, i) => (
                  <div key={i} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: '#6EE7B7', fontWeight: '600', marginBottom: '4px' }}>{m.label}</div>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: '#10B981' }}>{m.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '12px', padding: '18px' }}>
            <p style={{ color: '#93C5FD', fontWeight: '700', marginBottom: '10px' }}>🚀 Next Steps</p>
            {[
              'Copy emails to your email service provider (ConvertKit, Mailchimp, etc.)',
              'Customize with your brand voice and personal touches',
              'Schedule sends for the specified dates',
              'Monitor open rates and adjust for future launches',
            ].map((step, i) => (
              <p key={i} style={{ color: '#CBD5E1', fontSize: '13px', marginBottom: '6px' }}>
                <span style={{ color: '#3B82F6', fontWeight: '700', marginRight: '8px' }}>{i + 1}.</span>{step}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default CampaignGenerator;
