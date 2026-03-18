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
        
        card.innerHTML = `
            <img src="${this.anime.images?.jpg?.image_url || 'https://via.placeholder.com/200x250?text=No+Image'}" 
                 alt="${this.anime.title}">
            <div class="anime-card-content">
                <h3>${this.anime.title_english || this.anime.title}</h3>
                <span class="anime-score">⭐ ${this.anime.score || 'N/A'}</span>
            </div>
        `;
        
        card.addEventListener('click', (e) => {
            e.stopPropagation();
            //disparar evento que burbujee hasta app.js
            const event = new CustomEvent('show-detail', {
                bubbles: true,
                composed: true,
                detail: { id: this.anime.mal_id }
            });
            this.dispatchEvent(event);
        });
        
        this.appendChild(card);
    }
}

//asegurar que se registre solo una vez
if (!customElements.get('anime-card')) {
    customElements.define('anime-card', AnimeCard);
}