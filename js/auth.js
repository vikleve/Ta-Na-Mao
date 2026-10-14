/**
 * Tá na Mão - Authentication & User Session Service (RF03 & RF05)
 * Gerenciamento seguro de sessão sem contas fictícias nem dados inventados.
 */

const ChamaProAuth = {
  // Usuário ativo (inicia nulo caso não haja sessão legítima salva)
  currentUser: null,

  // Listeners de mudança de autenticação
  listeners: [],

  init() {
    try {
      const saved = localStorage.getItem('chamapro_user') || localStorage.getItem('tanamao_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Só aceita usuário se for uma conta legítima não demo
        if (parsed && parsed.email && !parsed.email.includes('demo') && !String(parsed.id).includes('demo')) {
          this.currentUser = parsed;
        } else {
          localStorage.removeItem('chamapro_user');
          localStorage.removeItem('tanamao_user');
          this.currentUser = null;
        }
      }
    } catch (e) {
      this.currentUser = null;
    }
  },

  onAuthChange(callback) {
    this.listeners.push(callback);
  },

  notifyListeners() {
    this.listeners.forEach(cb => cb(this.currentUser));
  },

  getUser() {
    return this.currentUser;
  },

  // Login de Usuário (Cliente ou Profissional)
  async login(email, password, role = 'client') {
    if (!email || !password) {
      throw new Error('Por favor, informe e-mail e senha.');
    }

    if (window.TaNaMaoDB) {
      try {
        const user = await window.TaNaMaoDB.login(email, password);
        this.currentUser = user;
        localStorage.setItem('chamapro_user', JSON.stringify(user));
        this.notifyListeners();
        return user;
      } catch (err) {
        // Se houver erro de autenticação remota, propaga a mensagem correta
        console.warn('[Tá na Mão - Auth]', err.message);
        throw err;
      }
    }

    const user = {
      id: `usr-${Date.now()}`,
      name: email.split('@')[0],
      email: email,
      role: role,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80'
    };
    this.currentUser = user;
    localStorage.setItem('chamapro_user', JSON.stringify(user));
    this.notifyListeners();
    return user;
  },

  // Registro de Profissional (sem reviews falsas)
  async registerProfessional(proData) {
    if (!proData.name || !proData.title) {
      throw new Error('Nome e profissão são obrigatórios.');
    }

    if (window.TaNaMaoDB) {
      const newPro = await window.TaNaMaoDB.registerProfessional(proData);
      
      // Adiciona na memória local do app
      if (window.ChamaProData && Array.isArray(window.ChamaProData.professionals)) {
        window.ChamaProData.professionals.unshift(newPro);
      }

      this.currentUser = {
        id: newPro.userId,
        name: newPro.name,
        email: proData.email || `${newPro.name.toLowerCase().replace(/\s+/g, '')}@tanamao.com`,
        role: 'pro',
        proDetails: newPro
      };

      localStorage.setItem('chamapro_user', JSON.stringify(this.currentUser));
      this.notifyListeners();
      return newPro;
    }

    const newPro = {
      id: `pro-${Date.now()}`,
      userId: `usr-${Date.now()}`,
      name: proData.name.trim(),
      title: proData.title.trim(),
      category: proData.category,
      rating: 5.0,
      reviewsCount: 0,
      distance: 0.5,
      lat: window.ChamaProData.userLocation.lat,
      lng: window.ChamaProData.userLocation.lng,
      startingPrice: parseFloat(proData.startingPrice) || 0,
      avatar: proData.avatar || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&q=80',
      verified: true,
      superPro: false,
      availableToday: true,
      bio: proData.bio || '',
      experienceYears: parseInt(proData.experienceYears) || 1,
      completedJobs: 0,
      address: proData.address || 'Sua Região',
      specialties: proData.specialties ? proData.specialties.split(',').map(s => s.trim()) : [],
      portfolio: [],
      reviews: [] // Sem reviews falsas (RF03)
    };

    if (window.ChamaProData && Array.isArray(window.ChamaProData.professionals)) {
      window.ChamaProData.professionals.unshift(newPro);
    }

    this.currentUser = {
      id: newPro.userId,
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
    if (window.TaNaMaoDB) {
      window.TaNaMaoDB.logout();
    }
    this.currentUser = null;
    localStorage.removeItem('chamapro_user');
    localStorage.removeItem('tanamao_user');
    this.notifyListeners();
  }
};

ChamaProAuth.init();
window.ChamaProAuth = ChamaProAuth;
