import React from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LabelList,
} from 'recharts';

// ── Palette ──────────────────────────────────────────────────────────────────
const C = {
  bg:     '#0F172A',
  darker: '#090E1A',
  card:   '#1E293B',
  border: '#334155',
  text:   '#F1F5F9',
  muted:  '#94A3B8',
  grid:   '#253047',
  blue:   '#1A56DB',
  teal:   '#10B981',
  amber:  '#F59E0B',
  red:    '#EF4444',
  purple: '#8B5CF6',
};

const MULTI = [
  '#F97316','#EC4899','#3B82F6','#10B981','#F59E0B','#8B5CF6',
  '#06B6D4','#84CC16','#EF4444','#14B8A6','#A855F7','#EAB308',
  '#6366F1','#22C55E','#F43F5E','#0EA5E9','#D946EF','#FB923C',
];

// ── Static data ───────────────────────────────────────────────────────────────
const revenueByNiche = [
  { niche: 'Gaming & Esports',          revenue: 138 },
  { niche: 'Education & Online Courses',revenue: 172 },
  { niche: 'Finance & Investing',       revenue: 181 },
  { niche: 'Photography & Videography', revenue: 239 },
  { niche: 'Language Learning',         revenue: 249 },
  { niche: 'Pet Care',                  revenue: 303 },
  { niche: 'Travel & Adventure',        revenue: 311 },
  { niche: 'Personal Development',      revenue: 381 },
  { niche: 'Comedy & Entertainment',    revenue: 410 },
  { niche: 'Sustainable Living',        revenue: 440 },
  { niche: 'Business & Entrepreneurship', revenue: 459 },
  { niche: 'Home Decor & Interior',     revenue: 482 },
  { niche: 'Food & Cooking',            revenue: 528 },
  { niche: 'Beauty & Fashion',          revenue: 528 },
  { niche: 'Music & Audio Production',  revenue: 564 },
  { niche: 'Science & Space',           revenue: 575 },
  { niche: 'Parenting & Family',        revenue: 597 },
  { niche: 'Technology & Software',     revenue: 695 },
];

const platformRevenue = [
  { name: 'Instagram',  value: 28.6, color: '#E1306C' },
  { name: 'Twitter/X',  value: 22.8, color: '#1DA1F2' },
  { name: 'TikTok',     value: 13.1, color: '#69C9D0' },
  { name: 'LinkedIn',   value: 12.5, color: '#0A66C2' },
  { name: 'YouTube',    value: 11.5, color: '#FF4444' },
  { name: 'Substack',   value: 11.5, color: '#F59E0B' },
];

const healthByNiche = [
  { niche: 'Travel & Adventure',        score: 58.2 },
  { niche: 'Parenting & Family',        score: 58.9 },
  { niche: 'Sustainable Living',        score: 60.3 },
  { niche: 'Finance & Investing',       score: 60.9 },
  { niche: 'Home Decor & Interior',     score: 61.1 },
  { niche: 'Personal Development',      score: 62.9 },
  { niche: 'Science & Space',           score: 63.3 },
  { niche: 'Food & Cooking',            score: 64.0 },
  { niche: 'Business & Entrepreneurship', score: 64.2 },
  { niche: 'Beauty & Fashion',          score: 64.3 },
  { niche: 'Education & Online Courses',score: 64.7 },
  { niche: 'Technology & Software',     score: 67.0 },
  { niche: 'Comedy & Entertainment',    score: 69.9 },
  { niche: 'Language Learning',         score: 71.8 },
  { niche: 'Gaming & Esports',          score: 76.2 },
  { niche: 'Photography & Videography', score: 77.1 },
];

const dealStatus = [
  { name: 'Completed',   value: 50.0, color: '#10B981' },
  { name: 'Negotiating', value: 17.4, color: '#1A56DB' },
  { name: 'In Progress', value: 15.3, color: '#F59E0B' },
  { name: 'Declined',    value: 17.4, color: '#EF4444' },
];

const dealGap = [
  { niche: 'Travel & Adventure',         gap: 40.0 },
  { niche: 'Education & Online Courses', gap: 40.4 },
  { niche: 'Finance & Investing',        gap: 40.4 },
  { niche: 'Language Learning',          gap: 40.7 },
  { niche: 'Food & Cooking',             gap: 40.8 },
  { niche: 'Personal Development',       gap: 42.2 },
  { niche: 'Music & Audio Production',   gap: 42.2 },
  { niche: 'Home Decor & Interior',      gap: 42.9 },
  { niche: 'Pet Care',                   gap: 43.0 },
  { niche: 'Beauty & Fashion',           gap: 43.1 },
  { niche: 'Business & Entrepreneurship',gap: 43.3 },
  { niche: 'Parenting & Family',         gap: 43.4 },
  { niche: 'Photography & Videography',  gap: 43.8 },
  { niche: 'Sustainable Living',         gap: 44.4 },
  { niche: 'Technology & Software',      gap: 44.5 },
  { niche: 'Science & Space',            gap: 44.6 },
  { niche: 'Comedy & Entertainment',     gap: 44.6 },
  { niche: 'Gaming & Esports',           gap: 45.7 },
];

const contentFormats = [
  { format: 'Instagram Post',  revenue: 11 },
  { format: 'Substack Issue',  revenue: 6  },
  { format: 'TikTok',          revenue: 5  },
  { format: 'YouTube Short',   revenue: 5  },
  { format: 'Instagram Story', revenue: 5  },
  { format: 'YouTube Video',   revenue: 5  },
  { format: 'LinkedIn Post',   revenue: 4  },
  { format: 'Instagram Reel',  revenue: 4  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────
const healthColor = s => s >= 70 ? C.teal : s >= 60 ? C.amber : C.red;
const gapColor    = g => g > 43  ? C.red  : g > 40  ? C.amber : C.blue;

const ttStyle = {
  contentStyle: { background: '#1E293B', border: '1px solid #334155', borderRadius: 8, color: '#F1F5F9', fontSize: 12 },
  itemStyle:    { color: '#F1F5F9' },
  labelStyle:   { color: '#94A3B8', fontWeight: 600 },
  cursor:       { fill: 'rgba(255,255,255,0.05)' },
};

const axisP = {
  tick:      { fill: '#94A3B8', fontSize: 11 },
  axisLine:  { stroke: '#334155' },
  tickLine:  false,
};

// ── Sub-components ────────────────────────────────────────────────────────────
const KpiCard = ({ emoji, label, value, sub, color }) => (
  <div
    style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '18px 20px',
             position: 'relative', overflow: 'hidden', transition: 'transform .2s', cursor: 'default' }}
    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
  >
    <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background: color, borderRadius:'14px 14px 0 0' }} />
    <div style={{ fontSize: 22, marginBottom: 8 }}>{emoji}</div>
    <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.muted, marginBottom: 4 }}>{label}</p>
    <p style={{ fontSize: 28, fontWeight: 700, color, lineHeight: 1.1 }}>{value}</p>
    <p style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>{sub}</p>
  </div>
);

const Card = ({ title, children, style }) => (
  <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '20px 20px 12px', ...style }}>
    <p style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 16 }}>{title}</p>
    {children}
  </div>
);

const PieLabel = ({ cx, cy, midAngle, outerRadius, name, percent }) => {
  const r = outerRadius + 22;
  const rad = Math.PI / 180;
  const x = cx + r * Math.cos(-midAngle * rad);
  const y = cy + r * Math.sin(-midAngle * rad);
  if (percent < 0.05) return null;
  return (
    <text x={x} y={y} fill={C.muted} fontSize={11} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
      {name} {(percent * 100).toFixed(0)}%
    </text>
  );
};

// ── Dashboard ─────────────────────────────────────────────────────────────────
const DashboardHome = () => (
  <div style={{ background: C.darker, minHeight: '100vh' }}>

    {/* HEADER */}
    <div style={{
      background: 'linear-gradient(135deg, #0d1b3e 0%, #1A56DB 55%, #1d4ed8 100%)',
      padding: '22px 32px 18px',
      borderBottom: `1px solid ${C.border}`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>
          <span style={{ color: '#93C5FD' }}>Creator</span>
          <span style={{ color: '#fff' }}>IQ</span>
          <span style={{ color: '#dbeafe', fontWeight: 400 }}> — AI-Powered Creator Monetization Platform</span>
        </h1>
        <p style={{ fontSize: 13, color: '#93C5FD', marginTop: 4 }}>
          Creator Economy Intelligence &nbsp;·&nbsp; 2,000 Deals Tracked &nbsp;·&nbsp; March 2026
        </p>
      </div>
      <div style={{ background: 'rgba(16,185,129,0.15)', border: `1px solid ${C.teal}`, color: C.teal,
                    padding: '5px 14px', borderRadius: 100, fontSize: 11, fontWeight: 600, letterSpacing: '0.08em',
                    display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: C.teal, display: 'inline-block' }} />
        LIVE DASHBOARD
      </div>
    </div>

    {/* KPI STRIP */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 16, padding: '20px 24px',
                  background: C.bg, borderBottom: `1px solid ${C.border}` }}>
      <KpiCard emoji="👥" label="Total Creators"     value="600"     sub="Across 18 niches"            color={C.blue}   />
      <KpiCard emoji="💰" label="Revenue Pool"       value="$7.3B"   sub="Total addressable market"    color={C.teal}   />
      <KpiCard emoji="❤️" label="Avg Health Score"   value="68.4/100" sub="Audience retention index"  color={C.amber}  />
      <KpiCard emoji="🤖" label="AI Benchmark Usage" value="50%"     sub="of deals used AI analysis"   color={C.purple} />
      <KpiCard emoji="💸" label="Avg Rate Recovered" value="$1,543"  sub="per AI-assisted deal"        color={C.red}    />
    </div>

    {/* LEGEND */}
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, padding: '10px 24px',
                  background: C.bg, borderBottom: `1px solid ${C.border}`, fontSize: 11, color: C.muted, alignItems: 'center' }}>
      <span style={{ fontWeight: 600, color: C.text }}>Health Score:</span>
      {[[C.teal,'Healthy ≥70'],[C.amber,'Watch 60–70'],[C.red,'At Risk <60']].map(([c,l])=>(
        <span key={l} style={{ display:'flex', alignItems:'center', gap:5 }}>
          <span style={{ width:9, height:9, borderRadius:'50%', background:c, display:'inline-block' }} />{l}
        </span>
      ))}
      <span style={{ marginLeft: 16, fontWeight: 600, color: C.text }}>Deal Gap:</span>
      {[[C.red,'Critical >43%'],[C.amber,'High 40–43%'],[C.blue,'Moderate <40%']].map(([c,l])=>(
        <span key={l} style={{ display:'flex', alignItems:'center', gap:5 }}>
          <span style={{ width:9, height:9, borderRadius:'50%', background:c, display:'inline-block' }} />{l}
        </span>
      ))}
    </div>

    {/* CHARTS */}
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* ROW 1: Revenue + Platform */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 20 }}>

        <Card title="💰 Total Revenue Pool by Niche">
          <ResponsiveContainer width="100%" height={420}>
            <BarChart data={revenueByNiche} layout="vertical" margin={{ top:0, right:60, left:10, bottom:0 }}>
              <CartesianGrid horizontal={false} stroke={C.grid} />
              <XAxis type="number" {...axisP} tickFormatter={v=>`$${v}M`} />
              <YAxis type="category" dataKey="niche" {...axisP} width={160} tick={{ fill:C.muted, fontSize:10 }} />
              <Tooltip {...ttStyle} formatter={v=>[`$${v}M`,'Revenue Pool']} />
              <Bar dataKey="revenue" radius={[0,4,4,0]}>
                {revenueByNiche.map((_,i)=><Cell key={i} fill={MULTI[i%MULTI.length]}/>)}
                <LabelList dataKey="revenue" position="right" formatter={v=>`$${v}M`} style={{fill:C.muted,fontSize:10}}/>
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="📊 Platform Revenue Share">
          <ResponsiveContainer width="100%" height={420}>
            <PieChart>
              <Pie data={platformRevenue} dataKey="value" nameKey="name"
                   cx="50%" cy="46%" innerRadius={80} outerRadius={128}
                   labelLine={false} label={PieLabel}>
                {platformRevenue.map((e,i)=><Cell key={i} fill={e.color} stroke={C.darker} strokeWidth={2}/>)}
              </Pie>
              <Tooltip {...ttStyle} formatter={v=>[`${v}%`,'Share']}/>
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* ROW 2: Health + Deal Status */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 20 }}>

        <Card title="❤️ Audience Health Score by Niche">
          <ResponsiveContainer width="100%" height={380}>
            <BarChart data={healthByNiche} layout="vertical" margin={{ top:0, right:55, left:10, bottom:0 }}>
              <CartesianGrid horizontal={false} stroke={C.grid} />
              <XAxis type="number" {...axisP} domain={[0,100]} />
              <YAxis type="category" dataKey="niche" {...axisP} width={160} tick={{ fill:C.muted, fontSize:10 }} />
              <Tooltip {...ttStyle} formatter={v=>[v.toFixed(1),'Health Score']}/>
              <Bar dataKey="score" radius={[0,4,4,0]}>
                {healthByNiche.map((e,i)=><Cell key={i} fill={healthColor(e.score)}/>)}
                <LabelList dataKey="score" position="right" formatter={v=>v.toFixed(1)} style={{fill:C.muted,fontSize:10}}/>
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="🤝 Deal Status Breakdown">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={dealStatus} dataKey="value" nameKey="name"
                   cx="50%" cy="50%" innerRadius={70} outerRadius={110}
                   labelLine={false} label={PieLabel}>
                {dealStatus.map((e,i)=><Cell key={i} fill={e.color} stroke={C.darker} strokeWidth={2}/>)}
              </Pie>
              <Tooltip {...ttStyle} formatter={v=>[`${v}%`,'Share']}/>
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginTop:12 }}>
            {dealStatus.map(d=>(
              <div key={d.name} style={{ display:'flex', alignItems:'center', gap:8, fontSize:12, color:C.muted }}>
                <span style={{ width:10, height:10, borderRadius:'50%', background:d.color, flexShrink:0 }}/>
                {d.name}
                <span style={{ marginLeft:'auto', fontWeight:700, color:C.text }}>{d.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ROW 3: Deal Gap + Content Formats */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 20 }}>

        <Card title="📉 Avg Deal Gap vs Market Rate (% Below)">
          <ResponsiveContainer width="100%" height={420}>
            <BarChart data={dealGap} layout="vertical" margin={{ top:0, right:60, left:10, bottom:0 }}>
              <CartesianGrid horizontal={false} stroke={C.grid} />
              <XAxis type="number" {...axisP} tickFormatter={v=>`${v}%`} />
              <YAxis type="category" dataKey="niche" {...axisP} width={160} tick={{ fill:C.muted, fontSize:10 }} />
              <Tooltip {...ttStyle} formatter={v=>[`${v.toFixed(1)}%`,'% Below Market']}/>
              <Bar dataKey="gap" radius={[0,4,4,0]}>
                {dealGap.map((e,i)=><Cell key={i} fill={gapColor(e.gap)}/>)}
                <LabelList dataKey="gap" position="right" formatter={v=>`${v.toFixed(1)}%`} style={{fill:C.muted,fontSize:10}}/>
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="🎬 Top Content Formats by Revenue">
          <ResponsiveContainer width="100%" height={420}>
            <BarChart data={contentFormats} margin={{ top:10, right:16, left:0, bottom:70 }}>
              <CartesianGrid vertical={false} stroke={C.grid} />
              <XAxis dataKey="format" {...axisP} angle={-40} textAnchor="end" interval={0} tick={{ fill:C.muted, fontSize:10 }} />
              <YAxis {...axisP} tickFormatter={v=>`$${v}M`} />
              <Tooltip {...ttStyle} formatter={v=>[`$${v}M`,'Revenue']}/>
              <Bar dataKey="revenue" radius={[4,4,0,0]}>
                {contentFormats.map((_,i)=><Cell key={i} fill={MULTI[i%MULTI.length]}/>)}
                <LabelList dataKey="revenue" position="top" formatter={v=>`$${v}M`} style={{fill:C.muted,fontSize:10}}/>
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

    </div>

    {/* FOOTER */}
    <div style={{ textAlign:'center', padding:'16px', fontSize:11, color:C.muted,
                  borderTop:`1px solid ${C.border}`, background:C.bg }}>
      CreatorIQ — AI-Powered Creator Intelligence Platform &nbsp;·&nbsp; Data current as of March 2026 &nbsp;·&nbsp; Built with LangSmith + n8n
    </div>
  </div>
);

export default DashboardHome;
