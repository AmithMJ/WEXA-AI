import React from 'react';
import { Network, Sparkles, Briefcase, Layers, User, Database, RefreshCw } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, dbStatus, onSeed, seeding }) {
  const tabs = [
    { id: 'graph', label: 'Graph Explorer', icon: Network },
    { id: 'matcher', label: 'AI Job Matcher & Gap Analysis', icon: Sparkles },
    { id: 'skills', label: 'Skill Taxonomy', icon: Layers },
    { id: 'jobs', label: 'Job Board', icon: Briefcase },
    { id: 'developers', label: 'Developer Workbench', icon: User },
  ];

  return (
    <header style={{
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      background: 'rgba(8, 12, 20, 0.85)',
      backdropFilter: 'blur(12px)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      padding: '12px 24px'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #6366f1, #38bdf8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px rgba(56, 189, 248, 0.4)'
          }}>
            <Network size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', background: 'linear-gradient(135deg, #ffffff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              SkillGraph<span style={{ color: '#38bdf8', WebkitTextFillColor: '#38bdf8' }}>.AI</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500, fontFamily: 'var(--font-mono)' }}>
              Powered by CognoDB openCypher
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 255, 255, 0.04)', padding: '4px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                style={{
                  background: isActive ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(56, 189, 248, 0.2))' : 'transparent',
                  color: isActive ? '#38bdf8' : '#94a3b8',
                  border: isActive ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid transparent',
                  borderRadius: '8px',
                  padding: '8px 14px',
                  fontSize: '0.88rem',
                  fontWeight: isActive ? 600 : 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={16} />
                {t.label}
              </button>
            );
          })}
        </nav>

        {/* DB Status & Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="glass-pill" style={{
            borderColor: dbStatus?.connected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)',
            color: dbStatus?.connected ? '#34d399' : '#fbbf24'
          }}>
            <Database size={14} />
            <span style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}>
              {dbStatus?.connected ? 'CognoDB Bolt Live' : 'In-Memory Graph Engine'}
            </span>
          </div>

          <button
            onClick={onSeed}
            disabled={seeding}
            className="btn-secondary"
            style={{ padding: '6px 14px', fontSize: '0.82rem' }}
          >
            <RefreshCw size={14} className={seeding ? 'spin' : ''} style={{ animation: seeding ? 'spin 1s linear infinite' : 'none' }} />
            {seeding ? 'Seeding...' : 'Seed DB'}
          </button>
        </div>
      </div>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </header>
  );
}
