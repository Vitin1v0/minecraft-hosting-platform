import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const PagamentoSucesso = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Pagamento Confirmado!</h1>
        <p className="text-gray-600 mb-6">
          Seu pagamento foi processado com sucesso. Seu servidor está sendo configurado e estará disponível em breve.
        </p>
        <p className="text-sm text-gray-500 mb-6">
          Você receberá um email com os detalhes de acesso ao seu servidor.
        </p>
        <Link
          to="/dashboard"
          className="inline-block bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700"
        >
          Ir para Dashboard
        </Link>
      </div>
    </div>
  );
};

export default PagamentoSucesso;
