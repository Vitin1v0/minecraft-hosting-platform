import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';

const Planos = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Escolha o Plano Perfeito
          </h1>
          <p className="text-xl text-gray-600">
            Planos flexíveis para servidores de todos os tamanhos
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Planos serão carregados da API */}
          <p className="col-span-3 text-center text-gray-600">
            Carregando planos...
          </p>
        </div>

        <div className="text-center mt-12">
          <Link
            to="/register"
            className="inline-block bg-primary-600 text-white px-8 py-3 rounded-md hover:bg-primary-700"
          >
            Começar Agora
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Planos;
