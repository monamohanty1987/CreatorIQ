import React, { useState } from 'react';
import { Home } from 'lucide-react';
import { analyzeContract } from '../services/api';

function ContractAnalyzer() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [contractType, setContractType] = useState('brand-sponsorship');

  const [formData, setFormData] = useState({
    creator_name: '',
    brand_name: '',
    contract_text: '',
    creator_niche: 'lifestyle',
    deal_value: 5000,
    contract_type: 'brand-sponsorship',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'deal_value' ? parseFloat(value) : value
    }));

    // Also update contractType state if it's the contract_type field
    if (name === 'contract_type') {
      setContractType(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Ensure contract_type is included in formData
      const submitData = {
        ...formData,
        contract_type: contractType
      };
      const response = await analyzeContract(submitData);
      setResult(response);
    } catch (err) {
      // Check if it's an unsupported contract type error
      if (err.message && err.message.includes('422')) {
        setError('We currently support Brand Sponsorship, NDAs, and Influencer Marketing Agreements. For other types, please consult a lawyer.');
      } else {
        setError('Failed to generate explanation. ' + err.message);
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: '8px',
    border: '1px solid #E5E7EB', background: '#FFFFFF',
    color: '#051730', fontSize: '14px', outline: 'none',
  };
  const labelStyle = { display: 'block', marginBottom: '6px', color: '#051730', fontSize: '13px', fontWeight: '600' };
  const groupStyle = { marginBottom: '16px' };

  return (
    <div style={{ background: '#F9F7F4', minHeight: '100vh', padding: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Header with Home Button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#051730', margin: 0, marginBottom: '0.5rem' }}>
              🔍 Deal Navigator
            </h1>
            <p style={{ fontSize: '16px', color: '#6B7280', margin: 0 }}>
              Get an educational explanation of contract terms and discussion points for your lawyer
            </p>
          </div>
          <button
            onClick={() => window.location.href = '?page=home'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              background: '#051730',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            <Home size={16} />
            Home
          </button>
        </div>

        {/* Educational Disclaimer */}
        <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '8px', padding: '1rem', marginBottom: '2rem', fontSize: '14px', color: '#991B1B', lineHeight: '1.5' }}>
          <strong>⚠️ Educational Information Only:</strong> This tool provides educational explanations. It does NOT constitute legal advice. Always consult a qualified legal professional before signing any contract.
        </div>

      {/* Form Card */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '2rem', marginBottom: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h3 style={{ color: '#051730', fontWeight: '700', fontSize: '16px', marginBottom: '20px' }}>📄 Deal Details</h3>
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
              <label style={labelStyle}>Contract Type *</label>
              <select name="contract_type" value={contractType} onChange={handleChange} style={inputStyle}>
                <option value="brand-sponsorship">Brand Sponsorship / Partnership</option>
                <option value="nda">Non-Disclosure Agreement (NDA)</option>
                <option value="influencer-marketing">Influencer Marketing Agreement</option>
              </select>
            </div>
            <div style={groupStyle}>
              <label style={labelStyle}>Your Niche *</label>
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
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div style={groupStyle}>
              <label style={labelStyle}>Deal Value (EUR)</label>
              <input type="number" name="deal_value" value={formData.deal_value}
                onChange={handleChange} min="0" step="0.01"
                placeholder="e.g., 5000" style={inputStyle} />
            </div>
            <div style={groupStyle}>
              {/* Spacer */}
            </div>
          </div>

          <div style={groupStyle}>
            <label style={labelStyle}>Contract Text *</label>
            <textarea name="contract_text" value={formData.contract_text}
              onChange={handleChange} required placeholder="Paste the full contract here..."
              style={{ ...inputStyle, minHeight: '260px', resize: 'vertical', lineHeight: '1.6' }} />
          </div>

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '12px', borderRadius: '6px', border: 'none', cursor: 'pointer',
            background: loading ? '#D1D5DB' : '#FF8C2E',
            color: 'white', fontSize: '16px', fontWeight: '600',
          }}>
            {loading ? '⏳ Generating Explanation...' : '🔍 Explain This Deal'}
          </button>
        </form>
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5',
          borderRadius: '6px', padding: '1rem', color: '#991B1B', marginBottom: '1.5rem' }}>
          ❌ {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#6B7280', background: '#FFFFFF', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '48px', marginBottom: '1rem' }}>⏳</div>
          <p style={{ fontSize: '16px' }}>Generating educational explanation with AI...</p>
        </div>
      )}

      {/* Result */}
      {result && (
        <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>

          {/* Disclaimer Banner */}
          <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '6px', padding: '1rem', marginBottom: '1.5rem', color: '#991B1B', fontSize: '13px' }}>
            ⚖️ <strong>Educational Only:</strong> This explanation is for educational purposes. Always consult a qualified lawyer before signing any contract.
          </div>

          {/* Verdict Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ color: '#051730', fontWeight: '800', fontSize: '18px', margin: 0 }}>📋 Deal Explanation</h3>
            <span style={{
              padding: '8px 16px', borderRadius: '6px', fontWeight: '700', fontSize: '14px',
              background: result.verdict === 'REJECT' ? '#FEE2E2' : result.verdict === 'NEGOTIATE' ? '#FEF3C7' : '#DCFCE7',
              color: result.verdict === 'REJECT' ? '#991B1B' : result.verdict === 'NEGOTIATE' ? '#92400E' : '#166534',
              border: `1px solid ${result.verdict === 'REJECT' ? '#FCA5A5' : result.verdict === 'NEGOTIATE' ? '#FCD34D' : '#86EFAC'}`,
            }}>
              {result.verdict === 'REJECT' ? '🚫 REJECT' : result.verdict === 'NEGOTIATE' ? '⚠️ NEGOTIATE' : '✅ PASS'}
            </span>
          </div>

          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
            {[
              {
                label: 'Deal Score',
                value: `${result.health_score}/100`,
                color: result.health_score >= 70 ? '#10B981' : result.health_score >= 40 ? '#F59E0B' : '#EF4444',
                hint: result.health_score >= 70 ? 'This deal looks solid overall' : result.health_score >= 40 ? 'Some terms need attention' : 'High risk — review carefully',
              },
              {
                label: 'Red Flags',
                value: `${result.red_flags_count} found`,
                color: result.red_flags_count > 0 ? '#EF4444' : '#10B981',
                hint: result.red_flags_count > 0 ? 'Clauses that may need discussion' : 'No concerning clauses detected',
              },
              {
                label: 'Critical Issues',
                value: result.critical_flags,
                color: result.critical_flags > 0 ? '#EF4444' : '#10B981',
                hint: result.critical_flags > 0 ? 'Urgent — consult a lawyer' : 'No critical issues found',
              },
              {
                label: 'FTC Compliance',
                value: result.ftc_compliance,
                color: '#6B7280',
                hint: 'Disclosure requirements for sponsored content',
              },
            ].map((item, i) => (
              <div key={i} style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '1rem', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>{item.label}</div>
                <div style={{ fontSize: '20px', fontWeight: '800', color: item.color, marginBottom: '0.4rem' }}>{item.value}</div>
                <div style={{ fontSize: '11px', color: '#9CA3AF', lineHeight: '1.4' }}>{item.hint}</div>
              </div>
            ))}
          </div>

          {/* Red Flags */}
          {result.red_flags && result.red_flags.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ color: '#051730', fontWeight: '700', marginBottom: '1rem' }}>🚩 Red Flags Detected</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {result.red_flags.map((flag, idx) => (
                  <div key={idx} style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '6px', padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                      <span style={{
                        fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '4px',
                        background: flag.severity === 'CRITICAL' ? '#FEE2E2' : '#FEF3C7',
                        color: flag.severity === 'CRITICAL' ? '#991B1B' : '#92400E',
                      }}>{flag.severity || 'MEDIUM'}</span>
                      <strong style={{ color: '#051730', fontSize: '14px' }}>{flag.clause_type || 'Clause'}</strong>
                    </div>
                    <p style={{ color: '#6B7280', fontSize: '13px', marginBottom: '0.5rem' }}>{flag.description || flag.reason}</p>
                    {flag.recommendation && (
                      <p style={{ color: '#6B7280', fontSize: '12px' }}>💡 <strong style={{ color: '#051730' }}>Discuss:</strong> {flag.recommendation}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {result.recommendations && result.recommendations.length > 0 && (
            <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
              <h4 style={{ color: '#051730', fontWeight: '700', marginBottom: '1rem' }}>📋 Discussion Points</h4>
              <ul style={{ paddingLeft: '1.5rem', margin: 0 }}>
                {result.recommendations.slice(0, 5).map((rec, idx) => (
                  <li key={idx} style={{ color: '#6B7280', fontSize: '14px', marginBottom: '0.5rem', lineHeight: '1.6' }}>{rec}</li>
                ))}
              </ul>
            </div>
          )}

          {/* AI Analysis */}
          {result.claude_analysis && (
            <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#EFF6FF', border: '1px solid #49A9DE', borderRadius: '6px' }}>
              <p style={{ color: '#0369A1', fontWeight: '700', marginBottom: '0.5rem' }}>🤖 AI Explanation</p>
              <p style={{ color: '#0C4A6E', fontSize: '13px', lineHeight: '1.6', margin: 0 }}>
                {typeof result.claude_analysis === 'string'
                  ? result.claude_analysis.substring(0, 300) + '...'
                  : JSON.stringify(result.claude_analysis).substring(0, 300) + '...'}
              </p>
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  );
}

export default ContractAnalyzer;
