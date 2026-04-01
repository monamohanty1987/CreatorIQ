import React from 'react';
import { Home } from 'lucide-react';

export default function Security({ onNavigate }) {
  return (
    <div style={{ background: '#F9F7F4', minHeight: '100vh' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 2rem' }}>
        {/* Header with Home Button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#051730', margin: 0 }}>Security</h1>
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
            Security at CreatorIQ
          </h2>
          <p>
            We take the security of your data seriously. Our platform implements industry-standard security measures to protect your personal information.
          </p>

          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#051730', marginTop: '2rem', marginBottom: '1rem' }}>
            Data Encryption
          </h2>
          <p>
            All data transmitted between your device and our servers is encrypted using SSL/TLS encryption. Your sensitive information is protected at rest and in transit.
          </p>

          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#051730', marginTop: '2rem', marginBottom: '1rem' }}>
            Access Controls
          </h2>
          <p>
            We implement strict access controls and authentication mechanisms. Only authorized personnel have access to user data, and all access is logged and monitored.
          </p>

          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#051730', marginTop: '2rem', marginBottom: '1rem' }}>
            Regular Security Audits
          </h2>
          <p>
            We conduct regular security audits and penetration testing to identify and address potential vulnerabilities. Our infrastructure is regularly updated with the latest security patches.
          </p>

          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#051730', marginTop: '2rem', marginBottom: '1rem' }}>
            Reporting Security Issues
          </h2>
          <p>
            If you discover a security vulnerability, please report it to security@creatoriq.com. We appreciate your help in keeping CreatorIQ secure.
          </p>
        </div>
      </div>
    </div>
  );
}
