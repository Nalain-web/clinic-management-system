import { useAuth } from './context/useContextHooks'; // 🟢 Sourced cleanly from our new hooks file
import { AuthProvider } from './context/AuthContext';
import { AppointmentProvider } from './context/AppointmentContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

const AppContent = () => {
  const { user } = useAuth();
  return user ? <Dashboard /> : <Login />;
};

function App() {
  return (
    <AuthProvider>
      <AppointmentProvider>
        <AppContent />
      </AppointmentProvider>
    </AuthProvider>
  );
}

export default App;