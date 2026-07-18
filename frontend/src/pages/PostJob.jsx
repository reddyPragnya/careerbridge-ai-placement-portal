import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PlusCircle, Save, Briefcase, Sliders, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

const PostJob = () => {
  const { id } = useParams(); // Used if editing
  const navigate = useNavigate();

  const [form, setForm] = useState({
    jobTitle: '',
    packageDetails: '',
    location: '',
    jobType: 'Full-Time',
    eligibilityCgpa: 6.0,
    eligibilityDepartment: 'Computer Science, Information Technology',
    eligibilityGraduationYear: 2026,
    requiredSkills: '',
    deadline: '',
    description: ''
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      fetchJobToEdit();
    }
  }, [id]);

  const fetchJobToEdit = async () => {
    setFetching(true);
    try {
      const res = await api.get('/recruiter/jobs');
      const jobToEdit = res.data.find(j => j.id.toString() === id);
      if (jobToEdit) {
        // Format LocalDateTime to YYYY-MM-DDTHH:MM for HTML input
        let formattedDate = '';
        if (jobToEdit.deadline) {
          formattedDate = jobToEdit.deadline.substring(0, 16);
        }
        setForm({
          ...jobToEdit,
          deadline: formattedDate
        });
      } else {
        setError('Job posting to edit not found.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch job posting details.');
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (id) {
        await api.put(`/recruiter/jobs/${id}`, form);
        setSuccess('Job vacancy modified successfully!');
      } else {
        await api.post('/recruiter/jobs', form);
        setSuccess('New job vacancy published successfully!');
      }
      setTimeout(() => {
        navigate('/recruiter/jobs');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data || 'Failed to submit job posting.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '16px' }}>
        <div className="skeleton" style={{ height: '32px', width: '200px' }}></div>
        <div className="glass-card skeleton" style={{ height: '300px' }}></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '900px' }}>
      <div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'Outfit' }}>
          {id ? 'Modify Job Vacancy' : 'Publish New Job Vacancy'}
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          {id ? 'Update placement selection details' : 'Post details, requirements, and deadlines for placement selections'}
        </p>
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

      <form onSubmit={handleSubmit} className="glass-card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Basic Fields */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', gridColumn: '1 / span 2' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Job Title</label>
            <input
              type="text"
              name="jobTitle"
              value={form.jobTitle}
              onChange={handleChange}
              placeholder="e.g. Software Engineer (Frontend)"
              className="glass-input"
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Job Type</label>
            <select
              name="jobType"
              value={form.jobType}
              onChange={handleChange}
              className="glass-input"
              style={{ background: 'var(--glass-bg)' }}
            >
              <option value="Full-Time">Full-Time</option>
              <option value="Internship">Internship</option>
              <option value="Contract">Contract</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Annual Package Details</label>
            <input
              type="text"
              name="packageDetails"
              value={form.packageDetails}
              onChange={handleChange}
              placeholder="e.g. $120,000 / year or 12 LPA"
              className="glass-input"
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Location</label>
            <input
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="e.g. Silicon Valley, CA or Remote"
              className="glass-input"
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Application Deadline</label>
            <input
              type="datetime-local"
              name="deadline"
              value={form.deadline}
              onChange={handleChange}
              className="glass-input"
              required
            />
          </div>
        </div>

        {/* AI Eligibility Thresholds */}
        <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '20px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sliders size={16} style={{ color: 'var(--accent-primary)' }} /> AI Eligibility Cutoffs
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Minimum CGPA Cutoff</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                name="eligibilityCgpa"
                value={form.eligibilityCgpa}
                onChange={handleChange}
                className="glass-input"
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Target Graduation Year</label>
              <input
                type="number"
                name="eligibilityGraduationYear"
                value={form.eligibilityGraduationYear}
                onChange={handleChange}
                className="glass-input"
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', gridColumn: '1 / span 2' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Allowed Departments (Comma-separated or 'All')</label>
              <input
                type="text"
                name="eligibilityDepartment"
                value={form.eligibilityDepartment}
                onChange={handleChange}
                placeholder="e.g. Computer Science, Information Technology"
                className="glass-input"
                required
              />
            </div>
          </div>
        </div>

        {/* Text descriptions */}
        <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Required Technical Skills (Comma-separated)</label>
            <input
              type="text"
              name="requiredSkills"
              value={form.requiredSkills}
              onChange={handleChange}
              placeholder="React, Javascript, Node.js, REST APIs"
              className="glass-input"
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Job Description & Responsibilities</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Detail job roles, company environment details, and selection steps..."
              className="glass-input"
              style={{ minHeight: '150px', resize: 'vertical' }}
              required
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--glass-border)', paddingTop: '20px' }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(135deg, var(--accent-primary), rgba(99, 102, 241, 0.9))',
              color: '#fff',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)'
            }}
          >
            <Save size={18} />
            {loading ? 'Submitting...' : id ? 'Update Vacancy' : 'Publish Vacancy'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostJob;
