/**
 * Tá na Mão - Repositório de Dados & Camada de Integração (RF03 & RF04)
 * Livre de contas fictícias, profissionais inventados ou avaliações artificiais.
 */

const ChamaProData = {
  // Coordenadas padrão da região do usuário (Timbaúba - PE)
  userLocation: {
    lat: -7.5083,
    lng: -35.3181,
    address: 'Timbaúba - PE'
  },

  // Categorias base do sistema
  categories: [
    {
      id: 'automotivo',
      name: 'Automotivo',
      icon: 'fa-car',
      color: '#ef4444',
      bgLight: '#fee2e2',
      description: 'Mecânicos, auto elétrica, troca de óleo, pneus e socorro 24h.'
    },
    {
      id: 'tecnologia',
      name: 'Tecnologia',
      icon: 'fa-desktop',
      color: '#3b82f6',
      bgLight: '#dbeafe',
      description: 'Manutenção de computadores, celulares, notebooks e redes Wi-Fi.'
    },
    {
      id: 'gerais',
      name: 'Serviços gerais',
      icon: 'fa-wrench',
      color: '#FF7900',
      bgLight: 'rgba(255, 121, 0, 0.1)',
      description: 'Eletricistas, pedreiros, encanadores, pintores e reparos.'
    },
    {
      id: 'casa',
      name: 'Casa',
      icon: 'fa-house',
      color: '#10b981',
      bgLight: '#d1fae5',
      description: 'Diaristas, jardinagem, reformas e manutenção residencial.'
    },
    {
      id: 'alimentacao',
      name: 'Alimentação',
      icon: 'fa-utensils',
      color: '#f97316',
      bgLight: '#ffedd5',
      description: 'Buffets, confeitaria, marmitas gourmet e serviços culinários.'
    },
    {
      id: 'educacao',
      name: 'Educação',
      icon: 'fa-graduation-cap',
      color: '#6366f1',
      bgLight: '#e0e7ff',
      description: 'Aulas particulares, reforço escolar, idiomas e música.'
    },
    {
      id: 'beleza',
      name: 'Beleza',
      icon: 'fa-face-smile',
      color: '#ec4899',
      bgLight: '#fce7f3',
      description: 'Cabeleireiros, manicures, barbearias e estética.'
    },
    {
      id: 'outros',
      name: 'Outros',
      icon: 'fa-ellipsis',
      color: '#64748b',
      bgLight: '#f1f5f9',
      description: 'Diversos outros serviços especializados para sua rotina.'
    }
  ],

  // Coleções limpas sem dados fictícios (RF03)
  professionals: [],
  myRequests: [],
  chatMessages: [],

  // Sincronização assíncrona com a camada de persistência real (RF05)
  async loadFromDatabase() {
    if (window.TaNaMaoDB) {
      try {
        const pros = await window.TaNaMaoDB.getProfessionals();
        this.professionals = pros;

        const quotes = await window.TaNaMaoDB.getMyQuotes();
        this.myRequests = quotes;
      } catch (err) {
        console.warn('[Tá na Mão] Erro ao sincronizar com banco de dados:', err);
      }
    }
    return this.professionals;
  }
};

// Expor para o escopo global
window.ChamaProData = ChamaProData;
