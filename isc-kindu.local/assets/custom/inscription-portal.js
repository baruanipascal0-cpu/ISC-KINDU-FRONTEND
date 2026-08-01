(function () {
  var config = window.ISC_BACKEND_API || {};
  var apiBase = config.baseUrl || "/api";
  var tokenKey = "isc_kindu_student_token";
  var userKey = "isc_kindu_student_user";
  var routeRequestId = 0;
  var screenAliases = {
    compte: "register",
    register: "register",
    connexion: "login",
    login: "login",
    dossier: "application",
    application: "application",
    portefeuille: "wallet",
    wallet: "wallet",
    accueil: "welcome",
    welcome: "welcome"
  };

  if (redirectLegacyPortalPage()) return;

  bindPortalLinks();
  bindPortalForms();
  bindLogout();
  prepareAdmissionSelects();
  hydrateAdmissionBlocks();

  var requestedScreen = screenFromHash();
  if (requestedScreen === "application" || requestedScreen === "wallet") {
    routeStudent(false);
  } else if (requestedScreen) {
    showScreen(requestedScreen, false);
  } else if (readToken()) {
    routeStudent(false);
  } else {
    showScreen("welcome", false);
  }

  window.addEventListener("hashchange", function () {
    var screen = screenFromHash();
    if (!screen) return;
    if (screen === "application" || screen === "wallet") {
      routeStudent(false);
    } else {
      showScreen(screen, false);
    }
  });

  function redirectLegacyPortalPage() {
    if (document.querySelector("[data-portal-screen]")) return false;

    var path = window.location.pathname.toLowerCase().replace(/\\/g, "/");
    var target = "";
    if (path.indexOf("/oipr/register.html") !== -1) target = "../inscriptions.html#compte";
    if (path.indexOf("/oipr/login.html") !== -1) target = "../inscriptions.html#connexion";
    if (path.indexOf("/oipr/dossier.html") !== -1) target = "../inscriptions.html#dossier";
    if (path.indexOf("/oipr/etudiant.html") !== -1) target = "../inscriptions.html#portefeuille";

    if (!target) return false;
    window.location.replace(target);
    return true;
  }

  function bindPortalLinks() {
    document.querySelectorAll("[data-portal-go]").forEach(function (link) {
      link.addEventListener("click", function (event) {
        event.preventDefault();
        var target = screenAliases[link.getAttribute("data-portal-go")] || "welcome";
        if (target === "application" || target === "wallet") {
          routeStudent(true);
          return;
        }
        showScreen(target, true);
      });
    });
  }

  function bindPortalForms() {
    var registerForm = document.querySelector('[data-portal-form="register"]');
    var loginForm = document.querySelector('[data-portal-form="login"]');
    var applicationForm = document.querySelector('[data-portal-form="application"]');
    var commentForm = document.querySelector('[data-portal-form="comment"]');

    if (registerForm) registerForm.addEventListener("submit", submitRegister);
    if (loginForm) loginForm.addEventListener("submit", submitLogin);
    if (applicationForm) applicationForm.addEventListener("submit", submitApplication);
    if (commentForm) commentForm.addEventListener("submit", submitComment);
  }

  function bindLogout() {
    document.querySelectorAll("[data-portal-logout]").forEach(function (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        var token = readToken();
        if (token) {
          api("/auth/logout", { method: "POST", auth: true }).catch(function () {});
        }
        localStorage.removeItem(tokenKey);
        localStorage.removeItem(userKey);
        showScreen("welcome", true);
      });
    });
  }

  function submitRegister(event) {
    event.preventDefault();
    var form = event.currentTarget;
    setStatus(form, "Creation du compte en cours...");

    api("/auth/register", { method: "POST", body: new FormData(form) })
      .then(function (payload) {
        var data = payload.data || {};
        localStorage.removeItem(tokenKey);
        localStorage.setItem(userKey, JSON.stringify(data.user || {}));
        var loginInput = document.querySelector('[data-login-input]');
        if (loginInput && data.user && data.user.email) loginInput.value = data.user.email;
        setStatus(form, payload.message || "Compte cree. Connectez-vous maintenant.", "success");
        showScreen("login", true);
      })
      .catch(function (error) {
        if (error && error.status === 409 && error.data && error.data.next_step === "login") {
          var existingUser = error.data.user || {};
          var loginInput = document.querySelector('[data-login-input]');
          if (loginInput && existingUser.email) loginInput.value = existingUser.email;
          setStatus(form, errorMessage(error), "success");
          showScreen("login", true);
          return;
        }
        setStatus(form, errorMessage(error), "error");
      });
  }

  function submitLogin(event) {
    event.preventDefault();
    var form = event.currentTarget;
    setStatus(form, "Connexion en cours...");

    api("/auth/login", { method: "POST", body: new FormData(form) })
      .then(function (payload) {
        var data = payload.data || {};
        if (data.token) localStorage.setItem(tokenKey, data.token);
        if (data.user) localStorage.setItem(userKey, JSON.stringify(data.user));
        setStatus(form, payload.message || "Connexion reussie.", "success");
        routeStudent(true);
      })
      .catch(function (error) {
        setStatus(form, errorMessage(error), "error");
      });
  }

  function submitApplication(event) {
    event.preventDefault();
    var form = event.currentTarget;
    if (!readToken()) {
      showScreen("login", true);
      return;
    }

    setStatus(form, "Verification du dossier...");
    api("/inscriptions/current", { auth: true })
      .then(function (payload) {
        var existing = payload.data && payload.data.application;
        if (existing) {
          if (!isEditableApplication(existing.status)) {
            setStatus(form, "Votre inscription existe deja. Ouverture du portefeuille.", "success");
            showScreen("wallet", true);
            return null;
          }

          setStatus(form, "Renvoi du dossier corrige a l institution...");
          return api("/inscriptions/current", { method: "PATCH", auth: true, body: new FormData(form) });
        }

        setStatus(form, "Envoi du dossier a l institution...");
        return api("/inscriptions", { method: "POST", auth: true, body: new FormData(form) });
      })
      .then(function (payload) {
        if (!payload) return;
        setStatus(form, payload.message || "Dossier envoye.", "success");
        showScreen("wallet", true);
      })
      .catch(function (error) {
        if (error && error.status === 409) {
          setStatus(form, errorMessage(error), "success");
          var nextStep = error.data && error.data.next_step;
          showScreen(nextStep === "admission_form" ? "application" : "wallet", true);
          return;
        }
        setStatus(form, errorMessage(error), "error");
      });
  }

  function submitComment(event) {
    event.preventDefault();
    var form = event.currentTarget;
    var formData = new FormData(form);
    if (!formData.get("subject")) formData.append("subject", "Commentaire etudiant");
    setStatus(form, "Envoi du commentaire...");

    api("/student/comments", { method: "POST", auth: true, body: formData })
      .then(function (payload) {
        form.reset();
        setStatus(form, payload.message || "Commentaire envoye.", "success");
        hydrateWallet();
      })
      .catch(function (error) {
        setStatus(form, errorMessage(error), "error");
      });
  }

  function routeStudent(updateHash) {
    if (!readToken()) {
      showScreen("login", updateHash);
      return;
    }

    var requestId = ++routeRequestId;

    api("/inscriptions/current", { auth: true })
      .then(function (payload) {
        if (requestId !== routeRequestId) return;
        var application = payload.data && payload.data.application;
        if (application) {
          showScreen(isEditableApplication(application.status) ? "application" : "wallet", updateHash);
        } else {
          showScreen("application", updateHash);
        }
      })
      .catch(function () {
        if (requestId !== routeRequestId) return;
        localStorage.removeItem(tokenKey);
        showScreen("login", updateHash);
      });
  }

  function showScreen(name, updateHash) {
    var screen = screenAliases[name] || "welcome";
    if (screen !== "application" && screen !== "wallet") routeRequestId++;
    document.querySelectorAll("[data-portal-screen]").forEach(function (section) {
      section.classList.toggle("active", section.getAttribute("data-portal-screen") === screen);
    });
    document.querySelectorAll("[data-portal-nav]").forEach(function (link) {
      link.classList.toggle("active", link.getAttribute("data-portal-nav") === screen);
    });

    if (screen === "application") {
      fillStudentFields();
      prepareAdmissionSelects();
    }
    if (screen === "wallet") hydrateWallet();

    if (updateHash !== false) {
      var hashMap = {
        welcome: "accueil",
        register: "compte",
        login: "connexion",
        application: "dossier",
        wallet: "portefeuille"
      };
      var hash = hashMap[screen] || "accueil";
      if (window.location.hash !== "#" + hash) {
        window.history.pushState(null, "", "#" + hash);
      }
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function hydrateWallet() {
    var token = readToken();
    if (!token) {
      showScreen("login", true);
      return;
    }

    var status = document.querySelector("[data-wallet-status]");
    if (status) status.textContent = "Chargement du portefeuille...";

    api("/student/dashboard", { auth: true })
      .then(function (payload) {
        var data = payload.data || {};
        if (!data.application) {
          showScreen("application", true);
          return;
        }

        fillText("[data-wallet-name]", data.student && data.student.name);
        fillText("[data-wallet-email]", data.student && data.student.email);
        fillText("[data-wallet-application-number]", data.application.application_number || "non envoye");
        fillText("[data-wallet-application-status]", statusLabel(data.application.status));
        fillText("[data-wallet-section]", data.application.section ? data.application.section.name : "");
        fillText("[data-wallet-program]", data.application.program ? data.application.program.name : "");
        fillText("[data-wallet-matricule]", data.student && data.student.matricule);
        fillText("[data-wallet-enrollment]", data.enrollment && data.enrollment.enrollment_number);
        fillText("[data-wallet-admin-message]", data.application.student_message || "");
        fillText("[data-wallet-payments-count]", data.summary ? data.summary.payments_pending : 0);
        fillText("[data-wallet-documents-count]", data.summary ? data.summary.documents_available : 0);
        fillText("[data-wallet-comments-count]", data.summary ? data.summary.comments_open : 0);
        renderList("[data-wallet-payments]", data.payments || [], paymentItem, "Aucun paiement publie.");
        renderList("[data-wallet-documents]", data.documents || [], documentItem, "Aucun document publie.");
        renderList("[data-wallet-comments]", data.comments || [], commentItem, "Aucun commentaire.");
        renderList("[data-wallet-notifications]", data.notifications || [], notificationItem, "Aucun message administratif.");
        if (status) status.textContent = "Portefeuille etudiant a jour.";
      })
      .catch(function (error) {
        if (status) status.textContent = errorMessage(error);
      });
  }

  function hydrateAdmissionBlocks() {
    Promise.allSettled([
      api("/site/blocks/admission_step"),
      api("/site/blocks/admission_intro")
    ]).then(function (results) {
      var steps = settled(results[0], []);
      var cards = settled(results[1], []);
      renderBlockCards("[data-admission-steps]", steps, "stat");
      renderBlockCards("[data-admission-info-cards]", cards, "info");
    }).catch(function () {});
  }

  function renderBlockCards(selector, items, type) {
    var root = document.querySelector(selector);
    if (!root || !items || !items.length) return;

    root.innerHTML = items.map(function (item) {
      var icon = item.icon || "fas fa-circle";
      if (type === "stat") {
        return '<div class="col-md-3"><div class="stat-card"><i class="' + escapeAttr(icon) + ' fa-2x"></i><h3 class="h5 fw-bold">' + escapeHtml(item.title || "Information") + '</h3><p class="mb-0">' + escapeHtml(item.summary || "") + '</p></div></div>';
      }
      return '<div class="col-md-4"><div class="card h-100"><div class="card-body p-4"><h5 class="card-title"><i class="' + escapeAttr(icon) + ' me-2 text-primary"></i>' + escapeHtml(item.title || "Information") + '</h5><p>' + escapeHtml(item.summary || item.body || "") + '</p></div></div></div>';
    }).join("");
  }

  function prepareAdmissionSelects() {
    var sectionSelects = Array.from(document.querySelectorAll("[data-section-select]"));
    var programSelects = Array.from(document.querySelectorAll("[data-program-select]"));
    if (!sectionSelects.length || !programSelects.length) return;

    api("/sections")
      .then(function (payload) {
        var sections = payload.data || payload || [];
        sectionSelects.forEach(function (sectionSelect) {
          sectionSelect.innerHTML = sections.map(function (section) {
            return '<option value="' + escapeAttr(section.name) + '">' + escapeHtml(section.name) + '</option>';
          }).join("");

          sectionSelect.addEventListener("change", function () {
            refreshPrograms(sectionSelect, sections);
          });
          refreshPrograms(sectionSelect, sections);
        });
      })
      .catch(function () {});
  }

  function refreshPrograms(sectionSelect, sections) {
    var form = sectionSelect.closest("form") || document;
    var programSelect = form.querySelector("[data-program-select]");
    if (!programSelect) return;
    var selected = sections.find(function (section) { return section.name === sectionSelect.value; }) || sections[0];
    programSelect.innerHTML = ((selected && selected.programs) || []).map(function (program) {
      return '<option value="' + escapeAttr(program.name) + '">' + escapeHtml(program.name) + '</option>';
    }).join("");
  }

  function fillStudentFields() {
    var user = readUser();
    if (!user) return;
    setFieldValue("application_first_name", user.first_name);
    setFieldValue("application_last_name", user.last_name);
    setFieldValue("application_email", user.email);
    setFieldValue("application_phone", user.phone);
  }

  function api(path, options) {
    options = options || {};
    var headers = { "Accept": "application/json" };
    var token = readToken();
    var body = options.body || null;

    if (options.auth && token) headers.Authorization = "Bearer " + token;
    if (options.json) {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(options.json);
    }

    return fetch(apiBase + path.replace(/^\/api/, ""), {
      method: options.method || "GET",
      headers: headers,
      body: body
    }).then(function (response) {
      return response.json().catch(function () { return {}; }).then(function (payload) {
        if (!response.ok) {
          payload.status = response.status;
          throw payload;
        }
        return payload;
      });
    });
  }

  function renderList(selector, items, itemRenderer, emptyText) {
    var root = document.querySelector(selector);
    if (!root) return;
    root.innerHTML = items.length ? items.map(itemRenderer).join("") : '<div class="wallet-empty">' + escapeHtml(emptyText) + '</div>';
  }

  function paymentItem(item) {
    return '<div class="wallet-row"><div><strong>' + escapeHtml(item.label || "Paiement") + '</strong><span>' + escapeHtml(item.reference || "") + '</span></div><div><strong>' + escapeHtml(formatAmount(item.amount, item.currency)) + '</strong><span>' + escapeHtml(statusLabel(item.status)) + '</span></div></div>';
  }

  function documentItem(item) {
    var link = item.file_url ? '<a class="wallet-doc-link" href="' + escapeAttr(item.file_url) + '" target="_blank" rel="noopener">Ouvrir</a>' : '';
    return '<div class="wallet-row"><div><strong>' + escapeHtml(item.name || "Document") + '</strong><span>' + escapeHtml(item.type || "") + '</span></div><div><span>' + escapeHtml(statusLabel(item.status)) + '</span>' + link + '</div></div>';
  }

  function commentItem(item) {
    return '<div class="wallet-row wallet-row-stack"><div><strong>' + escapeHtml(item.subject || "Commentaire") + '</strong><span>' + escapeHtml(item.message || "") + '</span></div><div><span>' + escapeHtml(statusLabel(item.status)) + '</span>' + (item.response ? '<span><strong>Reponse:</strong> ' + escapeHtml(item.response) + '</span>' : '') + '</div></div>';
  }

  function notificationItem(item) {
    return '<div class="wallet-row wallet-row-stack"><div><strong>' + escapeHtml(item.title || "Message") + '</strong><span>' + escapeHtml(item.message || "") + '</span></div><div><span>' + escapeHtml(formatDateTime(item.created_at)) + '</span></div></div>';
  }

  function statusLabel(status) {
    var labels = {
      submitted: "envoye",
      under_review: "en examen",
      needs_correction: "correction demandee",
      pending: "en attente",
      approved: "valide",
      rejected: "rejete",
      cancelled: "annule",
      open: "ouvert",
      available: "disponible"
    };
    return labels[status] || status || "a completer";
  }

  function formatAmount(amount, currency) {
    if (amount === null || amount === undefined || amount === "") return "";
    return String(amount) + " " + (currency || "CDF");
  }

  function formatDateTime(value) {
    if (!value) return "";
    var date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" });
  }

  function isEditableApplication(status) {
    return status === "draft" || status === "needs_correction";
  }

  function setStatus(scope, message, type) {
    var status = scope.querySelector("[data-form-status]");
    if (!status) return;
    status.textContent = message;
    status.className = "api-note mt-3" + (type ? " api-note-" + type : "");
  }

  function fillText(selector, value) {
    var element = document.querySelector(selector);
    if (element) element.textContent = value == null || value === "" ? "" : String(value);
  }

  function setFieldValue(id, value) {
    var field = document.getElementById(id);
    if (field && value && !field.value) field.value = value;
  }

  function screenFromHash() {
    var hash = window.location.hash.replace(/^#/, "").toLowerCase();
    return screenAliases[hash] || null;
  }

  function readToken() {
    return localStorage.getItem(tokenKey);
  }

  function readUser() {
    try {
      return JSON.parse(localStorage.getItem(userKey) || "null");
    } catch (error) {
      return null;
    }
  }

  function settled(result, fallback) {
    return result && result.status === "fulfilled" ? (result.value.data || result.value) : fallback;
  }

  function errorMessage(error) {
    if (error && error.errors) {
      return Object.keys(error.errors).map(function (key) {
        return error.errors[key].join(" ");
      }).join(" ");
    }
    return (error && error.message) || "Operation impossible. Verifiez que le backend Laravel est demarre.";
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function escapeAttr(value) {
    return escapeHtml(value);
  }
})();
