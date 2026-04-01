import React, { useState } from 'react';
import { Home } from 'lucide-react';

export default function ContentRepurposer({ onNavigate }) {
  const [contentIdea, setContentIdea] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [topic, setTopic] = useState('');
  const [niche, setNiche] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [creatorName, setCreatorName] = useState('');
  const [inputMode, setInputMode] = useState('paste'); // 'paste' or 'youtube'

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [activeTab, setActiveTab] = useState('tiktok');
  const [error, setError] = useState('');
  const [showInstagramVariations, setShowInstagramVariations] = useState(false);
  const [extractingYoutube, setExtractingYoutube] = useState(false);
  const [youtubeTranscript, setYoutubeTranscript] = useState(null);

  const handleExtractYoutube = async () => {
    setExtractingYoutube(true);
    setError('');

    try {
      if (!youtubeUrl.trim()) {
        throw new Error('Please enter a YouTube URL');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/repurpose/extract-youtube`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          youtube_url: youtubeUrl,
          content_title: youtubeUrl,
          topic: topic || 'Video Content',
          niche: niche || 'General',
          target_audience: targetAudience || 'General audience',
          creator_name: creatorName || 'User'
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to extract YouTube transcript');
      }

      const data = await response.json();
      setYoutubeTranscript(data);
      // Don't auto-populate contentIdea - keep it separate
      setError('');
    } catch (err) {
      setError(err.message);
      console.error('YouTube extraction error:', err);
    } finally {
      setExtractingYoutube(false);
    }
  };

  const handleGenerateRepurpose = async () => {
    setLoading(true);
    setError('');

    try {
      // Determine which content to use: Paste Text or YouTube Transcript
      const contentToUse = contentIdea.trim() || youtubeTranscript?.original_content || '';

      if (!contentToUse) {
        throw new Error('Please enter your content idea or extract from YouTube');
      }
      if (contentToUse.length < 50) {
        throw new Error('Content must be at least 50 characters long');
      }
      if (!topic.trim() || !niche.trim()) {
        throw new Error('Please enter topic and niche');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/repurpose/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          creator_name: creatorName || 'User',
          content_title: youtubeTranscript?.video_title || contentIdea || 'Content',
          original_content: contentToUse,
          content_type: youtubeTranscript ? 'video' : 'blog',
          topic: topic,
          niche: niche,
          target_audience: targetAudience || 'General audience'
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      const data = await response.json();
      setResults(data);
      setActiveTab('tiktok');
    } catch (err) {
      setError(err.message);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const handleExport = async (format) => {
    if (!results) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/repurpose/export/${results.repurpose_id}/${format}`,
        { method: 'GET' }
      );

      const data = await response.json();
      const element = document.createElement('a');
      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2)));
      element.setAttribute('download', `${results.content_title}-${format}.json`);
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } catch (err) {
      alert('Export failed: ' + err.message);
    }
  };

  // Input Section
  if (!results) {
    return (
      <div style={{ background: '#F9F7F4', minHeight: '100vh' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
          {/* Header with Home Button */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div>
              <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#051730', margin: '0 0 0.5rem 0' }}>🔄 Content Repurposer</h1>
              <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>Convert 1 piece of content into 7 different formats</p>
            </div>
            <button
              onClick={() => {
                window.history.pushState({}, '', '?page=home');
                onNavigate?.('home');
              }}
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
              onMouseEnter={e => e.target.style.opacity = '0.9'}
              onMouseLeave={e => e.target.style.opacity = '1'}
            >
              <Home size={16} />
              Home
            </button>
          </div>

          {/* Mode Switcher */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
            <button
              onClick={() => {
                setInputMode('paste');
                setYoutubeUrl('');
              }}
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
                background: inputMode === 'paste' ? '#FF8C2E' : 'white',
                color: inputMode === 'paste' ? 'white' : '#051730',
                border: inputMode === 'paste' ? 'none' : '1px solid #E5E7EB',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              📝 Paste Content
            </button>
            <button
              onClick={() => {
                setInputMode('youtube');
                setContentIdea('');
              }}
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
                background: inputMode === 'youtube' ? '#FF8C2E' : 'white',
                color: inputMode === 'youtube' ? 'white' : '#051730',
                border: inputMode === 'youtube' ? 'none' : '1px solid #E5E7EB',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              🎬 YouTube Link
            </button>
          </div>

          {/* Main Form */}
          <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              {/* Topic */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#051730', marginBottom: '0.5rem' }}>Topic</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Productivity, Time Management"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    fontSize: '14px',
                    background: '#F9F7F4',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    color: '#051730',
                    outline: 'none'
                  }}
                  onFocus={e => e.target.style.borderColor = '#FF8C2E'}
                  onBlur={e => e.target.style.borderColor = '#E5E7EB'}
                />
              </div>

              {/* Niche */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#051730', marginBottom: '0.5rem' }}>Niche</label>
                <input
                  type="text"
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  placeholder="e.g., Business, Personal Development"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    fontSize: '14px',
                    background: '#F9F7F4',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    color: '#051730',
                    outline: 'none'
                  }}
                  onFocus={e => e.target.style.borderColor = '#FF8C2E'}
                  onBlur={e => e.target.style.borderColor = '#E5E7EB'}
                />
              </div>

              {/* Creator Name */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#051730', marginBottom: '0.5rem' }}>Your Name</label>
                <input
                  type="text"
                  value={creatorName}
                  onChange={(e) => setCreatorName(e.target.value)}
                  placeholder="Your name"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    fontSize: '14px',
                    background: '#F9F7F4',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    color: '#051730',
                    outline: 'none'
                  }}
                  onFocus={e => e.target.style.borderColor = '#FF8C2E'}
                  onBlur={e => e.target.style.borderColor = '#E5E7EB'}
                />
              </div>

              {/* Target Audience */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#051730', marginBottom: '0.5rem' }}>Target Audience</label>
                <input
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="e.g., Professionals, Entrepreneurs"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    fontSize: '14px',
                    background: '#F9F7F4',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    color: '#051730',
                    outline: 'none'
                  }}
                  onFocus={e => e.target.style.borderColor = '#FF8C2E'}
                  onBlur={e => e.target.style.borderColor = '#E5E7EB'}
                />
              </div>
            </div>

            {/* YouTube Link Input */}
            {inputMode === 'youtube' && (
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#051730', marginBottom: '0.5rem' }}>
                  🎬 YouTube Video Link
                </label>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                  <input
                    type="url"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="e.g., https://www.youtube.com/watch?v=..."
                    style={{
                      flex: 1,
                      padding: '0.75rem 1rem',
                      fontSize: '14px',
                      background: '#F9F7F4',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      color: '#051730',
                      outline: 'none'
                    }}
                    onFocus={e => e.target.style.borderColor = '#FF8C2E'}
                    onBlur={e => e.target.style.borderColor = '#E5E7EB'}
                  />
                  <button
                    onClick={handleExtractYoutube}
                    disabled={extractingYoutube}
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: '#FF8C2E',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '600',
                      fontSize: '14px',
                      cursor: extractingYoutube ? 'not-allowed' : 'pointer',
                      opacity: extractingYoutube ? 0.6 : 1,
                      transition: 'all 0.3s'
                    }}
                  >
                    {extractingYoutube ? '⏳ Extracting...' : '📥 Extract'}
                  </button>
                </div>
                <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '1rem' }}>Paste a YouTube link and we'll extract the transcript automatically</p>

                {/* Show extracted transcript separately */}
                {youtubeTranscript && (
                  <div style={{ background: '#ECFDF5', border: '2px solid #10B981', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <p style={{ fontSize: '12px', fontWeight: '600', color: '#047857', margin: 0 }}>✅ Transcript Extracted Successfully</p>
                      <button
                        onClick={() => {
                          setContentIdea(youtubeTranscript.original_content);
                          setInputMode('paste');
                        }}
                        style={{
                          padding: '0.5rem 1rem',
                          background: '#10B981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        Use This Content
                      </button>
                    </div>
                    <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '0.5rem' }}>
                      {youtubeTranscript.transcript_length} characters | {youtubeTranscript.transcript_length && Math.ceil(youtubeTranscript.transcript_length / 5)} words
                    </p>
                    <div style={{ background: 'white', border: '1px solid #D1FAE5', borderRadius: '6px', padding: '0.75rem', maxHeight: '150px', overflowY: 'auto' }}>
                      <p style={{ fontSize: '13px', color: '#051730', lineHeight: '1.5', margin: 0 }}>
                        {youtubeTranscript.transcript_preview}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Paste Content Input */}
            {inputMode === 'paste' && (
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#051730', marginBottom: '0.5rem' }}>
                  📝 Your Content (Minimum 50 characters)
                </label>
                <textarea
                  value={contentIdea}
                  onChange={(e) => setContentIdea(e.target.value)}
                  placeholder="Paste your blog post, article, transcript, or any content here. We'll convert it into 7 different formats..."
                  rows={6}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    fontSize: '14px',
                    background: '#F9F7F4',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    color: '#051730',
                    outline: 'none',
                    fontFamily: 'inherit',
                    resize: 'none'
                  }}
                  onFocus={e => e.target.style.borderColor = '#FF8C2E'}
                  onBlur={e => e.target.style.borderColor = '#E5E7EB'}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                  <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>
                    Paste your content here to get started
                  </p>
                  <p style={{ fontSize: '12px', fontWeight: '600', color: contentIdea.length < 50 ? '#EF4444' : '#10B981', margin: 0 }}>
                    {contentIdea.length}/50 characters
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: '8px', padding: '0.75rem', marginBottom: '1rem', color: '#DC2626', fontSize: '14px' }}>
                {error}
              </div>
            )}

            {/* Generate Button */}
            <button
              onClick={handleGenerateRepurpose}
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.875rem 1.5rem',
                background: loading ? '#9CA3AF' : '#FF8C2E',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '16px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                transition: 'all 0.3s'
              }}
            >
              {loading ? '⏳ Generating...' : '🚀 Generate 7 Formats'}
            </button>

            {loading && (
              <div style={{ marginTop: '1rem', padding: '1rem', background: '#DBEAFE', border: '1px solid #93C5FD', borderRadius: '8px' }}>
                <p style={{ color: '#1E40AF', textAlign: 'center', fontSize: '14px', fontWeight: '600', marginBottom: '0.5rem' }}>
                  🤖 Generating your 7 content formats...
                </p>
                <p style={{ color: '#1E40AF', textAlign: 'center', fontSize: '12px', marginBottom: '0.75rem' }}>This usually takes 1-2 minutes</p>
                <div style={{ width: '100%', background: '#BFD BE7', borderRadius: '9999px', height: '8px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: '#49A9DE', animation: 'pulse 2s infinite' }}></div>
                </div>
              </div>
            )}

            {extractingYoutube && (
              <div style={{ marginTop: '1rem', padding: '1rem', background: '#DBEAFE', border: '1px solid #93C5FD', borderRadius: '8px' }}>
                <p style={{ color: '#1E40AF', textAlign: 'center', fontSize: '14px', fontWeight: '600', marginBottom: '0.5rem' }}>
                  🎬 Extracting YouTube transcript...
                </p>
                <p style={{ color: '#1E40AF', textAlign: 'center', fontSize: '12px', marginBottom: '0.75rem' }}>This should take a few seconds</p>
                <div style={{ width: '100%', background: '#BFDBFE', borderRadius: '9999px', height: '8px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: '#49A9DE', animation: 'pulse 2s infinite' }}></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Results Section
  return (
    <div style={{ minHeight: '100vh', background: '#F9F7F4' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '1rem' }}>
        {/* Home Button */}
        <button
          onClick={() => {
            setResults(null);
            window.history.pushState({}, '', '?page=home');
            onNavigate('home');
          }}
          style={{
            padding: '0.5rem 1rem',
            background: '#49A9DE',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            marginBottom: '1.5rem',
            transition: 'all 0.3s'
          }}
          onMouseEnter={e => e.target.style.opacity = '0.9'}
          onMouseLeave={e => e.target.style.opacity = '1'}
        >
          🏠 Back to Home
        </button>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#051730', marginBottom: '0.5rem' }}>✨ Your Content is Ready!</h2>
            <p style={{ fontSize: '12px', color: '#6B7280' }}>Processing time: {results.processing_time_seconds?.toFixed(1)}s</p>
          </div>
          <button
            onClick={() => setResults(null)}
            style={{
              padding: '0.5rem 1rem',
              background: '#FF8C2E',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
            onMouseEnter={e => e.target.style.opacity = '0.9'}
            onMouseLeave={e => e.target.style.opacity = '1'}
          >
            ← Start Over
          </button>
        </div>

        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {[
            { icon: '📱', label: 'TikTok Scripts', count: results.summary?.tiktok_scripts || 3 },
            { icon: '🖼️', label: 'Instagram Captions', count: results.summary?.instagram_captions || 5 },
            { icon: '🧵', label: 'Twitter Tweets', count: results.summary?.twitter_tweets || 8 },
            { icon: '📝', label: 'Blog Post', count: '1500+ words' },
            { icon: '📧', label: 'Email Scripts', count: 3 },
            { icon: '🎙️', label: 'Podcast Notes', count: 'Full' },
            { icon: '💼', label: 'LinkedIn Post', count: '1' },
            { icon: '⏰', label: 'Posting Times', count: '7 platforms' },
          ].map((card, idx) => (
            <div key={idx} style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '1rem' }}>
              <div style={{ fontSize: '24px', marginBottom: '0.5rem' }}>{card.icon}</div>
              <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '0.25rem' }}>{card.label}</p>
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#051730' }}>{card.count}</p>
            </div>
          ))}
        </div>

        {/* Tabs Navigation */}
        <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '8px', overflow: 'hidden', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', padding: '1rem', background: 'white', borderBottom: '1px solid #E5E7EB', overflowX: 'auto' }}>
            {[
              { id: 'tiktok', label: 'TikTok', emoji: '📱' },
              { id: 'instagram', label: 'Instagram', emoji: '🖼️' },
              { id: 'twitter', label: 'Twitter', emoji: '🧵' },
              { id: 'blog', label: 'Blog', emoji: '📝' },
              { id: 'email', label: 'Email', emoji: '📧' },
              { id: 'podcast', label: 'Podcast', emoji: '🎙️' },
              { id: 'linkedin', label: 'LinkedIn', emoji: '💼' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  border: 'none',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  background: activeTab === tab.id ? '#FF8C2E' : '#F3F4F6',
                  color: activeTab === tab.id ? 'white' : '#6B7280',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={e => {
                  if (activeTab !== tab.id) {
                    e.target.style.background = '#E5E7EB';
                  }
                }}
                onMouseLeave={e => {
                  if (activeTab !== tab.id) {
                    e.target.style.background = '#F3F4F6';
                  }
                }}
              >
                {tab.emoji} {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div style={{ padding: '1.5rem' }}>
            {/* TikTok */}
            {activeTab === 'tiktok' && (
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#051730', marginBottom: '1rem' }}>TikTok Scripts (3)</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {results.tiktok_scripts?.map((script, idx) => (
                    <div key={idx} style={{ background: '#F9F7F4', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                        <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#051730' }}>Script {idx + 1}</h4>
                        <span style={{ fontSize: '12px', background: '#E5E7EB', color: '#6B7280', padding: '0.25rem 0.75rem', borderRadius: '6px' }}>
                          {script.duration_seconds || '30'}s
                        </span>
                      </div>
                      <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '0.75rem' }}><strong>Hook:</strong> {script.hook || script.script?.substring(0, 50)}</p>
                      <p style={{ fontSize: '14px', color: '#051730', marginBottom: '1rem', lineHeight: '1.6' }}>{script.script}</p>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', color: '#6B7280' }}>⏰ {script.best_posting_time || 'Evening'}</span>
                        <button
                          onClick={() => handleCopyToClipboard(script.script)}
                          style={{
                            marginLeft: 'auto',
                            padding: '0.25rem 0.75rem',
                            background: '#FF8C2E',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.3s'
                          }}
                          onMouseEnter={e => e.target.style.opacity = '0.9'}
                          onMouseLeave={e => e.target.style.opacity = '1'}
                        >
                          📋 Copy
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => handleExport('tiktok')}
                  style={{
                    marginTop: '1rem',
                    padding: '0.75rem 1rem',
                    background: '#FF8C2E',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={e => e.target.style.opacity = '0.9'}
                  onMouseLeave={e => e.target.style.opacity = '1'}
                >
                  ⬇️ Export All
                </button>
              </div>
            )}

            {/* Instagram */}
            {activeTab === 'instagram' && (
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#051730', marginBottom: '1rem' }}>Instagram Captions (1 Main + 4 Variations)</h3>

                {/* Main Caption */}
                {results.instagram_captions && results.instagram_captions.length > 0 && (
                  <div style={{ marginBottom: '1rem', background: '#FFFFFF', border: '2px solid #FF8C2E', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #FF8C2E' }}>
                      <span style={{ fontSize: '24px' }}>⭐</span>
                      <h4 style={{ fontSize: '18px', fontWeight: '700', color: '#FF8C2E' }}>MAIN CAPTION</h4>
                    </div>

                    {/* Hook Line */}
                    {results.instagram_captions[0].hook && (
                      <div style={{ marginBottom: '1rem', padding: '1rem', background: '#FFF5F0', borderRadius: '8px', borderLeft: '4px solid #FF8C2E' }}>
                        <p style={{ fontSize: '16px', fontWeight: '700', color: '#051730', fontStyle: 'italic', lineHeight: '1.6' }}>{results.instagram_captions[0].hook}</p>
                      </div>
                    )}

                    {/* Main Content with Formatting */}
                    <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#F9F7F4', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                      <p style={{ fontSize: '14px', color: '#051730', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>{results.instagram_captions[0].content}</p>
                    </div>

                    {/* CTA */}
                    {results.instagram_captions[0].cta && (
                      <div style={{ marginBottom: '1rem', padding: '1rem', background: '#ECFDF5', border: '1px solid #86EFAC', borderRadius: '8px' }}>
                        <p style={{ fontSize: '14px', fontWeight: '700', color: '#16A34A', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                          <span style={{ fontSize: '18px' }}>💾</span>
                          {results.instagram_captions[0].cta}
                        </p>
                      </div>
                    )}

                    {/* Hashtags */}
                    {results.instagram_captions[0].hashtags && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
                        {results.instagram_captions[0].hashtags.map((tag, i) => (
                          <span
                            key={i}
                            style={{
                              fontSize: '12px',
                              fontWeight: '600',
                              background: '#FF8C2E',
                              color: 'white',
                              padding: '0.375rem 0.75rem',
                              borderRadius: '9999px',
                              cursor: 'pointer',
                              transition: 'all 0.3s'
                            }}
                            onMouseEnter={e => e.target.style.opacity = '0.8'}
                            onMouseLeave={e => e.target.style.opacity = '1'}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Copy Button */}
                    <button
                      onClick={() => {
                        const fullCaption = [
                          results.instagram_captions[0].hook,
                          results.instagram_captions[0].content,
                          results.instagram_captions[0].cta,
                          results.instagram_captions[0].hashtags?.join(' ')
                        ].filter(Boolean).join('\n\n');
                        handleCopyToClipboard(fullCaption);
                      }}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        background: '#FF8C2E',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.3s'
                      }}
                      onMouseEnter={e => e.target.style.opacity = '0.9'}
                      onMouseLeave={e => e.target.style.opacity = '1'}
                    >
                      📋 Copy Main Caption
                    </button>
                  </div>
                )}

                {/* Other Variations */}
                {results.instagram_captions && results.instagram_captions.length > 1 && (
                  <div style={{ marginTop: '1rem' }}>
                    <button
                      onClick={() => setShowInstagramVariations(!showInstagramVariations)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: '#E5E7EB',
                        color: '#051730',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        marginBottom: '1rem',
                        transition: 'all 0.3s'
                      }}
                      onMouseEnter={e => e.target.style.background = '#D1D5DB'}
                      onMouseLeave={e => e.target.style.background = '#E5E7EB'}
                    >
                      {showInstagramVariations ? '▼' : '▶'} View {results.instagram_captions.length - 1} Other Variations
                    </button>

                    {showInstagramVariations && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {results.instagram_captions.slice(1).map((caption, idx) => (
                          <div key={idx} style={{ background: '#F9F7F4', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '1rem' }}>
                            <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#051730', marginBottom: '0.75rem' }}>Variation {idx + 2}</h4>

                            {/* Hook */}
                            <p style={{ fontSize: '12px', fontWeight: '600', color: '#6B7280', marginBottom: '0.75rem', fontStyle: 'italic' }}>{caption.hook}</p>

                            {/* Content */}
                            <p style={{ fontSize: '14px', color: '#051730', marginBottom: '0.75rem', lineHeight: '1.6', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>{caption.content}</p>

                            {/* CTA */}
                            {caption.cta && (
                              <p style={{ fontSize: '12px', color: '#16A34A', fontWeight: '600', marginBottom: '0.75rem' }}>🎯 {caption.cta}</p>
                            )}

                            {/* Hashtags */}
                            {caption.hashtags && (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                {caption.hashtags.map((tag, i) => (
                                  <span key={i} style={{ fontSize: '12px', background: '#E5E7EB', color: '#051730', padding: '0.25rem 0.5rem', borderRadius: '6px' }}>
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Copy Button */}
                            <button
                              onClick={() => {
                                const fullCaption = [
                                  caption.hook,
                                  caption.content,
                                  caption.cta,
                                  caption.hashtags?.join(' ')
                                ].filter(Boolean).join('\n\n');
                                handleCopyToClipboard(fullCaption);
                              }}
                              style={{
                                padding: '0.25rem 0.75rem',
                                background: '#FF8C2E',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.3s'
                              }}
                              onMouseEnter={e => e.target.opacity = '0.9'}
                              onMouseLeave={e => e.target.opacity = '1'}
                            >
                              📋 Copy
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <button
                  onClick={() => handleExport('instagram')}
                  style={{
                    marginTop: '1rem',
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: '#FF8C2E',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={e => e.target.style.opacity = '0.9'}
                  onMouseLeave={e => e.target.style.opacity = '1'}
                >
                  ⬇️ Export All
                </button>
              </div>
            )}

            {/* Twitter */}
            {activeTab === 'twitter' && (
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#051730', marginBottom: '1rem' }}>Twitter Thread</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {results.twitter_thread?.map((tweet, idx) => (
                    <div key={idx} style={{ background: '#F9F7F4', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '0.75rem' }}>
                      <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '0.5rem' }}>Tweet {idx + 1}/{results.twitter_thread.length}</p>
                      <p style={{ fontSize: '14px', color: '#051730', marginBottom: '0.75rem', lineHeight: '1.6' }}>{tweet}</p>
                      <button
                        onClick={() => handleCopyToClipboard(tweet)}
                        style={{
                          padding: '0.25rem 0.75rem',
                          background: '#FF8C2E',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.3s'
                        }}
                        onMouseEnter={e => e.target.style.opacity = '0.9'}
                        onMouseLeave={e => e.target.style.opacity = '1'}
                      >
                        📋 Copy
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => handleExport('twitter')}
                  style={{
                    marginTop: '1rem',
                    padding: '0.75rem 1rem',
                    background: '#FF8C2E',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={e => e.target.style.opacity = '0.9'}
                  onMouseLeave={e => e.target.style.opacity = '1'}
                >
                  ⬇️ Export Thread
                </button>
              </div>
            )}

            {/* Blog */}
            {activeTab === 'blog' && (
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#051730', marginBottom: '1rem' }}>Blog Post (1500+ words)</h3>
                <div style={{ background: '#F9F7F4', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '1rem', marginBottom: '1rem', maxHeight: '320px', overflowY: 'auto' }}>
                  <p style={{ fontSize: '14px', color: '#051730', lineHeight: '1.6', whiteSpace: 'pre-wrap', margin: 0 }}>{results.blog_post?.substring(0, 800)}...</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    onClick={() => handleExport('blog')}
                    style={{
                      flex: 1,
                      padding: '0.75rem 1rem',
                      background: '#FF8C2E',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s'
                    }}
                    onMouseEnter={e => e.target.style.opacity = '0.9'}
                    onMouseLeave={e => e.target.style.opacity = '1'}
                  >
                    ⬇️ Export Full Post
                  </button>
                  <button
                    onClick={() => handleCopyToClipboard(results.blog_post)}
                    style={{
                      flex: 1,
                      padding: '0.75rem 1rem',
                      background: '#E5E7EB',
                      color: '#051730',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s'
                    }}
                    onMouseEnter={e => e.target.style.background = '#D1D5DB'}
                    onMouseLeave={e => e.target.style.background = '#E5E7EB'}
                  >
                    📋 Copy All
                  </button>
                </div>
              </div>
            )}

            {/* Email */}
            {activeTab === 'email' && (
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#051730', marginBottom: '1rem' }}>Email Scripts (3 Versions)</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {results.email_scripts && (
                    <>
                      {Object.entries(results.email_scripts).map(([version, email]) => (
                        <div key={version} style={{ background: '#F9F7F4', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '1rem' }}>
                          <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#051730', marginBottom: '0.75rem', textTransform: 'capitalize' }}>{version} Version</h4>
                          <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '0.5rem' }}><strong>Subject:</strong> {email.subject}</p>
                          <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '0.75rem' }}><strong>Preview:</strong> {email.preview}</p>
                          <p style={{ fontSize: '14px', color: '#051730', marginBottom: '0.75rem', lineHeight: '1.6' }}>{email.body}</p>
                          <button
                            onClick={() => handleCopyToClipboard(email.body)}
                            style={{
                              padding: '0.25rem 0.75rem',
                              background: '#FF8C2E',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              transition: 'all 0.3s'
                            }}
                            onMouseEnter={e => e.target.style.opacity = '0.9'}
                            onMouseLeave={e => e.target.style.opacity = '1'}
                          >
                            📋 Copy
                          </button>
                        </div>
                      ))}
                    </>
                  )}
                </div>
                <button
                  onClick={() => handleExport('email')}
                  style={{
                    marginTop: '1rem',
                    padding: '0.75rem 1rem',
                    background: '#FF8C2E',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={e => e.target.style.opacity = '0.9'}
                  onMouseLeave={e => e.target.style.opacity = '1'}
                >
                  ⬇️ Export All Versions
                </button>
              </div>
            )}

            {/* Podcast */}
            {activeTab === 'podcast' && (
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#051730', marginBottom: '1rem' }}>Podcast Elements</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {results.podcast_notes && (
                    <>
                      {[
                        { key: 'intro', label: 'Intro Script' },
                        { key: 'show_notes', label: 'Show Notes' },
                        { key: 'outro', label: 'Outro Script' },
                      ].map(({ key, label }) => (
                        <div key={key} style={{ background: '#F9F7F4', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '1rem' }}>
                          <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#051730', marginBottom: '0.75rem' }}>{label}</h4>
                          <p style={{ fontSize: '14px', color: '#051730', marginBottom: '0.75rem', lineHeight: '1.6' }}>{results.podcast_notes[key]}</p>
                          <button
                            onClick={() => handleCopyToClipboard(results.podcast_notes[key])}
                            style={{
                              padding: '0.25rem 0.75rem',
                              background: '#FF8C2E',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              transition: 'all 0.3s'
                            }}
                            onMouseEnter={e => e.target.style.opacity = '0.9'}
                            onMouseLeave={e => e.target.style.opacity = '1'}
                          >
                            📋 Copy
                          </button>
                        </div>
                      ))}
                    </>
                  )}
                </div>
                <button
                  onClick={() => handleExport('podcast')}
                  style={{
                    marginTop: '1rem',
                    padding: '0.75rem 1rem',
                    background: '#FF8C2E',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={e => e.target.style.opacity = '0.9'}
                  onMouseLeave={e => e.target.style.opacity = '1'}
                >
                  ⬇️ Export All
                </button>
              </div>
            )}

            {/* LinkedIn */}
            {activeTab === 'linkedin' && (
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#051730', marginBottom: '1rem' }}>LinkedIn Post</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {results.linkedin_post && (
                    <>
                      <div style={{ background: '#F9F7F4', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '1rem' }}>
                        <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#051730', marginBottom: '0.75rem' }}>Main Post</h4>
                        <p style={{ fontSize: '14px', color: '#051730', marginBottom: '0.75rem', lineHeight: '1.6' }}>{results.linkedin_post.post}</p>
                        <button
                          onClick={() => handleCopyToClipboard(results.linkedin_post.post)}
                          style={{
                            padding: '0.25rem 0.75rem',
                            background: '#FF8C2E',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.3s'
                          }}
                          onMouseEnter={e => e.target.style.opacity = '0.9'}
                          onMouseLeave={e => e.target.style.opacity = '1'}
                        >
                          📋 Copy
                        </button>
                      </div>

                      {results.linkedin_post.comment_hooks && (
                        <div style={{ background: '#F9F7F4', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '1rem' }}>
                          <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#051730', marginBottom: '0.75rem' }}>Comment Hooks</h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {results.linkedin_post.comment_hooks.map((hook, idx) => (
                              <div key={idx} style={{ padding: '0.75rem', background: '#FFF5F0', borderRadius: '6px' }}>
                                <p style={{ fontSize: '14px', color: '#051730', marginBottom: '0.5rem' }}>💬 {hook}</p>
                                <button
                                  onClick={() => handleCopyToClipboard(hook)}
                                  style={{
                                    padding: '0.25rem 0.75rem',
                                    background: '#FF8C2E',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s'
                                  }}
                                  onMouseEnter={e => e.target.style.opacity = '0.9'}
                                  onMouseLeave={e => e.target.style.opacity = '1'}
                                >
                                  📋 Copy
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {results.linkedin_post.hashtags && (
                        <div style={{ background: '#F9F7F4', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '1rem' }}>
                          <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#051730', marginBottom: '0.75rem' }}>Hashtags</h4>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {results.linkedin_post.hashtags.map((tag, idx) => (
                              <span key={idx} style={{ fontSize: '12px', background: '#FF8C2E', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '6px' }}>
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
                <button
                  onClick={() => handleExport('linkedin')}
                  style={{
                    marginTop: '1rem',
                    padding: '0.75rem 1rem',
                    background: '#FF8C2E',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={e => e.target.style.opacity = '0.9'}
                  onMouseLeave={e => e.target.style.opacity = '1'}
                >
                  ⬇️ Export Post
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Metadata Section */}
        {(results.hashtags || results.best_posting_times || results.engagement_forecast) && (
          <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#051730', marginBottom: '1rem' }}>📊 Metadata</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {/* Hashtags */}
              {results.hashtags && (
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#051730', marginBottom: '0.75rem' }}>📍 Recommended Hashtags</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {Object.entries(results.hashtags).map(([platform, tags]) => (
                      <div key={platform}>
                        <p style={{ fontSize: '12px', fontWeight: '600', color: '#051730', marginBottom: '0.5rem' }}>{platform}</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                          {tags.map((tag, i) => (
                            <span key={i} style={{ fontSize: '12px', background: '#49A9DE', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '6px' }}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Posting Times */}
              {results.best_posting_times && (
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#051730', marginBottom: '0.75rem' }}>⏰ Best Posting Times</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {Object.entries(results.best_posting_times).map(([platform, time]) => (
                      <p key={platform} style={{ fontSize: '12px', color: '#051730', margin: 0 }}>
                        <strong>{platform}:</strong> {time}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Engagement Forecast */}
              {results.engagement_forecast && (
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#051730', marginBottom: '0.75rem' }}>📈 Engagement Forecast</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {Object.entries(results.engagement_forecast).map(([platform, metrics]) => (
                      <div key={platform}>
                        <p style={{ fontSize: '12px', fontWeight: '600', color: '#051730', marginBottom: '0.5rem' }}>{platform}</p>
                        <ul style={{ fontSize: '12px', color: '#6B7280', margin: 0, paddingLeft: '1.25rem' }}>
                          <li>Views: {metrics.views_range}</li>
                          <li>Engagement: {metrics.engagement_rate}</li>
                          <li>Conversion: {metrics.conversion}</li>
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
