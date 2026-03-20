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
        const errorEl = document.createElement('error-state');
        errorEl.setAttribute('message', message);
        this.content.innerHTML = '';
        this.content.appendChild(errorEl);
    }

    async loadHome() {
        this.abortCurrentRequest();
        this.currentController = new AbortController();
        
        // LIMPIAR CONTENIDO CORRECTAMENTE
        while (this.content.firstChild) {
            this.content.removeChild(this.content.firstChild);
        }

        // ===== HERO SECTION (creado con createElement, no innerHTML) =====
        const hero = document.createElement('section');
        hero.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
        hero.style.color = 'white';
        hero.style.padding = '4rem 1rem';
        hero.style.textAlign = 'center';
        hero.style.marginBottom = '2rem';
        
        // Crear título
        const heroTitle = document.createElement('h1');
        heroTitle.style.fontSize = '2.5rem';
        heroTitle.style.marginBottom = '1rem';
        heroTitle.textContent = '🎌 Explora el universo del anime';
        
        // Crear subtítulo
        const heroSubtitle = document.createElement('p');
        heroSubtitle.style.fontSize = '1.2rem';
        heroSubtitle.style.marginBottom = '2rem';
        heroSubtitle.style.opacity = '0.95';
        heroSubtitle.textContent = 'Descubrí los mejores animes, los más populares y los que están en emisión';
        
        // Crear contenedor de búsqueda rápida
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

        // ===== TÍTULO DE SECCIÓN =====
        const sectionTitle = document.createElement('h2');
        sectionTitle.style.padding = '0 1rem';
        sectionTitle.style.marginBottom = '1rem';
        sectionTitle.style.fontSize = '1.8rem';
        sectionTitle.style.color = '#333';
        sectionTitle.textContent = '🔥 Top Animes';
        this.content.appendChild(sectionTitle);
        
        // ===== LOADING =====
        const loading = document.createElement('loading-state');
        this.content.appendChild(loading);
        
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
            
            // Remover loading
            if (this.content.contains(loading)) {
                this.content.removeChild(loading);
            }
            
            // Crear grid con los resultados
            const grid = document.createElement('div');
            grid.className = 'grid-container';
            
            data.data.forEach(anime => {
                const card = document.createElement('anime-card');
                card.data = anime;
                grid.appendChild(card);
            });
            
            this.content.appendChild(grid);
            
        } catch (error) {
            clearTimeout(timeoutId);
            
            if (this.content.contains(loading)) {
                this.content.removeChild(loading);
            }
            
            const errorDiv = document.createElement('div');
            errorDiv.style.textAlign = 'center';
            errorDiv.style.padding = '2rem';
            
            const errorMsg = document.createElement('p');
            errorMsg.style.color = '#e94560';
            errorMsg.style.marginBottom = '1rem';
            errorMsg.textContent = error.name === 'AbortError' 
                ? '⏱️ La petición tardó demasiado. Hacé click en reintentar.'
                : 'Error al cargar animes. Verificá tu conexión.';
            
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
        // LIMPIAR CONTENIDO CORRECTAMENTE
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
        
        // Contenedor de búsqueda
        const searchContainer = document.createElement('div');
        searchContainer.style.display = 'flex';
        searchContainer.style.gap = '0.5rem';
        searchContainer.style.marginBottom = '1rem';
        
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'Ej: Naruto, One Piece, Dragon Ball...';
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
        
        // Filtro de géneros
        const genreFilter = document.createElement('genre-filter');
        container.appendChild(genreFilter);
        
        // Contenedor de resultados
        const resultsContainer = document.createElement('div');
        resultsContainer.style.minHeight = '200px';
        resultsContainer.style.marginTop = '2rem';
        container.appendChild(resultsContainer);
        
        this.content.appendChild(container);
        
        let searchTimeout;
        
        // Escuchar cambios de género
        genreFilter.addEventListener('genre-change', (e) => {
            this.state.currentGenre = e.detail.genreId;
            performSearch();
        });
        
        const performSearch = async () => {
            const query = input.value.trim();
            this.state.searchQuery = query;
            
            this.abortCurrentRequest();
            this.currentController = new AbortController();
            
            resultsContainer.innerHTML = '';
            const loading = document.createElement('loading-state');
            resultsContainer.appendChild(loading);
            
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
                    
                    const emptyP = document.createElement('p');
                    emptyP.style.color = '#666';
                    emptyP.style.fontSize = '1.2rem';
                    emptyP.textContent = '😢 No se encontraron animes';
                    
                    const emptySub = document.createElement('p');
                    emptySub.style.color = '#999';
                    emptySub.style.marginTop = '0.5rem';
                    emptySub.textContent = 'Probá con otra búsqueda o filtro';
                    
                    emptyMsg.appendChild(emptyP);
                    emptyMsg.appendChild(emptySub);
                    resultsContainer.appendChild(emptyMsg);
                    return;
                }
                
                const grid = document.createElement('div');
                grid.className = 'grid-container';
                
                data.data.forEach(anime => {
                    const card = document.createElement('anime-card');
                    card.data = anime;
                    grid.appendChild(card);
                });
                
                resultsContainer.appendChild(grid);
                
            } catch (error) {
                clearTimeout(timeoutId);
                resultsContainer.innerHTML = '';
                
                const errorState = document.createElement('error-state');
                errorState.setAttribute('message', error.name === 'AbortError' 
                    ? '⏱️ La búsqueda tardó demasiado'
                    : 'Error en la búsqueda');
                resultsContainer.appendChild(errorState);
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
            if (e.key === 'Enter') {
                e.preventDefault();
                performSearch();
            }
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
        
        const loading = document.createElement('loading-state');
        this.content.appendChild(loading);
        
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
            
            const detail = document.createElement('anime-detail');
            detail.data = data.data;
            
            this.content.innerHTML = '';
            this.content.appendChild(detail);
            
        } catch (error) {
            clearTimeout(timeoutId);
            this.content.innerHTML = '';
            
            const errorState = document.createElement('error-state');
            errorState.setAttribute('message', error.name === 'AbortError' 
                ? '⏱️ La petición tardó demasiado'
                : 'Error al cargar el detalle');
            this.content.appendChild(errorState);
        }
    }
}

// Iniciar la aplicación
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});