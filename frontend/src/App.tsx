import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';

// Páginas Públicas
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Planos from './pages/Planos';

// Páginas Protegidas
import Dashboard from './pages/Dashboard';
import MeusServidores from './pages/MeusServidores';
import EscolherPlano from './pages/EscolherPlano';
import Checkout from './pages/Checkout';
import MinhasTransacoes from './pages/MinhasTransacoes';
import MinhaConta from './pages/MinhaConta';
import PagamentoSucesso from './pages/PagamentoSucesso';
import PagamentoErro from './pages/PagamentoErro';
import PagamentoPendente from './pages/PagamentoPendente';

// Layout
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        {/* Páginas Públicas */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />} />
        <Route path="/planos" element={<Planos />} />

        {/* Páginas de Resultado de Pagamento */}
        <Route path="/pagamento/sucesso" element={<PagamentoSucesso />} />
        <Route path="/pagamento/erro" element={<PagamentoErro />} />
        <Route path="/pagamento/pendente" element={<PagamentoPendente />} />

        {/* Páginas Protegidas */}
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/servidores" element={<MeusServidores />} />
          <Route path="/escolher-plano" element={<EscolherPlano />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/transacoes" element={<MinhasTransacoes />} />
          <Route path="/conta" element={<MinhaConta />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
