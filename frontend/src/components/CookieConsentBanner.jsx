import React, { useState, useEffect } from 'react';
import { X, Settings } from 'lucide-react';

export default function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState({
    analytics: true,
    functional: true,
    marketing: false
  });

  // Check if user already has consent saved
  useEffect(() => {
    const savedConsent = localStorage.getItem('cookieConsent');
    const consentExpiry = localStorage.getItem('cookieConsentExpiry');

    // If no consent or consent expired, show banner
    if (!savedConsent || !consentExpiry || new Date(consentExpiry) < new Date()) {
      setShowBanner(true);
    } else {
      // Load saved preferences
      try {
        const saved = JSON.parse(savedConsent);
        setPreferences(saved);
      } catch (e) {
        setShowBanner(true);
      }
    }
  }, []);

  const handleAcceptAll = () => {
    const newPreferences = {
      analytics: true,
      functional: true,
      marketing: true
    };
    saveConsent(newPreferences);
  };

  const handleRejectAll = () => {
    const newPreferences = {
      analytics: false,
      functional: true, // Functional always enabled
      marketing: false
    };
    saveConsent(newPreferences);
  };

  const handleSavePreferences = () => {
    saveConsent(preferences);
  };

  const saveConsent = (prefs) => {
    // Save to localStorage
    localStorage.setItem('cookieConsent', JSON.stringify(prefs));

    // Set expiry to 12 months from now
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    localStorage.setItem('cookieConsentExpiry', expiryDate.toISOString());

    // Save to backend (fire and forget)
    saveToBakend(prefs);

    // Close banner
    setShowBanner(false);
    setShowPreferences(false);
  };

  const saveToBakend = async (prefs) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/consent/save-cookie-preference`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(prefs)
      });
    } catch (err) {
      // Silent fail - banner still works even if backend is down
      console.log('Cookie consent saved locally');
    }
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Cookie Consent Banner */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'white',
        borderTop: '1px solid #E5E7EB',
        boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.1)',
        zIndex: 9999,
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1.5rem',
        flexWrap: 'wrap'
      }}>
        {/* Message */}
        <div style={{ flex: 1, minWidth: '300px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '0.5rem'
          }}>
            <span style={{ fontSize: '20px' }}>🍪</span>
            <span style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#051730'
            }}>
              Cookie Preferences
            </span>
          </div>
          <p style={{
            fontSize: '13px',
            color: '#6B7280',
            margin: 0,
            lineHeight: '1.5'
          }}>
            We use cookies to improve your experience and analyze platform usage. You can manage your preferences or accept all cookies.
          </p>
        </div>

        {/* Buttons */}
        <div style={{
          display: 'flex',
          gap: '0.75rem',
          flexWrap: 'wrap',
          alignItems: 'center',
          minWidth: 'fit-content'
        }}>
          <button
            onClick={() => setShowPreferences(true)}
            style={{
              padding: '0.5rem 1rem',
              background: 'white',
              border: '1px solid #D1D5DB',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              color: '#051730',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#F3F4F6';
              e.currentTarget.style.borderColor = '#9CA3AF';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'white';
              e.currentTarget.style.borderColor = '#D1D5DB';
            }}
          >
            <Settings size={14} />
            Preferences
          </button>

          <button
            onClick={handleRejectAll}
            style={{
              padding: '0.5rem 1rem',
              background: 'white',
              border: '1px solid #D1D5DB',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              color: '#6B7280',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#F3F4F6';
              e.currentTarget.style.borderColor = '#9CA3AF';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'white';
              e.currentTarget.style.borderColor = '#D1D5DB';
            }}
          >
            Reject All
          </button>

          <button
            onClick={handleAcceptAll}
            style={{
              padding: '0.5rem 1.25rem',
              background: '#FF8C2E',
              border: 'none',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              color: 'white',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            Accept All
          </button>

          <button
            onClick={() => setShowBanner(false)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.5rem',
              color: '#6B7280',
              transition: 'color 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#051730'}
            onMouseLeave={e => e.currentTarget.style.color = '#6B7280'}
            title="Close banner"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Preferences Modal */}
      {showPreferences && (
        <>
          {/* Backdrop */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              zIndex: 10000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onClick={() => setShowPreferences(false)}
          />

          {/* Modal */}
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'white',
              borderRadius: '8px',
              padding: '2rem',
              maxWidth: '500px',
              width: '90vw',
              zIndex: 10001,
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              maxHeight: '80vh',
              overflowY: 'auto'
            }}
            onClick={e => e.stopPropagation()}
          >
            <h2 style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#051730',
              margin: '0 0 1.5rem 0'
            }}>
              Cookie Preferences
            </h2>

            {/* Functional Cookies (Always Required) */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.5rem'
              }}>
                <label style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#051730',
                  margin: 0,
                  cursor: 'not-allowed'
                }}>
                  🔧 Functional Cookies (Required)
                </label>
                <input
                  type="checkbox"
                  checked={true}
                  disabled
                  style={{ cursor: 'not-allowed' }}
                />
              </div>
              <p style={{
                fontSize: '12px',
                color: '#6B7280',
                margin: 0,
                lineHeight: '1.5'
              }}>
                These cookies are essential for the platform to function properly. They cannot be disabled.
              </p>
            </div>

            {/* Analytics Cookies */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.5rem'
              }}>
                <label style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#051730',
                  margin: 0,
                  cursor: 'pointer'
                }}>
                  📊 Analytics Cookies
                </label>
                <input
                  type="checkbox"
                  checked={preferences.analytics}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    analytics: e.target.checked
                  })}
                  style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                />
              </div>
              <p style={{
                fontSize: '12px',
                color: '#6B7280',
                margin: 0,
                lineHeight: '1.5'
              }}>
                Help us understand how you use the platform so we can improve it. Includes Google Analytics.
              </p>
            </div>

            {/* Marketing Cookies */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.5rem'
              }}>
                <label style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#051730',
                  margin: 0,
                  cursor: 'pointer'
                }}>
                  📧 Marketing Cookies
                </label>
                <input
                  type="checkbox"
                  checked={preferences.marketing}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    marketing: e.target.checked
                  })}
                  style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                />
              </div>
              <p style={{
                fontSize: '12px',
                color: '#6B7280',
                margin: 0,
                lineHeight: '1.5'
              }}>
                Allow us to send you updates about new features, offers, and news.
              </p>
            </div>

            {/* Buttons */}
            <div style={{
              display: 'flex',
              gap: '1rem',
              borderTop: '1px solid #E5E7EB',
              paddingTop: '1.5rem'
            }}>
              <button
                onClick={() => setShowPreferences(false)}
                style={{
                  flex: 1,
                  padding: '0.75rem 1rem',
                  background: 'white',
                  border: '1px solid #D1D5DB',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  color: '#051730',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#F3F4F6';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'white';
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSavePreferences}
                style={{
                  flex: 1,
                  padding: '0.75rem 1rem',
                  background: '#FF8C2E',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  color: 'white',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                Save Preferences
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
