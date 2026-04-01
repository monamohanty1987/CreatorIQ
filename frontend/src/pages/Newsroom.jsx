import React from 'react';
import { Home } from 'lucide-react';

export default function Newsroom({ onNavigate }) {
  return (
    <div style={{ background: '#F9F7F4', minHeight: '100vh' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 2rem' }}>
        {/* Header with Home Button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#051730', margin: 0 }}>Newsroom</h1>
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
            onMouseEnter={e => e.target.style.opacity = '0.9'}
            onMouseLeave={e => e.target.style.opacity = '1'}
          >
            <Home size={16} />
            Home
          </button>
        </div>

        {/* Content */}
        <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', lineHeight: '1.8', color: '#333' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#051730', marginTop: '0', marginBottom: '1rem' }}>
            Latest News
          </h2>

          <div style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#051730', margin: '0 0 0.5rem 0' }}>
              CreatorIQ Launches Green Tech Initiative
            </h3>
            <p style={{ color: '#6B7280', margin: '0 0 0.75rem 0', fontSize: '14px' }}>
              March 30, 2026
            </p>
            <p>
              CreatorIQ is proud to announce the launch of our green tech optimization initiative, reducing platform energy consumption by 75% while improving performance.
            </p>
          </div>

          <div style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#051730', margin: '0 0 0.5rem 0' }}>
              New Content Repurposer Features Available
            </h3>
            <p style={{ color: '#6B7280', margin: '0 0 0.75rem 0', fontSize: '14px' }}>
              March 15, 2026
            </p>
            <p>
              We've added YouTube link integration and improved Instagram content formatting to help creators save even more time.
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#051730', margin: '0 0 0.5rem 0' }}>
              CreatorIQ Platform Launch
            </h3>
            <p style={{ color: '#6B7280', margin: '0 0 0.75rem 0', fontSize: '14px' }}>
              January 10, 2026
            </p>
            <p>
              CreatorIQ officially launches with Dashboard, Content Repurposer, and Deal Analyzer tools to help creators maximize their success.
            </p>
          </div>

          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#051730', marginTop: '2rem', marginBottom: '1rem' }}>
            Media Inquiries
          </h2>
          <p>
            For press inquiries and media requests, please contact us at press@creatoriq.com
          </p>
        </div>
      </div>
    </div>
  );
}
