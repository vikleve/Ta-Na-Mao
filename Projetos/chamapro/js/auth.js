/**
 * ChamaPro - Authentication & Backend User Service
 * Gerenciamento de Sessão (Cliente vs Profissional) & Cadastro Real em DB/LocalStorage
 */

const ChamaProAuth = {
  // Estado do Usuário Ativo
  currentUser: JSON.parse(localStorage.getItem('chamapro_user')) || {
    id: 'usr-client-demo',
    name: 'Victor (Cliente)',
    email: 'victor@email.com',
    role: 'client', // 'client' ou 'pro'
    avatar: 'https://i.pravatar.cc/100?img=33'
  },

  // Listeners de mudança de autenticação
  listeners: [],

  onAuthChange(callback) {
    this.listeners.push(callback);
  },

  notifyListeners() {
    this.listeners.forEach(cb => cb(this.currentUser));
  },

  // Retorna usuário logado
  getUser() {
    return this.currentUser;
  },

  // Login
  login(email, password, role = 'client') {
    const user = {
      id: `usr-${Date.now()}`,
      name: email.split('@')[0],
      email: email,
      role: role,
      avatar: role === 'pro' ? 'https://i.pravatar.cc/100?img=12' : 'https://i.pravatar.cc/100?img=33'
    };
    this.currentUser = user;
    localStorage.setItem('chamapro_user', JSON.stringify(user));
    this.notifyListeners();
    return user;
  },

  // Registro de Novo Profissional no Banco de Dados da Plataforma
  registerProfessional(proData) {
    const newPro = {
      id: `pro-${Date.now()}`,
      name: proData.name,
      title: proData.title,
      category: proData.category,
      rating: 5.0,
      reviewsCount: 1,
      distance: 0.5,
      lat: window.ChamaProData.userLocation.lat + (Math.random() - 0.5) * 0.04,
      lng: window.ChamaProData.userLocation.lng + (Math.random() - 0.5) * 0.04,
      startingPrice: parseFloat(proData.startingPrice) || 100,
      avatar: proData.avatar || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&q=80',
      verified: true,
      superPro: true,
      availableToday: true,
      bio: proData.bio,
      experienceYears: parseInt(proData.experienceYears) || 3,
      completedJobs: 1,
      address: proData.address || 'Sua Região',
      specialties: proData.specialties ? proData.specialties.split(',').map(s => s.trim()) : ['Atendimento Rápido'],
      portfolio: [],
      reviews: [
        {
          id: `rev-${Date.now()}`,
          author: 'ChamaPro Boas-Vindas',
          avatar: 'https://i.pravatar.cc/100?img=60',
          rating: 5,
          date: 'Hoje',
          comment: 'Novo profissional verificado cadastrado na plataforma!',
          tags: ['Perfil Verificado', 'Novo Pro']
        }
      ]
    };

    // Salva na lista global da aplicação
    window.ChamaProData.professionals.unshift(newPro);
    
    // Login automático como profissional
    this.currentUser = {
      id: newPro.id,
      name: newPro.name,
      email: proData.email,
      role: 'pro',
      proDetails: newPro
    };

    localStorage.setItem('chamapro_user', JSON.stringify(this.currentUser));
    this.notifyListeners();
    return newPro;
  },

  // Logout
  logout() {
    this.currentUser = null;
    localStorage.removeItem('chamapro_user');
    this.notifyListeners();
  }
};

window.ChamaProAuth = ChamaProAuth;
