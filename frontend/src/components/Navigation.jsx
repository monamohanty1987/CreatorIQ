import React from 'react';

function Navigation({ currentPage, onNavigate, creatorName, onCreatorNameChange }) {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-logo" onClick={() => onNavigate('home')}>
          🚀 CreatorIQ
        </div>

        <ul className="nav-links">
          <li>
            <button
              className={currentPage === 'home' ? 'active' : ''}
              onClick={() => onNavigate('home')}
            >
              Home
            </button>
          </li>
          <li>
            <button
              className={currentPage === 'deals' ? 'active' : ''}
              onClick={() => onNavigate('deals')}
            >
              💰 Deal Analyzer
            </button>
          </li>
          <li>
            <button
              className={currentPage === 'contracts' ? 'active' : ''}
              onClick={() => onNavigate('contracts')}
            >
              ⚖️ Contract Analyzer
            </button>
          </li>
          <li>
            <button
              className={currentPage === 'campaigns' ? 'active' : ''}
              onClick={() => onNavigate('campaigns')}
            >
              📧 Campaign Generator
            </button>
          </li>
          <li>
            <button
              className={currentPage === 'dashboard' ? 'active' : ''}
              onClick={() => onNavigate('dashboard')}
            >
              📊 Dashboard
            </button>
          </li>
          <li>
            <button
              className={currentPage === 'history' ? 'active' : ''}
              onClick={() => onNavigate('history')}
            >
              📜 History
            </button>
          </li>
          <li>
            <input
              type="text"
              className="nav-creator-input"
              placeholder="Your name"
              value={creatorName}
              onChange={(e) => onCreatorNameChange(e.target.value)}
            />
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navigation;
