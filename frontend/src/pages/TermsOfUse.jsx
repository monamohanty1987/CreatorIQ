import React from 'react';
import { Home } from 'lucide-react';

export default function TermsOfUse({ onNavigate }) {
  return (
    <div style={{ background: '#F9F7F4', minHeight: '100vh' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 2rem' }}>
        {/* Header with Home Button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#051730', margin: 0 }}>Terms of Use</h1>
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
          <p style={{ marginBottom: '1.5rem' }}>
            <strong>Last Updated: March 2026</strong>
          </p>

          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#051730', marginTop: '2rem', marginBottom: '1rem' }}>
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing and using CreatorIQ, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
          </p>

          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#051730', marginTop: '2rem', marginBottom: '1rem' }}>
            2. Use License
          </h2>
          <p>
            You are granted a limited, non-exclusive license to access and use CreatorIQ for your personal and business use. You may not reproduce, duplicate, copy, or sell any portion of CreatorIQ without express written permission.
          </p>

          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#051730', marginTop: '2rem', marginBottom: '1rem' }}>
            3. Disclaimer of Warranties
          </h2>
          <p>
            CreatorIQ is provided "as-is" without any warranties of any kind. We disclaim all warranties, express or implied, including but not limited to warranties of fitness for a particular purpose.
          </p>

          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#051730', marginTop: '2rem', marginBottom: '1rem' }}>
            4. Limitation of Liability
          </h2>
          <p>
            In no event shall CreatorIQ be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on CreatorIQ.
          </p>

          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#051730', marginTop: '2rem', marginBottom: '1rem' }}>
            5. Modifications
          </h2>
          <p>
            CreatorIQ may revise these terms of use for our website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of use.
          </p>

          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#051730', marginTop: '2rem', marginBottom: '1rem' }}>
            6. Governing Law
          </h2>
          <p>
            These terms and conditions are governed by and construed in accordance with applicable law, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
          </p>
        </div>
      </div>
    </div>
  );
}
