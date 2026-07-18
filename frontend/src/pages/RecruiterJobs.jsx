import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Edit, Trash2, ToggleLeft, ToggleRight, Calendar, AlertCircle } from 'lucide-react';
import api from '../services/api';

const RecruiterJobs = () => {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/recruiter/jobs');
      setJobs(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch job postings.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (job) => {
    const newStatus = job.status === 'OPEN' ? 'CLOSED' : 'OPEN';
    try {
      const res = await api.put(`/recruiter/jobs/${job.id}`, {
        ...job,
        status: newStatus
      });
      setJobs(prev => prev.map(j => j.id === job.id ? res.data : j));
    } catch (err) {
      console.error(err);
      setError('Failed to toggle status.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this job vacancy? This deletes all candidate application history.')) {
      return;
    }
    try {
      await api.delete(`/recruiter/jobs/${id}`);
      setJobs(prev => prev.filter(j => j.id !== id));
    } catch (err) {
      console.error(err);
      setError('Failed to delete job posting.');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '16px' }}>
        <div className="skeleton" style={{ height: '32px', width: '200px' }}></div>
        <div className="skeleton" style={{ height: '180px', width: '100%' }}></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'Outfit' }}>Manage Job Vacancies</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Monitor, adjust, toggle, or delete active placements</p>
        </div>
        <button
          onClick={() => navigate('/recruiter/post-job')}
          style={{
            padding: '10px 18px',
            borderRadius: '8px',
            border: 'none',
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
            color: '#fff',
            fontWeight: 600,
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)'
          }}
        >
          <PlusCircle size={16} /> Post Job
        </button>
      </div>

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

      <div className="glass-card" style={{ overflowX: 'auto', borderRadius: '12px' }}>
        {jobs.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No jobs posted yet. Click the 'Post Job' button to get started!
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '850px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)' }}>
                <th style={{ padding: '16px 20px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Job Title</th>
                <th style={{ padding: '16px 20px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Details</th>
                <th style={{ padding: '16px 20px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Package</th>
                <th style={{ padding: '16px 20px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Deadline</th>
                <th style={{ padding: '16px 20px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Status</th>
                <th style={{ padding: '16px 20px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id} style={{ borderBottom: '1px solid var(--glass-border)', transition: 'background-color 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.01)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <td style={{ padding: '18px 20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>{job.jobTitle}</span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{job.location}</span>
                    </div>
                  </td>
                  <td style={{ padding: '18px 20px', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ color: 'var(--text-primary)' }}>{job.jobType}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>CGPA Cutoff: {job.eligibilityCgpa}</span>
                    </div>
                  </td>
                  <td style={{ padding: '18px 20px', fontSize: '0.88rem', fontWeight: 600, color: 'var(--accent-secondary)' }}>
                    {job.packageDetails}
                  </td>
                  <td style={{ padding: '18px 20px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={14} />
                      <span>{new Date(job.deadline).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td style={{ padding: '18px 20px' }}>
                    <span style={{
                      fontSize: '0.7rem',
                      backgroundColor: job.status === 'OPEN' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                      color: job.status === 'OPEN' ? 'var(--accent-secondary)' : 'var(--accent-danger)',
                      padding: '4px 10px',
                      borderRadius: '10px',
                      fontWeight: 700
                    }}>
                      {job.status}
                    </span>
                  </td>
                  <td style={{ padding: '18px 20px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                      <button
                        onClick={() => handleToggleStatus(job)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-primary)',
                          cursor: 'pointer',
                          padding: '6px',
                          borderRadius: '6px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        title={job.status === 'OPEN' ? 'Close Selection' : 'Reopen Selection'}
                      >
                        {job.status === 'OPEN' ? <ToggleRight size={18} style={{ color: 'var(--accent-secondary)' }} /> : <ToggleLeft size={18} style={{ color: 'var(--text-secondary)' }} />}
                      </button>

                      <button
                        onClick={() => navigate(`/recruiter/jobs/edit/${job.id}`)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--accent-primary)',
                          cursor: 'pointer',
                          padding: '6px',
                          borderRadius: '6px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        title="Edit Details"
                      >
                        <Edit size={16} />
                      </button>

                      <button
                        onClick={() => handleDelete(job.id)}
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
                        title="Delete Vacancy"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default RecruiterJobs;
