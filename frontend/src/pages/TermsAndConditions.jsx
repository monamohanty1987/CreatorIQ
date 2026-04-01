import React from 'react';
import { Home } from 'lucide-react';

export default function TermsAndConditions({ onNavigate }) {
  return (
    <div style={{ background: '#F9F7F4', minHeight: '100vh' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 2rem' }}>
        {/* Header with Home Button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#051730', margin: 0 }}>Terms and Conditions</h1>
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
            1. Service Agreement
          </h2>
          <p>
            This Service Agreement ("Agreement") is entered into between CreatorIQ and you. This Agreement sets forth the terms and conditions under which you may use our platform and services.
          </p>

          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#051730', marginTop: '2rem', marginBottom: '1rem' }}>
            2. User Responsibilities
          </h2>
          <p>
            You agree to use CreatorIQ only for lawful purposes and in a way that does not infringe upon the rights of others or restrict their use and enjoyment of CreatorIQ. Specifically, you agree not to harass or cause distress or inconvenience to any person.
          </p>

          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#051730', marginTop: '2rem', marginBottom: '1rem' }}>
            3. Account Security
          </h2>
          <p>
            You are responsible for maintaining the confidentiality of your account password and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
          </p>

          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#051730', marginTop: '2rem', marginBottom: '1rem' }}>
            4. Content Ownership
          </h2>
          <p>
            You retain all rights to content you create using CreatorIQ. By using our platform, you grant us a license to use your content as necessary to provide and improve our services.
          </p>

          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#051730', marginTop: '2rem', marginBottom: '1rem' }}>
            5. Acceptable Use Policy
          </h2>
          <p>
            You agree not to use CreatorIQ to transmit any unlawful, threatening, abusive, defamatory, obscene, or otherwise objectionable material. We reserve the right to terminate accounts that violate this policy.
          </p>

          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#051730', marginTop: '2rem', marginBottom: '1rem' }}>
            6. Termination
          </h2>
          <p>
            We may terminate or suspend your account and access to CreatorIQ at any time, for any reason, including if we believe you have violated these terms and conditions.
          </p>
        </div>
      </div>
    </div>
  );
}
