import React, { useState, useRef } from 'react';

export default function Header({ onNavigate }) {
  const [showProductMenu, setShowProductMenu] = useState(false);
  const closeTimeoutRef = useRef(null);

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setShowProductMenu(false);
    }, 150);
  };

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    setShowProductMenu(true);
  };
  return (
    <header style={{
      background: '#FFFFFF',
      borderBottom: '1px solid #E5E7EB',
      padding: '1rem 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '80px'
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
        <div style={{
          width: '40px',
          height: '40px',
          background: 'linear-gradient(135deg, #FF8C2E 0%, #49A9DE 100%)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
          fontWeight: 'bold',
          color: 'white'
        }}>
          C
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '18px', fontWeight: '700', color: '#051730', margin: '0' }}>
            Creator<span style={{ color: '#49A9DE' }}>IQ</span>
          </span>
          <span style={{ fontSize: '10px', color: '#6B7280', margin: '0', lineHeight: '1' }}>
            Creator Success Platform
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
        {/* Product Dropdown */}
        <div
          style={{ position: 'relative' }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <button
            style={{
              background: 'none',
              border: 'none',
              color: '#051730',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: 0
            }}
          >
            Product
            <span style={{ fontSize: '10px' }}>▼</span>
          </button>

          {/* Dropdown Menu */}
          {showProductMenu && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                left: 0,
                background: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                minWidth: '240px',
                zIndex: 1000,
                maxHeight: '400px',
                overflowY: 'auto'
              }}
            >
              {[
                { label: '📊 Dashboard', page: 'dashboard' },
                { label: '🔄 Content Repurposer', page: 'content-repurpose' },
                { label: '🎬 Commerce Script', page: 'commerce-templates' },
                { label: '💰 Deal Analyzer', page: 'deals' },
                { label: '🔍 Deal Navigator', page: 'contracts' },
                { label: '📧 Campaign Generator', page: 'campaigns' },
                { label: '📈 Content Analysis', page: 'content-analysis' },
                { label: '🎯 Topic Matching', page: 'topic-matching' },
                { label: '📅 Content Calendar', page: 'content-calendar' },
                { label: '💡 Insights', page: 'content-insights' },
                { label: '📜 History', page: 'history' }
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    window.history.pushState({}, '', `?page=${item.page}`);
                    onNavigate(item.page);
                    setShowProductMenu(false);
                  }}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '0.75rem 1.5rem',
                    border: 'none',
                    background: 'transparent',
                    color: '#051730',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background 0.2s',
                    borderBottom: '1px solid #F3F4F6'
                  }}
                  onMouseEnter={e => {
                    e.target.style.background = '#FFF3EB';
                  }}
                  onMouseLeave={e => {
                    e.target.style.background = 'transparent';
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <a href="#" style={{ color: '#051730', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>
          Customers
        </a>
        <a href="#" style={{ color: '#051730', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>
          Pricing
        </a>
        <a href="#" style={{ color: '#051730', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>
          Resources
        </a>
        <a href="#" style={{ color: '#051730', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>
          Log In
        </a>
      </nav>

      {/* CTA Buttons */}
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <button style={{
          padding: '0.75rem 1.5rem',
          border: '2px solid #FF8C2E',
          background: 'transparent',
          color: '#FF8C2E',
          borderRadius: '6px',
          fontSize: '14px',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.3s'
        }}
          onMouseEnter={e => {
            e.target.style.background = '#FF8C2E';
            e.target.style.color = 'white';
          }}
          onMouseLeave={e => {
            e.target.style.background = 'transparent';
            e.target.style.color = '#FF8C2E';
          }}
        >
          Contact Us
        </button>
        <button style={{
          padding: '0.75rem 1.5rem',
          background: '#FF8C2E',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          fontSize: '14px',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.3s'
        }}
          onMouseEnter={e => {
            e.target.style.background = '#E67E1F';
          }}
          onMouseLeave={e => {
            e.target.style.background = '#FF8C2E';
          }}
        >
          Request Demo
        </button>
      </div>
    </header>
  );
}
