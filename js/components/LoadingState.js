class LoadingState extends HTMLElement {
    constructor() {
        super();
        const div = document.createElement('div');
        div.style.display = 'flex';
        div.style.flexDirection = 'column';
        div.style.alignItems = 'center';
        div.style.justifyContent = 'center';
        div.style.padding = '3rem';
        
        const spinner = document.createElement('div');
        spinner.className = 'loading-spinner';
        
        const text = document.createElement('p');
        text.textContent = 'Cargando...';
        text.style.marginTop = '1rem';
        text.style.color = '#666';
        
        div.appendChild(spinner);
        div.appendChild(text);
        this.appendChild(div);
    }
}

if (!customElements.get('loading-state')) {
    customElements.define('loading-state', LoadingState);
}