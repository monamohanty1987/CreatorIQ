import React from 'react';
import { Menu, X } from 'lucide-react';

const menuItems = [
  { id: 'home',               label: 'Dashboard',           emoji: '📊' },
  { id: 'content-repurpose',  label: 'Content Repurposer',  emoji: '🔄' },
  { id: 'commerce-templates', label: 'Commerce Script',     emoji: '🎬' },
  { id: 'deals',              label: 'Deal Analyzer',       emoji: '💰' },
  { id: 'contracts',          label: 'Deal Navigator',      emoji: '🔍'  },
  { id: 'campaigns',          label: 'Campaign Generator',  emoji: '📧' },
  { id: 'content-analysis',   label: 'Content Analysis',    emoji: '📈' },
  { id: 'topic-matching',     label: 'Topic Matching',      emoji: '🎯' },
  { id: 'content-calendar',   label: 'Content Calendar',    emoji: '📅' },
  { id: 'content-insights',   label: 'Insights',            emoji: '💡' },
  { id: 'history',            label: 'History',             emoji: '📜' },
];

const Layout = ({ children, currentPage, onNavigate, sidebarOpen, setSidebarOpen }) => {
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#F9F7F4' }}>

      {/* Sidebar */}
      <aside
        className={`fixed md:relative flex-shrink-0 w-60 h-screen flex flex-col z-50 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
        style={{ background: '#FFFFFF', borderRight: '1px solid #E5E7EB' }}
      >
        {/* Brand - Clickable Home Button */}
        <button
          onClick={() => { onNavigate('home'); setSidebarOpen(false); }}
          className="w-full text-left px-5 py-5"
          style={{
            borderBottom: '1px solid #E5E7EB',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#F3F4F6';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">🚀</span>
            <div>
              <p className="font-bold text-lg leading-tight">
                <span style={{ color: '#FF8C2E' }}>Creator</span>
                <span style={{ color: '#051730' }}>IQ</span>
              </p>
              <p className="text-xs" style={{ color: '#6B7280' }}>AI Creator Intelligence</p>
            </div>
          </div>
        </button>

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
                  background: active ? '#FF8C2E' : 'transparent',
                  color:      active ? '#ffffff' : '#6B7280',
                  border:     'none',
                  cursor:     'pointer',
                }}
                onMouseEnter={e => {
                  if (!active) {
                    e.currentTarget.style.background = '#F3F4F6';
                    e.currentTarget.style.color = '#051730';
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#6B7280';
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
        <div className="px-5 py-4" style={{ borderTop: '1px solid #E5E7EB' }}>
          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full inline-block"
              style={{ background: '#10B981', boxShadow: '0 0 6px #10B981' }}
            />
            <span className="text-xs" style={{ color: '#6B7280' }}>Platform Live · March 2026</span>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <div
          className="md:hidden flex items-center justify-between px-4 py-3"
          style={{ background: '#FFFFFF', borderBottom: '1px solid #E5E7EB' }}
        >
          <p className="font-bold" style={{ color: '#FF8C2E' }}>CreatorIQ</p>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ color: '#6B7280', background: 'none', border: 'none', cursor: 'pointer' }}>
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
