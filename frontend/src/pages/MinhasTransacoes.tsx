import { useEffect, useState } from 'react';
import { CreditCard } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';

interface Transacao {
  id: number;
  tipo: string;
  valor: number;
  status: string;
  metodo_pagamento: string;
  data_transacao: string;
  servidor_nome: string;
}

const MinhasTransacoes = () => {
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransacoes();
  }, []);

  const fetchTransacoes = async () => {
    try {
      const response = await api.get('/api/pagamentos/minhas-transacoes');
      setTransacoes(response.data.transacoes);
    } catch (error) {
      toast.error('Erro ao carregar transações');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
      case 'aprovado':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
      case 'falhado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Minhas Transações</h1>

      {transacoes.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Nenhuma transação encontrada</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Servidor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Método</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transacoes.map((transacao) => (
                <tr key={transacao.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(transacao.data_transacao).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {transacao.tipo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {transacao.servidor_nome || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    R$ {transacao.valor.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {transacao.metodo_pagamento || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(transacao.status)}`}>
                      {transacao.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MinhasTransacoes;
