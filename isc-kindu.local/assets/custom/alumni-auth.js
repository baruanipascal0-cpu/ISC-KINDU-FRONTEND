(function () {
  var path = window.location.pathname.replace(/\\/g, "/").toLowerCase();
  var isRegister = path.endsWith("/alumni/register.html") || path.endsWith("/register.html");
  var isLogin = path.endsWith("/alumni/login.html") || path.endsWith("/login.html");
  var usersKey = "isc-kindu-alumni-users";
  var sessionKey = "isc-kindu-alumni-session";

  if (!isRegister && !isLogin) return;

  ready(function () {
    enhanceAuthLayout();
    if (isRegister) bindRegister();
    if (isLogin) bindLogin();
  });

  function bindRegister() {
    var form = document.querySelector('form input[name="noms"]')?.closest("form");
    if (!form || form.dataset.alumniAuthReady) return;
    form.dataset.alumniAuthReady = "true";
    form.setAttribute("novalidate", "novalidate");
    ensureStatus(form);

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var data = Object.fromEntries(new FormData(form).entries());
      var status = ensureStatus(form);
      var email = normalize(data.email);
      var password = String(data.password || "");
      var confirmation = String(data.password_confirmation || "");

      if (!data.noms || !email || !data.telephone || !data.sexe || !password) {
        return showStatus(status, "Veuillez completer tous les champs obligatoires.", "danger");
      }

      if (password.length < 8) {
        return showStatus(status, "Le mot de passe doit contenir au moins 8 caracteres.", "danger");
      }

      if (password !== confirmation) {
        return showStatus(status, "Les mots de passe ne correspondent pas.", "danger");
      }

      if (!data.terms) {
        return showStatus(status, "Veuillez accepter les conditions avant de continuer.", "danger");
      }

      var users = readUsers();
      var existingIndex = users.findIndex(function (user) { return normalize(user.email) === email; });
      var user = {
        id: existingIndex >= 0 ? users[existingIndex].id : String(Date.now()),
        names: String(data.noms || "").trim(),
        email: email,
        phone: String(data.telephone || "").trim(),
        gender: String(data.sexe || "").trim(),
        password: password,
        created_at: new Date().toISOString()
      };

      if (existingIndex >= 0) {
        users[existingIndex] = Object.assign({}, users[existingIndex], user);
      } else {
        users.unshift(user);
      }

      saveUsers(users);
      saveSession(user);
      showStatus(status, "Compte alumni cree. Redirection vers l espace alumni...", "success");
      form.reset();
      window.setTimeout(function () {
        window.location.href = "alumni.html";
      }, 900);
    });
  }

  function bindLogin() {
    var form = document.querySelector('form input[name="email"]')?.closest("form");
    if (!form || form.dataset.alumniAuthReady) return;
    form.dataset.alumniAuthReady = "true";
    form.setAttribute("novalidate", "novalidate");
    ensureStatus(form);

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var data = Object.fromEntries(new FormData(form).entries());
      var status = ensureStatus(form);
      var email = normalize(data.email);
      var password = String(data.password || "");
      var user = readUsers().find(function (item) {
        return normalize(item.email) === email && String(item.password || "") === password;
      });

      if (!user) {
        return showStatus(status, "Adresse mail ou mot de passe incorrect.", "danger");
      }

      saveSession(user);
      showStatus(status, "Connexion reussie. Ouverture de l espace alumni...", "success");
      window.setTimeout(function () {
        window.location.href = "alumni.html";
      }, 700);
    });
  }

  function enhanceAuthLayout() {
    document.querySelectorAll(".navbar-logo").forEach(function (logo) {
      logo.style.maxHeight = "86px";
      logo.style.height = "86px";
    });

    var session = readSession();
    if (!session) return;

    document.querySelectorAll('.top-bar-link[href="login.html"], .top-bar-link-register[href="register.html"]').forEach(function (link) {
      link.style.display = "none";
    });

    var nav = document.querySelector(".top-bar-nav");
    if (!nav || nav.querySelector("[data-alumni-session]")) return;

    var item = document.createElement("li");
    item.setAttribute("data-alumni-session", "true");
    item.innerHTML = '<a class="top-bar-link" href="alumni.html"><i class="fas fa-user-circle" aria-hidden="true"></i><span>' +
      escapeHtml(session.names || "Mon espace") + '</span></a>';
    nav.appendChild(item);
  }

  function ensureStatus(form) {
    var status = form.querySelector("[data-alumni-auth-status]");
    if (status) return status;
    status = document.createElement("div");
    status.setAttribute("data-alumni-auth-status", "true");
    status.className = "alert d-none mt-3";
    form.insertBefore(status, form.firstElementChild);
    return status;
  }

  function showStatus(status, message, type) {
    status.className = "alert mt-3 alert-" + (type || "info");
    status.textContent = message;
  }

  function readUsers() {
    try {
      var parsed = JSON.parse(window.localStorage.getItem(usersKey) || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function saveUsers(users) {
    window.localStorage.setItem(usersKey, JSON.stringify(users));
  }

  function saveSession(user) {
    window.localStorage.setItem(sessionKey, JSON.stringify({
      id: user.id,
      names: user.names,
      email: user.email,
      signed_in_at: new Date().toISOString()
    }));
  }

  function readSession() {
    try {
      return JSON.parse(window.localStorage.getItem(sessionKey) || "null");
    } catch (error) {
      return null;
    }
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }
})();
