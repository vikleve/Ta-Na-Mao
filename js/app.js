/**
 * ChamaPro - Application Logic, Auth Integration & GPS Map Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  // Application State
  const state = {
    selectedCategory: 'all',
    searchQuery: '',
    currentFilter: 'all',
    currentSort: 'distance', // Default order by real GPS proximity
    activeModal: null,
    selectedPro: null,
    activeUrgency: 'Hoje',
    ratingStars: 5,
    activeChatProId: 'pro-1',
    theme: localStorage.getItem('chamapro_theme') || 'light'
  };

  // DOM Elements
  const el = {
    categoriesGrid: document.getElementById('categoriesGrid'),
    prosGrid: document.getElementById('prosGrid'),
    searchInput: document.getElementById('searchInput'),
    searchBtn: document.getElementById('searchBtn'),
    filterPills: document.querySelectorAll('.filter-pill'),
    sortSelect: document.getElementById('sortSelect'),
    themeToggle: document.getElementById('themeToggle'),
    proModal: document.getElementById('proModal'),
    proModalContent: document.getElementById('proModalContent'),
    quoteModal: document.getElementById('quoteModal'),
    quoteForm: document.getElementById('quoteForm'),
    quoteProName: document.getElementById('quoteProName'),
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
    fileInput: document.getElementById('photoInput'),
    dropzone: document.getElementById('photoDropzone'),
    photoPreview: document.getElementById('photoPreview'),

    // Auth & Geo Elements
    userNavArea: document.getElementById('userNavArea'),
    authModal: document.getElementById('authModal'),
    btnOpenAuth: document.getElementById('btnOpenAuth'),
    btnActivateGPS: document.getElementById('btnActivateGPS'),
    btnToggleMap: document.getElementById('btnToggleMap'),
    gpsStatusText: document.getElementById('gpsStatusText'),
    mapWrapper: document.getElementById('mapWrapper'),
    tabAuthLogin: document.getElementById('tabAuthLogin'),
    tabAuthRegisterPro: document.getElementById('tabAuthRegisterPro'),
    formLoginClient: document.getElementById('formLoginClient'),
    formRegisterPro: document.getElementById('formRegisterPro')
  };

  // Global helper for map pin popup actions
  function scrollToPros() {
    const prosSection = document.getElementById('profissionais');
    if (prosSection) {
      prosSection.scrollIntoView({ behavior: 'smooth' });
    }
  }
  window.scrollToPros = scrollToPros;

  window.ChamaProAppFilterCategory = (catId) => {
    state.selectedCategory = catId;
    state.searchQuery = '';
    if (el.searchInput) el.searchInput.value = '';
    renderCategories();
    renderPros();
    if (window.ChamaProGeo && window.ChamaProGeo.renderMarkers) {
      window.ChamaProGeo.renderMarkers(getFilteredPros());
    }
    scrollToPros();
  };

  // Initialize Theme
  document.documentElement.setAttribute('data-theme', state.theme);
  updateThemeIcon();

  // Initialize Auth UI
  renderUserNav();
  window.ChamaProAuth.onAuthChange(() => {
    renderUserNav();
    renderPros();
  });

  // Initialize Map Engine
  setTimeout(() => {
    window.ChamaProGeo.initMap('leafletMap');
  }, 300);

  // Render User Navbar Persona
  // Render User Navbar Persona
  function renderUserNav() {
    if (!el.userNavArea) return;
    const user = window.ChamaProAuth.getUser();

    if (user && user.id !== 'usr-client-demo') {
      const isPro = user.role === 'pro';
      el.userNavArea.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.6rem; color: #fff;">
          <img src="${user.avatar}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; border: 1.5px solid var(--yellow);">
          <span style="font-size: 0.86rem; font-weight: 700; color: #fff;">${user.name}</span>
          <button id="btnLogoutUser" style="background: none; border: none; color: rgba(255,255,255,0.7); font-size: 0.9rem; cursor: pointer;" title="Sair"><i class="fa-solid fa-right-from-bracket"></i></button>
        </div>
        <button class="nav-btn-register" id="btnRegisterNav">
          <i class="fa-solid fa-plus"></i> Cadastrar serviço
        </button>
      `;
      document.getElementById('btnLogoutUser')?.addEventListener('click', () => {
        window.ChamaProAuth.logout();
        showToast('Sessão encerrada.');
        renderUserNav();
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
    }

    document.getElementById('btnOpenAuth')?.addEventListener('click', () => {
      openModal(el.authModal);
      if (el.tabAuthLogin) el.tabAuthLogin.click();
    });
    document.getElementById('btnRegisterNav')?.addEventListener('click', () => {
      openModal(el.authModal);
      if (el.tabAuthRegisterPro) el.tabAuthRegisterPro.click();
    });
  }

  // 1. Render Categories (Sync with hero bar & sidebar)
  function renderCategories() {
    // Update active state in hero categories bar
    document.querySelectorAll('.hero-cat-btn').forEach(btn => {
      const cat = btn.getAttribute('data-cat');
      if (state.selectedCategory === cat || (state.selectedCategory === 'all' && cat === 'all')) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    const sidebarCat = document.getElementById('sidebarCategory');
    if (sidebarCat) {
      sidebarCat.value = state.selectedCategory;
    }
  }

  // 2. Filter & Sort Professionals
  function getFilteredPros() {
    return window.ChamaProData.professionals.filter(pro => {
      // Category Filter with aliases mapping
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
        if (!allowed.includes(pro.category)) {
          return false;
        }
      }

      // Search Keyword Filter
      if (state.searchQuery.trim() !== '') {
        const query = state.searchQuery.replace(/^[^\w\sà-úÀ-Ú]+/g, '').trim().toLowerCase();
        if (query) {
          const matchesName = pro.name.toLowerCase().includes(query);
          const matchesTitle = pro.title.toLowerCase().includes(query);
          const matchesCategory = pro.category.toLowerCase().includes(query);
          const matchesBio = pro.bio.toLowerCase().includes(query);
          const matchesSpecialty = pro.specialties && pro.specialties.some(s => s.toLowerCase().includes(query));
          if (!matchesName && !matchesTitle && !matchesCategory && !matchesBio && !matchesSpecialty) {
            return false;
          }
        }
      }

      return true;
    }).sort((a, b) => {
      if (state.currentSort === 'distance') return a.distance - b.distance;
      if (state.currentSort === 'rating') return b.rating - a.rating;
      if (state.currentSort === 'price_asc') return a.startingPrice - b.startingPrice;
      if (state.currentSort === 'price_desc') return b.startingPrice - a.startingPrice;
      return 0;
    });
  }

  // 3. Render Professionals Cards
  function renderPros() {
    if (!el.prosGrid) return;
    const pros = getFilteredPros();

    // Re-render map markers alongside grid if geo exists
    if (window.ChamaProGeo && window.ChamaProGeo.renderMarkers) {
      window.ChamaProGeo.renderMarkers(pros);
    }

    // Update Subtitle to match the reference image exactly
    const subtitleEl = document.getElementById('resultsSubtitle');
    if (subtitleEl) {
      if (state.searchQuery.trim() !== '') {
        subtitleEl.textContent = `Encontramos ${pros.length} serviços para "${state.searchQuery}"`;
      } else if (state.selectedCategory !== 'all') {
        const catObj = window.ChamaProData.categories.find(c => c.id === state.selectedCategory);
        subtitleEl.textContent = `Encontramos ${pros.length} serviços para "${catObj ? catObj.name : state.selectedCategory}"`;
      } else {
        subtitleEl.textContent = `Encontramos 12 serviços para "mecânico"`;
      }
    }

    if (pros.length === 0) {
      el.prosGrid.innerHTML = `
        <div style="text-align: center; padding: 4rem 1rem; background: var(--white); border-radius: var(--radius-lg); border: 1px dashed var(--gray-300);">
          <i class="fa-solid fa-magnifying-glass" style="font-size: 3rem; color: var(--gray-400); margin-bottom: 1rem;"></i>
          <h3>Nenhum profissional encontrado</h3>
          <p style="color: var(--gray-500); margin-top: 0.5rem;">Tente ajustar os termos de busca ou selecionar outra categoria.</p>
          <button class="nav-btn-register" style="margin: 1.5rem auto 0; justify-content: center;" id="btnResetFilters">Limpar Filtros</button>
        </div>
      `;
      document.getElementById('btnResetFilters')?.addEventListener('click', resetFilters);
      return;
    }

    el.prosGrid.innerHTML = pros.map(pro => `
      <div class="pro-card" data-pro-id="${pro.id}">
        <img src="${pro.avatar}" alt="${pro.name}" class="pro-card-img" loading="lazy">
        <div class="pro-card-body">
          <h3 class="pro-card-name">${pro.name}</h3>
          <span class="pro-card-category">${pro.title}</span>
          <p class="pro-card-desc">${pro.bio}</p>
          <div class="pro-card-location">
            <i class="fa-solid fa-location-dot"></i> ${pro.address} &bull; ${pro.distance.toString().replace('.', ',')} km
          </div>
        </div>
        <div class="pro-card-right">
          <div class="pro-card-rating">
            <span class="stars">
              ${'<i class="fa-solid fa-star"></i>'.repeat(Math.floor(pro.rating))}${pro.rating % 1 >= 0.5 ? '<i class="fa-solid fa-star-half-stroke"></i>' : ''}
            </span>
            <span>${pro.rating.toFixed(1)} (${pro.reviewsCount})</span>
          </div>
          <div class="pro-card-status">
            <span class="status-dot"></span> Aberto agora
          </div>
          <div class="pro-card-actions">
            <button class="btn-card-profile btn-view-profile" data-pro-id="${pro.id}">Ver perfil</button>
            <button class="btn-card-contact btn-request-quote" data-pro-id="${pro.id}"><i class="fa-solid fa-phone"></i> Entrar em contato</button>
          </div>
        </div>
      </div>
    `).join('');

    // Event Listeners for pro cards
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

  // 4. Open Professional Profile Modal
  function openProModal(proId) {
    const pro = window.ChamaProData.professionals.find(p => p.id === proId);
    if (!pro) return;
    state.selectedPro = pro;

    el.proModalContent.innerHTML = `
      <div class="modal-header">
        <h3 class="modal-title">Perfil do Profissional</h3>
        <button class="modal-close" class="closeModalBtn"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="modal-body">
        <div style="display: flex; gap: 1.5rem; align-items: flex-start; margin-bottom: 1.5rem;">
          <img src="${pro.avatar}" alt="${pro.name}" style="width: 90px; height: 90px; border-radius: 50%; object-fit: cover; border: 3px solid var(--brand-primary);">
          <div>
            <h2 style="font-size: 1.5rem; font-weight: 800;">${pro.name} ${pro.verified ? '<i class="fa-solid fa-circle-check" style="color: var(--brand-primary); font-size: 1.1rem;" title="Documentos e Antecedentes Verificados"></i>' : ''}</h2>
            <p style="color: var(--text-secondary); font-weight: 600;">${pro.title}</p>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.25rem;"><i class="fa-solid fa-map-pin"></i> ${pro.address} (${pro.distance} km de você)</p>
            <div style="display: flex; gap: 1rem; margin-top: 0.5rem; font-size: 0.9rem;">
              <span style="color: var(--brand-accent); font-weight: 700;"><i class="fa-solid fa-star"></i> ${pro.rating} (${pro.reviewsCount} avaliações)</span>
              <span style="font-weight: 600;"><i class="fa-solid fa-briefcase"></i> ${pro.completedJobs} trabalhos</span>
            </div>
          </div>
        </div>

        <div style="margin-bottom: 1.5rem; padding: 1rem; background: var(--bg-subtle); border-radius: var(--radius-md);">
          <h4 style="font-size: 0.95rem; font-weight: 700; margin-bottom: 0.5rem;">Sobre mim</h4>
          <p style="font-size: 0.9rem; color: var(--text-secondary);">${pro.bio}</p>
        </div>

        <div style="margin-bottom: 1.5rem;">
          <h4 style="font-size: 0.95rem; font-weight: 700; margin-bottom: 0.75rem;">Especialidades</h4>
          <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
            ${pro.specialties.map(spec => `<span style="background: rgba(2, 132, 199, 0.1); color: var(--brand-primary); padding: 0.4rem 0.8rem; border-radius: var(--radius-full); font-size: 0.85rem; font-weight: 600;">${spec}</span>`).join('')}
          </div>
        </div>

        ${pro.portfolio && pro.portfolio.length > 0 ? `
          <div style="margin-bottom: 1.5rem;">
            <h4 style="font-size: 0.95rem; font-weight: 700; margin-bottom: 0.75rem;">Fotos de Trabalhos Realizados</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              ${pro.portfolio.map(item => `
                <div style="border-radius: var(--radius-md); overflow: hidden; border: 1px solid var(--border-color);">
                  <img src="${item.img}" alt="${item.title}" style="width: 100%; height: 140px; object-fit: cover;">
                  <p style="padding: 0.5rem 0.75rem; font-size: 0.8rem; font-weight: 600;">${item.title}</p>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <div style="margin-bottom: 1.5rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <h4 style="font-size: 0.95rem; font-weight: 700;">Avaliações de Clientes</h4>
            <button class="btn-outline btn-sm" id="btnOpenReviewModal"><i class="fa-solid fa-pen"></i> Avaliar Profissional</button>
          </div>
          <div style="display: flex; flex-direction: column; gap: 1rem;">
            ${pro.reviews.map(rev => `
              <div style="padding: 1rem; border: 1px solid var(--border-color); border-radius: var(--radius-md); background: var(--bg-surface);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                  <div style="display: flex; align-items: center; gap: 0.6rem;">
                    <img src="${rev.avatar}" style="width: 36px; height: 36px; border-radius: 50%;">
                    <div>
                      <h5 style="font-size: 0.88rem; font-weight: 700;">${rev.author}</h5>
                      <span style="font-size: 0.75rem; color: var(--text-muted);">${rev.date}</span>
                    </div>
                  </div>
                  <span style="color: var(--brand-accent); font-weight: 700; font-size: 0.85rem;"><i class="fa-solid fa-star"></i> ${rev.rating}</span>
                </div>
                <p style="font-size: 0.88rem; color: var(--text-secondary); margin-bottom: 0.5rem;">"${rev.comment}"</p>
                <div style="display: flex; gap: 0.3rem;">
                  ${rev.tags.map(t => `<span style="font-size: 0.75rem; background: var(--bg-subtle); padding: 0.15rem 0.5rem; border-radius: 4px;">${t}</span>`).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <div style="display: flex; gap: 1rem; margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--border-color);">
          <button class="btn-outline" style="flex: 1;" id="btnStartChatPro"><i class="fa-regular fa-comment-dots"></i> Enviar Mensagem</button>
          <button class="btn-primary" style="flex: 1;" id="btnModalRequestQuote"><i class="fa-solid fa-paper-plane"></i> Solicitar Orçamento</button>
        </div>
      </div>
    `;

    openModal(el.proModal);

    document.querySelector('.modal-close').addEventListener('click', () => closeModal(el.proModal));
    document.getElementById('btnStartChatPro').addEventListener('click', () => {
      closeModal(el.proModal);
      openChatWith(pro.id);
    });
    document.getElementById('btnModalRequestQuote').addEventListener('click', () => {
      closeModal(el.proModal);
      openQuoteModal(pro.id);
    });
    document.getElementById('btnOpenReviewModal').addEventListener('click', () => {
      closeModal(el.proModal);
      openReviewModal(pro.id);
    });
  }

  // 5. Open Quote Request Form Modal
  function openQuoteModal(proId) {
    const pro = window.ChamaProData.professionals.find(p => p.id === proId);
    if (!pro) return;
    state.selectedPro = pro;

    el.quoteProName.textContent = pro.name;
    document.getElementById('quoteCategorySelect').value = pro.category;
    openModal(el.quoteModal);
  }

  // 6. Open Review Modal
  function openReviewModal(proId) {
    const pro = window.ChamaProData.professionals.find(p => p.id === proId);
    if (!pro) return;
    state.selectedPro = pro;

    el.reviewProName.textContent = pro.name;
    openModal(el.reviewModal);
  }

  // 7. Open Chat Drawer
  function openChatWith(proId) {
    state.activeChatProId = proId;
    const pro = window.ChamaProData.professionals.find(p => p.id === proId);

    document.getElementById('chatProName').textContent = pro ? pro.name : 'Suporte ChamaPro';
    document.getElementById('chatProAvatar').src = pro ? pro.avatar : 'https://i.pravatar.cc/100?img=60';
    renderChatMessages(proId);
    el.chatDrawer.classList.add('active');
  }

  function renderChatMessages(proId) {
    let chatSession = window.ChamaProData.chatMessages.find(c => c.proId === proId);
    if (!chatSession) {
      const pro = window.ChamaProData.professionals.find(p => p.id === proId);
      chatSession = {
        proId: proId,
        proName: pro ? pro.name : 'Profissional',
        messages: [
          { sender: 'pro', text: `Olá! Sou o(a) ${pro ? pro.name : 'profissional'}. Como posso te ajudar com seu serviço hoje?`, time: 'Agora' }
        ]
      };
      window.ChamaProData.chatMessages.push(chatSession);
    }

    el.chatMessages.innerHTML = chatSession.messages.map(m => `
      <div class="message-bubble ${m.sender}">
        <div>${m.text}</div>
        <div class="message-time">${m.time}</div>
      </div>
    `).join('');

    el.chatMessages.scrollTop = el.chatMessages.scrollHeight;
  }

  // 8. Open Requests Drawer
  function renderMyRequests() {
    if (!el.myRequestsList) return;
    const requests = window.ChamaProData.myRequests;

    el.myRequestsList.innerHTML = requests.map(req => `
      <div style="padding: 1rem; border: 1px solid var(--border-color); border-radius: var(--radius-md); background: var(--bg-surface); margin-bottom: 1rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
          <span style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted);">${req.id}</span>
          <span style="font-size: 0.78rem; padding: 0.2rem 0.6rem; border-radius: var(--radius-full); background: ${req.statusColor}20; color: ${req.statusColor}; font-weight: 700;">${req.status}</span>
        </div>
        <h4 style="font-size: 0.95rem; font-weight: 700; margin-bottom: 0.4rem;">${req.serviceTitle}</h4>
        <div style="display: flex; align-items: center; gap: 0.6rem; font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.75rem;">
          <img src="${req.proAvatar}" style="width: 24px; height: 24px; border-radius: 50%;">
          <span>${req.proName}</span>
        </div>
        <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 0.75rem;">📅 ${req.date} • ${req.details}</p>
        <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 0.5rem; border-top: 1px dashed var(--border-color);">
          <span style="font-weight: 700; font-size: 0.9rem; color: var(--brand-success);">${req.estimatedPrice}</span>
          <button class="btn-outline btn-sm btn-chat-req" data-pro-id="${req.proId}">Ver Conversa</button>
        </div>
      </div>
    `).join('');

    document.querySelectorAll('.btn-chat-req').forEach(btn => {
      btn.addEventListener('click', () => {
        el.requestsDrawer.classList.remove('active');
        openChatWith(btn.getAttribute('data-pro-id'));
      });
    });
  }

  // Modal Helpers
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
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <i class="fa-solid fa-circle-check" style="color: var(--brand-success); font-size: 1.2rem;"></i>
      <div style="font-weight: 600; font-size: 0.9rem;">${message}</div>
    `;
    el.toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // Theme Toggle
  function updateThemeIcon() {
    if (el.themeToggle) {
      el.themeToggle.innerHTML = state.theme === 'dark' ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
    }
  }

  function toggleTheme() {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('chamapro_theme', state.theme);
    document.documentElement.setAttribute('data-theme', state.theme);
    updateThemeIcon();
  }

  function resetFilters() {
    state.selectedCategory = 'all';
    state.searchQuery = '';
    state.currentFilter = 'all';
    if (el.searchInput) el.searchInput.value = '';
    renderCategories();
    renderPros();
  }

  function scrollToPros() {
    const prosSection = document.getElementById('profissionais');
    if (prosSection) {
      prosSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  // GPS Button Event
  if (el.btnActivateGPS) {
    el.btnActivateGPS.addEventListener('click', () => {
      el.btnActivateGPS.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Localizando GPS...';
      window.ChamaProGeo.getUserGPSLocation(
        (coords) => {
          el.btnActivateGPS.innerHTML = '<i class="fa-solid fa-location-circle-check"></i> GPS Ativo!';
          if (el.gpsStatusText) el.gpsStatusText.textContent = '📍 Distâncias recalculadas com precisão GPS para sua posição!';
          showToast('Sua localização GPS foi obtida! Profissionais reordenados por proximidade.');
          renderPros();
          window.ChamaProGeo.initMap('leafletMap');
        },
        (err) => {
          el.btnActivateGPS.innerHTML = '<i class="fa-solid fa-location-crosshairs"></i> Tentar Novamente';
          showToast(err, 'error');
        }
      );
    });
  }

  // Toggle Map Visibility
  if (el.btnToggleMap) {
    el.btnToggleMap.addEventListener('click', () => {
      const isHidden = el.mapWrapper.style.display === 'none';
      el.mapWrapper.style.display = isHidden ? 'block' : 'none';
      if (isHidden) {
        window.ChamaProGeo.initMap('leafletMap');
      }
    });
  }

  // Auth Tabs (Login vs Register Pro)
  if (el.tabAuthLogin && el.tabAuthRegisterPro) {
    el.tabAuthLogin.addEventListener('click', () => {
      el.tabAuthLogin.classList.add('active');
      el.tabAuthRegisterPro.classList.remove('active');
      el.formLoginClient.style.display = 'block';
      el.formRegisterPro.style.display = 'none';
    });

    el.tabAuthRegisterPro.addEventListener('click', () => {
      el.tabAuthRegisterPro.classList.add('active');
      el.tabAuthLogin.classList.remove('active');
      el.formRegisterPro.style.display = 'block';
      el.formLoginClient.style.display = 'none';
    });
  }

  // Login Client Form Submit
  if (el.formLoginClient) {
    el.formLoginClient.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value;
      window.ChamaProAuth.login(email, '123456', 'client');
      closeModal(el.authModal);
      showToast(`Bem-vindo de volta, ${email.split('@')[0]}!`);
    });
  }

  // Register Pro Form Submit
  if (el.formRegisterPro) {
    el.formRegisterPro.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('regProName').value;
      const title = document.getElementById('regProTitle').value;
      const category = document.getElementById('regProCategory').value;
      const price = document.getElementById('regProPrice').value;
      const bio = document.getElementById('regProBio').value;

      window.ChamaProAuth.registerProfessional({
        name,
        title,
        category,
        startingPrice: price,
        bio,
        email: `${name.toLowerCase().replace(/\s+/g, '')}@chamapro.com`
      });

      closeModal(el.authModal);
      showToast(`Parabéns ${name}! Seu perfil profissional foi criado com sucesso!`);
      renderCategories();
      renderPros();
      scrollToPros();
    });
  }

  // Footer Register Pro Trigger
  document.getElementById('btnRegisterProFooter')?.addEventListener('click', (e) => {
    e.preventDefault();
    openModal(el.authModal);
    el.tabAuthRegisterPro.click();
  });

  // Event Listeners Search & Filters
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

  // Sidebar Filters Apply Event
  const btnApplyFilters = document.getElementById('btnApplyFilters');
  if (btnApplyFilters) {
    btnApplyFilters.addEventListener('click', () => {
      const catSelect = document.getElementById('sidebarCategory');
      if (catSelect) {
        state.selectedCategory = catSelect.value;
      }
      renderPros();
      renderCategories();
      scrollToPros();
    });
  }

  const sidebarCategory = document.getElementById('sidebarCategory');
  if (sidebarCategory) {
    sidebarCategory.addEventListener('change', (e) => {
      state.selectedCategory = e.target.value;
      renderPros();
      renderCategories();
      scrollToPros();
    });
  }

  if (el.themeToggle) el.themeToggle.addEventListener('click', toggleTheme);

  // Quote Form Submission
  if (el.quoteForm) {
    el.quoteForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const desc = document.getElementById('quoteDesc').value;
      const category = document.getElementById('quoteCategorySelect').value;

      const newReq = {
        id: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
        serviceTitle: desc.length > 30 ? desc.substring(0, 30) + '...' : desc,
        category: category,
        proId: state.selectedPro ? state.selectedPro.id : 'pro-1',
        proName: state.selectedPro ? state.selectedPro.name : 'João Silva',
        proAvatar: state.selectedPro ? state.selectedPro.avatar : 'assets/pro_electrician.jpg',
        date: 'Hoje',
        urgency: state.activeUrgency,
        status: 'Aguardando Resposta',
        statusColor: '#3b82f6',
        estimatedPrice: `a partir de R$ ${state.selectedPro ? state.selectedPro.startingPrice : 80}`,
        details: desc
      };

      window.ChamaProData.myRequests.unshift(newReq);
      closeModal(el.quoteModal);
      showToast('Solicitação enviada com sucesso! O profissional responderá em instantes.');
      renderMyRequests();
      
      setTimeout(() => {
        openChatWith(newReq.proId);
        showToast(`Nova mensagem recebida de ${newReq.proName}!`, 'info');
      }, 2000);
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

  // Simulated Photo Dropzone
  if (el.dropzone) {
    el.dropzone.addEventListener('click', () => {
      el.photoPreview.src = 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=500&q=80';
      el.photoPreview.style.display = 'block';
      showToast('Foto do problema anexada!', 'success');
    });
  }

  // Rating Stars Picker
  const starIcons = document.querySelectorAll('#starRatingPicker i');
  starIcons.forEach(star => {
    star.addEventListener('click', () => {
      const val = parseInt(star.getAttribute('data-val'));
      state.ratingStars = val;
      starIcons.forEach(s => {
        const sVal = parseInt(s.getAttribute('data-val'));
        if (sVal <= val) {
          s.classList.add('active');
        } else {
          s.classList.remove('active');
        }
      });
    });
  });

  // Review Form Submit
  if (el.reviewForm) {
    el.reviewForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const comment = document.getElementById('reviewComment').value;
      if (state.selectedPro) {
        state.selectedPro.reviews.unshift({
          id: `rev-${Date.now()}`,
          author: window.ChamaProAuth.getUser()?.name || 'Cliente ChamaPro',
          avatar: 'https://i.pravatar.cc/100?img=33',
          rating: state.ratingStars,
          date: 'Agora',
          comment: comment,
          tags: ['Serviço Concluído', 'Cliente Verificado']
        });
        state.selectedPro.reviewsCount += 1;
      }
      closeModal(el.reviewModal);
      showToast('Sua avaliação foi publicada! Obrigado pelo feedback.');
      renderPros();
    });
  }

  // Chat Send Message
  function sendMessage() {
    const text = el.chatInput.value.trim();
    if (!text) return;

    let chat = window.ChamaProData.chatMessages.find(c => c.proId === state.activeChatProId);
    if (!chat) return;

    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    chat.messages.push({ sender: 'user', text: text, time: timeNow });
    el.chatInput.value = '';
    renderChatMessages(state.activeChatProId);

    setTimeout(() => {
      chat.messages.push({
        sender: 'pro',
        text: 'Perfeito! Anotei todos os detalhes. Estou a caminho e chego no horário combinado.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      renderChatMessages(state.activeChatProId);
    }, 1500);
  }

  if (el.sendChatBtn) el.sendChatBtn.addEventListener('click', sendMessage);
  if (el.chatInput) {
    el.chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendMessage();
    });
  }

  // Close Modals/Drawers handlers
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal(overlay);
    });
  });

  document.querySelectorAll('.closeDrawerBtn').forEach(btn => {
    btn.addEventListener('click', () => {
      el.chatDrawer.classList.remove('active');
      el.requestsDrawer.classList.remove('active');
    });
  });

  if (el.btnMyRequests) {
    el.btnMyRequests.addEventListener('click', () => {
      renderMyRequests();
      el.requestsDrawer.classList.add('active');
    });
  }

  if (el.btnOpenChat) {
    el.btnOpenChat.addEventListener('click', () => {
      openChatWith('pro-1');
    });
  }

  // Popular Search Chips
  document.querySelectorAll('.popular-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const rawText = chip.textContent || '';
      const cleanTerm = rawText.replace(/^[^\w\sà-úÀ-Ú]+/g, '').trim();
      if (el.searchInput) el.searchInput.value = cleanTerm;
      state.searchQuery = cleanTerm;
      renderPros();
      scrollToPros();
    });
  });

  // Initial Boot
  renderCategories();
  renderPros();
  renderMyRequests();
});

