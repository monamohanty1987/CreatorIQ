import React from 'react';
import { Home } from 'lucide-react';

export default function Privacy({ onNavigate }) {
  return (
    <div style={{ background: '#F9F7F4', minHeight: '100vh' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 2rem' }}>
        {/* Header with Home Button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#051730', margin: 0 }}>Privacy Policy</h1>
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
            <strong>Last Updated: March 30, 2026</strong>
          </p>

          {/* SECTION 1 */}
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#051730', marginTop: '2rem', marginBottom: '1rem' }}>
            1. Information We Collect
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            We collect information in the following categories:
          </p>
          <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
            <li><strong>Form Submissions:</strong> Name, email, topic, niche, target audience when you use our tools</li>
            <li><strong>Website Analytics:</strong> Pages visited, time on page, device type (via Google Analytics)</li>
            <li><strong>Cookies & Session Data:</strong> Session ID, browser type, language preferences</li>
            <li><strong>Newsletter Signup:</strong> Email address when you subscribe to updates</li>
            <li><strong>Future Account Data:</strong> When login is added, account information and user-created content</li>
          </ul>

          {/* SECTION 2 */}
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#051730', marginTop: '2rem', marginBottom: '1rem' }}>
            2. Legal Basis for Data Processing (GDPR Article 6)
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            We process your data based on:
          </p>
          <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
            <li><strong>Contract Performance (Article 6(1)(b)):</strong> Processing your form submissions to provide platform features</li>
            <li><strong>Legitimate Interest (Article 6(1)(f)):</strong> Improving platform security, analyzing usage patterns, preventing fraud, providing customer support</li>
            <li><strong>Consent (Article 6(1)(a)):</strong> Analytics tracking, marketing emails, and newsletter subscriptions (you can withdraw anytime)</li>
          </ul>

          {/* SECTION 3 */}
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#051730', marginTop: '2rem', marginBottom: '1rem' }}>
            3. Your GDPR Rights (Articles 15-21)
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            Under GDPR, you have the following rights:
          </p>
          <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
            <li><strong>Right to Access (Article 15):</strong> Request a copy of all data we hold about you. Contact: privacy@creatoriq.com</li>
            <li><strong>Right to Erasure (Article 17):</strong> Request deletion of your account and data. Coming soon: Delete My Account button</li>
            <li><strong>Right to Data Portability (Article 20):</strong> Receive your data in a portable format (JSON). Coming soon: Download My Data button</li>
            <li><strong>Right to Object (Article 21):</strong> Opt-out of marketing emails and analytics tracking via Cookie Preferences</li>
            <li><strong>Right to Withdraw Consent (Article 7):</strong> Withdraw consent for analytics and marketing anytime via Cookie Preferences</li>
            <li><strong>Right to Rectification (Article 16):</strong> Request correction of inaccurate data. Contact: privacy@creatoriq.com</li>
          </ul>
          <p style={{ marginBottom: '1rem', padding: '1rem', background: '#F0F9FF', borderLeft: '4px solid #49A9DE', borderRadius: '4px' }}>
            💡 <strong>To exercise your rights:</strong> Email privacy@creatoriq.com with your request. We will respond within 30 days as required by GDPR Article 12.
          </p>

          {/* SECTION 4 */}
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#051730', marginTop: '2rem', marginBottom: '1rem' }}>
            4. How We Use Your Information
          </h2>
          <p>
            We use the information we collect to:
          </p>
          <ul style={{ marginLeft: '1.5rem' }}>
            <li>Provide and maintain platform functionality</li>
            <li>Improve user experience and platform features</li>
            <li>Send you updates, newsletters (if opted in)</li>
            <li>Analyze platform usage to optimize performance</li>
            <li>Detect and prevent fraud or security issues</li>
            <li>Respond to your support inquiries</li>
          </ul>

          {/* SECTION 5 */}
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#051730', marginTop: '2rem', marginBottom: '1rem' }}>
            5. Cookies & Tracking (GDPR Article 21)
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            We use cookies for:
          </p>
          <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
            <li><strong>Functional Cookies (Required):</strong> Essential for platform functionality (cannot be disabled)</li>
            <li><strong>Analytics Cookies (Optional):</strong> Google Analytics to understand how you use the platform</li>
            <li><strong>Marketing Cookies (Optional):</strong> To send you updates and offers</li>
          </ul>
          <p>
            You can manage your cookie preferences anytime via the Cookie Preferences button in our footer or by adjusting your browser settings.
          </p>

          {/* SECTION 6 */}
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#051730', marginTop: '2rem', marginBottom: '1rem' }}>
            6. Data Retention Schedule
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            We retain your data for:
          </p>
          <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
            <li><strong>Analytics Data:</strong> 12 months (automatically deleted)</li>
            <li><strong>Email Subscriptions:</strong> Until you unsubscribe</li>
            <li><strong>Form Submissions:</strong> 6 months (then automatically deleted)</li>
            <li><strong>Future Account Data:</strong> Duration of your account (deleted 30 days after account deletion request)</li>
            <li><strong>Legal Records:</strong> 3 years (if required by law)</li>
          </ul>
          <p>
            Automatic deletion jobs run daily to remove expired data.
          </p>

          {/* SECTION 7 */}
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#051730', marginTop: '2rem', marginBottom: '1rem' }}>
            7. Third-Party Data Sharing
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            We share data with:
          </p>
          <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
            <li><strong>Google Analytics:</strong> For website analytics (with Data Processing Agreement in place)</li>
            <li><strong>Email Service Provider:</strong> For sending newsletters (if you opted in)</li>
            <li><strong>Future: OpenAI:</strong> For AI-powered features (when added) - Data Processing Agreement will be in place</li>
          </ul>
          <p style={{ marginBottom: '1rem' }}>
            <strong>We DO NOT:</strong>
          </p>
          <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
            <li>❌ Sell your data to third parties</li>
            <li>❌ Share data with marketing companies</li>
            <li>❌ Share for profiling or targeted advertising</li>
            <li>❌ Share without your consent (except where legally required)</li>
          </ul>

          {/* SECTION 8 */}
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#051730', marginTop: '2rem', marginBottom: '1rem' }}>
            8. Data Security
          </h2>
          <p>
            We implement security measures including:
          </p>
          <ul style={{ marginLeft: '1.5rem' }}>
            <li>🔒 SSL/TLS encryption for data in transit</li>
            <li>🔐 Secure password hashing for accounts</li>
            <li>🛡️ Regular security audits and updates</li>
            <li>📋 Access controls limiting who can view data</li>
            <li>📊 Backup procedures for data recovery</li>
          </ul>

          {/* SECTION 9 */}
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#051730', marginTop: '2rem', marginBottom: '1rem' }}>
            9. Children's Privacy (GDPR Article 8)
          </h2>
          <p>
            CreatorIQ is not directed to children under 16 years of age. We do not knowingly collect personal information from children under 16. If we learn we have collected data from a child under 16 without parental consent, we will promptly delete it. If you are under 16 and have a parent or guardian, they can contact us at privacy@creatoriq.com.
          </p>

          {/* SECTION 10 */}
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#051730', marginTop: '2rem', marginBottom: '1rem' }}>
            10. International Data Transfers
          </h2>
          <p>
            Your data may be processed in countries other than where you reside. We ensure appropriate safeguards are in place for international transfers, including Standard Contractual Clauses (SCCs) as required by GDPR Article 46.
          </p>

          {/* SECTION 11 */}
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#051730', marginTop: '2rem', marginBottom: '1rem' }}>
            11. Data Breach Notification
          </h2>
          <p>
            In the event of a data breach, we will:
          </p>
          <ul style={{ marginLeft: '1.5rem' }}>
            <li>Notify affected users within 72 hours (as required by GDPR Article 33)</li>
            <li>Provide information about the breach and steps you can take</li>
            <li>Cooperate with regulatory authorities</li>
            <li>Maintain breach documentation for at least 3 years</li>
          </ul>

          {/* SECTION 12 */}
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#051730', marginTop: '2rem', marginBottom: '1rem' }}>
            12. Policy Updates
          </h2>
          <p>
            We may update this Privacy Policy periodically. We will notify you of significant changes via email or by posting a notice on our website. Your continued use of CreatorIQ after changes means you accept the updated policy.
          </p>

          {/* SECTION 13 */}
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#051730', marginTop: '2rem', marginBottom: '1rem' }}>
            13. Contact Us & Data Protection Officer
          </h2>
          <p>
            If you have questions about our privacy practices or want to exercise your GDPR rights:
          </p>
          <ul style={{ marginLeft: '1.5rem' }}>
            <li><strong>Privacy Email:</strong> privacy@creatoriq.com</li>
            <li><strong>General Support:</strong> support@creatoriq.com</li>
            <li><strong>Data Protection Officer:</strong> dpo@creatoriq.com</li>
            <li><strong>Mailing Address:</strong> CreatorIQ, Data Protection Office, [Address]</li>
          </ul>
          <p style={{ marginTop: '1.5rem', padding: '1rem', background: '#F0F9FF', borderLeft: '4px solid #49A9DE', borderRadius: '4px' }}>
            📄 <strong>Additional Resources:</strong> View our <a onClick={() => onNavigate?.('dpa')} style={{ color: '#49A9DE', textDecoration: 'underline', cursor: 'pointer' }}>Data Processing Agreement (DPA)</a> for more details about our data handling practices.
          </p>
        </div>
      </div>
    </div>
  );
}
