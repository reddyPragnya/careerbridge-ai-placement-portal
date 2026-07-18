import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle2, AlertTriangle, Trash2, Calendar, ShieldCheck } from 'lucide-react';
import api from '../services/api';

const ApplicationTracking = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [expandedAppId, setExpandedAppId] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/student/applications');
      setApplications(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load application history.');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (appId) => {
    if (!window.confirm('Are you sure you want to withdraw this application? This action cannot be undone.')) {
      return;
    }
    try {
      await api.delete(`/student/applications/${appId}`);
      setSuccess('Application withdrawn successfully.');
      setApplications(prev => prev.filter(app => app.id !== appId));
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setError('Failed to withdraw application.');
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'APPLIED':
        return { bg: 'rgba(99, 102, 241, 0.12)', color: 'var(--accent-primary)' };
      case 'UNDER_REVIEW':
        return { bg: 'rgba(168, 85, 247, 0.12)', color: '#a855f7' }; // Purple
      case 'SHORTLISTED':
        return { bg: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6' }; // Blue
      case 'INTERVIEW_SCHEDULED':
        return { bg: 'rgba(245, 158, 11, 0.12)', color: 'var(--accent-warning)' };
      case 'SELECTED':
        return { bg: 'rgba(16, 185, 129, 0.12)', color: 'var(--accent-secondary)' };
      case 'REJECTED':
        return { bg: 'rgba(239, 68, 68, 0.12)', color: 'var(--accent-danger)' };
      default:
        return { bg: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-secondary)' };
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '16px' }}>
        <div className="skeleton" style={{ height: '32px', width: '200px' }}></div>
        <div className="skeleton" style={{ height: '200px', width: '100%' }}></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'Outfit' }}>Application Tracker</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Track placement selections, status changes, and interview updates</p>
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
          <span>{error}</span>
        </div>
      )}

      <div className="glass-card" style={{ overflowX: 'auto', borderRadius: '12px' }}>
        {applications.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            You haven't submitted any job applications yet. Go check out the Job Board!
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)' }}>
                <th style={{ padding: '16px 20px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Job Details</th>
                <th style={{ padding: '16px 20px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Applied Date</th>
                <th style={{ padding: '16px 20px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>AI Match Rating</th>
                <th style={{ padding: '16px 20px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Eligibility Checks</th>
                <th style={{ padding: '16px 20px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Application Status</th>
                <th style={{ padding: '16px 20px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => {
                const statusTheme = getStatusStyle(app.status);
                const scoreColor = app.matchPercentage >= 80 ? 'var(--accent-secondary)' : 
                                   app.matchPercentage >= 60 ? 'var(--accent-warning)' : 'var(--accent-danger)';
                const isExpanded = expandedAppId === app.id;
                return (
                  <React.Fragment key={app.id}>
                    <tr 
                      onClick={(e) => {
                        if (e.target.closest('button') || e.target.closest('a')) return;
                        setExpandedAppId(isExpanded ? null : app.id);
                      }}
                      style={{ 
                        borderBottom: '1px solid var(--glass-border)', 
                        transition: 'background-color 0.2s',
                        cursor: 'pointer',
                        backgroundColor: isExpanded ? 'rgba(255,255,255,0.015)' : 'transparent'
                      }}
                      onMouseEnter={(e) => {
                        if (!isExpanded) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.01)';
                      }}
                      onMouseLeave={(e) => {
                        if (!isExpanded) e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <td style={{ padding: '18px 20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>{app.job.jobTitle}</span>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{app.job.companyName}</span>
                        </div>
                      </td>
                      <td style={{ padding: '18px 20px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Calendar size={14} />
                          <span>{new Date(app.appliedDate).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td style={{ padding: '18px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{
                            fontWeight: 800,
                            fontSize: '0.9rem',
                            color: scoreColor
                          }}>
                            {app.matchPercentage}%
                          </span>
                          <div style={{
                            width: '60px',
                            height: '6px',
                            backgroundColor: 'var(--glass-border)',
                            borderRadius: '3px',
                            overflow: 'hidden'
                          }}>
                            <div style={{
                              width: `${app.matchPercentage}%`,
                              height: '100%',
                              backgroundColor: scoreColor
                            }}></div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '18px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {app.eligibilityStatus ? (
                            <>
                              <ShieldCheck size={16} style={{ color: 'var(--accent-secondary)' }} />
                              <span style={{ fontSize: '0.8rem', color: 'var(--accent-secondary)', fontWeight: 500 }}>Approved</span>
                            </>
                          ) : (
                            <>
                              <AlertTriangle size={16} style={{ color: 'var(--accent-warning)' }} />
                              <span style={{ fontSize: '0.8rem', color: 'var(--accent-warning)', fontWeight: 500 }}>Warning</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '18px 20px' }}>
                        <span style={{
                          fontSize: '0.72rem',
                          backgroundColor: statusTheme.bg,
                          color: statusTheme.color,
                          padding: '4px 10px',
                          borderRadius: '10px',
                          fontWeight: 700,
                          display: 'inline-block'
                        }}>
                          {app.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td style={{ padding: '18px 20px', textAlign: 'center' }}>
                        {app.status === 'APPLIED' || app.status === 'UNDER_REVIEW' ? (
                          <button
                            onClick={() => handleWithdraw(app.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--accent-danger)',
                              cursor: 'pointer',
                              padding: '6px',
                              borderRadius: '6px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'background-color 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            title="Withdraw Application"
                          >
                            <Trash2 size={16} />
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Locked</span>
                        )}
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr style={{ background: 'rgba(255, 255, 255, 0.015)' }}>
                        <td colSpan={6} style={{ padding: '20px 24px', borderBottom: '1px solid var(--glass-border)' }}>
                          <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            {app.rejectionReason && (
                              <div className="glass-panel" style={{ 
                                gridColumn: 'span 2', 
                                padding: '16px 20px', 
                                borderRadius: '10px',
                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                backgroundColor: 'rgba(239, 68, 68, 0.03)'
                              }}>
                                <h4 style={{ fontSize: '0.88rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', color: 'var(--accent-danger)' }}>
                                  <AlertTriangle size={16} />
                                  Recruiter Feedback / Rejection Reason
                                </h4>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
                                  {app.rejectionReason}
                                </p>
                              </div>
                            )}
                            {/* Column 1: Smart Eligibility Details */}
                            <div className="glass-panel" style={{ padding: '16px 20px', borderRadius: '10px' }}>
                              <h4 style={{ fontSize: '0.88rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px', color: 'var(--text-primary)' }}>
                                <ShieldCheck size={16} style={{ color: app.eligibilityStatus ? 'var(--accent-secondary)' : 'var(--accent-warning)' }} />
                                Smart Eligibility Assessment
                              </h4>
                              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0, whiteSpace: 'pre-wrap' }}>
                                {app.eligibilityReason || 'No eligibility assessments recorded.'}
                              </p>
                            </div>

                            {/* Column 2: Scheduled Interview Details */}
                            <div className="glass-panel" style={{ padding: '16px 20px', borderRadius: '10px' }}>
                              <h4 style={{ fontSize: '0.88rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px', color: 'var(--text-primary)' }}>
                                <Calendar size={16} style={{ color: 'var(--accent-primary)' }} />
                                Scheduled Interview Details
                              </h4>
                              {app.status === 'INTERVIEW_SCHEDULED' && app.interviews && app.interviews.length > 0 ? (
                                (() => {
                                  const interview = app.interviews[app.interviews.length - 1]; // Get latest interview
                                  const isLink = interview.locationOrLink && (interview.locationOrLink.startsWith('http') || interview.locationOrLink.includes('.com') || interview.locationOrLink.includes('.org') || interview.locationOrLink.startsWith('zoom') || interview.locationOrLink.startsWith('meet'));
                                  return (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.8rem' }}>
                                      <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '6px' }}>
                                        <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Interview Type:</span>
                                        <span style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>{interview.interviewType}</span>
                                        
                                        <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Date & Time:</span>
                                        <span style={{ fontWeight: 600 }}>{new Date(interview.interviewDate).toLocaleString()}</span>
                                        
                                        <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Location/Link:</span>
                                        <span>
                                          {isLink ? (
                                            <a
                                              href={interview.locationOrLink}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              style={{
                                                color: 'var(--accent-primary)',
                                                textDecoration: 'underline',
                                                fontWeight: 600
                                              }}
                                            >
                                              Join Live Meeting
                                            </a>
                                          ) : (
                                            interview.locationOrLink
                                          )}
                                        </span>
                                      </div>
                                      
                                      {interview.description && (
                                        <div style={{ marginTop: '4px', borderTop: '1px solid var(--glass-border)', paddingTop: '8px' }}>
                                          <span style={{ color: 'var(--text-secondary)', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Instructions:</span>
                                          <span style={{ color: 'var(--text-secondary)', lineHeight: 1.4 }}>{interview.description}</span>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })()
                              ) : (
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                                  {app.status === 'INTERVIEW_SCHEDULED' ? 'Interview details are loading...' : 'No interview scheduled for this phase.'}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ApplicationTracking;
