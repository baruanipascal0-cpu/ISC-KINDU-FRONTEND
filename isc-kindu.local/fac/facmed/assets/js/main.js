/**
 * JavaScript principal - Faculté de Médecine UNIKIN
 */

document.addEventListener('DOMContentLoaded', function() {
    // Menu mobile (si nécessaire)
    initMobileMenu();
    
    // Smooth scroll
    initSmoothScroll();
    
    // Gestion des formulaires
    initForms();
});

/**
 * Initialise le menu mobile
 */
function initMobileMenu() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const menuList = document.querySelector('.main-nav-list');
    const mainNav = document.querySelector('.main-nav');
    
    if (!menuToggle || !menuList || !mainNav) {
        return;
    }
    
    // Fonction pour vérifier si on est sur mobile
    function isMobile() {
        return window.innerWidth <= 768;
    }
    
    // Fonction pour fermer le menu
    function closeMenu() {
        menuList.classList.remove('mobile-open');
        menuToggle.setAttribute('aria-expanded', 'false');
        const menuIcon = menuToggle.querySelector('.menu-icon');
        if (menuIcon) {
            menuIcon.textContent = '☰';
        }
        // Fermer tous les dropdowns
        document.querySelectorAll('.main-nav .dropdown.mobile-open').forEach(dropdown => {
            dropdown.classList.remove('mobile-open');
        });
    }
    
    // Fonction pour ouvrir/fermer le menu
    function toggleMenu() {
        if (!isMobile()) {
            return;
        }
        
        const isOpen = menuList.classList.contains('mobile-open');
        if (isOpen) {
            closeMenu();
        } else {
            menuList.classList.add('mobile-open');
            menuToggle.setAttribute('aria-expanded', 'true');
            const menuIcon = menuToggle.querySelector('.menu-icon');
            if (menuIcon) {
                menuIcon.textContent = '✕';
            }
        }
    }
    
    // Toggle menu principal
    menuToggle.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        toggleMenu();
    });
    
    // Gestion des dropdowns sur mobile
    function initDropdowns() {
        const dropdowns = document.querySelectorAll('.main-nav .dropdown');
        dropdowns.forEach(dropdown => {
            const dropdownLink = dropdown.querySelector('> a');
            if (!dropdownLink) return;
            
            // Supprimer l'ancien listener s'il existe
            const newLink = dropdownLink.cloneNode(true);
            dropdownLink.parentNode.replaceChild(newLink, dropdownLink);
            
            newLink.addEventListener('click', function(e) {
                // Sur mobile uniquement
                if (isMobile() && menuList.classList.contains('mobile-open')) {
                    const hasChildren = dropdown.querySelector('.dropdown-menu');
                    if (hasChildren) {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        const isDropdownOpen = dropdown.classList.contains('mobile-open');
                        
                        // Fermer tous les autres dropdowns
                        dropdowns.forEach(otherDropdown => {
                            if (otherDropdown !== dropdown) {
                                otherDropdown.classList.remove('mobile-open');
                            }
                        });
                        
                        // Toggle le dropdown actuel
                        if (isDropdownOpen) {
                            dropdown.classList.remove('mobile-open');
                        } else {
                            dropdown.classList.add('mobile-open');
                        }
                    }
                }
            });
        });
    }
    
    // Initialiser les dropdowns au chargement
    initDropdowns();
    
    // Réinitialiser les dropdowns si le menu change dynamiquement
    const observer = new MutationObserver(function(mutations) {
        let shouldReinit = false;
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0) {
                shouldReinit = true;
            }
        });
        if (shouldReinit) {
            setTimeout(initDropdowns, 100);
        }
    });
    
    if (menuList) {
        observer.observe(menuList, { childList: true, subtree: true });
    }
    
    // Fermer le menu en cliquant sur un lien (sauf dropdown)
    menuList.addEventListener('click', function(e) {
        if (!isMobile()) return;
        
        const link = e.target.closest('a');
        if (link && !link.closest('.dropdown-menu')) {
            const parentDropdown = link.closest('.dropdown');
            // Si c'est un lien de dropdown parent, ne pas fermer
            if (!parentDropdown || !parentDropdown.querySelector('.dropdown-menu')) {
                // Attendre un peu pour permettre la navigation
                setTimeout(closeMenu, 100);
            }
        }
    });
    
    // Fermer le menu en cliquant en dehors
    document.addEventListener('click', function(e) {
        if (!isMobile()) return;
        
        if (!mainNav.contains(e.target) && menuList.classList.contains('mobile-open')) {
            closeMenu();
        }
    });
    
    // Empêcher la propagation des clics dans le menu
    mainNav.addEventListener('click', function(e) {
        if (isMobile()) {
            e.stopPropagation();
        }
    });
    
    // Fermer le menu lors du redimensionnement vers desktop
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            if (!isMobile() && menuList.classList.contains('mobile-open')) {
                closeMenu();
            }
        }, 150);
    });
    
    // Fermer le menu au scroll sur mobile (optionnel)
    let scrollTimer;
    window.addEventListener('scroll', function() {
        if (!isMobile()) return;
        
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(function() {
            if (menuList.classList.contains('mobile-open')) {
                closeMenu();
            }
        }, 100);
    }, { passive: true });
}

/**
 * Initialise le smooth scroll
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Initialise la gestion des formulaires
 */
function initForms() {
    const forms = document.querySelectorAll('form[data-ajax]');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            // Gestion AJAX des formulaires
        });
    });
}

/**
 * Fonction utilitaire pour les requêtes AJAX
 */
function ajaxRequest(url, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open(method, url, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        
        xhr.onload = function() {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    const response = JSON.parse(xhr.responseText);
                    resolve(response);
                } catch (e) {
                    resolve(xhr.responseText);
                }
            } else {
                reject(new Error('Request failed'));
            }
        };
        
        xhr.onerror = function() {
            reject(new Error('Network error'));
        };
        
        if (data) {
            xhr.send(JSON.stringify(data));
        } else {
            xhr.send();
        }
    });
}

