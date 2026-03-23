import React, { useState } from 'react';

const CommerceMomentTemplates = () => {
  const [selectedType, setSelectedType] = useState('Tutorial');

  const templates = {
    Tutorial: {
      Intro: {
        description: 'Hook viewers right away + mention the tool',
        script: `"In this tutorial, I'll show you how to [achieve goal] using [product]. I used this myself for 2 months and saved [X hours/money], and I want to show you exactly how."`
      },
      MidPoint: {
        description: 'Natural product integration mid-video',
        script: `"By the way, [product] is what I use for this step. You could do it manually, but honestly, [product] cuts the time down from 30 minutes to 5 minutes. Link in description if you want to try it."`
      },
      Outro: {
        description: 'Strong CTA with discount code',
        script: `"That's how I do it! If you want to try [product], use code CREATOR20 for 20% off. Link is below. Let me know in the comments if this helped!"`
      }
    },
    Review: {
      Intro: {
        description: 'Build anticipation for the review',
        script: `"I've tested [product] for 3 weeks. Here's my honest review. TL;DR - it's worth it, and I'll explain why."`
      },
      MidPoint: {
        description: 'Detailed feature breakdown',
        script: `"The biggest benefit is [feature]. My competitor uses [alternative], but [product] beats it because [reason]. The tradeoff is [minor con], but it's worth it."`
      },
      Outro: {
        description: 'Clear recommendation + affiliate link',
        script: `"For [price], [product] is genuinely the best in its category. Affiliate link below. If you buy through my link, I get a small commission. Thanks for supporting the channel!"`
      }
    },
    'How-To': {
      Intro: {
        description: 'Promise a result',
        script: `"By the end of this video, you'll know exactly how to [achieve result]. I use [product] to make this faster."`
      },
      MidPoint: {
        description: 'Show the easier way with product',
        script: `"Normally this takes hours. But with [product], watch how I do it in 2 minutes. [Product] link below."`
      },
      Outro: {
        description: 'Direct call to action',
        script: `"That's the fastest way I know. Go try [product] free for 14 days. No credit card needed. Link in description."`
      }
    },
    'QA': {
      Intro: {
        description: 'Set expectations',
        script: `"Today answering your questions. I'll mention some tools I use to stay organized while answering thousands of DMs."`
      },
      MidPoint: {
        description: 'Tool recommendation',
        script: `"For organizing questions like this, I use [product]. It helps me [specific benefit]."`
      },
      Outro: {
        description: 'Soft mention with link',
        script: `"Thanks for the questions! [Product] helps me manage all this. Link in description if you want to check it out."`
      }
    },
    Vlog: {
      Intro: {
        description: 'Casual mention early',
        script: `"Today I'm using [product] to show you [activity]. It makes my life so much easier, you'll see why in a minute."`
      },
      MidPoint: {
        description: 'Show it in action naturally',
        script: `"This is where [product] saves me. Instead of doing this manually, I just [use product]. So much better."`
      },
      Outro: {
        description: 'Soft recommendation',
        script: `"Anyway, [product] is linked below if you want to try it. It's made a huge difference for me. Thanks for watching!"`
      }
    }
  };

  const contentTypes = Object.keys(templates);
  const moments = templates[selectedType] || {};

  const displayName = (type) => {
    if (type === 'QA') return 'Q&A';
    return type;
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>🎬 Commerce Moment Templates</h1>
        <p>Copy-paste scripts for different content moments</p>
      </div>

      <div className="type-selector">
        <h3>Select Content Type:</h3>
        <div className="button-group">
          {contentTypes.map((type) => (
            <button
              key={type}
              className={`type-btn ${selectedType === type ? 'active' : ''}`}
              onClick={() => setSelectedType(type)}
            >
              {displayName(type)}
            </button>
          ))}
        </div>
      </div>

      <div className="templates-grid">
        {Object.entries(moments).map(([moment, data]) => (
          <div key={moment} className="template-card">
            <div className="template-header">
              <h3>{moment}</h3>
              <span className="moment-badge">{moment === 'Intro' ? '🎬' : moment === 'MidPoint' ? '⭐' : '✅'}</span>
            </div>

            <p className="template-description">{data.description}</p>

            <div className="script-box">
              <p>{data.script}</p>
            </div>

            <button
              className="copy-btn"
              onClick={() => {
                navigator.clipboard.writeText(data.script);
                alert('Copied to clipboard! 📋');
              }}
            >
              📋 Copy Script
            </button>
          </div>
        ))}
      </div>

      <div className="tips-section">
        <h2>💡 How to Use These Templates</h2>
        <ul className="tips-list">
          <li><strong>Intro (0-10%):</strong> Hook + Product mention. Get viewers interested.</li>
          <li><strong>MidPoint (40-60%):</strong> Natural integration. Show how it solves a problem.</li>
          <li><strong>Outro (90-100%):</strong> Clear CTA with link. Make it easy to buy.</li>
          <li><strong>Tone:</strong> Authentic, not salesy. You genuinely use these products.</li>
          <li><strong>Timing:</strong> Don't rush. Give context before the ask.</li>
          <li><strong>Links:</strong> Always put affiliate/product links in description or pinned comment.</li>
        </ul>
      </div>
    </div>
  );
};

export default CommerceMomentTemplates;
