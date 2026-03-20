class AnimeDetail extends HTMLElement {
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
        
        const container = document.createElement('div');
        container.className = 'detail-container';

        // Botón volver
        const backBtn = document.createElement('button');
        backBtn.className = 'back-button';
        backBtn.innerHTML = '← Volver';
        backBtn.style.background = 'none';
        backBtn.style.border = 'none';
        backBtn.style.color = '#e94560';
        backBtn.style.fontSize = '1rem';
        backBtn.style.cursor = 'pointer';
        backBtn.style.marginBottom = '1rem';
        
        backBtn.addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('navigate-back', { 
                bubbles: true,
                composed: true 
            }));
        });

        // Contenido principal
        const content = document.createElement('div');
        content.className = 'detail-content';
        content.style.display = 'flex';
        content.style.gap = '2rem';

        // Columna izquierda - Imagen
        const imageCol = document.createElement('div');
        imageCol.className = 'detail-image';
        
        const img = document.createElement('img');
        img.src = this.anime.images?.jpg?.large_image_url || this.anime.images?.jpg?.image_url;
        img.alt = this.anime.title;
        img.style.width = '100%';
        img.style.maxWidth = '300px';
        img.style.borderRadius = '8px';
        imageCol.appendChild(img);

        // Columna derecha - Info
        const infoCol = document.createElement('div');
        infoCol.style.flex = '1';

        // Título principal
        const title = document.createElement('h2');
        title.textContent = this.anime.title_english || this.anime.title;
        title.style.marginBottom = '0.5rem';
        infoCol.appendChild(title);

        // Título japonés (si existe)
        if (this.anime.title_japanese) {
            const japTitle = document.createElement('h3');
            japTitle.style.color = '#666';
            japTitle.style.fontSize = '1rem';
            japTitle.style.marginBottom = '1rem';
            japTitle.textContent = this.anime.title_japanese;
            infoCol.appendChild(japTitle);
        }

        // Métricas rápidas
        const metrics = document.createElement('div');
        metrics.style.display = 'flex';
        metrics.style.gap = '1rem';
        metrics.style.margin = '1rem 0';
        metrics.style.flexWrap = 'wrap';

        // Score
        const score = document.createElement('span');
        score.style.background = '#e94560';
        score.style.color = 'white';
        score.style.padding = '0.25rem 0.5rem';
        score.style.borderRadius = '4px';
        score.style.fontSize = '0.9rem';
        score.innerHTML = `⭐ ${this.anime.score || 'N/A'}`;

        // Episodios
        const episodes = document.createElement('span');
        episodes.style.background = '#4ecdc4';
        episodes.style.color = 'white';
        episodes.style.padding = '0.25rem 0.5rem';
        episodes.style.borderRadius = '4px';
        episodes.style.fontSize = '0.9rem';
        episodes.innerHTML = `📺 ${this.anime.episodes || '?'} eps`;

        // Estado
        const status = document.createElement('span');
        status.style.background = '#1a1a2e';
        status.style.color = 'white';
        status.style.padding = '0.25rem 0.5rem';
        status.style.borderRadius = '4px';
        status.style.fontSize = '0.9rem';
        status.textContent = this.anime.status || '?';

        metrics.appendChild(score);
        metrics.appendChild(episodes);
        metrics.appendChild(status);
        infoCol.appendChild(metrics);

        // Géneros
        if (this.anime.genres && this.anime.genres.length > 0) {
            const genresDiv = document.createElement('div');
            genresDiv.style.margin = '1rem 0';
            
            this.anime.genres.forEach(genre => {
                const tag = document.createElement('span');
                tag.style.background = '#ddd';
                tag.style.padding = '0.2rem 0.5rem';
                tag.style.borderRadius = '20px';
                tag.style.marginRight = '0.3rem';
                tag.style.marginBottom = '0.3rem';
                tag.style.fontSize = '0.8rem';
                tag.style.display = 'inline-block';
                tag.textContent = genre.name;
                genresDiv.appendChild(tag);
            });
            
            infoCol.appendChild(genresDiv);
        }

        // Sinopsis
        const synopsisTitle = document.createElement('h3');
        synopsisTitle.style.margin = '1rem 0 0.5rem';
        synopsisTitle.textContent = 'Sinopsis';
        infoCol.appendChild(synopsisTitle);

        const synopsis = document.createElement('p');
        synopsis.style.lineHeight = '1.6';
        synopsis.style.color = '#444';
        synopsis.textContent = this.anime.synopsis || 'No hay sinopsis disponible.';
        infoCol.appendChild(synopsis);

        // Información adicional
        const extraInfo = document.createElement('div');
        extraInfo.style.marginTop = '2rem';
        extraInfo.style.padding = '1rem';
        extraInfo.style.background = '#f5f5f5';
        extraInfo.style.borderRadius = '8px';
        extraInfo.style.fontSize = '0.95rem';

        if (this.anime.studios && this.anime.studios.length > 0) {
            extraInfo.innerHTML += `<p style="margin-bottom: 0.5rem;"><strong>🏢 Estudio:</strong> ${this.anime.studios[0].name}</p>`;
        }
        
        if (this.anime.aired?.string) {
            extraInfo.innerHTML += `<p style="margin-bottom: 0.5rem;"><strong>📅 Emisión:</strong> ${this.anime.aired.string}</p>`;
        }

        if (this.anime.rank) {
            extraInfo.innerHTML += `<p style="margin-bottom: 0.5rem;"><strong>🏆 Ranking:</strong> #${this.anime.rank}</p>`;
        }

        if (this.anime.popularity) {
            extraInfo.innerHTML += `<p style="margin-bottom: 0.5rem;"><strong>🔥 Popularidad:</strong> #${this.anime.popularity}</p>`;
        }

        if (this.anime.source) {
            extraInfo.innerHTML += `<p style="margin-bottom: 0.5rem;"><strong>📖 Fuente:</strong> ${this.anime.source}</p>`;
        }

        infoCol.appendChild(extraInfo);

        content.appendChild(imageCol);
        content.appendChild(infoCol);

        container.appendChild(backBtn);
        container.appendChild(content);
        this.appendChild(container);
    }
}

customElements.define('anime-detail', AnimeDetail);