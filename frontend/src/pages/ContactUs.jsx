import React, { useState } from 'react';
import { Home } from 'lucide-react';

export default function ContactUs({ onNavigate }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setFormData({ name: '', email: '', subject: '', message: '' });
      setSubmitted(false);
    }, 2000);
  };

  return (
    <div style={{ background: '#F9F7F4', minHeight: '100vh' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 2rem' }}>
        {/* Header with Home Button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#051730', margin: 0 }}>Contact Us</h1>
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

        {/* Contact Info */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '8px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#051730', marginTop: '0', marginBottom: '1rem' }}>
              📧 Email
            </h3>
            <ul style={{ margin: 0, padding: '0 0 0 1.5rem', lineHeight: '1.8' }}>
              <li><strong>Support:</strong> support@creatoriq.com</li>
              <li><strong>Sales:</strong> sales@creatoriq.com</li>
              <li><strong>Press:</strong> press@creatoriq.com</li>
              <li><strong>Security:</strong> security@creatoriq.com</li>
            </ul>
          </div>

          <div style={{ background: 'white', padding: '2rem', borderRadius: '8px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#051730', marginTop: '0', marginBottom: '1rem' }}>
              🌐 Online
            </h3>
            <p style={{ margin: 0, lineHeight: '1.8' }}>
              <strong>Website:</strong> www.creatoriq.com<br />
              <strong>Twitter:</strong> @CreatorIQApp<br />
              <strong>LinkedIn:</strong> CreatorIQ<br />
              <strong>Status:</strong> Live · March 2026
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', lineHeight: '1.8' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#051730', marginTop: '0', marginBottom: '1.5rem' }}>
            Send us a Message
          </h2>

          {submitted && (
            <div style={{
              background: '#ecfdf5',
              border: '1px solid #d1fae5',
              color: '#065f46',
              padding: '1rem',
              borderRadius: '6px',
              marginBottom: '1.5rem'
            }}>
              ✓ Thank you! Your message has been received. We'll get back to you soon.
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#051730' }}>
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
                onFocus={e => e.target.style.borderColor = '#FF8C2E'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#051730' }}>
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
                onFocus={e => e.target.style.borderColor = '#FF8C2E'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#051730' }}>
                Subject
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
                onFocus={e => e.target.style.borderColor = '#FF8C2E'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#051730' }}>
                Message
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows="6"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontFamily: 'Arial, sans-serif',
                  boxSizing: 'border-box'
                }}
                onFocus={e => e.target.style.borderColor = '#FF8C2E'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            <button
              type="submit"
              style={{
                padding: '0.75rem 2rem',
                background: '#FF8C2E',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'opacity 0.2s'
              }}
              onMouseEnter={e => e.target.style.opacity = '0.9'}
              onMouseLeave={e => e.target.style.opacity = '1'}
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
