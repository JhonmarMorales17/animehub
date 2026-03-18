class ErrorState extends HTMLElement {
    constructor() {
        super();
        this.render();
    }
    
    render() {
        const div = document.createElement('div');
        div.style.textAlign = 'center';
        div.style.padding = '2rem';
        
        const msg = document.createElement('p');
        msg.style.color = '#e94560';
        msg.style.marginBottom = '1rem';
        msg.textContent = this.getAttribute('message') || 'Error al cargar';
        
        const btn = document.createElement('button');
        btn.className = 'retry-button';
        btn.textContent = 'Reintentar';
        
        btn.addEventListener('click', () => {
            const event = new CustomEvent('retry', {
                bubbles: true,
                composed: true
            });
            this.dispatchEvent(event);
        });
        
        div.appendChild(msg);
        div.appendChild(btn);
        this.appendChild(div);
    }
}

if (!customElements.get('error-state')) {
    customElements.define('error-state', ErrorState);
}