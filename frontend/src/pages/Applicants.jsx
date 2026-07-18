import React, { useState, useEffect } from 'react';
import { Search, Eye, Check, X, Calendar, AlertCircle, FileText, Sparkles, Filter, Video } from 'lucide-react';
import api from '../services/api';

const Applicants = () => {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Search / Filter states
  const [search, setSearch] = useState('');
  const [jobFilter, setJobFilter] = useState('');
  const [minMatch, setMinMatch] = useState(0);

  // Modal states for Scheduling Interview
  const [showModal, setShowModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [scheduleForm, setScheduleForm] = useState({
    interviewDate: '',
    interviewType: 'TECHNICAL',
    locationOrLink: '',
    description: ''
  });
  const [modalLoading, setModalLoading] = useState(false);

  // Rejection Feedback states
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectAppId, setRejectAppId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchApplicants();
  }, []);

  const fetchApplicants = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/recruiter/applicants');
      // Sort applicants by Match Score descending by default
      const sorted = res.data.sort((a, b) => b.matchPercentage - a.matchPercentage);
      setApplicants(sorted);
    } catch (err) {
      console.error(err);
      setError('Failed to load candidate application records.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (appId, newStatus) => {
    try {
      const res = await api.put(`/recruiter/applications/${appId}/status?status=${newStatus}`);
      setApplicants(prev => prev.map(app => app.id === appId ? { ...app, status: res.data.status } : app));
      setSuccess(`Candidate status updated to ${newStatus}!`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setError('Failed to update status.');
    }
  };

  const openRejectModal = (appId) => {
    setRejectAppId(appId);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/recruiter/applications/${rejectAppId}/status`, null, {
        params: {
          status: 'REJECTED',
          rejectionReason: rejectionReason
        }
      });
      setApplicants(prev => prev.map(app => app.id === rejectAppId ? { ...app, status: res.data.status, rejectionReason: res.data.rejectionReason } : app));
      setSuccess('Candidate has been rejected with feedback.');
      setShowRejectModal(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setError('Failed to reject candidate.');
      setShowRejectModal(false);
    }
  };

  const openScheduleModal = (app) => {
    setSelectedApp(app);
    setShowModal(true);
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setError('');
    try {
      const { interviewDate, interviewType, locationOrLink, description } = scheduleForm;
      const res = await api.post(`/recruiter/interviews/schedule`, null, {
        params: {
          applicationId: selectedApp.id,
          interviewDate,
          interviewType,
          locationOrLink,
          description
        }
      });
      
      // Update candidate status locally
      setApplicants(prev => prev.map(app => app.id === selectedApp.id ? { ...app, status: 'INTERVIEW_SCHEDULED' } : app));
      setSuccess('Interview scheduled successfully! Student has been notified.');
      setShowModal(false);
      setScheduleForm({
        interviewDate: '',
        interviewType: 'TECHNICAL',
        locationOrLink: '',
        description: ''
      });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setError('Failed to schedule interview. Ensure date is formatted correctly.');
    } finally {
      setModalLoading(false);
    }
  };

  // Unique job titles for filter dropdown
  const uniqueJobs = [...new Set(applicants.map(app => app.job.jobTitle))];

  // Filtering Logic
  const filteredApplicants = applicants.filter(app => {
    const matchesSearch = app.student.fullName.toLowerCase().includes(search.toLowerCase());
    const matchesJob = !jobFilter || app.job.jobTitle === jobFilter;
    const matchesMatch = app.matchPercentage >= minMatch;
    return matchesSearch && matchesJob && matchesMatch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPLIED': return '#6366f1';
      case 'UNDER_REVIEW': return '#a855f7';
      case 'SHORTLISTED': return '#3b82f6';
      case 'INTERVIEW_SCHEDULED': return 'var(--accent-warning)';
      case 'SELECTED': return 'var(--accent-secondary)';
      case 'REJECTED': return 'var(--accent-danger)';
      default: return 'var(--text-secondary)';
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '16px' }}>
        <div className="skeleton" style={{ height: '32px', width: '200px' }}></div>
        <div className="skeleton" style={{ height: '220px', width: '100%' }}></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'Outfit' }}>Manage Applicants</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Review candidate profiles, check AI compatibility metrics, and schedule interviews</p>
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
          <Check size={18} style={{ color: 'var(--accent-secondary)' }} />
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

      {/* Filters */}
      <div className="glass-panel" style={{
        padding: '16px 20px',
        borderRadius: '12px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '16px',
        alignItems: 'center'
      }}>
        <div style={{ position: 'relative', flex: 2, minWidth: '220px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input
            type="text"
            placeholder="Search candidate name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="glass-input"
            style={{ width: '100%', paddingLeft: '38px' }}
          />
        </div>

        <div style={{ flex: 1, minWidth: '150px' }}>
          <select
            value={jobFilter}
            onChange={(e) => setJobFilter(e.target.value)}
            className="glass-input"
            style={{ width: '100%', background: 'var(--glass-bg)', cursor: 'pointer' }}
          >
            <option value="">Filter by Job Post</option>
            {uniqueJobs.map(title => (
              <option key={title} value={title}>{title}</option>
            ))}
          </select>
        </div>

        <div style={{ flex: 1, minWidth: '160px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Filter size={16} style={{ color: 'var(--text-secondary)' }} />
          <select
            value={minMatch}
            onChange={(e) => setMinMatch(Number(e.target.value))}
            className="glass-input"
            style={{ width: '100%', background: 'var(--glass-bg)', cursor: 'pointer' }}
          >
            <option value={0}>Min Match Score</option>
            <option value={80}>&gt;= 80% Match</option>
            <option value={60}>&gt;= 60% Match</option>
            <option value={40}>&gt;= 40% Match</option>
          </select>
        </div>
      </div>

      {/* Applicants Table */}
      <div className="glass-card" style={{ overflowX: 'auto', borderRadius: '12px' }}>
        {filteredApplicants.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No matching candidates found.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '950px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)' }}>
                <th style={{ padding: '16px 20px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Candidate Name</th>
                <th style={{ padding: '16px 20px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Applied Vacancy</th>
                <th style={{ padding: '16px 20px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>AI Match Percentage</th>
                <th style={{ padding: '16px 20px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>AI Eligibility Reason</th>
                <th style={{ padding: '16px 20px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Status</th>
                <th style={{ padding: '16px 20px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'center' }}>Pipeline Routing</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplicants.map((app) => {
                const scoreColor = app.matchPercentage >= 80 ? 'var(--accent-secondary)' : 
                                   app.matchPercentage >= 60 ? 'var(--accent-warning)' : 'var(--accent-danger)';
                return (
                  <tr key={app.id} style={{ borderBottom: '1px solid var(--glass-border)', transition: 'background-color 0.2s' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.01)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <td style={{ padding: '18px 20px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>{app.student.fullName}</span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{app.student.department} | CGPA: {app.student.cgpa}</span>
                      </div>
                    </td>
                    <td style={{ padding: '18px 20px', fontSize: '0.88rem' }}>
                      {app.job.jobTitle}
                    </td>
                    <td style={{ padding: '18px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Sparkles size={14} style={{ color: 'var(--accent-warning)' }} />
                        <span style={{ fontWeight: 800, fontSize: '0.9rem', color: scoreColor }}>
                          {app.matchPercentage}%
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '18px 20px', fontSize: '0.78rem', color: 'var(--text-secondary)', maxWidth: '280px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={app.eligibilityReason}>
                      {app.eligibilityReason}
                    </td>
                    <td style={{ padding: '18px 20px' }}>
                      <span style={{
                        fontSize: '0.7rem',
                        backgroundColor: `${getStatusColor(app.status)}15`,
                        color: getStatusColor(app.status),
                        padding: '4px 10px',
                        borderRadius: '10px',
                        fontWeight: 700
                      }}>
                        {app.status}
                      </span>
                    </td>
                    <td style={{ padding: '18px 20px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                        {/* Stream Resume */}
                        <a
                          href={`/api/student/viewResume/${app.student.id}?token=${localStorage.getItem('token')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            padding: '6px',
                            borderRadius: '6px',
                            color: 'var(--text-primary)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid var(--glass-border)',
                            background: 'var(--glass-bg)',
                          }}
                          title="Stream Resume PDF"
                        >
                          <Eye size={14} />
                        </a>

                        {/* Shortlist */}
                        <button
                          onClick={() => handleUpdateStatus(app.id, 'SHORTLISTED')}
                          disabled={app.status === 'SHORTLISTED' || app.status === 'SELECTED' || app.status === 'REJECTED'}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--accent-secondary)',
                            cursor: 'pointer',
                            padding: '6px',
                            borderRadius: '6px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: 'rgba(16, 185, 129, 0.08)',
                            opacity: (app.status === 'SHORTLISTED' || app.status === 'SELECTED' || app.status === 'REJECTED') ? 0.4 : 1
                          }}
                          title="Shortlist Candidate"
                        >
                          <Check size={14} />
                        </button>

                        {/* Schedule Interview */}
                        <button
                          onClick={() => openScheduleModal(app)}
                          disabled={app.status === 'REJECTED' || app.status === 'SELECTED'}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--accent-warning)',
                            cursor: 'pointer',
                            padding: '6px',
                            borderRadius: '6px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: 'rgba(245, 158, 11, 0.08)',
                            opacity: (app.status === 'REJECTED' || app.status === 'SELECTED') ? 0.4 : 1
                          }}
                          title="Schedule Interview"
                        >
                          <Video size={14} />
                        </button>

                        {/* Reject */}
                        <button
                          onClick={() => openRejectModal(app.id)}
                          disabled={app.status === 'REJECTED'}
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
                            backgroundColor: 'rgba(239, 68, 68, 0.08)',
                            opacity: (app.status === 'REJECTED') ? 0.4 : 1
                          }}
                          title="Reject Candidate"
                        >
                          <X size={14} />
                        </button>

                        {/* Select/Hire */}
                        {app.status === 'INTERVIEW_SCHEDULED' && (
                          <button
                            onClick={() => handleUpdateStatus(app.id, 'SELECTED')}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--accent-secondary)',
                              cursor: 'pointer',
                              padding: '6px',
                              borderRadius: '6px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: 'rgba(16, 185, 129, 0.15)',
                            }}
                            title="Hire Candidate"
                          >
                            Hired
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Schedule Interview Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <form onSubmit={handleScheduleSubmit} className="glass-panel" style={{
            width: '100%',
            maxWidth: '500px',
            borderRadius: '16px',
            padding: '32px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'Outfit' }}>Schedule Interview</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Scheduling for <strong>{selectedApp?.student?.fullName}</strong> ({selectedApp?.job?.jobTitle})
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Interview Date & Time</label>
              <input
                type="datetime-local"
                required
                className="glass-input"
                value={scheduleForm.interviewDate}
                onChange={(e) => setScheduleForm(prev => ({ ...prev, interviewDate: e.target.value }))}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Interview Category</label>
              <select
                className="glass-input"
                value={scheduleForm.interviewType}
                style={{ background: 'var(--glass-bg)' }}
                onChange={(e) => setScheduleForm(prev => ({ ...prev, interviewType: e.target.value }))}
              >
                <option value="TECHNICAL">TECHNICAL ROUND</option>
                <option value="HR">HR DISCUSSIONS</option>
                <option value="BEHAVIORAL">BEHAVIORAL ROUND</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Interview Join Link (or Location)</label>
              <input
                type="text"
                required
                placeholder="e.g. Teams/Zoom Link or Conference Room 3"
                className="glass-input"
                value={scheduleForm.locationOrLink}
                onChange={(e) => setScheduleForm(prev => ({ ...prev, locationOrLink: e.target.value }))}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Category Details / Instructions</label>
              <textarea
                rows={3}
                placeholder="Describe round parameters, preparation criteria, or coding formats..."
                className="glass-input"
                value={scheduleForm.description}
                onChange={(e) => setScheduleForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: '1px solid var(--glass-border)',
                  background: 'transparent',
                  color: 'var(--text-primary)',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={modalLoading}
                style={{
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'var(--accent-primary)',
                  color: '#fff',
                  fontWeight: 600,
                  cursor: modalLoading ? 'not-allowed' : 'pointer'
                }}
              >
                {modalLoading ? 'Scheduling...' : 'Confirm Interview'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Rejection Feedback Modal */}
      {showRejectModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <form onSubmit={handleRejectSubmit} className="glass-panel" style={{
            width: '100%',
            maxWidth: '480px',
            borderRadius: '16px',
            padding: '32px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'Outfit', color: 'var(--accent-danger)' }}>Reject Candidate Feedback</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Please provide the reason for rejecting this candidate. This feedback will be visible in the candidate's application tracker for their learning and improvement.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Rejection Reason / Feedback</label>
              <textarea
                rows={4}
                required
                placeholder="e.g. Failed document verification, did not meet background screening requirements, or details on technical mismatch..."
                className="glass-input"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                style={{
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: '1px solid var(--glass-border)',
                  background: 'transparent',
                  color: 'var(--text-primary)',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'var(--accent-danger)',
                  color: '#fff',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Confirm Rejection
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Applicants;
