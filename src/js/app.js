import Alpine from 'alpinejs'
import intersect from '@alpinejs/intersect'
import persist from '@alpinejs/persist'

Alpine.plugin(intersect);
Alpine.plugin(persist);

document.addEventListener('alpine:init', () => {
    Alpine.data('app', () => ({
        dark: true,

        toggleTheme() {
            if (window.localStorage.theme === 'dark') {
                document.documentElement.classList.remove('dark');
                window.localStorage.theme = null;
            } else {
                document.documentElement.classList.add('dark');
                window.localStorage.theme = 'dark';
            }

            this.dark = !this.dark;
        },

        init() {
            if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                this.dark = true;
            } else {
                this.dark = false;
            }
        }
    }))
})

window.Alpine = Alpine
Alpine.start()