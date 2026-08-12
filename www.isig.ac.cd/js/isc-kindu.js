(function () {
    'use strict';

    var brand = 'ISC Kindu';
    var brandShort = 'ISC-KINDU';
    var assetBase = 'storage/isc-kindu/';
    var apiBase = (window.ISC_API_BASE || 'https://isc-kindu-backend.onrender.com/api').replace(/\/+$/, '');
    var photos = [
        '1785445859858.jpg',
        '1785445878531.jpg',
        '1785445917267.jpg',
        '1785446142626.jpg',
        '1785446161771.jpg',
        '1785446170226.jpg',
        '1785446182446.jpg',
        '1785446192341.jpg'
    ];
    var filieres = [
        'Informatique de gestion',
        'Comptabilit\u00e9',
        'Douane et Accises',
        'Administration r\u00e9seau',
        'Marketing',
        'G\u00e9nie Logiciel',
        'Syst\u00e8me informatique'
    ];
    var legacySlug = '\x69sig';
    var legacyHost = ['www', legacySlug, 'ac', 'cd'].join('.');

    function localPath() {
        var path = window.location.pathname.replace(/\\/g, '/');
        var markers = ['/' + legacyHost + '/', '/www.isc-kindu.ac.cd/'];
        for (var i = 0; i < markers.length; i += 1) {
            if (path.indexOf(markers[i]) !== -1) {
                path = path.split(markers[i]).pop();
                break;
            }
        }
        path = path.replace(/^\/+/, '');
        return path || 'index.html';
    }

    function isHomePage() {
        var path = localPath();
        return path === 'index.html' || path === '';
    }

    function isLocalPage(name) {
        var path = localPath().replace(/\/+$/, '');
        var cleanName = String(name || '').replace(/\.html$/i, '');
        return path === name || path === cleanName || path === cleanName + '/index.html';
    }

    function prefix() {
        var parts = localPath().split('/').filter(Boolean);
        var depth = Math.max(0, parts.length - 1);
        return new Array(depth + 1).join('../');
    }

    function rel(path) {
        return prefix() + path;
    }

    function normalizeRoutePath(path) {
        var next = (path || '').replace(/\\/g, '/').replace(/^\/+/, '');
        next = next.replace(/^(?:\.\.\/)+/, '').replace(/^\.\//, '');
        next = next.replace(/(^|\/)travailler-a-isig(\/|$)/g, '$1travailler-a-isc$2');
        next = next.replace(/(^|\/)bourse-katulanya(\.html)?$/i, '$1bourse-isc-kindu.html');

        if (!next || next === '/') return 'index.html';
        if (!/\.[a-z0-9]{2,5}$/i.test(next)) next += '.html';
        if (/^blog\//i.test(next)) return 'blog.html';
        if (/^(galerie|gallery)\//i.test(next)) return 'media-center.html';

        var aliases = {
            'qui-sommes-nous.html': 'aboutus.html',
            'projects.html': 'recherche-societe/nos-projets.html',
            'webmail/index.html': 'login.html',
            'ckfinder/userfiles/images/isig-organigramme.html': 'aboutus.html',
            'filiere/las-as-assistance-sociale-animation-sociale.html': 'formation/licence.html',
            'filiere/las-ss-assistance-sociale-service-social.html': 'formation/licence.html',
            'filiere/ldah-developpement-et-actions-humanitaires.html': 'formation/licence.html',
            'filiere/lgdd-genre-et-developpement-durable.html': 'formation/licence.html',
            'filiere/lmg-management-general.html': 'formation/licence.html',
            'filiere/lmss-management-des-services-de-sante.html': 'formation/licence.html',
            'filiere/mdaci-douanes-accises-et-commerce-international.html': 'formation/master.html',
            'filiere/mdah-developpement-et-actions-humanitaires.html': 'formation/master.html',
            'filiere/megep-entrepreneuriat-gestion-et-evaluation-des-projets.html': 'formation/master.html',
            'filiere/mf-fiscalite.html': 'formation/master.html',
            'filiere/mgdd-genre-et-developpement-durable.html': 'formation/master.html',
            'filiere/mia-intelligence-artificielle.html': 'formation/master.html',
            'filiere/mlt-logistique-et-transport.html': 'formation/master.html',
            'filiere/mm-marketing.html': 'formation/master.html',
            'filiere/mmd-management-du-developpement.html': 'formation/master.html',
            'filiere/mmss-management-des-services-de-sante.html': 'formation/master.html',
            'filiere/mpas-maitrise-professionnel-en-assistance-sociale.html': 'formation/master.html',
            'filiere/mr-ass-maitrise-recherche-action-sociale-et-societe.html': 'formation/master.html'
        };

        return aliases[next.toLowerCase()] || next;
    }

    function localUrlForSite(raw) {
        if (!raw || /^(mailto|tel|javascript|data):/i.test(raw) || raw.charAt(0) === '#') return null;

        if (!/^[a-z][a-z0-9+.-]*:/i.test(raw) && raw.indexOf('//') !== 0) {
            var parts = String(raw).match(/^([^?#]*)([?#].*)?$/);
            var path = normalizeRoutePath(parts ? parts[1] : raw);
            return rel(path) + (parts && parts[2] ? parts[2] : '');
        }

        try {
            var url = new URL(raw, window.location.href);
            if (!/^(www\.)?(\x69sig|isc-kindu)\.ac\.cd$/i.test(url.hostname)) return null;
            var normalized = normalizeRoutePath(url.pathname);
            return rel(normalized) + (url.search || '') + (url.hash || '');
        } catch (e) {
            return null;
        }
    }

    function relImage(name) {
        return rel(assetBase + name);
    }

    function slug(text) {
        var value = (text || '').toLowerCase();
        if (value.normalize) {
            value = value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        }
        return value.replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }

    function setText(el, text) {
        if (el) el.textContent = text;
    }

    function setHtml(el, html) {
        if (el) el.innerHTML = html;
    }

    function setImage(img, name, alt) {
        if (!img) return;
        img.setAttribute('src', relImage(name));
        img.removeAttribute('srcset');
        img.removeAttribute('sizes');
        img.setAttribute('alt', alt || brand);
        img.setAttribute('loading', 'lazy');
    }

    function setBackground(el, name) {
        if (!el) return;
        el.style.backgroundImage = 'url("' + relImage(name) + '")';
        el.setAttribute('role', el.getAttribute('role') || 'img');
        el.setAttribute('aria-label', brand);
    }

    function replaceBrandText(value) {
        if (!value) return value;
        return value
            .replace(/Institut Sup\u00e9rieur d(?:'|\u2019|&#039;)Informatique et de \x47estion de \x47oma/g, 'Institut Sup\u00e9rieur de Commerce de Kindu')
            .replace(/Institut Sup\u00e9rieur d(?:'|\u2019|&#039;)Informatique et de \x47estion/g, 'Institut Sup\u00e9rieur de Commerce de Kindu')
            .replace(/\x49SIG-\x47OMA/g, brandShort)
            .replace(/\x49SIG-\x47oma/g, 'ISC-Kindu')
            .replace(/\x49SIG \x47oma/g, brand)
            .replace(/\x49sigienne/g, 'Etudiante de l\'ISC Kindu')
            .replace(/\x49sigien(?:ne)?s/g, 'Etudiants de l\'ISC Kindu')
            .replace(/\bl\x69sig-\x47oma\b/gi, 'isc-kindu')
            .replace(/\b\x49SIG\b/g, brand)
            .replace(/\b\x47oma\b/g, 'Kindu')
            .replace(/\b\x4eord-\x4bivu\b/g, 'Maniema')
            .replace(/\b\x4barisimbi\b/g, 'Kasuku')
            .replace(/\bMurara\b/g, 'Kindu')
            .replace(/Prof(?:esseur|\.\s*Dr\.?)?\s*Marie[- ]Rose\s+\x42ashwira\s+Nyenyezi/gi, 'MUTUZA ZASSE')
            .replace(/Prof\.?\s*Dr\.?\s*Marie-?rose\s+\x42ASHWIRA\s+NYENYEZI/gi, 'MUTUZA ZASSE')
            .replace(/Doctorant\s+AMANI\s+HAGUMA\s+Joseph/gi, 'ISIAKA IDI Manadja')
            .replace(/AMANI\s+HAGUMA\s+Joseph/gi, 'ISIAKA IDI Manadja')
            .replace(/Doctorant\s+Didier\s+FATAKI\s+SIMBA/gi, '')
            .replace(/Prof\.?\s*Dr\.?\s*\x4bATANGA\s+\x4bABALEVI\s+Joseph/gi, '')
            .replace(/CT\s+\x42UHENDWA\s+WENDO\s+Victor/gi, '')
            .replace(/Portrait\s+Prof\s+Dr\s+D\u00e9o\s+\x42UGANDWA/gi, '')
            .replace(/Prof\s+Dr\s+Lucien\s+\x5aIHINDULA/gi, '')
            .replace(/Docteur\s+HC\s+\x4bATULANYA\s+ISU\s+Deogratias/gi, 'MUTUZA ZASSE')
            .replace(/D\u00e9o\s+\x4batulanya\s+Isu/gi, 'MUTUZA ZASSE')
            .replace(/Alain\s+Wodon/gi, 'MUTUZA ZASSE')
            .replace(/Bourse\s+\x4bATULANYA/g, 'Bourse ISC Kindu')
            .replace(/Bourse\s+\x4batulanya/g, 'Bourse ISC Kindu')
            .replace(/\x4bATULAYA/g, 'ISC Kindu')
            .replace(/\x4bATULANYA/g, 'ISC Kindu')
            .replace(/\x4batulanya/g, 'ISC Kindu')
            .replace(/info@\x69sig\.ac\.cd/g, 'info@isc-kindu.ac.cd')
            .replace(/\x69sig\x67oma@\x69sig\.ac\.cd/g, 'info@isc-kindu.ac.cd')
            .replace(/www\.\x69sig\.ac\.cd/g, 'www.isc-kindu.ac.cd')
            .replace(/\x69sig\.ac\.cd/g, 'isc-kindu.ac.cd');
    }

    function updateTextNodes(root) {
        if (!root || !document.createTreeWalker) return;
        var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
            acceptNode: function (node) {
                if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
                var parent = node.parentNode && node.parentNode.nodeName;
                if (parent === 'SCRIPT' || parent === 'STYLE') return NodeFilter.FILTER_REJECT;
                return NodeFilter.FILTER_ACCEPT;
            }
        });
        var nodes = [];
        while (walker.nextNode()) nodes.push(walker.currentNode);
        nodes.forEach(function (node) {
            var next = replaceBrandText(node.nodeValue);
            if (next !== node.nodeValue) node.nodeValue = next;
        });
    }

    function updateAttributes() {
        var attrs = ['alt', 'title', 'placeholder', 'aria-label', 'content'];
        attrs.forEach(function (attr) {
            document.querySelectorAll('[' + attr + ']').forEach(function (el) {
                var current = el.getAttribute(attr);
                var next = replaceBrandText(current);
                if (next !== current) el.setAttribute(attr, next);
            });
        });
    }

    function updateMetadata() {
        document.title = replaceBrandText(document.title || '').replace(/ISC-KINDU/g, brandShort);
        var description = document.querySelector('meta[name="description"]');
        if (description) {
            description.setAttribute(
                'content',
                'Rejoignez l\'ISC Kindu pour une formation universitaire orientee pratique en informatique, gestion, comptabilite, marketing, douane et reseaux.'
            );
        }
        var keywords = document.querySelector('meta[name="keywords"]');
        if (keywords) {
            keywords.setAttribute('content', 'ISC Kindu, Institut Superieur de Commerce de Kindu, informatique de gestion, comptabilite, douane et accises, administration reseau, marketing, genie logiciel, systeme informatique, Maniema');
        }
        var ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) ogTitle.setAttribute('content', replaceBrandText(ogTitle.getAttribute('content') || document.title));
        var ogDescription = document.querySelector('meta[property="og:description"]');
        if (ogDescription) ogDescription.setAttribute('content', description ? description.getAttribute('content') : '');
        var icon = document.querySelector('link[rel~="icon"]');
        if (icon) icon.setAttribute('href', relImage('logo.jpg'));
        var ogImage = document.querySelector('meta[property="og:image"]');
        if (ogImage) ogImage.setAttribute('content', relImage('1785445878531.jpg'));
    }

    function updateLogo() {
        var logo = relImage('logo.jpg');
        document.querySelectorAll('img[src*="site-settings/lNBx"], img[alt*="' + legacySlug.toUpperCase() + '"], img[alt*="ISC"]').forEach(function (img) {
            var src = img.getAttribute('src') || '';
            if (src.indexOf('site-settings') === -1 && src.indexOf('lNBx') === -1 && src.toLowerCase().indexOf(legacySlug) === -1) return;
            img.setAttribute('src', logo);
            img.setAttribute('alt', brand);
            img.style.height = img.closest('.site-header__brand') ? '52px' : (img.style.height || '52px');
            img.style.width = 'auto';
            img.style.objectFit = 'contain';
        });
    }

    function localizeExternalLinks() {
        document.querySelectorAll('a[href]').forEach(function (a) {
            if (a.getAttribute('data-amg-link') === '1') return;
            var next = localUrlForSite(a.getAttribute('href'));
            if (next) a.setAttribute('href', next);
        });

        if (Array.isArray(window.pages)) {
            window.pages = window.pages.map(function (page) {
                var next = localUrlForSite(page.url);
                return {
                    label: replaceBrandText(page.label || ''),
                    url: next || page.url
                };
            });
        }
    }

    function bindSearchResultLinks() {
        var results = document.getElementById('siteSearchResults');
        if (!results || results.getAttribute('data-isc-search-ready') === '1') return;
        results.setAttribute('data-isc-search-ready', '1');

        function rewrite() {
            results.querySelectorAll('a[href]').forEach(function (a) {
                var next = localUrlForSite(a.getAttribute('href'));
                if (next) a.setAttribute('href', next);
            });
        }

        rewrite();
        if (window.MutationObserver) {
            new MutationObserver(rewrite).observe(results, { childList: true, subtree: true });
        }
    }

    function protectForms() {
        document.querySelectorAll('form[action]').forEach(function (form) {
            var action = form.getAttribute('action') || '';
            var next = replaceBrandText(action);
            if (next !== action) form.setAttribute('action', next);
        });
    }

    function updateInstitutionNav() {
        document.querySelectorAll('a[href*="bourse-isc-kindu"]').forEach(function (a) {
            if ((a.textContent || '').trim()) a.textContent = 'Bourse ISC Kindu';
        });
        document.querySelectorAll('a[href*="travailler-a-' + legacySlug + '"]').forEach(function (a) {
            if ((a.textContent || '').trim()) a.textContent = 'Opportunit\u00e9s';
        });
        document.querySelectorAll('a[href*="aboutus"]').forEach(function (a) {
            a.textContent = replaceBrandText(a.textContent || '');
        });
    }

    function updateHero() {
        var slides = document.querySelectorAll('[data-hero-slides] .hero__slide');
        if (!slides.length) return;
        var captions = [
            {
                title: 'Bienvenue \u00e0 l\'ISC Kindu',
                lede: 'Une institution sup\u00e9rieure au service de la formation, de la gestion et du num\u00e9rique au Maniema.',
                subtitle: 'Institut Sup\u00e9rieur de Commerce de Kindu',
                href: rel('aboutus.html')
            },
            {
                title: 'Former des cadres utiles \u00e0 leur milieu',
                lede: 'Des enseignements orient\u00e9s vers la pratique professionnelle, l\'entrepreneuriat et la rigueur acad\u00e9mique.',
                subtitle: 'Vie acad\u00e9mique',
                href: rel('inscription.html')
            },
            {
                title: 'Des fili\u00e8res adapt\u00e9es aux besoins du march\u00e9',
                lede: filieres.join(', ') + '.',
                subtitle: 'Formations',
                href: rel('formation/licence.html')
            },
            {
                title: 'Une communaut\u00e9 scientifique vivante',
                lede: 'Etudiants, enseignants et partenaires avancent ensemble autour de la comp\u00e9tence et de la r\u00e9ussite.',
                subtitle: 'Campus',
                href: rel('media-center.html')
            },
            {
                title: 'Votre avenir commence \u00e0 l\'ISC Kindu',
                lede: 'Inscrivez-vous et pr\u00e9parez un parcours solide dans les m\u00e9tiers de la gestion et de l\'informatique.',
                subtitle: 'Inscriptions',
                href: rel('inscription.html')
            }
        ];
        window.captions = captions;
        slides.forEach(function (slide, index) {
            setBackground(slide, photos[index % photos.length]);
        });
        setText(document.querySelector('[data-hero-title]'), captions[0].title);
        setText(document.querySelector('[data-hero-lede]'), captions[0].lede);
        setText(document.querySelector('[data-hero-subtitle]'), captions[0].subtitle);
        var cta = document.querySelector('[data-hero-cta]');
        if (cta) {
            cta.textContent = 'D\u00e9couvrir l\'ISC Kindu';
            cta.setAttribute('href', captions[0].href);
        }
    }

    function updateHomeImagesAndCourses() {
        document.querySelectorAll('.hero-thumb').forEach(function (thumb, index) {
            setBackground(thumb, photos[(index + 1) % photos.length]);
            var label = thumb.querySelector('.hero-thumb__label');
            if (label && filieres[index]) label.textContent = filieres[index];
        });

        document.querySelectorAll('.about-slide__media').forEach(function (media, index) {
            setBackground(media, photos[(index + 2) % photos.length]);
        });

        var cards = document.querySelectorAll('[data-world-carousel] .world-card');
        cards.forEach(function (card, index) {
            var name = filieres[index % filieres.length];
            setBackground(card, photos[(index + 3) % photos.length]);
            card.setAttribute('href', rel('formation/licence.html#' + slug(name)));
            setText(card.querySelector('small'), 'Fili\u00e8re organis\u00e9e \u00e0 l\'ISC Kindu');
            setText(card.querySelector('h3'), name);
        });
    }

    function updateAboutSlides() {
        if (!isHomePage()) return;
        var slides = document.querySelectorAll('.about-slide');
        var copy = [
            {
                title: 'Institut Sup\u00e9rieur de Commerce de Kindu',
                text: 'L\'ISC Kindu forme des cadres comp\u00e9tents dans les domaines de la gestion, de la comptabilit\u00e9, du marketing, de la douane, des r\u00e9seaux et de l\'informatique.'
            },
            {
                title: 'Une formation pratique au Maniema',
                text: 'Les enseignements mettent l\'accent sur les comp\u00e9tences professionnelles, l\'esprit d\'initiative et l\'usage responsable des outils num\u00e9riques.'
            },
            {
                title: 'Des fili\u00e8res proches des besoins du terrain',
                text: filieres.join(', ') + '.'
            }
        ];
        slides.forEach(function (slide, index) {
            var item = copy[index % copy.length];
            setText(slide.querySelector('.about-slide__title, h3'), item.title);
            setText(slide.querySelector('.about-slide__text, p'), item.text);
            setBackground(slide.querySelector('.about-slide__media'), photos[(index + 2) % photos.length]);
        });
    }

    function updateHighlightList(section, items) {
        if (!section) return;
        var list = section.querySelector('.about-highlights');
        if (!list) return;
        var template = list.querySelector('li');
        if (!template) return;
        list.innerHTML = '';
        items.forEach(function (item) {
            var li = template.cloneNode(true);
            setText(li.querySelector('b'), item.title);
            var spans = li.querySelectorAll('span span');
            setText(spans[spans.length - 1], item.text);
            list.appendChild(li);
        });
    }

    function updateLeaderCards() {
        var cards = document.querySelectorAll('.about-dg-card');
        if (!cards.length) return;
        var leaders = [
            { name: 'MUTUZA ZASSE', period: 'Directeur G\u00e9n\u00e9ral actuel', role: 'Directeur G\u00e9n\u00e9ral' },
            { name: 'ISIAKA IDI Manadja', period: 'Secr\u00e9taire G\u00e9n\u00e9ral Acad\u00e9mique actuel', role: 'Secr\u00e9taire G\u00e9n\u00e9ral Acad\u00e9mique' },
            { name: '', period: 'A compl\u00e9ter', role: 'Responsable' },
            { name: '', period: 'A compl\u00e9ter', role: 'Responsable' }
        ];
        cards.forEach(function (card, index) {
            var leader = leaders[index] || leaders[leaders.length - 1];
            var img = card.querySelector('img');
            if (img) setImage(img, 'logo.jpg', leader.name || brand);
            setText(card.querySelector('h3'), leader.name);
            setText(card.querySelector('.about-dg-card__period'), leader.period);
            setText(card.querySelector('p'), leader.role);
        });
    }

    function updateAboutPage() {
        var path = localPath();
        if (path !== 'aboutus.html' && !isHomePage()) return;

        if (path === 'aboutus.html') {
            setText(document.querySelector('#apropos h2'), 'Institut Sup\u00e9rieur de Commerce de Kindu');
            setHtml(
                document.querySelector('#apropos .about-rich'),
                '<div>L\'<strong>ISC Kindu</strong> est un etablissement d\'enseignement superieur oriente vers le commerce, la gestion et les technologies appliquees.</div>' +
                '<div>Sa mission est de former des cadres immediatement utiles a leur milieu, avec une attention particuliere aux besoins de la Province du Maniema.</div>'
            );
            var values = document.querySelectorAll('#apropos .about-keyfact__value');
            if (values[0]) values[0].textContent = 'Institut Sup\u00e9rieur de Commerce de Kindu - ISC Kindu';
            if (values[1]) values[1].textContent = 'Province du Maniema, Ville de Kindu, RD Congo';
            if (values[2]) values[2].textContent = 'A compl\u00e9ter';
            if (values[3]) values[3].textContent = 'A compl\u00e9ter selon les documents officiels';

            setText(document.querySelector('#historique h2'), 'Historique de l\'ISC Kindu');
            setHtml(
                document.querySelector('#historique .about-rich'),
                '<div>L\'ISC Kindu porte une vocation claire : former des cadres solides pour accompagner le developpement economique, administratif et numerique du Maniema.</div>' +
                '<div>Les dates officielles, references d\'agrement et jalons historiques propres a l\'institution seront completes apres validation par l\'administration.</div>'
            );
            updateHighlightList(document.querySelector('#historique'), [
                { title: 'Mission', text: 'Former des cadres competents pour la gestion et le commerce.' },
                { title: 'Ancrage', text: 'Servir les besoins de Kindu et de la Province du Maniema.' },
                { title: 'Pratique', text: 'Relier les cours aux realites professionnelles.' },
                { title: 'Qualite', text: 'Renforcer progressivement l\'encadrement academique.' }
            ]);

            setText(document.querySelector('#positionnement h2'), 'Une institution de commerce, de gestion et de technologies');
            setHtml(
                document.querySelector('#positionnement .about-rich'),
                '<p>L\'ISC Kindu organise des filieres qui preparent les etudiants aux metiers de la gestion, de la comptabilite, du marketing, des douanes, des reseaux et du developpement logiciel.</p>'
            );
            updateHighlightList(document.querySelector('#positionnement'), filieres.map(function (name) {
                return { title: name, text: 'Filiere organisee a l\'ISC Kindu' };
            }));

            setHtml(
                document.querySelector('#qualite .about-rich'),
                '<div>L\'ISC Kindu s\'inscrit dans une demarche d\'amelioration continue de ses enseignements, de son encadrement et de ses services aux etudiants.</div>' +
                '<div>Les informations administratives detaillees seront ajustees avec les donnees officielles de l\'institution.</div>'
            );

            var dgPhoto = document.querySelector('#mot-dg .about-dg__photo');
            setBackground(dgPhoto, '1785445878531.jpg');
            setHtml(
                document.querySelector('#mot-dg .about-rich'),
                '<div><em>Bienvenue a l\'Institut Superieur de Commerce de Kindu.</em></div>' +
                '<div><em>Notre priorite est de former des etudiants capables de comprendre leur environnement, de gerer avec rigueur et d\'utiliser le numerique comme levier de developpement.</em></div>' +
                '<div><em>L\'ISC Kindu veut rester proche des besoins de la societe, des entreprises et des administrations du Maniema.</em></div>' +
                '<div><strong>MUTUZA ZASSE</strong><br> Directeur General actuel de l\'ISC Kindu</div>'
            );
            setText(document.querySelector('#mot-dg .about-dg__sign'), 'Directeur G\u00e9n\u00e9ral de l\'ISC Kindu');
            setText(document.querySelector('#nos-dg h2'), 'Responsables de l\'ISC Kindu');
            setHtml(
                document.querySelector('#nos-dg .about-rich'),
                '<div>Les postes dont les titulaires ne sont pas encore confirmes restent volontairement vides pour completion par l\'institution.</div>'
            );

            var plan = document.querySelector('.about-plan img');
            if (plan) setImage(plan, '1785445917267.jpg', 'Vie academique a l\'ISC Kindu');
            setHtml(
                document.querySelector('.about-plan__legend'),
                '<div>Les details sur les infrastructures de l\'ISC Kindu seront completes avec les informations officielles du campus.</div>'
            );
        }

        document.querySelectorAll('.about-split__img').forEach(function (img, index) {
            setBackground(img, photos[(index + 1) % photos.length]);
        });
        updateLeaderCards();
        updateAboutSlides();
    }

    function serviceDataForPath(path) {
        var key = path.split('/').pop();
        var known = {
            'dg.html': {
                name: 'MUTUZA ZASSE',
                role: 'Directeur G\u00e9n\u00e9ral',
                title: 'Direction G\u00e9n\u00e9rale',
                banner: '1785445878531.jpg',
                body: '<p>La Direction Generale de l\'ISC Kindu est assuree par <strong>MUTUZA ZASSE</strong>, Directeur General actuel.</p>' +
                    '<p>Elle coordonne les orientations institutionnelles, le suivi academique, l\'administration generale et les partenariats de l\'etablissement.</p>'
            },
            'academique.html': {
                name: 'ISIAKA IDI Manadja',
                role: 'Secr\u00e9taire G\u00e9n\u00e9ral Acad\u00e9mique',
                title: 'Secr\u00e9tariat G\u00e9n\u00e9ral Acad\u00e9mique',
                banner: '1785446142626.jpg',
                body: '<p>Le Secretariat General Academique de l\'ISC Kindu est assure par <strong>ISIAKA IDI Manadja</strong>.</p>' +
                    '<p>Il accompagne l\'organisation des enseignements, le suivi des dossiers academiques et la qualite du parcours des etudiants.</p>'
            }
        };
        if (known[key]) return known[key];
        var title = document.querySelector('main h1, .page-header h1');
        return {
            name: '',
            role: title ? replaceBrandText(title.textContent.trim()) : 'Responsable',
            title: title ? replaceBrandText(title.textContent.trim()) : 'Service',
            banner: photos[Math.abs(key.length) % photos.length],
            body: '<p>Ce service de l\'ISC Kindu accompagne le fonctionnement administratif, academique et technique de l\'institution.</p>' +
                '<p>Le nom du responsable sera complete apres validation par l\'administration.</p>'
        };
    }

    function updateFeatureCard(data) {
        var card = document.querySelector('.svc-head-feature');
        if (!card) return;
        var photo = card.querySelector('.svc-head-feature__photo');
        if (photo && photo.tagName !== 'IMG') {
            var img = document.createElement('img');
            img.className = photo.className;
            photo.parentNode.replaceChild(img, photo);
            photo = img;
        }
        if (photo) setImage(photo, 'logo.jpg', data.name || brand);
        setText(card.querySelector('.svc-head-feature__name, h3'), data.name);
        setText(card.querySelector('.svc-head-feature__role, .svc-head-feature__title, p'), data.role);
    }

    function updateServiceContact() {
        document.querySelectorAll('main a[href^="mailto:"]').forEach(function (a) {
            a.setAttribute('href', 'mailto:info@isc-kindu.ac.cd');
            a.textContent = 'info@isc-kindu.ac.cd';
        });
        document.querySelectorAll('main a[href^="tel:"]').forEach(function (a) {
            a.setAttribute('href', '#');
            a.textContent = 'A compl\u00e9ter';
        });
        document.querySelectorAll('main address, main .svc-contact, main .service-contact').forEach(function (block) {
            updateTextNodes(block);
        });
    }

    function updateServicePage() {
        var path = localPath();
        if (path.indexOf('service/') === -1 || !/\.html$/i.test(path)) return;
        var data = serviceDataForPath(path);
        setText(document.querySelector('.page-header h1, main h1'), data.title);
        var mainImg = document.querySelector('main .blog-layout__main > img, main article > img, main .service-detail img');
        if (mainImg) setImage(mainImg, data.banner, data.title);
        setHtml(document.querySelector('main .about-rich'), data.body);
        updateFeatureCard(data);
        updateServiceContact();
    }

    function updateBoursePage() {
        var path = localPath();
        if (path.indexOf('bourse-isc-kindu') === -1) return;

        document.title = 'Bourse ISC Kindu - ' + brandShort;
        setText(document.querySelector('.page-header h1'), 'Bourse ISC Kindu');
        var crumb = document.querySelector('.page-header__crumbs');
        if (crumb) {
            var nodes = Array.prototype.slice.call(crumb.childNodes);
            nodes.forEach(function (node) {
                if (node.nodeType === 3 && node.nodeValue.trim()) node.nodeValue = 'Bourse ISC Kindu';
            });
        }

        setBackground(document.querySelector('.bk-portrait'), 'logo.jpg');
        setText(document.querySelector('.bk-fondateur__nom'), 'MUTUZA ZASSE');
        setText(document.querySelector('.bk-fondateur__titre'), 'Fondateur de la bourse ISC Kindu et Directeur G\u00e9n\u00e9ral actuel');
        setHtml(
            document.querySelector('.bk-contenu'),
            '<div><strong>MUTUZA ZASSE</strong>, Directeur General actuel de l\'ISC Kindu, porte cette bourse comme un mecanisme d\'encouragement des etudiants meritants.</div>' +
            '<div>La bourse ISC Kindu vise a soutenir les parcours academiques serieux et a renforcer l\'excellence au sein de l\'institution.</div>' +
            '<div><strong>Criteres de selection</strong></div>' +
            '<ul><li>Presenter de bonnes performances academiques.</li><li>Faire preuve d\'une conduite exemplaire.</li><li>Respecter les conditions fixees par l\'administration de l\'ISC Kindu.</li></ul>' +
            '<div>Les noms et temoignages des beneficiaires seront completes avec les informations officielles de l\'institution.</div>'
        );

        setText(document.querySelector('.bk-head h2'), 'Nos b\u00e9n\u00e9ficiaires');
        setText(document.querySelector('.bk-head .n'), 'A compl\u00e9ter');
        document.querySelectorAll('.bk-card').forEach(function (card, index) {
            setBackground(card.querySelector('.bk-card__photo'), photos[index % photos.length]);
            setText(card.querySelector('.bk-card__nom'), '');
            setText(card.querySelector('.bk-card__desig'), 'Bourse ISC Kindu');
            setText(card.querySelector('.bk-card__temoignage span'), 'T\u00e9moignage \u00e0 compl\u00e9ter avec les donn\u00e9es officielles de l\'ISC Kindu.');
        });
    }

    function updateHomeGallery() {
        if (!isHomePage()) return;
        var mediaCopy = [
            ['Activit\u00e9s acad\u00e9miques de l\'ISC Kindu', 'Images des activit\u00e9s acad\u00e9miques, c\u00e9r\u00e9monies et temps forts de la communaut\u00e9 ISC Kindu.'],
            ['C\u00e9r\u00e9monies et collations', 'Moments institutionnels, enseignants, \u00e9tudiants et invit\u00e9s r\u00e9unis autour de la formation.'],
            ['Vie estudiantine', 'La vie des \u00e9tudiants de l\'ISC Kindu \u00e0 travers les activit\u00e9s de campus.'],
            ['Encadrement acad\u00e9mique', 'Suivi, orientation et accompagnement des \u00e9tudiants dans leur parcours universitaire.'],
            ['Communaut\u00e9 universitaire', 'Des images de la communaut\u00e9 ISC Kindu en action.'],
            ['Formation pratique', 'Des parcours orientes vers la gestion, l\'informatique et les besoins professionnels.'],
            ['Temps forts institutionnels', 'Galerie des moments importants de l\'institution.'],
            ['Promotion de l\'excellence', 'Des activit\u00e9s qui valorisent le merite, la discipline et la reussite.']
        ];
        document.querySelectorAll('.media-card').forEach(function (card, index) {
            var item = mediaCopy[index % mediaCopy.length];
            var link = card.querySelector('.media-card__media');
            if (link) {
                setBackground(link, photos[index % photos.length]);
                link.setAttribute('href', rel('media-center.html#galerie'));
            }
            var titleLink = card.querySelector('.media-card__body h3 a');
            if (titleLink) {
                titleLink.textContent = item[0];
                titleLink.setAttribute('href', rel('media-center.html#galerie'));
            }
            setText(card.querySelector('.media-card__body p'), item[1]);
            setText(card.querySelector('.media-card__date strong'), 'ISC');
            setText(card.querySelector('.media-card__date em'), 'Kindu');
        });

        var galleryNames = [
            'Recherche',
            'C\u00e9r\u00e9monies acad\u00e9miques',
            'Enseignement',
            'Vie estudiantine',
            'Services \u00e0 la communaut\u00e9',
            'Gouvernance',
            'D\u00e9fense publique',
            'Encadrement',
            'Collations'
        ];
        document.querySelectorAll('.community-tile').forEach(function (tile, index) {
            setBackground(tile, photos[index % photos.length]);
            tile.setAttribute('href', rel('media-center.html#galerie'));
            setText(tile.querySelector('.community-tile__name'), galleryNames[index % galleryNames.length]);
            setText(tile.querySelector('.community-tile__count'), 'Photo ISC Kindu');
        });
    }

    function bindNavigation() {
        var nav = document.getElementById('primaryNav');
        if (!nav || nav.getAttribute('data-isc-nav-ready') === '1') return;
        nav.setAttribute('data-isc-nav-ready', '1');

        var toggle = document.querySelector('.site-header__toggle');
        var tapQuery = window.matchMedia ? window.matchMedia('(max-width: 1024px)') : null;

        function isTap() {
            return tapQuery ? tapQuery.matches : window.innerWidth <= 1024;
        }

        function syncTap() {
            nav.classList.toggle('is-tap', isTap());
        }

        syncTap();
        if (tapQuery) {
            if (tapQuery.addEventListener) tapQuery.addEventListener('change', syncTap);
            else if (tapQuery.addListener) tapQuery.addListener(syncTap);
        } else {
            window.addEventListener('resize', syncTap);
        }

        if (toggle) {
            toggle.addEventListener('click', function () {
                var willOpen = !nav.classList.contains('is-open');
                nav.classList.toggle('is-open', willOpen);
                toggle.classList.toggle('is-open', willOpen);
            });
        }

        nav.querySelectorAll('[data-nav-toggle]').forEach(function (item) {
            item.addEventListener('click', function (event) {
                if (!isTap()) return;
                var panel = item.nextElementSibling;
                if (!panel || !panel.matches('[data-nav-body]')) return;
                event.preventDefault();
                item.classList.toggle('is-open');
            });
        });

        document.addEventListener('click', function (event) {
            if (!nav.classList.contains('is-open')) return;
            if (nav.contains(event.target) || (toggle && toggle.contains(event.target))) return;
            nav.classList.remove('is-open');
            if (toggle) toggle.classList.remove('is-open');
        });
    }

    function apiUrl(path) {
        return apiBase + '/' + String(path || '').replace(/^\/+/, '');
    }

    function unwrapApi(payload) {
        if (payload && typeof payload === 'object' && Object.prototype.hasOwnProperty.call(payload, 'data')) {
            return payload.data;
        }
        return payload;
    }

    function apiGet(path) {
        if (!window.fetch) return Promise.resolve(null);
        return fetch(apiUrl(path), {
            headers: { Accept: 'application/json' },
            credentials: 'omit'
        }).then(function (response) {
            if (!response.ok) throw new Error('API ' + response.status);
            return response.json();
        }).then(unwrapApi).catch(function () {
            return null;
        });
    }

    function apiPost(path, body) {
        if (!window.fetch) return Promise.reject(new Error('Fetch indisponible'));
        return fetch(apiUrl(path), {
            method: 'POST',
            body: body,
            headers: { Accept: 'application/json' },
            credentials: 'omit'
        }).then(function (response) {
            return response.json().catch(function () {
                return {};
            }).then(function (payload) {
                if (!response.ok) {
                    var error = new Error(payload.message || 'La demande n a pas ete acceptee.');
                    error.payload = payload;
                    throw error;
                }
                return payload;
            });
        });
    }

    function asList(payload, key) {
        if (Array.isArray(payload)) return payload;
        if (payload && key && Array.isArray(payload[key])) return payload[key];
        if (payload && Array.isArray(payload.items)) return payload.items;
        return [];
    }

    function plain(value) {
        if (value === null || value === undefined) return '';
        if (typeof value === 'object') {
            value = value.name || value.title || value.label || '';
        }
        value = String(value).replace(/<[^>]*>/g, ' ');
        value = replaceBrandText(value);
        return value.replace(/\s+/g, ' ').trim();
    }

    function trimText(value, size) {
        value = plain(value);
        size = size || 160;
        return value.length > size ? value.slice(0, size - 1).trim() + '...' : value;
    }

    function dateLabel(value) {
        if (!value) return '';
        try {
            return new Date(value).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (e) {
            return plain(value);
        }
    }

    function itemTitle(item, fallback) {
        return plain(item && (item.title || item.name || item.caption || item.alt_text)) || (fallback !== undefined ? fallback : 'ISC Kindu');
    }

    function itemSummary(item) {
        if (!item) return '';
        return trimText(item.excerpt || item.summary || item.description || item.body || item.biography || item.caption, 180);
    }

    function itemDate(item) {
        return dateLabel(item && (item.published_at || item.decision_date || item.created_at || item.updated_at));
    }

    function itemLink(item, fallback) {
        if (!item) return '';
        var url = item.file_url || item.url || item.link_url || item.public_url || '';
        if (!url && item.slug && fallback) url = fallback + '#' + item.slug;
        if (!url) return '';
        if (/^\/api\//i.test(url)) return '';
        return localUrlForSite(url) || url;
    }

    function clearElement(el) {
        if (!el) return;
        while (el.firstChild) el.removeChild(el.firstChild);
    }

    function setStatus(el, message) {
        if (!el || !message) return;
        el.textContent = message;
    }

    function createEl(tag, className, text) {
        var el = document.createElement(tag);
        if (className) el.className = className;
        if (text !== undefined && text !== null) el.textContent = text;
        return el;
    }

    function createCleanCard(item, options) {
        options = options || {};
        var article = createEl('article', 'clean-card clean-card--live');
        var image = item && (item.image_url || item.url);
        var title = itemTitle(item, options.fallbackTitle);
        var summary = itemSummary(item);
        var meta = options.meta || plain(item && (item.type || item.collection || item.cycle || item.role));
        var link = itemLink(item, options.fallbackUrl);

        if (options.mediaOnly && image) {
            article.className += ' clean-card--media';
        }

        if (image && !/\.pdf($|\?)/i.test(image)) {
            var media = createEl('div', 'clean-card__media');
            media.style.backgroundImage = 'url("' + image + '")';
            media.setAttribute('role', 'img');
            media.setAttribute('aria-label', title);
            article.appendChild(media);
        }

        var body = createEl('div', 'clean-card__body');
        var metaLine = [meta, itemDate(item)].filter(Boolean).join(' - ');
        if (metaLine) body.appendChild(createEl('div', 'clean-card__meta', metaLine));
        body.appendChild(createEl('h2', 'clean-card__title', title));
        if (summary) body.appendChild(createEl('p', 'clean-card__text', summary));

        if (item && item.graduates_count !== undefined && item.graduates_count !== null) {
            body.appendChild(createEl('p', 'clean-card__text clean-card__text--strong', item.graduates_count + ' laureat(s)'));
        }

        if (link && link !== '#') {
            var a = createEl('a', 'clean-card__link', item && item.file_url ? 'Ouvrir le fichier' : 'Consulter');
            a.href = link;
            if (/^https?:\/\//i.test(link)) {
                a.target = '_blank';
                a.rel = 'noopener';
            }
            body.appendChild(a);
        }

        article.appendChild(body);
        return article;
    }

    function renderCleanSection(section, path, options) {
        var grid = section && section.querySelector('.clean-empty');
        if (!grid) return;
        options = options || {};
        apiGet(path).then(function (payload) {
            var items = asList(payload, options.listKey).filter(function (item) {
                return itemTitle(item, '') || itemSummary(item) || (item && (item.image_url || item.url || item.file_url));
            });
            if (!items.length) return;

            grid.classList.add('is-live');
            grid.setAttribute('aria-hidden', 'false');
            clearElement(grid);
            items.slice(0, options.limit || 12).forEach(function (item) {
                grid.appendChild(createCleanCard(item, options));
            });

            setStatus(section.querySelector('.clean-lede'), options.loadedText || 'Les contenus publies depuis le backend sont disponibles.');
            setStatus(section.querySelector('.clean-note'), 'Source : backend ISC Kindu.');
        });
    }

    function renderInstitutionBlocks(section) {
        var grid = section && section.querySelector('.grid');
        if (!grid) return;
        apiGet('/institution/blocks').then(function (payload) {
            var items = asList(payload).filter(function (item) {
                var hasEditorialContent = plain(item && (item.subtitle || item.summary || item.body || item.image_url));
                return item && item.group === 'institution_block' && (itemTitle(item, '') || hasEditorialContent);
            });
            if (!items.length) return;

            clearElement(grid);
            items.slice(0, 9).forEach(function (item) {
                var card = createEl('article', 'ui-card p-5 min-h-[160px]');
                var title = createEl('h3', 'font-semibold text-base text-black/90 dark:text-white/90', itemTitle(item, 'Bloc institution'));
                var text = createEl('p', 'mt-2 text-sm leading-6 text-black/60 dark:text-white/65', itemSummary(item) || 'Contenu publie depuis le backend.');
                card.appendChild(title);
                card.appendChild(text);
                var link = itemLink(item);
                if (link) {
                    var a = createEl('a', 'mt-4 inline-flex text-sm font-semibold brand-text', plain(item.link_label) || 'Consulter');
                    a.href = link;
                    card.appendChild(a);
                }
                grid.appendChild(card);
            });
        });
    }

    function renderFeesPage() {
        if (!isLocalPage('nos-frais.html')) return;
        var target = document.querySelector('.frais-empty');
        if (!target) return;
        apiGet('/fees?per_page=12').then(function (payload) {
            var items = asList(payload).filter(function (item) {
                return itemTitle(item, '') || itemSummary(item) || (item && item.file_url);
            });
            if (!items.length) return;
            var grid = createEl('div', 'isc-api-grid');
            items.forEach(function (item) {
                grid.appendChild(createCleanCard(item, { meta: 'Frais', fallbackUrl: 'nos-frais.html' }));
            });
            target.parentNode.replaceChild(grid, target);
        });
    }

    function createEmptyState(message) {
        var empty = createEl('div', 'isc-empty-state', message);
        empty.setAttribute('role', 'status');
        return empty;
    }

    function parseDescriptionLine(description, label) {
        description = String(description || '');
        var lines = description.split(/\r?\n/);
        label = label.toLowerCase();
        for (var i = 0; i < lines.length; i += 1) {
            var line = plain(lines[i]);
            if (line.toLowerCase().indexOf(label) === 0) {
                return line.replace(/^[^:]+:\s*/, '');
            }
        }
        return '';
    }

    function createWorkOffer(item) {
        var article = createEl('article', 'work-offer work-offer--live');
        var body = createEl('div', 'work-offer__body');
        var meta = createEl('div', 'work-offer__meta');
        meta.appendChild(createEl('span', 'work-offer__ref', plain(item && item.type) || 'Opportunite'));
        meta.appendChild(createEl('span', 'work-offer__state is-open', 'Publiee'));
        body.appendChild(meta);

        var h3 = createEl('h3');
        var title = createEl('span', '', itemTitle(item, 'Opportunite ISC Kindu'));
        h3.appendChild(title);
        body.appendChild(h3);

        var org = parseDescriptionLine(item && item.description, 'organisation:');
        if (org) body.appendChild(createEl('p', 'work-offer__org', org));
        body.appendChild(createEl('p', '', itemSummary(item) || 'Annonce publiee depuis le backend ISC Kindu.'));

        var foot = createEl('div', 'work-offer__foot');
        var deadline = parseDescriptionLine(item && item.description, 'date limite:') || itemDate(item) || 'A completer';
        foot.appendChild(createEl('span', '', 'Cloture : ' + deadline));
        var link = itemLink(item);
        if (link) {
            var a = createEl('a', 'work-offer__more', 'Ouvrir');
            a.href = link;
            if (/^https?:\/\//i.test(link)) {
                a.target = '_blank';
                a.rel = 'noopener';
            }
            foot.appendChild(a);
        }
        body.appendChild(foot);
        article.appendChild(body);
        return article;
    }

    function renderWorkOffers() {
        document.querySelectorAll('[data-backend-source]').forEach(function (container) {
            var source = container.getAttribute('data-backend-source') || '';
            var path = source === 'offres-emploi' ? '/emplois?per_page=12' : '/opportunites?per_page=12';
            clearElement(container);
            container.appendChild(createEmptyState('Chargement des publications depuis le backend...'));

            apiGet(path).then(function (payload) {
                var items = asList(payload).filter(function (item) {
                    var type = plain(item && item.type).toLowerCase();
                    if (source === 'offres-emploi') return type === 'emploi' || type === 'offre';
                    return itemTitle(item, '') || itemSummary(item);
                });
                clearElement(container);
                if (!items.length) {
                    container.appendChild(createEmptyState(source === 'offres-emploi'
                        ? 'Aucune offre d emploi publiee pour le moment.'
                        : 'Aucune opportunite publiee pour le moment.'));
                    return;
                }
                items.forEach(function (item) {
                    container.appendChild(createWorkOffer(item));
                });
            });
        });
    }

    function createTeacherCard(item) {
        var article = createEl('article', 'card ens-carousel__item isc-teacher-card');
        var mediaWrap = createEl('div', 'card__media-wrap');
        var media = createEl('div', 'card__media');
        var image = item && item.image_url;
        if (image) media.style.backgroundImage = 'url("' + image + '")';
        mediaWrap.appendChild(media);
        article.appendChild(mediaWrap);

        var body = createEl('div', 'card__body');
        body.appendChild(createEl('h3', 'ens-card__name', itemTitle(item, 'Enseignant')));
        var grade = plain(item && (item.title || item.department || item.role)) || 'Enseignant a l ISC Kindu';
        body.appendChild(createEl('p', 'ens-card__grade', grade));
        var bio = itemSummary(item);
        if (bio) body.appendChild(createEl('p', 'isc-teacher-card__bio', bio));
        article.appendChild(body);
        return article;
    }

    function renderTeachersPage() {
        if (!isLocalPage('nos-enseignants.html')) return;
        var container = document.querySelector('main .section--sm .container');
        if (!container) return;
        container.querySelectorAll('.ens-group').forEach(function (group) {
            group.parentNode.removeChild(group);
        });
        var loading = createEmptyState('Chargement des enseignants depuis le backend...');
        container.appendChild(loading);

        apiGet('/teachers?role=enseignant&per_page=80').then(function (payload) {
            var items = asList(payload).filter(function (item) {
                return itemTitle(item, '') || itemSummary(item);
            });
            if (loading.parentNode) loading.parentNode.removeChild(loading);
            if (!items.length) {
                container.appendChild(createEmptyState('Aucun enseignant publie pour le moment.'));
                return;
            }

            var group = createEl('div', 'ens-group ens-group--backend');
            var head = createEl('div', 'ens-group__head');
            head.appendChild(createEl('h2', 'ens-group__title', 'Enseignants publies'));
            head.appendChild(createEl('span', 'ens-group__count', String(items.length)));
            head.appendChild(createEl('span', 'ens-group__rule'));
            group.appendChild(head);

            var grid = createEl('div', 'isc-teacher-grid');
            items.forEach(function (item) {
                grid.appendChild(createTeacherCard(item));
            });
            group.appendChild(grid);
            container.appendChild(group);
        });
    }

    function normalizeBackendRoute(route) {
        route = String(route || '').replace(/^\/+/, '');
        if (route.indexOf('api/') === 0) route = route.slice(4);
        return route;
    }

    function markBackendLinkPending(link, message) {
        link.href = '#';
        link.setAttribute('aria-disabled', 'true');
        link.setAttribute('title', message);
        link.setAttribute('data-backend-ready', '0');
        if (link.getAttribute('data-backend-click-ready') !== '1') {
            link.setAttribute('data-backend-click-ready', '1');
            link.addEventListener('click', function (event) {
                if (link.getAttribute('data-backend-ready') === '1') return;
                event.preventDefault();
                window.alert(link.getAttribute('title') || 'Fichier non encore publie depuis le backend.');
            });
        }
    }

    function connectBackendRouteLinks() {
        var cache = {};
        document.querySelectorAll('a[data-backend-route]').forEach(function (link) {
            var route = normalizeBackendRoute(link.getAttribute('data-backend-route'));
            if (!route) return;
            markBackendLinkPending(link, 'Fichier non encore publie depuis le backend.');
            if (!cache[route]) cache[route] = apiGet('/' + route);
            cache[route].then(function (payload) {
                var item = payload && !Array.isArray(payload) ? payload : null;
                var url = item && (item.file_url || item.url || item.link_url);
                if (!url) return;
                link.href = localUrlForSite(url) || url;
                link.removeAttribute('aria-disabled');
                link.setAttribute('data-backend-ready', '1');
                link.setAttribute('title', itemTitle(item, 'Ouvrir le fichier'));
                if (/^https?:\/\//i.test(link.href)) {
                    link.target = '_blank';
                    link.rel = 'noopener';
                }
            });
        });
    }

    function formRoute(form) {
        if (form.getAttribute('data-backend-route')) return form.getAttribute('data-backend-route');
        if (form.hasAttribute('data-inscription-form') || form.hasAttribute('data-pins-form')) return '/inscriptions/public';
        if (form.classList.contains('newsletter')) return '/newsletter';
        if (form.closest('.contact-form')) return '/contact/messages';
        return '';
    }

    function relaxInscriptionFormUploads() {
        document.querySelectorAll('input[type="file"][name="formulaire"]').forEach(function (input) {
            input.required = false;
            input.removeAttribute('required');
            var label = input.id ? document.querySelector('label[for="' + input.id + '"]') : null;
            if (label) label.textContent = label.textContent.replace(/\s*\*$/, '');
        });
    }

    function formMessage(form, text, isError) {
        var message = form.querySelector('[data-api-form-message]');
        if (!message) {
            message = createEl('div', 'isc-form-message');
            message.setAttribute('data-api-form-message', '1');
            form.appendChild(message);
        }
        message.classList.toggle('is-error', !!isError);
        message.textContent = text;
    }

    function apiErrorMessage(error) {
        var payload = error && error.payload;
        if (payload && payload.errors) {
            var messages = [];
            Object.keys(payload.errors).forEach(function (key) {
                if (Array.isArray(payload.errors[key])) {
                    messages = messages.concat(payload.errors[key]);
                }
            });
            if (messages.length) return messages.join(' ');
        }
        return (payload && payload.message) || (error && error.message) || 'Envoi impossible pour le moment.';
    }

    function connectBackendForms() {
        document.querySelectorAll('form').forEach(function (form) {
            var route = formRoute(form);
            if (!route || form.getAttribute('data-api-form-ready') === '1') return;
            form.setAttribute('data-api-form-ready', '1');
            form.setAttribute('action', apiUrl(route));
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var submit = form.querySelector('[type="submit"]');
                if (submit) submit.disabled = true;
                formMessage(form, 'Envoi en cours...', false);
                apiPost(route, new FormData(form)).then(function (payload) {
                    formMessage(form, payload.message || 'Votre demande a ete envoyee.', false);
                    form.reset();
                }).catch(function (error) {
                    formMessage(form, apiErrorMessage(error), true);
                }).then(function () {
                    if (submit) submit.disabled = false;
                });
            });
        });
    }

    function firstSetting(settings, keys) {
        for (var i = 0; i < keys.length; i += 1) {
            var value = plain(settings && settings[keys[i]]);
            if (value) return value;
        }
        return '';
    }

    function phoneHref(phone) {
        var clean = String(phone || '').replace(/[^\d+]/g, '');
        clean = clean.replace(/(?!^)\+/g, '');
        return clean ? 'tel:' + clean : '';
    }

    function updateContactCards(label, value) {
        if (!value) return;
        document.querySelectorAll('.contact-item').forEach(function (item) {
            var title = plain(item.querySelector('strong') && item.querySelector('strong').textContent).toLowerCase();
            if (title.indexOf(label) === -1) return;
            var target = item.querySelector('p') || item.querySelector('div:last-child');
            if (target && !target.querySelector('a')) target.textContent = value;
        });
    }

    function applySiteSettings(settings) {
        settings = settings || {};
        var email = firstSetting(settings, ['institution.email', 'social.email']);
        var phone = firstSetting(settings, ['institution.phone']);
        var address = firstSetting(settings, ['institution.address']);

        if (email) {
            document.querySelectorAll('a[href^="mailto:"]').forEach(function (link) {
                link.href = 'mailto:' + email;
                link.textContent = email;
            });
        }

        if (phone) {
            document.querySelectorAll('a[href^="tel:"]').forEach(function (link) {
                link.href = phoneHref(phone);
                link.textContent = phone;
            });
            updateContactCards('telephone', phone);
        }

        if (address) {
            document.querySelectorAll('.site-footer__contact .is-addr, [data-institution-address]').forEach(function (el) {
                el.textContent = address;
            });
            updateContactCards('adresse', address);
        }
    }

    function syncSiteSettings() {
        apiGet('/site/settings').then(function (settings) {
            applySiteSettings(settings || {});
        });
    }

    function enhanceSearchWithBackend() {
        var input = document.getElementById('siteSearchInput');
        var results = document.getElementById('siteSearchResults');
        if (!input || !results || input.getAttribute('data-api-search-ready') === '1') return;
        input.setAttribute('data-api-search-ready', '1');
        var timer = null;

        input.addEventListener('input', function () {
            var q = (input.value || '').trim();
            if (timer) clearTimeout(timer);
            if (q.length < 2) return;
            timer = setTimeout(function () {
                apiGet('/site/search?q=' + encodeURIComponent(q) + '&limit=10').then(function (payload) {
                    var items = asList(payload).filter(function (item) {
                        return itemTitle(item, '') && item.url;
                    });
                    if (!items.length || input.value.trim() !== q) return;
                    clearElement(results);
                    items.forEach(function (item, index) {
                        var a = createEl('a');
                        a.href = localUrlForSite(item.url) || item.url || '#';
                        if (index === 0) a.className = 'is-active';
                        var crumb = createEl('span', 'crumb', plain(item.type || 'backend') + ' - ');
                        var strong = createEl('strong', '', itemTitle(item));
                        a.appendChild(crumb);
                        a.appendChild(strong);
                        results.appendChild(a);
                    });
                });
            }, 220);
        });
    }

    function connectBackendData() {
        document.querySelectorAll('[data-backend-section]').forEach(function (section) {
            var name = section.getAttribute('data-backend-section');
            if (name === 'blog-posts') {
                renderCleanSection(section, '/news?per_page=12', {
                    meta: 'Actualite',
                    fallbackUrl: 'blog.html',
                    loadedText: 'Les actualites publiees depuis le backend sont disponibles.'
                });
            } else if (name === 'academic-documents') {
                renderCleanSection(section, '/documents?per_page=12', {
                    meta: 'Document',
                    fallbackUrl: 'documents.html',
                    loadedText: 'Les documents publies depuis le backend sont disponibles.'
                });
            } else if (name === 'media-gallery') {
                renderCleanSection(section, '/gallery?per_page=24', {
                    meta: 'Media',
                    mediaOnly: true,
                    fallbackUrl: 'media-center.html',
                    loadedText: 'Les medias publies depuis le backend sont disponibles.'
                });
            } else if (name === 'palmares') {
                renderCleanSection(section, '/palmares?per_page=12', {
                    meta: 'Palmares',
                    fallbackUrl: 'nos-palmares.html',
                    loadedText: 'Les palmares publies depuis le backend sont disponibles.'
                });
            } else if (name === 'institution-blocks') {
                renderInstitutionBlocks(section);
            }
        });

        renderFeesPage();
        renderTeachersPage();
        renderWorkOffers();
        relaxInscriptionFormUploads();
        connectBackendRouteLinks();
        connectBackendForms();
        syncSiteSettings();
        enhanceSearchWithBackend();
    }

    function addStyle() {
        var style = document.createElement('style');
        style.textContent = [
            '.site-header__brand img{max-height:52px;border-radius:4px;}',
            '.site-nav__panel .site-nav__col-body a{white-space:normal;}',
            '.hero__slide{background-position:center!important;}',
            '.svc-head-feature__photo{object-fit:contain;background:#fff;}',
            '.about-dg-card__portrait img{object-fit:contain;background:#fff;}',
            '.about-dg-card h3:empty::after,.svc-head-feature__name:empty::after,.bk-card__nom:empty::after{content:"\\00a0";}',
            '.site-amg-shortcut{position:fixed;right:14px;bottom:14px;z-index:920;display:inline-flex;align-items:center;justify-content:center;width:46px;height:34px;border-radius:6px;background:#0b1220;color:#fff;text-decoration:none;font-size:.72rem;font-weight:800;letter-spacing:.08em;box-shadow:0 12px 28px rgba(0,0,0,.18);border:1px solid rgba(191,138,42,.55);opacity:.92;transition:opacity .15s ease,transform .15s ease;}',
            '.site-amg-shortcut:hover{opacity:1;transform:translateY(-1px);color:#fff;}',
            '.site-topbar__links .site-amg-toplink{background:#bf8a2a;color:#fff!important;border-radius:4px;margin-left:2px;padding:5px 8px!important;}',
            '.site-topbar__links .site-amg-toplink:hover{background:#d29a36;color:#fff!important;}',
            'html,body{max-width:100%;}',
            'img,video,iframe,object{max-width:100%;}',
            '.about-rich,.prose,.clean-lede,.media-card__body p,.card__excerpt{overflow-wrap:anywhere;}',
            '.site-nav a,.clean-links a,.btn,.ui-btn{white-space:normal;}',
            'table{max-width:100%;}',
            '.clean-empty.is-live,.isc-api-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;align-items:stretch;}',
            '.clean-card--live{aspect-ratio:auto!important;min-height:0!important;border:1px solid #e2e8f0!important;border-radius:8px;background:#fff;overflow:hidden;box-shadow:0 12px 26px rgba(15,23,42,.08);display:flex;flex-direction:column;}',
            '.clean-card__media{aspect-ratio:16/9;background-size:cover;background-position:center;background-color:#e2e8f0;}',
            '.clean-card__body{padding:16px;display:flex;flex:1;flex-direction:column;gap:10px;}',
            '.clean-card__meta{font-size:.7rem;font-weight:800;text-transform:uppercase;letter-spacing:.09em;color:#0369a1;}',
            '.clean-card__title{margin:0!important;font-size:1.04rem!important;line-height:1.28!important;color:#0f172a;}',
            '.clean-card__text{margin:0;color:#475569;font-size:.9rem;line-height:1.58;}',
            '.clean-card__text--strong{font-weight:700;color:#0f172a;}',
            '.clean-card__link{margin-top:auto;display:inline-flex;width:max-content;max-width:100%;align-items:center;color:#0369a1;font-weight:800;text-decoration:none;border-bottom:1px solid rgba(3,105,161,.35);}',
            '.isc-api-grid{margin-top:18px;}',
            '.isc-empty-state{padding:28px 18px;text-align:center;color:#64748b;background:#f8fafc;border:1px dashed #cbd5e1;border-radius:8px;}',
            '.work-offer--live .work-offer__more{white-space:nowrap;}',
            '.isc-teacher-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:18px;}',
            '.isc-teacher-card{min-width:0!important;max-width:none!important;}',
            '.isc-teacher-card .card__media-wrap{display:block;}',
            '.isc-teacher-card .card__media{aspect-ratio:4/3;background-size:cover;background-position:center;background-color:#e5e7eb;}',
            '.isc-teacher-card__bio{font-size:.86rem;line-height:1.55;color:var(--color-muted,#64748b);margin-top:.6rem;}',
            '.isc-form-message{grid-column:1/-1;margin-top:10px;padding:10px 12px;border-radius:8px;background:#ecfdf5;color:#047857;font-weight:700;font-size:.88rem;}',
            '.isc-form-message.is-error{background:#fef2f2;color:#b91c1c;}',
            '@media (max-width:640px){',
            'body{font-size:15px;}',
            '.container,.clean-container{width:100%;padding-left:14px!important;padding-right:14px!important;}',
            'h1{font-size:clamp(1.85rem,8vw,2.45rem)!important;line-height:1.08!important;}',
            'h2{font-size:clamp(1.45rem,6.4vw,2rem)!important;line-height:1.14!important;}',
            'h3{font-size:1.05rem!important;line-height:1.25!important;}',
            '.section{padding:46px 0!important;}',
            '.section--sm{padding:36px 0!important;}',
            '.section-head{margin-bottom:30px!important;}',
            '.section-head__eyebrow{font-size:.68rem!important;letter-spacing:.14em!important;}',
            '.site-topbar .container{padding-left:8px!important;padding-right:8px!important;}',
            '.site-topbar__inner{min-height:auto;padding:5px 0;justify-content:center;flex-wrap:nowrap;gap:3px;}',
            '.site-topbar__links{justify-content:center;flex-wrap:nowrap;width:auto;gap:0;min-width:0;}',
            '.site-topbar__links a,.site-topbar__search{padding:4px 4px!important;font-size:.6rem!important;}',
            '.site-topbar__search span{display:none!important;}',
            '.site-topbar__links .site-amg-toplink{padding:4px 5px!important;}',
            '.site-amg-shortcut{right:12px;bottom:72px;width:40px;height:31px;font-size:.66rem;}',
            ':root{--header-h:68px!important;}',
            '.site-header{height:var(--header-h)!important;}',
            '.site-header__inner{gap:8px;min-width:0;}',
            '.site-header__brand img{max-height:42px!important;}',
            '.site-header__lang{margin-left:auto;font-size:.68rem;gap:0;}',
            '.site-header__lang a{padding:4px 6px;}',
            '.site-header__toggle{display:flex!important;width:40px;height:40px;margin-left:4px;flex:0 0 40px;}',
            '.site-nav{top:var(--header-h)!important;padding:12px 14px!important;max-height:calc(100dvh - var(--header-h))!important;}',
            '.site-nav__link{padding:11px 6px!important;font-size:.75rem!important;letter-spacing:.07em!important;}',
            '.site-nav__panel a,.site-nav__subpanel a,.site-nav__col-body a{padding:8px 10px!important;font-size:.84rem!important;line-height:1.35!important;}',
            '.hero{min-height:64vh!important;}',
            '.hero__inner{padding:36px 0 54px!important;}',
            '.hero h1{display:block!important;font-size:clamp(1.55rem,7.4vw,2rem)!important;max-width:100%!important;line-height:1.1!important;margin-bottom:14px!important;overflow:visible!important;-webkit-line-clamp:unset!important;-webkit-box-orient:initial!important;overflow-wrap:break-word!important;}',
            '.hero__lede{font-size:.95rem!important;line-height:1.55!important;margin-bottom:22px!important;max-width:100%;overflow-wrap:break-word;}',
            '.hero__eyebrow{display:block!important;font-size:.62rem!important;letter-spacing:.1em!important;line-height:1.45!important;margin-bottom:12px!important;max-width:100%;white-space:normal!important;overflow-wrap:break-word;}',
            '.hero__nav{display:none!important;}',
            '.hero__actions{gap:10px!important;}',
            '.hero__actions .btn,.btn{width:100%;justify-content:center;padding:11px 14px!important;font-size:.7rem!important;letter-spacing:.08em!important;}',
            '.hero-thumbs{margin-top:-18px!important;padding-bottom:30px!important;}',
            '.hero-thumbs__grid{grid-template-columns:1fr 1fr!important;gap:3px!important;padding:3px!important;}',
            '.hero-thumb{aspect-ratio:4/3!important;}',
            '.hero-thumb__label{padding:9px!important;font-size:.78rem!important;}',
            '.hero-thumb__label small{font-size:.55rem!important;letter-spacing:.08em!important;}',
            '.page-header{padding:64px 0 42px!important;}',
            '.page-header__crumbs{font-size:.66rem!important;letter-spacing:.08em!important;line-height:1.5;}',
            '.about-hero{min-height:38vh!important;padding:72px 0 34px!important;}',
            '.about-hero h1{font-size:clamp(1.75rem,8vw,2.25rem)!important;}',
            '.about-hero p,.about-rich,.prose p{font-size:.94rem!important;line-height:1.65!important;}',
            '.about-hero__scroll{margin-top:22px;font-size:.62rem;letter-spacing:.12em;}',
            '.about-keyfacts,.about-values,.about-dgs,.cards,.cards--2,.cards--4,.soc-hacks,.work-form__grid{grid-template-columns:1fr!important;gap:14px!important;}',
            '.about-keyfact,.about-value,.card,.work-offer{padding:16px!important;}',
            '.about-dg-card__portrait{max-width:124px!important;margin-bottom:12px!important;}',
            '.about-dg-card p{margin-top:8px!important;}',
            '.about-dg__photo{max-width:210px!important;margin:0 auto;}',
            '.about-dg__body{padding-left:14px!important;}',
            '.about-split,.about-dg,.blog-layout,.contact-grid,.rs-actu{grid-template-columns:1fr!important;gap:24px!important;}',
            '.about-split__img,.split__media{aspect-ratio:16/10!important;min-height:0!important;border-radius:8px!important;}',
            '.about-plan__legend{margin-top:18px!important;}',
            '.about-plan__zoom{right:10px;bottom:10px;padding:7px 10px;font-size:.62rem;letter-spacing:.06em;}',
            '.about-slide{gap:24px!important;}',
            '.about-slide__media{min-height:210px!important;clip-path:none!important;border-radius:8px!important;}',
            '.about-slide__eyebrow{font-size:.66rem!important;letter-spacing:.12em!important;margin-bottom:14px!important;}',
            '.about-slide__dot{display:none!important;}',
            '.about-slide__title{font-size:1.35rem!important;margin-bottom:16px!important;}',
            '.about-slide__text{font-size:.92rem!important;margin-bottom:20px!important;}',
            '.about-slide__features{gap:10px!important;margin-bottom:18px!important;}',
            '.about-feature{padding:0 0 10px!important;}',
            '.about-slide__footer{gap:12px!important;}',
            '.world-carousel{height:330px!important;overflow:hidden!important;}',
            '.world-card{width:168px!important;height:260px!important;border-radius:14px!important;}',
            '.world-card__body{padding:14px!important;}',
            '.world-card__body h3{font-size:.92rem!important;}',
            '.world-card__body small{font-size:.55rem!important;letter-spacing:.08em!important;}',
            '.world-carousel__nav{width:36px!important;height:36px!important;}',
            '.media-center-mirror__head{grid-template-columns:1fr!important;gap:14px!important;margin-bottom:24px!important;}',
            '.media-tabs{flex-wrap:nowrap!important;overflow-x:auto!important;padding-bottom:6px;}',
            '.media-tab{padding:9px 12px!important;font-size:.68rem!important;}',
            '.media-center-mirror__nav{justify-self:start!important;}',
            '.media-card{flex:0 0 100%!important;max-width:100%!important;padding:0!important;}',
            '.media-card__media{aspect-ratio:16/9!important;}',
            '.media-card__date{top:9px;right:9px;padding:6px 8px;min-width:42px;}',
            '.media-card__date strong{font-size:.9rem;}',
            '.media-card__body h3{font-size:.95rem!important;}',
            '.communities--mosaic,.communities,.stats,.shorts{grid-template-columns:1fr!important;}',
            '.community-tile,.communities--mosaic .community-tile:nth-child(n){min-height:130px!important;aspect-ratio:auto!important;}',
            '.community-tile__name{font-size:.95rem!important;}',
            '.community-tile__inner{padding:14px!important;}',
            '.stat__value{font-size:1.8rem!important;}',
            '.stat__label{font-size:.66rem!important;letter-spacing:.08em!important;}',
            '.site-footer{padding:44px 0 22px!important;}',
            '.site-footer__grid{grid-template-columns:1fr!important;gap:22px!important;padding-bottom:26px!important;}',
            '.newsletter{flex-direction:column;}',
            '.request-tab,.student-tab{padding:10px 7px!important;font-size:.58rem!important;letter-spacing:.1em!important;}',
            '.request-drawer__panel,.student-drawer__panel{width:100vw!important;padding:24px 16px!important;}',
            '.request-drawer__close,.student-drawer__close{top:16px!important;right:16px!important;width:40px!important;height:40px!important;font-size:1.4rem!important;}',
            '.request-drawer h2,.student-drawer h2{font-size:1.35rem!important;}',
            '.clean-nav{min-height:auto!important;padding:12px 0!important;gap:10px!important;}',
            '.clean-brand img{width:38px!important;height:38px!important;}',
            '.clean-links{gap:8px 12px!important;font-size:12px!important;}',
            '.clean-main{padding:42px 0 54px!important;}',
            '.clean-title{font-size:clamp(2rem,12vw,2.8rem)!important;line-height:1.02!important;}',
            '.clean-lede{font-size:.95rem!important;line-height:1.6!important;}',
            '.clean-empty{grid-template-columns:1fr!important;gap:10px!important;margin-top:24px!important;}',
            '.clean-card{min-height:118px!important;}',
            '.clean-empty.is-live,.isc-api-grid,.isc-teacher-grid{grid-template-columns:1fr!important;gap:12px!important;}',
            '.clean-card__body{padding:14px!important;}',
            '.clean-card__title{font-size:.98rem!important;}',
            '.clean-card__text{font-size:.86rem!important;line-height:1.55!important;}',
            '.work-offer--live .work-offer__foot{gap:10px!important;}',
            'body>header .h-16{height:auto!important;min-height:58px!important;padding:.55rem 0!important;gap:.75rem!important;}',
            'body>header .leading-tight .text-xs{display:none!important;}',
            'body>header .ui-btn{height:2.35rem!important;padding:0 .7rem!important;font-size:.78rem!important;flex:0 0 auto;}',
            'body>header .ui-btn-primary{display:none!important;}',
            'main section.mb-6{margin-bottom:1.4rem!important;}',
            'main section.mb-6 [data-services-hero-prev],main section.mb-6 [data-services-hero-next]{display:none!important;}',
            '.ui-card{border-radius:8px!important;}',
            '.min-h-\\[160px\\]{min-height:110px!important;}',
            '.h-\\[320px\\],.sm\\:h-\\[380px\\]{height:110px!important;}',
            '.text-4xl,.sm\\:text-5xl{font-size:2rem!important;line-height:1.1!important;}',
            '.text-base,.sm\\:text-lg{font-size:.95rem!important;line-height:1.55!important;}',
            '.gap-10{gap:1.25rem!important;}',
            '.py-10{padding-top:1.8rem!important;padding-bottom:1.8rem!important;}',
            '.p-5,.sm\\:p-6{padding:1rem!important;}',
            '[data-backend-section="institution-blocks"]{margin-top:1.75rem!important;}',
            '[data-backend-section="institution-blocks"] .grid{gap:.75rem!important;}',
            '[data-backend-empty-block]{min-height:96px!important;}',
            '.maq__table,#rs-table{min-width:520px;}',
            '.maq__table-wrap,.table-wrap,.prose table{display:block;overflow-x:auto;}',
            '}',
            '@media (max-width:380px){',
            '.hero h1{font-size:1.6rem!important;}',
            '.hero__lede{font-size:.88rem!important;}',
            '.hero-thumbs__grid{grid-template-columns:1fr!important;}',
            '.world-card{width:150px!important;height:232px!important;}',
            '.clean-links{font-size:11px!important;}',
            '.clean-card{min-height:96px!important;}',
            '.site-topbar__links a,.site-topbar__search{padding:4px 4px!important;font-size:.6rem!important;}',
            '}'
        ].join('');
        document.head.appendChild(style);
    }

    function addAdminShortcut() {
        if (document.querySelector('[data-amg-link]')) return;
        document.querySelectorAll('.site-topbar__links a').forEach(function (item) {
            if (/S['\u2019]inscrire/i.test(item.textContent || '')) {
                item.textContent = 'S\'inscrire';
            }
        });
        var topbar = document.querySelector('.site-topbar__links');
        var link = document.createElement('a');
        link.className = topbar ? 'site-amg-toplink' : 'site-amg-shortcut';
        link.href = window.ISC_ADMIN_URL || 'https://isc-kindu-backend.onrender.com/admin/login';
        link.textContent = 'AMG';
        link.setAttribute('data-amg-link', '1');
        link.setAttribute('aria-label', 'Ouvrir AMG');
        link.setAttribute('title', 'AMG');
        (topbar || document.body).appendChild(link);
    }

    addStyle();
    addAdminShortcut();
    updateMetadata();
    updateLogo();
    updateAttributes();
    updateTextNodes(document.body);
    localizeExternalLinks();
    bindSearchResultLinks();
    protectForms();
    updateInstitutionNav();
    bindNavigation();
    updateHero();
    updateHomeImagesAndCourses();
    updateAboutPage();
    updateServicePage();
    updateBoursePage();
    updateHomeGallery();
    connectBackendData();
    updateAttributes();
    updateTextNodes(document.body);
    localizeExternalLinks();
})();
