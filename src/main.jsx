import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { AppointmentProvider } from './context/AppointmentContext.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <AppointmentProvider>
        <App />
      </AppointmentProvider>
    </AuthProvider>
  </React.StrictMode>
);