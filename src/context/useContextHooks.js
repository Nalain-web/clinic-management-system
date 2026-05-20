// frontend/src/context/useContextHooks.js
import { useContext } from 'react';
// 🟢 COMBINED: Import both contexts together from the same instances file
import { AppointmentContext, AuthContext } from './ContextInstances';

// 🟢 Custom hook wrapper for Appointments
export const useAppointments = () => {
  const context = useContext(AppointmentContext);
  if (!context) {
    throw new Error('useAppointments must be used within an AppointmentProvider');
  }
  return context;
};

// 🟢 Custom hook wrapper for Auth
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};