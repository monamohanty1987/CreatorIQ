import React, { useState, useRef, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const SUGGESTED_QUESTIONS = [
  "How do I price a brand deal?",
  "What red flags should I look for in contracts?",
  "How can I repurpose my YouTube content?",
  "What's a fair rate for 100K followers?",
];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm your CreatorIQ assistant 👋 Ask me anything about brand deals, contracts, or content strategy!" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (open && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  const sendMessage = async (text) => {
    const userMessage = text || input.trim();
    if (!userMessage) return;

    setInput('');
    setShowSuggestions(false);
    setLoading(true);

    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);

    try {
      const response = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          history: newMessages.slice(-7)
        })
      });

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Sorry, I couldn't connect right now. Please try again!"
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          zIndex: 9999,
          transition: 'transform 0.2s',
        }}
        title="Ask me anything"
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        {open ? '✕' : '💬'}
      </button>

      {/* Chat window */}
      {open && (
        <div style={{
          position: 'fixed',
          bottom: '90px',
          right: '24px',
          width: '360px',
          maxHeight: '520px',
          borderRadius: '16px',
          background: '#fff',
          boxShadow: '0 8px 40px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 9998,
          overflow: 'hidden',
          border: '1px solid #e5e7eb',
        }}>

          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}>
            <div style={{ fontSize: '22px' }}>🤖</div>
            <div>
              <div style={{ color: '#fff', fontWeight: '600', fontSize: '14px' }}>CreatorIQ Assistant</div>
              <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>Ask me anything about creator business</div>
            </div>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            background: '#f9fafb',
            minHeight: '280px',
            maxHeight: '340px',
          }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              }}>
                <div style={{
                  maxWidth: '80%',
                  padding: '9px 13px',
                  borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                  background: msg.role === 'user' ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : '#fff',
                  color: msg.role === 'user' ? '#fff' : '#1f2937',
                  fontSize: '13px',
                  lineHeight: '1.5',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                  whiteSpace: 'pre-wrap',
                }}>
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{
                  padding: '9px 13px',
                  borderRadius: '14px 14px 14px 4px',
                  background: '#fff',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                  fontSize: '18px',
                  letterSpacing: '2px',
                }}>
                  <span style={{ animation: 'pulse 1s infinite' }}>...</span>
                </div>
              </div>
            )}

            {/* Suggested questions */}
            {showSuggestions && messages.length === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                {SUGGESTED_QUESTIONS.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(q)}
                    style={{
                      textAlign: 'left',
                      padding: '7px 11px',
                      borderRadius: '8px',
                      border: '1px solid #e0e7ff',
                      background: '#eef2ff',
                      color: '#4f46e5',
                      fontSize: '12px',
                      cursor: 'pointer',
                      fontWeight: '500',
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: '10px 12px',
            borderTop: '1px solid #e5e7eb',
            background: '#fff',
            display: 'flex',
            gap: '8px',
            alignItems: 'flex-end',
          }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about deals, contracts, content..."
              rows={1}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '10px',
                border: '1px solid #d1d5db',
                fontSize: '13px',
                resize: 'none',
                outline: 'none',
                fontFamily: 'inherit',
                lineHeight: '1.4',
              }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              style={{
                padding: '8px 14px',
                borderRadius: '10px',
                background: input.trim() ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : '#e5e7eb',
                color: input.trim() ? '#fff' : '#9ca3af',
                border: 'none',
                cursor: input.trim() ? 'pointer' : 'not-allowed',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.2s',
              }}
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}
