const API_URL = 'https://api.jikan.moe/v4';

class App {
    constructor() {
        this.content = document.getElementById('app-content');
        this.navBar = document.querySelector('nav-bar');
        
        // Estado de la aplicación
        this.state = { 
            view: 'home',
            previousView: null,
            searchQuery: '',
            currentGenre: '',
            currentId: null
        };
        
        // Controlador para abortar peticiones
        this.currentController = null;
        
        // Escuchar eventos
        document.addEventListener('navigate', (e) => this.navigate(e.detail));
        document.addEventListener('show-detail', (e) => this.showDetail(e.detail.id));
        document.addEventListener('navigate-back', () => this.goBack());
        document.addEventListener('retry', () => this.retry());
        
        // Manejar botones atrás/adelante del navegador
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.view) {
                this.navigate(e.state.view, e.state.params, false);
            }
        });
        
        this.navigate('home');
    }

    /**
     * Cancela la petición actual si existe
     */
    abortCurrentRequest() {
        if (this.currentController) {
            console.log('Cancelando petición anterior');
            this.currentController.abort();
            this.currentController = null;
        }
    }

    /**
     * Navegación entre vistas
     * @param {string} view - Vista a mostrar
     * @param {any} params - Parámetros adicionales
     * @param {boolean} pushState - Si debe guardar en historial
     */
    navigate(view, params = null, pushState = true) {
        this.state.previousView = this.state.view;
        this.state.view = view;
        this.navBar.setActive(view);
        
        // Guardar en historial del navegador
        if (pushState) {
            history.pushState({ view, params }, '', `#${view}`);
        }
        
        // Renderizar vista correspondiente
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

    /**
     * Muestra un error en el contenedor principal
     */
    showError(message) {
        const errorEl = document.createElement('error-state');
        errorEl.setAttribute('message', message);
        this.content.innerHTML = '';
        this.content.appendChild(errorEl);
    }

    /**
     * VISTA HOME - Con hero section y búsqueda rápida
     */
    async loadHome() {
        // Cancelar petición anterior
        this.abortCurrentRequest();
        
        // Crear nuevo controlador
        this.currentController = new AbortController();
        
        // Limpiar contenido
        this.content.innerHTML = '';

        // ===== HERO SECTION =====
        const hero = document.createElement('section');
        hero.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
        hero.style.color = 'white';
        hero.style.padding = '4rem 1rem';
        hero.style.textAlign = 'center';
        hero.style.marginBottom = '2rem';
        
        hero.innerHTML = `
            <h1 style="font-size: 2.5rem; margin-bottom: 1rem; animation: fadeIn 1s;">
                🎌 Explora el universo del anime
            </h1>
            <p style="font-size: 1.2rem; margin-bottom: 2rem; opacity: 0.95; animation: fadeIn 1.2s;">
                Descubrí los mejores animes, los más populares y los que están en emisión
            </p>
            <div style="max-width: 500px; margin: 0 auto; display: flex; animation: fadeIn 1.4s;">
                <input type="text" 
                       id="quickSearch" 
                       placeholder="Búsqueda rápida (ej: Naruto, One Piece...)"
                       style="flex: 1; padding: 1rem; border: none; border-radius: 8px 0 0 8px; font-size: 1rem;">
                <button id="quickSearchBtn" 
                        style="padding: 1rem 2rem; background: #e94560; color: white; border: none; border-radius: 0 8px 8px 0; cursor: pointer; font-weight: bold; transition: background 0.3s;">
                    Buscar
                </button>
            </div>
        `;
        
        this.content.appendChild(hero);

        // ===== SECCIÓN TOP ANIME =====
        const sectionTitle = document.createElement('h2');
        sectionTitle.style.padding = '0 1rem';
        sectionTitle.style.marginBottom = '1rem';
        sectionTitle.style.fontSize = '1.8rem';
        sectionTitle.style.color = '#333';
        sectionTitle.innerHTML = '🔥 Top Animes';
        this.content.appendChild(sectionTitle);
        
        // Loading state
        const loading = document.createElement('loading-state');
        this.content.appendChild(loading);
        
        // Timeout de 8 segundos
        const timeoutId = setTimeout(() => {
            console.log('Timeout: cancelando petición');
            this.currentController.abort();
        }, 8000);

        try {
            console.log('Cargando top animes...');
            const res = await fetch(`${API_URL}/top/anime?limit=24`, {
                signal: this.currentController.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            
            const data = await res.json();
            
            // Remover loading
            this.content.removeChild(loading);
            
            // Crear grid de animes
            const grid = document.createElement('div');
            grid.className = 'grid-container';
            
            data.data.forEach(anime => {
                const card = document.createElement('anime-card');
                card.data = anime;
                grid.appendChild(card);
            });
            
            this.content.appendChild(grid);
            
            // Eventos de búsqueda rápida
            document.getElementById('quickSearchBtn').addEventListener('click', () => {
                const query = document.getElementById('quickSearch').value.trim();
                if (query) {
                    this.state.searchQuery = query;
                    this.navigate('search');
                }
            });
            
            document.getElementById('quickSearch').addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const query = e.target.value.trim();
                    if (query) {
                        this.state.searchQuery = query;
                        this.navigate('search');
                    }
                }
            });
            
        } catch (error) {
            clearTimeout(timeoutId);
            this.content.removeChild(loading);
            
            console.error('Error:', error);
            
            if (error.name === 'AbortError') {
                this.showError('⏱️ La petición tardó demasiado. Hacé click en reintentar.');
            } else {
                this.showError('Error al cargar animes. Verificá tu conexión.');
            }
        }
    }

    /**
     * VISTA SEARCH - Con debounce y filtros
     */
    loadSearch() {
        this.content.innerHTML = `
            <div style="padding: 2rem; max-width: 1200px; margin: 0 auto;">
                <h2 style="margin-bottom: 1rem; color: #333; font-size: 2rem;">
                    🔍 Buscar Anime
                </h2>
                
                <!-- Barra de búsqueda -->
                <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem;">
                    <input type="text" 
                           id="searchInput" 
                           placeholder="Ej: Naruto, One Piece, Dragon Ball..." 
                           value="${this.state.searchQuery}"
                           style="flex:1; padding:1rem; border:2px solid #ddd; border-radius:8px; font-size:1rem; transition: border-color 0.3s;">
                    <button id="searchBtn" 
                            style="background:#e94560; color:white; border:none; padding:0 2rem; border-radius:8px; cursor:pointer; font-weight:bold; font-size:1rem; transition: background 0.3s;">
                        Buscar
                    </button>
                </div>
                
                <!-- Filtro de géneros -->
                <genre-filter id="genreFilter"></genre-filter>
                
                <!-- Resultados -->
                <div id="searchResults" style="min-height:200px; margin-top:2rem;"></div>
            </div>
        `;

        const input = document.getElementById('searchInput');
        const btn = document.getElementById('searchBtn');
        const genreFilter = document.getElementById('genreFilter');
        const results = document.getElementById('searchResults');
        
        let searchTimeout;

        // Escuchar cambios en el filtro de género
        genreFilter.addEventListener('genre-change', (e) => {
            this.state.currentGenre = e.detail.genreId;
            if (input.value.trim() || this.state.currentGenre) {
                performSearch();
            } else {
                results.innerHTML = '<p style="text-align:center; color:#666;">🔍 Escribí algo o seleccioná un género...</p>';
            }
        });

        /**
         * Función de búsqueda con AbortController
         */
        const performSearch = async () => {
            const query = input.value.trim();
            this.state.searchQuery = query;
            
            // Cancelar búsqueda anterior
            this.abortCurrentRequest();
            
            // Crear nuevo controlador
            this.currentController = new AbortController();
            
            results.innerHTML = '<loading-state></loading-state>';
            
            // Timeout de 8 segundos
            const timeoutId = setTimeout(() => {
                this.currentController.abort();
            }, 8000);

            try {
                // Construir URL con parámetros
                let url = `${API_URL}/anime?limit=24`;
                if (query) url += `&q=${encodeURIComponent(query)}`;
                if (this.state.currentGenre) url += `&genres=${this.state.currentGenre}`;
                
                console.log('Buscando:', url);
                
                const res = await fetch(url, {
                    signal: this.currentController.signal
                });
                
                clearTimeout(timeoutId);
                
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                
                const data = await res.json();
                
                results.innerHTML = '';
                
                if (!data.data || data.data.length === 0) {
                    results.innerHTML = `
                        <div style="text-align:center; padding:3rem;">
                            <p style="color:#666; font-size:1.2rem;">😢 No se encontraron animes</p>
                            <p style="color:#999; margin-top:0.5rem;">Probá con otra búsqueda o filtro</p>
                        </div>
                    `;
                    return;
                }
                
                // Mostrar cantidad de resultados
                const resultCount = document.createElement('p');
                resultCount.style.marginBottom = '1rem';
                resultCount.style.color = '#666';
                resultCount.textContent = `📊 ${data.data.length} resultados encontrados`;
                results.appendChild(resultCount);
                
                // Grid de resultados
                const grid = document.createElement('div');
                grid.className = 'grid-container';
                
                data.data.forEach(anime => {
                    const card = document.createElement('anime-card');
                    card.data = anime;
                    grid.appendChild(card);
                });
                
                results.appendChild(grid);
                
            } catch (error) {
                clearTimeout(timeoutId);
                
                console.error('Error búsqueda:', error);
                
                if (error.name === 'AbortError') {
                    results.innerHTML = '<error-state message="⏱️ La búsqueda tardó demasiado"></error-state>';
                } else {
                    results.innerHTML = '<error-state message="Error en la búsqueda"></error-state>';
                }
            }
        };

        // DEBOUNCE: 500ms después de dejar de escribir
        input.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                if (input.value.trim() || this.state.currentGenre) {
                    performSearch();
                } else {
                    results.innerHTML = '<p style="text-align:center; color:#666;">🔍 Escribí algo para buscar...</p>';
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

        // Si hay una búsqueda previa, ejecutarla
        if (this.state.searchQuery) {
            performSearch();
        } else {
            results.innerHTML = '<p style="text-align:center; color:#666;">🔍 Escribí algo para buscar o seleccioná un género...</p>';
        }
    }

    /**
     * VISTA DETAIL - Detalle de anime
     */
    async showDetail(id) {
        this.state.currentId = id;
        
        // Cancelar petición anterior
        this.abortCurrentRequest();
        
        // Nuevo controlador
        this.currentController = new AbortController();
        
        this.content.innerHTML = '<loading-state></loading-state>';
        
        const timeoutId = setTimeout(() => {
            this.currentController.abort();
        }, 8000);

        try {
            console.log('Cargando detalle del anime:', id);
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
            
            console.error('Error detalle:', error);
            
            if (error.name === 'AbortError') {
                this.showError('⏱️ La petición tardó demasiado. Hacé click en reintentar.');
            } else {
                this.showError('Error al cargar el detalle');
            }
        }
    }
}

// Iniciar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});