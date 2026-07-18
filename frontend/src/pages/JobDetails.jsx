import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Briefcase, MapPin, DollarSign, Calendar, Sparkles, CheckCircle2, XCircle, AlertTriangle, HelpCircle } from 'lucide-react';
import api from '../services/api';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // AI states
  const [eligibility, setEligibility] = useState(null);
  const [eligibilityLoading, setEligibilityLoading] = useState(true);
  const [matchData, setMatchData] = useState(null);
  const [matchLoading, setMatchLoading] = useState(true);
  
  // Application checks
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [applicationId, setApplicationId] = useState(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const jobRes = await api.get(`/student/jobs`);
      const currentJob = jobRes.data.find(j => j.id.toString() === id);
      if (!currentJob) {
        setError('Job posting not found.');
        return;
      }
      setJob(currentJob);

      // Check if student has already applied
      const appsRes = await api.get('/student/applications');
      const matchingApp = appsRes.data.find(app => app.job.id.toString() === id);
      if (matchingApp) {
        setAlreadyApplied(true);
        setApplicationId(matchingApp.id);
      }

      // Trigger AI Eligibility check
      try {
        const eligibilityRes = await api.post(`/ai/checkEligibility?jobId=${id}`);
        setEligibility(eligibilityRes.data);
      } catch (eligErr) {
        console.error('Eligibility AI failed', eligErr);
      } finally {
        setEligibilityLoading(false);
      }

      // Trigger AI Resume Match
      try {
        const matchRes = await api.post(`/ai/matchResume?jobId=${id}`);
        setMatchData(matchRes.data);
      } catch (matchErr) {
        console.error('Resume Match AI failed', matchErr);
      } finally {
        setMatchLoading(false);
      }

    } catch (err) {
      console.error(err);
      setError('Failed to fetch details.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const res = await api.post(`/student/apply?jobId=${id}`);
      setSuccess('Applied successfully! AI match and eligibility reports have been submitted.');
      setAlreadyApplied(true);
      setApplicationId(res.data.id);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data || 'Failed to submit application.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdraw = async () => {
    if (!applicationId) return;
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await api.delete(`/student/applications/${applicationId}`);
      setSuccess('Application withdrawn successfully.');
      setAlreadyApplied(false);
      setApplicationId(null);
    } catch (err) {
      setError('Failed to withdraw application.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '16px' }}>
        <div className="skeleton" style={{ height: '30px', width: '120px' }}></div>
        <div className="glass-card skeleton" style={{ height: '240px' }}></div>
      </div>
    );
  }

  if (error && !job) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p style={{ color: 'var(--accent-danger)' }}>{error}</p>
        <Link to="/student/jobs" style={{ marginTop: '10px', display: 'inline-block', color: 'var(--accent-primary)' }}>Back to Job Board</Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1200px' }}>
      <div>
        <Link to="/student/jobs" style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', textDecoration: 'none', marginBottom: '16px' }}>
          <ArrowLeft size={16} /> Back to Job Board
        </Link>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'Outfit' }}>Job Application Details</h2>
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
          <XCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        
        {/* Left Side: Job Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-card" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  color: '#fff',
                  fontWeight: 'bold',
                  fontSize: '1.5rem'
                }}>
                  {job.companyName.charAt(0)}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 800, fontFamily: 'Outfit' }}>{job.jobTitle}</h3>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{job.companyName}</span>
                </div>
              </div>

              <span style={{
                fontSize: '0.8rem',
                backgroundColor: 'rgba(99, 102, 241, 0.12)',
                color: 'var(--accent-primary)',
                padding: '4px 12px',
                borderRadius: '12px',
                fontWeight: 600
              }}>
                {job.jobType}
              </span>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', margin: '24px 0', padding: '16px 0', borderTop: '1px solid var(--glass-border)', borderBottom: '1px solid var(--glass-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <MapPin size={16} />
                <span>{job.location}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <DollarSign size={16} style={{ color: 'var(--accent-secondary)' }} />
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{job.packageDetails}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <Calendar size={16} />
                <span>Apply Before: {new Date(job.deadline).toLocaleDateString()}</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '6px' }}>Job Overview</h4>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                  {job.description}
                </p>
              </div>

              <div style={{ marginTop: '10px' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '8px' }}>Required Technical Skills</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {job.requiredSkills.split(',').map((sk, idx) => (
                    <span key={idx} style={{
                      fontSize: '0.75rem',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      border: '1px solid var(--glass-border)',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      color: 'var(--text-primary)'
                    }}>
                      {sk.trim()}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: AI Analytics & Apply Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Apply Card */}
          <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Application Panel</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Submit your parsed profile directly to the recruiters.</p>

            {alreadyApplied ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  disabled
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    color: 'var(--accent-secondary)',
                    fontWeight: 600,
                    cursor: 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <CheckCircle2 size={16} /> Applied
                </button>
                <button
                  onClick={handleWithdraw}
                  disabled={submitting}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid var(--accent-danger)',
                    background: 'transparent',
                    color: 'var(--accent-danger)',
                    fontWeight: 500,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  Withdraw Application
                </button>
              </div>
            ) : (
              <button
                onClick={handleApply}
                disabled={submitting}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'linear-gradient(135deg, var(--accent-primary), rgba(99, 102, 241, 0.9))',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)',
                  textAlign: 'center'
                }}
              >
                {submitting ? 'Submitting...' : 'Apply For Job'}
              </button>
            )}
          </div>

          {/* AI Eligibility Card (Feature 2) */}
          <div className="glass-card" style={{ padding: '24px', borderLeft: eligibility ? (eligibility.eligible ? '4px solid var(--accent-secondary)' : '4px solid var(--accent-warning)') : '1px solid var(--glass-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={16} style={{ color: 'var(--accent-warning)' }} /> AI Eligibility Checker
              </h3>
              {eligibilityLoading && (
                <span className="skeleton" style={{ width: '50px', height: '14px' }}></span>
              )}
            </div>

            {eligibilityLoading ? (
              <div className="skeleton" style={{ height: '60px', width: '100%' }}></div>
            ) : eligibility ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {eligibility.eligible ? (
                    <CheckCircle2 size={18} style={{ color: 'var(--accent-secondary)' }} />
                  ) : (
                    <AlertTriangle size={18} style={{ color: 'var(--accent-warning)' }} />
                  )}
                  <span style={{ fontWeight: 700, fontSize: '0.95rem', color: eligibility.eligible ? 'var(--accent-secondary)' : 'var(--accent-warning)' }}>
                    {eligibility.eligible ? 'Eligible' : 'Check Requirements'}
                  </span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  {eligibility.reason}
                </p>
              </div>
            ) : (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Upload your academic profile to evaluate eligibility.</p>
            )}
          </div>

          {/* AI Resume Match Card (Feature 3) */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} style={{ color: 'var(--accent-primary)' }} /> AI Resume Match
            </h3>

            {matchLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div className="skeleton" style={{ height: '30px', width: '80%' }}></div>
                <div className="skeleton" style={{ height: '80px', width: '100%' }}></div>
              </div>
            ) : matchData ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'conic-gradient(var(--accent-primary) ' + (matchData.matchPercentage * 3.6) + 'deg, var(--glass-border) 0deg)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--bg-secondary)',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      fontWeight: 800,
                      fontSize: '0.95rem'
                    }}>
                      {matchData.matchPercentage}%
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Alignment Score</span>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Job match compatibility</p>
                  </div>
                </div>

                {matchData.missingSkills && matchData.missingSkills.length > 0 && (
                  <div>
                    <p style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Missing Skills from JD:</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {matchData.missingSkills.map((sk, idx) => (
                        <span key={idx} style={{
                          fontSize: '0.7rem',
                          backgroundColor: 'rgba(239, 68, 68, 0.08)',
                          color: 'var(--accent-danger)',
                          border: '1px solid rgba(239, 68, 68, 0.15)',
                          padding: '2px 8px',
                          borderRadius: '4px'
                        }}>
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {matchData.recommendedImprovements && matchData.recommendedImprovements.length > 0 && (
                  <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '12px' }}>
                    <p style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Match Recommendations:</p>
                    <ul style={{ paddingLeft: '14px', fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {matchData.recommendedImprovements.map((imp, idx) => (
                        <li key={idx}>{imp}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Upload your resume PDF under the AI Review portal to run compatibility matching.</p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default JobDetails;
