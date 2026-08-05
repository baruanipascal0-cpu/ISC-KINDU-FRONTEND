(function () {
    // If the Blade template already defined the init function, just run it.
    if (typeof window.__bertaLandingInit === 'function') {
        window.__bertaLandingInit();
        return;
    }

    window.__bertaLandingInit = function () {
        if (window.__bertaLandingStarted) return;
        window.__bertaLandingStarted = true;

        var navToggle = document.getElementById('nav-toggle');
        var navMobile = document.getElementById('nav-mobile');
        if (navToggle && navMobile) {
            navToggle.addEventListener('click', function () {
                var isHidden = navMobile.classList.contains('hidden');
                navMobile.classList.toggle('hidden');
                navToggle.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
            });
        }

        function initTabs() {
            var tabsRoots = Array.prototype.slice.call(document.querySelectorAll('[data-berta-tabs]'));
            if (!tabsRoots.length) return;

            var tabApis = [];

            tabsRoots.forEach(function (tabsRoot) {
                var defaultTab = tabsRoot.getAttribute('data-default-tab') || 'stats';
                var tabButtons = Array.prototype.slice.call(tabsRoot.querySelectorAll('[data-tab]'));
                var panels = Array.prototype.slice.call(tabsRoot.querySelectorAll('[data-tab-panel]'));
                if (!tabButtons.length || !panels.length) return;

                function setActive(tabName) {
                    tabButtons.forEach(function (btn) {
                        var active = btn.getAttribute('data-tab') === tabName;
                        btn.setAttribute('aria-selected', active ? 'true' : 'false');
                        btn.classList.toggle('bg-[#F53003]', active);
                        btn.classList.toggle('text-white', active);
                        btn.classList.toggle('shadow-sm', active);
                        btn.classList.toggle('hover:bg-black/5', !active);
                        btn.classList.toggle('dark:hover:bg-white/10', !active);
                    });

                    panels.forEach(function (panel) {
                        var active = panel.getAttribute('data-tab-panel') === tabName;
                        panel.classList.toggle('hidden', !active);
                    });
                }

                tabButtons.forEach(function (btn) {
                    btn.classList.add('hover:bg-black/5');
                    btn.classList.add('dark:hover:bg-white/10');
                    btn.addEventListener('click', function () {
                        setActive(btn.getAttribute('data-tab'));
                    });
                });

                tabApis.push({ root: tabsRoot, setActive: setActive, defaultTab: defaultTab });
            });

            if (!tabApis.length) return;

            var deepLink = (window.location.hash || '').replace('#', '');
            tabApis.forEach(function (api) {
                if (deepLink === 'contacts' || deepLink === 'stats') {
                    api.setActive(deepLink);
                } else {
                    api.setActive(api.defaultTab);
                }
            });

            Array.prototype.slice.call(document.querySelectorAll('[data-tab-target]')).forEach(function (link) {
                link.addEventListener('click', function (e) {
                    var targetTab = link.getAttribute('data-tab-target');
                    if (!targetTab) return;
                    tabApis.forEach(function (api) {
                        api.setActive(targetTab);
                    });

                    var href = link.getAttribute('href') || '';
                    if (href.indexOf('#') === 0) {
                        var target = document.getElementById(href.slice(1));
                        if (target) {
                            e.preventDefault();
                            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                    }
                });
            });
        }

        initTabs();

        function initModal() {
            var modal = document.getElementById('login-modal');
            if (!modal) return;

            var accessSelect = document.getElementById('login-access');
            var emailInput = document.getElementById('login-email');
            var captchaQuestion = document.getElementById('login-captcha-question');
            var captchaInput = document.getElementById('login-captcha');

            function openModal(access) {
                modal.classList.remove('hidden');
                modal.setAttribute('aria-hidden', 'false');
                document.body.classList.add('overflow-hidden');
                if (accessSelect && access) {
                    accessSelect.value = access;
                }
                if (emailInput) {
                    window.setTimeout(function () {
                        emailInput.focus();
                    }, 0);
                }
            }

            function closeModal() {
                modal.classList.add('hidden');
                modal.setAttribute('aria-hidden', 'true');
                document.body.classList.remove('overflow-hidden');
            }

            function initCaptchaRefresh() {
                var refreshBtn = modal.querySelector('[data-captcha-refresh]');
                if (!refreshBtn) return;

                refreshBtn.addEventListener('click', function () {
                    if (!window.fetch) return;

                    refreshBtn.disabled = true;
                    fetch('/captcha/refresh', {
                        method: 'GET',
                        headers: {
                            'Accept': 'application/json',
                            'X-Requested-With': 'XMLHttpRequest'
                        }
                    })
                        .then(function (r) {
                            return r.json();
                        })
                        .then(function (data) {
                            if (captchaQuestion && data && typeof data.a !== 'undefined' && typeof data.b !== 'undefined') {
                                captchaQuestion.textContent = 'Combien font : ' + data.a + ' + ' + data.b + ' ?';
                            }
                            if (captchaInput) {
                                captchaInput.value = '';
                                captchaInput.focus();
                            }
                        })
                        .catch(function () {
                            // ignore
                        })
                        .finally(function () {
                            refreshBtn.disabled = false;
                        });
                });
            }

            Array.prototype.slice.call(document.querySelectorAll('[data-modal-open="login"]')).forEach(function (btn) {
                btn.addEventListener('click', function (e) {
                    e.preventDefault();
                    openModal(btn.getAttribute('data-access') || 'client');
                });
            });

            Array.prototype.slice.call(modal.querySelectorAll('[data-modal-close]')).forEach(function (btn) {
                btn.addEventListener('click', function () {
                    closeModal();
                });
            });

            document.addEventListener('keydown', function (e) {
                if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
                    closeModal();
                }
            });

            initCaptchaRefresh();

            var openOnLoad = modal.getAttribute('data-modal-open-on-load');
            if (openOnLoad === '1') {
                openModal('client');
            }
        }

        initModal();

        var slides = Array.prototype.slice.call(document.querySelectorAll('[data-slide]'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('[data-slide-dot]'));
        if (!slides.length) return;

        var index = 0;
        var timer;

        function render(next) {
            slides.forEach(function (el, i) {
                var active = i === next;
                el.classList.toggle('opacity-0', !active);
                el.classList.toggle('pointer-events-none', !active);
            });

            dots.forEach(function (el, i) {
                el.classList.toggle('bg-[#F53003]', i === next);
                el.classList.toggle('bg-black/20', i !== next);
                el.classList.toggle('dark:bg-white/20', i !== next);
            });
        }

        function go(next) {
            index = (next + slides.length) % slides.length;
            render(index);
            if (timer) window.clearInterval(timer);
            timer = window.setInterval(function () {
                go(index + 1);
            }, 6000);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                var next = Number(dot.getAttribute('data-slide-dot'));
                if (!Number.isNaN(next)) go(next);
            });
        });

        render(0);
        timer = window.setInterval(function () {
            go(index + 1);
        }, 6000);
    };

    window.__bertaLandingInit();
})();
