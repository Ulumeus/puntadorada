/**
 * Punta Dorada Barú - Main JavaScript
 * Versión refactorizada con código moderno ES6+
 * Optimizado para performance y mantenibilidad
 */

const PuntaDorada = (() => {
    'use strict';

    /* ==========================================
       CONFIGURACIÓN Y CONSTANTES
       ========================================== */
    const CONFIG = {
        scrollThreshold: 50,
        countdownDays: 45,
        animationThreshold: 0.1,
        animationRootMargin: '0px 0px -100px 0px',
        videoThreshold: 0.25,
    };

    const SELECTORS = {
        navbar: '#navbar',
        menuToggle: '#menuToggle',
        mobileMenu: '#mobileMenu',
        video: '.hero-video',
        faqQuestion: '.faq-question',
        faqItem: '.faq-item',
        fadeIn: '.fade-in',
        lazyImage: 'img[data-src]',
        scrollToTop: '#scrollToTop',
        whatsappFloat: '.whatsapp-float',
        countdown: {
            days: '#days',
            hours: '#hours',
            minutes: '#minutes',
            seconds: '#seconds',
        },
    };

    /* ==========================================
       UTILIDADES
       ========================================== */
    const Utils = {
        /**
         * Selector seguro que retorna null si no encuentra elemento
         */
        $: (selector) => document.querySelector(selector),
        
        /**
         * Selector múltiple
         */
        $$: (selector) => document.querySelectorAll(selector),

        /**
         * Padding de números con ceros
         */
        padZero: (num) => String(num).padStart(2, '0'),

        /**
         * Debounce para optimizar eventos frecuentes
         */
        debounce: (func, wait = 100) => {
            let timeout;
            return (...args) => {
                clearTimeout(timeout);
                timeout = setTimeout(() => func.apply(this, args), wait);
            };
        },

        /**
         * Throttle para limitar ejecuciones
         */
        throttle: (func, limit = 100) => {
            let inThrottle;
            return (...args) => {
                if (!inThrottle) {
                    func.apply(this, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        },

        /**
         * Verifica soporte de features
         */
        supports: (feature) => feature in window,
    };

    /* ==========================================
       NAVBAR MODULE
       ========================================== */
    const Navbar = {
        element: null,

        init() {
            this.element = Utils.$(SELECTORS.navbar);
            if (!this.element) return;

            this.handleScroll();
            window.addEventListener('scroll', Utils.throttle(() => this.handleScroll(), 100));
        },

        handleScroll() {
            const shouldAddClass = window.scrollY > CONFIG.scrollThreshold;
            this.element.classList.toggle('scrolled', shouldAddClass);
        },
    };

    /* ==========================================
       MOBILE MENU MODULE
       ========================================== */
    const MobileMenu = {
        toggle: null,
        menu: null,

        init() {
            this.toggle = Utils.$(SELECTORS.menuToggle);
            this.menu = Utils.$(SELECTORS.mobileMenu);
            
            if (!this.toggle || !this.menu) return;

            this.bindEvents();
        },

        bindEvents() {
            // Toggle menu
            this.toggle.addEventListener('click', () => this.toggleMenu());

            // Cerrar al hacer clic en enlaces
            this.menu.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => this.closeMenu());
            });

            // Cerrar al hacer clic fuera
            document.addEventListener('click', (e) => this.handleOutsideClick(e));
        },

        toggleMenu() {
            const isActive = this.menu.classList.toggle('active');
            this.toggle.classList.toggle('active', isActive);
        },

        closeMenu() {
            this.menu.classList.remove('active');
            this.toggle.classList.remove('active');
        },

        handleOutsideClick(event) {
            const clickedInside = this.menu.contains(event.target) || 
                                 this.toggle.contains(event.target);
            
            if (!clickedInside && this.menu.classList.contains('active')) {
                this.closeMenu();
            }
        },
    };

    /* ==========================================
       COUNTDOWN MODULE
       ========================================== */
    const Countdown = {
        elements: {},
        targetDate: null,
        intervalId: null,

        init() {
            // Verificar elementos
            this.elements = {
                days: Utils.$(SELECTORS.countdown.days),
                hours: Utils.$(SELECTORS.countdown.hours),
                minutes: Utils.$(SELECTORS.countdown.minutes),
                seconds: Utils.$(SELECTORS.countdown.seconds),
            };

            if (!Object.values(this.elements).every(Boolean)) return;

            // Establecer fecha objetivo
            this.targetDate = new Date();
            this.targetDate.setDate(this.targetDate.getDate() + CONFIG.countdownDays);

            // Iniciar countdown
            this.update();
            this.intervalId = setInterval(() => this.update(), 1000);
        },

        update() {
            const now = Date.now();
            const distance = this.targetDate - now;

            if (distance < 0) {
                this.handleExpiration();
                return;
            }

            const time = this.calculateTime(distance);
            this.render(time);
        },

        calculateTime(distance) {
            return {
                days: Math.floor(distance / (1000 * 60 * 60 * 24)),
                hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((distance % (1000 * 60)) / 1000),
            };
        },

        render(time) {
            Object.entries(time).forEach(([unit, value]) => {
                if (this.elements[unit]) {
                    this.elements[unit].textContent = value;
                }
            });
        },

        handleExpiration() {
            clearInterval(this.intervalId);
            Object.values(this.elements).forEach(el => el.textContent = '0');
        },

        destroy() {
            if (this.intervalId) {
                clearInterval(this.intervalId);
            }
        },
    };

    /* ==========================================
       VIDEO HERO MODULE
       ========================================== */
    const VideoHero = {
        video: null,
        observer: null,

        init() {
            this.video = Utils.$(SELECTORS.video);
            if (!this.video) return;

            this.setupVideo();
            this.setupIntersectionObserver();
            this.handleErrors();
        },

        setupVideo() {
            // Intentar reproducir cuando cargue
            this.video.addEventListener('loadeddata', () => {
                this.play();
            }, { once: true });

            // Asegurar que esté muteado para autoplay
            this.video.muted = true;
        },

        play() {
            this.video.play().catch(error => {
                console.warn('Autoplay bloqueado por el navegador:', error);
                // El poster se mostrará automáticamente
            });
        },

        setupIntersectionObserver() {
            if (!Utils.supports('IntersectionObserver')) return;

            this.observer = new IntersectionObserver(
                (entries) => this.handleIntersection(entries),
                { threshold: CONFIG.videoThreshold }
            );

            this.observer.observe(this.video);
        },

        handleIntersection(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.play();
                } else {
                    this.video.pause();
                }
            });
        },

        handleErrors() {
            this.video.addEventListener('error', () => {
                console.error('Error al cargar video. Mostrando fallback.');
                this.video.style.display = 'none';
            });
        },

        destroy() {
            this.observer?.disconnect();
        },
    };

    /* ==========================================
       FAQ ACCORDION MODULE
       ========================================== */
    const FAQ = {
        init() {
            const questions = Utils.$$(SELECTORS.faqQuestion);
            if (!questions.length) return;

            // Event delegation para mejor performance
            document.addEventListener('click', (e) => {
                const question = e.target.closest(SELECTORS.faqQuestion);
                if (question) this.toggle(question);
            });
        },

        toggle(questionElement) {
            const item = questionElement.closest(SELECTORS.faqItem);
            if (!item) return;

            const wasActive = item.classList.contains('active');

            // Cerrar todos
            this.closeAll();

            // Abrir el clickeado si no estaba activo
            if (!wasActive) {
                item.classList.add('active');
            }
        },

        closeAll() {
            Utils.$$(SELECTORS.faqItem).forEach(item => {
                item.classList.remove('active');
            });
        },
    };

    /* ==========================================
       SMOOTH SCROLL MODULE
       ========================================== */
    const SmoothScroll = {
        init() {
            // Event delegation
            document.addEventListener('click', (e) => {
                const anchor = e.target.closest('a[href^="#"]');
                if (anchor) this.handleClick(e, anchor);
            });
        },

        handleClick(event, anchor) {
            const href = anchor.getAttribute('href');
            
            if (href === '#') {
                event.preventDefault();
                return;
            }

            const target = Utils.$(href);
            if (!target) return;

            event.preventDefault();
            
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });

            // Cerrar mobile menu si está abierto
            MobileMenu.closeMenu();
        },
    };

    /* ==========================================
       FADE IN ANIMATION MODULE
       ========================================== */
    const FadeInAnimation = {
        observer: null,

        init() {
            const elements = Utils.$$(SELECTORS.fadeIn);
            if (!elements.length) return;

            if (!Utils.supports('IntersectionObserver')) {
                this.fallback(elements);
                return;
            }

            this.setupObserver();
            elements.forEach(el => this.observer.observe(el));
        },

        setupObserver() {
            const options = {
                threshold: CONFIG.animationThreshold,
                rootMargin: CONFIG.animationRootMargin,
            };

            this.observer = new IntersectionObserver(
                (entries) => this.handleIntersection(entries),
                options
            );
        },

        handleIntersection(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    // Opcional: dejar de observar
                    // this.observer.unobserve(entry.target);
                }
            });
        },

        fallback(elements) {
            elements.forEach(el => el.classList.add('visible'));
        },

        destroy() {
            this.observer?.disconnect();
        },
    };

    /* ==========================================
       LAZY LOAD IMAGES MODULE
       ========================================== */
    const LazyLoad = {
        observer: null,

        init() {
            const images = Utils.$$(SELECTORS.lazyImage);
            if (!images.length) return;

            if (!Utils.supports('IntersectionObserver')) {
                this.fallback(images);
                return;
            }

            this.setupObserver();
            images.forEach(img => this.observer.observe(img));
        },

        setupObserver() {
            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.loadImage(entry.target);
                        this.observer.unobserve(entry.target);
                    }
                });
            });
        },

        loadImage(img) {
            const src = img.dataset.src;
            if (!src) return;

            img.src = src;
            img.removeAttribute('data-src');
            img.classList.add('loaded');

            // Manejar errores de carga
            img.addEventListener('error', () => {
                console.error(`Error al cargar imagen: ${src}`);
            }, { once: true });
        },

        fallback(images) {
            images.forEach(img => this.loadImage(img));
        },

        destroy() {
            this.observer?.disconnect();
        },
    };

    /* ==========================================
       SCROLL TO TOP MODULE
       ========================================== */
    const ScrollToTop = {
        button: null,

        init() {
            this.button = Utils.$(SELECTORS.scrollToTop);
            if (!this.button) return;

            this.handleScroll();
            window.addEventListener('scroll', Utils.throttle(() => this.handleScroll(), 200));
            this.button.addEventListener('click', () => this.scrollToTop());
        },

        handleScroll() {
            const shouldShow = window.scrollY > 300;
            this.button.classList.toggle('visible', shouldShow);
        },

        scrollToTop() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth',
            });
        },
    };

    /* ==========================================
       WHATSAPP FLOAT MODULE
       ========================================== */
    const WhatsAppFloat = {
        button: null,

        init() {
            this.button = Utils.$(SELECTORS.whatsappFloat);
            if (!this.button) return;

            // Mostrar después de scroll inicial
            window.addEventListener('scroll', () => this.handleScroll(), { once: true });
        },

        handleScroll() {
            if (window.scrollY > 200) {
                this.button?.classList.add('visible');
            }
        },
    };

    /* ==========================================
       INICIALIZACIÓN PRINCIPAL
       ========================================== */
    const init = () => {
        // Ejecutar cuando DOM esté listo
        const modules = [
            Navbar,
            MobileMenu,
            Countdown,
            VideoHero,
            FAQ,
            SmoothScroll,
            FadeInAnimation,
            LazyLoad,
            ScrollToTop,
            WhatsAppFloat,
        ];

        modules.forEach(module => {
            try {
                module.init();
            } catch (error) {
                console.error(`Error al inicializar módulo:`, error);
            }
        });

        // Log para debugging (remover en producción)
        if (process.env.NODE_ENV === 'development') {
            console.log('✅ Punta Dorada inicializado correctamente');
        }
    };

    /* ==========================================
       CLEANUP AL SALIR (Opcional para SPAs)
       ========================================== */
    const destroy = () => {
        Countdown.destroy();
        VideoHero.destroy();
        FadeInAnimation.destroy();
        LazyLoad.destroy();
    };

    /* ==========================================
       API PÚBLICA
       ========================================== */
    return {
        init,
        destroy,
        modules: {
            Navbar,
            MobileMenu,
            Countdown,
            VideoHero,
            FAQ,
            SmoothScroll,
            FadeInAnimation,
            LazyLoad,
            ScrollToTop,
            WhatsAppFloat,
        },
    };
})();

/* ==========================================
   AUTO-INICIALIZACIÓN
   ========================================== */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', PuntaDorada.init);
} else {
    PuntaDorada.init();
}

/* ==========================================
   EXPORTAR PARA POSIBLE USO EN OTROS SCRIPTS
   ========================================== */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PuntaDorada;
}
