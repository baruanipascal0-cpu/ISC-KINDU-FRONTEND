(function () {
    'use strict';

    var apiBase = (window.ISC_API_BASE || 'https://isc-kindu-backend.onrender.com/api').replace(/\/+$/, '');
    var params = new URLSearchParams(window.location.search || '');
    var type = (params.get('type') || 'news').toLowerCase();
    var slug = params.get('slug') || '';

    function $(selector) {
        return document.querySelector(selector);
    }

    function plain(value, fallback) {
        if (value === null || value === undefined || value === '') return fallback || '';
        return String(value).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
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
        var collection = type === 'publication' || type === 'publications' ? 'publications' : 'news';
        return apiBase + '/' + collection + '/' + encodeURIComponent(slug);
    }

    function appendTextBlocks(container, text) {
        container.innerHTML = '';
        String(text || '').split(/\n{2,}|\r\n\r\n/).forEach(function (part) {
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

    function render(item) {
        item = item || {};
        var article = $('[data-detail]');
        var media = $('[data-detail-media]');
        var title = $('[data-detail-title]');
        var meta = $('[data-detail-meta]');
        var excerpt = $('[data-detail-excerpt]');
        var content = $('[data-detail-content]');
        var actions = $('[data-detail-actions]');
        var image = item.image_url || (fileIsImage(item.file_url) ? item.file_url : '');

        document.title = plain(item.title || item.name, 'Publication') + ' - ISC-KINDU';
        if (title) title.textContent = plain(item.title || item.name, 'Publication ISC-KINDU');
        if (meta) meta.textContent = [plain(type === 'news' ? item.category : item.type, type === 'news' ? 'Actualite' : 'Publication'), dateLabel(item.published_at || item.created_at)].filter(Boolean).join(' - ');

        var short = plain(item.excerpt || item.summary);
        if (excerpt) {
            excerpt.hidden = !short;
            excerpt.textContent = short;
        }

        if (content) appendTextBlocks(content, item.body || item.description || item.excerpt || item.summary || '');

        if (media) {
            media.hidden = !image;
            if (image) media.style.backgroundImage = 'url("' + image + '")';
        }

        if (actions) {
            actions.innerHTML = '';
            if (item.file_url) {
                var file = document.createElement('a');
                file.className = 'btn';
                file.href = item.file_url;
                file.target = '_blank';
                file.rel = 'noopener';
                file.textContent = 'Ouvrir le fichier';
                actions.appendChild(file);
            }
            var back = document.createElement('a');
            back.className = 'btn secondary';
            back.href = 'index.html';
            back.textContent = 'Retour aux infos';
            actions.appendChild(back);
        }

        if (article) article.hidden = false;
        status('', false);
    }

    if (!slug) {
        status('Publication introuvable. Revenez a la page d accueil et choisissez une information.', true);
        return;
    }

    fetch(endpoint(), {
        headers: { Accept: 'application/json' },
        credentials: 'omit'
    }).then(function (response) {
        return response.json().catch(function () { return {}; }).then(function (payload) {
            if (!response.ok) throw new Error(payload.message || 'Publication introuvable.');
            return payload && Object.prototype.hasOwnProperty.call(payload, 'data') ? payload.data : payload;
        });
    }).then(render).catch(function (error) {
        status(error.message || 'Impossible de charger cette publication.', true);
    });
})();
