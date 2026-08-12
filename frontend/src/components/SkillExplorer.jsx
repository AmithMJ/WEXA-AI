import React, { useState, useEffect } from 'react';
import { Layers, BookOpen, ExternalLink, Network, ChevronRight } from 'lucide-react';

export default function SkillExplorer() {
  const [skills, setSkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [skillDetails, setSkillDetails] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  useEffect(() => {
    fetch('http://localhost:8000/api/skills')
      .then(res => res.json())
      .then(data => {
        setSkills(data || []);
        if (data.length) setSelectedSkill(data[0]);
      })
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (!selectedSkill) return;
    fetch(`http://localhost:8000/api/skills/${selectedSkill.id}`)
      .then(res => res.json())
      .then(data => setSkillDetails(data))
      .catch(err => console.error(err));
  }, [selectedSkill]);

  const categories = ['ALL', 'Backend', 'Frontend', 'Database', 'DevOps', 'Cloud', 'AI/ML'];

  const filteredSkills = selectedCategory === 'ALL'
    ? skills
    : skills.filter(s => s.category.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '20px' }}>
      {/* Left: Skill Matrix Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Category Filters */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                background: selectedCategory === cat ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                color: selectedCategory === cat ? '#a5b4fc' : '#94a3b8',
                border: selectedCategory === cat ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid rgba(255,255,255,0.06)',
                borderRadius: '8px',
                padding: '8px 14px',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Skill Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
          {filteredSkills.map(sk => {
            const isSelected = selectedSkill?.id === sk.id;
            return (
              <div
                key={sk.id}
                onClick={() => setSelectedSkill(sk)}
                className="glass-card"
                style={{
                  padding: '20px',
                  cursor: 'pointer',
                  borderColor: isSelected ? '#38bdf8' : 'rgba(255, 255, 255, 0.08)',
                  background: isSelected ? 'rgba(56, 189, 248, 0.08)' : 'rgba(15, 23, 42, 0.75)',
                  boxShadow: isSelected ? '0 0 20px rgba(56, 189, 248, 0.2)' : 'none'
                }}
              >
                <div className="glass-pill" style={{ fontSize: '0.72rem', color: '#a855f7', background: 'rgba(168, 85, 247, 0.12)', marginBottom: '8px' }}>
                  {sk.category}
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', marginBottom: '6px' }}>{sk.name}</h3>
                <p style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.4 }}>{sk.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: Selected Skill Detail Inspector */}
      {skillDetails && (
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <span className="glass-pill" style={{ color: '#38bdf8', background: 'rgba(56, 189, 248, 0.12)' }}>{skillDetails.category}</span>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', marginTop: '6px' }}>{skillDetails.name}</h2>
            <p style={{ fontSize: '0.88rem', color: '#94a3b8', marginTop: '8px', lineHeight: 1.5 }}>{skillDetails.description}</p>
          </div>

          {/* Related Skills Graph Links */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px' }}>
            <h3 style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Network size={14} /> Related Graph Skills
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {skillDetails.related_skills.length ? (
                skillDetails.related_skills.map((rs, i) => (
                  <span key={i} style={{
                    background: 'rgba(99, 102, 241, 0.15)',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                    color: '#a5b4fc',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    padding: '4px 10px',
                    borderRadius: '6px'
                  }}>
                    {rs.name || rs}
                  </span>
                ))
              ) : (
                <span style={{ fontSize: '0.82rem', color: '#64748b' }}>No direct related skills linked</span>
              )}
            </div>
          </div>

          {/* Curated Learning Resources */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px' }}>
            <h3 style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <BookOpen size={14} /> Curated Learning Resources
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {skillDetails.learning_resources.length ? (
                skillDetails.learning_resources.map(res => (
                  <a
                    key={res.id}
                    href={res.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '10px',
                      padding: '10px 14px',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s'
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 600, textTransform: 'uppercase' }}>{res.type} • {res.difficulty}</span>
                      <h4 style={{ fontSize: '0.88rem', fontWeight: 600, color: '#f1f5f9', marginTop: '2px' }}>{res.title}</h4>
                    </div>
                    <ExternalLink size={14} color="#94a3b8" />
                  </a>
                ))
              ) : (
                <span style={{ fontSize: '0.82rem', color: '#64748b' }}>No learning resources linked yet.</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
