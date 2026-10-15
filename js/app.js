/**
 * Tá na Mão - Aplicação Principal (RF01, RF02, RF03, RF04, RF05, RF06)
 * Totalmente responsivo, integrado ao banco de dados e sem dados fictícios.
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Estado da Aplicação
  const state = {
    selectedCategory: 'all',
    searchQuery: '',
    currentSort: 'distance',
    activeModal: null,
    selectedPro: null,
    activeUrgency: 'Hoje',
    ratingStars: 5,
    activeChatProId: null,
    theme: localStorage.getItem('chamapro_theme') || 'light',
    regClientAvatar: null,
    regProAvatar: null,
    currentProfileAvatar: null
  };

  // Processador e compressor de fotos do dispositivo (Canvas)
  function processImageFile(file, maxWidth = 320, maxHeight = 320, quality = 0.85) {
    return new Promise((resolve, reject) => {
      if (!file) return resolve(null);
      if (!file.type || !file.type.startsWith('image/')) {
        return reject(new Error('Por favor, selecione um arquivo de imagem válido (PNG, JPG, WEBP).'));
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(dataUrl);
        };
        img.onerror = () => reject(new Error('Erro ao processar imagem.'));
        img.src = e.target.result;
      };
      reader.onerror = () => reject(new Error('Erro ao ler arquivo do dispositivo.'));
      reader.readAsDataURL(file);
    });
  }

  // Elementos do DOM
  const el = {
    prosGrid: document.getElementById('prosGrid'),
    searchInput: document.getElementById('searchInput'),
    searchBtn: document.getElementById('searchBtn'),
    sortSelect: document.getElementById('sortSelect'),
    resultsSubtitle: document.getElementById('resultsSubtitle'),
    userNavArea: document.getElementById('userNavArea'),
    authModal: document.getElementById('authModal'),
    proModal: document.getElementById('proModal'),
    proModalContent: document.getElementById('proModalContent'),
    quoteModal: document.getElementById('quoteModal'),
    quoteForm: document.getElementById('quoteForm'),
    quoteProName: document.getElementById('quoteProName'),
    quoteCategorySelect: document.getElementById('quoteCategorySelect'),
    reviewModal: document.getElementById('reviewModal'),
    reviewForm: document.getElementById('reviewForm'),
    reviewProName: document.getElementById('reviewProName'),
    chatDrawer: document.getElementById('chatDrawer'),
    chatMessages: document.getElementById('chatMessages'),
    chatInput: document.getElementById('chatInput'),
    sendChatBtn: document.getElementById('sendChatBtn'),
    requestsDrawer: document.getElementById('requestsDrawer'),
    myRequestsList: document.getElementById('myRequestsList'),
    btnMyRequests: document.getElementById('btnMyRequests'),
    btnOpenChat: document.getElementById('btnOpenChat'),
    toastContainer: document.getElementById('toastContainer'),
    dropzone: document.getElementById('photoDropzone'),
    photoPreview: document.getElementById('photoPreview'),
    tabAuthLogin: document.getElementById('tabAuthLogin'),
    tabAuthRegisterClient: document.getElementById('tabAuthRegisterClient'),
    tabAuthRegisterPro: document.getElementById('tabAuthRegisterPro'),
    formLoginClient: document.getElementById('formLoginClient'),
    formRegisterClient: document.getElementById('formRegisterClient'),
    formRegisterPro: document.getElementById('formRegisterPro'),
    regClientAvatarFile: document.getElementById('regClientAvatarFile'),
    regClientAvatarPreview: document.getElementById('regClientAvatarPreview'),
    regProAvatarFile: document.getElementById('regProAvatarFile'),
    regProAvatarPreview: document.getElementById('regProAvatarPreview'),
    regProCategory: document.getElementById('regProCategory'),
    groupCustomCategory: document.getElementById('groupCustomCategory'),
    regProCustomName: document.getElementById('regProCustomName'),
    sidebarCategory: document.getElementById('sidebarCategory'),
    // Modal Meu Perfil & Exclusão
    myProfileModal: document.getElementById('myProfileModal'),
    formEditProfile: document.getElementById('formEditProfile'),
    myProfileAvatarFile: document.getElementById('myProfileAvatarFile'),
    myProfileAvatarPreview: document.getElementById('myProfileAvatarPreview'),
    myProfileBadgeRole: document.getElementById('myProfileBadgeRole'),
    editProfileName: document.getElementById('editProfileName'),
    editProfileEmail: document.getElementById('editProfileEmail'),
    editProfilePhone: document.getElementById('editProfilePhone'),
    proExtraProfileFields: document.getElementById('proExtraProfileFields'),
    editProfileTitle: document.getElementById('editProfileTitle'),
    editProfilePrice: document.getElementById('editProfilePrice'),
    editProfileBio: document.getElementById('editProfileBio'),
    btnTriggerDeleteProfile: document.getElementById('btnTriggerDeleteProfile'),
    deleteConfirmModal: document.getElementById('deleteConfirmModal'),
    btnCancelDelete: document.getElementById('btnCancelDelete'),
    btnConfirmDelete: document.getElementById('btnConfirmDelete')
  };

  function scrollToPros() {
    const prosSection = document.getElementById('profissionais');
    if (prosSection) {
      prosSection.scrollIntoView({ behavior: 'smooth' });
    }
  }
  window.scrollToPros = scrollToPros;

  // Abrir Modal de Gerenciamento do Meu Perfil
  function openMyProfileModal() {
    const user = window.ChamaProAuth.getUser();
    if (!user) {
      openModal(el.authModal);
      activateAuthTab('login');
      return;
    }

    state.currentProfileAvatar = user.avatar;
    if (el.myProfileAvatarPreview) {
      el.myProfileAvatarPreview.src = user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=140&q=80';
    }
    if (el.editProfileName) el.editProfileName.value = user.name || '';
    if (el.editProfileEmail) el.editProfileEmail.value = user.email || '';
    if (el.editProfilePhone) el.editProfilePhone.value = user.phone || (user.proDetails && user.proDetails.phone) || '';

    const isPro = user.role === 'pro';
    if (el.myProfileBadgeRole) {
      el.myProfileBadgeRole.textContent = isPro ? 'Profissional Parceiro' : 'Cliente';
    }

    if (el.proExtraProfileFields) {
      if (isPro) {
        el.proExtraProfileFields.style.display = 'block';
        if (el.editProfileTitle) el.editProfileTitle.value = (user.proDetails && user.proDetails.title) || user.title || '';
        if (el.editProfilePrice) el.editProfilePrice.value = (user.proDetails && user.proDetails.startingPrice) || user.startingPrice || '';
        if (el.editProfileBio) el.editProfileBio.value = (user.proDetails && user.proDetails.bio) || user.bio || '';
      } else {
        el.proExtraProfileFields.style.display = 'none';
      }
    }

    openModal(el.myProfileModal);
  }

  // 2. Renderização da Barra de Usuário no Topo
  function renderUserNav() {
    if (!el.userNavArea) return;
    const user = window.ChamaProAuth.getUser();

    if (user) {
      el.userNavArea.innerHTML = `
        <button id="btnOpenMyProfile" class="nav-profile-pill" title="Clique para ver e personalizar seu perfil">
          <img src="${user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80'}" class="nav-profile-avatar" id="navUserAvatar" alt="${user.name}">
          <span class="nav-profile-name">${user.name}</span>
          <i class="fa-solid fa-gear nav-profile-gear"></i>
        </button>
        <button id="btnLogoutUser" class="nav-btn-logout" title="Sair da conta">
          <i class="fa-solid fa-right-from-bracket"></i>
        </button>
        <button class="nav-btn-register" id="btnRegisterNav">
          <i class="fa-solid fa-plus"></i> Cadastrar serviço
        </button>
      `;

      document.getElementById('btnOpenMyProfile')?.addEventListener('click', openMyProfileModal);

      document.getElementById('btnLogoutUser')?.addEventListener('click', () => {
        window.ChamaProAuth.logout();
        showToast('Sessão encerrada com sucesso.');
        renderUserNav();
        renderPros();
      });

      document.getElementById('btnRegisterNav')?.addEventListener('click', () => {
        if (user.role === 'pro') {
          showToast('Você já é um profissional cadastrado! Edite seus serviços em Meu Perfil.');
          openMyProfileModal();
        } else {
          openModal(el.authModal);
          activateAuthTab('pro');
        }
      });
    } else {
      el.userNavArea.innerHTML = `
        <button class="nav-btn-link" id="btnOpenAuth">
          <i class="fa-regular fa-user"></i> Entrar
        </button>
        <button class="nav-btn-register" id="btnRegisterNav">
          <i class="fa-solid fa-plus"></i> Cadastrar serviço
        </button>
      `;

      document.getElementById('btnOpenAuth')?.addEventListener('click', () => {
        openModal(el.authModal);
        activateAuthTab('login');
      });

      document.getElementById('btnRegisterNav')?.addEventListener('click', () => {
        openModal(el.authModal);
        activateAuthTab('pro');
      });
    }
  }

  // 3. Render Categorias
  function renderCategories() {
    document.querySelectorAll('.hero-cat-btn').forEach(btn => {
      const cat = btn.getAttribute('data-cat');
      if (state.selectedCategory === cat || (state.selectedCategory === 'all' && cat === 'all')) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    if (el.sidebarCategory) {
      el.sidebarCategory.value = state.selectedCategory;
    }
  }

  // 4. Filtro de Profissionais (Real, sem mocks)
  function getFilteredPros() {
    const pros = window.ChamaProData.professionals || [];

    return pros.filter(pro => {
      // Filtro de Categoria
      if (state.selectedCategory !== 'all') {
        const catMap = {
          'automotivo': ['automotivo', 'mecanico'],
          'tecnologia': ['tecnologia', 'informatica', 'celular'],
          'gerais': ['gerais', 'eletricista', 'encanador', 'pintor', 'pedreiro'],
          'casa': ['casa', 'diarista'],
          'alimentacao': ['alimentacao'],
          'educacao': ['educacao'],
          'beleza': ['beleza'],
          'outros': ['outros']
        };
        const allowed = catMap[state.selectedCategory] || [state.selectedCategory];
        const proCat = (pro.category || '').toLowerCase();
        const proProf = (pro.professionName || '').toLowerCase();
        const isMatch = allowed.some(a => proCat === a || proProf.includes(a) || a.includes(proCat));
        if (!isMatch) return false;
      }

      // Filtro de Busca por Termo
      if (state.searchQuery.trim() !== '') {
        const query = state.searchQuery.replace(/^[^\w\sà-úÀ-Ú]+/g, '').trim().toLowerCase();
        if (query) {
          const matchesName = (pro.name || '').toLowerCase().includes(query);
          const matchesTitle = (pro.title || '').toLowerCase().includes(query);
          const matchesCategory = (pro.category || '').toLowerCase().includes(query);
          const matchesProfession = (pro.professionName || '').toLowerCase().includes(query);
          const matchesBio = (pro.bio || '').toLowerCase().includes(query);
          const matchesSpecialty = pro.specialties && pro.specialties.some(s => s.toLowerCase().includes(query));
          if (!matchesName && !matchesTitle && !matchesCategory && !matchesProfession && !matchesBio && !matchesSpecialty) {
            return false;
          }
        }
      }

      return true;
    }).sort((a, b) => {
      if (state.currentSort === 'distance') return (a.distance || 0) - (b.distance || 0);
      if (state.currentSort === 'rating') return (b.rating || 5) - (a.rating || 5);
      if (state.currentSort === 'price_asc') return (a.startingPrice || 0) - (b.startingPrice || 0);
      if (state.currentSort === 'price_desc') return (b.startingPrice || 0) - (a.startingPrice || 0);
      return 0;
    });
  }

  // 5. Renderização dos Cards e Empty States (RF02 & RF03)
  function renderPros() {
    if (!el.prosGrid) return;
    const pros = getFilteredPros();

    // Atualiza marcadores do mapa interativo
    if (window.ChamaProGeo && window.ChamaProGeo.renderMarkers) {
      window.ChamaProGeo.renderMarkers(pros);
    }

    // Atualiza o subtítulo dinamicamente
    if (el.resultsSubtitle) {
      if (state.searchQuery.trim() !== '') {
        el.resultsSubtitle.textContent = `Encontramos ${pros.length} profissional(is) para "${state.searchQuery}"`;
      } else if (state.selectedCategory !== 'all') {
        const catObj = window.ChamaProData.categories.find(c => c.id === state.selectedCategory);
        el.resultsSubtitle.textContent = `Encontramos ${pros.length} profissional(is) na categoria "${catObj ? catObj.name : state.selectedCategory}"`;
      } else {
        el.resultsSubtitle.textContent = pros.length > 0 
          ? `Mostrando ${pros.length} profissional(is) disponível(is)`
          : 'Encontre profissionais qualificados perto de você';
      }
    }

    // Empty State quando não há resultados (RF03)
    if (pros.length === 0) {
      const isFiltered = state.searchQuery.trim() !== '' || state.selectedCategory !== 'all';
      
      el.prosGrid.innerHTML = `
        <div class="empty-state-box">
          <div class="empty-state-icon">
            <i class="fa-solid ${isFiltered ? 'fa-magnifying-glass' : 'fa-handshake'}"></i>
          </div>
          <h3 class="empty-state-title">
            ${isFiltered ? 'Nenhum profissional encontrado para os filtros selecionados' : 'Nenhum profissional cadastrado no momento'}
          </h3>
          <p class="empty-state-desc">
            ${isFiltered 
              ? 'Tente ajustar os termos da pesquisa, selecionar outra categoria ou limpar os filtros para ver todos os profissionais.'
              : 'Seja o primeiro profissional a oferecer seus serviços na plataforma ou convide especialistas da sua região!'}
          </p>
          <div class="empty-state-actions">
            ${isFiltered ? `
              <button class="btn-outline" id="btnResetFilters">
                <i class="fa-solid fa-rotate-left"></i> Limpar Filtros
              </button>
            ` : `
              <button class="btn-primary" id="btnEmptyRegisterPro">
                <i class="fa-solid fa-plus"></i> Cadastrar meus serviços
              </button>
            `}
          </div>
        </div>
      `;

      document.getElementById('btnResetFilters')?.addEventListener('click', resetFilters);
      document.getElementById('btnEmptyRegisterPro')?.addEventListener('click', () => {
        openModal(el.authModal);
        el.tabAuthRegisterPro?.click();
      });
      return;
    }

    // Renderiza Cards Reais
    el.prosGrid.innerHTML = pros.map(pro => `
      <div class="pro-card" data-pro-id="${pro.id}">
        <img src="${pro.avatar}" alt="${pro.name}" class="pro-card-img" loading="lazy">
        <div class="pro-card-body">
          <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
            <h3 class="pro-card-name">${pro.name}</h3>
            ${pro.isCustom ? `<span class="badge-custom-profession"><i class="fa-solid fa-sparkles"></i> Nova Profissão</span>` : ''}
          </div>
          <span class="pro-card-category">${pro.professionName || pro.title}</span>
          <p class="pro-card-desc">${pro.bio || 'Prestador de serviços com atendimento rápido e qualidade garantida.'}</p>
          <div class="pro-card-location">
            <i class="fa-solid fa-location-dot"></i> ${pro.address || 'Sua Região'} ${pro.distance ? `&bull; ${pro.distance.toString().replace('.', ',')} km` : ''}
          </div>
        </div>
        <div class="pro-card-right">
          <div class="pro-card-rating">
            <span class="stars">
              ${'<i class="fa-solid fa-star"></i>'.repeat(Math.floor(pro.rating || 5))}${(pro.rating || 5) % 1 >= 0.5 ? '<i class="fa-solid fa-star-half-stroke"></i>' : ''}
            </span>
            <span>${(pro.rating || 5).toFixed(1)} (${pro.reviewsCount || 0})</span>
          </div>
          <div class="pro-card-status">
            <span class="status-dot"></span> Disponível
          </div>
          <div class="pro-card-actions">
            <button class="btn-card-profile btn-view-profile" data-pro-id="${pro.id}">Ver perfil</button>
            <button class="btn-card-contact btn-request-quote" data-pro-id="${pro.id}"><i class="fa-solid fa-phone"></i> Solicitar Orçamento</button>
          </div>
        </div>
      </div>
    `).join('');

    // Eventos dos cards
    document.querySelectorAll('.btn-view-profile').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        openProModal(btn.getAttribute('data-pro-id'));
      });
    });

    document.querySelectorAll('.btn-request-quote').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        openQuoteModal(btn.getAttribute('data-pro-id'));
      });
    });
  }

  // 6. Modal do Perfil do Profissional
  function openProModal(proId) {
    const pro = window.ChamaProData.professionals.find(p => p.id === proId);
    if (!pro) return;
    state.selectedPro = pro;

    el.proModalContent.innerHTML = `
      <div class="modal-header">
        <h3 class="modal-title">Perfil do Profissional</h3>
        <button class="modal-close" id="btnCloseProModal"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="modal-body">
        <div style="display: flex; gap: 1.25rem; align-items: flex-start; margin-bottom: 1.5rem; flex-wrap: wrap;">
          <img src="${pro.avatar}" alt="${pro.name}" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 3px solid var(--brand-primary);">
          <div style="flex: 1; min-width: 220px;">
            <h2 style="font-size: 1.35rem; font-weight: 800; color: var(--gray-900);">${pro.name} ${pro.verified ? '<i class="fa-solid fa-circle-check" style="color: var(--brand-primary); font-size: 1.05rem;" title="Verificado"></i>' : ''}</h2>
            <p style="color: var(--text-secondary); font-weight: 600;">${pro.professionName || pro.title}</p>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.25rem;"><i class="fa-solid fa-map-pin"></i> ${pro.address || 'Sua Região'}</p>
            <div style="display: flex; gap: 1rem; margin-top: 0.5rem; font-size: 0.88rem;">
              <span style="color: var(--brand-accent); font-weight: 700;"><i class="fa-solid fa-star"></i> ${(pro.rating || 5).toFixed(1)} (${pro.reviewsCount || 0} avaliações)</span>
              ${pro.startingPrice ? `<span style="font-weight: 700; color: var(--brand-success);">A partir de R$ ${pro.startingPrice}</span>` : ''}
            </div>
          </div>
        </div>

        <div style="margin-bottom: 1.25rem; padding: 1rem; background: var(--bg-subtle); border-radius: var(--radius-md);">
          <h4 style="font-size: 0.95rem; font-weight: 700; margin-bottom: 0.5rem;">Sobre os Serviços</h4>
          <p style="font-size: 0.9rem; color: var(--text-secondary); line-height: 1.5;">${pro.bio || 'Profissional dedicado ao atendimento de qualidade e satisfação do cliente.'}</p>
        </div>

        ${pro.specialties && pro.specialties.length > 0 ? `
          <div style="margin-bottom: 1.25rem;">
            <h4 style="font-size: 0.95rem; font-weight: 700; margin-bottom: 0.75rem;">Especialidades</h4>
            <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
              ${pro.specialties.map(spec => `<span style="background: rgba(255, 121, 0, 0.1); color: var(--brand-primary); padding: 0.35rem 0.75rem; border-radius: var(--radius-full); font-size: 0.82rem; font-weight: 600;">${spec}</span>`).join('')}
            </div>
          </div>
        ` : ''}

        <div style="margin-bottom: 1.5rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <h4 style="font-size: 0.95rem; font-weight: 700;">Avaliações de Clientes</h4>
            <button class="btn-outline btn-sm" id="btnOpenReviewModal"><i class="fa-solid fa-pen"></i> Deixar Avaliação</button>
          </div>
          <div id="proReviewsList">
            ${pro.reviews && pro.reviews.length > 0 ? pro.reviews.map(rev => `
              <div style="padding: 0.85rem; border: 1px solid var(--border-color); border-radius: var(--radius-md); margin-bottom: 0.75rem;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.35rem;">
                  <strong style="font-size: 0.88rem;">${rev.author}</strong>
                  <span style="color: var(--brand-primary); font-weight: 700; font-size: 0.85rem;"><i class="fa-solid fa-star"></i> ${rev.rating}</span>
                </div>
                <p style="font-size: 0.85rem; color: var(--text-secondary);">${rev.comment}</p>
              </div>
            `).join('') : '<p style="font-size: 0.85rem; color: var(--text-muted); font-style: italic;">Ainda não há avaliações para este profissional. Seja o primeiro a avaliar após a realização de um serviço!</p>'}
          </div>
        </div>

        <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--border-color);">
          <button class="btn-outline" style="flex: 1; min-width: 140px;" id="btnStartChatPro"><i class="fa-regular fa-comment-dots"></i> Enviar Mensagem</button>
          <button class="btn-primary" style="flex: 1; min-width: 140px;" id="btnModalRequestQuote"><i class="fa-solid fa-paper-plane"></i> Solicitar Orçamento</button>
        </div>
      </div>
    `;

    openModal(el.proModal);

    document.getElementById('btnCloseProModal')?.addEventListener('click', () => closeModal(el.proModal));
    document.getElementById('btnStartChatPro')?.addEventListener('click', () => {
      closeModal(el.proModal);
      openChatWith(pro.id);
    });
    document.getElementById('btnModalRequestQuote')?.addEventListener('click', () => {
      closeModal(el.proModal);
      openQuoteModal(pro.id);
    });
    document.getElementById('btnOpenReviewModal')?.addEventListener('click', () => {
      closeModal(el.proModal);
      openReviewModal(pro.id);
    });
  }

  // 7. Modal de Orçamento
  function openQuoteModal(proId) {
    const pro = window.ChamaProData.professionals.find(p => p.id === proId);
    if (!pro) return;
    state.selectedPro = pro;

    if (el.quoteProName) el.quoteProName.textContent = pro.name;
    if (el.quoteCategorySelect) el.quoteCategorySelect.value = pro.category;
    openModal(el.quoteModal);
  }

  // 8. Modal de Avaliação
  function openReviewModal(proId) {
    const pro = window.ChamaProData.professionals.find(p => p.id === proId);
    if (!pro) return;
    state.selectedPro = pro;

    if (el.reviewProName) el.reviewProName.textContent = pro.name;
    openModal(el.reviewModal);
  }

  // 9. Chat Drawer
  async function openChatWith(proId) {
    state.activeChatProId = proId;
    const pro = window.ChamaProData.professionals.find(p => p.id === proId);

    const proNameEl = document.getElementById('chatProName');
    const proAvatarEl = document.getElementById('chatProAvatar');
    if (proNameEl) proNameEl.textContent = pro ? pro.name : 'Atendimento';
    if (proAvatarEl) proAvatarEl.src = pro ? pro.avatar : 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&q=80';

    await renderChatMessages(proId);
    el.chatDrawer?.classList.add('active');
  }

  async function renderChatMessages(proId) {
    if (!el.chatMessages || !window.TaNaMaoDB) return;
    const messages = await window.TaNaMaoDB.getChatMessages(proId);

    if (messages.length === 0) {
      el.chatMessages.innerHTML = `
        <div style="text-align: center; color: var(--text-muted); font-size: 0.85rem; padding: 2rem 1rem;">
          <i class="fa-regular fa-comments" style="font-size: 2rem; margin-bottom: 0.5rem; display: block; color: var(--brand-primary);"></i>
          Inicie uma conversa direta para tirar dúvidas, combinar horários e detalhes do serviço.
        </div>
      `;
      return;
    }

    el.chatMessages.innerHTML = messages.map(m => `
      <div class="message-bubble ${m.sender === 'client' ? 'user' : 'pro'}">
        <div>${m.text}</div>
        <div class="message-time">${m.time}</div>
      </div>
    `).join('');

    el.chatMessages.scrollTop = el.chatMessages.scrollHeight;
  }

  // 10. Gaveta de Meus Pedidos
  function renderMyRequests() {
    if (!el.myRequestsList) return;
    const requests = window.ChamaProData.myRequests || [];

    if (requests.length === 0) {
      el.myRequestsList.innerHTML = `
        <div style="text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
          <i class="fa-solid fa-clipboard-list" style="font-size: 2.5rem; color: var(--gray-300); margin-bottom: 1rem; display: block;"></i>
          <h4 style="font-weight: 700; color: var(--gray-800); margin-bottom: 0.35rem;">Nenhum pedido solicitado</h4>
          <p style="font-size: 0.85rem;">Quando você solicitar orçamentos para profissionais, eles aparecerão aqui com status em tempo real.</p>
        </div>
      `;
      return;
    }

    el.myRequestsList.innerHTML = requests.map(req => `
      <div style="padding: 1rem; border: 1px solid var(--border-color); border-radius: var(--radius-md); background: var(--bg-surface); margin-bottom: 1rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
          <span style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted);">${req.id}</span>
          <span style="font-size: 0.78rem; padding: 0.2rem 0.6rem; border-radius: var(--radius-full); background: rgba(255,121,0,0.12); color: var(--brand-primary); font-weight: 700;">${req.status}</span>
        </div>
        <h4 style="font-size: 0.95rem; font-weight: 700; margin-bottom: 0.4rem;">${req.serviceTitle}</h4>
        <div style="display: flex; align-items: center; gap: 0.6rem; font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.75rem;">
          <i class="fa-solid fa-user-tie" style="color: var(--brand-primary);"></i>
          <span>${req.proName}</span>
        </div>
        <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 0.75rem;">📅 ${req.date} &bull; ${req.details}</p>
        <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 0.5rem; border-top: 1px dashed var(--border-color);">
          <span style="font-weight: 700; font-size: 0.9rem; color: var(--brand-success);">${req.estimatedPrice}</span>
          ${req.proId ? `<button class="btn-outline btn-sm btn-chat-req" data-pro-id="${req.proId}">Abrir Chat</button>` : ''}
        </div>
      </div>
    `).join('');

    document.querySelectorAll('.btn-chat-req').forEach(btn => {
      btn.addEventListener('click', () => {
        el.requestsDrawer?.classList.remove('active');
        openChatWith(btn.getAttribute('data-pro-id'));
      });
    });
  }

  // Modais Helpers
  function openModal(modalEl) {
    if (!modalEl) return;
    modalEl.classList.add('active');
    state.activeModal = modalEl;
  }

  function closeModal(modalEl) {
    if (!modalEl) return;
    modalEl.classList.remove('active');
    state.activeModal = null;
  }

  // Toast System
  function showToast(message, type = 'success') {
    if (!el.toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const iconClass = type === 'error' ? 'fa-triangle-exclamation' : 'fa-circle-check';
    const iconColor = type === 'error' ? '#ef4444' : 'var(--brand-primary)';
    toast.innerHTML = `
      <i class="fa-solid ${iconClass}" style="color: ${iconColor}; font-size: 1.2rem;"></i>
      <div style="font-weight: 600; font-size: 0.88rem;">${message}</div>
    `;
    el.toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  function resetFilters() {
    state.selectedCategory = 'all';
    state.searchQuery = '';
    if (el.searchInput) el.searchInput.value = '';
    renderCategories();
    renderPros();
  }

  // 11. Toggle Dinâmico do Campo "Outra Profissão..." (RF04)
  if (el.regProCategory) {
    el.regProCategory.addEventListener('change', (e) => {
      if (e.target.value === '__custom__') {
        if (el.groupCustomCategory) el.groupCustomCategory.style.display = 'block';
        if (el.regProCustomName) {
          el.regProCustomName.setAttribute('required', 'true');
          el.regProCustomName.focus();
        }
      } else {
        if (el.groupCustomCategory) el.groupCustomCategory.style.display = 'none';
        if (el.regProCustomName) {
          el.regProCustomName.removeAttribute('required');
          el.regProCustomName.value = '';
        }
      }
    });
  }

  // 12. Submissão do Formulário de Login (RF05)
  if (el.formLoginClient) {
    el.formLoginClient.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail')?.value;
      const pass = document.getElementById('loginPass')?.value;

      try {
        const user = await window.ChamaProAuth.login(email, pass, 'client');
        closeModal(el.authModal);
        showToast(`Bem-vindo(a) de volta, ${user.name}!`);
        renderUserNav();
        renderPros();
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  }

  // 12b. Submissão do Formulário de Cadastro de Cliente (com foto do dispositivo)
  if (el.formRegisterClient) {
    el.formRegisterClient.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('regClientName')?.value;
      const email = document.getElementById('regClientEmail')?.value;
      const pass = document.getElementById('regClientPass')?.value;

      try {
        const user = await window.ChamaProAuth.registerClient({
          name,
          email,
          password: pass,
          avatar: state.regClientAvatar
        });
        closeModal(el.authModal);
        showToast(`Conta criada com sucesso! Bem-vindo(a), ${user.name}!`);
        renderUserNav();
        renderPros();
      } catch (err) {
        showToast(err.message || 'Erro ao criar conta.', 'error');
      }
    });
  }

  // 13. Submissão do Formulário de Cadastro de Profissional (com foto do dispositivo)
  if (el.formRegisterPro) {
    el.formRegisterPro.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('regProName')?.value;
      const title = document.getElementById('regProTitle')?.value;
      const category = el.regProCategory?.value;
      const price = document.getElementById('regProPrice')?.value;
      const bio = document.getElementById('regProBio')?.value;
      const specialties = document.getElementById('regProSpecialties')?.value;
      const phone = document.getElementById('regProPhone')?.value;

      const isCustom = category === '__custom__';
      let customName = '';

      if (isCustom) {
        customName = el.regProCustomName ? el.regProCustomName.value.trim() : '';
        if (!customName || customName.length < 3) {
          showToast('Por favor, informe um nome válido para sua profissão (mínimo de 3 letras).', 'error');
          el.regProCustomName?.focus();
          return;
        }
      }

      try {
        const newPro = await window.ChamaProAuth.registerProfessional({
          name,
          title,
          category,
          isCustom,
          customName,
          startingPrice: price,
          bio,
          specialties,
          phone,
          avatar: state.regProAvatar,
          email: `${name.toLowerCase().replace(/\s+/g, '')}@tanamao.com`
        });

        closeModal(el.authModal);
        showToast(`Parabéns, ${name}! Seu perfil profissional foi cadastrado com sucesso!`);
        
        // Atualiza a lista de opções de profissões para incluir a nova
        await populateProfessionsOptions();
        renderCategories();
        renderPros();
        scrollToPros();
      } catch (err) {
        showToast(err.message || 'Erro ao realizar cadastro.', 'error');
      }
    });
  }

  // 14. Eventos de Upload de Foto do Dispositivo
  if (el.regClientAvatarFile) {
    el.regClientAvatarFile.addEventListener('change', async (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      try {
        const dataUrl = await processImageFile(file, 280, 280, 0.85);
        if (dataUrl) {
          state.regClientAvatar = dataUrl;
          if (el.regClientAvatarPreview) el.regClientAvatarPreview.src = dataUrl;
          showToast('Foto do perfil selecionada!');
        }
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  }

  if (el.regProAvatarFile) {
    el.regProAvatarFile.addEventListener('change', async (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      try {
        const dataUrl = await processImageFile(file, 280, 280, 0.85);
        if (dataUrl) {
          state.regProAvatar = dataUrl;
          if (el.regProAvatarPreview) el.regProAvatarPreview.src = dataUrl;
          showToast('Foto profissional selecionada!');
        }
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  }

  if (el.myProfileAvatarFile) {
    el.myProfileAvatarFile.addEventListener('change', async (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      try {
        const dataUrl = await processImageFile(file, 300, 300, 0.85);
        if (dataUrl) {
          state.currentProfileAvatar = dataUrl;
          if (el.myProfileAvatarPreview) el.myProfileAvatarPreview.src = dataUrl;
          await window.ChamaProAuth.updateProfile({ avatar: dataUrl });
          renderUserNav();
          renderPros();
          showToast('Foto do perfil atualizada com sucesso!');
        }
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  }

  // 15. Submissão do Formulário de Edição de Perfil
  if (el.formEditProfile) {
    el.formEditProfile.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = el.editProfileName?.value;
      const phone = el.editProfilePhone?.value;
      const updates = { name, phone };

      if (state.currentProfileAvatar) {
        updates.avatar = state.currentProfileAvatar;
      }

      const user = window.ChamaProAuth.getUser();
      if (user && user.role === 'pro') {
        if (el.editProfileTitle) updates.title = el.editProfileTitle.value;
        if (el.editProfilePrice) updates.startingPrice = parseFloat(el.editProfilePrice.value) || 0;
        if (el.editProfileBio) updates.bio = el.editProfileBio.value;
      }

      try {
        await window.ChamaProAuth.updateProfile(updates);
        closeModal(el.myProfileModal);
        showToast('Perfil atualizado com sucesso!');
        renderUserNav();
        renderPros();
      } catch (err) {
        showToast(err.message || 'Erro ao atualizar perfil.', 'error');
      }
    });
  }

  // 16. Exclusão Definitiva de Perfil
  if (el.btnTriggerDeleteProfile) {
    el.btnTriggerDeleteProfile.addEventListener('click', () => {
      openModal(el.deleteConfirmModal);
    });
  }

  if (el.btnCancelDelete) {
    el.btnCancelDelete.addEventListener('click', () => {
      closeModal(el.deleteConfirmModal);
    });
  }

  if (el.btnConfirmDelete) {
    el.btnConfirmDelete.addEventListener('click', async () => {
      try {
        await window.ChamaProAuth.deleteProfile();
        closeModal(el.deleteConfirmModal);
        closeModal(el.myProfileModal);
        showToast('Seu perfil foi excluído com sucesso.');
        renderUserNav();
        renderPros();
      } catch (err) {
        showToast(err.message || 'Erro ao excluir perfil.', 'error');
      }
    });
  }

  // Submissão do Orçamento
  if (el.quoteForm) {
    el.quoteForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const desc = document.getElementById('quoteDesc')?.value;
      const category = el.quoteCategorySelect?.value;
      const address = document.getElementById('quoteAddress')?.value;

      if (!desc) return;

      try {
        const newReq = await window.TaNaMaoDB.createQuote({
          proId: state.selectedPro ? state.selectedPro.id : null,
          proName: state.selectedPro ? state.selectedPro.name : 'Profissional',
          category: category,
          serviceTitle: desc.length > 32 ? desc.substring(0, 32) + '...' : desc,
          details: desc,
          urgency: state.activeUrgency,
          estimatedPrice: `A combinar`,
          address: address || 'Sua região'
        });

        window.ChamaProData.myRequests.unshift(newReq);
        closeModal(el.quoteModal);
        showToast('Solicitação de orçamento enviada com sucesso!');
        renderMyRequests();
      } catch (err) {
        showToast('Erro ao enviar solicitação: ' + err.message, 'error');
      }
    });
  }

  // Avaliação
  if (el.reviewForm) {
    el.reviewForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const comment = document.getElementById('reviewComment')?.value;
      if (!comment || !state.selectedPro) return;

      try {
        const newReview = await window.TaNaMaoDB.addReview(state.selectedPro.id, state.ratingStars, comment);
        if (!state.selectedPro.reviews) state.selectedPro.reviews = [];
        state.selectedPro.reviews.unshift(newReview);
        state.selectedPro.reviewsCount = (state.selectedPro.reviewsCount || 0) + 1;

        closeModal(el.reviewModal);
        showToast('Avaliação enviada com sucesso! Obrigado pelo feedback.');
        renderPros();
      } catch (err) {
        showToast('Erro ao salvar avaliação: ' + err.message, 'error');
      }
    });
  }

  // Enviar Mensagem no Chat
  async function sendMessage() {
    if (!el.chatInput || !state.activeChatProId) return;
    const text = el.chatInput.value.trim();
    if (!text) return;

    el.chatInput.value = '';
    await window.TaNaMaoDB.sendChatMessage(state.activeChatProId, text, 'client');
    await renderChatMessages(state.activeChatProId);
  }

  if (el.sendChatBtn) el.sendChatBtn.addEventListener('click', sendMessage);
  if (el.chatInput) {
    el.chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendMessage();
    });
  }

  // Eventos de Busca e Filtros
  if (el.searchInput) {
    el.searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      renderPros();
    });
  }

  if (el.searchBtn) {
    el.searchBtn.addEventListener('click', (e) => {
      e.preventDefault();
      renderPros();
      scrollToPros();
    });
  }

  if (el.sortSelect) {
    el.sortSelect.addEventListener('change', (e) => {
      state.currentSort = e.target.value;
      renderPros();
    });
  }

  // Sidebar Filter Apply
  const btnApplyFilters = document.getElementById('btnApplyFilters');
  if (btnApplyFilters) {
    btnApplyFilters.addEventListener('click', () => {
      if (el.sidebarCategory) {
        state.selectedCategory = el.sidebarCategory.value;
      }
      renderPros();
      renderCategories();
      scrollToPros();
    });
  }

  if (el.sidebarCategory) {
    el.sidebarCategory.addEventListener('change', (e) => {
      state.selectedCategory = e.target.value;
      renderPros();
      renderCategories();
      scrollToPros();
    });
  }

  // Urgency pills click
  document.querySelectorAll('.urgency-option').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('.urgency-option').forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
      state.activeUrgency = opt.getAttribute('data-urgency');
    });
  });

  // Rating Stars Picker
  document.querySelectorAll('#starRatingPicker i').forEach(star => {
    star.addEventListener('click', () => {
      const val = parseInt(star.getAttribute('data-val'));
      state.ratingStars = val;
      document.querySelectorAll('#starRatingPicker i').forEach(s => {
        const sVal = parseInt(s.getAttribute('data-val'));
        if (sVal <= val) {
          s.classList.add('active');
        } else {
          s.classList.remove('active');
        }
      });
    });
  });

  // Fechamento de Modais e Drawers
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal(overlay);
    });
  });

  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
      closeModal(btn.closest('.modal-overlay'));
    });
  });

  document.querySelectorAll('.closeDrawerBtn').forEach(btn => {
    btn.addEventListener('click', () => {
      el.chatDrawer?.classList.remove('active');
      el.requestsDrawer?.classList.remove('active');
    });
  });

  // Alternador de Abas de Autenticação (Login / Cadastrar Cliente / Cadastrar Profissional)
  function activateAuthTab(tabName) {
    [el.tabAuthLogin, el.tabAuthRegisterClient, el.tabAuthRegisterPro].forEach(btn => btn?.classList.remove('active'));
    if (el.formLoginClient) el.formLoginClient.style.display = 'none';
    if (el.formRegisterClient) el.formRegisterClient.style.display = 'none';
    if (el.formRegisterPro) el.formRegisterPro.style.display = 'none';

    if (tabName === 'login') {
      el.tabAuthLogin?.classList.add('active');
      if (el.formLoginClient) el.formLoginClient.style.display = 'block';
    } else if (tabName === 'client') {
      el.tabAuthRegisterClient?.classList.add('active');
      if (el.formRegisterClient) el.formRegisterClient.style.display = 'block';
    } else if (tabName === 'pro') {
      el.tabAuthRegisterPro?.classList.add('active');
      if (el.formRegisterPro) el.formRegisterPro.style.display = 'block';
    }
  }

  // Tabs de Auth
  el.tabAuthLogin?.addEventListener('click', () => activateAuthTab('login'));
  el.tabAuthRegisterClient?.addEventListener('click', () => activateAuthTab('client'));
  el.tabAuthRegisterPro?.addEventListener('click', () => activateAuthTab('pro'));

  // Links rápidos nos formulários
  document.getElementById('linkGoRegisterClient')?.addEventListener('click', (e) => {
    e.preventDefault();
    activateAuthTab('client');
  });
  document.getElementById('linkGoRegisterPro')?.addEventListener('click', (e) => {
    e.preventDefault();
    activateAuthTab('pro');
  });
  document.getElementById('linkClientGoLogin')?.addEventListener('click', (e) => {
    e.preventDefault();
    activateAuthTab('login');
  });
  document.getElementById('linkProGoLogin')?.addEventListener('click', (e) => {
    e.preventDefault();
    activateAuthTab('login');
  });

  // Footer Register Pro Trigger
  document.getElementById('btnRegisterProFooter')?.addEventListener('click', (e) => {
    e.preventDefault();
    openModal(el.authModal);
    activateAuthTab('pro');
  });

  // Listeners de Autenticação
  window.ChamaProAuth.onAuthChange(() => {
    renderUserNav();
    renderPros();
  });

  // INICIALIZAÇÃO DO SISTEMA
  try {
    if (window.TaNaMaoDB) {
      await window.TaNaMaoDB.init();
    }
    await window.ChamaProData.loadFromDatabase();
    await populateProfessionsOptions();
  } catch (err) {
    console.warn('[Tá na Mão] Erro durante inicialização do banco:', err);
  }

  renderUserNav();
  renderCategories();
  renderPros();
  renderMyRequests();
});
