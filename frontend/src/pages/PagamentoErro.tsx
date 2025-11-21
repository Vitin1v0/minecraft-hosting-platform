import { Link } from 'react-router-dom';
import { XCircle } from 'lucide-react';

const PagamentoErro = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Pagamento Não Realizado</h1>
        <p className="text-gray-600 mb-6">
          Houve um problema ao processar seu pagamento. Por favor, tente novamente.
        </p>
        <div className="flex flex-col space-y-3">
          <Link
            to="/escolher-plano"
            className="bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700"
          >
            Tentar Novamente
          </Link>
          <Link
            to="/dashboard"
            className="text-gray-600 hover:text-gray-900"
          >
            Voltar ao Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PagamentoErro;
