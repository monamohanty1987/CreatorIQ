import React from 'react';
import { Home } from 'lucide-react';

export default function Company({ onNavigate }) {
  return (
    <div style={{ background: '#F9F7F4', minHeight: '100vh' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 2rem' }}>
        {/* Header with Home Button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#051730', margin: 0 }}>About CreatorIQ</h1>
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
            Our Mission
          </h2>
          <p>
            CreatorIQ is dedicated to empowering content creators with intelligent tools and insights to maximize their reach, revenue, and impact. We believe every creator deserves access to professional-grade analytics and content optimization tools.
          </p>

          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#051730', marginTop: '2rem', marginBottom: '1rem' }}>
            What We Do
          </h2>
          <p>
            CreatorIQ provides AI-powered solutions for content creators, including content repurposing, deal analysis, contract review, and comprehensive analytics. Our platform helps creators work smarter, not harder.
          </p>

          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#051730', marginTop: '2rem', marginBottom: '1rem' }}>
            Our Values
          </h2>
          <ul style={{ marginLeft: '1.5rem' }}>
            <li><strong>Transparency</strong> - We're honest about our features and limitations</li>
            <li><strong>Innovation</strong> - We continuously improve and add new features</li>
            <li><strong>Creator-First</strong> - Everything we do is designed with creators in mind</li>
            <li><strong>Security</strong> - Your data and privacy are our top priority</li>
          </ul>

          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#051730', marginTop: '2rem', marginBottom: '1rem' }}>
            Founded
          </h2>
          <p>
            CreatorIQ was founded in 2024 with a simple goal: help creators succeed in the digital economy.
          </p>
        </div>
      </div>
    </div>
  );
}
