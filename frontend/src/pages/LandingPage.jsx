import React, { useState, useEffect } from 'react';
import Header from '../components/Header';

// Auto-Sliding Dashboard Component
function AutoSlidingDashboard() {
  const [currentView, setCurrentView] = useState(0);

  const dashboardViews = [
    {
      name: 'Overview',
      type: 'metrics',
      metrics: [
        { icon: '📊', label: 'Total Reach', value: '2.4M+', color: '#FF8C2E' },
        { icon: '💰', label: 'Revenue', value: '$125K', color: '#49A9DE' },
        { icon: '👥', label: 'Followers', value: '450K', color: '#6B5344' },
        { icon: '📈', label: 'Growth', value: '32%', color: '#FF8C2E' }
      ],
      charts: [
        { label: 'Reach Growth', percentage: 75, color: '#FF8C2E' },
        { label: 'Revenue Target', percentage: 62, color: '#49A9DE' }
      ]
    },
    {
      name: 'Performance',
      type: 'metrics',
      metrics: [
        { icon: '🎯', label: 'Campaigns', value: '24', color: '#49A9DE' },
        { icon: '✨', label: 'Engagement', value: '8.5%', color: '#6B5344' },
        { icon: '⏱️', label: 'Avg Duration', value: '4m 32s', color: '#FF8C2E' },
        { icon: '🔥', label: 'Trending', value: '+45%', color: '#49A9DE' }
      ],
      charts: [
        { label: 'Follower Growth', percentage: 45, color: '#6B5344' },
        { label: 'Engagement Rate', percentage: 85, color: '#FF8C2E' }
      ]
    },
    {
      name: 'Revenue by Niche',
      type: 'image',
      image: '/total-revenue-niche.jpg'
    },
    {
      name: 'Top Content Formats',
      type: 'image',
      image: '/top-content-format.jpg'
    },
    {
      name: 'Platform Revenue',
      type: 'image',
      image: '/platform-revenue-share.jpg'
    },
    {
      name: 'Health Score',
      type: 'image',
      image: '/avg-health-score.jpg'
    }
  ];

  // Auto-slide every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentView((prev) => (prev + 1) % dashboardViews.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const view = dashboardViews[currentView];

  return (
    <div style={{
      background: '#1F2937',
      borderRadius: '12px',
      padding: '2rem',
      boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      border: '1px solid #374151',
      maxHeight: '500px',
      overflowY: 'auto'
    }}>
      {/* Dashboard Header with indicator */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid #374151'
      }}>
        <h3 style={{
          fontSize: '16px',
          fontWeight: '700',
          color: '#FFFFFF',
          margin: 0
        }}>
          📊 {view.name}
        </h3>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {dashboardViews.map((_, idx) => (
            <div
              key={idx}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: currentView === idx ? '#FF8C2E' : '#4B5563',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
              onClick={() => setCurrentView(idx)}
            />
          ))}
        </div>
      </div>

      {view.type === 'metrics' ? (
        <>
          {/* Metrics Grid */}
          <div key={`metrics-${currentView}`} style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1.5rem',
            animation: 'slideInLeft 0.6s ease-out'
          }}>
            {view.metrics.map((card, idx) => (
              <div key={idx} style={{
                padding: '1.5rem',
                background: '#273548',
                borderRadius: '10px',
                borderLeft: `5px solid ${card.color}`,
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(255, 140, 46, 0.2)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ fontSize: '32px', marginBottom: '0.75rem' }}>{card.icon}</div>
                <div style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '0.75rem', fontWeight: '500' }}>
                  {card.label}
                </div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#FFFFFF' }}>
                  {card.value}
                </div>
              </div>
            ))}
          </div>

          {/* Charts Section */}
          <div key={`charts-${currentView}`} style={{
            marginTop: '2rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid #374151',
            animation: 'slideInLeft 0.6s ease-out'
          }}>
            <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#FFFFFF', marginBottom: '1.5rem' }}>📈 Trends</h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1.5rem'
            }}>
              {view.charts.map((chart, idx) => (
                <div key={idx} style={{
                  padding: '1.25rem',
                  background: '#273548',
                  borderRadius: '8px',
                  borderLeft: `5px solid ${chart.color}`
                }}>
                  <div style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '0.75rem', fontWeight: '500' }}>
                    {chart.label}
                  </div>
                  <div style={{
                    width: '100%',
                    height: '8px',
                    background: '#374151',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    marginBottom: '0.5rem'
                  }}>
                    <div style={{
                      height: '100%',
                      background: chart.color,
                      width: `${chart.percentage}%`,
                      transition: 'width 0.5s ease'
                    }}></div>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#FFFFFF' }}>
                    {chart.percentage}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        // Image View
        <div key={`image-${currentView}`} style={{
          animation: 'slideInLeft 0.6s ease-out'
        }}>
          <img
            src={view.image}
            alt={view.name}
            style={{
              width: '100%',
              borderRadius: '10px',
              maxHeight: '350px',
              objectFit: 'contain'
            }}
          />
        </div>
      )}

      <style>{`
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}

// Feature Carousel Component
function FeatureCarousel() {
  const [currentFeature, setCurrentFeature] = useState(0);

  const features = [
    {
      title: 'One link → posts for every platform',
      description: 'Turn a single video or blog into Instagram captions, Twitter threads, LinkedIn posts, and more—automatically. Save hours, beat creator block, and stay consistent across all channels.',
      image: '/content-repurposer.jpg'
    },
    {
      title: 'Deal Analyzer - Smart Deal Management',
      description: 'Analyze partnership deals, contracts, and collaborations in seconds. Get AI-powered insights on deal terms, brand safety risks, and ROI predictions. Make confident decisions faster.',
      image: '/deal.analyzer.jpg'
    },
    {
      title: '🔍 Deal Navigator - Understand Your Contracts',
      description: 'Get educational explanations of contract terms, identify common creator questions, and discover discussion points for your lawyer. Educational guidance to help you negotiate better deals with confidence.',
      image: '/deal-navigator.jpg'
    },
    {
      title: '🎬 Commerce Script - Product Promotion Templates',
      description: 'Generate personalized product promotion scripts tailored to your content type and tone. Create authentic, engaging scripts for tutorials, reviews, how-tos, and vlogs. Integrate products naturally into your content.',
      image: '/commerce-script.jpg'
    }
  ];

  // Auto-slide every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const feature = features[currentFeature];

  return (
    <section style={{
      background: 'linear-gradient(135deg, #FFFFFF 0%, #F0F9FF 100%)',
      padding: '70px 2rem'
    }}>
      {/* Section Header */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        marginBottom: '3rem',
        textAlign: 'center'
      }}>
        <h3 style={{
          fontSize: '40px',
          fontWeight: '700',
          color: '#49A9DE',
          marginBottom: '2.5rem',
          margin: '0 0 2.5rem 0'
        }}>
          What can we help you discover?
        </h3>
      </div>

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '3rem',
        alignItems: 'center',
        minHeight: '500px'
      }}>
        {/* Left - Animated Screenshot */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden'
        }}>
          <div key={currentFeature} style={{
            animation: 'slideInLeft 0.6s ease-out',
            width: '100%'
          }}>
            <img
              src={feature.image}
              alt={feature.title}
              style={{
                width: '100%',
                maxWidth: '580px',
                borderRadius: '12px',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.12)',
                border: '1px solid #E5E7EB',
                display: 'block',
                margin: '0 auto'
              }}
            />
          </div>
        </div>

        {/* Right - Content */}
        <div key={`content-${currentFeature}`} style={{
          paddingRight: '2rem',
          animation: 'slideInLeft 0.6s ease-out'
        }}>
          <h2 style={{
            fontSize: '36px',
            fontWeight: '700',
            color: '#051730',
            lineHeight: '1.2',
            marginBottom: '1.5rem'
          }}>
            {feature.title}
          </h2>

          <p style={{
            fontSize: '16px',
            color: '#374151',
            lineHeight: '1.8',
            marginBottom: '2rem'
          }}>
            {feature.description}
          </p>

          <a href="#" style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#49A9DE',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.3s'
          }}
            onMouseEnter={e => {
              e.currentTarget.style.color = '#3892C7';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = '#49A9DE';
            }}
          >
            Learn more →
          </a>
        </div>
      </div>

      {/* Carousel Indicators */}
      <div style={{
        maxWidth: '1200px',
        margin: '2rem auto 0',
        display: 'flex',
        justifyContent: 'center',
        gap: '0.75rem'
      }}>
        {features.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentFeature(idx)}
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              border: 'none',
              background: currentFeature === idx ? '#FF8C2E' : '#D1D5DB',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
          />
        ))}
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </section>
  );
}

export default function LandingPage({ onNavigate }) {

  return (
    <div style={{ background: '#F9F7F4', minHeight: '100vh' }}>
      {/* Header */}
      <Header onNavigate={onNavigate} />

      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #FFFFFF 0%, #FAF5F2 100%)',
        padding: '60px 2rem',
        borderBottom: '1px solid #E5E7EB'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '3rem',
          alignItems: 'center'
        }}>
          {/* Left Content */}
          <div>
            <h1 style={{
              fontSize: '48px',
              fontWeight: '700',
              color: '#051730',
              lineHeight: '1.2',
              marginBottom: '1rem'
            }}>
              Road to <span style={{ color: '#49A9DE' }}>Creator</span> Led Success
            </h1>

            <p style={{
              fontSize: '18px',
              color: '#374151',
              marginBottom: '1.5rem',
              lineHeight: '1.6',
              fontWeight: '500'
            }}>
              Know your audience. Sell smarter. Setup your Side business Easily.
            </p>

            <p style={{
              fontSize: '16px',
              color: '#6B7280',
              marginBottom: '2rem',
              lineHeight: '1.7'
            }}>
              CreatorIQ unifies AI-powered intelligence to provide easy way to scale your growth and find the road to success. Your data. Your workflows. Your teams. All in one seamless ecosystem.
            </p>

            <button style={{
              padding: '0.875rem 2rem',
              background: '#FF8C2E',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
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
              Get Started
            </button>
          </div>

          {/* Right - Auto-Sliding Dashboard */}
          <AutoSlidingDashboard />
        </div>
      </section>

      {/* Section 1: CreatorIQ Named a Leader */}
      <section style={{
        background: 'linear-gradient(135deg, #FFFFFF 0%, #F9F7F4 100%)',
        padding: '70px 2rem',
        borderBottom: '1px solid #E5E7EB'
      }}>
        <div style={{
          maxWidth: '1050px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '45% 55%',
          gap: '2.5rem',
          alignItems: 'center'
        }}>
          {/* Left Content */}
          <div>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#49A9DE',
              marginBottom: '0.75rem'
            }}>
              CreatorIQ Named a Leader
            </h3>
            <div style={{ borderBottom: '2px solid #FF8C2E', width: '50px', marginBottom: '1.25rem' }}></div>

            <blockquote style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#051730',
              lineHeight: '1.4',
              marginBottom: '1.5rem',
              fontStyle: 'italic'
            }}>
              "Creators need more than just analytics—they need a complete system that predicts what to sell, spots audience churn before it happens, and repurposes content effortlessly."
            </blockquote>

            <p style={{
              fontSize: '14px',
              color: '#6B7280',
              lineHeight: '1.6',
              marginBottom: '1.5rem'
            }}>
              CreatorFlow delivers all of this with an intelligent AI router that cuts costs without cutting quality.
            </p>

            <button
              onClick={() => {
                window.history.pushState({}, '', '?page=content-repurpose');
                onNavigate('content-repurpose');
              }}
              style={{
                padding: '0.75rem 1.75rem',
                background: '#49A9DE',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
              onMouseEnter={e => {
                e.target.style.background = '#3892C7';
              }}
              onMouseLeave={e => {
                e.target.style.background = '#49A9DE';
              }}
            >
              Get Started Now
            </button>
          </div>

          {/* Right Visual */}
          <div style={{
            position: 'relative',
            height: '320px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {/* Decorative Chart Visualization */}
            <div style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, #E0F2FE 0%, #DBEAFE 100%)',
              borderRadius: '12px',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              boxShadow: '0 12px 28px rgba(73, 169, 222, 0.12)'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '0.75rem' }}>📊</div>
              <h4 style={{ fontSize: '15px', fontWeight: '600', color: '#051730', marginBottom: '0.4rem' }}>
                AI-Powered Analytics
              </h4>
              <p style={{ fontSize: '12px', color: '#6B7280', textAlign: 'center', maxWidth: '240px' }}>
                Real-time insights to predict trends, optimize content, and maximize creator success
              </p>

              {/* Small Chart Bars */}
              <div style={{ marginTop: '1.25rem', width: '100%', display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', height: '60px' }}>
                {[40, 60, 85, 55, 70].map((height, idx) => (
                  <div
                    key={idx}
                    style={{
                      width: '10px',
                      height: `${height * 0.65}px`,
                      background: ['#FF8C2E', '#49A9DE', '#6B5344', '#FF8C2E', '#49A9DE'][idx],
                      borderRadius: '5px 5px 0 0',
                      transition: 'all 0.3s'
                    }}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Marketing Has Evolved */}
      <section style={{
        background: 'linear-gradient(135deg, #FFFFFF 0%, #F0F9FF 100%)',
        padding: '100px 2rem',
        borderBottom: '1px solid #E5E7EB',
        textAlign: 'left'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '52px',
            fontWeight: '700',
            marginBottom: '2.5rem',
            lineHeight: '1.3',
            color: '#051730'
          }}>
            Marketing has evolved.<br />
            <span style={{ color: '#49A9DE' }}>Creators are the growth engine.</span>
          </h2>

          <p style={{
            fontSize: '16px',
            color: '#374151',
            marginBottom: '2rem',
            lineHeight: '1.8',
            maxWidth: '700px'
          }}>
            From paid to earned, from content to commerce, creators now drive measurable impact across every channel. But fragmented tools and manual workflows can't keep up. With CreatorIQ, you can move beyond running siloed influencer campaigns to building holistic, safe media strategies where creators are central to every digital touchpoint.
          </p>

          <p style={{
            fontSize: '16px',
            fontWeight: '700',
            color: '#051730',
            marginBottom: '2.5rem',
            lineHeight: '1.7'
          }}>
            This isn't just where the market is going. It's the infrastructure shaping what's next.
          </p>

          <button style={{
            padding: '0.85rem 2rem',
            background: '#FF8C2E',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s'
          }}
            onMouseEnter={e => {
              e.target.style.background = '#E67E1F';
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 20px rgba(255, 140, 46, 0.3)';
            }}
            onMouseLeave={e => {
              e.target.style.background = '#FF8C2E';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            Request a Demo
          </button>
        </div>
      </section>

      {/* Section 3: Monalisha Testimonial */}
      <section style={{
        background: 'linear-gradient(135deg, #F9F7F4 0%, #FFFFFF 100%)',
        padding: '70px 2rem',
        borderBottom: '1px solid #E5E7EB'
      }}>
        <div style={{
          maxWidth: '900px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '35% 65%',
          gap: '0',
          alignItems: 'stretch',
          borderRadius: '10px',
          overflow: 'hidden',
          boxShadow: '0 6px 16px rgba(0, 0, 0, 0.06)'
        }}>
          {/* Photo - Left Side */}
          <div style={{
            background: '#E8E8E8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '280px'
          }}>
            <img
              src="/monalisha.jpg.jpeg"
              alt="Monalisha Mohanty"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextElementSibling.style.display = 'flex';
              }}
            />
            <div style={{
              display: 'none',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
              background: '#E8E8E8',
              color: '#9CA3AF',
              fontSize: '12px'
            }}>
              Image loading...
            </div>
          </div>

          {/* Testimonial Card - Right Side */}
          <div style={{
            background: 'linear-gradient(135deg, #B5DEF2 0%, #DBEAFE 100%)',
            padding: '1.5rem 1.75rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <blockquote style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#051730',
              lineHeight: '1.5',
              marginBottom: '1rem',
              margin: '0 0 1rem 0'
            }}>
              "With 263K+ followers, I struggled to grow my business, stay consistent, and fight creator block. I felt stuck—until I found a platform that finally understood my challenges. Now I know exactly what to sell, who's about to leave, and how to turn one piece of content into a full‑platform strategy. It brought back my motivation and gave me control."
            </blockquote>

            <div>
              <h4 style={{
                fontSize: '14px',
                fontWeight: '700',
                color: '#051730',
                marginBottom: '0.15rem'
              }}>
                Monalisha Mohanty
              </h4>
              <p style={{
                fontSize: '13px',
                color: '#374151',
                fontWeight: '500',
                margin: '0'
              }}>
                Creator & Founder, CreatorIQ
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Feature Carousel */}
      <FeatureCarousel />

      {/* Footer Section */}
      <footer style={{
        background: '#FFFFFF',
        borderTop: '1px solid #E5E7EB',
        padding: '60px 2rem 40px',
        marginTop: '60px'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr 1fr',
          gap: '3rem',
          marginBottom: '3rem'
        }}>
          {/* Product Section */}
          <div>
            <h4 style={{
              fontSize: '16px',
              fontWeight: '700',
              color: '#051730',
              marginBottom: '1.5rem',
              margin: '0 0 1.5rem 0'
            }}>
              Product
            </h4>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0
            }}>
              {[
                { label: 'Dashboard', page: 'dashboard' },
                { label: 'Content Repurposer', page: 'content-repurpose' },
                { label: 'Commerce Script', page: 'commerce-templates' },
                { label: 'Deal Analyzer', page: 'deals' },
                { label: 'Deal Navigator', page: 'contracts' },
                { label: 'Campaign Generator', page: 'campaigns' },
                { label: 'Content Analysis', page: 'content-analysis' },
                { label: 'Topic Matching', page: 'topic-matching' },
                { label: 'Content Calendar', page: 'content-calendar' },
                { label: 'Insights', page: 'content-insights' },
                { label: 'History', page: 'history' }
              ].map((item, idx) => (
                <li key={idx} style={{ marginBottom: '0.75rem' }}>
                  <button
                    onClick={() => {
                      window.history.pushState({}, '', `?page=${item.page}`);
                      onNavigate(item.page);
                    }}
                    style={{
                      fontSize: '14px',
                      color: '#6B7280',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'color 0.3s',
                      textDecoration: 'none',
                      padding: 0,
                      fontFamily: 'inherit',
                      textAlign: 'left'
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = '#FF8C2E'}
                    onMouseLeave={e => e.currentTarget.style.color = '#6B7280'}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* About Us Section */}
          <div>
            <h4 style={{
              fontSize: '16px',
              fontWeight: '700',
              color: '#051730',
              marginBottom: '1.5rem',
              margin: '0 0 1.5rem 0'
            }}>
              About Us
            </h4>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0
            }}>
              {[
                { label: 'Company', page: 'company' },
                { label: 'Careers', page: 'careers' },
                { label: 'Newsroom', page: 'newsroom' },
                { label: 'Contact Us', page: 'contact-us' },
                { label: 'Security', page: 'security' },
                { label: 'Privacy', page: 'privacy' },
                { label: 'Data Processing Agreement', page: 'dpa' },
                { label: 'Terms of Use', page: 'terms-of-use' },
                { label: 'Terms and Conditions', page: 'terms-and-conditions' }
              ].map((item, idx) => (
                <li key={idx} style={{ marginBottom: '0.75rem' }}>
                  <button
                    onClick={() => {
                      window.history.pushState({}, '', `?page=${item.page}`);
                      onNavigate(item.page);
                    }}
                    style={{
                      fontSize: '14px',
                      color: '#6B7280',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'color 0.3s',
                      textDecoration: 'none',
                      padding: 0,
                      fontFamily: 'inherit',
                      textAlign: 'left'
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = '#FF8C2E'}
                    onMouseLeave={e => e.currentTarget.style.color = '#6B7280'}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Empty columns for spacing */}
          <div></div>

          {/* Newsletter Section */}
          <div>
            <h4 style={{
              fontSize: '16px',
              fontWeight: '700',
              color: '#051730',
              marginBottom: '1.5rem',
              margin: '0 0 1.5rem 0'
            }}>
              Sign up for our newsletter
            </h4>
            <div style={{
              display: 'flex',
              gap: '0.5rem'
            }}>
              <input
                type="email"
                placeholder="Email"
                style={{
                  flex: 1,
                  padding: '0.75rem 1rem',
                  border: '1px solid #E5E7EB',
                  borderRadius: '6px',
                  fontSize: '14px',
                  outline: 'none'
                }}
                onFocus={e => e.target.style.borderColor = '#FF8C2E'}
                onBlur={e => e.target.style.borderColor = '#E5E7EB'}
              />
              <button style={{
                padding: '0.75rem 1.5rem',
                background: '#FF8C2E',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                Submit
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Divider */}
        <div style={{
          borderTop: '1px solid #E5E7EB',
          paddingTop: '2rem',
          textAlign: 'center'
        }}>
          <p style={{
            fontSize: '14px',
            color: '#6B7280',
            margin: 0
          }}>
            © 2026 CreatorIQ. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
