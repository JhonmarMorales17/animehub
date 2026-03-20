class GenreFilter extends HTMLElement {
    constructor() {
        super();
        this.genres = [];
        this.selectedGenre = '';
        this.render();
        this.loadGenres();
    }

    /**
     * Carga los géneros desde la API
     * Endpoint: https://api.jikan.moe/v4/genres/anime
     */
    async loadGenres() {
        try {
            const response = await fetch('https://api.jikan.moe/v4/genres/anime');
            const data = await response.json();
            this.genres = data.data;
            this.render(); // Re-renderizar con los géneros cargados
        } catch (error) {
            console.error('Error cargando géneros:', error);
        }
    }

    render() {
        this.innerHTML = `
            <div style="margin-bottom: 1rem;">
                <label for="genreSelect" style="display: block; margin-bottom: 0.5rem; font-weight: bold; color: #333;">
                    🏷️ Filtrar por género:
                </label>
                <select id="genreSelect" style="width: 100%; padding: 0.75rem; border: 2px solid #ddd; border-radius: 4px; font-size: 1rem;">
                    <option value="">Todos los géneros</option>
                    ${this.genres.map(genre => 
                        `<option value="${genre.mal_id}">${genre.name}</option>`
                    ).join('')}
                </select>
            </div>
        `;

        const select = this.querySelector('#genreSelect');
        select.addEventListener('change', (e) => {
            // Disparar evento para que app.js lo escuche
            this.dispatchEvent(new CustomEvent('genre-change', {
                bubbles: true,
                composed: true,
                detail: { genreId: e.target.value }
            }));
        });
    }
}

// Registrar el componente
customElements.define('genre-filter', GenreFilter);