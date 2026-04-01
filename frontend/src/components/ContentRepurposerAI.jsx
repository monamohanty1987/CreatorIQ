import React, { useState, useEffect } from 'react';
import { Copy, Download, RefreshCw, Loader, Home, AlertCircle, Check, Link } from 'lucide-react';

export default function ContentRepurposerAI({ onNavigate }) {
  const [inputMode, setInputMode] = useState('text'); // 'text' or 'youtube'
  const [content, setContent] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [extractedTranscript, setExtractedTranscript] = useState(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState({
    linkedin: true,
    instagram: true,
    youtube: false,
    tiktok: false
  });
  const [tone, setTone] = useState('professional');
  const [audience, setAudience] = useState('');
  const [results, setResults] = useState(null);
  const [variations, setVariations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generatingVariations, setGeneratingVariations] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('linkedin');
  const [activeVariation, setActiveVariation] = useState(null);
  const [copiedPlatform, setCopiedPlatform] = useState(null);
  const [apiHealthy, setApiHealthy] = useState(null);

  const platforms = ['linkedin', 'instagram', 'youtube', 'tiktok'];

  // Check API health on mount
  useEffect(() => {
    checkApiHealth();
  }, []);

  // Auto-populate content from localStorage (passed from Commerce Scripts)
  useEffect(() => {
    const repurposerContent = localStorage.getItem('repurposerContent');
    if (repurposerContent) {
      setContent(repurposerContent);
      setInputMode('text'); // Switch to text mode
      localStorage.removeItem('repurposerContent'); // Clear it after use
    }
  }, []);

  const checkApiHealth = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/ai-repurposer/health`);
      const data = await response.json();
      setApiHealthy(data.configured);
    } catch (err) {
      setApiHealthy(false);
    }
  };

  const handleModeChange = (mode) => {
    setInputMode(mode);
    setResults(null);
    setVariations(null);
    setError(null);
    setActiveVariation(null);
    // Always clear content and transcript when switching modes
    setContent('');
    setExtractedTranscript(null);
  };

  const handleExtractYouTube = async () => {
    setExtracting(true);
    setError(null);

    try {
      if (!youtubeUrl.trim()) {
        setError('Please enter a YouTube URL');
        setExtracting(false);
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/repurpose/extract-youtube`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          youtube_url: youtubeUrl.trim()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to extract transcript');
      }

      const data = await response.json();
      setExtractedTranscript(data.original_content);
      // Do NOT auto-populate the paste text field
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to extract YouTube transcript. Make sure the URL is valid and the video has captions.');
      console.error('Error:', err);
    } finally {
      setExtracting(false);
    }
  };

  const handleGenerateContent = async () => {
    setLoading(true);
    setError(null);

    try {
      const selectedPlatformsList = Object.keys(selectedPlatforms).filter(
        (p) => selectedPlatforms[p]
      );

      if (selectedPlatformsList.length === 0) {
        setError('Please select at least one platform');
        setLoading(false);
        return;
      }

      const contentToUse = inputMode === 'youtube' ? extractedTranscript : content.trim();

      if (!contentToUse) {
        setError('Please enter some content');
        setLoading(false);
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/ai-repurposer/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: contentToUse,
          platforms: selectedPlatformsList,
          tone,
          audience: audience || 'general'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to generate content');
      }

      const data = await response.json();

      if (data.success) {
        setResults(data.data);
        setActiveTab(selectedPlatformsList[0]);
      } else {
        setError('Failed to generate content. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyContent = (platform) => {
    const textToCopy = results[platform];
    navigator.clipboard.writeText(textToCopy);
    setCopiedPlatform(platform);
    setTimeout(() => setCopiedPlatform(null), 2000);
  };

  const handleDownloadContent = () => {
    if (!results) return;

    const platformNames = {
      linkedin: 'LinkedIn',
      instagram: 'Instagram',
      youtube: 'YouTube',
      tiktok: 'TikTok'
    };

    let fileContent = 'REPURPOSED CONTENT\n';
    fileContent += '==================\n\n';

    Object.keys(results).forEach((platform) => {
      fileContent += `${platformNames[platform]}\n`;
      fileContent += '-'.repeat(platform.length) + '\n';
      fileContent += results[platform] + '\n\n';
    });

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(fileContent));
    element.setAttribute('download', 'repurposed_content.txt');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleRegenerate = () => {
    setResults(null);
    setError(null);
  };

  const handleGenerateVariations = async () => {
    setGeneratingVariations(true);
    setError(null);

    try {
      const selectedPlatformsList = Object.keys(selectedPlatforms).filter(
        (p) => selectedPlatforms[p]
      );

      if (selectedPlatformsList.length === 0) {
        setError('Please select at least one platform');
        setGeneratingVariations(false);
        return;
      }

      const contentToUse = inputMode === 'youtube' ? extractedTranscript : content.trim();

      if (!contentToUse) {
        setError('Please enter some content');
        setGeneratingVariations(false);
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/ai-repurposer/generate-variations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: contentToUse,
          platforms: selectedPlatformsList,
          tone,
          audience: audience || 'general'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to generate variations');
      }

      const data = await response.json();

      if (data.success) {
        setVariations(data.variations);
        setActiveVariation(0);
        setResults(null);
      } else {
        setError('Failed to generate variations. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
      console.error('Error:', err);
    } finally {
      setGeneratingVariations(false);
    }
  };

  return (
    <div style={{ background: '#F9F7F4', minHeight: '100vh', padding: '2rem' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#051730', margin: 0, marginBottom: '0.5rem' }}>
              🤖 Content Repurposer AI
            </h1>
            <p style={{ fontSize: '16px', color: '#6B7280', margin: 0 }}>
              Transform your content for multiple platforms with AI intelligence
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
              cursor: 'pointer',
              transition: 'opacity 0.2s'
            }}
            onMouseEnter={(e) => (e.target.style.opacity = '0.9')}
            onMouseLeave={(e) => (e.target.style.opacity = '1')}
          >
            <Home size={16} />
            Home
          </button>
        </div>

        {/* API Health Status */}
        {apiHealthy === false && (
          <div
            style={{
              background: '#FEE2E2',
              border: '1px solid #FCA5A5',
              color: '#991B1B',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}
          >
            <AlertCircle size={20} />
            <span>
              ⚠️ AI Service Unavailable: OpenAI API not configured. Check that backend is running and OPENAI_API_KEY is set in .env
            </span>
          </div>
        )}

        {/* AI Disclosure - EU AI Act Compliance */}
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
          <strong>⚠️ AI-Generated Content Disclosure:</strong> This feature uses OpenAI's GPT-4 Turbo to intelligently
          repurpose your content. While AI-generated output is high-quality, please review it before publishing as it may
          need adjustments for your specific needs. Each version is optimized for its respective platform.
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {/* Input Section */}
          <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#051730', marginBottom: '1rem', margin: 0 }}>
              📝 Original Content
            </h2>

            {/* Input Mode Toggle */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid #E5E7EB', paddingBottom: '1rem' }}>
              <button
                onClick={() => {
                  handleModeChange('text');
                  setYoutubeUrl('');
                  setExtractedTranscript(null);
                }}
                style={{
                  padding: '0.5rem 1rem',
                  background: inputMode === 'text' ? '#FF8C2E' : '#F3F4F6',
                  color: inputMode === 'text' ? 'white' : '#051730',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  transition: 'all 0.2s'
                }}
              >
                📝 Paste Text
              </button>
              <button
                onClick={() => {
                  handleModeChange('youtube');
                  setContent('');
                }}
                style={{
                  padding: '0.5rem 1rem',
                  background: inputMode === 'youtube' ? '#FF8C2E' : '#F3F4F6',
                  color: inputMode === 'youtube' ? 'white' : '#051730',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  transition: 'all 0.2s'
                }}
              >
                🎬 YouTube Link
              </button>
            </div>

            {/* Text Input Mode */}
            {inputMode === 'text' ? (
              <>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Paste your blog post, article, or any content here... (minimum 50 characters)"
                  style={{
                    width: '100%',
                    minHeight: '200px',
                    padding: '1rem',
                    border: '1px solid #E5E7EB',
                    borderRadius: '6px',
                    fontFamily: 'Arial, sans-serif',
                    fontSize: '14px',
                    color: '#051730',
                    resize: 'vertical',
                    marginBottom: '1rem',
                    boxSizing: 'border-box'
                  }}
                />

                <div style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '1.5rem' }}>
                  {content.length} characters | {Math.ceil(content.split(/\s+/).length)} words
                </div>
              </>
            ) : (
              <>
                <div style={{ marginBottom: '1rem' }}>
                  <input
                    type="text"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="e.g., https://www.youtube.com/watch?v=abc123 or https://youtu.be/abc123"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #E5E7EB',
                      borderRadius: '6px',
                      fontSize: '14px',
                      color: '#051730',
                      boxSizing: 'border-box',
                      marginBottom: '0.75rem'
                    }}
                  />
                  <button
                    onClick={handleExtractYouTube}
                    disabled={!youtubeUrl || extracting}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: extracting || !youtubeUrl ? '#D1D5DB' : '#FF8C2E',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: '600',
                      cursor: extracting || !youtubeUrl ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      fontSize: '14px'
                    }}
                  >
                    {extracting ? (
                      <>
                        <Loader size={16} style={{ animation: 'spin 2s linear infinite' }} />
                        Extracting Transcript...
                      </>
                    ) : (
                      <>
                        <Link size={16} />
                        Extract Transcript
                      </>
                    )}
                  </button>
                </div>

                {extractedTranscript && (
                  <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#ECFDF5', border: '2px solid #10B981', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '13px', fontWeight: '600', color: '#047857' }}>✅ Transcript extracted! ({extractedTranscript.length} characters)</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#374151', background: 'white', padding: '0.5rem 0.75rem', borderRadius: '6px', maxHeight: '80px', overflowY: 'auto', marginBottom: '0.75rem', lineHeight: '1.5' }}>
                      {extractedTranscript.slice(0, 200)}...
                    </div>
                    <p style={{ fontSize: '12px', color: '#047857', margin: 0 }}>
                      ✨ Ready — click <strong>Generate Content</strong> below to repurpose this transcript.
                    </p>
                  </div>
                )}
              </>
            )}

            {/* Platform Selection */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '1rem', color: '#051730' }}>
                ✨ Select Platforms
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {platforms.map((platform) => (
                  <label
                    key={platform}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      cursor: 'pointer',
                      padding: '0.75rem',
                      background: selectedPlatforms[platform] ? '#FFF7ED' : '#F9FAFB',
                      borderRadius: '6px',
                      border: selectedPlatforms[platform] ? '1px solid #FF8C2E' : '1px solid #E5E7EB',
                      transition: 'all 0.2s'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedPlatforms[platform]}
                      onChange={(e) =>
                        setSelectedPlatforms({ ...selectedPlatforms, [platform]: e.target.checked })
                      }
                      style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                    />
                    <span style={{ textTransform: 'capitalize', fontWeight: '500', fontSize: '14px', color: '#051730' }}>
                      {platform}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Tone Selection */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#051730' }}>
                🎯 Tone/Style
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
                  boxSizing: 'border-box'
                }}
              >
                <option value="professional">Professional</option>
                <option value="casual">Casual & Friendly</option>
                <option value="fun">Fun & Playful</option>
                <option value="serious">Serious & Formal</option>
                <option value="inspirational">Inspirational</option>
              </select>
            </div>

            {/* Audience */}
            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#051730' }}>
                👥 Target Audience (Optional)
              </label>
              <input
                type="text"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                placeholder="e.g., tech entrepreneurs, students, small business owners..."
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #E5E7EB',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerateContent}
              disabled={!(content || extractedTranscript) || loading || apiHealthy === false}
              style={{
                width: '100%',
                padding: '0.75rem',
                background:
                  apiHealthy === false || loading ? '#D1D5DB' : '#FF8C2E',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontWeight: '600',
                cursor:
                  apiHealthy === false || loading || !(content || extractedTranscript) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontSize: '16px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!loading && apiHealthy !== false) e.target.style.opacity = '0.9';
              }}
              onMouseLeave={(e) => {
                if (!loading && apiHealthy !== false) e.target.style.opacity = '1';
              }}
            >
              {loading ? (
                <>
                  <Loader size={20} style={{ animation: 'spin 2s linear infinite' }} />
                  Generating...
                </>
              ) : (
                <>
                  <span>🚀 Generate Content</span>
                </>
              )}
            </button>

            {/* Generate Variations Button */}
            <button
              onClick={handleGenerateVariations}
              disabled={!(content || extractedTranscript) || generatingVariations || apiHealthy === false}
              style={{
                width: '100%',
                marginTop: '0.75rem',
                padding: '0.75rem',
                background:
                  apiHealthy === false || generatingVariations ? '#D1D5DB' : '#49A9DE',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontWeight: '600',
                cursor:
                  apiHealthy === false || generatingVariations || !(content || extractedTranscript) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontSize: '16px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!generatingVariations && apiHealthy !== false) e.target.style.opacity = '0.9';
              }}
              onMouseLeave={(e) => {
                if (!generatingVariations && apiHealthy !== false) e.target.style.opacity = '1';
              }}
            >
              {generatingVariations ? (
                <>
                  <Loader size={20} style={{ animation: 'spin 2s linear infinite' }} />
                  Generating Variations...
                </>
              ) : (
                <>
                  <span>✨ Generate 3 Variations</span>
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
            {results ? (
              <>
                <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '1.5rem', color: '#051730', margin: 0 }}>
                  ✨ Generated Content
                </h2>

                {/* Platform Tabs */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                  {Object.keys(results).map((platform) => (
                    <button
                      key={platform}
                      onClick={() => setActiveTab(platform)}
                      style={{
                        padding: '0.5rem 1rem',
                        background: activeTab === platform ? '#FF8C2E' : '#F3F4F6',
                        color: activeTab === platform ? 'white' : '#051730',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '500',
                        textTransform: 'capitalize',
                        fontSize: '14px',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        if (activeTab !== platform) e.target.style.background = '#E5E7EB';
                      }}
                      onMouseLeave={(e) => {
                        if (activeTab !== platform) e.target.style.background = '#F3F4F6';
                      }}
                    >
                      {platform}
                    </button>
                  ))}
                </div>

                {/* Result Display */}
                <div
                  style={{
                    background: '#F9FAFB',
                    padding: '1rem',
                    borderRadius: '6px',
                    minHeight: '200px',
                    maxHeight: '350px',
                    overflowY: 'auto',
                    marginBottom: '1.5rem',
                    border: '1px solid #E5E7EB',
                    whiteSpace: 'pre-wrap',
                    wordWrap: 'break-word',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    color: '#333'
                  }}
                >
                  {results[activeTab] || `Content for ${activeTab} not available`}
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                  <button
                    onClick={() => handleCopyContent(activeTab)}
                    style={{
                      padding: '0.75rem',
                      background: copiedPlatform === activeTab ? '#10B981' : '#E5E7EB',
                      color: copiedPlatform === activeTab ? 'white' : '#051730',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      transition: 'all 0.2s'
                    }}
                  >
                    {copiedPlatform === activeTab ? (
                      <>
                        <Check size={16} /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={16} /> Copy
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleDownloadContent}
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
                      gap: '0.5rem',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => (e.target.style.background = '#D1D5DB')}
                    onMouseLeave={(e) => (e.target.style.background = '#E5E7EB')}
                  >
                    <Download size={16} /> Download All
                  </button>

                  <button
                    onClick={handleRegenerate}
                    style={{
                      padding: '0.75rem',
                      background: '#FF8C2E',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => (e.target.style.opacity = '0.9')}
                    onMouseLeave={(e) => (e.target.style.opacity = '1')}
                  >
                    <RefreshCw size={16} /> Regenerate
                  </button>
                </div>

                {/* AI Metadata */}
                <div
                  style={{
                    marginTop: '1.5rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid #E5E7EB',
                    fontSize: '12px',
                    color: '#9CA3AF'
                  }}
                >
                  <p style={{ margin: '0.25rem 0' }}>
                    ✅ <strong>Generated with:</strong> OpenAI GPT-4 Turbo
                  </p>
                  <p style={{ margin: '0.25rem 0' }}>
                    ✅ <strong>Optimized for:</strong> {Object.keys(results).join(', ')}
                  </p>
                  <p style={{ margin: '0.25rem 0' }}>
                    ✅ <strong>Tone:</strong> {tone}
                  </p>
                </div>
              </>
            ) : variations ? (
              <>
                <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '1.5rem', color: '#051730', margin: 0 }}>
                  ✨ 3 Content Variations
                </h2>

                {/* Variation Tabs */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                  {variations.map((variation, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveVariation(index)}
                      style={{
                        padding: '0.5rem 1rem',
                        background: activeVariation === index ? '#49A9DE' : '#F3F4F6',
                        color: activeVariation === index ? 'white' : '#051730',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '500',
                        textTransform: 'capitalize',
                        fontSize: '14px',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        if (activeVariation !== index) e.target.style.background = '#E5E7EB';
                      }}
                      onMouseLeave={(e) => {
                        if (activeVariation !== index) e.target.style.background = '#F3F4F6';
                      }}
                    >
                      {variation.style === 'short' && '⚡ Short'}
                      {variation.style === 'long' && '📝 Long (w/ Hacks)'}
                      {variation.style === 'professional' && '💼 Professional'}
                    </button>
                  ))}
                </div>

                {/* Platform Tabs for Selected Variation */}
                {activeVariation !== null && (
                  <>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                      {Object.keys(variations[activeVariation].content).map((platform) => (
                        <button
                          key={platform}
                          onClick={() => setActiveTab(platform)}
                          style={{
                            padding: '0.5rem 1rem',
                            background: activeTab === platform ? '#FF8C2E' : '#F3F4F6',
                            color: activeTab === platform ? 'white' : '#051730',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '500',
                            textTransform: 'capitalize',
                            fontSize: '14px',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            if (activeTab !== platform) e.target.style.background = '#E5E7EB';
                          }}
                          onMouseLeave={(e) => {
                            if (activeTab !== platform) e.target.style.background = '#F3F4F6';
                          }}
                        >
                          {platform}
                        </button>
                      ))}
                    </div>

                    {/* Variation Content Display */}
                    <div
                      style={{
                        background: '#F9FAFB',
                        padding: '1rem',
                        borderRadius: '6px',
                        minHeight: '200px',
                        maxHeight: '350px',
                        overflowY: 'auto',
                        marginBottom: '1.5rem',
                        border: '1px solid #E5E7EB',
                        whiteSpace: 'pre-wrap',
                        wordWrap: 'break-word',
                        fontSize: '14px',
                        lineHeight: '1.6',
                        color: '#333'
                      }}
                    >
                      {variations[activeVariation].content[activeTab] || `Content not available`}
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(variations[activeVariation].content[activeTab]);
                          setCopiedPlatform(`${activeVariation}-${activeTab}`);
                          setTimeout(() => setCopiedPlatform(null), 2000);
                        }}
                        style={{
                          padding: '0.75rem',
                          background: copiedPlatform === `${activeVariation}-${activeTab}` ? '#10B981' : '#E5E7EB',
                          color: copiedPlatform === `${activeVariation}-${activeTab}` ? 'white' : '#051730',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem',
                          transition: 'all 0.2s'
                        }}
                      >
                        {copiedPlatform === `${activeVariation}-${activeTab}` ? (
                          <>
                            <Check size={16} /> Copied!
                          </>
                        ) : (
                          <>
                            <Copy size={16} /> Copy
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => setVariations(null)}
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
                          gap: '0.5rem',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => (e.target.style.background = '#D1D5DB')}
                        onMouseLeave={(e) => (e.target.style.background = '#E5E7EB')}
                      >
                        <RefreshCw size={16} /> Back
                      </button>

                      <button
                        onClick={() => {
                          let fileContent = 'VARIATIONS - ' + (activeVariation === 0 ? 'SHORT' : activeVariation === 1 ? 'LONG' : 'PROFESSIONAL') + '\n';
                          fileContent += '==================\n\n';
                          Object.keys(variations[activeVariation].content).forEach((platform) => {
                            fileContent += `${platform.toUpperCase()}\n`;
                            fileContent += '-'.repeat(platform.length) + '\n';
                            fileContent += variations[activeVariation].content[platform] + '\n\n';
                          });
                          const element = document.createElement('a');
                          element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(fileContent));
                          element.setAttribute('download', `variation-${activeVariation}.txt`);
                          element.style.display = 'none';
                          document.body.appendChild(element);
                          element.click();
                          document.body.removeChild(element);
                        }}
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
                          gap: '0.5rem',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => (e.target.style.background = '#D1D5DB')}
                        onMouseLeave={(e) => (e.target.style.background = '#E5E7EB')}
                      >
                        <Download size={16} /> Download
                      </button>
                    </div>
                  </>
                )}
              </>
            ) : (
              <div style={{ textAlign: 'center', color: '#9CA3AF', paddingTop: '4rem' }}>
                <p style={{ fontSize: '64px', marginBottom: '1rem' }}>✍️</p>
                <p style={{ fontSize: '16px', marginBottom: '0.5rem' }}>
                  Enter your content and click "Generate" to see repurposed versions
                </p>
                <p style={{ fontSize: '13px', color: '#D1D5DB' }}>
                  Or use "Generate 3 Variations" for multiple versions
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
