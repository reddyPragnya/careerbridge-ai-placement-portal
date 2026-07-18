import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Briefcase, Calendar, Award, ArrowRight, Star, FileText, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Get student profile
      const profRes = await api.get('/student/profile');
      setStudent(profRes.data);

      // Get applications
      const appsRes = await api.get('/student/applications');
      setApplications(appsRes.data);

      // Get interviews
      const intRes = await api.get('/student/applications');
      // Filter interviews
      const scheduled = appsRes.data.filter(app => app.status === 'INTERVIEW_SCHEDULED');
      setInterviews(scheduled);
    } catch (err) {
      console.error('Failed to load student dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  const appliedCount = applications.length;
  const underReviewCount = applications.filter(a => a.status === 'UNDER_REVIEW').length;
  const selectedCount = applications.filter(a => a.status === 'SELECTED').length;
  const interviewCount = interviews.length;

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '16px' }}>
        <div className="skeleton" style={{ height: '32px', width: '250px' }}></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          <div className="glass-card skeleton" style={{ height: '120px' }}></div>
          <div className="glass-card skeleton" style={{ height: '120px' }}></div>
          <div className="glass-card skeleton" style={{ height: '120px' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1200px' }}>
      
      {/* Welcome Banner */}
      <div className="glass-panel" style={{
        padding: '32px',
        borderRadius: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px',
        background: 'linear-gradient(135deg, var(--glass-bg), rgba(99, 102, 241, 0.05))'
      }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'Outfit', marginBottom: '8px' }}>
            Hello, {student?.fullName || user.name}!
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Department of {student?.department || 'Engineering'} | Graduation {student?.graduationYear}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px', fontSize: '0.85rem' }}>
            <span style={{ fontWeight: 600, color: 'var(--accent-secondary)' }}>Current CGPA: {student?.cgpa || '0.00'}</span>
            <span style={{ color: 'var(--text-secondary)' }}>•</span>
            <span style={{ color: 'var(--text-secondary)' }}>Resume: {student?.resumeMongoId ? 'Uploaded & Verified' : 'Action Required: Upload PDF'}</span>
          </div>
        </div>

        <button 
          onClick={() => navigate('/student/profile')}
          style={{
            padding: '10px 18px',
            borderRadius: '8px',
            border: 'none',
            background: 'var(--accent-primary)',
            color: '#fff',
            fontWeight: 600,
            fontSize: '0.85rem',
            cursor: 'pointer',
            boxShadow: '0 4px 10px rgba(99,102,241,0.2)'
          }}
        >
          Edit Profile
        </button>
      </div>

      {/* Analytics Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        
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
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Outfit' }}>{appliedCount}</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total Applied</p>
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
            <Calendar size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Outfit' }}>{interviewCount}</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Interviews Scheduled</p>
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
            <Award size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Outfit' }}>{selectedCount}</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Offers Received</p>
          </div>
        </div>

      </div>

      {/* Main content sections */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', flexWrap: 'wrap' }}>
        
        {/* Applications Summary */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Recent Applications</h3>
            <Link to="/student/applications" style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
              See all <ArrowRight size={14} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {applications.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', padding: '20px 0' }}>No job applications recorded yet.</p>
            ) : (
              applications.slice(0, 4).map(app => (
                <div key={app.id} style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid var(--glass-border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <h4 style={{ fontSize: '0.88rem', fontWeight: 700 }}>{app.job.jobTitle}</h4>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{app.job.companyName} • Match: {app.matchPercentage}%</p>
                  </div>
                  <span style={{
                    fontSize: '0.7rem',
                    backgroundColor: app.status === 'SELECTED' ? 'rgba(16,185,129,0.12)' : 'rgba(99,102,241,0.12)',
                    color: app.status === 'SELECTED' ? 'var(--accent-secondary)' : 'var(--accent-primary)',
                    padding: '2px 8px',
                    borderRadius: '8px',
                    fontWeight: 600
                  }}>
                    {app.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Tools */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>AI Smart Review</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              Upload your resume and audit your ATS compatibility instantly using Google Gemini tools.
            </p>
            <button
              onClick={() => navigate('/student/resume')}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(135deg, var(--accent-primary), rgba(99, 102, 241, 0.8))',
                color: '#fff',
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <FileText size={14} /> Review Resume
            </button>
          </div>

          <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Upcoming Interviews</h3>
            {interviews.length === 0 ? (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>No interviews scheduled at this time.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {interviews.slice(0, 2).map(app => (
                  <div key={app.id} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-warning)' }}></div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{app.job.companyName}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>({app.job.jobTitle})</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default StudentDashboard;
