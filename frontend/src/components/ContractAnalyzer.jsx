import React, { useState } from 'react';
import { analyzeContract } from '../services/api';

function ContractAnalyzer() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const [formData, setFormData] = useState({
    creator_name: '',
    brand_name: '',
    contract_text: '',
    creator_niche: 'lifestyle',
    deal_value: 5000,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'deal_value' ? parseFloat(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await analyzeContract(formData);
      setResult(response);
    } catch (err) {
      setError('Failed to analyze contract. ' + err.message);
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

  return (
    <div style={{ padding: '32px', maxWidth: '900px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '26px', fontWeight: '800', color: '#F1F5F9', marginBottom: '8px' }}>
          ⚖️ Contract Analyzer
        </h2>
        <p style={{ color: '#94A3B8', fontSize: '15px' }}>
          Paste your contract for AI-powered red flag detection and FTC compliance check.
          Uses RAG with knowledge of 100+ contract templates.
        </p>
      </div>

      {/* Form Card */}
      <div style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: '16px', padding: '28px', marginBottom: '24px' }}>
        <h3 style={{ color: '#F1F5F9', fontWeight: '700', fontSize: '16px', marginBottom: '20px' }}>Contract Details</h3>
        <form onSubmit={handleSubmit}>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div style={groupStyle}>
              <label style={labelStyle}>Your Name *</label>
              <input type="text" name="creator_name" value={formData.creator_name}
                onChange={handleChange} required placeholder="e.g., Sarah" style={inputStyle} />
            </div>
            <div style={groupStyle}>
              <label style={labelStyle}>Brand Name *</label>
              <input type="text" name="brand_name" value={formData.brand_name}
                onChange={handleChange} required placeholder="e.g., FitnessCo" style={inputStyle} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div style={groupStyle}>
              <label style={labelStyle}>Niche *</label>
              <select name="creator_niche" value={formData.creator_niche} onChange={handleChange} style={inputStyle}>
                <option value="fitness">Fitness & Health</option>
                <option value="finance">Finance</option>
                <option value="tech">Tech & Gaming</option>
                <option value="lifestyle">Lifestyle</option>
                <option value="beauty">Beauty & Fashion</option>
                <option value="food">Food & Cooking</option>
                <option value="business">Business & Entrepreneurship</option>
              </select>
            </div>
            <div style={groupStyle}>
              <label style={labelStyle}>Deal Value (USD) *</label>
              <input type="number" name="deal_value" value={formData.deal_value}
                onChange={handleChange} required min="0" step="0.01"
                placeholder="e.g., 5000" style={inputStyle} />
            </div>
          </div>

          <div style={groupStyle}>
            <label style={labelStyle}>Contract Text *</label>
            <textarea name="contract_text" value={formData.contract_text}
              onChange={handleChange} required placeholder="Paste the full contract here..."
              style={{ ...inputStyle, minHeight: '260px', resize: 'vertical', lineHeight: '1.6' }} />
          </div>

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '14px', borderRadius: '10px', border: 'none', cursor: 'pointer',
            background: loading ? '#334155' : 'linear-gradient(135deg,#3B82F6,#1A56DB)',
            color: '#F1F5F9', fontSize: '16px', fontWeight: '700',
          }}>
            {loading ? '⏳ Analyzing...' : '⚖️ Analyze Contract'}
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
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔍</div>
          <p style={{ fontSize: '15px' }}>Running RAG search, analyzing with Claude AI...</p>
        </div>
      )}

      {/* Result */}
      {result && (
        <div style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: '16px', padding: '28px' }}>

          {/* Verdict Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ color: '#F1F5F9', fontWeight: '800', fontSize: '18px' }}>Contract Analysis Complete</h3>
            <span style={{
              padding: '8px 18px', borderRadius: '50px', fontWeight: '700', fontSize: '14px',
              background: result.verdict === 'REJECT' ? 'rgba(239,68,68,0.15)' : result.verdict === 'NEGOTIATE' ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)',
              color: result.verdict === 'REJECT' ? '#FCA5A5' : result.verdict === 'NEGOTIATE' ? '#FCD34D' : '#6EE7B7',
              border: `1px solid ${result.verdict === 'REJECT' ? 'rgba(239,68,68,0.3)' : result.verdict === 'NEGOTIATE' ? 'rgba(245,158,11,0.3)' : 'rgba(16,185,129,0.3)'}`,
            }}>
              {result.verdict === 'REJECT' ? '🚫 REJECT' : result.verdict === 'NEGOTIATE' ? '⚠️ NEGOTIATE' : '✅ PASS'}
            </span>
          </div>

          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '24px' }}>
            {[
              { label: 'Health Score', value: `${result.health_score}/100`, color: result.health_score >= 70 ? '#10B981' : result.health_score >= 40 ? '#F59E0B' : '#EF4444' },
              { label: 'Red Flags', value: `${result.red_flags_count} found`, color: result.red_flags_count > 0 ? '#EF4444' : '#10B981' },
              { label: 'Critical Issues', value: result.critical_flags, color: result.critical_flags > 0 ? '#EF4444' : '#10B981' },
              { label: 'FTC Compliance', value: result.ftc_compliance, color: '#94A3B8' },
            ].map((item, i) => (
              <div key={i} style={{ background: '#0F172A', border: '1px solid #334155', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>{item.label}</div>
                <div style={{ fontSize: '20px', fontWeight: '800', color: item.color }}>{item.value}</div>
              </div>
            ))}
          </div>

          {/* Red Flags */}
          {result.red_flags && result.red_flags.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ color: '#F1F5F9', fontWeight: '700', marginBottom: '12px' }}>🚩 Red Flags Detected</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {result.red_flags.map((flag, idx) => (
                  <div key={idx} style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', padding: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <span style={{
                        fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '50px',
                        background: flag.severity === 'CRITICAL' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)',
                        color: flag.severity === 'CRITICAL' ? '#FCA5A5' : '#FCD34D',
                      }}>{flag.severity || 'MEDIUM'}</span>
                      <strong style={{ color: '#F1F5F9', fontSize: '14px' }}>{flag.clause_type || 'Clause'}</strong>
                    </div>
                    <p style={{ color: '#CBD5E1', fontSize: '13px', marginBottom: '6px' }}>{flag.description || flag.reason}</p>
                    {flag.recommendation && (
                      <p style={{ color: '#94A3B8', fontSize: '12px' }}>💡 <strong style={{ color: '#F1F5F9' }}>Fix:</strong> {flag.recommendation}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {result.recommendations && result.recommendations.length > 0 && (
            <div style={{ borderTop: '1px solid #334155', paddingTop: '20px', marginTop: '20px' }}>
              <h4 style={{ color: '#F1F5F9', fontWeight: '700', marginBottom: '12px' }}>📋 Recommendations</h4>
              <ul style={{ paddingLeft: '20px' }}>
                {result.recommendations.slice(0, 5).map((rec, idx) => (
                  <li key={idx} style={{ color: '#CBD5E1', fontSize: '14px', marginBottom: '8px', lineHeight: '1.6' }}>{rec}</li>
                ))}
              </ul>
            </div>
          )}

          {/* AI Analysis */}
          {result.claude_analysis && (
            <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '10px' }}>
              <p style={{ color: '#93C5FD', fontWeight: '700', marginBottom: '8px' }}>🤖 AI Analysis</p>
              <p style={{ color: '#CBD5E1', fontSize: '13px', lineHeight: '1.7' }}>
                {typeof result.claude_analysis === 'string'
                  ? result.claude_analysis.substring(0, 300) + '...'
                  : JSON.stringify(result.claude_analysis).substring(0, 300) + '...'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ContractAnalyzer;
