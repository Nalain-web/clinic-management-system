import { useState, useEffect } from 'react';
import { useAppointments } from '../context/useContextHooks'; 
import { Users, Calendar, Plus, Trash2 } from 'lucide-react';
import AddDoctorForm from './AddDoctorForm';

const AdminPanel = () => {
  // Access global appointments state from context
  const { appointments } = useAppointments();

  // Local state management for the medical directory
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  /**
   * 1. Core Fetch Function
   * Used to load data on mount and refresh listings after staff is onboarded/removed
   */
  const loadDoctorsList = async () => {
    const token = localStorage.getItem('clinic_jwt_token');
    try {
      const response = await fetch('http://localhost:5000/api/auth/doctors', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setDoctors(data);
      }
    } catch (err) {
      console.error('Failed to reload doctors directory:', err);
    }
  };

  /**
   * 2. Component Mount Data Lifecycle
   * Cleanly calls our fetch function when the component loads
   */
  useEffect(() => {
    const initPanel = async () => {
      setLoading(true);
      await loadDoctorsList();
      setLoading(false);
    };
    initPanel();
  }, []); // Empty dependency array ensures this runs exactly once on mount

  /**
   * 3. Handle Staff Deletion
   * 🟢 FIXED: Points to the proper backend route endpoint layout (/api/auth/doctors/:id)
   */
  const handleDeleteClick = async (id, name) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to remove ${name} from the system directory?`
    );

    if (!confirmDelete) return;

    setDeletingId(id);
    const token = localStorage.getItem('clinic_jwt_token');
    
    try {
      const response = await fetch(`http://localhost:5000/api/auth/doctors/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        // Instantly update UI layout state by removing the deleted doctor record
        setDoctors(prevDoctors => prevDoctors.filter(doc => doc.id !== id));
      } else {
        const errorData = await response.json();
        alert(errorData.message || `Failed to remove ${name}.`);
      }
    } catch (err) {
      console.error('Network failure trying to delete record:', err);
      alert('A network connection error prevented deleting this record.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Overview Statistics Row */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--primary-muted)', color: 'var(--primary-light)' }}>
            <Users size={20} />
          </div>
          <div>
            <div className="stat-value">{loading ? '...' : doctors.length}</div>
            <div className="stat-label">Active Doctors</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6' }}>
            <Calendar size={20} />
          </div>
          <div>
            <div className="stat-value">{appointments?.length || 0}</div>
            <div className="stat-label">Total Appointments</div>
          </div>
        </div>
      </div>

      {/* Control Toolbar */}
      <div className="toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Medical Directory</h3>
        <button type="button" className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>
          <Plus size={14} /> Onboard Staff
        </button>
      </div>

      {/* Directory Data Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Practitioner Name</th>
              <th>Specialty</th>
              <th>Experience</th>
              <th>Status</th>
              <th style={{ textAlign: 'right', paddingRight: '20px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                  Loading clinical directories...
                </td>
              </tr>
            ) : doctors.length > 0 ? (
              doctors.map((doc) => (
                <tr key={doc.id} style={{ opacity: deletingId === doc.id ? 0.5 : 1 }}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{doc.name}</td>
                  <td>{doc.specialty || 'General Practitioner'}</td>
                  <td>{doc.experience || 'N/A'}</td>
                  <td>
                    <span className="badge badge-green">{doc.status || 'Active'}</span>
                  </td>
                  <td style={{ textAlign: 'right', paddingRight: '16px' }}>
                    <button
                      type="button"
                      disabled={deletingId !== null}
                      onClick={() => handleDeleteClick(doc.id, doc.name)}
                      className="btn btn-ghost btn-sm btn-icon"
                      style={{ color: 'var(--danger)', padding: '6px', borderRadius: '6px' }}
                      title={`Remove ${doc.name}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                  No medical professionals registered in database directory.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Onboarding Form Modal Popup */}
      {showAddModal && (
        <AddDoctorForm 
          onClose={() => setShowAddModal(false)} 
          onSuccess={loadDoctorsList} 
        />
      )}
    </div>
  );
};

export default AdminPanel;