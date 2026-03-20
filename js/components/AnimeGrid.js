class AnimeGrid extends HTMLElement {
    constructor() {
        super();
        this.animes = [];
        this.render();
    }

    /**
     * set data(animes)
     * Recibe el array de animes y renderiza el grid
     */
    set data(animes) {
        this.animes = animes || [];
        this.render();
    }

    render() {
        // Limpiar contenido previo
        while (this.firstChild) {
            this.removeChild(this.firstChild);
        }

        const container = document.createElement('div');
        container.className = 'grid-container';

        if (this.animes.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.style.textAlign = 'center';
            emptyState.style.padding = '2rem';
            emptyState.style.color = '#666';
            emptyState.textContent = 'No hay animes para mostrar';
            container.appendChild(emptyState);
        } else {
            // Por cada anime, crear una tarjeta
            this.animes.forEach(anime => {
                const card = document.createElement('anime-card');
                card.data = anime;
                container.appendChild(card);
            });
        }

        this.appendChild(container);
    }
}

customElements.define('anime-grid', AnimeGrid);