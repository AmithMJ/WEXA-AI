import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, AlertCircle, BookOpen, ExternalLink, Briefcase, User, Award, ArrowUpRight } from 'lucide-react';

export default function JobMatcher({ developers, onSelectDeveloper }) {
  const [selectedDevId, setSelectedDevId] = useState(developers[0]?.id || 'dev-1');
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('ALL');

  useEffect(() => {
    if (developers.length && !selectedDevId) {
      setSelectedDevId(developers[0].id);
    }
  }, [developers]);

  useEffect(() => {
    if (!selectedDevId) return;
    setLoading(true);
    fetch(`http://localhost:8000/api/developers/${selectedDevId}/recommendations`)
      .then(res => res.json())
      .then(data => {
        setRecommendations(data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch recommendations:', err);
        setLoading(false);
      });
  }, [selectedDevId]);

  const selectedDev = developers.find(d => d.id === selectedDevId) || developers[0];

  const filteredRecs = recommendations.filter(r => {
    if (activeTab === 'HIGH_MATCH') return r.match_percentage >= 70;
    if (activeTab === 'REMOTE') return r.remote;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Selector Card */}
      <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(56, 189, 248, 0.2))',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Sparkles size={24} color="#38bdf8" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f8fafc' }}>AI Job Recommendation & Skill Gap Engine</h2>
            <p style={{ fontSize: '0.88rem', color: '#94a3b8' }}>Traversing openCypher graph to evaluate skill overlaps, match scores, and missing skill pathways.</p>
          </div>
        </div>

        {/* Developer Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <label style={{ fontSize: '0.88rem', color: '#94a3b8', fontWeight: 500 }}>Target Candidate:</label>
          <select
            value={selectedDevId}
            onChange={(e) => setSelectedDevId(e.target.value)}
            style={{
              background: 'rgba(15, 23, 42, 0.9)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              color: '#38bdf8',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '0.9rem',
              fontWeight: 600,
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            {developers.map(d => (
              <option key={d.id} value={d.id}>{d.name} ({d.experience_years} yrs exp)</option>
            ))}
          </select>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '10px' }}>
        {[
          { id: 'ALL', label: 'All Jobs' },
          { id: 'HIGH_MATCH', label: 'High Match (70%+)' },
          { id: 'REMOTE', label: 'Remote Only' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: activeTab === tab.id ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.04)',
              color: activeTab === tab.id ? '#38bdf8' : '#94a3b8',
              border: activeTab === tab.id ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid rgba(255,255,255,0.06)',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Recommendations Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: '20px' }}>
        {filteredRecs.map((rec) => {
          const matchColor = rec.match_percentage >= 75 ? '#10b981' : rec.match_percentage >= 50 ? '#f59e0b' : '#ef4444';
          return (
            <div key={rec.job_id} className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Job Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{rec.company_name}</span>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc', marginTop: '2px' }}>{rec.title}</h3>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '6px', fontSize: '0.82rem', color: '#94a3b8' }}>
                    <span>📍 {rec.location}</span>
                    <span>•</span>
                    <span>💰 ${rec.salary_min.toLocaleString()} - ${rec.salary_max.toLocaleString()}</span>
                  </div>
                </div>

                {/* Match Percentage Badge */}
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    fontSize: '1.4rem',
                    fontWeight: 800,
                    color: matchColor,
                    fontFamily: 'var(--font-mono)'
                  }}>
                    {rec.match_percentage}%
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Skill Match</span>
                </div>
              </div>

              {/* Match Score Progress Bar */}
              <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${rec.match_percentage}%`, height: '100%', background: matchColor, transition: 'width 0.5s ease' }} />
              </div>

              {/* Matching Skills */}
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <CheckCircle2 size={14} /> Matching Skills ({rec.matching_skills.length})
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {rec.matching_skills.map(sk => (
                    <span key={sk} style={{
                      background: 'rgba(16, 185, 129, 0.12)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      color: '#34d399',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      padding: '3px 10px',
                      borderRadius: '6px'
                    }}>
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              {/* Missing Skills & Gap Analysis */}
              {rec.missing_skills.length > 0 && (
                <div style={{ borderTop: '1px dashed rgba(255,255,255,0.08)', paddingTop: '12px' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                    <AlertCircle size={14} /> Skill Gap to Acquire ({rec.missing_skills.length})
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {rec.missing_skills.map(sk => (
                      <span key={sk} style={{
                        background: 'rgba(245, 158, 11, 0.12)',
                        border: '1px solid rgba(245, 158, 11, 0.3)',
                        color: '#fbbf24',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        padding: '3px 10px',
                        borderRadius: '6px'
                      }}>
                        + {sk}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
