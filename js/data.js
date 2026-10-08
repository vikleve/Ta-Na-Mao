/**
 * ChamaPro - Data Repository & Database Layer
 * Categorias, Profissionais, Coordenadas Geográficas (GPS) e Persistência
 */

const ChamaProData = {
  // Centro Padrão em Timbaúba - PE (conforme imagem de referência)
  userLocation: {
    lat: -7.5083,
    lng: -35.3181,
    address: 'Timbaúba - PE'
  },

  categories: [
    {
      id: 'automotivo',
      name: 'Automotivo',
      icon: 'fa-car',
      color: '#ef4444',
      bgLight: '#fee2e2',
      description: 'Mecânicos, auto elétrica, troca de óleo, pneus e socorro 24h.',
      proCount: 38,
      startingPrice: 70
    },
    {
      id: 'tecnologia',
      name: 'Tecnologia',
      icon: 'fa-desktop',
      color: '#3b82f6',
      bgLight: '#dbeafe',
      description: 'Manutenção de computadores, celulares, notebooks e redes Wi-Fi.',
      proCount: 45,
      startingPrice: 65
    },
    {
      id: 'gerais',
      name: 'Serviços gerais',
      icon: 'fa-wrench',
      color: '#f59e0b',
      bgLight: '#fef3c7',
      description: 'Eletricistas, pedreiros, encanadores, pintores e reparos.',
      proCount: 62,
      startingPrice: 80
    },
    {
      id: 'casa',
      name: 'Casa',
      icon: 'fa-house',
      color: '#10b981',
      bgLight: '#d1fae5',
      description: 'Diaristas, jardinagem, reformas e manutenção residencial.',
      proCount: 54,
      startingPrice: 100
    },
    {
      id: 'alimentacao',
      name: 'Alimentação',
      icon: 'fa-utensils',
      color: '#f97316',
      bgLight: '#ffedd5',
      description: 'Buffets, confeitaria, marmitas gourmet e serviços culinários.',
      proCount: 29,
      startingPrice: 50
    },
    {
      id: 'educacao',
      name: 'Educação',
      icon: 'fa-graduation-cap',
      color: '#6366f1',
      bgLight: '#e0e7ff',
      description: 'Aulas particulares, reforço escolar, idiomas e música.',
      proCount: 31,
      startingPrice: 60
    },
    {
      id: 'beleza',
      name: 'Beleza',
      icon: 'fa-wand-magic-sparkles',
      color: '#ec4899',
      bgLight: '#fce7f3',
      description: 'Cabeleireiros, manicures, barbearias e estética.',
      proCount: 42,
      startingPrice: 40
    },
    {
      id: 'outros',
      name: 'Outros',
      icon: 'fa-ellipsis',
      color: '#64748b',
      bgLight: '#f1f5f9',
      description: 'Diversos outros serviços especializados para sua rotina.',
      proCount: 20,
      startingPrice: 50
    }
  ],

  professionals: [
    {
      id: 'pro-autocenter',
      name: 'Auto Center São José',
      title: 'Mecânica Automotiva',
      category: 'automotivo',
      rating: 4.8,
      reviewsCount: 124,
      distance: 1.2,
      lat: -7.5020,
      lng: -35.3140,
      startingPrice: 90,
      avatar: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400&q=80',
      verified: true,
      superPro: true,
      availableToday: true,
      status: 'Aberto agora',
      bio: 'Mecânica em geral, troca de óleo, revisão completa e muito mais. Seu carro em boas mãos!',
      experienceYears: 12,
      completedJobs: 480,
      address: 'Timbaúba - PE',
      specialties: ['Injeção Eletrônica', 'Troca de Óleo', 'Freios e Suspensão', 'Alinhamento'],
      portfolio: [],
      reviews: []
    },
    {
      id: 'pro-motopecas',
      name: 'Moto Peças Timbaúba',
      title: 'Mecânica de Motos',
      category: 'automotivo',
      rating: 4.7,
      reviewsCount: 89,
      distance: 1.8,
      lat: -7.5050,
      lng: -35.3210,
      startingPrice: 70,
      avatar: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=400&q=80',
      verified: true,
      superPro: true,
      availableToday: true,
      status: 'Aberto agora',
      bio: 'Manutenção preventiva e corretiva, troca de peças e acessórios para sua moto.',
      experienceYears: 9,
      completedJobs: 320,
      address: 'Timbaúba - PE',
      specialties: ['Revisão Geral', 'Pneus', 'Freios', 'Elétrica de Motos'],
      portfolio: [],
      reviews: []
    },
    {
      id: 'pro-techhelp',
      name: 'TechHelp Informática',
      title: 'Tecnologia',
      category: 'tecnologia',
      rating: 4.9,
      reviewsCount: 156,
      distance: 2.4,
      lat: -7.5110,
      lng: -35.3120,
      startingPrice: 80,
      avatar: 'https://images.unsplash.com/photo-1588702547919-26089e690ecc?w=400&q=80',
      verified: true,
      superPro: true,
      availableToday: true,
      status: 'Aberto agora',
      bio: 'Formatação, manutenção, upgrade e muito mais. Seu equipamento funcionando como novo!',
      experienceYears: 7,
      completedJobs: 412,
      address: 'Timbaúba - PE',
      specialties: ['Formatação', 'Troca de SSD', 'Remoção de Vírus', 'Limpeza Interna'],
      portfolio: [],
      reviews: []
    },
    {
      id: 'pro-iphone',
      name: 'iPhone & Cia',
      title: 'Tecnologia',
      category: 'tecnologia',
      rating: 4.6,
      reviewsCount: 78,
      distance: 2.7,
      lat: -7.5140,
      lng: -35.3240,
      startingPrice: 65,
      avatar: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400&q=80',
      verified: true,
      superPro: false,
      availableToday: true,
      status: 'Aberto agora',
      bio: 'Assistência técnica especializada em celulares, notebooks e tablets. Qualidade e confiança!',
      experienceYears: 6,
      completedJobs: 290,
      address: 'Timbaúba - PE',
      specialties: ['Troca de Tela', 'Troca de Bateria', 'Conector de Carga', 'Placa'],
      portfolio: [],
      reviews: []
    },
    {
      id: 'pro-1',
      name: 'João Silva',
      title: 'Eletricista Residencial & Predial',
      category: 'eletricista',
      rating: 4.9,
      reviewsCount: 128,
      distance: 3.5,
      lat: -23.5475,
      lng: -46.6360,
      startingPrice: 80,
      avatar: 'assets/pro_electrician.jpg',
      verified: true,
      superPro: true,
      availableToday: true,
      bio: 'Eletricista certificado pelo SENAI com mais de 8 anos de experiência em instalações residenciais, comerciais e manutenção preventiva. Garantia de 90 dias em todos os serviços.',
      experienceYears: 8,
      completedJobs: 342,
      address: 'Bela Vista, SP • Atende até 15 km',
      specialties: ['Quadros Trifásicos', 'Instalação de Tomadas e Interruptores', 'Iluminação LED em Sanca', 'Chuveiros e Torneiras Elétricas'],
      portfolio: [
        { title: 'Instalação de Quadro Elétrico Moderno', img: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&q=80' },
        { title: 'Projeto de Iluminação em Fita LED', img: 'https://images.unsplash.com/photo-1565814636199-ae8133055c1c?w=500&q=80' }
      ],
      reviews: [
        {
          id: 'rev-1',
          author: 'Mariana Oliveira',
          avatar: 'https://i.pravatar.cc/100?img=47',
          rating: 5,
          date: 'Há 2 dias',
          comment: 'O João foi super pontual e resolveu a troca da tomada do ar condicionado super rápido. Deixou tudo limpinho e testado. Recomendo muito!',
          tags: ['Pontual', 'Trabalho Limpo', 'Profissional']
        },
        {
          id: 'rev-2',
          author: 'Carlos Alberto',
          avatar: 'https://i.pravatar.cc/100?img=12',
          rating: 4.9,
          date: 'Há 1 semana',
          comment: 'Instalou 6 luminárias no meu apartamento e reordenou a fiação do quadro de disjuntores. Preço justo e muito atencioso.',
          tags: ['Preço Justo', 'Experiente']
        }
      ]
    },
    {
      id: 'pro-2',
      name: 'Maria Santos',
      title: 'Especialista em Higienização Residencial',
      category: 'diarista',
      rating: 4.95,
      reviewsCount: 215,
      distance: 3.8,
      lat: -23.5615,
      lng: -46.6560,
      startingPrice: 130,
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&q=80',
      verified: true,
      superPro: true,
      availableToday: true,
      bio: 'Serviço detalhista e de confiança para manter sua casa impecável. Especialista em faxina detalhada, pós-obra, organização de closets e cuidados com superfícies delicadas.',
      experienceYears: 6,
      completedJobs: 512,
      address: 'Jardins, SP • Atende até 12 km',
      specialties: ['Faxina Profunda', 'Passadeira Express', 'Limpeza Pós-Reforma', 'Organização Marie Kondo'],
      portfolio: [
        { title: 'Organização de Cozinha Gourmet', img: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=500&q=80' },
        { title: 'Higienização de Sala de Estar', img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500&q=80' }
      ],
      reviews: [
        {
          id: 'rev-3',
          author: 'Fernanda Lima',
          avatar: 'https://i.pravatar.cc/100?img=32',
          rating: 5,
          date: 'Ontem',
          comment: 'Excelente profissional! Deixou a casa brilhando e organizada. Muito caprichosa em cada detalhe.',
          tags: ['Super Detalhista', 'Confiável']
        }
      ]
    },
    {
      id: 'pro-3',
      name: 'Carlos Eduardo',
      title: 'Mestre Encanador & Caça Vazamentos',
      category: 'encanador',
      rating: 4.85,
      reviewsCount: 94,
      distance: 4.2,
      lat: -23.5880,
      lng: -46.6380,
      startingPrice: 90,
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&q=80',
      verified: true,
      superPro: false,
      availableToday: false,
      bio: 'Encanador hidráulico com detector ultrassônico de vazamento (sem quebrar parede desnecessariamente). Atendimento rápido e solução definitiva para problemas com água e esgoto.',
      experienceYears: 10,
      completedJobs: 280,
      address: 'Vila Mariana, SP • Atende até 20 km',
      specialties: ['Caça Vazamentos Geofone', 'Desentupimento sem Quebradeira', 'Instalação de Válvulas e Descargas', 'Manutenção de Bombas d\'Água'],
      portfolio: [
        { title: 'Reparo de Tubulação Embutida', img: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=500&q=80' }
      ],
      reviews: [
        {
          id: 'rev-4',
          author: 'Ricardo Mendes',
          avatar: 'https://i.pravatar.cc/100?img=60',
          rating: 5,
          date: 'Há 3 dias',
          comment: 'Achou o vazamento que 2 outros encanadores não acharam! Salvou minha conta de água.',
          tags: ['Diagnóstico Preciso', 'Rápido']
        }
      ]
    },
    {
      id: 'pro-4',
      name: 'Lucas Mendes',
      title: 'Técnico em Redes & Manutenção de PCs',
      category: 'informatica',
      rating: 4.92,
      reviewsCount: 167,
      distance: 4.5,
      lat: -23.5640,
      lng: -46.6870,
      startingPrice: 75,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80',
      verified: true,
      superPro: true,
      availableToday: true,
      bio: 'Formatacão, otimização de computadores lentos, montagem de setups Gamer e Home Office, configuração de redes Wi-Fi Mesh e servidores de arquivos.',
      experienceYears: 5,
      completedJobs: 410,
      address: 'Pinheiros, SP • Atende até 10 km',
      specialties: ['Montagem de PC Gamer', 'Upgrade de SSD M.2', 'Otimização do Windows/Mac', 'Redes Mesh e Cabeamento Cat6'],
      portfolio: [
        { title: 'Setup High End com Custom Loop', img: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=500&q=80' }
      ],
      reviews: [
        {
          id: 'rev-5',
          author: 'Bruno Rocha',
          avatar: 'https://i.pravatar.cc/100?img=33',
          rating: 5,
          date: 'Há 4 dias',
          comment: 'Meu notebook estava inutilizável de lento. O Lucas colocou SSD e formatou, agora liga em 5 segundos!',
          tags: ['Ágil', 'Explicou Tudo']
        }
      ]
    },
    {
      id: 'pro-5',
      name: 'Ana Beatriz Souza',
      title: 'Pintora de Interiores e Texturas Finas',
      category: 'pintor',
      rating: 4.88,
      reviewsCount: 78,
      distance: 4.8,
      lat: -23.6020,
      lng: -46.6620,
      startingPrice: 150,
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&q=80',
      verified: true,
      superPro: false,
      availableToday: true,
      bio: 'Transformo ambientes com acabamento de alto padrão. Especialista em cimento queimado, efeitos decorativos, pintura geométrica e renovação de móveis.',
      experienceYears: 7,
      completedJobs: 190,
      address: 'Moema, SP • Atende até 18 km',
      specialties: ['Efeito Cimento Queimado', 'Pintura Geometrica e Boiserie', 'Proteção Anti-Mofo', 'Verniz e Lixamento de Portas'],
      portfolio: [
        { title: 'Parede Efeito Cimento Queimado', img: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=500&q=80' }
      ],
      reviews: [
        {
          id: 'rev-6',
          author: 'Patricia Gomes',
          avatar: 'https://i.pravatar.cc/100?img=25',
          rating: 5,
          date: 'Há 1 semana',
          comment: 'Fez o cimento queimado da minha sala de jantar e ficou parecendo capa de revista!',
          tags: ['Artista', 'Limpeza Nota 10']
        }
      ]
    },
    {
      id: 'pro-6',
      name: 'Roberto Alves',
      title: 'Pedreiro & Mestre de Pequenas Reformas',
      category: 'pedreiro',
      rating: 4.79,
      reviewsCount: 110,
      distance: 5.1,
      lat: -23.5900,
      lng: -46.6010,
      startingPrice: 130,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80',
      verified: true,
      superPro: false,
      availableToday: true,
      bio: 'Com mais de 15 anos no ramo da construção civil, realizo reformas de banheiros, assentamento de porcelanato grandes formatos e pequenos reparos residenciais com contrato e pontualidade.',
      experienceYears: 15,
      completedJobs: 480,
      address: 'Ipiranga, SP • Atende até 25 km',
      specialties: ['Porcelanato Grande Formato', 'Reformas Rápidas de Banheiro', 'Regularização de Contra-Piso', 'Abertura de Vãos e Portas'],
      portfolio: [
        { title: 'Banheiro Reformado com Nicho Embutido', img: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500&q=80' }
      ],
      reviews: [
        {
          id: 'rev-7',
          author: 'Marcelo Ribeiro',
          avatar: 'https://i.pravatar.cc/100?img=59',
          rating: 4.8,
          date: 'Há 2 semanas',
          comment: 'Seu Roberto cumpriu todos os prazos combinados. O assentamento do piso ficou impecável.',
          tags: ['Cumpre Prazos', 'Honesto']
        }
      ]
    },
    {
      id: 'pro-7',
      name: 'Marcos Vinicius',
      title: 'Técnico Especialista em iPhone e Android',
      category: 'celular',
      rating: 4.97,
      reviewsCount: 310,
      distance: 5.4,
      lat: -23.5550,
      lng: -46.6450,
      startingPrice: 70,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&q=80',
      verified: true,
      superPro: true,
      availableToday: true,
      bio: 'Troca de tela express em até 40 minutos com garantia de 6 meses. Reparo avançado em placa-mãe (Microsoldagem), troca de bateria original e desoxidação.',
      experienceYears: 7,
      completedJobs: 890,
      address: 'Consolação, SP • Atende a domicílio',
      specialties: ['Troca de Tela iPhone/Samsung', 'Substituição de Bateria Expresso', 'Microsoldagem em Placa', 'Recuperação de Dados'],
      portfolio: [
        { title: 'Troca de Vidro Mantendo Display Original', img: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=500&q=80' }
      ],
      reviews: [
        {
          id: 'rev-8',
          author: 'Camila Duarte',
          avatar: 'https://i.pravatar.cc/100?img=20',
          rating: 5,
          date: 'Hoje',
          comment: 'Veio até o meu escritório e trocou a tela do meu iPhone na minha frente em meia hora! Sensacional!',
          tags: ['A Domicílio', 'Garantia', 'Rápido']
        }
      ]
    },
    {
      id: 'pro-8',
      name: 'Patricia Lima',
      title: 'Eletricista de Emergência 24h & Automação',
      category: 'eletricista',
      rating: 4.91,
      reviewsCount: 145,
      distance: 5.8,
      lat: -23.5010,
      lng: -46.6240,
      startingPrice: 95,
      avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=300&q=80',
      verified: true,
      superPro: true,
      availableToday: true,
      bio: 'Especializada em curtos-circuitos, instalações de casa inteligente (Sonoff, Alexa, Tuya) e emergências 24 horas. Resposta rápida para chamados de urgência.',
      experienceYears: 6,
      completedJobs: 290,
      address: 'Santana, SP • Atende até 15 km',
      specialties: ['Atendimento de Emergência 24h', 'Casas Inteligentes (Smart Home)', 'Substituição de Fiação Antiga', 'Disjuntores DR e Proteção Surge'],
      portfolio: [
        { title: 'Automação Iluminação Residencial', img: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=500&q=80' }
      ],
      reviews: [
        {
          id: 'rev-9',
          author: 'Gustavo Santos',
          avatar: 'https://i.pravatar.cc/100?img=15',
          rating: 5,
          date: 'Há 3 dias',
          comment: 'Salvou minha noite quando a chave geral caiu às 22h. Chegou rápido e encontrou o curto na tomada da cozinha.',
          tags: ['Atendimento 24h', 'Socorro Rápido']
        }
      ]
    }
  ],

  // Orçamentos e histórico do cliente atual
  myRequests: [
    {
      id: 'REQ-1042',
      serviceTitle: 'Instalação de Tomada Dupla 220V no Quarto',
      category: 'eletricista',
      proId: 'pro-1',
      proName: 'João Silva',
      proAvatar: 'assets/pro_electrician.jpg',
      date: '25 Set 2026',
      urgency: 'Esta Semana',
      status: 'Aguardando Aprovação',
      statusColor: '#f59e0b',
      estimatedPrice: 'R$ 80 - R$ 120',
      details: 'Preciso puxar um ponto de energia para a tomada do ar condicionado split novo que vai ser instalado.',
      photo: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=500&q=80'
    },
    {
      id: 'REQ-1011',
      serviceTitle: 'Formatação e Troca de SSD Notebook Dell',
      category: 'informatica',
      proId: 'pro-4',
      proName: 'Lucas Mendes',
      proAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80',
      date: '18 Set 2026',
      urgency: 'Concluído',
      status: 'Concluído',
      statusColor: '#10b981',
      estimatedPrice: 'R$ 150,00',
      details: 'Upgrade para SSD NVMe 512GB com instalação limpa do Windows 11.',
      rated: true,
      myRating: 5
    }
  ],

  // Mensagens simuladas para a aba de chat
  chatMessages: [
    {
      proId: 'pro-1',
      proName: 'João Silva',
      proAvatar: 'assets/pro_electrician.jpg',
      messages: [
        { sender: 'pro', text: 'Olá! Vi seu pedido para a instalação da tomada de 220V.', time: '10:14' },
        { sender: 'pro', text: 'Consegues me confirmar se o quadro de disjuntores fica perto da parede do quarto?', time: '10:15' },
        { sender: 'user', text: 'Oi João! Fica sim, está no corredor a uns 3 metros de distância.', time: '10:18' },
        { sender: 'pro', text: 'Perfeito! Consigo realizar esse serviço hoje à tarde por R$ 90 já com os fios inclusos. Podemos fechar?', time: '10:20' }
      ]
    }
  ]
};

// Expor para o escopo global
window.ChamaProData = ChamaProData;
