import { useState, useEffect } from 'react';
import { STATUS, ROLES } from '../context/AuthTypes';
import { useAppointments } from '../context/useContextHooks';
import { Calendar, Clock, User, Check, X, Trash2, Search, Filter, ChevronLeft, ChevronRight, Pencil } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AppointmentForm from './AppointmentForm';

const ITEMS_PER_PAGE = 6;

const STATUS_STYLES = {
  [STATUS.PENDING]:   'badge-amber',
  [STATUS.CONFIRMED]: 'badge-blue',
  [STATUS.COMPLETED]: 'badge-green',
  [STATUS.CANCELLED]: 'badge-red',
};

const AppointmentList = () => {
  const { 
    appointments = [], 
    updateAppointmentStatus, 
    deleteAppointment, 
    user, 
    authLoading, 
    fetchAppointments 
  } = useAppointments();

  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editTarget, setEditTarget] = useState(null);

  // Sync state data on component load automatically
  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user, fetchAppointments]);

  // Handle action state changes cleanly
  const handleStatusChange = async (id, nextStatus) => {
    if (typeof updateAppointmentStatus === 'function') {
      await updateAppointmentStatus(id, nextStatus);
    }
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm('Are you sure you want to delete this appointment record permanently?')) {
      if (typeof deleteAppointment === 'function') {
        await deleteAppointment(id);
      }
    }
  };

  /**
   * Robust, Fallback-Aware Role Filtering Logic
   * Safely captures doctorName and patientName regardless of capitalization or underscores.
   */
  const visible = appointments.filter(a => {
    if (!user) return false;
    
    const cleanUser = user.name?.trim().toLowerCase() || '';
    const docName = (a.doctorName || a.doctor_name || a.doctorname || '').trim().toLowerCase();
    const patName = (a.patientName || a.patient_name || a.patientname || '').trim().toLowerCase();
    const pId = a.patientId || a.patient_id;
    
    if (user.role === ROLES.DOCTOR) {
      return docName.includes(cleanUser) || cleanUser.includes(docName);
    }
    if (user.role === ROLES.PATIENT) {
      return patName === cleanUser || (pId && String(pId) === String(user.id));
    }
    return true; // Admins view all records across the system
  });

  // Apply search query constraints
  const filtered = visible.filter(a => {
    const currentStatus = (a.status || '').toUpperCase();
    const matchStatus = filter === 'ALL' || currentStatus === filter.toUpperCase();
    
    const q = search.toLowerCase();
    const docName = (a.doctorName || a.doctor_name || a.doctorname || '').toLowerCase();
    const patName = (a.patientName || a.patient_name || a.patientname || '').toLowerCase();
    const reasonStr = (a.reason || '').toLowerCase();

    const matchSearch = patName.includes(q) || docName.includes(q) || reasonStr.includes(q);
    return matchStatus && matchSearch;
  });

  // Pagination Math Layouts
  const totalPages  = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage    = Math.min(currentPage, totalPages);
  const currentItems = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  const handleFilter = (val) => { setFilter(val); setCurrentPage(1); };
  const handleSearch = (val) => { setSearch(val); setCurrentPage(1); };

  // Permission Logic Rules
  const canConfirm  = (a) => user?.role !== ROLES.PATIENT && (a.status || '').toUpperCase() === STATUS.PENDING;
  const canComplete = (a) => user?.role === ROLES.DOCTOR   && (a.status || '').toUpperCase() === STATUS.CONFIRMED;
  const canCancel   = (a) => (a.status || '').toUpperCase() !== STATUS.CANCELLED && (a.status || '').toUpperCase() !== STATUS.COMPLETED;
  const canEdit     = (a) => user?.role === ROLES.PATIENT   && (a.status || '').toUpperCase() === STATUS.PENDING;
  const canDelete   = () => user?.role === ROLES.ADMIN; // 🟢 FIXED: Corrected syntax token arrow conversion loop

  if (authLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px', color: 'var(--text-muted)' }}>
        Loading session...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="empty-state">
        <User size={32} />
        <div className="empty-title">Access Denied</div>
        <div className="empty-desc">Please log into the clinical system to view your appointments.</div>
      </div>
    );
  }

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Filter and Search Layout Rows */}
        <div className="toolbar">
          <div className="filter-tabs">
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginRight: '8px' }}>
              <Filter size={14} /> Filter
            </span>
            {['ALL', ...Object.values(STATUS)].map(s => (
              <button
                key={s}
                type="button"
                onClick={() => handleFilter(s)}
                className={`filter-tab ${filter === s ? 'active' : ''}`}
              >
                {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          <div className="search-field">
            <Search size={14} />
            <input
              type="text"
              placeholder="Search by name or reason..."
              value={search}
              onChange={e => handleSearch(e.target.value)}
            />
          </div>
        </div>

        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
          Showing <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{filtered.length}</span> {filtered.length === 1 ? 'appointment' : 'appointments'}
        </p>

        {/* Appointment Cards Display Grids */}
        <div className="appt-grid">
          <AnimatePresence mode="popLayout">
            {currentItems.length > 0 ? currentItems.map((app, i) => {
              const currentStatus = (app.status || 'PENDING').toUpperCase();
              const displayDoctor = app.doctorName || app.doctor_name || app.doctorname || 'Assigned Specialist';
              const displayPatient = app.patientName || app.patient_name || app.patientname || 'Clinical Patient';
              const displayDate = app.date || app.appointment_date || 'N/A';
              const displayTime = app.time || app.appointment_time || 'N/A';

              return (
                <motion.div
                  key={app.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ delay: i * 0.03 }}
                  className="appt-card"
                >
                  <div className="appt-header">
                    <div className="appt-info">
                      <div className="appt-avatar">
                        <User size={18} />
                      </div>
                      <div>
                        <div className="appt-name">
                          {user.role === ROLES.PATIENT ? displayDoctor : displayPatient}
                        </div>
                        {user.role === ROLES.ADMIN && (
                          <div className="appt-sub" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '2px' }}>
                            Assigned: {displayDoctor}
                          </div>
                        )}
                        <div className="appt-reason">{app.reason}</div>
                      </div>
                    </div>
                    <span className={`badge ${STATUS_STYLES[currentStatus] || 'badge-muted'}`}>
                      {currentStatus.charAt(0) + currentStatus.slice(1).toLowerCase()}
                    </span>
                  </div>

                  <div className="appt-meta">
                    <div className="appt-meta-item">
                      <Calendar size={14} />
                      <span>{displayDate}</span>
                    </div>
                    <div className="appt-meta-item">
                      <Clock size={14} />
                      <span>{displayTime}</span>
                    </div>
                  </div>

                  <div className="appt-actions">
                    {canEdit(app) && (
                      <button type="button" onClick={() => setEditTarget(app)} className="btn btn-ghost btn-sm">
                        <Pencil size={12} /> Edit
                      </button>
                    )}
                    {canConfirm(app) && (
                      <button type="button" onClick={() => handleStatusChange(app.id, STATUS.CONFIRMED)} className="btn btn-success btn-sm">
                        <Check size={12} /> Confirm
                      </button>
                    )}
                    {canComplete(app) && (
                      <button type="button" onClick={() => handleStatusChange(app.id, STATUS.COMPLETED)} className="btn btn-info btn-sm">
                        <Check size={12} /> Complete
                      </button>
                    )}
                    {canCancel(app) && (
                      <button type="button" onClick={() => handleStatusChange(app.id, STATUS.CANCELLED)} className="btn btn-danger btn-sm">
                        <X size={12} /> Cancel
                      </button>
                    )}
                    {canDelete() && (
                      <button type="button" onClick={() => handleDeleteClick(app.id)} className="btn btn-ghost btn-sm btn-icon" style={{ color: 'var(--danger)' }} title="Delete Record">
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            }) : (
              <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                <Calendar size={32} />
                <div className="empty-title">No Appointments Found</div>
                <div className="empty-desc">Try adjusting your tracking filter parameters or clear your search input field.</div>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Navigation Controls */}
        {totalPages > 1 && (
          <div className="pagination">
            <button type="button" disabled={safePage === 1} onClick={() => setCurrentPage(p => p - 1)} className="page-btn">
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => (
              <button key={i} type="button" onClick={() => setCurrentPage(i + 1)} className={`page-btn ${safePage === i + 1 ? 'active' : ''}`}>
                {i + 1}
              </button>
            ))}

            <button type="button" disabled={safePage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="page-btn">
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {editTarget && (
          <AppointmentForm existing={editTarget} onClose={() => setEditTarget(null)} />
        )}
      </AnimatePresence>
    </>
  );
};

export default AppointmentList;