import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Briefcase, Users, CheckCircle2, XCircle, Calendar, Sparkles } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import api from '../services/api';

const RecruiterDashboard = () => {
  const { user } = useAuth();
  
  const [stats, setStats] = useState({
    totalJobs: 0,
    applicationsReceived: 0,
    shortlisted: 0,
    rejected: 0,
    selected: 0,
    interviewScheduled: 0
  });
  const [recruiter, setRecruiter] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Get recruiter profile
      const profRes = await api.get('/recruiter/profile');
      setRecruiter(profRes.data);

      // Get stats
      const statsRes = await api.get('/recruiter/analytics');
      setStats(statsRes.data);
    } catch (err) {
      console.error('Failed to load recruiter analytics', err);
    } finally {
      setLoading(false);
    }
  };

  const pieData = [
    { name: 'Shortlisted', value: stats.shortlisted, color: '#3b82f6' },
    { name: 'Selected', value: stats.selected, color: 'var(--accent-secondary)' },
    { name: 'Rejected', value: stats.rejected, color: 'var(--accent-danger)' },
    { name: 'Scheduled', value: stats.interviewScheduled, color: 'var(--accent-warning)' },
    { name: 'Pending Review', value: Math.max(0, stats.applicationsReceived - stats.shortlisted - stats.selected - stats.rejected - stats.interviewScheduled), color: '#64748b' }
  ].filter(d => d.value > 0);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '16px' }}>
        <div className="skeleton" style={{ height: '32px', width: '220px' }}></div>
        <div className="glass-card skeleton" style={{ height: '300px' }}></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1200px' }}>
      
      {/* Banner */}
      <div className="glass-panel" style={{
        padding: '32px',
        borderRadius: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'linear-gradient(135deg, var(--glass-bg), rgba(16, 185, 129, 0.05))'
      }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'Outfit', marginBottom: '8px' }}>
            {recruiter?.companyName || user.name}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Recruiter Portal | {recruiter?.companyWebsite || 'No website associated'}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
            <span style={{
              fontSize: '0.72rem',
              backgroundColor: recruiter?.approved ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
              color: recruiter?.approved ? 'var(--accent-secondary)' : 'var(--accent-warning)',
              padding: '3px 10px',
              borderRadius: '10px',
              fontWeight: 600
            }}>
              {recruiter?.approved ? 'Active & Approved' : 'Pending Administrative Approval'}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        
        <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '10px',
            backgroundColor: 'rgba(99, 102, 241, 0.12)',
            color: 'var(--accent-primary)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <Briefcase size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Outfit' }}>{stats.totalJobs}</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total Jobs</p>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '10px',
            backgroundColor: 'rgba(59, 130, 246, 0.12)',
            color: '#3b82f6',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <Users size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Outfit' }}>{stats.applicationsReceived}</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Applications</p>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '10px',
            backgroundColor: 'rgba(16, 185, 129, 0.12)',
            color: 'var(--accent-secondary)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <CheckCircle2 size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Outfit' }}>{stats.selected}</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Selected Offers</p>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '10px',
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            color: 'var(--accent-danger)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <XCircle size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Outfit' }}>{stats.rejected}</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Rejected Candidates</p>
          </div>
        </div>

      </div>

      {/* Funnel Graph */}
      <div style={{ display: 'grid', gridTemplateColumns: pieData.length > 0 ? '1fr 1fr' : '1fr', gap: '24px', flexWrap: 'wrap' }}>
        
        <div className="glass-card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, fontFamily: 'Outfit', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} style={{ color: 'var(--accent-primary)' }} /> Placement Funnel Overview
          </h3>
          
          {pieData.length > 0 ? (
            <div style={{ height: '240px', display: 'flex', justifyContent: 'center' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} Candidates`, 'Count']} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" style={{ fontSize: '0.8rem' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              No applications recorded yet to draw analytics graphs.
            </div>
          )}
        </div>

        {pieData.length > 0 && (
          <div className="glass-card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, fontFamily: 'Outfit' }}>Candidate Pipeline</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                  <span>Shortlisted Candidates</span>
                  <span style={{ fontWeight: 600 }}>{stats.shortlisted}</span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--glass-border)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${(stats.shortlisted / Math.max(1, stats.applicationsReceived)) * 100}%`, height: '100%', backgroundColor: '#3b82f6' }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                  <span>Scheduled Interviews</span>
                  <span style={{ fontWeight: 600 }}>{stats.interviewScheduled}</span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--glass-border)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${(stats.interviewScheduled / Math.max(1, stats.applicationsReceived)) * 100}%`, height: '100%', backgroundColor: 'var(--accent-warning)' }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                  <span>Hired Selections</span>
                  <span style={{ fontWeight: 600 }}>{stats.selected}</span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--glass-border)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${(stats.selected / Math.max(1, stats.applicationsReceived)) * 100}%`, height: '100%', backgroundColor: 'var(--accent-secondary)' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default RecruiterDashboard;
