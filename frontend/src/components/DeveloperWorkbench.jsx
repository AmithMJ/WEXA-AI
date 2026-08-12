import React, { useState, useEffect } from 'react';
import { User, Plus, Check, Award, MapPin, Mail, Briefcase } from 'lucide-react';
import { API_BASE_URL } from '../api';

export default function DeveloperWorkbench({ developers, onRefresh }) {
  const [skills, setSkills] = useState([]);
  const [selectedDevId, setSelectedDevId] = useState(developers[0]?.id || 'dev-1');
  const [activeDev, setActiveDev] = useState(null);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [saving, setSaving] = useState(false);

  // New Dev Modal / Form state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDevName, setNewDevName] = useState('');
  const [newDevEmail, setNewDevEmail] = useState('');
  const [newDevExp, setNewDevExp] = useState(3);
  const [newDevLoc, setNewDevLoc] = useState('Remote');
  const [newDevBio, setNewDevBio] = useState('');

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/skills`)
      .then(res => res.json())
      .then(data => setSkills(data || []))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (!selectedDevId) return;
    fetch(`${API_BASE_URL}/api/developers/${selectedDevId}`)
      .then(res => res.json())
      .then(data => {
        setActiveDev(data);
        setSelectedSkills(data.skills || []);
      })
      .catch(err => console.error(err));
  }, [selectedDevId]);

  const toggleSkill = (skillId) => {
    if (selectedSkills.includes(skillId)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skillId));
    } else {
      setSelectedSkills([...selectedSkills, skillId]);
    }
  };

  const saveSkills = () => {
    if (!selectedDevId) return;
    setSaving(true);
    fetch(`${API_BASE_URL}/api/developers/${selectedDevId}/skills`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(selectedSkills)
    })
      .then(res => res.json())
      .then(data => {
        setSaving(false);
        setActiveDev(data);
        if (onRefresh) onRefresh();
      })
      .catch(err => {
        console.error(err);
        setSaving(false);
      });
  };

  const handleCreateDev = (e) => {
    e.preventDefault();
    const payload = {
      id: `dev-${Date.now()}`,
      name: newDevName,
      email: newDevEmail,
      experience_years: Number(newDevExp),
      location: newDevLoc,
      bio: newDevBio
    };

    fetch(`${API_BASE_URL}/api/developers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(dev => {
        setShowCreateModal(false);
        if (onRefresh) onRefresh();
        setSelectedDevId(dev.id);
      })
      .catch(err => console.error(err));
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px' }}>
      {/* Left: Developer List */}
      <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>Developers</h3>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
            style={{ padding: '4px 10px', fontSize: '0.8rem' }}
          >
            <Plus size={14} /> Add Candidate
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {developers.map(d => {
            const isSelected = selectedDevId === d.id;
            return (
              <div
                key={d.id}
                onClick={() => setSelectedDevId(d.id)}
                style={{
                  background: isSelected ? 'rgba(56, 189, 248, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                  border: isSelected ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '10px',
                  padding: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: isSelected ? '#38bdf8' : '#f1f5f9' }}>{d.name}</h4>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>
                  {d.experience_years} yrs exp • {d.location}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: Active Profile & Skill Matrix Editor */}
      {activeDev && (
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc' }}>{activeDev.name}</h2>
              <div style={{ display: 'flex', gap: '16px', fontSize: '0.88rem', color: '#94a3b8', marginTop: '4px' }}>
                <span>✉️ {activeDev.email}</span>
                <span>📍 {activeDev.location}</span>
                <span>⭐ {activeDev.experience_years} Years Experience</span>
              </div>
              <p style={{ fontSize: '0.88rem', color: '#cbd5e1', marginTop: '8px', lineHeight: 1.4 }}>{activeDev.bio}</p>
            </div>

            <button
              onClick={saveSkills}
              disabled={saving}
              className="btn-primary"
            >
              <Check size={16} />
              {saving ? 'Updating Graph...' : 'Save Skill Matrix'}
            </button>
          </div>

          {/* Skill Selector Matrix */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px' }}>
            <h3 style={{ fontSize: '0.9rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
              Attach Skills to Candidate Node (:Developer)-[:HAS_SKILL]-&gt;(:Skill)
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px' }}>
              {skills.map(sk => {
                const hasSkill = selectedSkills.includes(sk.id) || selectedSkills.includes(sk.name);
                return (
                  <div
                    key={sk.id}
                    onClick={() => toggleSkill(sk.id)}
                    style={{
                      background: hasSkill ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.03)',
                      border: hasSkill ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '8px',
                      padding: '10px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 600, color: hasSkill ? '#34d399' : '#94a3b8' }}>{sk.name}</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{sk.category}</div>
                    </div>
                    {hasSkill && <Check size={16} color="#34d399" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* New Dev Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100
        }}>
          <div className="glass-card" style={{ width: '440px', padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>Add Developer Node</h3>
            <form onSubmit={handleCreateDev} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input type="text" placeholder="Full Name" value={newDevName} onChange={e => setNewDevName(e.target.value)} required style={{ padding: '8px', borderRadius: '6px', background: '#0f172a', border: '1px solid #334155', color: '#fff' }} />
              <input type="email" placeholder="Email" value={newDevEmail} onChange={e => setNewDevEmail(e.target.value)} required style={{ padding: '8px', borderRadius: '6px', background: '#0f172a', border: '1px solid #334155', color: '#fff' }} />
              <input type="number" placeholder="Years of Exp" value={newDevExp} onChange={e => setNewDevExp(e.target.value)} required style={{ padding: '8px', borderRadius: '6px', background: '#0f172a', border: '1px solid #334155', color: '#fff' }} />
              <input type="text" placeholder="Location" value={newDevLoc} onChange={e => setNewDevLoc(e.target.value)} required style={{ padding: '8px', borderRadius: '6px', background: '#0f172a', border: '1px solid #334155', color: '#fff' }} />
              <textarea placeholder="Short Bio" value={newDevBio} onChange={e => setNewDevBio(e.target.value)} required style={{ padding: '8px', borderRadius: '6px', background: '#0f172a', border: '1px solid #334155', color: '#fff', height: '80px' }} />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Create Candidate</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
