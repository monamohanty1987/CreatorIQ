"""
CreatorIQ — Beautiful Interactive HTML Dashboard
Generates: dashboard/CreatorIQ_Dashboard.html
"""
import pandas as pd
import plotly.graph_objects as go
import plotly.io as pio
from plotly.subplots import make_subplots

BASE = "C:/CreatorIQ Project/data/processed"

# ── Load data ──────────────────────────────────────────────────────────────
ns = pd.read_csv(f"{BASE}/niche_market_summary.csv")
bd = pd.read_csv(f"{BASE}/brand_deal_intelligence.csv")
ca = pd.read_csv(f"{BASE}/content_attribution.csv")
ah = pd.read_csv(f"{BASE}/audience_health_trend.csv")
co = pd.read_csv(f"{BASE}/creator_overview.csv")

# ── Palette ────────────────────────────────────────────────────────────────
BLUE    = "#1A56DB"
TEAL    = "#10B981"
AMBER   = "#F59E0B"
RED     = "#EF4444"
PURPLE  = "#8B5CF6"
DARK    = "#0F172A"
DARKER  = "#090E1A"
CARD    = "#1E293B"
BORDER  = "#334155"
TEXT    = "#F1F5F9"
MUTED   = "#94A3B8"
GRID    = "#1E293B"

BLUES  = ["#1A56DB", "#2563EB", "#3B82F6", "#60A5FA", "#93C5FD",
          "#BFDBFE", "#DBEAFE", "#EFF6FF"]
MULTI  = [BLUE, TEAL, AMBER, RED, PURPLE, "#06B6D4", "#F97316", "#84CC16",
          "#EC4899", "#14B8A6", "#A855F7", "#EAB308", "#6366F1", "#22C55E",
          "#F43F5E", "#0EA5E9", "#D946EF", "#FB923C"]

def fmt_M(v):
    if v >= 1e9: return f"${v/1e9:.1f}B"
    if v >= 1e6: return f"${v/1e6:.0f}M"
    return f"${v/1e3:.0f}K"

# ── KPI values ─────────────────────────────────────────────────────────────
total_creators   = len(co)
total_rev_pool   = ns["total_revenue_pool"].sum()
avg_health       = co["health_score"].mean()
ai_benchmark_pct = bd["used_ai_benchmark"].mean() * 100
total_deals      = len(bd)
avg_recovered    = bd["rate_recovered_usd"].mean()
completed_pct    = (bd["status"] == "Completed").mean() * 100

# ── Pre-process ─────────────────────────────────────────────────────────────
ns_sorted = ns.sort_values("total_revenue_pool", ascending=True)

# Health score by niche from audience_health
health_niche = (ah.groupby("niche")["health_score"]
                  .mean().reset_index()
                  .rename(columns={"health_score": "avg_health"})
                  .sort_values("avg_health", ascending=True))

def health_color(score):
    if score >= 70: return TEAL
    if score >= 60: return AMBER
    return RED

health_niche["color"] = health_niche["avg_health"].apply(health_color)

# Brand deal gap — use absolute value, show as "% below market"
ns_deal = ns.copy()
ns_deal["below_market_pct"] = ns_deal["avg_deal_gap_pct"].abs()
ns_deal_sorted = ns_deal.sort_values("below_market_pct", ascending=True)

# Platform revenue
plat_rev = (ca.groupby("platform")["total_revenue"]
              .sum().reset_index()
              .sort_values("total_revenue", ascending=False))

# Deal status
deal_status = bd["status"].value_counts().reset_index()
deal_status.columns = ["status", "count"]

# Content format revenue (top 6 by total)
fmt_rev = (ca.groupby("content_format")["total_revenue"]
             .sum().reset_index()
             .sort_values("total_revenue", ascending=False)
             .head(8))

# Monthly revenue top 10 niches
top10 = ns.sort_values("avg_monthly_revenue", ascending=False).head(10)

# ── Build figure ────────────────────────────────────────────────────────────
fig = make_subplots(
    rows=3, cols=2,
    row_heights=[0.34, 0.34, 0.32],
    column_widths=[0.55, 0.45],
    specs=[
        [{"type": "bar"}, {"type": "pie"}],
        [{"type": "bar"}, {"type": "pie"}],
        [{"type": "bar"}, {"type": "bar"}],
    ],
    subplot_titles=(
        "💰 Total Revenue Pool by Niche",
        "📊 Platform Revenue Share",
        "❤️ Audience Health Score by Niche",
        "🤝 Deal Status Breakdown",
        "📉 Avg Deal Gap vs Market Rate (%)",
        "🎬 Top Content Formats by Revenue",
    ),
    vertical_spacing=0.10,
    horizontal_spacing=0.06,
)

# ── ROW 1a: Revenue by Niche (horizontal bar) ──────────────────────────────
colors_rev = [MULTI[i % len(MULTI)] for i in range(len(ns_sorted))]
fig.add_trace(
    go.Bar(
        y=ns_sorted["niche"],
        x=ns_sorted["total_revenue_pool"],
        orientation="h",
        marker=dict(color=colors_rev, line=dict(width=0)),
        text=[fmt_M(v) for v in ns_sorted["total_revenue_pool"]],
        textposition="outside",
        textfont=dict(color=TEXT, size=10),
        hovertemplate="<b>%{y}</b><br>Revenue Pool: %{x:$,.0f}<extra></extra>",
        name="Revenue",
    ),
    row=1, col=1,
)

# ── ROW 1b: Platform donut ─────────────────────────────────────────────────
fig.add_trace(
    go.Pie(
        labels=plat_rev["platform"],
        values=plat_rev["total_revenue"],
        hole=0.55,
        marker=dict(colors=MULTI, line=dict(color=DARK, width=2)),
        textinfo="label+percent",
        textfont=dict(color=TEXT, size=11),
        hovertemplate="<b>%{label}</b><br>%{value:$,.0f}<br>%{percent}<extra></extra>",
        showlegend=False,
    ),
    row=1, col=2,
)

# ── ROW 2a: Health score horizontal bar ────────────────────────────────────
fig.add_trace(
    go.Bar(
        y=health_niche["niche"],
        x=health_niche["avg_health"],
        orientation="h",
        marker=dict(color=health_niche["color"], line=dict(width=0)),
        text=[f"{v:.1f}" for v in health_niche["avg_health"]],
        textposition="outside",
        textfont=dict(color=TEXT, size=10),
        hovertemplate="<b>%{y}</b><br>Health Score: %{x:.1f}<extra></extra>",
        name="Health",
    ),
    row=2, col=1,
)
# Threshold lines via shapes (scoped to subplot axes)
for x_val, line_col in [(70, TEAL), (60, AMBER)]:
    fig.add_shape(
        type="line", x0=x_val, x1=x_val, y0=-0.5,
        y1=len(health_niche) - 0.5,
        line=dict(color=line_col, width=1.5, dash="dot"),
        xref="x3", yref="y3",
    )

# ── ROW 2b: Deal status donut ──────────────────────────────────────────────
status_colors = {
    "Completed": TEAL, "Negotiating": BLUE, "In Progress": AMBER, "Declined": RED
}
s_colors = [status_colors.get(s, PURPLE) for s in deal_status["status"]]

fig.add_trace(
    go.Pie(
        labels=deal_status["status"],
        values=deal_status["count"],
        hole=0.55,
        marker=dict(colors=s_colors, line=dict(color=DARK, width=2)),
        textinfo="label+percent",
        textfont=dict(color=TEXT, size=11),
        hovertemplate="<b>%{label}</b><br>%{value} deals (%{percent})<extra></extra>",
        showlegend=False,
    ),
    row=2, col=2,
)

# ── ROW 3a: Deal gap bar ───────────────────────────────────────────────────
gap_colors = [RED if v > 43 else AMBER if v > 40 else BLUE
              for v in ns_deal_sorted["below_market_pct"]]
fig.add_trace(
    go.Bar(
        y=ns_deal_sorted["niche"],
        x=ns_deal_sorted["below_market_pct"],
        orientation="h",
        marker=dict(color=gap_colors, line=dict(width=0)),
        text=[f"{v:.1f}%" for v in ns_deal_sorted["below_market_pct"]],
        textposition="outside",
        textfont=dict(color=TEXT, size=10),
        hovertemplate="<b>%{y}</b><br>%{x:.1f}% below market rate<extra></extra>",
        name="Gap",
    ),
    row=3, col=1,
)

# ── ROW 3b: Content format revenue bar ────────────────────────────────────
fig.add_trace(
    go.Bar(
        x=fmt_rev["content_format"],
        y=fmt_rev["total_revenue"],
        marker=dict(color=MULTI[:len(fmt_rev)], line=dict(width=0)),
        text=[fmt_M(v) for v in fmt_rev["total_revenue"]],
        textposition="outside",
        textfont=dict(color=TEXT, size=10),
        hovertemplate="<b>%{x}</b><br>%{y:$,.0f}<extra></extra>",
        name="Format",
    ),
    row=3, col=2,
)

# ── Global layout ──────────────────────────────────────────────────────────
fig.update_layout(
    paper_bgcolor=DARKER,
    plot_bgcolor=DARK,
    font=dict(family="Inter, Segoe UI, Arial", color=TEXT, size=12),
    margin=dict(t=60, b=40, l=20, r=30),
    height=1380,
    showlegend=False,
)

# Axes styling
axis_style = dict(
    gridcolor=GRID, zerolinecolor=BORDER,
    tickfont=dict(color=MUTED, size=10),
    title_font=dict(color=MUTED, size=11),
    linecolor=BORDER,
)

for row in [1, 2, 3]:
    fig.update_xaxes(**axis_style, row=row, col=1)
    fig.update_yaxes(**axis_style, row=row, col=1, automargin=True)

fig.update_xaxes(**axis_style, row=3, col=2)
fig.update_yaxes(**axis_style, row=3, col=2)

# Axis labels
fig.update_xaxes(title_text="Total Revenue Pool (USD)", row=1, col=1,
                 tickprefix="$", tickformat=",.0s")
fig.update_xaxes(title_text="Avg Health Score", row=2, col=1, range=[0, 100])
fig.update_xaxes(title_text="% Below Market Rate", row=3, col=1)
fig.update_yaxes(title_text="", row=3, col=2)

# Subplot title styling
for ann in fig.layout.annotations:
    ann.font = dict(color=TEXT, size=13, family="Inter, Segoe UI, Arial")
    ann.x += 0.01

# ── Export to HTML with custom wrapper ────────────────────────────────────
chart_div = pio.to_html(fig, include_plotlyjs="cdn", full_html=False,
                        config={"displayModeBar": False, "responsive": True})

HTML = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>CreatorIQ — AI-Powered Creator Monetization Platform</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>
<style>
  *, *::before, *::after {{ box-sizing: border-box; margin: 0; padding: 0; }}
  body {{
    background: {DARKER};
    color: {TEXT};
    font-family: 'Inter', 'Segoe UI', sans-serif;
    min-height: 100vh;
  }}

  /* ── Header ── */
  .header {{
    background: linear-gradient(135deg, #0d1b3e 0%, #1A56DB 50%, #1d4ed8 100%);
    padding: 28px 40px 24px;
    border-bottom: 1px solid {BORDER};
    display: flex;
    align-items: center;
    justify-content: space-between;
  }}
  .header-left h1 {{
    font-size: 26px;
    font-weight: 700;
    letter-spacing: -0.5px;
  }}
  .header-left h1 span {{ color: #60A5FA; }}
  .header-left p {{
    font-size: 13px;
    color: #93C5FD;
    margin-top: 4px;
    font-weight: 300;
    letter-spacing: 0.4px;
  }}
  .header-badge {{
    background: rgba(16,185,129,0.15);
    border: 1px solid {TEAL};
    color: {TEAL};
    padding: 6px 14px;
    border-radius: 100px;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.8px;
  }}

  /* ── KPI strip ── */
  .kpi-strip {{
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 16px;
    padding: 24px 40px;
    background: {DARK};
    border-bottom: 1px solid {BORDER};
  }}
  .kpi-card {{
    background: {CARD};
    border: 1px solid {BORDER};
    border-radius: 12px;
    padding: 18px 20px;
    position: relative;
    overflow: hidden;
    transition: transform 0.2s;
  }}
  .kpi-card:hover {{ transform: translateY(-2px); }}
  .kpi-card::before {{
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    border-radius: 12px 12px 0 0;
  }}
  .kpi-card.blue::before {{ background: {BLUE}; }}
  .kpi-card.teal::before {{ background: {TEAL}; }}
  .kpi-card.amber::before {{ background: {AMBER}; }}
  .kpi-card.red::before {{ background: {RED}; }}
  .kpi-card.purple::before {{ background: {PURPLE}; }}
  .kpi-icon {{
    font-size: 22px;
    margin-bottom: 10px;
  }}
  .kpi-label {{
    font-size: 11px;
    color: {MUTED};
    text-transform: uppercase;
    letter-spacing: 0.8px;
    font-weight: 500;
  }}
  .kpi-value {{
    font-size: 26px;
    font-weight: 700;
    margin: 4px 0;
    line-height: 1.1;
  }}
  .kpi-sub {{
    font-size: 11px;
    color: {MUTED};
    margin-top: 2px;
  }}
  .kpi-card.blue .kpi-value {{ color: #60A5FA; }}
  .kpi-card.teal .kpi-value {{ color: {TEAL}; }}
  .kpi-card.amber .kpi-value {{ color: {AMBER}; }}
  .kpi-card.red .kpi-value {{ color: {RED}; }}
  .kpi-card.purple .kpi-value {{ color: #A78BFA; }}

  /* ── Chart area ── */
  .chart-wrapper {{
    padding: 8px 24px 32px;
    background: {DARKER};
  }}

  /* ── Legend strip ── */
  .legend-strip {{
    display: flex;
    gap: 24px;
    align-items: center;
    padding: 10px 40px;
    background: {DARK};
    border-bottom: 1px solid {BORDER};
    font-size: 11px;
    color: {MUTED};
    flex-wrap: wrap;
  }}
  .legend-item {{
    display: flex;
    align-items: center;
    gap: 6px;
  }}
  .dot {{
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;
  }}

  /* ── Footer ── */
  .footer {{
    text-align: center;
    padding: 16px;
    color: {MUTED};
    font-size: 11px;
    border-top: 1px solid {BORDER};
    background: {DARK};
  }}
</style>
</head>
<body>

<!-- Header -->
<div class="header">
  <div class="header-left">
    <h1>Creator<span>IQ</span> &mdash; AI-Powered Creator Monetization Platform</h1>
    <p>Creator Economy Intelligence &nbsp;&bull;&nbsp; {total_deals:,} Deals Tracked &nbsp;&bull;&nbsp; March 2026</p>
  </div>
  <div class="header-badge">&#9679; LIVE DASHBOARD</div>
</div>

<!-- KPI Strip -->
<div class="kpi-strip">
  <div class="kpi-card blue">
    <div class="kpi-icon">👥</div>
    <div class="kpi-label">Total Creators</div>
    <div class="kpi-value">{total_creators:,}</div>
    <div class="kpi-sub">Across 18 niches</div>
  </div>
  <div class="kpi-card teal">
    <div class="kpi-icon">💰</div>
    <div class="kpi-label">Revenue Pool</div>
    <div class="kpi-value">{fmt_M(total_rev_pool)}</div>
    <div class="kpi-sub">Total addressable market</div>
  </div>
  <div class="kpi-card amber">
    <div class="kpi-icon">❤️</div>
    <div class="kpi-label">Avg Health Score</div>
    <div class="kpi-value">{avg_health:.1f}<span style="font-size:14px">/100</span></div>
    <div class="kpi-sub">Audience retention index</div>
  </div>
  <div class="kpi-card purple">
    <div class="kpi-icon">🤖</div>
    <div class="kpi-label">AI Benchmark Usage</div>
    <div class="kpi-value">{ai_benchmark_pct:.0f}%</div>
    <div class="kpi-sub">of deals used AI analysis</div>
  </div>
  <div class="kpi-card red">
    <div class="kpi-icon">💸</div>
    <div class="kpi-label">Avg Rate Recovered</div>
    <div class="kpi-value">${avg_recovered:,.0f}</div>
    <div class="kpi-sub">per AI-assisted deal</div>
  </div>
</div>

<!-- Legend -->
<div class="legend-strip">
  <strong style="color:{TEXT};">Health Score Key:</strong>
  <div class="legend-item"><div class="dot" style="background:{TEAL}"></div> Healthy (≥70)</div>
  <div class="legend-item"><div class="dot" style="background:{AMBER}"></div> Watch (60–70)</div>
  <div class="legend-item"><div class="dot" style="background:{RED}"></div> At Risk (&lt;60)</div>
  &nbsp;&nbsp;
  <strong style="color:{TEXT};">Deal Gap:</strong>
  <div class="legend-item"><div class="dot" style="background:{RED}"></div> Critical (&gt;43% below)</div>
  <div class="legend-item"><div class="dot" style="background:{AMBER}"></div> High (40–43% below)</div>
  <div class="legend-item"><div class="dot" style="background:{BLUE}"></div> Moderate (&lt;40% below)</div>
</div>

<!-- Charts -->
<div class="chart-wrapper">
  {chart_div}
</div>

<div class="footer">
  CreatorIQ &mdash; AI-Powered Creator Intelligence Platform &nbsp;&bull;&nbsp; Data current as of March 2026 &nbsp;&bull;&nbsp; Built with LangSmith + n8n
</div>

</body>
</html>"""

out = "C:/CreatorIQ Project/dashboard/CreatorIQ_Dashboard.html"
with open(out, "w", encoding="utf-8") as f:
    f.write(HTML)

print(f"Dashboard saved: {out}")
print(f"KPIs: {total_creators} creators | {fmt_M(total_rev_pool)} pool | {avg_health:.1f} health | {ai_benchmark_pct:.0f}% AI | ${avg_recovered:.0f} recovered")
