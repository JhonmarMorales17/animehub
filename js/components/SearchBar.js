class SearchBar extends HTMLElement {
    constructor() {
        super();
        this.timeout = null;
        this.debounceDelay = 500;
        this.render();
    }

    render() {
        const placeholder = this.getAttribute('placeholder') || 'Buscar anime...';
        const value = this.getAttribute('value') || '';
        
        this.innerHTML = `
            <div style="display: flex; gap: 0.5rem;">
                <input type="text" 
                       id="searchInput" 
                       placeholder="${placeholder}"
                       value="${value}"
                       style="flex:1; padding:0.75rem; border:2px solid #ddd; border-radius:4px; font-size:1rem; transition: border-color 0.3s;">
                <button id="searchBtn" 
                        style="background:#e94560; color:white; border:none; padding:0 1.5rem; border-radius:4px; cursor:pointer; font-weight:bold; transition: background 0.3s;">
                    Buscar
                </button>
            </div>
        `;

        const input = this.querySelector('#searchInput');
        const btn = this.querySelector('#searchBtn');

        /**
         * Disparar evento de búsqueda inmediato
         */
        const emitSearch = () => {
            const query = input.value.trim();
            if (query) {
                this.dispatchEvent(new CustomEvent('search', {
                    bubbles: true,
                    composed: true,
                    detail: { query }
                }));
            }
        };

        /**
         * Disparar evento con debounce (mientras escribe)
         */
        const emitSearchDebounced = () => {
            clearTimeout(this.timeout);
            this.timeout = setTimeout(() => {
                const query = input.value.trim();
                this.dispatchEvent(new CustomEvent('search-debounced', {
                    bubbles: true,
                    composed: true,
                    detail: { query }
                }));
            }, this.debounceDelay);
        };

        // Eventos del botón
        btn.addEventListener('click', () => emitSearch());
        
        // Eventos del input
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                emitSearch();
            }
        });
        
        input.addEventListener('input', () => {
            const query = input.value.trim();
            if (!query) {
                // Si está vacío, notificar para limpiar resultados
                this.dispatchEvent(new CustomEvent('search-clear', {
                    bubbles: true,
                    composed: true
                }));
            }
            emitSearchDebounced();
        });
    }

    /**
     * setValue(query)
     * Actualiza el valor del input desde afuera
     */
    setValue(query) {
        const input = this.querySelector('#searchInput');
        if (input) {
            input.value = query;
            // Disparar búsqueda automáticamente
            if (query.trim()) {
                this.dispatchEvent(new CustomEvent('search', {
                    bubbles: true,
                    composed: true,
                    detail: { query }
                }));
            }
        }
    }

    /**
     * getValue()
     * Obtiene el valor actual del input
     */
    getValue() {
        const input = this.querySelector('#searchInput');
        return input ? input.value.trim() : '';
    }

    /**
     * clear()
     * Limpia el input
     */
    clear() {
        const input = this.querySelector('#searchInput');
        if (input) {
            input.value = '';
        }
    }
}

customElements.define('search-bar', SearchBar);