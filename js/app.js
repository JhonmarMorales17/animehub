const API_URL = 'https://api.jikan.moe/v4';

class App {
    constructor() {
        this.content = document.getElementById('app-content');
        this.navBar = document.querySelector('nav-bar');
        this.state = { 
            view: 'home',
            previousView: null,
            searchQuery: '',
            currentGenre: ''
        };
        
        // Escuchar eventos
        document.addEventListener('navigate', (e) => this.navigate(e.detail));
        document.addEventListener('show-detail', (e) => this.showDetail(e.detail.id));
        document.addEventListener('navigate-back', () => this.goBack());
        document.addEventListener('retry', () => this.retry());
        
        this.navigate('home');
    }

    navigate(view) {
        this.state.previousView = this.state.view;
        this.state.view = view;
        this.navBar.setActive(view);
        
        if (view === 'home') this.loadHome();
        if (view === 'search') this.loadSearch();
    }

    goBack() {
        if (this.state.previousView) {
            this.navigate(this.state.previousView);
        } else {
            this.navigate('home');
        }
    }

    retry() {
        if (this.state.view === 'home') this.loadHome();
        if (this.state.view === 'search') this.loadSearch();
    }

    async loadHome() {
        this.content.innerHTML = '<loading-state></loading-state>';
        
        try {
            const res = await fetch(`${API_URL}/top/anime?limit=24`);
            const data = await res.json();
            
            const grid = document.createElement('div');
            grid.className = 'grid-container';
            
            data.data.forEach(anime => {
                const card = document.createElement('anime-card');
                card.data = anime;
                grid.appendChild(card);
            });
            
            this.content.innerHTML = '';
            this.content.appendChild(grid);
            
        } catch (error) {
            const errorEl = document.createElement('error-state');
            errorEl.setAttribute('message', 'Error al cargar animes');
            this.content.innerHTML = '';
            this.content.appendChild(errorEl);
        }
    }

    loadSearch() {
        this.content.innerHTML = `
            <div style="padding: 2rem; max-width: 1200px; margin: 0 auto;">
                <h2 style="margin-bottom: 1rem; color: #333;">🔍 Buscar Anime</h2>
                
                <!-- Barra de búsqueda -->
                <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem;">
                    <input type="text" 
                           id="searchInput" 
                           placeholder="Ej: Naruto, One Piece..." 
                           value="${this.state.searchQuery}"
                           style="flex:1; padding:0.75rem; border:2px solid #ddd; border-radius:4px; font-size:1rem;">
                    <button id="searchBtn" 
                            style="background:#e94560; color:white; border:none; padding:0 1.5rem; border-radius:4px; cursor:pointer; font-weight:bold;">
                        Buscar
                    </button>
                </div>
                
                <!-- Filtro de géneros (nuevo componente) -->
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
            // Si hay texto o género seleccionado, buscar
            if (input.value.trim() || this.state.currentGenre) {
                performSearch();
            }
        });

        // Función de búsqueda
        const performSearch = async () => {
            const query = input.value.trim();
            this.state.searchQuery = query;
            
            results.innerHTML = '<loading-state></loading-state>';
            
            try {
                // Construir URL con parámetros
                let url = `${API_URL}/anime?limit=24`;
                if (query) url += `&q=${encodeURIComponent(query)}`;
                if (this.state.currentGenre) url += `&genres=${this.state.currentGenre}`;
                
                const res = await fetch(url);
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
                
                const grid = document.createElement('div');
                grid.className = 'grid-container';
                
                data.data.forEach(anime => {
                    const card = document.createElement('anime-card');
                    card.data = anime;
                    grid.appendChild(card);
                });
                
                results.appendChild(grid);
                
            } catch (error) {
                const errorEl = document.createElement('error-state');
                errorEl.setAttribute('message', 'Error en la búsqueda');
                results.innerHTML = '';
                results.appendChild(errorEl);
            }
        };

        // Debounce para búsqueda mientras se escribe
        input.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                if (input.value.trim() || this.state.currentGenre) {
                    performSearch();
                } else {
                    results.innerHTML = '<p style="text-align:center; color:#666;">🔍 Escribe algo para buscar...</p>';
                }
            }, 500); // 500ms de debounce
        });

        btn.addEventListener('click', performSearch);
        
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                performSearch();
            }
        });

        // Si hay una búsqueda previa, mostrarla
        if (this.state.searchQuery) {
            input.value = this.state.searchQuery;
            performSearch();
        } else {
            results.innerHTML = '<p style="text-align:center; color:#666;">🔍 Escribe algo para buscar o seleccioná un género...</p>';
        }
    }

    async showDetail(id) {
        this.content.innerHTML = '<loading-state></loading-state>';
        
        try {
            // Usar el endpoint /full para obtener toda la información
            const res = await fetch(`${API_URL}/anime/${id}/full`);
            const data = await res.json();
            
            // Usar el nuevo componente AnimeDetail
            const detail = document.createElement('anime-detail');
            detail.data = data.data;
            
            this.content.innerHTML = '';
            this.content.appendChild(detail);
            
        } catch (error) {
            const errorEl = document.createElement('error-state');
            errorEl.setAttribute('message', 'Error al cargar el detalle');
            this.content.innerHTML = '';
            this.content.appendChild(errorEl);
        }
    }
}

// Iniciar la aplicación
document.addEventListener('DOMContentLoaded', () => {
    new App();
});