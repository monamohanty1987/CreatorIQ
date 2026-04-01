import React, { useState } from 'react';
import { Copy, Loader, RefreshCw, Share2, Home } from 'lucide-react';

export default function AICommerceScripts({ onNavigate }) {
  const [productName, setProductName] = useState('');
  const [benefits, setBenefits] = useState(['', '', '']);
  const [discountCode, setDiscountCode] = useState('');
  const [contentType, setContentType] = useState('Tutorial');
  const [tone, setTone] = useState('Authentic');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [copiedSection, setCopiedSection] = useState(null);

  const contentTypes = ['Tutorial', 'Review', 'How-To', 'Q&A', 'Vlog'];
  const tones = ['Authentic', 'Educational', 'Humorous', 'Professional'];

  const handleBenefitChange = (index, value) => {
    const newBenefits = [...benefits];
    newBenefits[index] = value;
    setBenefits(newBenefits);
  };

  const handleGenerateScript = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Validate inputs
      if (!productName.trim()) {
        setError('Product name is required');
        setLoading(false);
        return;
      }

      const filledBenefits = benefits.filter(b => b.trim());
      if (filledBenefits.length < 2) {
        setError('Please enter at least 2 benefits');
        setLoading(false);
        return;
      }

      if (!discountCode.trim()) {
        setError('Discount code is required');
        setLoading(false);
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/ai-commerce/generate-script`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_name: productName,
          benefits: filledBenefits,
          discount_code: discountCode,
          content_type: contentType,
          tone: tone
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to generate script');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopySection = (section, text) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleRepurpose = () => {
    if (result) {
      // Send only the intro part to Content Repurposer
      localStorage.setItem('repurposerContent', result.intro);
      onNavigate?.('content-repurpose');
    }
  };

  return (
    <div style={{ background: '#F9F7F4', minHeight: '100vh', padding: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#051730', margin: 0, marginBottom: '0.5rem' }}>
              🤖 AI Commerce Scripts
            </h1>
            <p style={{ fontSize: '16px', color: '#6B7280', margin: 0 }}>
              Generate customized product promotion scripts for your videos
            </p>
          </div>
          <button
            onClick={() => onNavigate?.('home')}
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

        {/* AI Disclosure */}
        <div
          style={{
            background: '#EFF6FF',
            border: '1px solid #49A9DE',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '2rem',
            fontSize: '14px',
            color: '#051730',
            lineHeight: '1.5'
          }}
        >
          <strong>⚠️ AI-Generated Scripts:</strong> These scripts are AI-created and tailored to your product and audience.
          Review and customize as needed to match your authentic voice before using in your videos.
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {/* Input Section */}
          <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#051730', marginBottom: '1.5rem', margin: 0 }}>
              📝 Script Details
            </h2>

            {/* Product Name */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#051730' }}>
                Product Name
              </label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g., Velvet Matte Lip Kit"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #E5E7EB',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  color: '#051730'
                }}
              />
            </div>

            {/* Benefits */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#051730' }}>
                Key Benefits (min. 2)
              </label>
              {benefits.map((benefit, idx) => (
                <input
                  key={idx}
                  type="text"
                  value={benefit}
                  onChange={(e) => handleBenefitChange(idx, e.target.value)}
                  placeholder={`Benefit ${idx + 1}`}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #E5E7EB',
                    borderRadius: '6px',
                    fontSize: '14px',
                    marginBottom: '0.5rem',
                    boxSizing: 'border-box',
                    color: '#051730'
                  }}
                />
              ))}
            </div>

            {/* Discount Code */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#051730' }}>
                Discount Code
              </label>
              <input
                type="text"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
                placeholder="e.g., CREATOR20"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #E5E7EB',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  color: '#051730'
                }}
              />
            </div>

            {/* Content Type */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#051730' }}>
                Content Type
              </label>
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #E5E7EB',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  color: '#051730'
                }}
              >
                {contentTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Tone */}
            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#051730' }}>
                Tone
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #E5E7EB',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  color: '#051730'
                }}
              >
                {tones.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerateScript}
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: loading ? '#D1D5DB' : '#FF8C2E',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontSize: '16px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!loading) e.target.style.opacity = '0.9';
              }}
              onMouseLeave={(e) => {
                if (!loading) e.target.style.opacity = '1';
              }}
            >
              {loading ? (
                <>
                  <Loader size={20} style={{ animation: 'spin 2s linear infinite' }} />
                  Generating...
                </>
              ) : (
                <>
                  <span>🚀 Generate Script</span>
                </>
              )}
            </button>

            {error && (
              <div
                style={{
                  marginTop: '1rem',
                  padding: '1rem',
                  background: '#FEE2E2',
                  color: '#991B1B',
                  borderRadius: '6px',
                  fontSize: '14px',
                  border: '1px solid #FCA5A5'
                }}
              >
                ❌ {error}
              </div>
            )}
          </div>

          {/* Results Section */}
          <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            {result ? (
              <>
                <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '1.5rem', color: '#051730', margin: 0 }}>
                  ✨ Your Script
                </h2>

                {/* Intro Section */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#FF8C2E', marginBottom: '0.5rem' }}>
                    🎬 INTRO
                  </h3>
                  <div
                    style={{
                      background: '#F9FAFB',
                      padding: '1rem',
                      borderRadius: '6px',
                      fontSize: '14px',
                      lineHeight: '1.6',
                      color: '#333',
                      marginBottom: '0.75rem',
                      border: '1px solid #E5E7EB'
                    }}
                  >
                    {result.intro}
                  </div>
                  <button
                    onClick={() => handleCopySection('intro', result.intro)}
                    style={{
                      padding: '0.5rem 1rem',
                      background: copiedSection === 'intro' ? '#10B981' : '#E5E7EB',
                      color: copiedSection === 'intro' ? 'white' : '#051730',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '600',
                      transition: 'all 0.2s'
                    }}
                  >
                    {copiedSection === 'intro' ? '✅ Copied!' : '📋 Copy'}
                  </button>
                </div>

                {/* Midpoint Section */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#FF8C2E', marginBottom: '0.5rem' }}>
                    ⭐ MIDPOINT
                  </h3>
                  <div
                    style={{
                      background: '#F9FAFB',
                      padding: '1rem',
                      borderRadius: '6px',
                      fontSize: '14px',
                      lineHeight: '1.6',
                      color: '#333',
                      marginBottom: '0.75rem',
                      border: '1px solid #E5E7EB'
                    }}
                  >
                    {result.midpoint}
                  </div>
                  <button
                    onClick={() => handleCopySection('midpoint', result.midpoint)}
                    style={{
                      padding: '0.5rem 1rem',
                      background: copiedSection === 'midpoint' ? '#10B981' : '#E5E7EB',
                      color: copiedSection === 'midpoint' ? 'white' : '#051730',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '600',
                      transition: 'all 0.2s'
                    }}
                  >
                    {copiedSection === 'midpoint' ? '✅ Copied!' : '📋 Copy'}
                  </button>
                </div>

                {/* Outro Section */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#FF8C2E', marginBottom: '0.5rem' }}>
                    ✅ OUTRO
                  </h3>
                  <div
                    style={{
                      background: '#F9FAFB',
                      padding: '1rem',
                      borderRadius: '6px',
                      fontSize: '14px',
                      lineHeight: '1.6',
                      color: '#333',
                      marginBottom: '0.75rem',
                      border: '1px solid #E5E7EB'
                    }}
                  >
                    {result.outro}
                  </div>
                  <button
                    onClick={() => handleCopySection('outro', result.outro)}
                    style={{
                      padding: '0.5rem 1rem',
                      background: copiedSection === 'outro' ? '#10B981' : '#E5E7EB',
                      color: copiedSection === 'outro' ? 'white' : '#051730',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '600',
                      transition: 'all 0.2s'
                    }}
                  >
                    {copiedSection === 'outro' ? '✅ Copied!' : '📋 Copy'}
                  </button>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '1.5rem' }}>
                  <button
                    onClick={() => setResult(null)}
                    style={{
                      padding: '0.75rem',
                      background: '#E5E7EB',
                      color: '#051730',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <RefreshCw size={16} /> Generate New
                  </button>
                  <button
                    onClick={handleRepurpose}
                    style={{
                      padding: '0.75rem',
                      background: '#49A9DE',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <Share2 size={16} /> Repurpose
                  </button>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', color: '#9CA3AF', paddingTop: '4rem' }}>
                <p style={{ fontSize: '64px', marginBottom: '1rem' }}>🎬</p>
                <p style={{ fontSize: '16px', marginBottom: '0.5rem' }}>
                  Fill in your product details and click "Generate Script"
                </p>
                <p style={{ fontSize: '13px', color: '#D1D5DB' }}>
                  AI will create a custom script for your chosen content type
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CSS for loading animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
