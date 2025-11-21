import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';

interface Plano {
  id: number;
  nome: string;
  descricao: string;
  preco_mensal: number;
  preco_trimestral: number;
  preco_anual: number;
  slots_players: number;
  ram_gb: number;
  cpu_cores: number;
  ssd_gb: number;
  destaque: boolean;
}

const EscolherPlano = () => {
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPlanos();
  }, []);

  const fetchPlanos = async () => {
    try {
      const response = await api.get('/api/planos');
      setPlanos(response.data.planos);
    } catch (error) {
      toast.error('Erro ao carregar planos');
    } finally {
      setLoading(false);
    }
  };

  const handleEscolherPlano = (planoId: number) => {
    navigate('/checkout', { state: { planoId } });
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Escolha seu Plano</h1>
        <p className="text-gray-600 mt-1">Selecione o plano ideal para seu servidor</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {planos.map((plano) => (
          <div
            key={plano.id}
            className={`bg-white rounded-lg shadow-lg overflow-hidden ${
              plano.destaque ? 'ring-2 ring-primary-500' : ''
            }`}
          >
            {plano.destaque && (
              <div className="bg-primary-500 text-white text-center py-1 text-sm font-semibold">
                MAIS POPULAR
              </div>
            )}
            <div className="p-6">
              <h3 className="text-2xl font-bold mb-2">{plano.nome}</h3>
              <p className="text-gray-600 mb-4">{plano.descricao}</p>
              <div className="mb-4">
                <span className="text-4xl font-bold">R$ {plano.preco_mensal.toFixed(2)}</span>
                <span className="text-gray-600">/mês</span>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-primary-500 mr-2" />
                  <span>{plano.ram_gb}GB RAM</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-primary-500 mr-2" />
                  <span>{plano.slots_players} Slots</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-primary-500 mr-2" />
                  <span>{plano.ssd_gb}GB SSD</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-primary-500 mr-2" />
                  <span>{plano.cpu_cores} CPU Cores</span>
                </li>
              </ul>
              <button
                onClick={() => handleEscolherPlano(plano.id)}
                className={`w-full py-2 px-4 rounded-md font-semibold flex items-center justify-center ${
                  plano.destaque
                    ? 'bg-primary-600 text-white hover:bg-primary-700'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                Escolher Plano
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EscolherPlano;
