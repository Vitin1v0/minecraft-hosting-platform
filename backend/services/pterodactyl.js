const fetch = require('node-fetch');

const PTERODACTYL_URL = process.env.PTERODACTYL_URL;
const PTERODACTYL_API_TOKEN = process.env.PTERODACTYL_API_TOKEN;
const PTERODACTYL_OWNER_ID = process.env.PTERODACTYL_OWNER_ID;
const PTERODACTYL_EGG_ID = process.env.PTERODACTYL_EGG_ID || 5;

const db = require('../config/database');

// Criar usuário no Pterodactyl (se não existir)
const criarOuBuscarUsuario = async (usuario) => {
  try {
    // Buscar usuário por email
    const searchResponse = await fetch(
      `${PTERODACTYL_URL}/api/application/users?filter[email]=${usuario.email}`,
      {
        headers: {
          'Authorization': `Bearer ${PTERODACTYL_API_TOKEN}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );

    const searchData = await searchResponse.json();

    if (searchData.data && searchData.data.length > 0) {
      return searchData.data[0].attributes.id;
    }

    // Criar novo usuário
    const createResponse = await fetch(
      `${PTERODACTYL_URL}/api/application/users`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PTERODACTYL_API_TOKEN}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          email: usuario.email,
          username: usuario.email.split('@')[0],
          first_name: usuario.nome.split(' ')[0],
          last_name: usuario.nome.split(' ').slice(1).join(' ') || 'Cliente'
        })
      }
    );

    const createData = await createResponse.json();
    return createData.attributes.id;
  } catch (error) {
    console.error('Erro ao criar/buscar usuário no Pterodactyl:', error);
    throw error;
  }
};

// Provisionar servidor no Pterodactyl
const provisionarServidor = async (usuario, planoId, nomeServidor, periodoMeses) => {
  try {
    // Buscar especificações do plano
    const planoResult = await db.query(
      'SELECT * FROM planos WHERE id = $1',
      [planoId]
    );

    if (planoResult.rows.length === 0) {
      throw new Error('Plano não encontrado');
    }

    const plano = planoResult.rows[0];

    // Criar ou buscar usuário no Pterodactyl
    const pterodactylUserId = await criarOuBuscarUsuario(usuario);

    // Criar servidor
    const response = await fetch(
      `${PTERODACTYL_URL}/api/application/servers`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PTERODACTYL_API_TOKEN}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          external_id: `cliente-${usuario.id}-${Date.now()}`,
          name: nomeServidor || `${usuario.nome}-minecraft`,
          description: `Servidor Minecraft - Plano ${plano.nome}`,
          user: pterodactylUserId,
          egg: parseInt(PTERODACTYL_EGG_ID),
          docker_image: 'ghcr.io/pterodactyl/yolks:java_17',
          startup: 'java -Xmx{{SERVER_MEMORY}}M -Xms128M -jar server.jar nogui',
          environment: {
            MINECRAFT_VERSION: 'latest',
            SERVER_JARFILE: 'server.jar',
            BUILD_NUMBER: 'latest'
          },
          limits: {
            memory: plano.ram_gb * 1024, // Converter GB para MB
            swap: 0,
            disk: plano.ssd_gb * 1024, // Converter GB para MB
            io: 500,
            cpu: plano.cpu_cores * 100 // Percentual
          },
          feature_limits: {
            databases: 1,
            backups: 2,
            allocations: 1
          },
          allocation: {
            default: 1 // Primeira alocação disponível
          }
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erro do Pterodactyl:', errorData);
      throw new Error('Falha ao criar servidor no Pterodactyl');
    }

    const data = await response.json();
    const serverData = data.attributes;

    return {
      id: serverData.id,
      uuid: serverData.uuid,
      identifier: serverData.identifier,
      nome: serverData.name,
      ip: serverData.allocation?.ip || null,
      porta: serverData.allocation?.port || null
    };
  } catch (error) {
    console.error('Erro ao provisionar servidor:', error);
    throw error;
  }
};

// Buscar status do servidor
const buscarStatusServidor = async (pterodactylServerId) => {
  try {
    const response = await fetch(
      `${PTERODACTYL_URL}/api/application/servers/${pterodactylServerId}`,
      {
        headers: {
          'Authorization': `Bearer ${PTERODACTYL_API_TOKEN}`,
          'Accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Servidor não encontrado');
    }

    const data = await response.json();
    return data.attributes;
  } catch (error) {
    console.error('Erro ao buscar status:', error);
    throw error;
  }
};

// Suspender servidor
const suspenderServidor = async (pterodactylServerId) => {
  try {
    const response = await fetch(
      `${PTERODACTYL_URL}/api/application/servers/${pterodactylServerId}/suspend`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PTERODACTYL_API_TOKEN}`,
          'Accept': 'application/json'
        }
      }
    );

    return response.ok;
  } catch (error) {
    console.error('Erro ao suspender servidor:', error);
    throw error;
  }
};

// Reativar servidor
const reativarServidor = async (pterodactylServerId) => {
  try {
    const response = await fetch(
      `${PTERODACTYL_URL}/api/application/servers/${pterodactylServerId}/unsuspend`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PTERODACTYL_API_TOKEN}`,
          'Accept': 'application/json'
        }
      }
    );

    return response.ok;
  } catch (error) {
    console.error('Erro ao reativar servidor:', error);
    throw error;
  }
};

// Deletar servidor
const deletarServidor = async (pterodactylServerId) => {
  try {
    const response = await fetch(
      `${PTERODACTYL_URL}/api/application/servers/${pterodactylServerId}/force`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${PTERODACTYL_API_TOKEN}`,
          'Accept': 'application/json'
        }
      }
    );

    return response.ok;
  } catch (error) {
    console.error('Erro ao deletar servidor:', error);
    throw error;
  }
};

module.exports = {
  provisionarServidor,
  buscarStatusServidor,
  suspenderServidor,
  reativarServidor,
  deletarServidor
};
