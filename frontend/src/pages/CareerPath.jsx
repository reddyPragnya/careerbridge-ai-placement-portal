import React, { useState, useEffect } from 'react';
import { Sparkles, Compass, GraduationCap, Award, Cpu, BookOpen, RefreshCw } from 'lucide-react';
import api from '../services/api';

const CareerPath = () => {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/ai/recommendations');
      setRecommendations(res.data);
    } catch (err) {
      console.log('No prior career recommendations found.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setError('');
    try {
      const res = await api.post('/ai/recommendCareer');
      setRecommendations(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate recommendations.');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '16px' }}>
        <div className="skeleton" style={{ height: '32px', width: '220px' }}></div>
        <div className="glass-card skeleton" style={{ height: '300px' }}></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1000px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'Outfit' }}>AI Career Advisor</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Map out your academic background to industry roles and custom roadmaps</p>
        </div>

        <button
          onClick={handleGenerate}
          disabled={generating}
          style={{
            padding: '10px 18px',
            borderRadius: '8px',
            border: 'none',
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
            color: '#fff',
            fontWeight: 600,
            fontSize: '0.85rem',
            cursor: generating ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)'
          }}
        >
          <RefreshCw size={14} className={generating ? 'animate-spin' : ''} style={{ animation: generating ? 'spin 1s linear infinite' : 'none' }} />
          {recommendations ? 'Regenerate Path' : 'Generate Roadmap'}
        </button>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>

      {error && <div style={{ color: 'var(--accent-danger)' }}>{error}</div>}

      {recommendations ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Target Roles & Roadmap Timeline */}
          <div className="glass-card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, fontFamily: 'Outfit', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Compass size={18} style={{ color: 'var(--accent-primary)' }} /> Suitable Career Roles
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {recommendations.suitableRoles.map((role, idx) => (
                  <span key={idx} style={{
                    fontSize: '0.8rem',
                    backgroundColor: 'rgba(99, 102, 241, 0.08)',
                    color: 'var(--accent-primary)',
                    border: '1px solid rgba(99, 102, 241, 0.15)',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontWeight: 600
                  }}>
                    {role}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '24px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, fontFamily: 'Outfit', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} style={{ color: 'var(--accent-warning)' }} /> Step-by-Step Learning Path
              </h3>

              {/* Vertical Timeline */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0px', paddingLeft: '8px' }}>
                {recommendations.learningPath.map((step, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '16px', position: 'relative' }}>
                    
                    {/* Timeline Line */}
                    {idx !== recommendations.learningPath.length - 1 && (
                      <div style={{
                        position: 'absolute',
                        left: '12px',
                        top: '24px',
                        width: '2px',
                        height: 'calc(100% - 10px)',
                        backgroundColor: 'var(--glass-border)'
                      }}></div>
                    )}

                    {/* Timeline Dot */}
                    <div style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--bg-secondary)',
                      border: '2px solid var(--accent-primary)',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      fontWeight: 'bold',
                      fontSize: '0.75rem',
                      zIndex: 1,
                      flexShrink: 0
                    }}>
                      {idx + 1}
                    </div>

                    {/* Timeline Content */}
                    <div style={{ paddingBottom: '24px' }}>
                      <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', fontWeight: 600, lineHeight: '1.4' }}>
                        {step}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Academic Actions Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            
            <div className="glass-card" style={{ padding: '24px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen size={16} style={{ color: 'var(--accent-primary)' }} /> Target Courses
              </h4>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingLeft: '18px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                {recommendations.courses.map((course, idx) => (
                  <li key={idx}>{course}</li>
                ))}
              </ul>
            </div>

            <div className="glass-card" style={{ padding: '24px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Cpu size={16} style={{ color: 'var(--accent-secondary)' }} /> Suggested Projects
              </h4>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingLeft: '18px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                {recommendations.projects.map((proj, idx) => (
                  <li key={idx}>{proj}</li>
                ))}
              </ul>
            </div>

            <div className="glass-card" style={{ padding: '24px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={16} style={{ color: 'var(--accent-warning)' }} /> Recommended Certifications
              </h4>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingLeft: '18px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                {recommendations.certifications.map((cert, idx) => (
                  <li key={idx}>{cert}</li>
                ))}
              </ul>
            </div>

          </div>

        </div>
      ) : (
        /* Empty State */
        <div className="glass-card animate-fade-in" style={{ padding: '60px 40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <Compass size={60} style={{ color: 'var(--text-secondary)' }} />
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Map your placement path</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '6px', maxWidth: '400px', margin: '6px auto 0 auto' }}>
              Trigger the AI Advisor to build custom engineering roles, select certificates, design projects, and layout a learning path customized to your profile details.
            </p>
          </div>
          <button
            onClick={handleGenerate}
            disabled={generating}
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
              color: '#fff',
              fontWeight: 600,
              cursor: generating ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)',
              marginTop: '10px'
            }}
          >
            {generating ? 'Processing Roadmap...' : 'Generate AI Placement Roadmap'}
          </button>
        </div>
      )}
    </div>
  );
};

export default CareerPath;
