import React from 'react';
import { Home } from 'lucide-react';

export default function Careers({ onNavigate }) {
  return (
    <div style={{ background: '#F9F7F4', minHeight: '100vh' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 2rem' }}>
        {/* Header with Home Button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#051730', margin: 0 }}>Careers</h1>
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
            Join Our Team
          </h2>
          <p>
            CreatorIQ is looking for passionate individuals who want to help creators succeed. We're building a team of talented engineers, designers, and product enthusiasts.
          </p>

          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#051730', marginTop: '2rem', marginBottom: '1rem' }}>
            Why Work With Us
          </h2>
          <ul style={{ marginLeft: '1.5rem' }}>
            <li>Work on a product that helps thousands of creators</li>
            <li>Collaborative and supportive team environment</li>
            <li>Competitive compensation and benefits</li>
            <li>Remote-friendly work arrangements</li>
            <li>Continuous learning and professional development</li>
          </ul>

          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#051730', marginTop: '2rem', marginBottom: '1rem' }}>
            Open Positions
          </h2>
          <p>
            We're currently hiring for several positions including Full-Stack Engineers, Product Managers, and Content Strategists. For current openings and to apply, please visit careers@creatoriq.com
          </p>

          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#051730', marginTop: '2rem', marginBottom: '1rem' }}>
            Contact HR
          </h2>
          <p>
            Questions about our team or careers at CreatorIQ? Email us at careers@creatoriq.com
          </p>
        </div>
      </div>
    </div>
  );
}
