import { Routes, Route } from 'react-router-dom';
import GlobalLayout from '@/layouts/GlobalLayout';
import Dashboard from '@/pages/Dashboard';
import Repository from '@/pages/Repository';

function App() {
  return (
    <Routes>
      <Route path="/" element={<GlobalLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="repository" element={<Repository />} />
      </Route>
    </Routes>
  );
}

export default App;