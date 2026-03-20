class NavBar extends HTMLElement {
    constructor() {
        super();
        this.render();
    }
    
    render() {
        this.innerHTML = `
            <div class="nav-container">
                <div class="nav-logo">WorldHub</div>
                <div class="nav-links">
                    <button class="nav-link active" data-view="home">Inicio</button>
                    <button class="nav-link" data-view="search">Buscar</button>
                </div>
            </div>
        `;
        
        //logo
        this.querySelector('.nav-logo').addEventListener('click', () => {
            const event = new CustomEvent('navigate', {
                bubbles: true,
                composed: true,
                detail: 'home'
            });
            this.dispatchEvent(event);
        });
        
        //links
        this.querySelectorAll('.nav-link').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.target.dataset.view;
                const event = new CustomEvent('navigate', {
                    bubbles: true,
                    composed: true,
                    detail: view
                });
                this.dispatchEvent(event);
            });
        });
    }
    
    setActive(view) {
        this.querySelectorAll('.nav-link').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });
    }
}

if (!customElements.get('nav-bar')) {
    customElements.define('nav-bar', NavBar);
}