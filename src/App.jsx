import { Navigate, Route, Routes } from 'react-router-dom';
import PracticePage from './pages/PracticePage.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/practice/:mode" element={<PracticePage />} />
      <Route path="*" element={<Navigate to="/practice/all" replace />} />
    </Routes>
  );
}
