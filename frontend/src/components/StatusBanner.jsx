import React from 'react';
import { Database, Network, Server, RefreshCw, Zap } from 'lucide-react';

export default function StatusBanner({ dbStatus, graphData, onSeed, seeding }) {
  return (
    <div className="glass-card" style={{
      padding: '16px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '16px',
      background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(8, 12, 20, 0.95))',
      borderColor: 'rgba(56, 189, 248, 0.2)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
        {/* Database Connection */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: dbStatus?.connected ? '#10b981' : '#f59e0b',
            boxShadow: dbStatus?.connected ? '0 0 10px #10b981' : '0 0 10px #f59e0b'
          }} />
          <div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>CognoDB Database</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc', fontFamily: 'var(--font-mono)' }}>
              {dbStatus?.database?.uri || 'bolt+s://db-95c32593.databases.cognodb.com'}
            </div>
          </div>
        </div>

        {/* Nodes Counter */}
        <div style={{ borderLeft: '1px solid rgba(255,255,255,0.08)', paddingLeft: '20px' }}>
          <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Total Graph Nodes</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
            {graphData?.nodes?.length || 0}
          </div>
        </div>

        {/* Edges Counter */}
        <div style={{ borderLeft: '1px solid rgba(255,255,255,0.08)', paddingLeft: '20px' }}>
          <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Connected Edges</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#6366f1', fontFamily: 'var(--font-mono)' }}>
            {graphData?.edges?.length || 0}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span className="glass-pill" style={{ color: '#34d399', background: 'rgba(16, 185, 129, 0.1)' }}>
          <Zap size={14} /> openCypher Protocol Active
        </span>
      </div>
    </div>
  );
}
