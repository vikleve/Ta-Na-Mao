/**
 * ChamaPro - Geolocation & Leaflet Map Engine
 * Cálculo de Distância Exata Haversine (GPS) & Mapeamento Interativo
 */

const ChamaProGeo = {
  map: null,
  markersGroup: null,

  // Cálculo da Fórmula de Haversine para Distância em Quilômetros entre 2 pontos GPS
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Raio da Terra em KM
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return parseFloat(distance.toFixed(1)); // Retorna com 1 casa decimal
  },

  // Atualiza a distância de todos os profissionais com base no ponto de localização do usuário
  updateAllDistances(userLat, userLng) {
    window.ChamaProData.userLocation.lat = userLat;
    window.ChamaProData.userLocation.lng = userLng;

    window.ChamaProData.professionals.forEach(pro => {
      pro.distance = this.calculateDistance(userLat, userLng, pro.lat, pro.lng);
    });
  },

  // Solicita Geolocalização Via GPS do Navegador
  getUserGPSLocation(onSuccess, onError) {
    if (!navigator.geolocation) {
      if (onError) onError('Geolocalização não suportada neste navegador.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        this.updateAllDistances(lat, lng);
        window.ChamaProData.userLocation.address = '📍 Sua Localização Atual (GPS Ativo)';
        if (onSuccess) onSuccess({ lat, lng });
      },
      (err) => {
        console.warn('Erro GPS:', err.message);
        if (onError) onError('Permissão de GPS negada ou indisponível.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  },

  // Inicializa o Mapa Leaflet.js
  initMap(containerId = 'leafletMap') {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (this.map) {
      this.map.remove();
      this.map = null;
    }

    const initialLat = window.ChamaProData.userLocation.lat;
    const initialLng = window.ChamaProData.userLocation.lng;

    this.map = L.map(containerId).setView([initialLat, initialLng], 13);

    // Camada do mapa OpenStreetMap com tiles modernos
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap & ChamaPro GeoEngine'
    }).addTo(this.map);

    this.markersGroup = L.layerGroup().addTo(this.map);
    this.renderMarkers();
  },

  // Desenha os marcadores dos profissionais no Mapa Interativo
  renderMarkers(pros = window.ChamaProData.professionals) {
    if (!this.map || !this.markersGroup) return;

    this.markersGroup.clearLayers();

    // Marcador da posição do Usuário
    const userLat = window.ChamaProData.userLocation.lat;
    const userLng = window.ChamaProData.userLocation.lng;

    const userIcon = L.divIcon({
      className: 'user-map-pin',
      html: `<div style="background: #0284c7; color: white; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.3); font-size: 1rem;"><i class="fa-solid fa-user-large"></i></div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });

    L.marker([userLat, userLng], { icon: userIcon })
      .addTo(this.markersGroup)
      .bindPopup(`<b>Você está aqui</b><br>${window.ChamaProData.userLocation.address}`);

    // Marcadores dos Profissionais
    pros.forEach(pro => {
      const proIcon = L.divIcon({
        className: 'pro-map-pin',
        html: `<div style="background: #10b981; color: white; padding: 4px 8px; border-radius: 16px; font-weight: 700; font-size: 0.78rem; display: flex; align-items: center; gap: 4px; border: 2px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.25);"><i class="fa-solid fa-star" style="color: #f59e0b;"></i> ${pro.rating} | R$ ${pro.startingPrice}</div>`,
        iconSize: [80, 30],
        iconAnchor: [40, 15]
      });

      const marker = L.marker([pro.lat, pro.lng], { icon: proIcon }).addTo(this.markersGroup);

      const popupContent = `
        <div style="text-align: center; padding: 0.5rem; min-width: 180px;">
          <img src="${pro.avatar}" style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover; margin-bottom: 0.4rem; border: 2px solid #0284c7;">
          <h4 style="font-size: 0.95rem; font-weight: 800; margin-bottom: 0.2rem;">${pro.name}</h4>
          <p style="font-size: 0.8rem; color: #64748b; margin-bottom: 0.4rem;">${pro.title}</p>
          <div style="font-size: 0.85rem; font-weight: 700; color: #10b981; margin-bottom: 0.6rem;">📍 ${pro.distance} km de você</div>
          <button onclick="window.ChamaProAppOpenQuote('${pro.id}')" style="background: linear-gradient(135deg, #0284c7, #2563eb); color: white; border: none; padding: 0.4rem 0.8rem; border-radius: 20px; font-weight: 700; font-size: 0.8rem; cursor: pointer; width: 100%;">Pedir Orçamento</button>
        </div>
      `;

      marker.bindPopup(popupContent);
    });
  }
};

window.ChamaProGeo = ChamaProGeo;
