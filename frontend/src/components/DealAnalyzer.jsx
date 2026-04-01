import React, { useState } from 'react';
import { analyzeBrandDeal } from '../services/api';
import {
  TrendingUp, TrendingDown, DollarSign, Users, AlertTriangle,
  CheckCircle, ChevronRight, BarChart2, Zap, RefreshCw, Home
} from 'lucide-react';

const NICHES = [
  { value: 'fitness',  label: 'Fitness & Health' },
  { value: 'finance',  label: 'Finance' },
  { value: 'tech',     label: 'Tech & Gaming' },
  { value: 'lifestyle',label: 'Lifestyle' },
  { value: 'beauty',   label: 'Beauty & Fashion' },
  { value: 'food',     label: 'Food & Cooking' },
  { value: 'business', label: 'Business & Entrepreneurship' },
  { value: 'travel',   label: 'Travel' },
];

const PLATFORMS = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'tiktok',    label: 'TikTok' },
  { value: 'youtube',   label: 'YouTube' },
];

const FORMATS = [
  { value: 'post',  label: 'Single Post' },
  { value: 'reel',  label: 'Reel / Short' },
  { value: 'story', label: 'Story' },
  { value: 'video', label: 'Long-Form Video' },
];

function StatCard({ label, value, sub, color = 'text-foreground' }) {
  return (
    <div className="bg-background border border-border rounded-xl p-4 flex flex-col gap-1">
      <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</span>
      <span className={`text-2xl font-bold ${color}`}>{value}</span>
      {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
    </div>
  );
}

export default function DealAnalyzer({ onNavigate }) {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const [result,  setResult]  = useState(null);

  const [form, setForm] = useState({
    creator_name:    '',
    niche:           'lifestyle',
    platform:        'instagram',
    followers:       50000,
    offered_rate_usd:3000,
    format:          'post',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: (name === 'followers' || name === 'offered_rate_usd')
        ? (value === '' ? '' : parseFloat(value))
        : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await analyzeBrandDeal(form);
      setResult(res);
    } catch (err) {
      setError(err.message || 'Failed to analyze deal. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const isBelow    = result?.verdict === 'BELOW_MARKET';
  const verdictColor = isBelow ? 'text-red-500' : 'text-emerald-500';
  const verdictBg    = isBelow ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200';

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-6">

      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Brand Deal Analyzer
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Check if you're getting fair market rate · Based on 52,000+ real creator deals
          </p>
        </div>
        {onNavigate && (
          <button
            onClick={() => onNavigate('home')}
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
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── Form ── */}
        <div className="glass-card p-6 space-y-4">
          <h2 className="font-semibold text-foreground">Deal Details</h2>

          <form onSubmit={handleSubmit} className="space-y-4">

            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Your Name</label>
              <input
                name="creator_name"
                value={form.creator_name}
                onChange={handleChange}
                required
                placeholder="e.g. Sarah"
                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Niche</label>
                <select
                  name="niche"
                  value={form.niche}
                  onChange={handleChange}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {NICHES.map(n => <option key={n.value} value={n.value}>{n.label}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Platform</label>
                <select
                  name="platform"
                  value={form.platform}
                  onChange={handleChange}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {PLATFORMS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Followers</label>
                <input
                  type="number"
                  name="followers"
                  value={form.followers}
                  onChange={handleChange}
                  min="0"
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Offered Rate (EUR)</label>
                <input
                  type="number"
                  name="offered_rate_usd"
                  value={form.offered_rate_usd}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Content Format</label>
              <select
                name="format"
                value={form.format}
                onChange={handleChange}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {FORMATS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white rounded-lg py-2.5 text-sm font-semibold hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2 transition-opacity"
            >
              {loading
                ? <><RefreshCw className="w-4 h-4 animate-spin" /> Analyzing via n8n…</>
                : <><Zap className="w-4 h-4" /> Analyze Deal</>
              }
            </button>

          </form>

          {error && (
            <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              {error}
            </div>
          )}
        </div>

        {/* ── Result Panel ── */}
        <div className="space-y-4">
          {!result && !loading && (
            <div className="glass-card p-6 flex flex-col items-center justify-center h-full text-center space-y-3 text-muted-foreground">
              <BarChart2 className="w-12 h-12 opacity-30" />
              <p className="text-sm">Fill in deal details and click <strong>Analyze Deal</strong> to see market rate comparison.</p>
            </div>
          )}

          {loading && (
            <div className="glass-card p-6 flex flex-col items-center justify-center h-full text-center space-y-3 text-muted-foreground">
              <RefreshCw className="w-10 h-10 animate-spin text-primary" />
              <p className="text-sm font-medium">Running O4 Brand Deal Rate Checker…</p>
              <p className="text-xs">n8n → Market Rate Benchmark Engine</p>
            </div>
          )}

          {result && (
            <div className="space-y-4">

              {/* Verdict Banner */}
              <div className={`border rounded-xl p-4 ${verdictBg}`}>
                <div className="flex items-center gap-2 mb-1">
                  {isBelow
                    ? <AlertTriangle className="w-5 h-5 text-red-500" />
                    : <CheckCircle  className="w-5 h-5 text-emerald-500" />
                  }
                  <span className={`font-bold text-base ${verdictColor}`}>
                    {result.headline || (isBelow ? '⚠️ Below Market Rate' : '✅ Good Deal')}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground pl-7">{result.recommendation}</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <StatCard
                  label="Offered Rate"
                  value={`€${(result.offered_rate || 0).toLocaleString()}`}
                  sub="What they're paying"
                />
                <StatCard
                  label="Market Rate"
                  value={`€${(result.market_rate || 0).toLocaleString()}`}
                  sub={result.market_range || 'Market average'}
                  color="text-primary"
                />
                <StatCard
                  label="Gap"
                  value={`${result.gap_usd >= 0 ? '+' : ''}€${Math.abs(result.gap_usd || 0).toLocaleString()}`}
                  sub={`${result.gap_pct >= 0 ? '+' : ''}${result.gap_pct || 0}% vs market`}
                  color={result.gap_usd >= 0 ? 'text-emerald-500' : 'text-red-500'}
                />
                <StatCard
                  label="Counter-Offer"
                  value={`€${(result.counter_offer || 0).toLocaleString()}`}
                  sub={result.follower_tier ? `${result.follower_tier} tier` : 'Recommended ask'}
                  color="text-amber-500"
                />
              </div>

              {/* Offer Percentile */}
              {result.offer_percentile && (
                <div className="glass-card p-3 flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-muted-foreground">Your offer is in the</span>
                  <span className="font-semibold text-foreground">{result.offer_percentile}</span>
                  <span className="text-muted-foreground">percentile for your tier</span>
                </div>
              )}

              {/* Talking Points */}
              {result.talking_points?.length > 0 && (
                <div className="glass-card p-4 space-y-2">
                  <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    Negotiation Talking Points
                  </h3>
                  <ul className="space-y-2">
                    {result.talking_points.map((pt, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <ChevronRight className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Meta */}
              <div className="text-xs text-muted-foreground text-center">
                Deal #{result.deal_id} · Saved to history · LangSmith traced
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
