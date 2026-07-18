import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Building, Phone, Save, GraduationCap, MapPin, Award, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

const Profile = () => {
  const { user, updateUserProfileName, logout } = useAuth();
  
  const [studentProfile, setStudentProfile] = useState({
    fullName: '',
    department: 'Computer Science',
    graduationYear: 2026,
    cgpa: 0.0,
    skills: '',
    contactNumber: '',
    academicDetails: '',
    profilePicUrl: ''
  });

  const [recruiterProfile, setRecruiterProfile] = useState({
    companyName: '',
    companyWebsite: '',
    companyLogoUrl: '',
    contactNumber: '',
    description: ''
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [deactivating, setDeactivating] = useState(false);

  const handleDeactivate = async () => {
    setDeactivating(true);
    try {
      const endpoint = user.role === 'STUDENT' ? '/student/deactivate' : '/recruiter/deactivate';
      await api.post(endpoint);
      logout();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to deactivate account.');
      setShowDeactivateModal(false);
    } finally {
      setDeactivating(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      if (user.role === 'STUDENT') {
        const res = await api.get('/student/profile');
        setStudentProfile(res.data);
      } else if (user.role === 'RECRUITER') {
        const res = await api.get('/recruiter/profile');
        setRecruiterProfile(res.data);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load profile details.');
    } finally {
      setLoading(false);
    }
  };

  const handleStudentChange = (e) => {
    const { name, value } = e.target;
    setStudentProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleRecruiterChange = (e) => {
    const { name, value } = e.target;
    setRecruiterProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess('');
    setError('');

    try {
      if (user.role === 'STUDENT') {
        const res = await api.put('/student/profile', studentProfile);
        setStudentProfile(res.data);
        updateUserProfileName(res.data.fullName);
      } else if (user.role === 'RECRUITER') {
        const res = await api.put('/recruiter/profile', recruiterProfile);
        setRecruiterProfile(res.data);
        updateUserProfileName(res.data.companyName);
      }
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '16px' }}>
        <div className="skeleton" style={{ height: '24px', width: '150px' }}></div>
        <div className="glass-card skeleton" style={{ height: '300px' }}></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'Outfit' }}>Profile Management</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Update your placement portal directory details</p>
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
        {user.role === 'STUDENT' ? (
          /* STUDENT FORM */
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ gridColumn: '1 / span 2', display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '10px' }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: '#fff',
                fontSize: '2rem',
                fontWeight: 'bold',
                boxShadow: '0 6px 16px rgba(0,0,0,0.1)'
              }}>
                {studentProfile.fullName ? studentProfile.fullName.charAt(0) : 'S'}
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{studentProfile.fullName}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Student Profile Account</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Full Name</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <User size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-secondary)' }} />
                <input
                  type="text"
                  name="fullName"
                  value={studentProfile.fullName}
                  onChange={handleStudentChange}
                  className="glass-input"
                  style={{ width: '100%', paddingLeft: '38px' }}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Contact Number</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Phone size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-secondary)' }} />
                <input
                  type="text"
                  name="contactNumber"
                  value={studentProfile.contactNumber || ''}
                  onChange={handleStudentChange}
                  className="glass-input"
                  placeholder="+1 (555) 019-2834"
                  style={{ width: '100%', paddingLeft: '38px' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Department</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <GraduationCap size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-secondary)' }} />
                <select
                  name="department"
                  value={studentProfile.department}
                  onChange={handleStudentChange}
                  className="glass-input"
                  style={{ width: '100%', paddingLeft: '38px', appearance: 'none', background: 'var(--glass-bg)' }}
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electrical Engineering">Electrical Engineering</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                  <option value="Business Administration">Business Administration</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Graduation Year</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Award size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-secondary)' }} />
                <input
                  type="number"
                  name="graduationYear"
                  value={studentProfile.graduationYear}
                  onChange={handleStudentChange}
                  className="glass-input"
                  style={{ width: '100%', paddingLeft: '38px' }}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Cumulative GPA (CGPA)</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Award size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-secondary)' }} />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  name="cgpa"
                  value={studentProfile.cgpa}
                  onChange={handleStudentChange}
                  className="glass-input"
                  style={{ width: '100%', paddingLeft: '38px' }}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Profile Image URL</label>
              <input
                type="text"
                name="profilePicUrl"
                value={studentProfile.profilePicUrl || ''}
                onChange={handleStudentChange}
                className="glass-input"
                placeholder="https://example.com/avatar.jpg"
              />
            </div>

            <div style={{ gridColumn: '1 / span 2', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Skills (Comma-separated)</label>
              <textarea
                name="skills"
                value={studentProfile.skills || ''}
                onChange={handleStudentChange}
                className="glass-input"
                placeholder="React, Java, Spring Boot, MySQL, REST APIs, Python"
                style={{ width: '100%', minHeight: '80px', resize: 'vertical' }}
              />
            </div>

            <div style={{ gridColumn: '1 / span 2', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Academic details & Projects summary</label>
              <textarea
                name="academicDetails"
                value={studentProfile.academicDetails || ''}
                onChange={handleStudentChange}
                className="glass-input"
                placeholder="Brief summary of your college projects, history, and coursework details."
                style={{ width: '100%', minHeight: '120px', resize: 'vertical' }}
              />
            </div>
          </div>
        ) : (
          /* RECRUITER FORM */
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ gridColumn: '1 / span 2', display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '10px' }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: '#fff',
                fontSize: '2rem',
                fontWeight: 'bold',
                boxShadow: '0 6px 16px rgba(0,0,0,0.1)'
              }}>
                {recruiterProfile.companyName ? recruiterProfile.companyName.charAt(0) : 'C'}
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{recruiterProfile.companyName}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Company Recruiter Profile</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Company Name</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Building size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-secondary)' }} />
                <input
                  type="text"
                  name="companyName"
                  value={recruiterProfile.companyName}
                  onChange={handleRecruiterChange}
                  className="glass-input"
                  style={{ width: '100%', paddingLeft: '38px' }}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Company Website</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <MapPin size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-secondary)' }} />
                <input
                  type="url"
                  name="companyWebsite"
                  value={recruiterProfile.companyWebsite || ''}
                  onChange={handleRecruiterChange}
                  className="glass-input"
                  placeholder="https://company.com"
                  style={{ width: '100%', paddingLeft: '38px' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Contact Number</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Phone size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-secondary)' }} />
                <input
                  type="text"
                  name="contactNumber"
                  value={recruiterProfile.contactNumber || ''}
                  onChange={handleRecruiterChange}
                  className="glass-input"
                  placeholder="+1 (555) 091-2384"
                  style={{ width: '100%', paddingLeft: '38px' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Logo Image URL</label>
              <input
                type="text"
                name="companyLogoUrl"
                value={recruiterProfile.companyLogoUrl || ''}
                onChange={handleRecruiterChange}
                className="glass-input"
                placeholder="https://example.com/logo.png"
              />
            </div>

            <div style={{ gridColumn: '1 / span 2', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Company Overview</label>
              <textarea
                name="description"
                value={recruiterProfile.description || ''}
                onChange={handleRecruiterChange}
                className="glass-input"
                placeholder="Describe your company, industries of work, culture, and requirements."
                style={{ width: '100%', minHeight: '120px', resize: 'vertical' }}
              />
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(135deg, var(--accent-primary), rgba(99, 102, 241, 0.9))',
              color: '#fff',
              fontWeight: 600,
              cursor: saving ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)'
            }}
          >
            <Save size={18} />
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>

      {/* Danger Zone Section */}
      <div className="glass-card animate-fade-in" style={{
        padding: '32px',
        border: '1px solid rgba(239, 68, 68, 0.2)',
        backgroundColor: 'rgba(239, 68, 68, 0.01)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        marginTop: '12px'
      }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-danger)' }}>Danger Zone</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '2px' }}>
            Temporarily freeze or suspend your campus placement registration
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '500px', margin: 0, lineHeight: 1.4 }}>
            Deactivating your account will hide your profile from recruiter search lists, close your public postings, and sign you out of the platform. You can restore your data and reactivate at any time by simply logging back in with your credentials.
          </p>
          <button
            type="button"
            onClick={() => setShowDeactivateModal(true)}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: '1px solid var(--accent-danger)',
              background: 'transparent',
              color: 'var(--accent-danger)',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.05)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            Deactivate Account
          </button>
        </div>
      </div>

      {/* Deactivate Confirmation Modal */}
      {showDeactivateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div className="glass-card animate-scale-up" style={{
            maxWidth: '440px',
            width: '100%',
            padding: '32px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-danger)' }}>Deactivate Account?</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '6px', lineHeight: 1.4 }}>
                Are you absolutely sure you want to deactivate your placement profile? This will log you out and hide your active records. You can reactivate anytime by logging back in.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleDeactivate}
                disabled={deactivating}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'var(--accent-danger)',
                  color: '#fff',
                  fontWeight: 600,
                  cursor: deactivating ? 'not-allowed' : 'pointer'
                }}
              >
                {deactivating ? 'Deactivating...' : 'Confirm Deactivate'}
              </button>
              <button
                onClick={() => setShowDeactivateModal(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  background: 'transparent',
                  color: 'var(--text-primary)',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
