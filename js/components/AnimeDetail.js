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
        
        backBtn.addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('navigate-back', { 
                bubbles: true,
                composed: true 
            }));
        });

        // Contenido principal
        const content = document.createElement('div');
        content.className = 'detail-content';

        // Columna izquierda - Imagen
        const imageCol = document.createElement('div');
        imageCol.className = 'detail-image';
        
        const img = document.createElement('img');
        img.src = this.anime.images?.jpg?.large_image_url || this.anime.images?.jpg?.image_url;
        img.alt = this.anime.title;
        img.loading = 'lazy';
        imageCol.appendChild(img);

        // Columna derecha - Info
        const infoCol = document.createElement('div');
        infoCol.style.flex = '1';

        // Título principal
        const title = document.createElement('h2');
        title.textContent = this.anime.title_english || this.anime.title;
        title.style.fontSize = '2rem';
        title.style.marginBottom = '0.5rem';
        title.style.color = '#333';
        infoCol.appendChild(title);

        // Título japonés
        if (this.anime.title_japanese) {
            const japTitle = document.createElement('h3');
            japTitle.style.color = '#666';
            japTitle.style.fontSize = '1.2rem';
            japTitle.style.marginBottom = '1rem';
            japTitle.style.fontWeight = 'normal';
            japTitle.textContent = this.anime.title_japanese;
            infoCol.appendChild(japTitle);
        }

        // Métricas
        const metrics = document.createElement('div');
        metrics.style.display = 'flex';
        metrics.style.gap = '1rem';
        metrics.style.margin = '1.5rem 0';
        metrics.style.flexWrap = 'wrap';

        // Score
        const score = document.createElement('span');
        score.style.background = '#e94560';
        score.style.color = 'white';
        score.style.padding = '0.5rem 1rem';
        score.style.borderRadius = '25px';
        score.style.fontWeight = 'bold';
        score.innerHTML = `⭐ ${this.anime.score || 'N/A'}`;

        // Episodios
        const episodes = document.createElement('span');
        episodes.style.background = '#4ecdc4';
        episodes.style.color = 'white';
        episodes.style.padding = '0.5rem 1rem';
        episodes.style.borderRadius = '25px';
        episodes.style.fontWeight = 'bold';
        episodes.innerHTML = `📺 ${this.anime.episodes || '?'} eps`;

        // Estado
        const status = document.createElement('span');
        status.style.background = '#1a1a2e';
        status.style.color = 'white';
        status.style.padding = '0.5rem 1rem';
        status.style.borderRadius = '25px';
        status.style.fontWeight = 'bold';
        status.textContent = this.anime.status || '?';

        metrics.appendChild(score);
        metrics.appendChild(episodes);
        metrics.appendChild(status);
        infoCol.appendChild(metrics);

        // Géneros
        if (this.anime.genres && this.anime.genres.length > 0) {
            const genresDiv = document.createElement('div');
            genresDiv.style.margin = '1.5rem 0';
            
            this.anime.genres.forEach(genre => {
                const tag = document.createElement('span');
                tag.style.background = '#e0e0e0';
                tag.style.padding = '0.3rem 1rem';
                tag.style.borderRadius = '20px';
                tag.style.marginRight = '0.5rem';
                tag.style.marginBottom = '0.5rem';
                tag.style.display = 'inline-block';
                tag.style.fontSize = '0.9rem';
                tag.textContent = genre.name;
                genresDiv.appendChild(tag);
            });
            
            infoCol.appendChild(genresDiv);
        }

        // Sinopsis
        const synopsisTitle = document.createElement('h3');
        synopsisTitle.style.margin = '1.5rem 0 0.5rem';
        synopsisTitle.style.fontSize = '1.3rem';
        synopsisTitle.style.color = '#333';
        synopsisTitle.textContent = 'Sinopsis';
        infoCol.appendChild(synopsisTitle);

        const synopsis = document.createElement('p');
        synopsis.style.lineHeight = '1.8';
        synopsis.style.color = '#444';
        synopsis.style.marginBottom = '1.5rem';
        synopsis.textContent = this.anime.synopsis || 'No hay sinopsis disponible.';
        infoCol.appendChild(synopsis);

        // Información adicional
        const extraInfo = document.createElement('div');
        extraInfo.style.marginTop = '2rem';
        extraInfo.style.padding = '1.5rem';
        extraInfo.style.background = '#f8f8f8';
        extraInfo.style.borderRadius = '12px';
        extraInfo.style.border = '1px solid #eee';

        if (this.anime.studios && this.anime.studios.length > 0) {
            extraInfo.innerHTML += `<p style="margin-bottom: 0.8rem;"><strong>🏢 Estudio:</strong> ${this.anime.studios[0].name}</p>`;
        }
        
        if (this.anime.aired?.string) {
            extraInfo.innerHTML += `<p style="margin-bottom: 0.8rem;"><strong>📅 Fecha de emisión:</strong> ${this.anime.aired.string}</p>`;
        }

        if (this.anime.rank) {
            extraInfo.innerHTML += `<p style="margin-bottom: 0.8rem;"><strong>🏆 Ranking:</strong> #${this.anime.rank}</p>`;
        }

        if (this.anime.popularity) {
            extraInfo.innerHTML += `<p style="margin-bottom: 0.8rem;"><strong>🔥 Popularidad:</strong> #${this.anime.popularity}</p>`;
        }

        if (this.anime.source) {
            extraInfo.innerHTML += `<p style="margin-bottom: 0.8rem;"><strong>📖 Fuente:</strong> ${this.anime.source}</p>`;
        }

        if (this.anime.duration) {
            extraInfo.innerHTML += `<p style="margin-bottom: 0.8rem;"><strong>⏱️ Duración:</strong> ${this.anime.duration}</p>`;
        }

        if (this.anime.rating) {
            extraInfo.innerHTML += `<p style="margin-bottom: 0.8rem;"><strong>🔞 Clasificación:</strong> ${this.anime.rating}</p>`;
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