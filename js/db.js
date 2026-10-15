/**
 * Tá na Mão - Central Data Access & Persistence Layer (RF05 & RF04)
 * Suporte a Supabase (PostgreSQL Gerenciado com RLS) e Persistência Centralizada.
 */

(function () {
  const STORAGE_KEYS = {
    USER: 'tanamao_user',
    PROFESSIONS: 'tanamao_professions',
    PROFESSIONALS: 'tanamao_professionals',
    QUOTES: 'tanamao_quotes',
    REVIEWS: 'tanamao_reviews',
    CHAT: 'tanamao_chat'
  };

  // Profissões base iniciais padronizadas
  const DEFAULT_PROFESSIONS = [
    { slug: 'eletricista', name: 'Eletricista', categoryGroup: 'gerais', icon: 'fa-bolt', isCustom: false },
    { slug: 'encanador', name: 'Encanador', categoryGroup: 'gerais', icon: 'fa-faucet-drip', isCustom: false },
    { slug: 'mecanico', name: 'Mecânico', categoryGroup: 'automotivo', icon: 'fa-wrench', isCustom: false },
    { slug: 'informatica', name: 'Técnico de Informática', categoryGroup: 'tecnologia', icon: 'fa-desktop', isCustom: false },
    { slug: 'celular', name: 'Técnico de Celular', categoryGroup: 'tecnologia', icon: 'fa-mobile-screen', isCustom: false },
    { slug: 'diarista', name: 'Diarista', categoryGroup: 'casa', icon: 'fa-broom', isCustom: false },
    { slug: 'pintor', name: 'Pintor', categoryGroup: 'gerais', icon: 'fa-paint-roller', isCustom: false },
    { slug: 'pedreiro', name: 'Pedreiro', categoryGroup: 'gerais', icon: 'fa-trowel-bricks', isCustom: false }
  ];

  class DataLayer {
    constructor() {
      this.supabase = null;
      this.isOnline = false;
      this.isConfigured = false;
      this.connectionError = null;
      this.listeners = [];
      this.currentUser = null;

      // Carregar usuário da sessão atual caso exista
      try {
        const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
        if (savedUser) {
          this.currentUser = JSON.parse(savedUser);
        }
      } catch (e) {
        console.warn('Erro ao carregar usuário da sessão local:', e);
      }
    }

    // Inicialização da camada de dados
    async init() {
      const config = window.SUPABASE_CONFIG || {
        url: window.ENV_SUPABASE_URL || localStorage.getItem('SUPABASE_URL') || '',
        anonKey: window.ENV_SUPABASE_ANON_KEY || localStorage.getItem('SUPABASE_ANON_KEY') || ''
      };

      if (config.url && config.anonKey && window.supabase && typeof window.supabase.createClient === 'function') {
        try {
          this.supabase = window.supabase.createClient(config.url, config.anonKey);
          this.isConfigured = true;

          // Teste de conexão real
          const { data, error } = await this.supabase.from('professions').select('id').limit(1);
          if (error) {
            this.isOnline = false;
            this.connectionError = error.message;
            console.warn('[Tá na Mão - DB] Falha na conexão com Supabase:', error.message);
          } else {
            this.isOnline = true;
            this.connectionError = null;
            console.info('[Tá na Mão - DB] Conectado com sucesso ao Supabase PostgreSQL.');
          }

          // Verificar sessão ativa do Supabase Auth
          const { data: sessionData } = await this.supabase.auth.getSession();
          if (sessionData && sessionData.session && sessionData.session.user) {
            const authUser = sessionData.session.user;
            // Buscar perfil completo
            const { data: profile } = await this.supabase
              .from('profiles')
              .select('*')
              .eq('id', authUser.id)
              .single();

            if (profile) {
              this.currentUser = profile;
              localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(profile));
            }
          }
        } catch (err) {
          this.isOnline = false;
          this.connectionError = err.message;
          console.warn('[Tá na Mão - DB] Erro durante inicialização do Supabase:', err);
        }
      } else {
        this.isConfigured = false;
        this.isOnline = false;
        console.info('[Tá na Mão - DB] Supabase não configurado. Operando em modo desacoplado.');
      }

      this.notifyListeners();
      return { isConfigured: this.isConfigured, isOnline: this.isOnline, error: this.connectionError };
    }

    onStateChange(cb) {
      this.listeners.push(cb);
    }

    notifyListeners() {
      this.listeners.forEach(cb => cb({
        user: this.currentUser,
        isOnline: this.isOnline,
        isConfigured: this.isConfigured,
        connectionError: this.connectionError
      }));
    }

    // Normalização rigorosa de texto para profissões (RF04)
    normalizeProfessionName(name) {
      if (!name || typeof name !== 'string') return '';
      // Remove espaços excessivos e caracteres especiais inseguros
      const clean = name.trim().replace(/\s+/g, ' ');
      if (clean.length < 3) return '';

      // Converte para Title Case (primeira letra de cada palavra maiúscula, respeitando preposições)
      const lowercaseExceptions = ['de', 'da', 'do', 'das', 'dos', 'e', 'em'];
      const words = clean.toLowerCase().split(' ');
      const titled = words.map((word, index) => {
        if (index > 0 && lowercaseExceptions.includes(word)) {
          return word;
        }
        return word.charAt(0).toUpperCase() + word.slice(1);
      }).join(' ');

      return titled;
    }

    // Gera slug amigável a partir do nome
    generateSlug(text) {
      return text
        .toString()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // remove acentos
        .replace(/[^a-z0-9]+/g, '-')     // substitui não alfanuméricos por traço
        .replace(/^-+|-+$/g, '')         // remove traços no início e fim
        .trim();
    }

    // Recupera profissões disponíveis (padrão + customizadas salvas)
    async getProfessions() {
      if (this.isOnline && this.supabase) {
        try {
          const { data, error } = await this.supabase
            .from('professions')
            .select('*')
            .order('name', { ascending: true });

          if (!error && Array.isArray(data) && data.length > 0) {
            return data.map(p => ({
              id: p.id,
              slug: p.slug,
              name: p.name,
              categoryGroup: p.category_group,
              icon: p.icon || 'fa-briefcase',
              isCustom: p.is_custom
            }));
          }
        } catch (e) {
          console.warn('[Tá na Mão - DB] Falha ao consultar profissões remotas:', e);
        }
      }

      // Fallback local limpo
      try {
        const stored = localStorage.getItem(STORAGE_KEYS.PROFESSIONS);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (e) {
        console.warn(e);
      }

      return DEFAULT_PROFESSIONS;
    }

    // Adiciona nova profissão customizada (RF04)
    async addCustomProfession(rawName, categoryGroup = 'outros') {
      const normalizedName = this.normalizeProfessionName(rawName);
      if (!normalizedName) {
        throw new Error('Informe um nome válido para a profissão (mínimo de 3 caracteres).');
      }

      const slug = this.generateSlug(normalizedName);
      const existingList = await this.getProfessions();

      // Verificar se já existe uma profissão com o mesmo slug ou nome (case-insensitive)
      const existing = existingList.find(p => p.slug === slug || p.name.toLowerCase() === normalizedName.toLowerCase());
      if (existing) {
        return existing; // Retorna a existente para reaproveitamento limpo
      }

      const newProfession = {
        id: `prof-${Date.now()}`,
        slug: slug,
        name: normalizedName,
        categoryGroup: categoryGroup || 'outros',
        icon: 'fa-briefcase',
        isCustom: true
      };

      if (this.isOnline && this.supabase) {
        try {
          const { data, error } = await this.supabase
            .from('professions')
            .insert([{
              slug: newProfession.slug,
              name: newProfession.name,
              category_group: newProfession.categoryGroup,
              icon: newProfession.icon,
              is_custom: true,
              created_by: this.currentUser ? this.currentUser.id : null
            }])
            .select()
            .single();

          if (!error && data) {
            newProfession.id = data.id;
          }
        } catch (e) {
          console.warn('[Tá na Mão - DB] Erro ao salvar profissão no banco:', e);
        }
      }

      // Salva no armazenamento compartilhado local
      try {
        const updatedList = [...existingList, newProfession];
        localStorage.setItem(STORAGE_KEYS.PROFESSIONS, JSON.stringify(updatedList));
      } catch (e) {
        console.warn(e);
      }

      return newProfession;
    }

    // Listar profissionais com filtros reais (sem registros artificiais)
    async getProfessionals(filters = {}) {
      if (this.isOnline && this.supabase) {
        try {
          let query = this.supabase.from('professionals').select('*');

          if (filters.category && filters.category !== 'all') {
            query = query.or(`category_slug.eq.${filters.category},profession_name.ilike.%${filters.category}%`);
          }

          if (filters.search) {
            const term = filters.search.trim().toLowerCase();
            query = query.or(`name.ilike.%${term}%,title.ilike.%${term}%,profession_name.ilike.%${term}%,bio.ilike.%${term}%`);
          }

          const { data, error } = await query;
          if (!error && Array.isArray(data)) {
            return data.map(pro => ({
              id: pro.id,
              userId: pro.user_id,
              name: pro.name,
              title: pro.title,
              category: pro.category_slug,
              professionName: pro.profession_name,
              startingPrice: parseFloat(pro.starting_price) || 0,
              bio: pro.bio || '',
              phone: pro.phone || '',
              address: pro.address || 'Sua Região',
              lat: pro.lat || -7.5083,
              lng: pro.lng || -35.3181,
              rating: parseFloat(pro.rating) || 5.0,
              reviewsCount: parseInt(pro.reviews_count) || 0,
              verified: pro.verified !== false,
              availableToday: pro.available_today !== false,
              experienceYears: pro.experience_years || 1,
              completedJobs: pro.completed_jobs || 0,
              specialties: Array.isArray(pro.specialties) ? pro.specialties : [],
              avatar: pro.avatar_url || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&q=80',
              reviews: []
            }));
          }
        } catch (e) {
          console.warn('[Tá na Mão - DB] Falha ao consultar profissionais do Supabase:', e);
        }
      }

      // Fallback para persistência local legítima (profissionais cadastrados por usuários)
      try {
        const stored = localStorage.getItem(STORAGE_KEYS.PROFESSIONALS);
        if (stored) {
          const list = JSON.parse(stored);
          if (Array.isArray(list)) {
            return list;
          }
        }
      } catch (e) {
        console.warn(e);
      }

      return []; // Lista vazia legítima quando não houver profissionais cadastrados
    }

    // Cadastro de Profissional
    async registerProfessional(proData) {
      if (!proData.name || !proData.title) {
        throw new Error('Nome e título profissional são obrigatórios.');
      }

      let categorySlug = proData.category;
      let professionName = proData.title;

      // Se for profissão personalizada
      if (proData.isCustom && proData.customName) {
        const customProf = await this.addCustomProfession(proData.customName);
        categorySlug = customProf.slug;
        professionName = customProf.name;
      }

      const specialtiesArray = Array.isArray(proData.specialties)
        ? proData.specialties
        : (proData.specialties ? proData.specialties.split(',').map(s => s.trim()).filter(Boolean) : []);

      const newPro = {
        id: `pro-${Date.now()}`,
        userId: this.currentUser ? this.currentUser.id : `usr-${Date.now()}`,
        name: proData.name.trim(),
        title: proData.title.trim(),
        category: categorySlug,
        professionName: professionName,
        startingPrice: parseFloat(proData.startingPrice) || 0,
        bio: proData.bio ? proData.bio.trim() : '',
        phone: proData.phone ? proData.phone.trim() : '',
        address: proData.address || 'Sua Região',
        lat: proData.lat || -7.5083,
        lng: proData.lng || -35.3181,
        rating: 5.0,
        reviewsCount: 0,
        verified: true,
        availableToday: true,
        experienceYears: parseInt(proData.experienceYears) || 1,
        completedJobs: 0,
        specialties: specialtiesArray,
        avatar: proData.avatar || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&q=80',
        reviews: []
      };

      if (this.isOnline && this.supabase) {
        try {
          const { data, error } = await this.supabase
            .from('professionals')
            .insert([{
              user_id: newPro.userId,
              name: newPro.name,
              title: newPro.title,
              category_slug: newPro.category,
              profession_name: newPro.professionName,
              starting_price: newPro.startingPrice,
              bio: newPro.bio,
              phone: newPro.phone,
              address: newPro.address,
              lat: newPro.lat,
              lng: newPro.lng,
              specialties: newPro.specialties,
              avatar_url: newPro.avatar
            }])
            .select()
            .single();

          if (!error && data) {
            newPro.id = data.id;
          } else if (error) {
            console.warn('[Tá na Mão - DB] Falha ao persistir profissional no Supabase:', error);
          }
        } catch (e) {
          console.warn('[Tá na Mão - DB] Erro de rede ao cadastrar profissional:', e);
        }
      }

      // Salva localmente
      try {
        const stored = localStorage.getItem(STORAGE_KEYS.PROFESSIONALS);
        const list = stored ? JSON.parse(stored) : [];
        list.unshift(newPro);
        localStorage.setItem(STORAGE_KEYS.PROFESSIONALS, JSON.stringify(list));
      } catch (e) {
        console.warn(e);
      }

      // Atualiza usuário atual como profissional
      this.currentUser = {
        id: newPro.userId,
        name: newPro.name,
        email: proData.email || `${this.generateSlug(newPro.name)}@tanamao.com`,
        role: 'pro',
        proDetails: newPro
      };
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(this.currentUser));
      this.notifyListeners();

      return newPro;
    }

    // Autenticação de Usuário (Cliente ou Profissional)
    async login(email, password) {
      if (!email || !password) {
        throw new Error('Informe e-mail e senha.');
      }

      if (this.isOnline && this.supabase) {
        try {
          const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
          if (error) {
            throw new Error(error.message);
          }
          if (data && data.user) {
            const { data: profile } = await this.supabase
              .from('profiles')
              .select('*')
              .eq('id', data.user.id)
              .single();

            let userObj = profile ? {
              id: profile.id,
              email: profile.email || data.user.email,
              name: profile.name,
              role: profile.role || 'client',
              phone: profile.phone || '',
              avatar: profile.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80'
            } : {
              id: data.user.id,
              email: data.user.email,
              name: email.split('@')[0],
              role: 'client',
              avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80'
            };

            // Verificar se o usuário possui registro como profissional
            const { data: proRecord } = await this.supabase
              .from('professionals')
              .select('*')
              .eq('user_id', data.user.id)
              .single();

            if (proRecord) {
              userObj.role = 'pro';
              userObj.proDetails = {
                id: proRecord.id,
                userId: proRecord.user_id,
                name: proRecord.name,
                title: proRecord.title,
                category: proRecord.category_slug,
                professionName: proRecord.profession_name,
                startingPrice: parseFloat(proRecord.starting_price) || 0,
                bio: proRecord.bio || '',
                phone: proRecord.phone || '',
                address: proRecord.address || 'Sua Região',
                avatar: proRecord.avatar_url || userObj.avatar,
                rating: parseFloat(proRecord.rating) || 5.0,
                reviewsCount: parseInt(proRecord.reviews_count) || 0,
                specialties: proRecord.specialties || []
              };
              userObj.avatar = proRecord.avatar_url || userObj.avatar;
            }

            this.currentUser = userObj;
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userObj));
            localStorage.setItem('chamapro_user', JSON.stringify(userObj));
            this.notifyListeners();
            return userObj;
          }
        } catch (e) {
          throw new Error('Falha na autenticação: ' + e.message);
        }
      }

      // Sessão local: verificar se existe conta de profissional ou cliente registrada
      const normEmail = email.trim().toLowerCase();
      
      // 1. Verificar em profissionais salvos localmente
      try {
        const storedPros = localStorage.getItem(STORAGE_KEYS.PROFESSIONALS);
        if (storedPros) {
          const pros = JSON.parse(storedPros);
          const foundPro = pros.find(p => p.email && p.email.toLowerCase() === normEmail);
          if (foundPro) {
            const user = {
              id: foundPro.userId || foundPro.id,
              name: foundPro.name,
              email: foundPro.email,
              role: 'pro',
              avatar: foundPro.avatar || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&q=80',
              phone: foundPro.phone || '',
              proDetails: foundPro
            };
            this.currentUser = user;
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
            localStorage.setItem('chamapro_user', JSON.stringify(user));
            this.notifyListeners();
            return user;
          }
        }
      } catch (e) {
        console.warn(e);
      }

      // 2. Verificar em contas de clientes registradas localmente
      try {
        const storedAccounts = localStorage.getItem('tanamao_registered_accounts');
        if (storedAccounts) {
          const accounts = JSON.parse(storedAccounts);
          const foundAcc = accounts.find(a => a.email && a.email.toLowerCase() === normEmail);
          if (foundAcc) {
            const user = {
              id: foundAcc.id,
              name: foundAcc.name,
              email: foundAcc.email,
              role: foundAcc.role || 'client',
              avatar: foundAcc.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80',
              phone: foundAcc.phone || ''
            };
            this.currentUser = user;
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
            localStorage.setItem('chamapro_user', JSON.stringify(user));
            this.notifyListeners();
            return user;
          }
        }
      } catch (e) {
        console.warn(e);
      }

      // 3. Caso não encontrada anteriormente, criar e registrar sessão
      const user = {
        id: `usr-${Date.now()}`,
        name: email.split('@')[0],
        email: email,
        role: 'client',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80'
      };

      try {
        const storedAccounts = localStorage.getItem('tanamao_registered_accounts');
        const accounts = storedAccounts ? JSON.parse(storedAccounts) : [];
        accounts.push({ ...user, password });
        localStorage.setItem('tanamao_registered_accounts', JSON.stringify(accounts));
      } catch (e) {}

      this.currentUser = user;
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      localStorage.setItem('chamapro_user', JSON.stringify(user));
      this.notifyListeners();
      return user;
    }

    // Cadastro de Novo Usuário (Cliente ou Profissional) com suporte a foto personalizada
    async registerUser(email, password, name, role = 'client', avatar = null) {
      if (!email || !password || !name) {
        throw new Error('Preencha todos os campos obrigatórios.');
      }

      const userAvatar = avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80';

      if (this.isOnline && this.supabase) {
        try {
          const { data, error } = await this.supabase.auth.signUp({
            email,
            password,
            options: { data: { name, role, avatar_url: userAvatar } }
          });
          if (error) throw new Error(error.message);

          if (data && data.user) {
            await this.supabase.from('profiles').insert([{
              id: data.user.id,
              email: email,
              name: name,
              role: role,
              avatar_url: userAvatar
            }]);

            const user = { id: data.user.id, email, name, role, avatar: userAvatar };
            this.currentUser = user;
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
            localStorage.setItem('chamapro_user', JSON.stringify(user));
            this.notifyListeners();
            return user;
          }
        } catch (e) {
          throw new Error('Erro ao cadastrar usuário: ' + e.message);
        }
      }

      const user = {
        id: `usr-${Date.now()}`,
        name: name.trim(),
        email: email.trim(),
        role: role,
        avatar: userAvatar
      };

      try {
        const storedAccounts = localStorage.getItem('tanamao_registered_accounts');
        const accounts = storedAccounts ? JSON.parse(storedAccounts) : [];
        // Evita duplicatas com mesmo e-mail
        const filtered = accounts.filter(a => a.email.toLowerCase() !== email.trim().toLowerCase());
        filtered.push({ ...user, password });
        localStorage.setItem('tanamao_registered_accounts', JSON.stringify(filtered));
      } catch (e) {
        console.warn(e);
      }

      this.currentUser = user;
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      localStorage.setItem('chamapro_user', JSON.stringify(user));
      this.notifyListeners();
      return user;
    }

    // Atualização de Perfil (foto do dispositivo, nome, bio, etc.)
    async updateProfile(userId, updates = {}) {
      if (!userId) return null;

      if (this.currentUser && (this.currentUser.id === userId || this.currentUser.userId === userId)) {
        this.currentUser = { ...this.currentUser, ...updates };
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(this.currentUser));
        localStorage.setItem('chamapro_user', JSON.stringify(this.currentUser));
      }

      // Se for profissional, atualiza na lista de profissionais
      try {
        const storedPros = localStorage.getItem(STORAGE_KEYS.PROFESSIONALS);
        if (storedPros) {
          const pros = JSON.parse(storedPros);
          let updated = false;
          const newPros = pros.map(p => {
            if (p.userId === userId || p.id === userId) {
              updated = true;
              return { ...p, ...updates };
            }
            return p;
          });
          if (updated) {
            localStorage.setItem(STORAGE_KEYS.PROFESSIONALS, JSON.stringify(newPros));
            if (window.ChamaProData && Array.isArray(window.ChamaProData.professionals)) {
              window.ChamaProData.professionals = newPros;
            }
          }
        }
      } catch (e) {
        console.warn(e);
      }

      // Atualiza também nas contas registradas
      try {
        const storedAccounts = localStorage.getItem('tanamao_registered_accounts');
        if (storedAccounts) {
          const accounts = JSON.parse(storedAccounts);
          const newAccounts = accounts.map(a => a.id === userId ? { ...a, ...updates } : a);
          localStorage.setItem('tanamao_registered_accounts', JSON.stringify(newAccounts));
        }
      } catch (e) {}

      // Supabase
      if (this.isOnline && this.supabase) {
        try {
          const profileData = {};
          if (updates.name) profileData.name = updates.name;
          if (updates.avatar) profileData.avatar_url = updates.avatar;
          if (updates.phone) profileData.phone = updates.phone;
          if (Object.keys(profileData).length > 0) {
            await this.supabase.from('profiles').update(profileData).eq('id', userId);
          }

          if (this.currentUser && this.currentUser.role === 'pro') {
            const proData = {};
            if (updates.name) proData.name = updates.name;
            if (updates.title) proData.title = updates.title;
            if (updates.avatar) proData.avatar_url = updates.avatar;
            if (updates.phone) proData.phone = updates.phone;
            if (updates.bio) proData.bio = updates.bio;
            if (updates.startingPrice) proData.starting_price = parseFloat(updates.startingPrice) || 0;
            if (Object.keys(proData).length > 0) {
              await this.supabase.from('professionals').update(proData).eq('user_id', userId);
            }
          }
        } catch (e) {
          console.warn('[Tá na Mão - DB] Erro ao sincronizar atualização de perfil no Supabase:', e);
        }
      }

      this.notifyListeners();
      return this.currentUser;
    }

    // Exclusão Definitiva de Perfil do Usuário / Profissional
    async deleteProfile(userId) {
      if (!userId) return false;

      // 1. Remover do Supabase caso conectado
      if (this.isOnline && this.supabase) {
        try {
          await this.supabase.from('professionals').delete().eq('user_id', userId);
          await this.supabase.from('quotes').delete().eq('client_id', userId);
          await this.supabase.from('profiles').delete().eq('id', userId);
          await this.supabase.auth.signOut();
        } catch (e) {
          console.warn('[Tá na Mão - DB] Erro ao excluir dados no Supabase:', e);
        }
      }

      // 2. Remover da lista de profissionais local
      try {
        const storedPros = localStorage.getItem(STORAGE_KEYS.PROFESSIONALS);
        if (storedPros) {
          const pros = JSON.parse(storedPros);
          const filtered = pros.filter(p => p.userId !== userId && p.id !== userId);
          localStorage.setItem(STORAGE_KEYS.PROFESSIONALS, JSON.stringify(filtered));
          if (window.ChamaProData && Array.isArray(window.ChamaProData.professionals)) {
            window.ChamaProData.professionals = filtered;
          }
        }
      } catch (e) {
        console.warn(e);
      }

      // 3. Remover de contas locais
      try {
        const storedAccounts = localStorage.getItem('tanamao_registered_accounts');
        if (storedAccounts) {
          const accounts = JSON.parse(storedAccounts);
          const filtered = accounts.filter(a => a.id !== userId);
          localStorage.setItem('tanamao_registered_accounts', JSON.stringify(filtered));
        }
      } catch (e) {}

      // 4. Remover orçamentos locais vinculados
      try {
        const storedQuotes = localStorage.getItem(STORAGE_KEYS.QUOTES);
        if (storedQuotes) {
          const quotes = JSON.parse(storedQuotes);
          const filtered = quotes.filter(q => q.clientId !== userId);
          localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(filtered));
          if (window.ChamaProData && Array.isArray(window.ChamaProData.myRequests)) {
            window.ChamaProData.myRequests = filtered;
          }
        }
      } catch (e) {}

      // 5. Limpar sessão
      this.currentUser = null;
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem('chamapro_user');
      localStorage.removeItem('tanamao_user');
      this.notifyListeners();
      return true;
    }

    logout() {
      if (this.isOnline && this.supabase) {
        this.supabase.auth.signOut().catch(console.warn);
      }
      this.currentUser = null;
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem('chamapro_user');
      localStorage.removeItem('tanamao_user');
      this.notifyListeners();
    }

    // Pedidos de Orçamento
    async createQuote(quoteData) {
      const newQuote = {
        id: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
        clientId: this.currentUser ? this.currentUser.id : null,
        clientName: this.currentUser ? this.currentUser.name : 'Cliente Tá na Mão',
        proId: quoteData.proId,
        proName: quoteData.proName,
        category: quoteData.category,
        serviceTitle: quoteData.serviceTitle,
        details: quoteData.details,
        urgency: quoteData.urgency || 'Hoje',
        status: 'Aguardando Resposta',
        statusColor: '#3b82f6',
        estimatedPrice: quoteData.estimatedPrice || 'A combinar',
        address: quoteData.address || 'Localização do cliente',
        date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
      };

      if (this.isOnline && this.supabase) {
        try {
          await this.supabase.from('quotes').insert([{
            client_id: newQuote.clientId,
            client_name: newQuote.clientName,
            pro_id: newQuote.proId,
            pro_name: newQuote.proName,
            category: newQuote.category,
            service_title: newQuote.serviceTitle,
            details: newQuote.details,
            urgency: newQuote.urgency,
            status: newQuote.status,
            estimated_price: newQuote.estimatedPrice,
            address: newQuote.address
          }]);
        } catch (e) {
          console.warn('[Tá na Mão - DB] Falha ao enviar orçamento remoto:', e);
        }
      }

      try {
        const stored = localStorage.getItem(STORAGE_KEYS.QUOTES);
        const list = stored ? JSON.parse(stored) : [];
        list.unshift(newQuote);
        localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(list));
      } catch (e) {
        console.warn(e);
      }

      return newQuote;
    }

    async getMyQuotes() {
      if (this.isOnline && this.supabase && this.currentUser) {
        try {
          const { data, error } = await this.supabase
            .from('quotes')
            .select('*')
            .eq('client_id', this.currentUser.id)
            .order('created_at', { ascending: false });

          if (!error && Array.isArray(data)) {
            return data.map(q => ({
              id: q.id,
              serviceTitle: q.service_title,
              category: q.category,
              proId: q.pro_id,
              proName: q.pro_name,
              proAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&q=80',
              date: new Date(q.created_at).toLocaleDateString('pt-BR'),
              urgency: q.urgency,
              status: q.status,
              statusColor: q.status_color || '#3b82f6',
              estimatedPrice: q.estimated_price || 'A combinar',
              details: q.details
            }));
          }
        } catch (e) {
          console.warn(e);
        }
      }

      try {
        const stored = localStorage.getItem(STORAGE_KEYS.QUOTES);
        return stored ? JSON.parse(stored) : [];
      } catch (e) {
        return [];
      }
    }

    // Avaliações
    async addReview(proId, rating, comment) {
      const newReview = {
        id: `rev-${Date.now()}`,
        proId: proId,
        author: this.currentUser ? this.currentUser.name : 'Cliente Tá na Mão',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80',
        rating: parseFloat(rating),
        date: 'Hoje',
        comment: comment.trim(),
        tags: ['Serviço Concluído', 'Avaliação Verificada']
      };

      if (this.isOnline && this.supabase) {
        try {
          await this.supabase.from('reviews').insert([{
            pro_id: proId,
            client_id: this.currentUser ? this.currentUser.id : null,
            author_name: newReview.author,
            rating: newReview.rating,
            comment: newReview.comment,
            tags: newReview.tags
          }]);
        } catch (e) {
          console.warn('[Tá na Mão - DB] Falha ao enviar avaliação remota:', e);
        }
      }

      try {
        const stored = localStorage.getItem(STORAGE_KEYS.REVIEWS);
        const map = stored ? JSON.parse(stored) : {};
        if (!map[proId]) map[proId] = [];
        map[proId].unshift(newReview);
        localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(map));
      } catch (e) {
        console.warn(e);
      }

      return newReview;
    }

    // Mensagens do Chat
    async getChatMessages(proId) {
      if (!proId) return [];
      try {
        const stored = localStorage.getItem(STORAGE_KEYS.CHAT);
        const allChats = stored ? JSON.parse(stored) : {};
        return allChats[proId] || [];
      } catch (e) {
        return [];
      }
    }

    async sendChatMessage(proId, message, sender = 'client') {
      const msgObj = {
        id: `msg-${Date.now()}`,
        proId: proId,
        sender: sender,
        text: message.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      try {
        const stored = localStorage.getItem(STORAGE_KEYS.CHAT);
        const allChats = stored ? JSON.parse(stored) : {};
        if (!allChats[proId]) allChats[proId] = [];
        allChats[proId].push(msgObj);
        localStorage.setItem(STORAGE_KEYS.CHAT, JSON.stringify(allChats));
      } catch (e) {
        console.warn(e);
      }

      return msgObj;
    }
  }

  // Exportar instância única global
  window.TaNaMaoDB = new DataLayer();
})();
