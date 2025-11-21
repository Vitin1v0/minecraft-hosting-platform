import { useState, useEffect } from 'react';
import { User, Lock } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';

const MinhaConta = () => {
  const [usuario, setUsuario] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState('');

  useEffect(() => {
    fetchUsuario();
  }, []);

  const fetchUsuario = async () => {
    try {
      const response = await api.get('/api/usuarios/perfil');
      setUsuario(response.data.usuario);
    } catch (error) {
      toast.error('Erro ao carregar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleAlterarSenha = async (e: React.FormEvent) => {
    e.preventDefault();

    if (novaSenha !== confirmarNovaSenha) {
      toast.error('As senhas não coincidem');
      return;
    }

    try {
      await api.put('/api/usuarios/alterar-senha', {
        senhaAtual,
        novaSenha,
      });
      toast.success('Senha alterada com sucesso');
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmarNovaSenha('');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao alterar senha');
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
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Minha Conta</h1>

      <div className="space-y-6">
        {/* Informações da Conta */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <User className="h-6 w-6 text-gray-400 mr-2" />
            <h2 className="text-xl font-semibold">Informações da Conta</h2>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-600">Nome</label>
              <p className="font-medium">{usuario?.nome}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Email</label>
              <p className="font-medium">{usuario?.email}</p>
            </div>
            {usuario?.cpf_cnpj && (
              <div>
                <label className="text-sm text-gray-600">CPF/CNPJ</label>
                <p className="font-medium">{usuario?.cpf_cnpj}</p>
              </div>
            )}
            {usuario?.telefone && (
              <div>
                <label className="text-sm text-gray-600">Telefone</label>
                <p className="font-medium">{usuario?.telefone}</p>
              </div>
            )}
          </div>
        </div>

        {/* Alterar Senha */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <Lock className="h-6 w-6 text-gray-400 mr-2" />
            <h2 className="text-xl font-semibold">Alterar Senha</h2>
          </div>
          <form onSubmit={handleAlterarSenha} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha Atual
              </label>
              <input
                type="password"
                value={senhaAtual}
                onChange={(e) => setSenhaAtual(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nova Senha
              </label>
              <input
                type="password"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                required
                minLength={8}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar Nova Senha
              </label>
              <input
                type="password"
                value={confirmarNovaSenha}
                onChange={(e) => setConfirmarNovaSenha(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
            >
              Alterar Senha
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MinhaConta;
