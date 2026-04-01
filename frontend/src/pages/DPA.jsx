import React from 'react';
import { Home } from 'lucide-react';

export default function DPA({ onNavigate }) {
  return (
    <div style={{ background: '#F9F7F4', minHeight: '100vh' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 2rem' }}>
        {/* Header with Home Button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#051730', margin: 0 }}>Data Processing Agreement</h1>
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
            <strong>Effective Date: March 30, 2026</strong>
          </p>
          <p style={{ marginBottom: '1.5rem', fontSize: '14px', color: '#6B7280' }}>
            This Data Processing Agreement (DPA) is entered into between CreatorIQ (Controller) and users (Data Subjects) and defines the terms for processing personal data under the General Data Protection Regulation (GDPR).
          </p>

          {/* SECTION 1 */}
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#051730', marginTop: '2rem', marginBottom: '1rem' }}>
            1. Definitions and Interpretation
          </h2>
          <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
            <li><strong>Personal Data:</strong> Any information relating to an identified or identifiable natural person</li>
            <li><strong>Processing:</strong> Any operation performed on Personal Data, including collection, recording, organization, structuring, storage, adaptation, retrieval, consultation, use, disclosure, or erasure</li>
            <li><strong>Data Subject:</strong> The individual to whom Personal Data relates</li>
            <li><strong>Data Controller:</strong> CreatorIQ, the entity determining the purposes and means of processing</li>
            <li><strong>Data Processor:</strong> Any party processing data on behalf of the Controller</li>
            <li><strong>GDPR:</strong> Regulation (EU) 2016/679 of the European Parliament and the Council</li>
          </ul>

          {/* SECTION 2 */}
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#051730', marginTop: '2rem', marginBottom: '1rem' }}>
            2. Scope of Data Processing
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            CreatorIQ processes the following Personal Data from users:
          </p>
          <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
            <li><strong>Identification Data:</strong> Name, email address, account credentials</li>
            <li><strong>Usage Data:</strong> Pages visited, features used, timestamps, session duration, device information</li>
            <li><strong>Form Submissions:</strong> Topic, niche, target audience, creator preferences (for content generation tools)</li>
            <li><strong>Technical Data:</strong> IP address, browser type, device type, language preferences, cookies</li>
            <li><strong>Newsletter Subscriptions:</strong> Email address for marketing communications</li>
          </ul>

          {/* SECTION 3 */}
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#051730', marginTop: '2rem', marginBottom: '1rem' }}>
            3. Legal Basis for Processing (GDPR Article 6)
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            CreatorIQ processes Personal Data based on the following legal grounds:
          </p>
          <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
            <li><strong>Performance of Contract (Article 6(1)(b)):</strong> Processing is necessary to provide platform services (form submissions, tool functionality)</li>
            <li><strong>Legitimate Interest (Article 6(1)(f)):</strong> Platform security, fraud prevention, performance analytics, user experience improvement</li>
            <li><strong>Explicit Consent (Article 6(1)(a)):</strong> Analytics tracking, marketing communications, non-essential cookies (withdrawal available anytime)</li>
          </ul>

          {/* SECTION 4 */}
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#051730', marginTop: '2rem', marginBottom: '1rem' }}>
            4. Purpose Limitation
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            Personal Data is processed for specific, explicit, and legitimate purposes:
          </p>
          <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
            <li>Providing and improving CreatorIQ platform services</li>
            <li>Responding to user inquiries and providing customer support</li>
            <li>Analyzing platform usage and optimizing user experience</li>
            <li>Preventing fraud, abuse, and security incidents</li>
            <li>Sending newsletters and marketing communications (with consent)</li>
            <li>Complying with legal obligations and regulatory requirements</li>
          </ul>
          <p style={{ marginBottom: '1rem', padding: '1rem', background: '#FEF3C7', borderLeft: '4px solid #F59E0B', borderRadius: '4px' }}>
            ⚠️ <strong>Processing will not be reused for purposes other than those listed above.</strong> If CreatorIQ wishes to use data for a new purpose, explicit consent or a new legal basis must be obtained from the Data Subject.
          </p>

          {/* SECTION 5 */}
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#051730', marginTop: '2rem', marginBottom: '1rem' }}>
            5. Data Retention and Deletion
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            CreatorIQ retains Personal Data only for as long as necessary:
          </p>
          <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
            <li><strong>Website Analytics Data:</strong> 12 months (automatically deleted by Google Analytics)</li>
            <li><strong>Form Submissions (Tool Usage):</strong> 6 months (automatically deleted)</li>
            <li><strong>Email Subscriptions:</strong> Until unsubscribe or account deletion request</li>
            <li><strong>Future Account Data:</strong> Duration of account + 30 days after deletion request (for recovery window)</li>
            <li><strong>Legal/Compliance Records:</strong> 3 years (if required by law)</li>
          </ul>
          <p style={{ marginBottom: '1rem' }}>
            Data Subjects can request early deletion at any time by contacting privacy@creatoriq.com.
          </p>

          {/* SECTION 6 */}
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#051730', marginTop: '2rem', marginBottom: '1rem' }}>
            6. Security Measures
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            CreatorIQ implements technical and organizational security measures to protect Personal Data:
          </p>
          <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
            <li>🔒 <strong>Encryption in Transit:</strong> SSL/TLS encryption for all data transmission</li>
            <li>🔐 <strong>Encryption at Rest:</strong> Secure storage of sensitive data in encrypted format</li>
            <li>🛡️ <strong>Authentication:</strong> Secure password hashing (bcrypt) for future login features</li>
            <li>📋 <strong>Access Controls:</strong> Role-based access restrictions limiting data exposure</li>
            <li>🔍 <strong>Regular Audits:</strong> Security assessments and vulnerability scanning</li>
            <li>📊 <strong>Backup & Recovery:</strong> Regular backups with tested recovery procedures</li>
            <li>🚨 <strong>Incident Response:</strong> Documented procedures for data breach response and notification</li>
          </ul>

          {/* SECTION 7 */}
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#051730', marginTop: '2rem', marginBottom: '1rem' }}>
            7. Sub-Processors (Third-Party Data Processors)
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            CreatorIQ engages the following sub-processors to handle Personal Data:
          </p>
          <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
            <li><strong>Google Analytics:</strong> Website analytics provider (Data Processing Agreement in place). Data transferred to USA (Standard Contractual Clauses applied)</li>
            <li><strong>Email Service Provider (TBD):</strong> Newsletter distribution service (DPA to be established). Data retained as per their privacy policy</li>
            <li><strong>OpenAI (Future):</strong> AI-powered content generation (when integrated). Sub-processor agreement will be executed. Data processing limited to what is necessary for feature functionality</li>
          </ul>
          <p style={{ marginBottom: '1rem' }}>
            <strong>Data Subjects have the right to object to sub-processors.</strong> Contact privacy@creatoriq.com to request alternative arrangements.
          </p>

          {/* SECTION 8 */}
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#051730', marginTop: '2rem', marginBottom: '1rem' }}>
            8. International Data Transfers (GDPR Article 46)
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            Personal Data may be transferred to and processed in countries outside the European Economic Area (EEA). CreatorIQ ensures appropriate safeguards:
          </p>
          <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
            <li><strong>Standard Contractual Clauses (SCCs):</strong> Used for data transfers to non-EEA jurisdictions</li>
            <li><strong>Data Processing Agreements:</strong> In place with all sub-processors</li>
            <li><strong>Impact Assessment:</strong> Regular reviews of third-country data protection levels</li>
            <li><strong>Adequacy Decisions:</strong> Reliance on EU Commission adequacy decisions where applicable</li>
          </ul>

          {/* SECTION 9 */}
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#051730', marginTop: '2rem', marginBottom: '1rem' }}>
            9. Data Subject Rights (GDPR Articles 15-21)
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            Data Subjects have the following rights regarding their Personal Data:
          </p>
          <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
            <li><strong>Right to Access (Article 15):</strong> Obtain a copy of all Personal Data CreatorIQ holds. Submit request to privacy@creatoriq.com</li>
            <li><strong>Right to Rectification (Article 16):</strong> Request correction of inaccurate data. Contact privacy@creatoriq.com with details</li>
            <li><strong>Right to Erasure (Article 17):</strong> Request deletion of Personal Data (conditions apply). Automatic 30-day grace period for account recovery</li>
            <li><strong>Right to Restrict Processing (Article 18):</strong> Request limitation of processing for specific purposes</li>
            <li><strong>Right to Data Portability (Article 20):</strong> Receive data in portable format (JSON, CSV). Available after login feature added</li>
            <li><strong>Right to Object (Article 21):</strong> Opt-out of marketing communications and analytics tracking via cookie preferences</li>
            <li><strong>Right to Withdraw Consent (Article 7):</strong> Withdraw consent for non-essential processing anytime</li>
          </ul>
          <p style={{ marginBottom: '1rem', padding: '1rem', background: '#F0F9FF', borderLeft: '4px solid #49A9DE', borderRadius: '4px' }}>
            💡 <strong>To exercise your rights:</strong> Email privacy@creatoriq.com with your request. CreatorIQ will respond within 30 days as required by GDPR Article 12. Proof of identity may be requested for verification.
          </p>

          {/* SECTION 10 */}
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#051730', marginTop: '2rem', marginBottom: '1rem' }}>
            10. Data Breach Notification (GDPR Article 33)
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            In the event of a data breach affecting Personal Data:
          </p>
          <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
            <li><strong>Internal Notification:</strong> CreatorIQ will identify and contain the breach immediately</li>
            <li><strong>Regulatory Notification:</strong> Affected Data Subjects and supervisory authorities will be notified within 72 hours</li>
            <li><strong>Breach Documentation:</strong> Details of breach, affected data, likely consequences, and remedial actions will be documented</li>
            <li><strong>Breach Records:</strong> Maintained for at least 3 years for regulatory inspection</li>
          </ul>

          {/* SECTION 11 */}
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#051730', marginTop: '2rem', marginBottom: '1rem' }}>
            11. Data Protection Impact Assessment (GDPR Article 35)
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            CreatorIQ conducts Data Protection Impact Assessments (DPIAs) for processing activities involving:
          </p>
          <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
            <li>Large-scale processing of Personal Data</li>
            <li>Automated decision-making with legal effects</li>
            <li>Systematic monitoring of public areas</li>
            <li>Processing of special categories of data</li>
          </ul>
          <p style={{ marginBottom: '1rem' }}>
            DPIAs are documented and available upon request to supervisory authorities.
          </p>

          {/* SECTION 12 */}
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#051730', marginTop: '2rem', marginBottom: '1rem' }}>
            12. Accountability and Governance
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            <strong>Data Protection Officer (DPO):</strong> CreatorIQ has appointed a Data Protection Officer responsible for:
          </p>
          <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
            <li>Monitoring GDPR compliance across the organization</li>
            <li>Acting as primary contact for data protection authorities</li>
            <li>Assisting Data Subjects in exercising their rights</li>
            <li>Conducting internal privacy impact assessments</li>
            <li>Maintaining records of processing activities</li>
          </ul>
          <p style={{ marginBottom: '1rem' }}>
            <strong>DPO Contact:</strong> dpo@creatoriq.com
          </p>

          {/* SECTION 13 */}
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#051730', marginTop: '2rem', marginBottom: '1rem' }}>
            13. Cookies and Tracking Technologies (GDPR Article 21)
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            CreatorIQ uses the following technologies to process Personal Data:
          </p>
          <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
            <li><strong>Functional Cookies (Required):</strong> Essential for platform operation (cannot be disabled)</li>
            <li><strong>Analytics Cookies (Consent-based):</strong> Google Analytics to measure usage patterns</li>
            <li><strong>Marketing Cookies (Consent-based):</strong> Email service integrations for newsletters</li>
          </ul>
          <p style={{ marginBottom: '1rem' }}>
            Data Subjects can manage cookie preferences at any time via the Cookie Preferences button in the website footer.
          </p>

          {/* SECTION 14 */}
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#051730', marginTop: '2rem', marginBottom: '1rem' }}>
            14. Children's Personal Data (GDPR Article 8)
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            CreatorIQ does not knowingly process Personal Data of individuals under 16 years of age. If a parent or guardian becomes aware that a child under 16 has provided Personal Data, they should contact privacy@creatoriq.com. CreatorIQ will delete such data within 30 days.
          </p>

          {/* SECTION 15 */}
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#051730', marginTop: '2rem', marginBottom: '1rem' }}>
            15. Changes to This Agreement
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            CreatorIQ may update this DPA to reflect changes in:
          </p>
          <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
            <li>Processing activities or purposes</li>
            <li>Sub-processors or data transfer locations</li>
            <li>Regulatory requirements or legal interpretations</li>
            <li>Security measures or technical safeguards</li>
          </ul>
          <p style={{ marginBottom: '1rem' }}>
            Significant changes will be communicated to Data Subjects via email or website notification at least 30 days in advance. Continued use of the platform after changes constitutes acceptance.
          </p>

          {/* SECTION 16 */}
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#051730', marginTop: '2rem', marginBottom: '1rem' }}>
            16. Contact and Dispute Resolution
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            For questions about this DPA or to exercise data rights:
          </p>
          <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
            <li><strong>Privacy Inquiries:</strong> privacy@creatoriq.com</li>
            <li><strong>Data Protection Officer:</strong> dpo@creatoriq.com</li>
            <li><strong>General Support:</strong> support@creatoriq.com</li>
            <li><strong>Supervisory Authority Complaints:</strong> Data Subjects have the right to lodge complaints with their local supervisory authority if they believe their rights have been violated</li>
          </ul>
          <p style={{ marginBottom: '1rem' }}>
            CreatorIQ will cooperate with supervisory authorities in investigating and resolving complaints.
          </p>

          {/* SECTION 17 */}
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#051730', marginTop: '2rem', marginBottom: '1rem' }}>
            17. Legal Compliance
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            This DPA is governed by:
          </p>
          <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
            <li><strong>GDPR (EU 2016/679):</strong> Regulation of the European Parliament and Council</li>
            <li><strong>EU Member State Laws:</strong> Local data protection laws implementing the GDPR</li>
            <li><strong>International Standards:</strong> ISO 27001 for information security management</li>
          </ul>
          <p style={{ marginBottom: '1rem' }}>
            Any disputes related to data processing will be resolved according to GDPR procedures and applicable law.
          </p>

          {/* Final Section */}
          <div style={{ marginTop: '3rem', padding: '1.5rem', background: '#F0F9FF', borderLeft: '4px solid #49A9DE', borderRadius: '4px' }}>
            <p style={{ margin: 0, marginBottom: '1rem' }}>
              <strong>📄 Document Information:</strong>
            </p>
            <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem', marginBottom: 0 }}>
              <li>Document Type: Data Processing Agreement (DPA)</li>
              <li>Effective Date: March 30, 2026</li>
              <li>Version: 1.0</li>
              <li>Last Updated: March 30, 2026</li>
              <li>Applicable Law: GDPR (EU 2016/679)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
