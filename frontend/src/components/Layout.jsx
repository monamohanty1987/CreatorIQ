import React from 'react';
import { Menu, X } from 'lucide-react';

const menuItems = [
  { id: 'home',               label: 'Dashboard',           emoji: '📊' },
  { id: 'deals',              label: 'Deal Analyzer',       emoji: '💰' },
  { id: 'contracts',          label: 'Contract Analyzer',   emoji: '⚖️'  },
  { id: 'campaigns',          label: 'Campaign Generator',  emoji: '📧' },
  { id: 'content-analysis',   label: 'Content Analysis',    emoji: '📈' },
  { id: 'commerce-templates', label: 'Commerce Templates',  emoji: '🎬' },
  { id: 'topic-matching',     label: 'Topic Matching',      emoji: '🎯' },
  { id: 'content-calendar',   label: 'Content Calendar',    emoji: '📅' },
  { id: 'content-insights',   label: 'Insights',            emoji: '💡' },
  { id: 'history',            label: 'History',             emoji: '📜' },
];

const Layout = ({ children, currentPage, onNavigate, sidebarOpen, setSidebarOpen }) => {
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#090E1A' }}>

      {/* Sidebar */}
      <aside
        className={`fixed md:relative flex-shrink-0 w-60 h-screen flex flex-col z-50 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
        style={{ background: '#0F172A', borderRight: '1px solid #1E293B' }}
      >
        {/* Brand */}
        <div className="px-5 py-5" style={{ borderBottom: '1px solid #1E293B' }}>
          <div className="flex items-center gap-2">
            <span className="text-xl">🚀</span>
            <div>
              <p className="font-bold text-lg leading-tight">
                <span style={{ color: '#60A5FA' }}>Creator</span>
                <span style={{ color: '#F1F5F9' }}>IQ</span>
              </p>
              <p className="text-xs" style={{ color: '#94A3B8' }}>AI Creator Intelligence</p>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {menuItems.map((item) => {
            const active = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { onNavigate(item.id); setSidebarOpen(false); }}
                className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: active ? '#1A56DB' : 'transparent',
                  color:      active ? '#ffffff' : '#94A3B8',
                  border:     'none',
                  cursor:     'pointer',
                }}
                onMouseEnter={e => {
                  if (!active) {
                    e.currentTarget.style.background = '#1E293B';
                    e.currentTarget.style.color = '#F1F5F9';
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#94A3B8';
                  }
                }}
              >
                <span className="text-base w-5 text-center">{item.emoji}</span>
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Status */}
        <div className="px-5 py-4" style={{ borderTop: '1px solid #1E293B' }}>
          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full inline-block"
              style={{ background: '#10B981', boxShadow: '0 0 6px #10B981' }}
            />
            <span className="text-xs" style={{ color: '#94A3B8' }}>Platform Live · March 2026</span>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <div
          className="md:hidden flex items-center justify-between px-4 py-3"
          style={{ background: '#0F172A', borderBottom: '1px solid #1E293B' }}
        >
          <p className="font-bold" style={{ color: '#60A5FA' }}>CreatorIQ</p>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ color: '#94A3B8', background: 'none', border: 'none', cursor: 'pointer' }}>
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 md:hidden z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
