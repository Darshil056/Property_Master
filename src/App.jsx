import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import HomePage from './pages/HomePage';
import ListingsPage from './pages/ListingsPage';
import SellPropertyPage from './pages/SellPropertyPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/listings" element={<ListingsPage />} />
          <Route path="/sell" element={<SellPropertyPage />} />
          
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
