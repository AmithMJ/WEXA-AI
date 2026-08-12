import React, { useState, useEffect } from 'react';
import { Briefcase, Building, MapPin, DollarSign, CheckCircle2 } from 'lucide-react';

export default function JobBoard() {
  const [jobs, setJobs] = useState([]);
  const [remoteOnly, setRemoteOnly] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:8000/api/jobs${remoteOnly ? '?remote_only=true' : ''}`)
      .then(res => res.json())
      .then(data => setJobs(data || []))
      .catch(err => console.error(err));
  }, [remoteOnly]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Controls */}
      <div className="glass-card" style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>Active Partner Job Postings ({jobs.length})</h2>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.88rem', color: '#94a3b8' }}>
          <input
            type="checkbox"
            checked={remoteOnly}
            onChange={(e) => setRemoteOnly(e.target.checked)}
            style={{ width: '16px', height: '16px', accentColor: '#38bdf8' }}
          />
          Remote Jobs Only
        </label>
      </div>

      {/* Jobs Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '20px' }}>
        {jobs.map(job => (
          <div key={job.id} className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span className="glass-pill" style={{ color: '#f59e0b', background: 'rgba(245, 158, 11, 0.12)', fontSize: '0.72rem' }}>
                  {job.company_name || 'Partner Company'}
                </span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc', marginTop: '6px' }}>{job.title}</h3>
              </div>
              {job.remote && (
                <span className="glass-pill" style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.12)', fontSize: '0.72rem' }}>
                  Remote
                </span>
              )}
            </div>

            <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.4 }}>{job.description}</p>

            <div style={{ display: 'flex', gap: '12px', fontSize: '0.82rem', color: '#cbd5e1', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px' }}>
              <span>📍 {job.location}</span>
              <span>•</span>
              <span>💰 ${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}</span>
            </div>

            <div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Required Skills</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {job.required_skills.map((s, idx) => (
                  <span key={idx} style={{
                    background: 'rgba(56, 189, 248, 0.12)',
                    border: '1px solid rgba(56, 189, 248, 0.25)',
                    color: '#38bdf8',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    padding: '3px 8px',
                    borderRadius: '6px'
                  }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
