import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';

const PagamentoPendente = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <Clock className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Pagamento Pendente</h1>
        <p className="text-gray-600 mb-6">
          Seu pagamento está sendo processado. Você receberá uma confirmação por email assim que for aprovado.
        </p>
        <p className="text-sm text-gray-500 mb-6">
          Pagamentos via PIX são aprovados instantaneamente. Pagamentos via boleto podem levar até 3 dias úteis.
        </p>
        <div className="flex flex-col space-y-3">
          <Link
            to="/transacoes"
            className="bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700"
          >
            Ver Minhas Transações
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

export default PagamentoPendente;
