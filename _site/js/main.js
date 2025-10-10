/**
 * Punta Dorada - Main JavaScript
 * Manejo de navegación, countdown, animaciones y formularios
 */

(function() {
    'use strict';

    /* ==========================================
       NAVBAR SCROLL
       ========================================== */
    function initNavbar() {
        const navbar = document.getElementById('navbar');
        if (!navbar) return;

        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    /* ==========================================
       MOBILE MENU
       ========================================== */
    function initMobileMenu() {
        const menuToggle = document.getElementById('menuToggle');
        const mobileMenu = document.getElementById('mobileMenu');
        
        if (!menuToggle || !mobileMenu) return;

        menuToggle.addEventListener('click', function() {
            mobileMenu.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });

        // Cerrar menú al hacer clic en un enlace
        const menuLinks = mobileMenu.querySelectorAll('a');
        menuLinks.forEach(function(link) {
            link.addEventListener('click', function() {
                mobileMenu.classList.remove('active');
                menuToggle.classList.remove('active');
            });
        });

        // Cerrar menú al hacer clic fuera
        document.addEventListener('click', function(event) {
            const isClickInsideMenu = mobileMenu.contains(event.target);
            const isClickOnToggle = menuToggle.contains(event.target);
            
            if (!isClickInsideMenu && !isClickOnToggle && mobileMenu.classList.contains('active')) {
                mobileMenu.classList.remove('active');
                menuToggle.classList.remove('active');
            }
        });
    }

    /* ==========================================
       COUNTDOWN TIMER
       ========================================== */
    function initCountdown() {
        const daysEl = document.getElementById('days');
        const hoursEl = document.getElementById('hours');
        const minutesEl = document.getElementById('minutes');
        const secondsEl = document.getElementById('seconds');

        if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

        // Fecha objetivo: 45 días desde hoy
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + 45);

        function updateCountdown() {
            const now = new Date().getTime();
            const distance = targetDate - now;

            // Calcular tiempo restante
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            // Actualizar DOM
            daysEl.textContent = days;
            hoursEl.textContent = hours;
            minutesEl.textContent = minutes;
            secondsEl.textContent = seconds;

            // Si el countdown termina
            if (distance < 0) {
                clearInterval(countdownInterval);
                daysEl.textContent = '0';
                hoursEl.textContent = '0';
                minutesEl.textContent = '0';
                secondsEl.textContent = '0';
            }
        }

        // Actualizar cada segundo
        updateCountdown();
        const countdownInterval = setInterval(updateCountdown, 1000);
    }

    /* ==========================================
       FAQ ACCORDION
       ========================================== */
    function initFAQ() {
        const faqQuestions = document.querySelectorAll('.faq-question');
        
        faqQuestions.forEach(function(question) {
            question.addEventListener('click', function() {
                const item = this.parentElement;
                const wasActive = item.classList.contains('active');

                // Cerrar todos los items
                document.querySelectorAll('.faq-item').forEach(function(faqItem) {
                    faqItem.classList.remove('active');
                });

                // Abrir el item clickeado si no estaba activo
                if (!wasActive) {
                    item.classList.add('active');
                }
            });
        });
    }

    /* ==========================================
       FORM SUBMISSION
       ========================================== */
    function initForm() {
        const form = document.getElementById('waitlistForm');
        if (!form) return;

        form.addEventListener('submit', function(e) {
            e.preventDefault();

            // Obtener datos del formulario
            const formData = new FormData(form);
            const data = {};
            formData.forEach(function(value, key) {
                data[key] = value;
            });

            // Aquí puedes agregar lógica para enviar a tu backend
            console.log('Form data:', data);

            // Mensaje de confirmación
            const lang = document.documentElement.lang || 'es';
            const message = lang === 'es' 
                ? '¡Gracias por tu interés! Te contactaremos pronto con información detallada sobre los lotes disponibles.'
                : 'Thank you for your interest! We will contact you soon with detailed information about available lots.';
            
            alert(message);

            // Reset form
            form.reset();

            // Opcional: Redirigir a WhatsApp
            // const whatsappNumber = '573001234567';
            // const whatsappMessage = encodeURIComponent('Hola! Me gustaría recibir más información sobre los lotes en Punta Dorada.');
            // window.open('https://wa.me/' + whatsappNumber + '?text=' + whatsappMessage, '_blank');
        });
    }

    /* ==========================================
       SMOOTH SCROLL
       ========================================== */
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                
                // Ignorar si es solo "#"
                if (href === '#') {
                    e.preventDefault();
                    return;
                }

                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });

                    // Cerrar mobile menu si está abierto
                    const mobileMenu = document.getElementById('mobileMenu');
                    const menuToggle = document.getElementById('menuToggle');
                    if (mobileMenu && mobileMenu.classList.contains('active')) {
                        mobileMenu.classList.remove('active');
                        if (menuToggle) menuToggle.classList.remove('active');
                    }
                }
            });
        });
    }

    /* ==========================================
       FADE IN ANIMATION (Intersection Observer)
       ========================================== */
    function initFadeInAnimation() {
        // Verificar si el navegador soporta Intersection Observer
        if (!('IntersectionObserver' in window)) {
            // Fallback: mostrar todos los elementos inmediatamente
            document.querySelectorAll('.fade-in').forEach(function(element) {
                element.classList.add('visible');
            });
            return;
        }

        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    // Opcional: dejar de observar después de animar
                    // observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        document.querySelectorAll('.fade-in').forEach(function(element) {
            observer.observe(element);
        });
    }

    /* ==========================================
       LAZY LOAD IMAGES
       ========================================== */
    function initLazyLoad() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver(function(entries) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                            img.classList.add('loaded');
                        }
                        imageObserver.unobserve(img);
                    }
                });
            });

            document.querySelectorAll('img[data-src]').forEach(function(img) {
                imageObserver.observe(img);
            });
        } else {
            // Fallback para navegadores sin IntersectionObserver
            document.querySelectorAll('img[data-src]').forEach(function(img) {
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
            });
        }
    }

    /* ==========================================
       SCROLL TO TOP BUTTON
       ========================================== */
    function initScrollToTop() {
        const scrollBtn = document.getElementById('scrollToTop');
        if (!scrollBtn) return;

        // Mostrar/ocultar botón según scroll
        window.addEventListener('scroll', function() {
            if (window.scrollY > 300) {
                scrollBtn.classList.add('visible');
            } else {
                scrollBtn.classList.remove('visible');
            }
        });

        // Scroll suave al hacer clic
        scrollBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    /* ==========================================
       WHATSAPP BUTTON
       ========================================== */
    function initWhatsApp() {
        const whatsappBtn = document.querySelector('.whatsapp-float');
        if (!whatsappBtn) return;

        // Mostrar después de scroll
        window.addEventListener('scroll', function() {
            if (window.scrollY > 200) {
                whatsappBtn.classList.add('visible');
            }
        });
    }

    /* ==========================================
       INICIALIZACIÓN
       ========================================== */
    function init() {
        // Esperar a que el DOM esté listo
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                initNavbar();
                initMobileMenu();
                initCountdown();
                initFAQ();
                initForm();
                initSmoothScroll();
                initFadeInAnimation();
                initLazyLoad();
                initScrollToTop();
                initWhatsApp();
            });
        } else {
            // DOM ya está listo
            initNavbar();
            initMobileMenu();
            initCountdown();
            initFAQ();
            initForm();
            initSmoothScroll();
            initFadeInAnimation();
            initLazyLoad();
            initScrollToTop();
            initWhatsApp();
        }
    }

    // Iniciar aplicación
    init();

})();