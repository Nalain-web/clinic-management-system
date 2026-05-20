import { useState, useEffect } from 'react'; // 🟢 FIXED: Added missing useEffect import for state sync
import { useAuth, useAppointments } from '../context/useContextHooks'; 
import { ROLES, STATUS } from '../context/AuthTypes'; 
import {
  LayoutDashboard,
  Calendar,
  Shield,
  Settings,
  LogOut,
  Search,
  Bell,
  Plus,
  Stethoscope,
  TrendingUp,
  CheckCircle2,
  Clock,
  Menu,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AppointmentList from './AppointmentList';
import AppointmentForm from './AppointmentForm';
import AdminPanel from './AdminPanel';

const Dashboard = () => {
  const { user, logout } = useAuth();
  // 🟢 FIXED: Added fetchAppointments to refresh data in real-time
  const { appointments = [], fetchAppointments } = useAppointments(); 
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  /**
   * 🟢 FIXED: Master Synchronization Lifecycle Hook
   * Pulls the latest records from the server when mounting, or when switching views.
   */
  useEffect(() => {
    if (user && typeof fetchAppointments === 'function') {
      fetchAppointments();
    }
  }, [user, activeTab, fetchAppointments]);

  /**
   * 🟢 FIXED: Fallback-Aware Filtering Matrix
   * Safely checks all spelling formats and runs string operations safely
   */
  const myAppointments = appointments.filter(a => {
    if (!user) return false;
    
    const docIdentifier = (a.doctorName || a.doctor_name || a.doctorname || '').trim().toLowerCase();
    const patIdentifier = (a.patientName || a.patient_name || a.patientname || '').trim().toLowerCase();
    const cleanUser = (user.name || '').trim().toLowerCase();
    const pId = a.patientId || a.patient_id;

    if (user.role === ROLES.DOCTOR) {
      return docIdentifier.includes(cleanUser) || cleanUser.includes(docIdentifier);
    }
    if (user.role === ROLES.PATIENT) {
      return patIdentifier === cleanUser || (pId && String(pId) === String(user.id));
    }
    return true; // Admins view all statistics
  });

  // 🟢 FIXED: Converted status values to uppercase for exact match against context types
  const stats = {
    total:     myAppointments.length,
    pending:   myAppointments.filter(a => (a.status || '').toUpperCase() === STATUS.PENDING).length,
    confirmed: myAppointments.filter(a => (a.status || '').toUpperCase() === STATUS.CONFIRMED).length,
    completed: myAppointments.filter(a => (a.status || '').toUpperCase() === STATUS.COMPLETED).length,
  };

  const getStatCards = () => {
    if (!user) return [];
    if (user.role === ROLES.PATIENT) return [
      { title: 'My Appointments', value: stats.total,     icon: Calendar,     bgColor: 'var(--primary-muted)',  textColor: 'var(--primary-light)',  desc: 'Total booked'          },
      { title: 'Pending',         value: stats.pending,   icon: Clock,        bgColor: 'var(--warning-muted)',  textColor: 'var(--warning)',        desc: 'Awaiting confirmation' },
      { title: 'Completed',       value: stats.completed, icon: CheckCircle2, bgColor: 'var(--success-muted)',  textColor: 'var(--success)',        desc: 'Successfully done'     },
    ];
    if (user.role === ROLES.DOCTOR) return [
      { title: "Today's Queue",   value: stats.confirmed, icon: Clock,        bgColor: 'var(--warning-muted)',  textColor: 'var(--warning)',        desc: 'Confirmed visits'      },
      { title: 'Completed',       value: stats.completed, icon: CheckCircle2, bgColor: 'var(--success-muted)',  textColor: 'var(--success)',        desc: 'This period'           },
      { title: 'Pending Review',  value: stats.pending,   icon: TrendingUp,   bgColor: 'var(--primary-muted)',  textColor: 'var(--primary-light)',  desc: 'Need confirmation'     },
    ];
    return [
      { title: 'Total Appointments', value: stats.total,     icon: Calendar,     bgColor: 'var(--primary-muted)',  textColor: 'var(--primary-light)',  desc: 'System-wide'           },
      { title: 'Active Queue',        value: stats.pending,   icon: Clock,        bgColor: 'var(--warning-muted)',  textColor: 'var(--warning)',        desc: 'Pending confirmation'  },
      { title: 'Completed',           value: stats.completed, icon: CheckCircle2, bgColor: 'var(--success-muted)',  textColor: 'var(--success)',        desc: 'Successfully closed'   },
    ];
  };

  const menuItems = [
    { id: 'dashboard',    label: 'Dashboard',  icon: LayoutDashboard },
    { id: 'appointments', label: 'Appointments', icon: Calendar       },
    ...(user?.role === ROLES.ADMIN  ? [{ id: 'admin',    label: 'Admin Panel', icon: Shield }] : []),
    { id: 'settings',     label: 'Settings',   icon: Settings        },
  ];

  const pageTitle = () => {
    if (activeTab === 'dashboard')    return `Welcome back, ${user?.name || 'User'}`;
    if (activeTab === 'appointments') return 'Appointments Overview';
    if (activeTab === 'admin')        return 'Admin Panel Console';
    return 'Account Settings';
  };

  const pageSubtitle = () => {
    if (activeTab === 'dashboard')    return 'Here is a summary of your clinic activities.';
    if (activeTab === 'appointments') return 'Manage and track your appointments.';
    if (activeTab === 'admin')        return 'System overview and management controls.';
    return 'Manage your account preferences.';
  };

  if (!user) return null; 

  return (
    <div className="app-shell">
      <aside className={`sidebar ${!isSidebarOpen ? 'mini' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-icon">
            <Stethoscope size={16} style={{ color: '#fff' }} />
          </div>
          {isSidebarOpen && <span className="logo-text">MediBooking</span>}
        </div>

        <nav className="sidebar-nav">
          {menuItems.map(item => {
            const isSelected = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`nav-item ${isSelected ? 'active' : ''}`}
              >
                <item.icon size={18} />
                {isSidebarOpen && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          {isSidebarOpen && (
            <div className="sidebar-user">
              <div className="s-avatar">{user.name[0].toUpperCase()}</div>
              <div style={{ overflow: 'hidden' }}>
                <div className="s-user-name">{user.name}</div>
                <div className="s-user-role">{user.role}</div>
              </div>
            </div>
          )}
          <button onClick={logout} className="nav-item" style={{ color: 'var(--danger)' }}>
            <LogOut size={18} />
            {isSidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button onClick={() => setIsSidebarOpen(s => !s)} className="icon-btn">
              <Menu size={18} />
            </button>
            <div className="search-wrap">
              <Search size={16} style={{ color: 'var(--text-muted)' }} />
              <input type="text" placeholder="Search parameters..." />
            </div>
          </div>

          <div className="topbar-right">
            <button className="icon-btn">
              <Bell size={18} />
              {stats.pending > 0 && <span className="notif-dot" />}
            </button>

            <div className="topbar-user">
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span className="tb-user-name">{user.name}</span>
                <span className="tb-user-role">{user.role}</span>
              </div>
              <div className="tb-avatar">
                {user.name[0].toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <main className="page-content">
          <div className="page-header">
            <div>
              <h1 className="page-title">{pageTitle()}</h1>
              <p className="page-subtitle">{pageSubtitle()}</p>
            </div>
            {(user.role === ROLES.PATIENT || user.role === ROLES.ADMIN) && activeTab !== 'settings' && (
              <button onClick={() => setShowBookingForm(true)} className="btn btn-primary">
                <Plus size={16} /> New Appointment
              </button>
            )}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              {activeTab === 'dashboard' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                  <section className="stats-grid">
                    {getStatCards().map((card, i) => (
                      <div className="stat-card" key={i}>
                        <div className="stat-icon" style={{ backgroundColor: card.bgColor, color: card.textColor }}>
                          <card.icon size={18} />
                        </div>
                        <div className="stat-value">{card.value}</div>
                        <div className="stat-label">{card.title}</div>
                        <div className="stat-desc">{card.desc}</div>
                      </div>
                    ))}
                  </section>
                  
                  <div>
                    <h2 className="section-label">Recent Patient Schedule Backlog</h2>
                    <AppointmentList />
                  </div>
                </div>
              )}

              {activeTab === 'appointments' && <AppointmentList />}
              {activeTab === 'admin' && user.role === ROLES.ADMIN && <AdminPanel />}
              
              {activeTab === 'settings' && (
                <div className="card card-p-lg" style={{ maxWidth: '560px' }}>
                  <h3 className="page-title" style={{ marginBottom: '20px', fontSize: '1.15rem' }}>Account Configurations</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="form-group">
                      <label className="form-label">Profile Identifier Name</label>
                      <input type="text" className="form-control" value={user.name} disabled />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Authorized Scope Level</label>
                      <input type="text" className="form-control" value={user.role} disabled />
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <AnimatePresence>
        {showBookingForm && <AppointmentForm onClose={() => setShowBookingForm(false)} />}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;