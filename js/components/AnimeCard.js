class AnimeCard extends HTMLElement {
    constructor() {
        super();
        this.anime = null;
    }

    set data(anime) {
        this.anime = anime;
        this.render();
    }

    render() {
        this.innerHTML = '';
        const card = document.createElement('div');
        card.className = 'anime-card';
        card.style.position = 'relative';

        // Crear badge de estado
        const statusBadge = document.createElement('div');
        statusBadge.style.position = 'absolute';
        statusBadge.style.top = '10px';
        statusBadge.style.right = '10px';
        statusBadge.style.padding = '4px 8px';
        statusBadge.style.borderRadius = '12px';
        statusBadge.style.fontSize = '0.7rem';
        statusBadge.style.fontWeight = 'bold';
        statusBadge.style.zIndex = '10';
        
        // Color según estado
        if (this.anime.status === 'Currently Airing') {
            statusBadge.style.background = '#4caf50';
            statusBadge.style.color = 'white';
            statusBadge.textContent = 'EMITIENDO';
        } else if (this.anime.status === 'Finished Airing') {
            statusBadge.style.background = '#9e9e9e';
            statusBadge.style.color = 'white';
            statusBadge.textContent = 'FINALIZADO';
        } else {
            statusBadge.style.background = '#ff9800';
            statusBadge.style.color = 'white';
            statusBadge.textContent = 'PRÓXIMAMENTE';
        }

        // Imagen (con placeholder por si no hay)
        const imageUrl = this.anime.images?.jpg?.image_url || 'https://via.placeholder.com/200x250?text=No+Image';
        
        // Contenedor de imagen con badge
        const imageContainer = document.createElement('div');
        imageContainer.style.position = 'relative';
        
        const img = document.createElement('img');
        img.src = imageUrl;
        img.alt = this.anime.title;
        img.loading = 'lazy';
        img.style.width = '100%';
        img.style.height = '200px';
        img.style.objectFit = 'cover';
        
        imageContainer.appendChild(img);
        imageContainer.appendChild(statusBadge);

        // Contenido de la tarjeta
        const content = document.createElement('div');
        content.className = 'anime-card-content';
        
        const title = document.createElement('h3');
        title.textContent = this.anime.title_english || this.anime.title;
        
        const metaInfo = document.createElement('div');
        metaInfo.style.display = 'flex';
        metaInfo.style.justifyContent = 'space-between';
        metaInfo.style.alignItems = 'center';
        metaInfo.style.marginTop = '0.5rem';
        
        const score = document.createElement('span');
        score.className = 'anime-score';
        score.innerHTML = `⭐ ${this.anime.score || 'N/A'}`;
        
        const episodes = document.createElement('span');
        episodes.style.fontSize = '0.8rem';
        episodes.style.color = '#666';
        episodes.innerHTML = `📺 ${this.anime.episodes || '?'} eps`;
        
        metaInfo.appendChild(score);
        metaInfo.appendChild(episodes);
        
        content.appendChild(title);
        content.appendChild(metaInfo);
        
        card.appendChild(imageContainer);
        card.appendChild(content);

        // Evento click para ver detalle
        card.addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('show-detail', {
                bubbles: true,
                composed: true,
                detail: { id: this.anime.mal_id }
            }));
        });

        this.appendChild(card);
    }
}

customElements.define('anime-card', AnimeCard);