import React, { useState, useEffect } from 'react';
import { UserCheck, Building, Globe, Phone, ShieldCheck, AlertCircle } from 'lucide-react';
import api from '../services/api';

const RecruiterApprovals = () => {
  const [recruiters, setRecruiters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchPendingRecruiters();
  }, []);

  const fetchPendingRecruiters = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/admin/recruiters/pending');
      setRecruiters(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch pending approvals.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (recId) => {
    try {
      await api.put(`/admin/recruiter/${recId}/approve`);
      setRecruiters(prev => prev.filter(r => r.id !== recId));
      setSuccess('Recruiter approved successfully! They can now log in and post jobs.');
      setTimeout(() => setSuccess(''), 3500);
    } catch (err) {
      console.error(err);
      setError('Failed to approve recruiter.');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '16px' }}>
        <div className="skeleton" style={{ height: '32px', width: '220px' }}></div>
        <div className="skeleton" style={{ height: '180px', width: '100%' }}></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'Outfit' }}>Recruiter Approvals</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Authorize pending recruiter corporate accounts to publish placement vacancies</p>
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
          <ShieldCheck size={18} />
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

      {/* Approvals Table */}
      <div className="glass-card" style={{ overflowX: 'auto', borderRadius: '12px' }}>
        {recruiters.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No pending recruiter registration requests found.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)' }}>
                <th style={{ padding: '16px 20px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Company details</th>
                <th style={{ padding: '16px 20px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Contact Info</th>
                <th style={{ padding: '16px 20px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Status</th>
                <th style={{ padding: '16px 20px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recruiters.map((r) => (
                <tr key={r.id} style={{ borderBottom: '1px solid var(--glass-border)', transition: 'background-color 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.01)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <td style={{ padding: '18px 20px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        color: '#fff',
                        fontWeight: 'bold',
                        fontSize: '1rem'
                      }}>
                        <Building size={18} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>{r.companyName}</span>
                        <a href={r.companyWebsite} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.78rem', color: 'var(--accent-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Globe size={12} /> {r.companyWebsite || 'No website associated'}
                        </a>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '18px 20px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Phone size={14} />
                      <span>{r.contactNumber || 'No contact number'}</span>
                    </div>
                  </td>
                  <td style={{ padding: '18px 20px' }}>
                    <span style={{
                      fontSize: '0.7rem',
                      backgroundColor: 'rgba(245, 158, 11, 0.12)',
                      color: 'var(--accent-warning)',
                      padding: '4px 10px',
                      borderRadius: '10px',
                      fontWeight: 700
                    }}>
                      AWAITING REVIEW
                    </span>
                  </td>
                  <td style={{ padding: '18px 20px', textAlign: 'center' }}>
                    <button
                      onClick={() => handleApprove(r.id)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '6px',
                        border: 'none',
                        background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                        color: '#fff',
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 4px 10px rgba(99, 102, 241, 0.2)'
                      }}
                    >
                      <UserCheck size={14} /> Approve Account
                    </button>
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

export default RecruiterApprovals;
