import React, { useRef, useEffect, useState } from 'react';
import { Search, Filter, ZoomIn, ZoomOut, RefreshCw, X, Layers, User, Briefcase, Building, BookOpen, ChevronRight } from 'lucide-react';

const NODE_COLORS = {
  Developer: { fill: '#38bdf8', glow: 'rgba(56, 189, 248, 0.4)', text: '#e0f2fe' },
  Skill: { fill: '#6366f1', glow: 'rgba(99, 102, 241, 0.4)', text: '#e0e7ff' },
  Job: { fill: '#10b981', glow: 'rgba(16, 185, 129, 0.4)', text: '#d1fae5' },
  Company: { fill: '#f59e0b', glow: 'rgba(245, 158, 11, 0.4)', text: '#fef3c7' },
  LearningResource: { fill: '#ec4899', glow: 'rgba(236, 72, 153, 0.4)', text: '#fce7f3' }
};

export default function GraphCanvas({ graphData, loading, onRefresh }) {
  const canvasRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const draggedNodeRef = useRef(null);
  const simulationNodesRef = useRef([]);

  // Initialize node positions & force physics
  useEffect(() => {
    if (!graphData || !graphData.nodes.length) return;

    const width = 1000;
    const height = 700;

    // Map graph nodes with initial coordinates
    const nodes = graphData.nodes.map((n, i) => {
      const angle = (i / graphData.nodes.length) * Math.PI * 2;
      const radius = 180 + Math.random() * 150;
      return {
        ...n,
        x: width / 2 + Math.cos(angle) * radius,
        y: height / 2 + Math.sin(angle) * radius,
        vx: 0,
        vy: 0,
        radius: n.label === 'Skill' ? 14 : n.label === 'Job' ? 16 : 12
      };
    });

    simulationNodesRef.current = nodes;
  }, [graphData]);

  // Main Canvas Render Loop & Physics Simulation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const runSimulationStep = () => {
      const nodes = simulationNodesRef.current;
      const edges = graphData?.edges || [];
      if (!nodes.length) return;

      const nodeMap = new Map(nodes.map(n => [n.id, n]));

      // Repulsion force between all nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const n1 = nodes[i];
          const n2 = nodes[j];
          const dx = n2.x - n1.x;
          const dy = n2.y - n1.y;
          const distSq = dx * dx + dy * dy + 1;
          const dist = Math.sqrt(distSq);
          if (dist < 220) {
            const force = 1800 / distSq;
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;
            n1.vx -= fx;
            n1.vy -= fy;
            n2.vx += fx;
            n2.vy += fy;
          }
        }
      }

      // Attraction force along edges
      for (const e of edges) {
        const source = nodeMap.get(e.source);
        const target = nodeMap.get(e.target);
        if (source && target) {
          const dx = target.x - source.x;
          const dy = target.y - source.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = (dist - 120) * 0.03;
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;
          source.vx += fx;
          source.vy += fy;
          target.vx -= fx;
          target.vy -= fy;
        }
      }

      // Update positions with damping
      for (const n of nodes) {
        if (n === draggedNodeRef.current) continue;
        n.vx *= 0.85;
        n.vy *= 0.85;
        n.x += n.vx;
        n.y += n.vy;

        // Boundary constraints
        n.x = Math.max(50, Math.min(950, n.x));
        n.y = Math.max(50, Math.min(650, n.y));
      }

      // Render Canvas Frame
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.translate(pan.x, pan.y);
      ctx.scale(zoom, zoom);

      // Draw Edges
      for (const e of edges) {
        const source = nodeMap.get(e.source);
        const target = nodeMap.get(e.target);
        if (source && target) {
          const isSelectedEdge = selectedNode && (selectedNode.id === source.id || selectedNode.id === target.id);
          
          ctx.beginPath();
          ctx.moveTo(source.x, source.y);
          ctx.lineTo(target.x, target.y);
          ctx.strokeStyle = isSelectedEdge ? '#38bdf8' : 'rgba(255, 255, 255, 0.12)';
          ctx.lineWidth = isSelectedEdge ? 2.5 : 1;
          ctx.stroke();

          // Draw relationship label if edge selected
          if (isSelectedEdge) {
            const midX = (source.x + target.x) / 2;
            const midY = (source.y + target.y) / 2;
            ctx.fillStyle = '#94a3b8';
            ctx.font = '10px "JetBrains Mono"';
            ctx.fillText(e.label, midX, midY);
          }
        }
      }

      // Draw Nodes
      const query = searchQuery.toLowerCase().trim();

      for (const n of nodes) {
        const color = NODE_COLORS[n.label] || NODE_COLORS.Skill;
        const matchesFilter = activeFilter === 'ALL' || n.label === activeFilter;
        const matchesSearch = !query || n.name.toLowerCase().includes(query);
        const isSelected = selectedNode?.id === n.id;
        const alpha = (matchesFilter && matchesSearch) ? 1 : 0.2;

        ctx.globalAlpha = alpha;

        // Node Glow Halo
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius + (isSelected ? 8 : 4), 0, Math.PI * 2);
        ctx.fillStyle = isSelected ? 'rgba(56, 189, 248, 0.6)' : color.glow;
        ctx.fill();

        // Node Body
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = color.fill;
        ctx.shadowColor = color.fill;
        ctx.shadowBlur = isSelected ? 16 : 6;
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = isSelected ? 2.5 : 1;
        ctx.stroke();

        // Label
        ctx.fillStyle = color.text;
        ctx.font = `${isSelected ? 'bold 13px' : '11px'} "Outfit"`;
        ctx.textAlign = 'center';
        ctx.fillText(n.name, n.x, n.y + n.radius + 14);

        ctx.globalAlpha = 1;
      }

      ctx.restore();
      animationFrameId = requestAnimationFrame(runSimulationStep);
    };

    runSimulationStep();

    return () => cancelAnimationFrame(animationFrameId);
  }, [graphData, selectedNode, searchQuery, activeFilter, zoom, pan]);

  // Mouse Interactivity
  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left - pan.x) / zoom;
    const mouseY = (e.clientY - rect.top - pan.y) / zoom;

    const clicked = simulationNodesRef.current.find(n => {
      const dx = n.x - mouseX;
      const dy = n.y - mouseY;
      return Math.sqrt(dx * dx + dy * dy) <= n.radius + 5;
    });

    if (clicked) {
      setSelectedNode(clicked);
      draggedNodeRef.current = clicked;
    } else {
      isDraggingRef.current = true;
      dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    }
  };

  const handleMouseMove = (e) => {
    if (draggedNodeRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      draggedNodeRef.current.x = (e.clientX - rect.left - pan.x) / zoom;
      draggedNodeRef.current.y = (e.clientY - rect.top - pan.y) / zoom;
    } else if (isDraggingRef.current) {
      setPan({
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y
      });
    }
  };

  const handleMouseUp = () => {
    draggedNodeRef.current = null;
    isDraggingRef.current = false;
  };

  // Find neighbor nodes for inspector panel
  const getConnectedEdgesAndNodes = (nodeId) => {
    if (!graphData || !nodeId) return [];
    const rels = [];
    for (const e of graphData.edges) {
      if (e.source === nodeId) {
        const target = graphData.nodes.find(n => n.id === e.target);
        if (target) rels.push({ direction: 'outgoing', type: e.label, node: target });
      } else if (e.target === nodeId) {
        const source = graphData.nodes.find(n => n.id === e.source);
        if (source) rels.push({ direction: 'incoming', type: e.label, node: source });
      }
    }
    return rels;
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: selectedNode ? '1fr 340px' : '1fr', gap: '20px', minHeight: '680px' }}>
      {/* Main Canvas Card */}
      <div className="glass-card" style={{ position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* Controls Bar */}
        <div style={{
          padding: '12px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          background: 'rgba(15, 23, 42, 0.9)'
        }}>
          {/* Node Filter Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            {['ALL', 'Developer', 'Skill', 'Job', 'Company', 'LearningResource'].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                style={{
                  background: activeFilter === filter ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  color: activeFilter === filter ? '#38bdf8' : '#94a3b8',
                  border: activeFilter === filter ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid transparent',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Search & Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} color="#64748b" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search node by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '6px',
                  padding: '6px 10px 6px 30px',
                  color: '#fff',
                  fontSize: '0.82rem',
                  width: '180px',
                  outline: 'none'
                }}
              />
            </div>

            <button onClick={() => setZoom(z => Math.min(z + 0.15, 2))} className="btn-secondary" style={{ padding: '6px' }} title="Zoom In"><ZoomIn size={14} /></button>
            <button onClick={() => setZoom(z => Math.max(z - 0.15, 0.5))} className="btn-secondary" style={{ padding: '6px' }} title="Zoom Out"><ZoomOut size={14} /></button>
            <button onClick={onRefresh} className="btn-secondary" style={{ padding: '6px' }} title="Refresh Layout"><RefreshCw size={14} /></button>
          </div>
        </div>

        {/* HTML5 Canvas */}
        <canvas
          ref={canvasRef}
          width={1000}
          height={650}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          style={{ width: '100%', height: '650px', cursor: 'grab', background: 'radial-gradient(circle at center, #0f172a 0%, #080c14 100%)' }}
        />
      </div>

      {/* Node Inspector Drawer */}
      {selectedNode && (
        <div className="glass-card animate-fade-in" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="glass-pill" style={{
              background: NODE_COLORS[selectedNode.label]?.glow || 'rgba(255,255,255,0.1)',
              color: NODE_COLORS[selectedNode.label]?.fill || '#fff'
            }}>
              {selectedNode.label}
            </div>
            <button onClick={() => setSelectedNode(null)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><X size={18} /></button>
          </div>

          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc', marginBottom: '4px' }}>{selectedNode.name}</h3>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8' }}>ID: <code style={{ fontFamily: 'var(--font-mono)' }}>{selectedNode.id}</code></p>
          </div>

          {/* Properties */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '12px' }}>
            <h4 style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Node Properties</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {Object.entries(selectedNode.properties || {}).map(([k, v]) => {
                if (typeof v === 'object' || k === 'id' || k === 'name') return null;
                return (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <span style={{ color: '#94a3b8' }}>{k}:</span>
                    <span style={{ color: '#e2e8f0', fontWeight: 500 }}>{String(v)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Connected Graph Relationships */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '12px', flex: 1, overflowY: 'auto' }}>
            <h4 style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
              Connected Graph Edges ({getConnectedEdgesAndNodes(selectedNode.id).length})
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {getConnectedEdgesAndNodes(selectedNode.id).map((rel, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedNode(rel.node)}
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.15s'
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.7rem', color: '#38bdf8', fontFamily: 'var(--font-mono)', display: 'block' }}>{rel.type}</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f1f5f9' }}>{rel.node.name}</span>
                  </div>
                  <ChevronRight size={14} color="#64748b" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
