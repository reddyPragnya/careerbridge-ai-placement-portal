import React, { useState, useEffect } from 'react';
import { Users, Briefcase, Award, TrendingUp, CheckCircle, PieChart as PieIcon } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import api from '../services/api';

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSystemAnalytics();
  }, []);

  const fetchSystemAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/dashboard');
      setAnalytics(res.data);
    } catch (err) {
      console.error('Failed to load system analytics', err);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#a855f7', '#06b6d4'];

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '16px' }}>
        <div className="skeleton" style={{ height: '32px', width: '220px' }}></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
          <div className="glass-card skeleton" style={{ height: '120px' }}></div>
          <div className="glass-card skeleton" style={{ height: '120px' }}></div>
          <div className="glass-card skeleton" style={{ height: '120px' }}></div>
          <div className="glass-card skeleton" style={{ height: '120px' }}></div>
        </div>
      </div>
    );
  }

  // Format Department Placements Map into array for charts
  const getDeptPlacementsData = () => {
    if (!analytics || !analytics.departmentPlacements) return [];
    return Object.entries(analytics.departmentPlacements).map(([name, value]) => ({
      name,
      placements: value
    }));
  };

  const deptData = getDeptPlacementsData();

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1200px' }}>
      <div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'Outfit' }}>Global System Dashboard</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Overview of students, recruiter listings, and placement metrics across the platform</p>
      </div>

      {/* Global Stats Cards */}
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
            <Users size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Outfit' }}>{analytics?.totalStudents}</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total Students</p>
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
            <Users size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Outfit' }}>{analytics?.totalRecruiters}</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total Recruiters</p>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '10px',
            backgroundColor: 'rgba(245, 158, 11, 0.12)',
            color: 'var(--accent-warning)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <Briefcase size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Outfit' }}>{analytics?.totalJobs}</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Jobs Published</p>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '10px',
            backgroundColor: 'rgba(6, 182, 212, 0.12)',
            color: '#06b6d4',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <Award size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Outfit' }}>{analytics?.selectedStudents}</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Students Hired</p>
          </div>
        </div>

      </div>

      {/* Analytics Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '24px' }}>
        
        {/* Monthly Registrations (Line) */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={16} /> Monthly Registrations
          </h3>
          <div style={{ height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics?.monthlyRegistrations}>
                <XAxis dataKey="month" style={{ fontSize: '0.75rem' }} axisLine={false} tickLine={false} />
                <YAxis style={{ fontSize: '0.75rem' }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="registrations" stroke="var(--accent-primary)" strokeWidth={3} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Applications Trend (Area) */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={16} /> Placement Applications Trend
          </h3>
          <div style={{ height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics?.applicationsTrend}>
                <XAxis dataKey="month" style={{ fontSize: '0.75rem' }} axisLine={false} tickLine={false} />
                <YAxis style={{ fontSize: '0.75rem' }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="applications" stroke="var(--accent-secondary)" fill="rgba(16, 185, 129, 0.1)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Popular Skills (Pie) */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PieIcon size={16} /> In-Demand Candidate Skills
          </h3>
          <div style={{ height: '220px', display: 'flex', justifyContent: 'center' }}>
            {analytics?.popularSkills.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.popularSkills}
                    cx="50%"
                    cy="50%"
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name }) => name}
                  >
                    {analytics.popularSkills.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No student skills listed yet</div>
            )}
          </div>
        </div>

        {/* Department-Wise Placements (Bar) */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle size={16} /> Placement Offers by Department
          </h3>
          <div style={{ height: '220px' }}>
            {deptData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptData}>
                  <XAxis dataKey="name" style={{ fontSize: '0.75rem' }} axisLine={false} tickLine={false} />
                  <YAxis style={{ fontSize: '0.75rem' }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="placements" fill="var(--accent-primary)" radius={[4, 4, 0, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', height: '100%', justifyContent: 'center', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                No hired offers recorded yet
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
