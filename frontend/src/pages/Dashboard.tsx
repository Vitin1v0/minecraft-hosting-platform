import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Server, Plus, Activity, AlertCircle } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';

interface Servidor {
  id: number;
  nome: string;
  status: string;
  plano_nome: string;
  ip: string;
  porta: number;
  data_renovacao: string;
}

const Dashboard = () => {
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

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Bem-vindo de volta! Gerencie seus servidores abaixo.</p>
        </div>
        <Link
          to="/escolher-plano"
          className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Novo Servidor
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : servidores.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Server className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Nenhum servidor ainda
          </h3>
          <p className="text-gray-600 mb-6">
            Crie seu primeiro servidor Minecraft e comece a jogar!
          </p>
          <Link
            to="/escolher-plano"
            className="inline-flex items-center bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Criar Primeiro Servidor
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {servidores.map((servidor) => (
            <div key={servidor.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Server className="h-8 w-8 text-primary-600 mr-3" />
                  <div>
                    <h3 className="font-semibold text-gray-900">{servidor.nome}</h3>
                    <p className="text-sm text-gray-600">{servidor.plano_nome}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(servidor.status)}`}>
                  {servidor.status}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-600">
                  <Activity className="h-4 w-4 mr-2" />
                  {servidor.ip}:{servidor.porta}
                </div>
                <div className="flex items-center text-gray-600">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Renova em: {new Date(servidor.data_renovacao).toLocaleDateString('pt-BR')}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <Link
                  to={`/servidores/${servidor.id}`}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  Gerenciar Servidor →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
