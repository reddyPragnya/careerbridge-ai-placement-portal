import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Briefcase, MapPin, DollarSign, Calendar, SlidersHorizontal, CheckSquare } from 'lucide-react';
import api from '../services/api';

const JobListing = () => {
  const navigate = useNavigate();
  
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search & Filter state
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [sortBy, setSortBy] = useState('');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/student/jobs');
      setJobs(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch job postings.');
    } finally {
      setLoading(false);
    }
  };

  // Filter logic
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.jobTitle.toLowerCase().includes(search.toLowerCase()) || 
                          job.companyName.toLowerCase().includes(search.toLowerCase());
    
    const matchesDept = !deptFilter || 
                        job.eligibilityDepartment.toLowerCase().includes(deptFilter.toLowerCase()) ||
                        job.eligibilityDepartment.equalsIgnoreCase?.('All') || 
                        job.eligibilityDepartment.toLowerCase() === 'all';
    
    const matchesType = !typeFilter || job.jobType === typeFilter;

    return matchesSearch && matchesDept && matchesType;
  });

  // Sort logic
  if (sortBy === 'deadline') {
    filteredJobs.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  } else if (sortBy === 'package') {
    // Basic sorting parsing digits from string package
    const getVal = (str) => {
      const parsed = parseInt(str.replace(/[^0-9]/g, ''));
      return isNaN(parsed) ? 0 : parsed;
    };
    filteredJobs.sort((a, b) => getVal(b.packageDetails) - getVal(a.packageDetails));
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '16px' }}>
        <div className="skeleton" style={{ height: '32px', width: '200px' }}></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="glass-card skeleton" style={{ height: '220px' }}></div>
          <div className="glass-card skeleton" style={{ height: '220px' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'Outfit' }}>Job Board</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Browse current open positions and view AI eligibility checkmarks</p>
      </div>

      {/* Filter Toolbar */}
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
            placeholder="Search by role or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="glass-input"
            style={{ width: '100%', paddingLeft: '38px' }}
          />
        </div>

        <div style={{ flex: 1, minWidth: '140px' }}>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="glass-input"
            style={{ width: '100%', background: 'var(--glass-bg)', cursor: 'pointer' }}
          >
            <option value="">All Departments</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Information Technology">Information Technology</option>
            <option value="Electrical Engineering">Electrical Engineering</option>
            <option value="Mechanical Engineering">Mechanical Engineering</option>
            <option value="Business Administration">Business Administration</option>
          </select>
        </div>

        <div style={{ flex: 1, minWidth: '130px' }}>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="glass-input"
            style={{ width: '100%', background: 'var(--glass-bg)', cursor: 'pointer' }}
          >
            <option value="">All Types</option>
            <option value="Full-Time">Full-Time</option>
            <option value="Internship">Internship</option>
            <option value="Contract">Contract</option>
          </select>
        </div>

        <div style={{ flex: 1, minWidth: '130px' }}>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="glass-input"
            style={{ width: '100%', background: 'var(--glass-bg)', cursor: 'pointer' }}
          >
            <option value="">Sort By</option>
            <option value="deadline">Closest Deadline</option>
            <option value="package">Highest Package</option>
          </select>
        </div>
      </div>

      {error && <div style={{ color: 'var(--accent-danger)' }}>{error}</div>}

      {/* Jobs Grid */}
      {filteredJobs.length === 0 ? (
        <div className="glass-card" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          No jobs found matching your filter criteria.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
          {filteredJobs.map((job) => (
            <div key={job.id} className="glass-card" style={{
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '16px',
              border: '1px solid var(--glass-border)'
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, var(--accent-primary), rgba(99,102,241,0.5))',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      color: '#fff',
                      fontWeight: 'bold',
                      fontSize: '1rem'
                    }}>
                      {job.companyName.charAt(0)}
                    </div>
                    <div>
                      <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>{job.jobTitle}</h4>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{job.companyName}</span>
                    </div>
                  </div>

                  <span style={{
                    fontSize: '0.7rem',
                    backgroundColor: 'rgba(99, 102, 241, 0.12)',
                    color: 'var(--accent-primary)',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    fontWeight: 600
                  }}>
                    {job.jobType}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '14px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={14} />
                    <span>{job.location}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <DollarSign size={14} style={{ color: 'var(--accent-secondary)' }} />
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{job.packageDetails}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={14} />
                    <span>Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
                  </div>
                </div>

                <div style={{ marginTop: '10px' }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>Eligible Majors:</p>
                  <span style={{ fontSize: '0.75rem', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', padding: '2px 8px', borderRadius: '4px' }}>
                    {job.eligibilityDepartment}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', borderTop: '1px solid var(--glass-border)', paddingTop: '16px', marginTop: 'auto' }}>
                <button
                  onClick={() => navigate(`/student/jobs/${job.id}`)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, var(--accent-primary), rgba(99, 102, 241, 0.9))',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 10px rgba(99, 102, 241, 0.2)',
                    textAlign: 'center'
                  }}
                >
                  View Eligibility & Apply
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobListing;
