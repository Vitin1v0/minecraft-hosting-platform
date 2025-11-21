import { useEffect, useState } from 'react';
import { Server, Trash2, Edit } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';

interface Servidor {
  id: number;
  nome: string;
  status: string;
  plano_nome: string;
  ip: string;
  porta: number;
  ram_gb: number;
  cpu_cores: number;
  ssd_gb: number;
  data_renovacao: string;
}

const MeusServidores = () => {
  const [servidores, setServidores] = useState<Servidor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServidores();
  }, []);

  const fetchServidores = async () => {
    try {
      const response = await api.get('/api/servidores/meus-servidores');
      setServidores(response.data.servidores);
    } catch (error) {
      toast.error('Erro ao carregar servidores');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletar = async (id: number) => {
    if (!confirm('Tem certeza que deseja deletar este servidor?')) return;

    try {
      await api.delete(`/api/servidores/${id}`);
      toast.success('Servidor deletado com sucesso');
      fetchServidores();
    } catch (error) {
      toast.error('Erro ao deletar servidor');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo':
        return 'bg-green-100 text-green-800';
      case 'suspenso':
        return 'bg-yellow-100 text-yellow-800';
      case 'ativando':
        return 'bg-blue-100 text-blue-800';
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
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Meus Servidores</h1>

      {servidores.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Server className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Nenhum servidor encontrado</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plano</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP:Porta</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Renovação</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {servidores.map((servidor) => (
                <tr key={servidor.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Server className="h-5 w-5 text-gray-400 mr-2" />
                      {servidor.nome}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {servidor.plano_nome}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(servidor.status)}`}>
                      {servidor.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {servidor.ip}:{servidor.porta}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(servidor.data_renovacao).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleDeletar(servidor.id)}
                      className="text-red-600 hover:text-red-900 ml-4"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
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

export default MeusServidores;
