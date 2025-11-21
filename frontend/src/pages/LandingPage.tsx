import { Link } from 'react-router-dom';
import { Server, Zap, Shield, HeadphonesIcon, ArrowRight, Check } from 'lucide-react';

const LandingPage = () => {
  const features = [
    {
      icon: Zap,
      title: 'Performance Extrema',
      description: 'Servidores com hardware de última geração para máxima performance',
    },
    {
      icon: Shield,
      title: 'Proteção DDoS',
      description: 'Proteção avançada contra ataques DDoS 24/7',
    },
    {
      icon: HeadphonesIcon,
      title: 'Suporte Dedicado',
      description: 'Equipe de suporte sempre disponível para ajudar',
    },
  ];

  const plans = [
    {
      name: 'Starter',
      price: '19.90',
      players: 10,
      ram: 2,
      features: ['2GB RAM', '10 Slots', '20GB SSD', 'Suporte Básico'],
    },
    {
      name: 'Pro',
      price: '39.90',
      players: 30,
      ram: 4,
      features: ['4GB RAM', '30 Slots', '50GB SSD', 'Suporte Prioritário', 'Backups Diários'],
      popular: true,
    },
    {
      name: 'Enterprise',
      price: '79.90',
      players: 100,
      ram: 8,
      features: ['8GB RAM', '100 Slots', '100GB SSD', 'Suporte VIP', 'Backups Diários', 'IP Dedicado'],
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Server className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Hugo Host</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/planos" className="text-gray-700 hover:text-primary-600">
                Planos
              </Link>
              <Link to="/login" className="text-gray-700 hover:text-primary-600">
                Login
              </Link>
              <Link
                to="/register"
                className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
              >
                Começar
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="gradient-minecraft py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-white mb-6">
            Hospedagem Minecraft de Alta Performance
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Crie e gerencie seus servidores Minecraft com facilidade. Performance garantida, suporte 24/7 e preços acessíveis.
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/register"
              className="bg-white text-primary-600 px-8 py-3 rounded-md font-semibold hover:bg-gray-100 flex items-center"
            >
              Criar Servidor Agora
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/planos"
              className="bg-primary-700 text-white px-8 py-3 rounded-md font-semibold hover:bg-primary-800"
            >
              Ver Planos
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Por que escolher a Hugo Host?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Planos para todos os tamanhos
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`bg-white rounded-lg shadow-lg overflow-hidden ${
                  plan.popular ? 'ring-2 ring-primary-500' : ''
                }`}
              >
                {plan.popular && (
                  <div className="bg-primary-500 text-white text-center py-1 text-sm font-semibold">
                    MAIS POPULAR
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold">R$ {plan.price}</span>
                    <span className="text-gray-600">/mês</span>
                  </div>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center">
                        <Check className="h-5 w-5 text-primary-500 mr-2" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/register"
                    className={`block w-full text-center py-2 px-4 rounded-md font-semibold ${
                      plan.popular
                        ? 'bg-primary-600 text-white hover:bg-primary-700'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    Escolher Plano
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2025 Hugo Host. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
