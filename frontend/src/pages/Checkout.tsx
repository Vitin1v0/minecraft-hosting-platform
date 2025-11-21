import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CreditCard, Loader } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';

interface Plano {
  id: number;
  nome: string;
  preco_mensal: number;
  preco_trimestral: number;
  preco_anual: number;
}

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { planoId } = location.state || {};

  const [plano, setPlano] = useState<Plano | null>(null);
  const [nomeServidor, setNomeServidor] = useState('');
  const [periodo, setPeriodo] = useState<1 | 3 | 12>(1);
  const [loading, setLoading] = useState(true);
  const [processando, setProcessando] = useState(false);

  useEffect(() => {
    if (!planoId) {
      navigate('/escolher-plano');
      return;
    }
    fetchPlano();
  }, [planoId]);

  const fetchPlano = async () => {
    try {
      const response = await api.get(`/api/planos/${planoId}`);
      setPlano(response.data.plano);
    } catch (error) {
      toast.error('Erro ao carregar plano');
      navigate('/escolher-plano');
    } finally {
      setLoading(false);
    }
  };

  const calcularTotal = () => {
    if (!plano) return 0;
    if (periodo === 12) return plano.preco_anual || plano.preco_mensal * 12;
    if (periodo === 3) return plano.preco_trimestral || plano.preco_mensal * 3;
    return plano.preco_mensal;
  };

  const handlePagamento = async () => {
    if (!nomeServidor.trim()) {
      toast.error('Por favor, escolha um nome para seu servidor');
      return;
    }

    setProcessando(true);

    try {
      const response = await api.post('/api/pagamentos/criar-pagamento', {
        planoId,
        adicionaisIds: [],
        periodoMeses: periodo,
        nomeServidor: nomeServidor.trim(),
      });

      // Redirecionar para o Mercado Pago
      window.location.href = response.data.init_point;
    } catch (error) {
      toast.error('Erro ao processar pagamento');
      setProcessando(false);
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
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Finalizar Compra</h1>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Formulário */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Detalhes do Servidor</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome do Servidor
            </label>
            <input
              type="text"
              value={nomeServidor}
              onChange={(e) => setNomeServidor(e.target.value)}
              placeholder="Meu Servidor Minecraft"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Período de Pagamento
            </label>
            <div className="space-y-2">
              <label className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="periodo"
                  value={1}
                  checked={periodo === 1}
                  onChange={() => setPeriodo(1)}
                  className="mr-3"
                />
                <span>Mensal - R$ {plano?.preco_mensal.toFixed(2)}/mês</span>
              </label>
              <label className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="periodo"
                  value={3}
                  checked={periodo === 3}
                  onChange={() => setPeriodo(3)}
                  className="mr-3"
                />
                <span>Trimestral - R$ {plano?.preco_trimestral?.toFixed(2) || (plano!.preco_mensal * 3).toFixed(2)}</span>
              </label>
              <label className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="periodo"
                  value={12}
                  checked={periodo === 12}
                  onChange={() => setPeriodo(12)}
                  className="mr-3"
                />
                <span>Anual - R$ {plano?.preco_anual?.toFixed(2) || (plano!.preco_mensal * 12).toFixed(2)}</span>
              </label>
            </div>
          </div>
        </div>

        {/* Resumo */}
        <div>
          <div className="bg-white rounded-lg shadow-md p-6 mb-4">
            <h2 className="text-xl font-semibold mb-4">Resumo do Pedido</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Plano</span>
                <span className="font-semibold">{plano?.nome}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Período</span>
                <span className="font-semibold">
                  {periodo === 1 ? 'Mensal' : periodo === 3 ? 'Trimestral' : 'Anual'}
                </span>
              </div>
              <div className="border-t pt-3 flex justify-between text-lg">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-primary-600">R$ {calcularTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handlePagamento}
            disabled={processando}
            className="w-full bg-primary-600 text-white py-3 px-4 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {processando ? (
              <>
                <Loader className="animate-spin h-5 w-5 mr-2" />
                Processando...
              </>
            ) : (
              <>
                <CreditCard className="h-5 w-5 mr-2" />
                Pagar com Mercado Pago
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
