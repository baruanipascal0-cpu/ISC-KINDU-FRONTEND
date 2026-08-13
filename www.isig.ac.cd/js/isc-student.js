(function () {
    'use strict';

    var apiBase = (window.ISC_API_BASE || 'https://isc-kindu-backend.onrender.com/api').replace(/\/+$/, '');
    var tokenKey = 'isc_student_token';
    var userKey = 'isc_student_user';
    var state = {
        dashboard: null,
        payments: [],
        documents: [],
        comments: [],
        notifications: []
    };

    function $(selector, root) {
        return (root || document).querySelector(selector);
    }

    function clear(node) {
        if (!node) return;
        while (node.firstChild) node.removeChild(node.firstChild);
    }

    function create(tag, className, text) {
        var el = document.createElement(tag);
        if (className) el.className = className;
        if (text !== undefined && text !== null) el.textContent = String(text);
        return el;
    }

    function plain(value, fallback) {
        if (value === null || value === undefined || value === '') return fallback || 'A completer';
        if (typeof value === 'object') {
            return plain(value.name || value.title || value.label || value.code || value.slug || value.id, fallback);
        }
        return String(value);
    }

    function objectName(object, fallback) {
        return plain(object && (object.name || object.title || object.label || object.code), fallback);
    }

    function formatDate(value) {
        if (!value) return 'A completer';
        var date = new Date(value);
        if (Number.isNaN(date.getTime())) return plain(value);
        return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: '2-digit' });
    }

    function amount(payment) {
        var total = Number(payment && payment.amount) || 0;
        var paid = Number(payment && payment.paid_amount) || 0;
        var currency = plain(payment && payment.currency, 'CDF');
        if (paid > 0 && paid < total) return paid.toLocaleString('fr-FR') + ' / ' + total.toLocaleString('fr-FR') + ' ' + currency;
        return total.toLocaleString('fr-FR') + ' ' + currency;
    }

    function statusText(status) {
        var map = {
            active: 'Actif',
            available: 'Disponible',
            completed: 'Complete',
            confirmed: 'Confirme',
            draft: 'Brouillon',
            needs_correction: 'A corriger',
            open: 'Ouvert',
            paid: 'Paye',
            pending: 'En attente',
            rejected: 'Rejete',
            reviewed: 'Verifie',
            submitted: 'Envoye',
            validated: 'Valide'
        };
        return map[status] || plain(status, 'A completer');
    }

    function badgeClass(status) {
        if (/paid|active|available|validated|confirmed|complete/i.test(status || '')) return 'badge is-success';
        if (/reject|error|failed|cancel/i.test(status || '')) return 'badge is-danger';
        if (/pending|draft|correction|submitted|open/i.test(status || '')) return 'badge is-warning';
        return 'badge';
    }

    function notice(text, isError) {
        var box = $('[data-student-notice]');
        if (!box) return;
        box.hidden = !text;
        box.classList.toggle('is-error', !!isError);
        box.textContent = text || '';
    }

    function token() {
        try {
            return window.localStorage.getItem(tokenKey);
        } catch (error) {
            return '';
        }
    }

    function logout() {
        try {
            window.localStorage.removeItem(tokenKey);
            window.localStorage.removeItem(userKey);
        } catch (error) {}
        window.location.href = 'login.html';
    }

    function apiUrl(path) {
        return apiBase + '/' + String(path || '').replace(/^\/+/, '');
    }

    function unwrap(payload) {
        if (payload && typeof payload === 'object' && Object.prototype.hasOwnProperty.call(payload, 'data')) {
            return payload.data;
        }
        return payload;
    }

    function api(path, options) {
        var authToken = token();
        if (!authToken) {
            notice('Votre session etudiant est fermee. Connectez-vous de nouveau.', true);
            window.setTimeout(logout, 900);
            return Promise.reject(new Error('Session absente'));
        }

        options = options || {};
        options.headers = options.headers || {};
        options.headers.Accept = 'application/json';
        options.headers.Authorization = 'Bearer ' + authToken;
        options.credentials = 'omit';

        return fetch(apiUrl(path), options).then(function (response) {
            return response.json().catch(function () {
                return {};
            }).then(function (payload) {
                if (response.status === 401 || response.status === 419) {
                    logout();
                    throw new Error('Session expiree');
                }
                if (!response.ok) {
                    var error = new Error(payload.message || 'La demande n a pas ete acceptee.');
                    error.payload = payload;
                    throw error;
                }
                return unwrap(payload);
            });
        });
    }

    function errorMessage(error) {
        var payload = error && error.payload;
        if (payload && payload.errors) {
            var messages = [];
            Object.keys(payload.errors).forEach(function (key) {
                if (Array.isArray(payload.errors[key])) messages = messages.concat(payload.errors[key]);
            });
            if (messages.length) return messages.join(' ');
        }
        if (error && /failed to fetch|networkerror|load failed/i.test(error.message || '')) {
            return 'Impossible de joindre le serveur ISC Kindu. Verifiez votre connexion puis rechargez la page.';
        }
        return (payload && payload.message) || (error && error.message) || 'Operation impossible pour le moment.';
    }

    function setText(selector, value, fallback) {
        var el = $(selector);
        if (el) el.textContent = plain(value, fallback);
    }

    function addFact(container, label, value) {
        var item = create('div', 'fact');
        item.appendChild(create('span', '', label));
        item.appendChild(create('strong', '', plain(value)));
        container.appendChild(item);
    }

    function renderIdentity(data) {
        var student = data.student || {};
        setText('[data-student-name]', student.name, 'Bienvenue');
        setText('[data-identity-name]', student.name, 'Etudiant ISC-KINDU');
        setText('[data-identity-matricule]', student.matricule, 'Matricule a completer');
        setText('[data-identity-email]', student.email || student.phone, '');

        var summary = data.summary || {};
        setText('[data-summary-payments]', summary.payments_pending || 0, '0');
        setText('[data-summary-documents]', summary.documents_available || 0, '0');
        setText('[data-summary-comments]', summary.comments_open || 0, '0');
    }

    function renderAcademicFacts(data) {
        var target = $('[data-academic-facts]');
        if (!target) return;
        clear(target);

        var student = data.student || {};
        var application = data.application || {};
        var enrollment = data.enrollment || {};

        addFact(target, 'Matricule', student.matricule);
        addFact(target, 'Email', student.email);
        addFact(target, 'Telephone', student.phone);
        addFact(target, 'Dossier inscription', application.application_number || application.id);
        addFact(target, 'Statut inscription', statusText(application.status));
        addFact(target, 'Annee academique', objectName(enrollment.academic_year || enrollment.academicYear || application.academic_year || application.academicYear));
        addFact(target, 'Section', objectName(enrollment.section || application.section));
        addFact(target, 'Filiere', objectName(enrollment.program || application.program));
        addFact(target, 'Promotion', objectName(enrollment.promotion || application.promotion));
        addFact(target, 'Niveau', objectName(enrollment.level || enrollment.academic_level || application.academicLevel || application.academic_level));
    }

    function emptyRow(target, text) {
        clear(target);
        target.appendChild(create('p', 'empty', text));
    }

    function row(title, meta, status) {
        var item = create('article', 'row');
        var top = create('div', 'row__top');
        var left = create('div');
        left.appendChild(create('h3', 'row__title', title));
        if (meta) left.appendChild(create('p', 'row__meta', meta));
        top.appendChild(left);
        if (status) top.appendChild(create('span', badgeClass(status), statusText(status)));
        item.appendChild(top);
        return item;
    }

    function renderPayments(list) {
        var target = $('[data-payments-list]');
        if (!target) return;
        if (!list || !list.length) return emptyRow(target, 'Aucun paiement publie pour le moment.');
        clear(target);

        list.forEach(function (payment) {
            var item = row(
                plain(payment.label, 'Paiement'),
                plain(payment.reference, 'Reference a completer') + ' - ' + amount(payment) + ' - Echeance: ' + formatDate(payment.due_date),
                payment.status
            );

            if (!/paid|confirmed|validated/i.test(payment.status || '')) {
                var form = create('form', 'proof-form');
                form.setAttribute('data-payment-proof', plain(payment.id, ''));
                var file = create('input');
                file.type = 'file';
                file.name = 'proof_file';
                file.accept = '.pdf,.jpg,.jpeg,.png';
                var button = create('button', 'btn btn--primary', 'Envoyer preuve');
                button.type = 'submit';
                form.appendChild(file);
                form.appendChild(button);
                item.appendChild(form);
            }

            if (payment.proof_url) {
                var proof = create('a', 'btn', 'Ouvrir preuve');
                proof.href = payment.proof_url;
                proof.target = '_blank';
                proof.rel = 'noopener';
                item.appendChild(proof);
            }

            var receipts = Array.isArray(payment.receipts) ? payment.receipts : [];
            receipts.forEach(function (receipt) {
                if (!receipt.file_url) return;
                var link = create('a', 'btn btn--primary', 'Ouvrir recu');
                link.href = receipt.file_url;
                link.target = '_blank';
                link.rel = 'noopener';
                item.appendChild(link);
            });

            target.appendChild(item);
        });
    }

    function renderDocuments(list) {
        var target = $('[data-documents-list]');
        if (!target) return;
        if (!list || !list.length) return emptyRow(target, 'Aucun document publie pour le moment.');
        clear(target);

        list.forEach(function (documentItem) {
            var item = row(
                plain(documentItem.name, 'Document'),
                plain(documentItem.type, 'document') + ' - ' + formatDate(documentItem.issued_at),
                documentItem.status
            );
            if (documentItem.file_url) {
                var link = create('a', 'btn', 'Ouvrir');
                link.href = documentItem.file_url;
                link.target = '_blank';
                link.rel = 'noopener';
                item.appendChild(link);
            }
            target.appendChild(item);
        });
    }

    function findRegistrationSheet(data) {
        if (data && data.registration_sheet && data.registration_sheet.file_url) return data.registration_sheet;

        var enrollment = data && data.enrollment;
        if (enrollment && enrollment.fiche_url) {
            return {
                name: 'Fiche d inscription',
                type: 'fiche-inscription',
                status: enrollment.status || 'available',
                issued_at: enrollment.enrolled_on,
                file_url: enrollment.fiche_url
            };
        }

        var documents = data && data.documents;
        if (!Array.isArray(documents)) return null;
        for (var i = 0; i < documents.length; i += 1) {
            var documentItem = documents[i];
            var type = plain(documentItem && documentItem.type, '').toLowerCase();
            var name = plain(documentItem && documentItem.name, '').toLowerCase();
            if (documentItem && documentItem.file_url && (type.indexOf('fiche-inscription') !== -1 || name.indexOf('fiche') !== -1)) {
                return documentItem;
            }
        }
        return null;
    }

    function renderRegistrationSheet(data) {
        var target = $('[data-registration-sheet]');
        if (!target) return;
        clear(target);

        var sheet = findRegistrationSheet(data || {});
        if (!sheet) {
            target.appendChild(create('p', 'empty', 'La fiche d inscription sera disponible ici apres validation du dossier par l administration.'));
            return;
        }

        var card = create('article', 'sheet-card');
        card.appendChild(create('h3', '', plain(sheet.name, 'Fiche d inscription')));
        card.appendChild(create('p', '', 'Document officiel genere apres validation de votre inscription. Statut : ' + statusText(sheet.status) + '.'));

        var actions = create('div', 'sheet-card__actions');
        var open = create('a', 'btn btn--primary', 'Ouvrir la fiche');
        open.href = sheet.file_url;
        open.target = '_blank';
        open.rel = 'noopener';
        actions.appendChild(open);

        var print = create('a', 'btn', 'Imprimer');
        print.href = sheet.file_url;
        print.target = '_blank';
        print.rel = 'noopener';
        actions.appendChild(print);

        card.appendChild(actions);
        target.appendChild(card);
    }

    function renderComments(list) {
        var target = $('[data-comments-list]');
        if (!target) return;
        if (!list || !list.length) return emptyRow(target, 'Aucun commentaire envoye.');
        clear(target);

        list.forEach(function (comment) {
            var item = row(plain(comment.subject, 'Commentaire'), plain(comment.message, ''), comment.status);
            if (comment.response) item.appendChild(create('p', 'row__meta', 'Reponse: ' + plain(comment.response, '')));
            target.appendChild(item);
        });
    }

    function renderNotifications(list) {
        var target = $('[data-notifications-list]');
        if (!target) return;
        if (!list || !list.length) return emptyRow(target, 'Aucune notification.');
        clear(target);

        list.forEach(function (notification) {
            target.appendChild(row(
                plain(notification.title, 'Notification'),
                plain(notification.message, '') + ' - ' + formatDate(notification.created_at),
                notification.read_at ? 'reviewed' : notification.type
            ));
        });
    }

    function render(data) {
        data = data || {};
        state.dashboard = data;
        state.payments = data.payments || [];
        state.documents = data.documents || [];
        state.comments = data.comments || [];
        state.notifications = data.notifications || [];

        renderIdentity(state.dashboard);
        renderAcademicFacts(state.dashboard);
        renderRegistrationSheet(state.dashboard);
        renderPayments(state.payments);
        renderDocuments(state.documents);
        renderComments(state.comments);
        renderNotifications(state.notifications);
    }

    function loadDashboard() {
        notice('Chargement de votre espace etudiant', false);
        return api('/student/dashboard')
            .then(function (data) {
                render(data || {});
                notice('', false);
            })
            .catch(function (error) {
                notice(errorMessage(error), true);
            });
    }

    function setFormMessage(selector, text, isError) {
        var el = $(selector);
        if (!el) return;
        el.textContent = text || '';
        el.classList.toggle('is-error', !!isError);
    }

    function bindDocumentForm() {
        var form = $('[data-document-form]');
        if (!form) return;
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var submit = form.querySelector('[type="submit"]');
            if (submit) submit.disabled = true;
            setFormMessage('[data-document-message]', 'Envoi en cours...', false);

            api('/student/documents', {
                method: 'POST',
                body: new FormData(form)
            }).then(function () {
                form.reset();
                setFormMessage('[data-document-message]', 'Document envoye.', false);
                return loadDashboard();
            }).catch(function (error) {
                setFormMessage('[data-document-message]', errorMessage(error), true);
            }).then(function () {
                if (submit) submit.disabled = false;
            });
        });
    }

    function bindCommentForm() {
        var form = $('[data-comment-form]');
        if (!form) return;
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var submit = form.querySelector('[type="submit"]');
            if (submit) submit.disabled = true;
            setFormMessage('[data-comment-message]', 'Envoi en cours...', false);

            api('/student/comments', {
                method: 'POST',
                body: new FormData(form)
            }).then(function () {
                form.reset();
                setFormMessage('[data-comment-message]', 'Commentaire envoye.', false);
                return loadDashboard();
            }).catch(function (error) {
                setFormMessage('[data-comment-message]', errorMessage(error), true);
            }).then(function () {
                if (submit) submit.disabled = false;
            });
        });
    }

    function bindPaymentProofs() {
        document.addEventListener('submit', function (event) {
            var form = event.target.closest('[data-payment-proof]');
            if (!form) return;
            event.preventDefault();

            var paymentId = form.getAttribute('data-payment-proof');
            var submit = form.querySelector('[type="submit"]');
            var data = new FormData(form);
            data.append('payment_id', paymentId);
            if (submit) submit.disabled = true;
            notice('Envoi de la preuve de paiement...', false);

            api('/student/payments/proof', {
                method: 'POST',
                body: data
            }).then(function () {
                notice('Preuve de paiement envoyee.', false);
                return loadDashboard();
            }).catch(function (error) {
                notice(errorMessage(error), true);
            }).then(function () {
                if (submit) submit.disabled = false;
            });
        });
    }

    function bindActions() {
        var logoutButton = $('[data-logout]');
        if (logoutButton) logoutButton.addEventListener('click', logout);

        var refreshButton = $('[data-refresh]');
        if (refreshButton) refreshButton.addEventListener('click', loadDashboard);

        bindDocumentForm();
        bindCommentForm();
        bindPaymentProofs();
    }

    bindActions();
    loadDashboard();
})();
