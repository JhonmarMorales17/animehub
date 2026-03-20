const API_URL = 'https://api.jikan.moe/v4';

class App {
    constructor() {
        this.content = document.getElementById('app-content');
        this.navBar = document.querySelector('nav-bar');
        
        this.state = { 
            view: 'home',
            previousView: null,
            searchQuery: '',
            currentGenre: '',
            currentId: null
        };
        
        this.currentController = null;
        
        // Escuchar eventos
        document.addEventListener('navigate', (e) => this.navigate(e.detail));
        document.addEventListener('show-detail', (e) => this.showDetail(e.detail.id));
        document.addEventListener('navigate-back', () => this.goBack());
        document.addEventListener('retry', () => this.retry());
        
        // Historial del navegador
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.view) {
                this.navigate(e.state.view, e.state.params, false);
            }
        });
        
        this.navigate('home');
    }

    abortCurrentRequest() {
        if (this.currentController) {
            this.currentController.abort();
            this.currentController = null;
        }
    }

    navigate(view, params = null, pushState = true) {
        this.state.previousView = this.state.view;
        this.state.view = view;
        
        if (this.navBar) {
            this.navBar.setActive(view);
        }
        
        if (pushState) {
            history.pushState({ view, params }, '', `#${view}`);
        }
        
        if (view === 'home') this.loadHome();
        if (view === 'search') this.loadSearch();
    }

    goBack() {
        if (this.state.previousView) {
            this.navigate(this.state.previousView, null, false);
        } else {
            this.navigate('home', null, false);
        }
    }

    retry() {
        if (this.state.view === 'home') this.loadHome();
        if (this.state.view === 'search') this.loadSearch();
        if (this.state.view === 'detail' && this.state.currentId) {
            this.showDetail(this.state.currentId);
        }
    }

    showError(message) {
        // Limpiar contenido
        while (this.content.firstChild) {
            this.content.removeChild(this.content.firstChild);
        }
        
        const errorDiv = document.createElement('div');
        errorDiv.style.textAlign = 'center';
        errorDiv.style.padding = '2rem';
        
        const errorMsg = document.createElement('p');
        errorMsg.style.color = '#e94560';
        errorMsg.style.marginBottom = '1rem';
        errorMsg.textContent = message;
        
        const retryBtn = document.createElement('button');
        retryBtn.textContent = 'Reintentar';
        retryBtn.style.background = '#e94560';
        retryBtn.style.color = 'white';
        retryBtn.style.border = 'none';
        retryBtn.style.padding = '0.5rem 1rem';
        retryBtn.style.borderRadius = '4px';
        retryBtn.style.cursor = 'pointer';
        retryBtn.addEventListener('click', () => this.retry());
        
        errorDiv.appendChild(errorMsg);
        errorDiv.appendChild(retryBtn);
        this.content.appendChild(errorDiv);
    }

    async loadHome() {
        this.abortCurrentRequest();
        this.currentController = new AbortController();
        
        // LIMPIAR CONTENIDO
        while (this.content.firstChild) {
            this.content.removeChild(this.content.firstChild);
        }

        // ===== HERO SECTION =====
        const hero = document.createElement('div');
        hero.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
        hero.style.color = 'white';
        hero.style.padding = '4rem 1rem';
        hero.style.textAlign = 'center';
        hero.style.marginBottom = '2rem';
        
        const heroTitle = document.createElement('h1');
        heroTitle.style.fontSize = '2.5rem';
        heroTitle.style.marginBottom = '1rem';
        heroTitle.textContent = '🎌 Explora el universo del anime';
        
        const heroSubtitle = document.createElement('p');
        heroSubtitle.style.fontSize = '1.2rem';
        heroSubtitle.style.marginBottom = '2rem';
        heroSubtitle.textContent = 'Descubrí los mejores animes, los más populares y los que están en emisión';
        
        const searchContainer = document.createElement('div');
        searchContainer.style.maxWidth = '500px';
        searchContainer.style.margin = '0 auto';
        searchContainer.style.display = 'flex';
        
        const quickInput = document.createElement('input');
        quickInput.type = 'text';
        quickInput.placeholder = 'Búsqueda rápida (ej: Naruto, One Piece...)';
        quickInput.style.flex = '1';
        quickInput.style.padding = '1rem';
        quickInput.style.border = 'none';
        quickInput.style.borderRadius = '8px 0 0 8px';
        quickInput.style.fontSize = '1rem';
        
        const quickBtn = document.createElement('button');
        quickBtn.textContent = 'Buscar';
        quickBtn.style.padding = '1rem 2rem';
        quickBtn.style.background = '#e94560';
        quickBtn.style.color = 'white';
        quickBtn.style.border = 'none';
        quickBtn.style.borderRadius = '0 8px 8px 0';
        quickBtn.style.cursor = 'pointer';
        quickBtn.style.fontWeight = 'bold';
        
        quickBtn.addEventListener('click', () => {
            const query = quickInput.value.trim();
            if (query) {
                this.state.searchQuery = query;
                this.navigate('search');
            }
        });
        
        quickInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = quickInput.value.trim();
                if (query) {
                    this.state.searchQuery = query;
                    this.navigate('search');
                }
            }
        });
        
        searchContainer.appendChild(quickInput);
        searchContainer.appendChild(quickBtn);
        
        hero.appendChild(heroTitle);
        hero.appendChild(heroSubtitle);
        hero.appendChild(searchContainer);
        this.content.appendChild(hero);

        // ===== TÍTULO SECCIÓN =====
        const sectionTitle = document.createElement('h2');
        sectionTitle.style.padding = '0 1rem';
        sectionTitle.style.marginBottom = '1rem';
        sectionTitle.style.fontSize = '1.8rem';
        sectionTitle.style.color = '#333';
        sectionTitle.textContent = '🔥 Top Animes';
        this.content.appendChild(sectionTitle);
        
        // ===== CONTENEDOR PARA EL GRID (con loading manual) =====
        const gridContainer = document.createElement('div');
        gridContainer.style.minHeight = '200px';
        gridContainer.style.display = 'flex';
        gridContainer.style.justifyContent = 'center';
        gridContainer.style.alignItems = 'center';
        gridContainer.style.padding = '2rem';
        
        // Spinner manual (no usar <loading-state> para evitar errores)
        const spinner = document.createElement('div');
        spinner.style.width = '50px';
        spinner.style.height = '50px';
        spinner.style.border = '4px solid #f3f3f3';
        spinner.style.borderTop = '4px solid #e94560';
        spinner.style.borderRadius = '50%';
        spinner.style.animation = 'spin 1s linear infinite';
        
        // Agregar la animación si no existe
        if (!document.querySelector('#spinnerStyle')) {
            const style = document.createElement('style');
            style.id = 'spinnerStyle';
            style.textContent = '@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }';
            document.head.appendChild(style);
        }
        
        gridContainer.appendChild(spinner);
        this.content.appendChild(gridContainer);
        
        const timeoutId = setTimeout(() => {
            this.currentController.abort();
        }, 8000);

        try {
            const res = await fetch(`${API_URL}/top/anime?limit=24`, {
                signal: this.currentController.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            
            const data = await res.json();
            
            // Remover el gridContainer con spinner
            this.content.removeChild(gridContainer);
            
            // Crear grid
            const grid = document.createElement('div');
            grid.className = 'grid-container';
            grid.style.display = 'grid';
            grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(180px, 1fr))';
            grid.style.gap = '1.5rem';
            grid.style.padding = '1.5rem';
            grid.style.maxWidth = '1200px';
            grid.style.margin = '0 auto';
            
            data.data.forEach(anime => {
                const card = document.createElement('div');
                card.className = 'anime-card';
                card.style.background = 'white';
                card.style.borderRadius = '8px';
                card.style.overflow = 'hidden';
                card.style.cursor = 'pointer';
                card.style.transition = 'transform 0.2s';
                card.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
                
                const imageUrl = anime.images?.jpg?.image_url || 'https://via.placeholder.com/200x250?text=No+Image';
                
                card.innerHTML = `
                    <img src="${imageUrl}" alt="${anime.title}" style="width:100%; height:200px; object-fit:cover;">
                    <div style="padding:0.5rem;">
                        <h3 style="font-size:0.9rem; margin-bottom:0.3rem;">${anime.title_english || anime.title}</h3>
                        <span style="background:#e94560; color:white; padding:0.2rem 0.5rem; border-radius:4px; font-size:0.8rem;">⭐ ${anime.score || 'N/A'}</span>
                    </div>
                `;
                
                card.addEventListener('click', () => this.showDetail(anime.mal_id));
                grid.appendChild(card);
            });
            
            this.content.appendChild(grid);
            
        } catch (error) {
            clearTimeout(timeoutId);
            this.content.removeChild(gridContainer);
            
            const errorDiv = document.createElement('div');
            errorDiv.style.textAlign = 'center';
            errorDiv.style.padding = '2rem';
            
            const errorMsg = document.createElement('p');
            errorMsg.style.color = '#e94560';
            errorMsg.style.marginBottom = '1rem';
            errorMsg.textContent = error.name === 'AbortError' 
                ? '⏱️ La petición tardó demasiado'
                : 'Error al cargar animes';
            
            const retryBtn = document.createElement('button');
            retryBtn.textContent = 'Reintentar';
            retryBtn.style.background = '#e94560';
            retryBtn.style.color = 'white';
            retryBtn.style.border = 'none';
            retryBtn.style.padding = '0.5rem 1rem';
            retryBtn.style.borderRadius = '4px';
            retryBtn.style.cursor = 'pointer';
            retryBtn.addEventListener('click', () => this.loadHome());
            
            errorDiv.appendChild(errorMsg);
            errorDiv.appendChild(retryBtn);
            this.content.appendChild(errorDiv);
        }
    }

    loadSearch() {
        // LIMPIAR CONTENIDO
        while (this.content.firstChild) {
            this.content.removeChild(this.content.firstChild);
        }
        
        const container = document.createElement('div');
        container.style.padding = '2rem';
        container.style.maxWidth = '1200px';
        container.style.margin = '0 auto';
        
        // Título
        const title = document.createElement('h2');
        title.style.marginBottom = '1rem';
        title.style.color = '#333';
        title.style.fontSize = '2rem';
        title.textContent = '🔍 Buscar Anime';
        container.appendChild(title);
        
        // Input de búsqueda
        const searchContainer = document.createElement('div');
        searchContainer.style.display = 'flex';
        searchContainer.style.gap = '0.5rem';
        searchContainer.style.marginBottom = '1rem';
        
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'Ej: Naruto, One Piece...';
        input.value = this.state.searchQuery;
        input.style.flex = '1';
        input.style.padding = '1rem';
        input.style.border = '2px solid #ddd';
        input.style.borderRadius = '8px';
        input.style.fontSize = '1rem';
        
        const btn = document.createElement('button');
        btn.textContent = 'Buscar';
        btn.style.background = '#e94560';
        btn.style.color = 'white';
        btn.style.border = 'none';
        btn.style.padding = '0 2rem';
        btn.style.borderRadius = '8px';
        btn.style.cursor = 'pointer';
        btn.style.fontWeight = 'bold';
        
        searchContainer.appendChild(input);
        searchContainer.appendChild(btn);
        container.appendChild(searchContainer);
        
        // Filtro de géneros (inline para evitar errores)
        const filterContainer = document.createElement('div');
        filterContainer.style.marginBottom = '1rem';
        filterContainer.style.marginTop = '1rem';
        
        const filterLabel = document.createElement('label');
        filterLabel.style.display = 'block';
        filterLabel.style.marginBottom = '0.5rem';
        filterLabel.style.fontWeight = 'bold';
        filterLabel.textContent = '🏷️ Filtrar por género:';
        
        const filterSelect = document.createElement('select');
        filterSelect.style.width = '100%';
        filterSelect.style.padding = '0.75rem';
        filterSelect.style.border = '2px solid #ddd';
        filterSelect.style.borderRadius = '8px';
        filterSelect.style.fontSize = '1rem';
        
        const loadingOption = document.createElement('option');
        loadingOption.value = '';
        loadingOption.textContent = 'Cargando géneros...';
        filterSelect.appendChild(loadingOption);
        filterSelect.disabled = true;
        
        filterContainer.appendChild(filterLabel);
        filterContainer.appendChild(filterSelect);
        container.appendChild(filterContainer);
        
        // Contenedor de resultados
        const resultsContainer = document.createElement('div');
        resultsContainer.style.minHeight = '200px';
        resultsContainer.style.marginTop = '2rem';
        container.appendChild(resultsContainer);
        
        this.content.appendChild(container);
        
        let searchTimeout;
        
        // Cargar géneros
        fetch('https://api.jikan.moe/v4/genres/anime')
            .then(res => res.json())
            .then(data => {
                filterSelect.innerHTML = '<option value="">Todos los géneros</option>';
                data.data.forEach(genre => {
                    const option = document.createElement('option');
                    option.value = genre.mal_id;
                    option.textContent = genre.name;
                    filterSelect.appendChild(option);
                });
                filterSelect.disabled = false;
            })
            .catch(err => console.error('Error cargando géneros:', err));
        
        filterSelect.addEventListener('change', (e) => {
            this.state.currentGenre = e.target.value;
            if (input.value.trim() || this.state.currentGenre) {
                performSearch();
            }
        });
        
        const performSearch = async () => {
            const query = input.value.trim();
            this.state.searchQuery = query;
            
            this.abortCurrentRequest();
            this.currentController = new AbortController();
            
            // Spinner manual
            resultsContainer.innerHTML = '';
            const spinnerDiv = document.createElement('div');
            spinnerDiv.style.display = 'flex';
            spinnerDiv.style.justifyContent = 'center';
            spinnerDiv.style.padding = '2rem';
            
            const spinner = document.createElement('div');
            spinner.style.width = '40px';
            spinner.style.height = '40px';
            spinner.style.border = '4px solid #f3f3f3';
            spinner.style.borderTop = '4px solid #e94560';
            spinner.style.borderRadius = '50%';
            spinner.style.animation = 'spin 1s linear infinite';
            
            spinnerDiv.appendChild(spinner);
            resultsContainer.appendChild(spinnerDiv);
            
            const timeoutId = setTimeout(() => {
                this.currentController.abort();
            }, 8000);

            try {
                let url = `${API_URL}/anime?limit=24`;
                if (query) url += `&q=${encodeURIComponent(query)}`;
                if (this.state.currentGenre) url += `&genres=${this.state.currentGenre}`;
                
                const res = await fetch(url, {
                    signal: this.currentController.signal
                });
                
                clearTimeout(timeoutId);
                
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                
                const data = await res.json();
                
                resultsContainer.innerHTML = '';
                
                if (!data.data || data.data.length === 0) {
                    const emptyMsg = document.createElement('div');
                    emptyMsg.style.textAlign = 'center';
                    emptyMsg.style.padding = '3rem';
                    emptyMsg.innerHTML = `
                        <p style="color:#666; font-size:1.2rem;">😢 No se encontraron animes</p>
                        <p style="color:#999; margin-top:0.5rem;">Probá con otra búsqueda o filtro</p>
                    `;
                    resultsContainer.appendChild(emptyMsg);
                    return;
                }
                
                const grid = document.createElement('div');
                grid.style.display = 'grid';
                grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(180px, 1fr))';
                grid.style.gap = '1.5rem';
                grid.style.padding = '0';
                
                data.data.forEach(anime => {
                    const card = document.createElement('div');
                    card.className = 'anime-card';
                    card.style.background = 'white';
                    card.style.borderRadius = '8px';
                    card.style.overflow = 'hidden';
                    card.style.cursor = 'pointer';
                    card.style.transition = 'transform 0.2s';
                    card.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
                    
                    const imageUrl = anime.images?.jpg?.image_url || 'https://via.placeholder.com/200x250?text=No+Image';
                    
                    card.innerHTML = `
                        <img src="${imageUrl}" alt="${anime.title}" style="width:100%; height:200px; object-fit:cover;">
                        <div style="padding:0.5rem;">
                            <h3 style="font-size:0.9rem; margin-bottom:0.3rem;">${anime.title_english || anime.title}</h3>
                            <span style="background:#e94560; color:white; padding:0.2rem 0.5rem; border-radius:4px; font-size:0.8rem;">⭐ ${anime.score || 'N/A'}</span>
                        </div>
                    `;
                    
                    card.addEventListener('click', () => this.showDetail(anime.mal_id));
                    grid.appendChild(card);
                });
                
                resultsContainer.appendChild(grid);
                
            } catch (error) {
                clearTimeout(timeoutId);
                resultsContainer.innerHTML = '';
                
                const errorDiv = document.createElement('div');
                errorDiv.style.textAlign = 'center';
                errorDiv.style.padding = '2rem';
                
                const errorMsg = document.createElement('p');
                errorMsg.style.color = '#e94560';
                errorMsg.style.marginBottom = '1rem';
                errorMsg.textContent = error.name === 'AbortError' 
                    ? '⏱️ La búsqueda tardó demasiado'
                    : 'Error en la búsqueda';
                
                const retryBtn = document.createElement('button');
                retryBtn.textContent = 'Reintentar';
                retryBtn.style.background = '#e94560';
                retryBtn.style.color = 'white';
                retryBtn.style.border = 'none';
                retryBtn.style.padding = '0.5rem 1rem';
                retryBtn.style.borderRadius = '4px';
                retryBtn.style.cursor = 'pointer';
                retryBtn.addEventListener('click', performSearch);
                
                errorDiv.appendChild(errorMsg);
                errorDiv.appendChild(retryBtn);
                resultsContainer.appendChild(errorDiv);
            }
        };
        
        // Debounce
        input.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                if (input.value.trim() || this.state.currentGenre) {
                    performSearch();
                } else {
                    resultsContainer.innerHTML = '';
                    const emptyMsg = document.createElement('p');
                    emptyMsg.style.textAlign = 'center';
                    emptyMsg.style.color = '#666';
                    emptyMsg.textContent = '🔍 Escribí algo para buscar o seleccioná un género...';
                    resultsContainer.appendChild(emptyMsg);
                }
            }, 500);
        });
        
        btn.addEventListener('click', performSearch);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') performSearch();
        });
        
        // Búsqueda inicial
        if (this.state.searchQuery) {
            performSearch();
        } else {
            const emptyMsg = document.createElement('p');
            emptyMsg.style.textAlign = 'center';
            emptyMsg.style.color = '#666';
            emptyMsg.textContent = '🔍 Escribí algo para buscar o seleccioná un género...';
            resultsContainer.appendChild(emptyMsg);
        }
    }

    async showDetail(id) {
        this.state.currentId = id;
        
        this.abortCurrentRequest();
        this.currentController = new AbortController();
        
        // LIMPIAR CONTENIDO
        while (this.content.firstChild) {
            this.content.removeChild(this.content.firstChild);
        }
        
        // Spinner manual
        const spinnerContainer = document.createElement('div');
        spinnerContainer.style.display = 'flex';
        spinnerContainer.style.justifyContent = 'center';
        spinnerContainer.style.padding = '2rem';
        
        const spinner = document.createElement('div');
        spinner.style.width = '50px';
        spinner.style.height = '50px';
        spinner.style.border = '4px solid #f3f3f3';
        spinner.style.borderTop = '4px solid #e94560';
        spinner.style.borderRadius = '50%';
        spinner.style.animation = 'spin 1s linear infinite';
        
        spinnerContainer.appendChild(spinner);
        this.content.appendChild(spinnerContainer);
        
        const timeoutId = setTimeout(() => {
            this.currentController.abort();
        }, 8000);

        try {
            const res = await fetch(`${API_URL}/anime/${id}/full`, {
                signal: this.currentController.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            
            const data = await res.json();
            const anime = data.data;
            
            this.content.innerHTML = '';
            
            const detailContainer = document.createElement('div');
            detailContainer.style.maxWidth = '800px';
            detailContainer.style.margin = '2rem auto';
            detailContainer.style.padding = '2rem';
            detailContainer.style.background = 'white';
            detailContainer.style.borderRadius = '8px';
            detailContainer.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
            
            detailContainer.innerHTML = `
                <button id="backBtn" style="background:none; border:none; color:#e94560; font-size:1rem; cursor:pointer; margin-bottom:1rem;">← Volver</button>
                <div style="display:flex; gap:2rem; flex-wrap:wrap;">
                    <img src="${anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url}" 
                         style="width:200px; border-radius:8px;">
                    <div style="flex:1;">
                        <h2>${anime.title_english || anime.title}</h2>
                        ${anime.title_japanese ? `<h3 style="color:#666; font-size:1rem;">${anime.title_japanese}</h3>` : ''}
                        <div style="display:flex; gap:1rem; margin:1rem 0;">
                            <span style="background:#e94560; color:white; padding:0.25rem 0.5rem; border-radius:4px;">⭐ ${anime.score || 'N/A'}</span>
                            <span style="background:#4ecdc4; color:white; padding:0.25rem 0.5rem; border-radius:4px;">📺 ${anime.episodes || '?'} eps</span>
                            <span style="background:#1a1a2e; color:white; padding:0.25rem 0.5rem; border-radius:4px;">${anime.status || '?'}</span>
                        </div>
                        ${anime.genres ? `<div style="margin:1rem 0;">${anime.genres.map(g => `<span style="background:#ddd; padding:0.2rem 0.5rem; border-radius:20px; margin-right:0.3rem;">${g.name}</span>`).join('')}</div>` : ''}
                        <h3>Sinopsis</h3>
                        <p style="line-height:1.6;">${anime.synopsis || 'No disponible'}</p>
                        ${anime.studios?.length ? `<p style="margin-top:1rem;"><strong>Estudio:</strong> ${anime.studios[0].name}</p>` : ''}
                    </div>
                </div>
            `;
            
            this.content.appendChild(detailContainer);
            
            document.getElementById('backBtn').addEventListener('click', () => {
                this.navigate(this.state.previousView || 'home');
            });
            
        } catch (error) {
            clearTimeout(timeoutId);
            this.content.innerHTML = '';
            
            const errorDiv = document.createElement('div');
            errorDiv.style.textAlign = 'center';
            errorDiv.style.padding = '2rem';
            
            const errorMsg = document.createElement('p');
            errorMsg.style.color = '#e94560';
            errorMsg.textContent = error.name === 'AbortError' 
                ? '⏱️ La petición tardó demasiado'
                : 'Error al cargar el detalle';
            
            const retryBtn = document.createElement('button');
            retryBtn.textContent = 'Reintentar';
            retryBtn.style.background = '#e94560';
            retryBtn.style.color = 'white';
            retryBtn.style.border = 'none';
            retryBtn.style.padding = '0.5rem 1rem';
            retryBtn.style.borderRadius = '4px';
            retryBtn.style.cursor = 'pointer';
            retryBtn.addEventListener('click', () => this.showDetail(id));
            
            errorDiv.appendChild(errorMsg);
            errorDiv.appendChild(retryBtn);
            this.content.appendChild(errorDiv);
        }
    }
}

// Iniciar la aplicación
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});