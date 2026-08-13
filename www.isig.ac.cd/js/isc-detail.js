(function () {
    'use strict';

    var apiBase = (window.ISC_API_BASE || 'https://isc-kindu-backend.onrender.com/api').replace(/\/+$/, '');
    var params = new URLSearchParams(window.location.search || '');
    var pathType = typeFromPath(window.location.pathname || '');
    var type = normalizeType(params.get('type') || pathType || 'news');
    var slug = params.get('slug') || slugFromPath(window.location.pathname || '');

    var configs = {
        news: { endpoint: 'news', label: 'Actualite', back: 'blog.html', backLabel: 'Retour aux actualites' },
        publication: { endpoint: 'publications', label: 'Publication', back: 'documents.html', backLabel: 'Retour aux publications' },
        document: { endpoint: 'documents', label: 'Document', back: 'documents.html', backLabel: 'Retour aux documents' },
        fee: { endpoint: 'fees', label: 'Frais', back: 'nos-frais.html', backLabel: 'Retour aux frais' },
        media: { endpoint: 'gallery', label: 'Media', back: 'media-center.html', backLabel: 'Retour aux medias' },
        teacher: { endpoint: 'teachers', label: 'Enseignant', back: 'nos-enseignants.html', backLabel: 'Retour aux enseignants' },
        palmares: { endpoint: 'graduation-lists', label: 'Palmares', back: 'nos-palmares.html', backLabel: 'Retour aux palmares' },
        event: { endpoint: 'events', label: 'Evenement', back: 'blog.html', backLabel: 'Retour aux evenements' },
        page: { endpoint: 'pages', label: 'Page', back: 'index.html', backLabel: 'Retour au site' }
    };

    function $(selector) {
        return document.querySelector(selector);
    }

    function plain(value, fallback) {
        if (value === null || value === undefined || value === '') return fallback || '';
        return String(value).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    }

    function normalizeType(value) {
        value = plain(value).toLowerCase().replace(/_/g, '-');
        var map = {
            actualite: 'news',
            actualites: 'news',
            news: 'news',
            publication: 'publication',
            publications: 'publication',
            document: 'document',
            documents: 'document',
            frais: 'fee',
            fees: 'fee',
            fee: 'fee',
            media: 'media',
            medias: 'media',
            gallery: 'media',
            galerie: 'media',
            enseignant: 'teacher',
            enseignants: 'teacher',
            teacher: 'teacher',
            teachers: 'teacher',
            staff: 'teacher',
            palmares: 'palmares',
            'graduation-list': 'palmares',
            'graduation-lists': 'palmares',
            diplome: 'publication',
            diplomes: 'publication',
            evenement: 'event',
            evenements: 'event',
            event: 'event',
            events: 'event',
            page: 'page',
            pages: 'page'
        };

        return map[value] || value || 'news';
    }

    function typeFromPath(path) {
        var match = String(path || '').replace(/\\/g, '/').match(/\/(actualites?|news|publications?|documents|frais|fees|medias?|gallery|galerie|enseignants?|teachers|palmares|graduation-lists|diplomes|evenements?|events|pages?)\/([^/?#]+)/i);
        return match ? match[1] : '';
    }

    function slugFromPath(path) {
        var match = String(path || '').replace(/\\/g, '/').match(/\/([^/?#]+?)(?:\.html)?$/);
        return match ? decodeURIComponent(match[1].replace(/\.html$/i, '')) : '';
    }

    function dateLabel(value) {
        if (!value) return '';
        var date = new Date(value);
        if (isNaN(date.getTime())) return plain(value);
        return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: '2-digit' });
    }

    function status(message, isError) {
        var el = $('[data-detail-status]');
        if (!el) return;
        el.hidden = !message;
        el.textContent = message || '';
        el.style.color = isError ? '#b42318' : '';
    }

    function endpoint() {
        var config = configs[type] || configs.news;
        return apiBase + '/' + config.endpoint + '/' + encodeURIComponent(slug);
    }

    function appendTextBlocks(container, text) {
        container.innerHTML = '';
        var value = plain(text);
        if (!value) {
            value = 'Details non encore completes depuis l administration.';
        }

        String(value).split(/\n{2,}|\r\n\r\n/).forEach(function (part) {
            var clean = plain(part);
            if (!clean) return;
            var p = document.createElement('p');
            p.textContent = clean;
            container.appendChild(p);
        });
    }

    function fileIsImage(url) {
        return /\.(png|jpe?g|webp|gif)($|\?)/i.test(url || '');
    }

    function valueName(value) {
        if (!value) return '';
        if (typeof value === 'string') return value;
        return plain(value.name || value.title || value.label || value.code || value.year);
    }

    function addFact(items, label, value) {
        value = valueName(value);
        if (value) items.push([label, value]);
    }

    function renderFacts(item) {
        var facts = $('[data-detail-facts]');
        if (!facts) return;
        var config = configs[type] || configs.news;
        var rows = [];
        addFact(rows, 'Type', plain(item.type || item.category || item.collection || item.role, config.label));
        addFact(rows, 'Date', dateLabel(item.published_at || item.starts_at || item.decision_date || item.issued_at || item.created_at));
        addFact(rows, 'Cycle', item.cycle);
        addFact(rows, 'Annee', item.academic_year);
        addFact(rows, 'Section', item.section);
        addFact(rows, 'Filiere', item.program);
        addFact(rows, 'Promotion', item.promotion);
        addFact(rows, 'Departement', item.department);
        addFact(rows, 'Laureats', item.graduates_count !== undefined && item.graduates_count !== null ? String(item.graduates_count) : '');

        facts.innerHTML = '';
        rows.slice(0, 10).forEach(function (row) {
            var group = document.createElement('div');
            var dt = document.createElement('dt');
            var dd = document.createElement('dd');
            dt.textContent = row[0];
            dd.textContent = row[1];
            group.appendChild(dt);
            group.appendChild(dd);
            facts.appendChild(group);
        });
        facts.hidden = !rows.length;
    }

    function renderGraduates(item) {
        var wrap = $('[data-detail-table]');
        if (!wrap) return;
        var graduates = Array.isArray(item.graduates) ? item.graduates : [];
        wrap.innerHTML = '';
        wrap.hidden = !graduates.length;
        if (!graduates.length) return;

        var table = document.createElement('table');
        table.className = 'detail-table';
        table.innerHTML = '<thead><tr><th>Matricule</th><th>Nom</th><th>Postnom</th><th>Prenom</th><th>Pourcentage</th><th>Mention</th></tr></thead>';
        var tbody = document.createElement('tbody');
        graduates.forEach(function (graduate) {
            var tr = document.createElement('tr');
            ['matricule', 'last_name', 'post_name', 'first_name', 'percentage', 'mention'].forEach(function (key) {
                var td = document.createElement('td');
                td.textContent = plain(graduate[key], '-');
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        wrap.appendChild(table);
    }

    function addAction(actions, href, label, secondary) {
        if (!href) return;
        var a = document.createElement('a');
        a.className = 'btn' + (secondary ? ' secondary' : '');
        a.href = href;
        a.textContent = label;
        if (/^https?:\/\//i.test(href)) {
            a.target = '_blank';
            a.rel = 'noopener';
        }
        actions.appendChild(a);
    }

    function renderActions(item) {
        var actions = $('[data-detail-actions]');
        if (!actions) return;
        var config = configs[type] || configs.news;
        actions.innerHTML = '';

        addAction(actions, item.file_url, 'Telecharger le fichier', false);
        if (type === 'media') addAction(actions, item.url || item.path, 'Ouvrir le media', false);
        addAction(actions, item.link_url, plain(item.link_label, 'Ouvrir le lien'), false);
        addAction(actions, item.email ? 'mailto:' + item.email : '', 'Ecrire', false);
        addAction(actions, item.phone ? 'tel:' + item.phone : '', 'Appeler', false);
        addAction(actions, config.back, config.backLabel, true);
    }

    function render(item) {
        item = item || {};
        var article = $('[data-detail]');
        var media = $('[data-detail-media]');
        var title = $('[data-detail-title]');
        var meta = $('[data-detail-meta]');
        var excerpt = $('[data-detail-excerpt]');
        var content = $('[data-detail-content]');
        var config = configs[type] || configs.news;
        var image = item.image_url || (fileIsImage(item.file_url) ? item.file_url : '') || (fileIsImage(item.url) ? item.url : '');
        var displayTitle = plain(item.title || item.name || item.caption, 'Contenu ISC-KINDU');
        var short = plain(item.excerpt || item.summary || item.description || item.caption || item.biography);

        document.title = displayTitle + ' - ISC-KINDU';
        if (title) title.textContent = displayTitle;
        if (meta) meta.textContent = [plain(item.category || item.type || item.collection || item.role, config.label), dateLabel(item.published_at || item.starts_at || item.decision_date || item.created_at)].filter(Boolean).join(' - ');

        if (excerpt) {
            excerpt.hidden = !short;
            excerpt.textContent = short;
        }

        if (content) appendTextBlocks(content, item.body || item.description || item.biography || item.caption || item.excerpt || item.summary || '');

        if (media) {
            media.hidden = !image;
            if (image) media.style.backgroundImage = 'url("' + image + '")';
        }

        renderFacts(item);
        renderGraduates(item);
        renderActions(item);

        if (article) article.hidden = false;
        status('', false);
    }

    if (!slug) {
        status('Contenu introuvable. Revenez a la page d accueil et choisissez un element.', true);
        return;
    }

    fetch(endpoint(), {
        headers: { Accept: 'application/json' },
        credentials: 'omit'
    }).then(function (response) {
        return response.json().catch(function () { return {}; }).then(function (payload) {
            if (!response.ok) throw new Error(payload.message || 'Contenu introuvable.');
            return payload && Object.prototype.hasOwnProperty.call(payload, 'data') ? payload.data : payload;
        });
    }).then(render).catch(function (error) {
        status(error.message || 'Impossible de charger ce contenu.', true);
    });
})();
