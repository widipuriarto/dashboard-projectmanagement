import { Routes, Route, Navigate } from 'react-router-dom';
import GlobalLayout from '@/layouts/GlobalLayout';
import Dashboard from '@/pages/Dashboard';
import Repository from '@/pages/Repository';
import SignIn from '@/pages/SignIn';
import SignUp from '@/pages/SignUp';

function App() {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/sign-in" element={<SignIn />} />
      <Route path="/login" element={<Navigate to="/sign-in" replace />} />
      <Route path="/sign-up" element={<SignUp />} />
      <Route path="/register" element={<Navigate to="/sign-up" replace />} />

      {/* Protected App Routes */}
      <Route path="/" element={<GlobalLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="repository" element={<Repository />} />
      </Route>
    </Routes>
  );
}

export default App;
