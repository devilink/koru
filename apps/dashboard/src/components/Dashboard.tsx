import React, { useState } from 'react';
import CompanionFace from './CompanionFace';
import type { CompanionState } from '../types';
import './Dashboard.css';
import './DashboardAlerts.css';

const Dashboard: React.FC = () => {
  const [state, setState] = useState<CompanionState>('idle');
  const [alerts, setAlerts] = useState<Array<{id: string, time: string, zone: string, msg: string}>>([]);

  const states: CompanionState[] = [
    'idle', 'curious', 'happy', 'gentle-concern', 
    'excited', 'sleepy', 'celebrating', 'listening', 
    'thinking', 'plant-thirsty'
  ];

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <h2>System Status</h2>
        <div className="status-item">
          <strong>Safety Mode:</strong> <span className="status-ok">Active</span>
        </div>
        <div className="status-item">
          <strong>Camera:</strong> <span className="status-idle">Standby</span>
        </div>
        <div className="status-item">
          <strong>Plant Moisture:</strong> <span>50%</span>
        </div>
        <div className="status-item">
          <strong>Ollama Model:</strong> <span className="status-ok">Qwen3 4B</span>
        </div>

        <h3 className="mt-4">Test States</h3>
        <div className="state-buttons">
          {states.map(s => (
            <button 
              key={s} 
              className={`state-btn ${state === s ? 'active' : ''}`}
              onClick={() => setState(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </aside>
      
      <main className="main-content">
        <header className="topbar">
          <h1>Companion Dashboard</h1>
          <button className="privacy-btn">Privacy Controls</button>
        </header>
        
        <div className="face-wrapper">
          <CompanionFace state={state} />
        </div>
        
        <section className="alerts-section">
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <h3>Recent Alerts</h3>
            <button 
              className="state-btn" 
              style={{backgroundColor: '#d63031'}}
              onClick={() => {
                setAlerts(prev => [{
                  id: `evt_${Date.now()}`,
                  time: new Date().toLocaleTimeString(),
                  zone: 'living_room',
                  msg: 'Unknown person detected.'
                }, ...prev])
              }}
            >
              Test Alert
            </button>
          </div>
          {alerts.length === 0 ? (
            <p className="no-alerts">No unknown persons detected.</p>
          ) : (
            <ul className="alerts-list">
              {alerts.map(a => (
                <li key={a.id} className="alert-item">
                  <span className="alert-time">{a.time}</span>
                  <strong>{a.zone}:</strong> {a.msg}
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
