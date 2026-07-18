import React, { useState, useEffect } from 'react';
import { Search, Ban, CheckCircle, Trash2, Calendar, AlertCircle } from 'lucide-react';
import api from '../services/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch system user registry.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBlock = async (userId) => {
    try {
      await api.put(`/admin/user/${userId}/toggle-block`);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, blocked: !u.blocked } : u));
      setSuccess('User block status toggled successfully.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setError('Failed to update user block status.');
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? All associated profile data, jobs, or applications will be purged.')) {
      return;
    }
    try {
      await api.delete(`/admin/user/${userId}`);
      setUsers(prev => prev.filter(u => u.id !== userId));
      setSuccess('User account successfully purged.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setError('Failed to delete user account.');
    }
  };

  const filteredUsers = users.filter(u => u.email.toLowerCase().includes(search.toLowerCase()));

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
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'Outfit' }}>System User Directory</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Block, enable, delete, or review active user registrations</p>
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
          <CheckCircle size={18} />
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

      {/* Toolbar */}
      <div className="glass-panel" style={{ padding: '16px 20px', borderRadius: '12px' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '350px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input
            type="text"
            placeholder="Search email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="glass-input"
            style={{ width: '100%', paddingLeft: '38px' }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="glass-card" style={{ overflowX: 'auto', borderRadius: '12px' }}>
        {filteredUsers.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No registered users found.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)' }}>
                <th style={{ padding: '16px 20px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>User Email</th>
                <th style={{ padding: '16px 20px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>System Role</th>
                <th style={{ padding: '16px 20px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Registered On</th>
                <th style={{ padding: '16px 20px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Status</th>
                <th style={{ padding: '16px 20px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'center' }}>Account Control</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--glass-border)', transition: 'background-color 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.01)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <td style={{ padding: '18px 20px', fontWeight: 600, fontSize: '0.9rem' }}>
                    {u.email}
                  </td>
                  <td style={{ padding: '18px 20px' }}>
                    <span style={{
                      fontSize: '0.72rem',
                      backgroundColor: 'rgba(99, 102, 241, 0.12)',
                      color: 'var(--accent-primary)',
                      padding: '3px 8px',
                      borderRadius: '8px',
                      fontWeight: 600
                    }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '18px 20px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={14} />
                      <span>{new Date(u.createdAt).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td style={{ padding: '18px 20px' }}>
                    {u.blocked ? (
                      <span style={{
                        fontSize: '0.72rem',
                        backgroundColor: 'rgba(239, 68, 68, 0.12)',
                        color: 'var(--accent-danger)',
                        padding: '4px 10px',
                        borderRadius: '10px',
                        fontWeight: 700
                      }}>
                        BLOCKED
                      </span>
                    ) : !u.enabled ? (
                      <span style={{
                        fontSize: '0.72rem',
                        backgroundColor: 'rgba(245, 158, 11, 0.12)',
                        color: '#f59e0b',
                        padding: '4px 10px',
                        borderRadius: '10px',
                        fontWeight: 700
                      }}>
                        DEACTIVATED
                      </span>
                    ) : (
                      <span style={{
                        fontSize: '0.72rem',
                        backgroundColor: 'rgba(16, 185, 129, 0.12)',
                        color: 'var(--accent-secondary)',
                        padding: '4px 10px',
                        borderRadius: '10px',
                        fontWeight: 700
                      }}>
                        ACTIVE
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '18px 20px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                      <button
                        onClick={() => handleToggleBlock(u.id)}
                        disabled={u.role === 'ADMIN'}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: u.blocked ? 'var(--accent-secondary)' : 'var(--accent-danger)',
                          cursor: u.role === 'ADMIN' ? 'not-allowed' : 'pointer',
                          padding: '6px',
                          borderRadius: '6px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: u.blocked ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                          opacity: u.role === 'ADMIN' ? 0.3 : 1
                        }}
                        title={u.blocked ? 'Unblock Account' : 'Block Account'}
                      >
                        {u.blocked ? <CheckCircle size={16} /> : <Ban size={16} />}
                      </button>

                      <button
                        onClick={() => handleDelete(u.id)}
                        disabled={u.role === 'ADMIN'}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--accent-danger)',
                          cursor: u.role === 'ADMIN' ? 'not-allowed' : 'pointer',
                          padding: '6px',
                          borderRadius: '6px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: 'rgba(239, 68, 68, 0.08)',
                          opacity: u.role === 'ADMIN' ? 0.3 : 1
                        }}
                        title="Purge Account"
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

export default UserManagement;
