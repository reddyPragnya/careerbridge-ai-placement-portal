import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FileText, Upload, Download, Eye, CheckCircle2, AlertCircle, Award, Target, Sparkles, BarChart3 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import api from '../services/api';

const ResumeAnalyzer = () => {
  const { user } = useAuth();
  
  const [file, setFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPdf, setShowPdf] = useState(false);

  useEffect(() => {
    fetchLatestAnalysis();
  }, []);

  const fetchLatestAnalysis = async () => {
    setFetching(true);
    setError('');
    try {
      const res = await api.get('/student/resume/analysis');
      setAnalysis(res.data);
    } catch (err) {
      // It's normal if there is no analysis yet (resume not uploaded)
      console.log('No resume analysis found yet.');
    } finally {
      setFetching(false);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError('');
    setSuccess('');
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a PDF file first.');
      return;
    }
    if (file.type !== 'application/pdf') {
      setError('Only PDF resumes are supported.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/student/uploadResume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setAnalysis(res.data);
      setSuccess('Resume uploaded and parsed successfully by Gemini AI!');
      setFile(null);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data || 'Failed to parse resume.');
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data based on ATS score
  const getChartData = () => {
    if (!analysis) return [];
    const score = analysis.atsScore;
    return [
      { name: 'ATS Score', value: score, max: 100 },
      { name: 'Format Alignment', value: score > 75 ? 90 : 70, max: 100 },
      { name: 'Keyword Match', value: score > 80 ? 85 : 65, max: 100 },
      { name: 'Section Clarity', value: score > 70 ? 80 : 60, max: 100 }
    ];
  };

  const chartData = getChartData();

  if (fetching) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '16px' }}>
        <div className="skeleton" style={{ height: '24px', width: '180px' }}></div>
        <div className="skeleton" style={{ height: '200px' }}></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1200px' }}>
      <div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'Outfit' }}>AI Resume Review</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Parse your PDF resume and get immediate ATS feedback</p>
      </div>

      {success && (
        <div style={{
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          borderRadius: '8px',
          padding: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: 'var(--accent-secondary)',
          fontSize: '0.85rem'
        }}>
          <CheckCircle2 size={18} />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div style={{
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          borderRadius: '8px',
          padding: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: 'var(--accent-danger)',
          fontSize: '0.85rem'
        }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid: Upload vs Report */}
      <div style={{ display: 'grid', gridTemplateColumns: analysis ? '1fr 2fr' : '1fr', gap: '24px' }}>
        
        {/* Left Side: Upload & Tools */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Upload size={18} /> Upload Resume
            </h3>

            <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{
                border: '2px dashed var(--glass-border)',
                borderRadius: '12px',
                padding: '30px 20px',
                textAlign: 'center',
                cursor: 'pointer',
                position: 'relative',
                backgroundColor: 'rgba(255,255,255,0.02)',
                transition: 'border-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--glass-border)'}
              >
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    opacity: 0,
                    cursor: 'pointer'
                  }}
                />
                <FileText size={40} style={{ color: 'var(--text-secondary)', marginBottom: '12px' }} />
                <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                  {file ? file.name : 'Click to select resume PDF'}
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Supported formats: PDF (Max 10MB)
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'linear-gradient(135deg, var(--accent-primary), rgba(99, 102, 241, 0.9))',
                  color: '#fff',
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {loading ? 'Analyzing resume...' : 'Upload & Analyze'}
              </button>
            </form>
          </div>

          {analysis && (
            <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>Manage File</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>View or download your active placement resume</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                <button
                  onClick={() => setShowPdf(!showPdf)}
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid var(--glass-border)',
                    background: 'var(--glass-bg)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    fontWeight: 500
                  }}
                >
                  <Eye size={16} /> {showPdf ? 'Hide Resume Viewer' : 'View PDF Resume'}
                </button>

                <a
                  href={`/api/student/downloadResume/${user.profileId}?token=${localStorage.getItem('token')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid var(--glass-border)',
                    background: 'rgba(16, 185, 129, 0.1)',
                    color: 'var(--accent-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    fontWeight: 500,
                    textDecoration: 'none',
                    textAlign: 'center'
                  }}
                >
                  <Download size={16} /> Download PDF
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Gemini ATS Analysis Report */}
        {analysis ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {showPdf && (
              <div className="glass-panel animate-fade-in" style={{ padding: '10px', borderRadius: '12px', height: '500px' }}>
                <iframe 
                  src={`/api/student/viewResume/${user.profileId}?token=${localStorage.getItem('token')}`} 
                  title="PDF Viewer" 
                  style={{ width: '100%', height: '100%', border: 'none', borderRadius: '8px' }}
                />
              </div>
            )}

            {/* Score & Summary Card */}
            <div className="glass-card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'Outfit', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sparkles size={20} style={{ color: 'var(--accent-warning)' }} /> ATS Audit Report
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Evaluated by Google Gemini LLM</p>
                </div>
                
                {/* Circular Score representation */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '76px',
                    height: '76px',
                    borderRadius: '50%',
                    background: 'conic-gradient(var(--accent-primary) ' + (analysis.atsScore * 3.6) + 'deg, var(--glass-border) 0deg)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.15)'
                  }}>
                    <div style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--bg-secondary)',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      fontWeight: 800,
                      fontSize: '1.25rem'
                    }}>
                      {analysis.atsScore}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                      {analysis.atsScore >= 80 ? 'Highly Optimised' : analysis.atsScore >= 60 ? 'Moderate' : 'Needs Work'}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Overall ATS Rating</span>
                  </div>
                </div>
              </div>

              {/* Chart */}
              <div style={{ height: '180px', marginTop: '10px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 20, top: 10, bottom: 10 }}>
                    <XAxis type="number" domain={[0, 100]} hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} style={{ fontSize: '0.75rem', fontWeight: 600 }} width={120} />
                    <Tooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={12}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? 'var(--accent-primary)' : 'var(--accent-secondary)'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '20px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '6px' }}>Resume Executive Summary</h4>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{analysis.summary}</p>
              </div>
            </div>

            {/* Strengths & Weaknesses */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', flexWrap: 'wrap' }}>
              <div className="glass-card" style={{ padding: '24px', borderColor: 'rgba(16, 185, 129, 0.15)' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-secondary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} /> Key Strengths
                </h4>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingLeft: '18px', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  {analysis.strengths.map((str, idx) => (
                    <li key={idx}>{str}</li>
                  ))}
                </ul>
              </div>

              <div className="glass-card" style={{ padding: '24px', borderColor: 'rgba(239, 68, 68, 0.15)' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-danger)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={16} /> Areas of Weakness
                </h4>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingLeft: '18px', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  {analysis.weaknesses.map((weak, idx) => (
                    <li key={idx}>{weak}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Skills & Improvements */}
            <div className="glass-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Target size={16} style={{ color: 'var(--accent-primary)' }} /> Skill Gap Analysis
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {analysis.missingSkills.length === 0 ? (
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>No glaring skill gaps identified! Excellent.</span>
                  ) : (
                    analysis.missingSkills.map((sk, idx) => (
                      <span key={idx} style={{
                        fontSize: '0.75rem',
                        backgroundColor: 'rgba(239, 68, 68, 0.08)',
                        color: 'var(--accent-danger)',
                        border: '1px solid rgba(239, 68, 68, 0.15)',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontWeight: 500
                      }}>
                        {sk}
                      </span>
                    ))
                  )}
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '20px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px' }}>Suggested Enhancements</h4>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '18px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {analysis.suggestedImprovements.map((imp, idx) => (
                    <li key={idx}>{imp}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* AI Curated Action Items */}
            <div className="glass-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={18} style={{ color: 'var(--accent-secondary)' }} /> Learning & Project Recommendations
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>Recommended Certifications</h4>
                  <ul style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingLeft: '18px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    {analysis.recommendedCertifications.map((cert, idx) => (
                      <li key={idx}>{cert}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>Suggested Projects</h4>
                  <ul style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingLeft: '18px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    {analysis.recommendedProjects.map((proj, idx) => (
                      <li key={idx}>{proj}</li>
                    ))}
                  </ul>
                </div>

                <div style={{ gridColumn: '1 / span 2', borderTop: '1px solid var(--glass-border)', paddingTop: '16px' }}>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>Suited Career Target Roles</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {analysis.suggestedCareerRoles.map((role, idx) => (
                      <span key={idx} style={{
                        fontSize: '0.75rem',
                        backgroundColor: 'rgba(99, 102, 241, 0.08)',
                        color: 'var(--accent-primary)',
                        border: '1px solid rgba(99, 102, 241, 0.15)',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontWeight: 600
                      }}>
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        ) : (
          /* Empty State */
          <div className="glass-card animate-fade-in" style={{ padding: '60px 40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <FileText size={60} style={{ color: 'var(--text-secondary)' }} />
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>No resume uploaded yet</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '6px', maxWidth: '400px', margin: '6px auto 0 auto' }}>
                Upload your engineering resume in PDF format to let the Google Gemini AI parse your details, generate your ATS metrics, and unlock placement applications.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeAnalyzer;
