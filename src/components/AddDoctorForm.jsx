// frontend/src/components/AddDoctorForm.jsx
import { useState } from 'react';
import { X, UserPlus, ChevronRight, KeyRound } from 'lucide-react';
import { motion } from 'framer-motion';

const AddDoctorForm = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    specialty: 'General Physician',
    experience: '',
    username: '',
    password: '',
  });
  const [err, setErr] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    
    if (!formData.name.trim() || !formData.experience.trim() || !formData.username.trim() || !formData.password) return;
    
    setSubmitting(true);

    // Format fields smoothly before sending down the wire
    const finalName = `Dr. ${formData.name.replace(/^Dr\.\s*/i, '')}`;
    const finalExperience = `${formData.experience.replace(/\s*years/i, '')} Years`;

    try {
      // 🟢 Fix: Execute a clear, raw fetch request to the Auth registration path 
      // instead of referencing a non-existent context function.
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username.trim(),
          password: formData.password,
          name: `${finalName} (${formData.specialty} - ${finalExperience})`,
          role: 'DOCTOR' // 🟢 Tells authController exactly how to set up the DB permissions row
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to onboard professional.');
      }
      
      onClose(); // 🟢 Success! Close the modal out cleanly.
   } catch (error) {
      console.error("Staff Onboarding Network Error:", error);
      setErr(error.message || 'A network connection failure occurred.');
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="modal-card" style={{ maxWidth: '480px', width: '100%' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="role-icon" style={{ padding: '8px', background: 'var(--primary-muted)', color: 'var(--primary-light)' }}><UserPlus size={16} /></div>
            <div>
              <h2 className="modal-title">Onboard Clinic Staff</h2>
              <p className="modal-subtitle">Generate credentials for healthcare professional</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="icon-btn"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group">
            <label className="form-label">Practitioner Name</label>
            <input type="text" placeholder="e.g. Sarah Wilson" className="form-control" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} required disabled={submitting} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Medical Specialty</label>
              <select className="form-control" value={formData.specialty} onChange={e => setFormData(p => ({ ...p, specialty: e.target.value }))} disabled={submitting}>
                <option style={{ background: 'var(--bg-surface)' }}>General Physician</option>
                <option style={{ background: 'var(--bg-surface)' }}>Dermatologist</option>
                <option style={{ background: 'var(--bg-surface)' }}>Pediatrician</option>
                <option style={{ background: 'var(--bg-surface)' }}>Orthopedic</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Experience (Years)</label>
              <input type="number" placeholder="e.g. 12" className="form-control" value={formData.experience} onChange={e => setFormData(p => ({ ...p, experience: e.target.value }))} required disabled={submitting} />
            </div>
          </div>

          <div style={{ borderTop: '1px dashed var(--border-muted)', margin: '8px 0', paddingTop: '12px' }} />

          <div className="form-group">
            <label className="form-label" style={{ color: 'var(--warning)' }}><KeyRound size={12} /> Assigned Login Username</label>
            <input type="text" placeholder="e.g. swilson" className="form-control" value={formData.username} onChange={e => setFormData(p => ({ ...p, username: e.target.value }))} required disabled={submitting} />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ color: 'var(--warning)' }}>Assigned Access Password</label>
            <input type="password" placeholder="Create robust password entry" className="form-control" value={formData.password} onChange={e => setFormData(p => ({ ...p, password: e.target.value }))} required disabled={submitting} />
          </div>

          {err && <p className="form-error" style={{ textAlign: 'center', color: 'var(--danger, #dc3545)' }}>{err}</p>}

          <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
            <button type="button" onClick={onClose} className="btn btn-ghost" style={{ width: '100px' }} disabled={submitting}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submitting}>
              <span>{submitting ? 'Onboarding...' : 'Onboard & Save'}</span>
              {!submitting && <ChevronRight size={16} />}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AddDoctorForm;