const API_URL = 'https://api.jikan.moe/v4';

class App {
    constructor() {
        this.content = document.getElementById('app-content');
        this.navBar = document.querySelector('nav-bar');
        this.state = { view: 'home' };
        
        document.addEventListener('navigate', (e) => {
            console.log('Navegar a:', e.detail);
            this.navigate(e.detail);
        });
        
        document.addEventListener('show-detail', (e) => {
            console.log('Mostrar detalle:', e.detail.id);
            this.showDetail(e.detail.id);
        });
        
        //iniciar
        this.navigate('home');
    }
    
    navigate(view) {
        console.log('Navegando a:', view);
        this.state.view = view;
        this.navBar.setActive(view);
        
        if (view === 'home') this.loadHome();
        if (view === 'search') this.loadSearch();
    }
    
    async loadHome() {
        this.content.innerHTML = '<loading-state></loading-state>';
        
        try {
            const res = await fetch(`${API_URL}/top/anime?limit=20`);
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
            console.error('Error:', error);
            const errorEl = document.createElement('error-state');
            errorEl.setAttribute('message', 'Error al cargar animes');
            
            errorEl.addEventListener('retry', () => this.loadHome());
            
            this.content.innerHTML = '';
            this.content.appendChild(errorEl);
        }
    }
    
    loadSearch() {
        this.content.innerHTML = `
            <div style="padding: 2rem; max-width: 1200px; margin: 0 auto;">
                <h2 style="margin-bottom: 1rem;">Buscar Anime</h2>
                <div style="display: flex; gap: 0.5rem; margin-bottom: 2rem;">
                    <input type="text" 
                           id="searchInput"
                           placeholder="Ej: Naruto, One Piece, Dragon Ball..." 
                           style="flex: 1; padding: 0.75rem; border: 2px solid #ddd; border-radius: 4px; font-size: 1rem;">
                    <button id="searchBtn" 
                            style="background: #e94560; color: white; border: none; padding: 0 1.5rem; border-radius: 4px; cursor: pointer; font-size: 1rem;">
                        Buscar
                    </button>
                </div>
                <div id="searchResults" style="min-height: 200px;"></div>
            </div>
        `;
        
        const input = document.getElementById('searchInput');
        const btn = document.getElementById('searchBtn');
        const results = document.getElementById('searchResults');
        
        const doSearch = async () => {
            const query = input.value.trim();
            if (!query) {
                results.innerHTML = '<p style="color: #666; text-align: center;">Ingresa un nombre para buscar</p>';
                return;
            }
            
            results.innerHTML = '<loading-state></loading-state>';
            
            try {
                const res = await fetch(`${API_URL}/anime?q=${encodeURIComponent(query)}&limit=20`);
                const data = await res.json();
                
                results.innerHTML = '';
                
                if (!data.data || data.data.length === 0) {
                    results.innerHTML = '<p style="text-align: center; padding: 2rem;">No se encontraron animes 😢</p>';
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
                console.error('Error búsqueda:', error);
                results.innerHTML = '<p style="color: #e94560; text-align: center;">Error en la búsqueda</p>';
            }
        };
        
        btn.addEventListener('click', doSearch);
        
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                doSearch();
            }
        });
        
        //mostrar mensaje inicial
        results.innerHTML = '<p style="color: #666; text-align: center;">🔍 Escribe algo para buscar...</p>';
    }
    
    async showDetail(id) {
        console.log('Cargando detalle para ID:', id);
        this.content.innerHTML = '<loading-state></loading-state>';
        
        try {
            const res = await fetch(`${API_URL}/anime/${id}`);
            const data = await res.json();
            const anime = data.data;
            
            console.log('Anime cargado:', anime.title);
            
            this.content.innerHTML = `
                <div class="detail-container">
                    <button class="back-button" id="backBtn">← Volver</button>
                    <div class="detail-content">
                        <div class="detail-image">
                            <img src="${anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || 'https://via.placeholder.com/300x400'}" 
                                 alt="${anime.title}">
                        </div>
                        <div style="flex: 1;">
                            <h2>${anime.title_english || anime.title}</h2>
                            ${anime.title_japanese ? `<h3 style="color: #666; font-size: 1rem; margin-bottom: 1rem;">${anime.title_japanese}</h3>` : ''}
                            
                            <div style="display: flex; gap: 1rem; margin: 1rem 0; flex-wrap: wrap;">
                                <span style="background: #e94560; color: white; padding: 0.25rem 0.5rem; border-radius: 4px;">⭐ ${anime.score || 'N/A'}</span>
                                <span style="background: #4ecdc4; color: white; padding: 0.25rem 0.5rem; border-radius: 4px;">📺 ${anime.episodes || '?'} eps</span>
                                <span style="background: #1a1a2e; color: white; padding: 0.25rem 0.5rem; border-radius: 4px;">${anime.status || '?'}</span>
                            </div>
                            
                            ${anime.genres ? `
                                <div style="margin: 1rem 0;">
                                    ${anime.genres.map(g => `<span style="background: #ddd; padding: 0.2rem 0.5rem; border-radius: 20px; margin-right: 0.3rem; font-size: 0.8rem;">${g.name}</span>`).join('')}
                                </div>
                            ` : ''}
                            
                            <h3 style="margin: 1rem 0 0.5rem;">Sinopsis</h3>
                            <p style="line-height: 1.6;">${anime.synopsis || 'No hay sinopsis disponible.'}</p>
                        </div>
                    </div>
                </div>
            `;
            
            const backBtn = document.getElementById('backBtn');
            if (backBtn) {
                backBtn.addEventListener('click', () => {
                    this.navigate(this.state.view);
                });
            }
            
        } catch (error) {
            console.error('Error cargando detalle:', error);
            const errorEl = document.createElement('error-state');
            errorEl.setAttribute('message', 'Error al cargar el detalle');
            errorEl.addEventListener('retry', () => this.showDetail(id));
            this.content.innerHTML = '';
            this.content.appendChild(errorEl);
        }
    }
}

//iniciar app cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    console.log('App iniciando...');
    new App();
});