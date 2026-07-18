import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, User, FileText, Briefcase, 
  Send, Compass, Building, PlusCircle, Users, 
  ShieldAlert, UserCheck
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();
  if (!user) return null;

  const links = {
    STUDENT: [
      { path: '/student', name: 'Dashboard', icon: <LayoutDashboard size={18} /> },
      { path: '/student/profile', name: 'My Profile', icon: <User size={18} /> },
      { path: '/student/resume', name: 'AI Resume Review', icon: <FileText size={18} /> },
      { path: '/student/jobs', name: 'Job Board', icon: <Briefcase size={18} /> },
      { path: '/student/applications', name: 'My Applications', icon: <Send size={18} /> },
      { path: '/student/recommendations', name: 'Career Path', icon: <Compass size={18} /> },
    ],
    RECRUITER: [
      { path: '/recruiter', name: 'Dashboard', icon: <LayoutDashboard size={18} /> },
      { path: '/recruiter/profile', name: 'Company Profile', icon: <Building size={18} /> },
      { path: '/recruiter/post-job', name: 'Post New Job', icon: <PlusCircle size={18} /> },
      { path: '/recruiter/jobs', name: 'Manage Jobs', icon: <Briefcase size={18} /> },
      { path: '/recruiter/applicants', name: 'Applicants', icon: <Users size={18} /> },
    ],
    ADMIN: [
      { path: '/admin', name: 'System Analytics', icon: <LayoutDashboard size={18} /> },
      { path: '/admin/users', name: 'Manage Users', icon: <Users size={18} /> },
      { path: '/admin/approvals', name: 'Recruiter Approvals', icon: <UserCheck size={18} /> },
    ]
  };

  const currentLinks = links[user.role] || [];

  return (
    <div className="glass-panel" style={{
      width: '260px',
      minHeight: 'calc(100vh - 120px)',
      borderRadius: '16px',
      padding: '24px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      position: 'sticky',
      top: '94px'
    }}>
      <div style={{ padding: '0 8px 16px 8px', borderBottom: '1px solid var(--glass-border)', marginBottom: '16px' }}>
        <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Navigation Portal
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
        {currentLinks.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            end={link.path === '/student' || link.path === '/recruiter' || link.path === '/admin'}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '10px',
              color: isActive ? '#fff' : 'var(--text-primary)',
              background: isActive ? 'linear-gradient(135deg, var(--accent-primary), rgba(99, 102, 241, 0.8))' : 'transparent',
              textDecoration: 'none',
              fontWeight: isActive ? 600 : 500,
              fontSize: '0.92rem',
              transition: 'all 0.2s ease',
              boxShadow: isActive ? '0 4px 12px rgba(99, 102, 241, 0.2)' : 'none'
            })}
            onMouseEnter={(e) => {
              const bg = e.currentTarget.style.background;
              if (!bg.includes('var(--accent-primary)')) {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.transform = 'translateX(4px)';
              }
            }}
            onMouseLeave={(e) => {
              const bg = e.currentTarget.style.background;
              if (!bg.includes('var(--accent-primary)')) {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.transform = 'translateX(0)';
              }
            }}
          >
            {link.icon}
            <span>{link.name}</span>
          </NavLink>
        ))}
      </div>

      <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--glass-border)', fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
        <p>&copy; 2026 CareerBridge AI</p>
      </div>
    </div>
  );
};

export default Sidebar;
