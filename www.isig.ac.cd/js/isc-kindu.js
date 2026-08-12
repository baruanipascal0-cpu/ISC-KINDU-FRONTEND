(function () {
    'use strict';

    var brand = 'ISC Kindu';
    var brandShort = 'ISC-KINDU';
    var assetBase = 'storage/isc-kindu/';
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

    function addStyle() {
        var style = document.createElement('style');
        style.textContent = [
            '.site-header__brand img{max-height:52px;border-radius:4px;}',
            '.site-nav__panel .site-nav__col-body a{white-space:normal;}',
            '.hero__slide{background-position:center!important;}',
            '.svc-head-feature__photo{object-fit:contain;background:#fff;}',
            '.about-dg-card__portrait img{object-fit:contain;background:#fff;}',
            '.about-dg-card h3:empty::after,.svc-head-feature__name:empty::after,.bk-card__nom:empty::after{content:"\\00a0";}',
            'html,body{max-width:100%;}',
            'img,video,iframe,object{max-width:100%;}',
            '.about-rich,.prose,.clean-lede,.media-card__body p,.card__excerpt{overflow-wrap:anywhere;}',
            '.site-nav a,.clean-links a,.btn,.ui-btn{white-space:normal;}',
            'table{max-width:100%;}',
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
            '.site-topbar__inner{min-height:auto;padding:5px 0;justify-content:center;flex-wrap:nowrap;gap:3px;}',
            '.site-topbar__links{justify-content:center;flex-wrap:nowrap;width:auto;gap:0;min-width:0;}',
            '.site-topbar__links a,.site-topbar__search{padding:5px 5px!important;font-size:.64rem!important;}',
            '.site-topbar__search span{display:none!important;}',
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

    addStyle();
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
    updateAttributes();
    updateTextNodes(document.body);
    localizeExternalLinks();
})();
