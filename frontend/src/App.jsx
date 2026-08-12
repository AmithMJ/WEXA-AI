import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import GraphCanvas from './components/GraphCanvas';
import JobMatcher from './components/JobMatcher';
import SkillExplorer from './components/SkillExplorer';
import JobBoard from './components/JobBoard';
import DeveloperWorkbench from './components/DeveloperWorkbench';
import StatusBanner from './components/StatusBanner';

export default function App() {
  const [activeTab, setActiveTab] = useState('graph');
  const [dbStatus, setDbStatus] = useState(null);
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
  const [developers, setDevelopers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  const fetchHealth = () => {
    fetch('http://localhost:8000/api/health')
      .then(res => res.json())
      .then(data => setDbStatus(data))
      .catch(err => console.error('Failed to fetch health status:', err));
  };

  const fetchGraph = () => {
    setLoading(true);
    fetch('http://localhost:8000/api/graph')
      .then(res => res.json())
      .then(data => {
        setGraphData(data || { nodes: [], edges: [] });
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch graph data:', err);
        setLoading(false);
      });
  };

  const fetchDevelopers = () => {
    fetch('http://localhost:8000/api/developers')
      .then(res => res.json())
      .then(data => setDevelopers(data || []))
      .catch(err => console.error('Failed to fetch developers:', err));
  };

  const refreshAll = () => {
    fetchHealth();
    fetchGraph();
    fetchDevelopers();
  };

  useEffect(() => {
    refreshAll();
  }, []);

  const handleSeed = () => {
    setSeeding(true);
    fetch('http://localhost:8000/api/seed', { method: 'POST' })
      .then(res => res.json())
      .then(() => {
        setSeeding(false);
        refreshAll();
      })
      .catch(err => {
        console.error('Seed failed:', err);
        setSeeding(false);
      });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        dbStatus={dbStatus}
        onSeed={handleSeed}
        seeding={seeding}
      />

      {/* Main App Content View Container */}
      <main style={{ maxWidth: '1400px', width: '100%', margin: '0 auto', padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Status Metrics Banner */}
        <StatusBanner
          dbStatus={dbStatus}
          graphData={graphData}
          onSeed={handleSeed}
          seeding={seeding}
        />

        {/* Tab Views */}
        {activeTab === 'graph' && (
          <GraphCanvas
            graphData={graphData}
            loading={loading}
            onRefresh={fetchGraph}
          />
        )}

        {activeTab === 'matcher' && (
          <JobMatcher
            developers={developers}
            onSelectDeveloper={() => {}}
          />
        )}

        {activeTab === 'skills' && (
          <SkillExplorer />
        )}

        {activeTab === 'jobs' && (
          <JobBoard />
        )}

        {activeTab === 'developers' && (
          <DeveloperWorkbench
            developers={developers}
            onRefresh={refreshAll}
          />
        )}
      </main>
    </div>
  );
}
