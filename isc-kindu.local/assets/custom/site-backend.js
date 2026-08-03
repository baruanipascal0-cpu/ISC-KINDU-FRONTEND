(function () {
  var config = window.ISC_BACKEND_API || {};
  var apiBase = config.baseUrl || "/api";
  var pagePath = window.location.pathname.replace(/\\/g, "/").toLowerCase();
  var parts = pagePath.split("/").filter(Boolean);
  var fileName = parts[parts.length - 1] || "index.html";
  var searchParams = new URLSearchParams(window.location.search || "");
  var pageDefaults = {
    "presentation-de-lisc-kindu": {
      title: "Presentation de l ISC KINDU",
      excerpt: "Identite, mission et organisation generale de l Institut Superieur de Commerce de Kindu.",
      body: "L ISC KINDU presente ici son histoire, sa mission de formation et sa contribution au developpement du Maniema.\n\nCette page peut etre enrichie depuis l espace administrateur avec les informations officielles de l institution.",
      image_url: "/assets/custom/photo-1.jpg"
    },
    "conseil-administration": {
      title: "Conseil d administration",
      excerpt: "Instance d orientation et de suivi de la gouvernance institutionnelle.",
      body: "Le conseil d administration accompagne les grandes orientations de l ISC KINDU et veille a la bonne gouvernance de l institution.\n\nLes decisions, attributions et informations officielles peuvent etre completees depuis l espace administrateur.",
      image_url: "/assets/custom/photo-2.jpg"
    },
    "directeur-general": {
      title: "Le Directeur General",
      excerpt: "Autorite chargee de la direction et de la coordination generale de l ISC KINDU.",
      body: "Le Directeur General assure la conduite institutionnelle, academique et administrative de l ISC KINDU.\n\nCette page est prevue pour presenter le mot, le profil et les informations officielles de la direction generale.",
      image_url: "/assets/custom/photo-3.jpg"
    },
    "comite-de-gestion": {
      title: "Comite de gestion",
      excerpt: "Equipe responsable de la gestion quotidienne de l institution.",
      body: "Le comite de gestion coordonne les services academiques, administratifs, financiers et scientifiques de l ISC KINDU.\n\nLes membres, fonctions et communiques officiels peuvent etre mis a jour dans le backend.",
      image_url: "/assets/custom/photo-4.jpg"
    },
    "conseil-de-section": {
      title: "Conseil de section",
      excerpt: "Cadre d organisation pedagogique et scientifique des sections.",
      body: "Le conseil de section suit l organisation des enseignements, l encadrement des etudiants et la qualite academique dans chaque section.\n\nCette page donne un espace autonome aux informations propres aux sections.",
      image_url: "/assets/custom/photo-5.jpg"
    },
    "conseil-de-departement": {
      title: "Conseil de departement",
      excerpt: "Cadre de coordination des departements et des filieres.",
      body: "Le conseil de departement accompagne les activites pedagogiques, les programmes et l encadrement scientifique des filieres.\n\nLes informations propres a chaque departement peuvent etre completees depuis l admin.",
      image_url: "/assets/custom/photo-6.jpg"
    },
    "textes-legaux-et-reglementaires-de-lesu": {
      title: "Textes legaux et reglementaires de l ESU",
      excerpt: "Documents de reference pour le fonctionnement academique et administratif.",
      body: "Cette page regroupe les textes, reglements et references utiles au fonctionnement de l enseignement superieur et universitaire.\n\nLes documents officiels peuvent etre ajoutes comme publications ou liens depuis le backend.",
      image_url: "/assets/custom/photo-7.jpg"
    },
    "membre-comite-gestion": {
      title: "Membre du comite de gestion",
      excerpt: "Presentation des responsables membres du comite de gestion.",
      body: "Cette page presente les membres du comite de gestion, leurs fonctions et les informations institutionnelles associees.\n\nElle reste modifiable depuis l espace administrateur pour garder les donnees a jour.",
      image_url: "/assets/custom/photo-8.jpg"
    },
    "plan-strategique": {
      title: "Plan strategique",
      excerpt: "Orientations prioritaires pour le developpement de l ISC KINDU.",
      body: "Le plan strategique presente les axes de developpement de l ISC KINDU: qualite academique, recherche, gouvernance, numerisation et ouverture au milieu professionnel.\n\nLes objectifs, activites et documents de reference peuvent etre completes depuis le backend.",
      image_url: "/assets/custom/photo-9.jpg"
    }
  };

  ensureAdminLink();
  normalizeSiteLinks();
  hydrateStaticHomeLinks();
  hydrateStaticListLinks();
  hideRemovedLinks();
  removeDeadSiteLinks();
  ensureMobileNavigation();
  enableCardNavigation();
  hydrateSiteSettings();
  boot();

  function boot() {
    var detail = resolveDetail();
    if (detail) {
      hydrateSidebar();
      if (detail.kind === "news") return renderNewsDetail(detail.slug);
      if (detail.kind === "publication") return renderPublicationDetail(detail.slug);
      if (detail.kind === "event") return renderEventDetail(detail.slug);
      if (detail.kind === "graduation") return renderGraduationDetail(detail.slug);
    }

    var module = resolveModule();
    if (!module) {
      var genericPage = resolveGenericPage();
      if (genericPage) return renderPageOnly(genericPage.slug, genericPage.title);
      return;
    }

    if (module === "home") return renderHome();
    if (module === "news") return renderNews();
    if (module === "sections") return renderSections();
    if (module === "publications") return renderPublications("Publications", null);
    if (module === "diplomas") return renderGraduationLists();
    if (module === "memoriam") return renderPageWithPublications("in-memoriam", "In memoriam", "In memoriam");
    if (module === "library") return renderPageWithPublications("bibliotheques", "Bibliotheques", "Bibliotheque");
    if (module === "researchCenters") return renderPageWithPublications("centre-et-instituts-de-recherche", "Centre et Institut de recherche", "Centre de recherche");
    if (module === "theses") return renderPageWithPublications("nos-theses", "Nos theses", "These");
    if (module === "resources") return renderPageWithPublications("ressources", "Ressources", "Ressource");
    if (module === "plan") return renderPageOnly("plan-strategique", "Plan strategique");
    if (module === "admissions" && document.querySelector("#admissionPortal")) return;
    if (module === "admissions") return renderPageOnly("inscription", "Inscriptions");
    if (module === "contact") return renderContact();
  }

  function resolveDetail() {
    var querySlug = searchParams.get("slug");
    var queryKind = (searchParams.get("type") || searchParams.get("kind") || "").toLowerCase();
    var eventSlug = searchParams.get("event");

    if ((fileName === "actualites.html" || fileName === "news.html") && eventSlug) {
      return { kind: "event", slug: eventSlug };
    }

    if ((fileName === "actualites.html" || fileName === "news.html") && querySlug) {
      return { kind: queryKind === "event" ? "event" : "news", slug: querySlug };
    }

    if (isPublicationPage(fileName) && querySlug) {
      return { kind: "publication", slug: querySlug };
    }

    if (fileName === "diplomes.html" && querySlug) {
      return { kind: "graduation", slug: querySlug };
    }

    if (parts[0] === "actualites" && parts[1]) return { kind: "news", slug: parts[1] };
    if (parts[0] === "publications" && parts[1]) return { kind: "publication", slug: parts[1] };
    if (parts[0] === "evenements" && parts[1]) return { kind: "event", slug: parts[1] };
    if (parts[0] === "diplomes" && parts[1]) return { kind: "graduation", slug: parts[1] };
    return null;
  }

  function resolveModule() {
    if (pagePath.indexOf("/alumni/") !== -1) return null;
    if (fileName === "index.html" || pagePath === "/" || pagePath.endsWith("/isc-kindu.local/")) return "home";
    if (fileName.indexOf("actualites") === 0 || fileName.indexOf("news") === 0) return "news";
    if (fileName.indexOf("facultes-et-entites") === 0 || pagePath.indexOf("facultes-et-entites") !== -1) return "sections";
    if (fileName.indexOf("articles") === 0 || fileName.indexOf("publication") === 0) return "publications";
    if (fileName.indexOf("bibliotheques") === 0) return "library";
    if (fileName.indexOf("centre-et-instituts-de-recherche") === 0) return "researchCenters";
    if (fileName.indexOf("nos-theses") === 0) return "theses";
    if (fileName.indexOf("ressources") === 0 || fileName.indexOf("les-revues") === 0) return "resources";
    if (fileName.indexOf("diplomes") === 0) return "diplomas";
    if (fileName.indexOf("in-memoriam") === 0) return "memoriam";
    if (fileName.indexOf("plan-strategique") === 0 || fileName.indexOf("message-dalma") === 0) return "plan";
    if (fileName.indexOf("inscriptions") === 0) return "admissions";
    if (fileName.indexOf("contact") === 0) return "contact";
    return null;
  }

  function resolveGenericPage() {
    var pages = {
      "presentation-de-lisc-kindu.html": ["presentation-de-lisc-kindu", "Presentation de l ISC KINDU"],
      "conseil-administration.html": ["conseil-administration", "Conseil d administration"],
      "directeur-general.html": ["directeur-general", "Le Directeur General"],
      "comite-de-gestion.html": ["comite-de-gestion", "Comite de gestion"],
      "conseil-de-section.html": ["conseil-de-section", "Conseil de section"],
      "conseil-de-faculte.html": ["conseil-de-section", "Conseil de section"],
      "conseil-de-departement.html": ["conseil-de-departement", "Conseil de departement"],
      "textes-legaux-et-reglementaires-de-lesu.html": ["textes-legaux-et-reglementaires-de-lesu", "Textes legaux et reglement de l ESU"],
      "membre-comite-gestion.html": ["membre-comite-gestion", "Membre du comite de gestion"],
      "plan-strategique.html": ["plan-strategique", "Plan strategique"],
      "bibliotheques.html": ["bibliotheques", "Bibliotheques"],
      "comment-reussir-ses-etudes.html": ["comment-reussir-ses-etudes", "Comment reussir ses etudes"],
      "centre-et-instituts-de-recherche.html": ["centre-et-instituts-de-recherche", "Centre et Institut de recherche"],
      "nos-theses.html": ["nos-theses", "Nos theses"]
    };
    var match = pages[fileName];
    return match ? { slug: match[0], title: match[1] } : null;
  }

  function request(route) {
    return requestPayload(route).then(function (payload) { return payload.data || payload; });
  }

  function requestPayload(route) {
    if (typeof window.fetch !== "function") return Promise.reject(new Error("fetch unavailable"));

    return window.fetch(apiBase + route, { headers: { "Accept": "application/json" } })
      .then(function (response) {
        return response.json().catch(function () { return {}; }).then(function (payload) {
          if (!response.ok) {
            var error = new Error("API unavailable");
            error.status = response.status;
            error.payload = payload;
            throw error;
          }

          return payload;
        });
      });
  }

  function hydrateSiteSettings() {
    request("/site/settings")
      .then(function (settings) {
        setSocialLink(".social-facebook, .footer-embed-facebook", settings["social.facebook_url"]);
        setSocialLink(".social-x, .footer-embed-x", settings["social.x_url"]);
        setSocialLink(".social-linkedin, .footer-embed-linkedin", settings["social.linkedin_url"]);
        setSocialLink(".social-youtube, .footer-embed-youtube", settings["social.youtube_url"]);
        setSocialLink('a[href^="mailto:"], .share-btn--email', settings["social.email"] ? "mailto:" + settings["social.email"] : "");
      })
      .catch(silent);
  }

  function setSocialLink(selector, url) {
    document.querySelectorAll(selector).forEach(function (link) {
      if (url) {
        link.href = url;
        link.style.display = "";
        return;
      }

      var item = link.closest("li, .social-item, .footer-social-item") || link;
      item.style.display = "none";
    });
  }

  function renderHome() {
    Promise.allSettled([
      request("/home/slides"),
      request("/news?per_page=6"),
      request("/publications?per_page=6"),
      request("/events?per_page=6&upcoming=1"),
      request("/home/statistics"),
      request("/home/cards"),
      request("/sections"),
      request("/publications?per_page=1&type=Alumni"),
      request("/site/blocks/home_service")
    ]).then(function (results) {
      var slides = settled(results[0], []);
      var news = settled(results[1], []);
      var publications = settled(results[2], []);
      var events = settled(results[3], []);
      var stats = settled(results[4], {});
      var homeCards = settled(results[5], []);
      var sections = settled(results[6], []);
      var alumni = settled(results[7], []);
      var services = settled(results[8], []);

      renderHomeSlides(slides.length ? slides : news);
      renderHomeNews(news);
      renderHomeCarousel(document.getElementById("revueCollineCarousel"), publications, "publication");
      renderHomeCarousel(document.getElementById("innovProCarousel"), news, "news");
      renderHomeEvent(events[0]);
      renderHomeStats(stats);
      renderHomeCards(homeCards);
      renderHomeSections(sections);
      renderHomeAlumni(alumni[0]);
      renderHomeServices(services);
    }).catch(silent);
  }

  function renderHomeSlides(items) {
    var root = document.getElementById("slider");
    if (!root || !items || !items.length) return;

    var slides = root.querySelector(".slides");
    var sideSlides = root.querySelector(".side-slides");
    var dots = root.querySelector(".dots");
    var titles = root.querySelector(".slider-titles");
    if (!slides || !dots || !titles) return;

    var mainItems = items.slice(0, 4);
    var sideItems = items.slice(1, 5);
    if (!sideItems.length) sideItems = mainItems;

    slides.innerHTML = mainItems.map(function (item, index) {
      var link = detailUrl(item, "news");
      return '<div class="slide' + (index === 0 ? ' active' : '') + '">' +
        '<div class="slide-bg"><img src="' + escapeAttr(imageOf(item, index)) + '" alt="ISC KINDU"></div>' +
        '<div class="slide-body"><h3><a href="' + escapeAttr(link) + '">' + escapeHtml(item.title || "Actualite") + '</a></h3>' +
        '<p>' + escapeHtml(strip(item.subtitle || item.excerpt || item.summary || item.body || "").slice(0, 180)) + '</p>' +
        '<a class="slide-cta" href="' + escapeAttr(link) + '">En savoir plus</a></div>' +
        '</div>';
    }).join("");

    if (sideSlides) {
      sideSlides.innerHTML = sideItems.map(function (item, index) {
        var link = detailUrl(item, "news");
        return '<a class="side-slide' + (index === 0 ? ' active' : '') + '" href="' + escapeAttr(link) + '">' +
          '<img src="' + escapeAttr(imageOf(item, index + 1)) + '" alt="ISC KINDU">' +
          '<div class="side-caption">' + escapeHtml(item.title || "ISC KINDU") + '</div>' +
          '</a>';
      }).join("");
    }

    dots.innerHTML = mainItems.map(function (_, index) {
      return '<div class="dot' + (index === 0 ? ' active' : '') + '" data-slide="' + index + '"></div>';
    }).join("");

    titles.innerHTML = mainItems.map(function (item, index) {
      return '<div class="slider-titles-item' + (index === 0 ? ' active' : '') + '" data-slide="' + index + '">' +
        escapeHtml(item.title || "Actualite") + '</div>';
    }).join("");

    initBackendSlider(root);
  }

  function renderHomeNews(items) {
    var gridEl = document.querySelector(".section-news .news-grid");
    if (!gridEl || !items || !items.length) return;

    gridEl.innerHTML = items.slice(0, 6).map(function (item, index) {
      return homeNewsCard(item, index);
    }).join("");

    var viewAll = document.querySelector(".news-view-all a");
    if (viewAll) viewAll.href = publicUrl("/actualites.html");
  }

  function renderHomeStats(stats) {
    var cards = document.querySelectorAll(".section-stats .stat-card");
    if (!cards.length) return;

    var values = [
      ["Sections", stats.sections, "/facultes-et-entites.html"],
      ["Filieres", stats.programs, "/facultes-et-entites.html"],
      ["Actualites", stats.news, "/actualites.html"],
      ["Publications", stats.publications, "/articles.html"]
    ];

    values.forEach(function (item, index) {
      var card = cards[index];
      if (!card) return;
      var value = card.querySelector(".stat-value");
      var label = card.querySelector(".stat-label");
      if (value) value.textContent = item[1] == null ? "0" : String(item[1]);
      if (label) label.textContent = item[0];
      makeCardLink(card, item[2]);
    });
  }

  function renderHomeCards(items) {
    var cards = Array.from(document.querySelectorAll(".section-cta .cta-card"));
    if (!cards.length || !items || !items.length) return;

    items.slice(0, cards.length).forEach(function (item, index) {
      var card = cards[index];
      var title = card.querySelector(".cta-card-title");
      var desc = card.querySelector(".cta-card-desc");
      card.href = meaningfulUrl(item.url || item.link_url, index === 0 ? "/inscriptions.html" : "/diplomes.html");
      if (title) title.textContent = item.title || "Titre";
      if (desc) desc.textContent = item.summary || item.subtitle || item.body || "";
    });
  }

  function renderHomeSections(sections) {
    var gridEl = document.querySelector(".section-faculties .fac-grid");
    if (!gridEl || !sections || !sections.length) return;

    var colors = ["blue", "gold", "red", "green", "yellow", "orange"];
    gridEl.innerHTML = sections.map(function (section, index) {
      return '<a class="fac-item" href="' + escapeAttr(sectionUrl(section)) + '"><div class="fac-chip ' + colors[index % colors.length] + '"></div><div class="fac-name">' +
        escapeHtml(section.name || "Section") + '</div><div class="fac-arrow">&rsaquo;</div></a>';
    }).join("");
  }

  function renderHomeServices(items) {
    var gridEl = document.querySelector(".section-entities .ent-grid");
    if (!gridEl || !items || !items.length) return;

    var colors = ["blue", "gold", "red", "green", "yellow", "orange"];
    gridEl.innerHTML = items.map(function (item, index) {
      return '<a class="ent-item" href="' + escapeAttr(meaningfulUrl(item.link_url || item.url, "/contact.html")) + '"><div class="ent-chip ' + colors[index % colors.length] + '"></div><div class="ent-name">' +
        escapeHtml(item.title || "Service") + '</div><div class="ent-arrow">&rsaquo;</div></a>';
    }).join("");
  }

  function renderHomeAlumni(item) {
    if (!item) return;

    var card = document.querySelector(".section-alumni .alumni-card");
    if (!card) return;

    var title = card.querySelector("h2");
    var text = card.querySelector("p");
    if (title) title.textContent = item.title || "Alumni";
    if (text) text.textContent = strip(item.description || item.excerpt || item.body || "Espace communautaire des anciens etudiants.");
  }

  function renderHomeEvent(event) {
    if (!event) return;

    var card = document.querySelector(".section-events .event-card");
    if (!card) return;

    var date = event.starts_at ? new Date(event.starts_at) : null;
    var day = card.querySelector(".event-day");
    var month = card.querySelector(".event-month");
    var link = card.querySelector(".event-body a");
    var location = card.querySelector(".event-location");
    var time = card.querySelector(".event-time");

    if (day) day.textContent = date ? String(date.getDate()).padStart(2, "0") : "00";
    if (month) month.textContent = date ? date.toLocaleDateString("fr-FR", { month: "short" }) : "";
    if (link) {
      link.href = detailUrl(event, "event");
      link.textContent = event.title || "Evenement";
    }
    if (location) location.textContent = event.location || "Campus ISC KINDU";
    if (time) time.textContent = formatDateTime(event.starts_at);
  }

  function renderHomeCarousel(root, items, kind) {
    if (!root || !items || !items.length) return;
    var track = root.querySelector(".revue-carousel-track");
    var dots = root.querySelector(".revue-carousel-dots");
    if (!track || !dots) return;

    track.innerHTML = items.slice(0, 4).map(function (item, index) {
      var link = detailUrl(item, kind);
      return '<article class="revue-carousel-slide" role="group" aria-roledescription="slide">' +
        '<div class="revue-card"><div class="revue-card-media"><a href="' + escapeAttr(link) + '" tabindex="-1">' +
        '<img src="' + escapeAttr(imageOf(item, index)) + '" alt="ISC KINDU" loading="lazy" decoding="async" width="640" height="480"></a></div>' +
        '<div class="revue-card-body"><div class="revue-card-meta">' + escapeHtml(item.type || item.category || "Backend") + '</div>' +
        '<h4 class="revue-card-title"><a href="' + escapeAttr(link) + '">' + escapeHtml(item.title || "Publication") + '</a></h4>' +
        '<p class="revue-card-excerpt">' + escapeHtml(strip(item.description || item.excerpt || item.body || "").slice(0, 180)) + '</p>' +
        '<a class="revue-card-link" href="' + escapeAttr(link) + '">Lire</a></div></div></article>';
    }).join("");

    dots.innerHTML = items.slice(0, 4).map(function (_, index) {
      return '<button type="button" role="tab" class="revue-carousel-dot' + (index === 0 ? ' active' : '') + '" data-slide="' + index + '" aria-selected="' + (index === 0 ? "true" : "false") + '" aria-label="Slide ' + (index + 1) + '"></button>';
    }).join("");

    initBackendCarousel(root);
  }

  function renderNews() {
    var title = "Toutes les actualites de l ISC KINDU";
    renderDynList(title, null, "news");

    requestPayload(listRoute("/news"))
      .then(function (payload) {
        var items = payload.data || [];
        if (!renderDynList(title, items, "news", payload.meta, "/actualites.html")) {
          insertPanel(panel("Actualites", "Actualites publiees depuis l espace administrateur.", grid(items, "news") + paginationMarkup(payload.meta, "/actualites.html")), true);
        }
        hydrateSidebar();
      })
      .catch(silent);
  }

  function renderSections() {
    request("/sections")
      .then(function (sections) {
        var selected = searchParams.get("section");
        var visibleSections = selected ? sections.filter(function (section) { return sectionMatches(section, selected); }) : sections;
        var title = selected && visibleSections.length ? visibleSections[0].name : "Sections et filieres ISC KINDU";
        var list = visibleSections.length ? visibleSections : sections;
        var body = '<section class="section section-dyn"><div class="dyn-head"><h1>' + escapeHtml(title) + '</h1></div>' +
          '<div class="isc-live-list">' + list.map(sectionItem).join("") + '</div></section>';

        if (!replacePageCard(body)) {
          insertPanel(panel(title, "Liste maintenue dans le backend.", '<div class="isc-live-list">' + list.map(sectionItem).join("") + '</div>'), true);
        }
      })
      .catch(silent);
  }

  function renderPublications(title, type) {
    renderDynList(title, null, "publication");

    requestPayload(listRoute("/publications", type ? { type: type } : null))
      .then(function (payload) {
        var items = payload.data || [];
        if (!renderDynList(title, items, "publication", payload.meta, currentPublicationPage())) {
          insertPanel(panel(title, "Documents publies depuis l espace administrateur.", '<div class="isc-live-list">' + items.map(publicationItem).join("") + '</div>' + paginationMarkup(payload.meta, currentPublicationPage())), true);
        }
        hydrateSidebar();
      })
      .catch(silent);
  }

  function renderGraduationLists() {
    Promise.all([
      request("/pages/diplomes").catch(function () { return null; }),
      request("/graduation-lists?per_page=20").catch(function () { return []; })
    ]).then(function (results) {
      var page = results[0];
      var lists = results[1] || [];
      var body = '<section class="section section-dyn"><div class="dyn-head"><h1>Diplomes</h1></div>';
      if (page) body += pageInline(page);
      body += lists.length
        ? '<div class="isc-live-list">' + lists.map(graduationListItem).join("") + '</div>'
        : '<p class="isc-live-empty">Aucune liste de diplomes publiee pour le moment.</p>';
      body += '</section>';

      if (!replacePageCard(body)) {
        insertPanel(panel("Diplomes", "Listes officielles publiees depuis l espace administrateur.", body), true);
      }
    }).catch(silent);
  }

  function renderPageWithPublications(slug, title, type) {
    if (!renderDynList(title, null, "publication")) {
      replacePageCard(loadingDetailMarkup("Chargement des contenus..."));
    }

    Promise.all([
      request("/pages/" + encodeURIComponent(slug)).catch(function () { return null; }),
      requestPayload(listRoute("/publications", { type: type })).catch(function () { return { data: [], meta: null }; })
    ]).then(function (results) {
      var page = results[0];
      var payload = results[1] || { data: [], meta: null };
      var publications = payload.data || [];
      var body = '<section class="section section-dyn"><div class="dyn-head"><h1>' + escapeHtml(title) + '</h1></div>';
      if (page) body += pageInline(page);
      if (publications.length) body += '<div class="isc-live-list">' + publications.map(function (item) { return publicationItem(item, currentPublicationPage()); }).join("") + '</div>';
      if (!publications.length) body += '<p class="isc-live-empty">Aucun contenu publie pour le moment.</p>';
      body += paginationMarkup(payload.meta, currentPublicationPage());
      body += '</section>';

      if (!replacePageCard(body)) {
        insertPanel(panel(title, "Contenu gere depuis le backend.", body), true);
      }
    }).catch(silent);
  }

  function renderPageOnly(slug, title) {
    request("/pages/" + encodeURIComponent(slug))
      .catch(function () { return null; })
      .then(function (page) {
        page = pageWithDefaults(page, slug, title);
        var displayTitle = page.title || title || "ISC KINDU";
        document.title = displayTitle + " | ISC KINDU";
        var body = '<section class="section section-dyn"><div class="dyn-head"><h1>' + escapeHtml(displayTitle) + '</h1></div>' + pageInline(page) + '</section>';
        if (!replacePageCard(body)) {
          insertPanel(panel(displayTitle, "Contenu gere depuis le backend.", pageBlock(page)), true);
        }
      });
  }

  function renderNewsDetail(slug) {
    replacePageCard(loadingDetailMarkup("Chargement de l actualite..."));

    request("/news/" + encodeURIComponent(slug))
      .then(function (item) {
        document.title = (item.title || "Actualite") + " | ISC KINDU";
        return request("/news?per_page=4").catch(function () { return []; }).then(function (similar) {
          replacePageCard(detailMarkup(item, "news", similarItems(similar, item)));
        });
      })
      .catch(function () { renderMissingDetail("404 - Actualite introuvable", "/actualites.html"); });
  }

  function renderPublicationDetail(slug) {
    replacePageCard(loadingDetailMarkup("Chargement de la publication..."));

    request("/publications/" + encodeURIComponent(slug))
      .then(function (item) {
        document.title = (item.title || "Publication") + " | ISC KINDU";
        var route = "/publications?per_page=4" + (item.type ? "&type=" + encodeURIComponent(item.type) : "");
        return request(route).catch(function () { return []; }).then(function (similar) {
          replacePageCard(detailMarkup(item, "publication", similarItems(similar, item)));
        });
      })
      .catch(function () { renderMissingDetail("404 - Publication introuvable", "/articles.html"); });
  }

  function renderGraduationDetail(slug) {
    request("/graduation-lists/" + encodeURIComponent(slug))
      .then(function (item) {
        document.title = (item.title || "Diplomes") + " | ISC KINDU";
        replacePageCard(graduationDetailMarkup(item));
      })
      .catch(function () { renderMissingDetail("Contenu indisponible", "/diplomes.html"); });
  }

  function renderEventDetail(slug) {
    replacePageCard(loadingDetailMarkup("Chargement de l evenement..."));

    request("/events/" + encodeURIComponent(slug))
      .then(function (item) {
        document.title = (item.title || "Evenement") + " | ISC KINDU";
        return request("/events?per_page=4").catch(function () { return []; }).then(function (similar) {
          replacePageCard(detailMarkup(item, "event", similarItems(similar, item)));
        });
      })
      .catch(function () { renderMissingDetail("404 - Evenement introuvable", "/actualites.html"); });
  }

  function renderMissingDetail(title, backUrl) {
    replacePageCard('<section class="section section-dyn article-dyn"><div class="dyn-head"><h1 class="article-title">' +
      escapeHtml(title) + '</h1></div><div class="dyn-content"><p>Ce contenu n est pas disponible.</p><a class="dyn-link" href="' +
      escapeAttr(publicUrl(backUrl)) + '">&larr; Retour</a></div></section>');
  }

  function loadingDetailMarkup(message) {
    return '<section class="section section-dyn article-dyn"><div class="dyn-head"><h1 class="article-title">' +
      escapeHtml(message || "Chargement...") + '</h1></div><div class="dyn-content"><p>Merci de patienter.</p></div></section>';
  }

  function renderContact() {
    Promise.all([
      request("/site/settings").catch(function () { return {}; }),
      request("/pages/contact").catch(function () { return null; })
    ]).then(function (results) {
      var settings = results[0] || {};
      var page = results[1];
      var body = '<section class="section section-dyn"><div class="dyn-head"><h1>Contact ISC KINDU</h1></div>';
      if (page) body += pageInline(page);
      body += '<div class="isc-live-list"><article class="isc-live-list-item">' +
        '<h3>Coordonnees</h3>' +
        '<p class="isc-live-card-text">' + escapeHtml(settings["institution.address"] || "Kindu, Maniema, RDC") + '</p>' +
        '<p class="isc-live-card-text">' + escapeHtml(settings["institution.phone"] || "") + '</p>' +
        '<p class="isc-live-card-text">' + escapeHtml(settings["institution.email"] || "") + '</p>' +
        '</article></div>' + contactForm() + '</section>';

      if (!replacePageCard(body)) {
        insertPanel(panel("Contact ISC KINDU", "Les messages envoyes ici arrivent dans l espace administrateur.", body), true);
      }
      bindContactForm();
    }).catch(silent);
  }

  function renderDynList(title, items, kind, meta, baseUrl) {
    var section = document.querySelector(".section-dyn");
    var gridEl = section ? section.querySelector(".dyn-grid") : null;
    if (!section || !gridEl) return false;

    var heading = section.querySelector(".dyn-head h1");
    if (heading) heading.textContent = title;

    var pagination = section.querySelector(".pagination");
    if (pagination) pagination.remove();
    section.querySelectorAll(".dyn-pagination").forEach(function (node) { node.remove(); });

    if (items === null) {
      gridEl.innerHTML = '<div class="dyn-empty">Chargement des contenus...</div>';
      return true;
    }

    gridEl.innerHTML = items && items.length
      ? items.map(function (item, index) { return dynCard(item, kind, index); }).join("")
      : '<div class="dyn-empty">Aucun contenu publie pour le moment.</div>';

    var paginationHtml = paginationMarkup(meta, baseUrl || currentListPage());
    if (paginationHtml) section.insertAdjacentHTML("beforeend", paginationHtml);

    return true;
  }

  function listRoute(base, extraParams) {
    var params = new URLSearchParams();
    params.set("per_page", "12");
    params.set("page", String(currentPage()));

    Object.keys(extraParams || {}).forEach(function (key) {
      if (extraParams[key] !== null && extraParams[key] !== undefined && extraParams[key] !== "") {
        params.set(key, extraParams[key]);
      }
    });

    return base + "?" + params.toString();
  }

  function currentPage() {
    var page = parseInt(searchParams.get("page") || "1", 10);
    return Number.isFinite(page) && page > 0 ? page : 1;
  }

  function paginationMarkup(meta, baseUrl) {
    if (!meta || Number(meta.last_page || 1) <= 1) return "";

    var current = Number(meta.current_page || 1);
    var last = Number(meta.last_page || 1);
    var start = Math.max(1, current - 2);
    var end = Math.min(last, current + 2);
    var links = [];

    if (current > 1) {
      links.push('<a class="dyn-page-link" href="' + escapeAttr(pageUrl(baseUrl, current - 1)) + '">Precedent</a>');
    }

    for (var page = start; page <= end; page++) {
      if (page === current) {
        links.push('<span class="dyn-page-link active" aria-current="page">' + page + '</span>');
      } else {
        links.push('<a class="dyn-page-link" href="' + escapeAttr(pageUrl(baseUrl, page)) + '">' + page + '</a>');
      }
    }

    if (current < last) {
      links.push('<a class="dyn-page-link" href="' + escapeAttr(pageUrl(baseUrl, current + 1)) + '">Suivant</a>');
    }

    return '<nav class="dyn-pagination" aria-label="Pagination">' + links.join("") + '</nav>';
  }

  function pageUrl(baseUrl, page) {
    var params = new URLSearchParams(window.location.search || "");
    params.delete("slug");
    params.delete("event");
    params.set("page", String(page));

    return publicUrl((baseUrl || currentListPage()) + "?" + params.toString());
  }

  function hydrateSidebar() {
    Promise.allSettled([
      request("/news?per_page=4"),
      request("/events?per_page=4&upcoming=1")
    ]).then(function (results) {
      var news = settled(results[0], []);
      var events = settled(results[1], []);
      renderSidebarList(".widget-posts-recents ul", news, "news");
      renderSidebarList(".widget-agenda ul", events, "event");
    }).catch(silent);
  }

  function renderSidebarList(selector, items, kind) {
    var list = document.querySelector(selector);
    if (!list || !items || !items.length) return;

    list.innerHTML = items.map(function (item, index) {
      return '<li><a href="' + escapeAttr(detailUrl(item, kind)) + '" class="sidebar-thumb-item">' +
        '<span class="sidebar-thumb-img"><img src="' + escapeAttr(imageOf(item, index)) + '" alt="ISC KINDU" loading="lazy"></span>' +
        '<span class="sidebar-thumb-content"><span class="sidebar-thumb-title">' + escapeHtml(item.title || "Titre") + '</span> ' +
        '<span class="muted">' + escapeHtml(formatDate(item.published_at || item.starts_at)) + '</span></span></a></li>';
    }).join("");
  }

  function replacePageCard(markup) {
    var cardEl = document.querySelector(".page-card");
    if (!cardEl) return false;
    cardEl.innerHTML = markup;
    document.body.classList.add("page-article");
    return true;
  }

  function detailMarkup(item, kind, similar) {
    var meta = item.category || item.type || item.location || "ISC KINDU";
    var date = formatDate(item.published_at || item.starts_at);
    var body = item.body || item.description || item.excerpt || "";
    var back = kind === "publication" ? (publicationListPageFor(item) || currentPublicationPage()) : (kind === "event" ? "/actualites.html" : "/actualites.html");
    var backLabel = kind === "publication" ? "Retour aux publications" : (kind === "event" ? "Retour aux evenements" : "Retour aux actualites");
    var file = kind === "publication" && item.file_url
      ? '<p><a class="dyn-link dyn-link-button" href="' + escapeAttr(item.file_url) + '" target="_blank" rel="noopener">Ouvrir le document</a></p>'
      : "";
    var imageAlt = item.image_alt || item.title || "ISC KINDU";

    return '<section class="section section-dyn article-dyn">' +
      '<p class="isc-back-row"><a class="isc-back-link" href="' + escapeAttr(publicUrl(back)) + '"><span aria-hidden="true">&larr;</span> ' + escapeHtml(backLabel) + '</a></p>' +
      '<div class="dyn-head"><div class="article-meta">' + escapeHtml(meta + (date ? " - " + date : "")) + '</div>' +
      '<h1 class="article-title">' + escapeHtml(item.title || "Contenu") + '</h1></div>' +
      (item.image_url ? '<div class="article-featured-image"><img src="' + escapeAttr(publicUrl(item.image_url)) + '" alt="' + escapeAttr(imageAlt) + '"></div>' : '') +
      '<div class="dyn-content content-body">' + bodyToHtml(body) + file +
      '</div>' + similarMarkup(similar, kind) + '</section>';
  }

  function similarItems(items, current) {
    var currentSlug = current && current.slug;

    return (items || []).filter(function (item) {
      return item && item.slug && item.slug !== currentSlug;
    }).slice(0, 3);
  }

  function similarMarkup(items, kind) {
    if (!items || !items.length) return "";

    return '<div class="isc-similar"><h2>Contenus similaires</h2><div class="isc-similar-grid">' +
      items.map(function (item, index) { return card(item, kind, index); }).join("") +
      '</div></div>';
  }

  function dynCard(item, kind, index) {
    var link = detailUrl(item, kind);
    var image = imageOf(item, index);
    var meta = item.category || item.type || formatDate(item.published_at || item.starts_at);
    var excerpt = item.excerpt || item.description || item.body || "";

    return '<article class="dyn-card" data-isc-card-url="' + escapeAttr(link) + '" role="link" tabindex="0">' +
      '<a class="dyn-thumb" href="' + escapeAttr(link) + '"><img src="' + escapeAttr(image) + '" alt="ISC KINDU"></a>' +
      '<div class="dyn-date">' + escapeHtml(formatDate(item.published_at || item.starts_at)) + '</div>' +
      '<div class="dyn-title"><a href="' + escapeAttr(link) + '">' + escapeHtml(item.title || "Titre") + '</a></div>' +
      (meta ? '<div class="dyn-content">' + escapeHtml(meta) + '</div>' : '') +
      '<div class="dyn-excerpt">' + escapeHtml(strip(excerpt).slice(0, 180)) + '</div>' +
      '<a class="dyn-link" href="' + escapeAttr(link) + '">' + (kind === "publication" ? "Voir le document" : "Lire la suite") + '</a></article>';
  }

  function homeNewsCard(item, index) {
    var link = detailUrl(item, "news");
    return '<article class="news-card' + (index === 0 ? ' feature' : '') + '"><a class="news-link" href="' + escapeAttr(link) + '">' +
      '<img src="' + escapeAttr(imageOf(item, index)) + '" alt="ISC KINDU" loading="lazy">' +
      '<div class="news-meta">' + escapeHtml(item.category || formatDate(item.published_at)) + '</div>' +
      '<div class="news-title">' + escapeHtml(item.title || "Actualite") + '</div>' +
      (index === 0 ? '<div class="news-title" style="font-weight:400;font-size:14px;line-height:1.5;color:#1f2530;">' + escapeHtml(strip(item.excerpt || item.body || "").slice(0, 160)) + '</div>' : '') +
      '<span class="news-more">Lire la suite</span>' +
      '</a></article>';
  }

  function sectionItem(section) {
    var programs = (section.programs || []).map(function (program) {
      return '<li>' + escapeHtml(program.name) + ' <span class="muted">' + escapeHtml(program.cycle || "") + '</span></li>';
    }).join("");
    var link = sectionUrl(section);

    return '<article class="isc-live-list-item" data-isc-card-url="' + escapeAttr(link) + '" role="link" tabindex="0"><h3><a href="' + escapeAttr(link) + '">' + escapeHtml(section.name) + '</a></h3>' +
      '<p class="isc-live-card-text">' + escapeHtml(section.description || "") + '</p>' +
      '<ul class="isc-live-section-programs">' + programs + '</ul></article>';
  }

  function publicationItem(item, page) {
    var detail = publicationDetailUrl(item, page);
    var file = item.file_url ? '<span class="isc-live-file-note">Document disponible dans la page detail.</span>' : '';
    return '<article class="isc-live-list-item">' +
      '<h3><a href="' + escapeAttr(detail) + '">' + escapeHtml(item.title || "Publication") + '</a></h3>' +
      '<p class="isc-live-meta">' + escapeHtml(item.type || "Document") + '</p>' +
      '<p class="isc-live-card-text">' + escapeHtml(strip(item.description || "").slice(0, 260)) + '</p>' +
      '<a class="isc-live-link" href="' + escapeAttr(detail) + '">Lire le detail</a>' + file + '</article>';
  }

  function graduationListItem(item) {
    var meta = [
      item.academic_year && item.academic_year.code,
      item.section && item.section.name,
      item.program && item.program.name,
      item.promotion && item.promotion.name
    ].filter(Boolean).join(" · ");

    return '<article class="isc-live-list-item">' +
      '<h3><a href="' + escapeAttr(detailUrl(item, "graduation")) + '">' + escapeHtml(item.title || "Liste de diplomes") + '</a></h3>' +
      '<p class="isc-live-meta">' + escapeHtml(meta || "ISC KINDU") + '</p>' +
      '<p class="isc-live-card-text">' + escapeHtml((item.graduates_count || 0) + " etudiant(s) diplome(s)") + '</p>' +
      '<a class="isc-live-link" href="' + escapeAttr(detailUrl(item, "graduation")) + '">Voir la liste</a>' +
      '</article>';
  }

  function pageWithDefaults(page, slug, title) {
    var fallback = pageDefaults[slug] || {};
    var payload = page || {};

    return {
      title: placeholderText(payload.title) ? (fallback.title || title || payload.title) : payload.title,
      excerpt: placeholderText(payload.excerpt) ? (fallback.excerpt || "") : payload.excerpt,
      body: placeholderText(payload.body) ? (fallback.body || "") : payload.body,
      image_url: placeholderImage(payload.image_url) ? (fallback.image_url || payload.image_url) : payload.image_url
    };
  }

  function placeholderText(value) {
    var text = strip(value).toLowerCase();
    return !text ||
      text === "a completer." ||
      text === "a completer" ||
      text === "contenu a completer depuis l espace administrateur." ||
      text === "page institutionnelle a completer si elle est necessaire." ||
      text === "information isc kindu" ||
      text.indexOf("information a completer") !== -1;
  }

  function placeholderImage(value) {
    var path = String(value || "").trim();
    return !path || path === "/images/site/photo-1.jpg" || path.indexOf("/images/site/photo-1.jpg") !== -1;
  }

  function pageInline(page) {
    return '<div class="dyn-content content-body">' +
      (page.image_url ? '<p><img src="' + escapeAttr(publicUrl(page.image_url)) + '" alt="" style="max-width:100%;border-radius:12px;"></p>' : '') +
      (page.excerpt ? '<p class="lead">' + escapeHtml(page.excerpt) + '</p>' : '') +
      bodyToHtml(page.body || "") + '</div>';
  }

  function pageBlock(page) {
    return '<div class="isc-live-list"><article class="isc-live-list-item">' +
      '<h3>' + escapeHtml(page.title || "Page") + '</h3>' +
      '<p class="isc-live-card-text">' + escapeHtml(page.excerpt || "") + '</p>' +
      '<div class="isc-live-card-text">' + bodyToHtml(page.body || "") + '</div>' +
      '</article></div>';
  }

  function graduationDetailMarkup(item) {
    var meta = [
      item.academic_year && item.academic_year.code,
      item.section && item.section.name,
      item.program && item.program.name,
      item.promotion && item.promotion.name,
      item.cycle
    ].filter(Boolean).join(" · ");
    var rows = (item.graduates || []).map(function (graduate, index) {
      return '<tr><td>' + (index + 1) + '</td><td>' + escapeHtml(graduate.matricule || "") + '</td><td>' +
        escapeHtml(graduate.last_name || "") + '</td><td>' + escapeHtml(graduate.post_name || "") + '</td><td>' +
        escapeHtml(graduate.first_name || "") + '</td><td>' + escapeHtml(graduate.gender || "") + '</td><td>' +
        escapeHtml(graduate.percentage || "") + '</td><td>' + escapeHtml(graduate.mention || "") + '</td></tr>';
    }).join("");

    return '<article class="dyn-content"><p><a class="isc-back-link" href="' + escapeAttr(publicUrl("/diplomes.html")) + '">&larr; Retour aux diplomes</a></p>' +
      '<h1>' + escapeHtml(item.title || "Liste de diplomes") + '</h1>' +
      '<p class="isc-live-meta">' + escapeHtml(meta || "ISC KINDU") + '</p>' +
      '<div class="isc-live-table-wrap"><table class="isc-live-table"><thead><tr><th>Numero</th><th>Matricule</th><th>Nom</th><th>Postnom</th><th>Prenom</th><th>Sexe</th><th>%</th><th>Mention</th></tr></thead><tbody>' +
      (rows || '<tr><td colspan="8">Aucun diplome publie dans cette liste.</td></tr>') +
      '</tbody></table></div></article>';
  }

  function grid(items, kind) {
    return '<div class="isc-live-grid">' + (items || []).map(function (item, index) {
      return card(item, kind, index);
    }).join("") + '</div>';
  }

  function card(item, kind, index) {
    var title = item.title || item.name || "Titre";
    var text = item.excerpt || item.summary || item.description || item.body || "";
    var image = imageOf(item, index);
    var meta = item.category || item.type || item.published_at || "";
    var link = detailUrl(item, kind || "news");

    return '<article class="isc-live-card" data-isc-card-url="' + escapeAttr(link) + '" role="link" tabindex="0">' +
      '<a href="' + escapeAttr(link) + '"><img src="' + escapeAttr(image) + '" alt=""></a>' +
      '<div class="isc-live-card-body">' +
      (meta ? '<div class="isc-live-meta">' + escapeHtml(formatMeta(meta)) + '</div>' : '') +
      '<h3 class="isc-live-card-title"><a href="' + escapeAttr(link) + '">' + escapeHtml(title) + '</a></h3>' +
      '<p class="isc-live-card-text">' + escapeHtml(strip(text).slice(0, 220)) + '</p>' +
      '</div></article>';
  }

  function contactForm() {
    return '<form class="isc-live-form" data-isc-contact-form>' +
      '<label>Nom<input name="name" required></label>' +
      '<label>Adresse mail<input name="email" type="email"></label>' +
      '<label>Telephone<input name="phone"></label>' +
      '<label>Sujet<input name="subject"></label>' +
      '<label class="full">Message<textarea name="message" required></textarea></label>' +
      '<div class="isc-live-status" data-isc-contact-status></div>' +
      '<button class="isc-live-button" type="submit">Envoyer le message</button>' +
      '</form>';
  }

  function bindContactForm() {
    var form = document.querySelector("[data-isc-contact-form]");
    if (!form) return;
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var status = form.querySelector("[data-isc-contact-status]");
      status.textContent = "Envoi en cours...";
      window.fetch(apiBase + "/contact/messages", {
        method: "POST",
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form).entries()))
      }).then(function (response) {
        if (!response.ok) throw new Error("send failed");
        form.reset();
        status.textContent = "Message envoye. Merci.";
      }).catch(function () {
        status.textContent = "Le message n a pas pu etre envoye. Verifiez que le backend Laravel est demarre.";
      });
    });
  }

  function initBackendSlider(root) {
    var slides = Array.from(root.querySelectorAll(".slide"));
    var sideSlides = Array.from(root.querySelectorAll(".side-slide"));
    var dots = Array.from(root.querySelectorAll(".dot"));
    var titles = Array.from(root.querySelectorAll(".slider-titles-item"));
    var prev = root.querySelector(".slider-arrow.prev");
    var next = root.querySelector(".slider-arrow.next");
    var index = 0;

    function show(nextIndex) {
      if (!slides.length) return;
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, key) {
        slide.classList.toggle("active", key === index);
        slide.style.opacity = key === index ? "1" : "0";
      });
      sideSlides.forEach(function (slide, key) {
        var active = key === (index % sideSlides.length);
        slide.classList.toggle("active", active);
        slide.style.opacity = active ? "1" : "0";
      });
      dots.forEach(function (dot, key) { dot.classList.toggle("active", key === index); });
      titles.forEach(function (title, key) { title.classList.toggle("active", key === index); });
    }

    dots.forEach(function (dot) { dot.addEventListener("click", function () { show(Number(dot.dataset.slide || 0)); }); });
    titles.forEach(function (title) { title.addEventListener("click", function () { show(Number(title.dataset.slide || 0)); }); });
    if (prev) prev.addEventListener("click", function () { show(index - 1); });
    if (next) next.addEventListener("click", function () { show(index + 1); });
    show(0);
  }

  function initBackendCarousel(root) {
    var track = root.querySelector(".revue-carousel-track");
    var slides = track ? Array.from(track.querySelectorAll(".revue-carousel-slide")) : [];
    var dots = Array.from(root.querySelectorAll(".revue-carousel-dot"));
    var prev = root.querySelector(".revue-carousel-prev");
    var next = root.querySelector(".revue-carousel-next");
    var index = 0;

    function go(nextIndex) {
      if (!slides.length) return;
      index = (nextIndex + slides.length) % slides.length;
      track.style.transform = "translateX(" + (-index * 100) + "%)";
      dots.forEach(function (dot, key) {
        dot.classList.toggle("active", key === index);
        dot.setAttribute("aria-selected", key === index ? "true" : "false");
      });
    }

    root.classList.toggle("revue-carousel--single", slides.length < 2);
    dots.forEach(function (dot) { dot.addEventListener("click", function () { go(Number(dot.dataset.slide || 0)); }); });
    if (prev) prev.addEventListener("click", function () { go(index - 1); });
    if (next) next.addEventListener("click", function () { go(index + 1); });
    go(0);
  }

  function insertPanel(markup, replace) {
    var existing = document.querySelector("[data-isc-live-root]");
    if (existing && replace) existing.remove();
    if (existing && !replace) return existing;

    var wrapper = document.createElement("section");
    wrapper.className = "isc-live";
    wrapper.setAttribute("data-isc-live-root", "true");
    wrapper.innerHTML = markup;

    var content = document.querySelector(".content-wrap") || document.querySelector("main") || document.querySelector(".section-news") || document.body;
    if (content === document.body) {
      var header = document.querySelector("header");
      document.body.insertBefore(wrapper, header && header.nextSibling ? header.nextSibling : document.body.firstChild);
    } else {
      content.insertBefore(wrapper, content.firstChild);
    }
    return wrapper;
  }

  function panel(title, subtitle, body, kicker) {
    return '<div class="isc-live-panel"><div class="isc-live-head">' +
      '<p class="isc-live-kicker">' + escapeHtml(kicker || "Contenu du site") + '</p>' +
      '<h2 class="isc-live-title">' + escapeHtml(title) + '</h2>' +
      (subtitle ? '<p class="isc-live-subtitle">' + escapeHtml(subtitle) + '</p>' : '') +
      '</div>' + body + '</div>';
  }

  function detailUrl(item, kind) {
    if (item && item.url) return item.url;
    var slug = item && item.slug ? encodeURIComponent(item.slug) : "";
    if (kind === "publication") return publicationDetailUrl(item);
    if (kind === "event") return cleanDetailUrl(slug ? "/evenements/" + slug : "/actualites.html", slug ? "/actualites.html?event=" + slug : "/actualites.html");
    if (kind === "graduation") return publicUrl(slug ? "/diplomes.html?slug=" + slug : "/diplomes.html");
    return cleanDetailUrl(slug ? "/actualites/" + slug : "/actualites.html", slug ? "/actualites.html?slug=" + slug : "/actualites.html");
  }

  function publicationDetailUrl(item, page) {
    var slug = item && item.slug ? encodeURIComponent(item.slug) : "";
    var legacyBase = page || publicationListPageFor(item) || currentPublicationPage();
    return cleanDetailUrl(slug ? "/publications/" + slug : legacyBase, slug ? legacyBase + "?slug=" + slug : legacyBase);
  }

  function cleanDetailUrl(path, legacyPath) {
    if (window.location.protocol === "file:" || isLocalStaticHost()) {
      return publicUrl(legacyPath || path);
    }

    return publicUrl(path);
  }

  function isLocalStaticHost() {
    return /^(127\.0\.0\.1|localhost|\[::1\])$/i.test(window.location.hostname || "");
  }

  function publicationListPageFor(item) {
    var type = String((item && item.type) || "").toLowerCase();
    if (type.indexOf("ressource") !== -1) return "/ressources.html";
    if (type.indexOf("bibli") !== -1) return "/bibliotheques.html";
    if (type.indexOf("these") !== -1 || type.indexOf("thèse") !== -1) return "/nos-theses.html";
    if (type.indexOf("centre") !== -1) return "/centre-et-instituts-de-recherche.html";
    if (type.indexOf("memoriam") !== -1) return "/in-memoriam.html";
    return null;
  }

  function currentPublicationPage() {
    if (isPublicationPage(fileName)) return "/" + fileName;
    return "/articles.html";
  }

  function isPublicationPage(name) {
    return [
      "articles.html",
      "publications.html",
      "ressources.html",
      "bibliotheques.html",
      "nos-theses.html",
      "centre-et-instituts-de-recherche.html",
      "in-memoriam.html"
    ].indexOf(name) !== -1;
  }

  function meaningfulUrl(url, fallback) {
    var value = String(url || "").trim();
    if (!value || value === "#" || value === "http://#" || value === "https:///#" || value === "javascript:void(0)") {
      return publicUrl(fallback || "/index.html");
    }
    return publicUrl(value);
  }

  function makeCardLink(element, href) {
    if (!element) return;
    var url = meaningfulUrl(href, "/index.html");
    if (element.tagName && element.tagName.toLowerCase() === "a") {
      element.href = url;
      return;
    }
    element.setAttribute("data-isc-card-url", url);
    element.setAttribute("role", "link");
    element.setAttribute("tabindex", "0");
  }

  function hydrateStaticHomeLinks() {
    var statLinks = ["/facultes-et-entites.html", "/facultes-et-entites.html", "/actualites.html", "/articles.html"];
    document.querySelectorAll(".section-stats .stat-card").forEach(function (card, index) {
      makeCardLink(card, statLinks[index] || "/index.html");
    });

    document.querySelectorAll(".stats-links .link-btn").forEach(function (link) {
      var text = (link.textContent || "").toLowerCase();
      var href = text.indexOf("bibli") !== -1 ? "/bibliotheques.html" : (text.indexOf("service") !== -1 ? "/contact.html" : "/facultes-et-entites.html");
      link.href = meaningfulUrl(link.getAttribute("href"), href);
    });

    document.querySelectorAll("#slider .slide h3 a, #slider .slide-cta").forEach(function (link) {
      link.href = meaningfulUrl(link.getAttribute("href"), "/actualites.html");
    });
    document.querySelectorAll("#slider .side-slide").forEach(function (slide) {
      makeCardLink(slide, "/actualites.html");
    });

    var ctaDefaults = ["/inscriptions.html", "/diplomes.html"];
    document.querySelectorAll(".section-cta .cta-card").forEach(function (link, index) {
      link.href = meaningfulUrl(link.getAttribute("href"), ctaDefaults[index] || "/inscriptions.html");
    });

    document.querySelectorAll(".section-news .news-link").forEach(function (link) {
      link.href = meaningfulUrl(link.getAttribute("href"), "/actualites.html");
      if (!link.querySelector(".news-more")) {
        var more = document.createElement("span");
        more.className = "news-more";
        more.textContent = "Lire la suite";
        link.appendChild(more);
      }
    });

    document.querySelectorAll("#revueCollineCarousel a").forEach(function (link) {
      link.href = meaningfulUrl(link.getAttribute("href"), "/articles.html");
    });
    document.querySelectorAll("#innovProCarousel a").forEach(function (link) {
      link.href = meaningfulUrl(link.getAttribute("href"), "/actualites.html");
    });
    document.querySelectorAll(".section-events .event-body a").forEach(function (link) {
      link.href = meaningfulUrl(link.getAttribute("href"), "/actualites.html");
    });
    document.querySelectorAll(".oipr-cta").forEach(function (link) {
      link.href = meaningfulUrl(link.getAttribute("href"), "/presentation-de-lisc-kindu.html");
    });
    document.querySelectorAll(".section-alumni .alumni-card").forEach(function (card) {
      makeCardLink(card, "/alumni/index.html");
    });
    document.querySelectorAll(".section-faculties .fac-item").forEach(function (card) {
      makeCardLink(card, "/facultes-et-entites.html");
    });
    document.querySelectorAll(".section-entities .ent-item").forEach(function (card) {
      makeCardLink(card, "/contact.html");
    });
  }

  function hydrateStaticListLinks() {
    var fallback = currentListPage();
    var fallbackUrl = publicUrl(fallback);
    document.querySelectorAll(".dyn-card").forEach(function (card) {
      card.querySelectorAll("a").forEach(function (link) {
        link.href = fallbackUrl;
      });
      makeCardLink(card, fallback);
    });

    document.querySelectorAll('.dyn-search-form[action="#"], .dyn-search-form:not([action])').forEach(function (form) {
      form.action = fallbackUrl;
    });

    document.querySelectorAll('.pagination a[href="#"], .pagination a[href=""]').forEach(function (link) {
      link.href = fallbackUrl;
    });
  }

  function currentListPage() {
    if (fileName === "actualites.html" || fileName === "news.html") return "/actualites.html";
    if (fileName === "diplomes.html") return "/diplomes.html";
    if (isPublicationPage(fileName)) return currentPublicationPage();
    return "/" + fileName;
  }

  function sectionUrl(section) {
    var slug = itemSlug(section);
    return publicUrl("/facultes-et-entites.html" + (slug ? "?section=" + encodeURIComponent(slug) : ""));
  }

  function sectionMatches(section, selected) {
    var target = slugify(selected);
    if (!target) return false;
    return [section.slug, section.code, section.name, section.title].some(function (value) {
      return slugify(value) === target;
    });
  }

  function itemSlug(item) {
    return item && (item.slug || item.code || slugify(item.name || item.title || ""));
  }

  function slugify(value) {
    return strip(value)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function imageOf(item, index) {
    return publicUrl(item.image_url || "/assets/custom/photo-" + (((index || 0) % 9) + 1) + ".jpg");
  }

  function publicUrl(path) {
    if (!path) return "#";
    if (/^(https?:|mailto:|tel:|#|javascript:|data:|blob:)/i.test(path)) return path;
    if (window.location.protocol !== "file:") return path;
    if (path.charAt(0) !== "/") return path;
    return fileRootPrefix() + path.replace(/^\/+/, "");
  }

  function fileRootPrefix() {
    var marker = "/isc-kindu.local/";
    var pathname = window.location.pathname.replace(/\\/g, "/").toLowerCase();
    var start = pathname.lastIndexOf(marker);
    var relative = start >= 0 ? pathname.slice(start + marker.length) : pathname.replace(/^\/+/, "");
    var segments = relative.split("/").filter(Boolean);
    if (segments.length && segments[segments.length - 1].indexOf(".") !== -1) segments.pop();
    return segments.map(function () { return ".."; }).join("/") + (segments.length ? "/" : "");
  }

  function settled(result, fallback) {
    return result && result.status === "fulfilled" ? result.value : fallback;
  }

  function formatDate(value) {
    if (!value) return "";
    var date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString("fr-FR");
  }

  function formatDateTime(value) {
    if (!value) return "";
    var date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" });
  }

  function formatMeta(value) {
    if (typeof value !== "string") return "";
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) return formatDate(value);
    return value;
  }

  function bodyToHtml(value) {
    var text = strip(value);
    if (!text) return "<p>Contenu a completer.</p>";
    return text.split(/\n{2,}/).map(function (paragraph) {
      return "<p>" + escapeHtml(paragraph).replace(/\n/g, "<br>") + "</p>";
    }).join("");
  }

  function strip(value) {
    return String(value || "").replace(/<[^>]*>/g, " ").replace(/[ \t]+/g, " ").trim();
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

  function normalizeSiteLinks() {
    document.querySelectorAll('a[href="publications.html"]').forEach(function (link) { link.href = publicUrl("/articles.html"); });
    document.querySelectorAll('a[href="les-revues.html"]').forEach(function (link) { link.href = publicUrl("/articles.html"); });
    setHrefForText(["ressources"], "/ressources.html");
    document.querySelectorAll('a[href="conseil-de-faculte.html"]').forEach(function (link) { link.href = publicUrl("/conseil-de-section.html"); });
    document.querySelectorAll(".news-view-all a").forEach(function (link) { link.href = publicUrl("/actualites.html"); });
    setHrefByText(["presentation de l'isc kindu", "presentation de l’isc kindu", "présentation de l'isc kindu", "présentation de l’isc kindu", "prÃ©sentation de l"], "/presentation-de-lisc-kindu.html");
    setHrefByText(["conseil administration", "conseil d'administration", "conseil d’administration", "conseil de l'institut", "conseil de l’institut"], "/conseil-administration.html");
    setHrefByText(["directeur general", "directeur général", "directeur g"], "/directeur-general.html");
    setHrefByText(["conseil de section"], "/conseil-de-section.html");
    setHrefByText(["conseil de departement", "conseil de département"], "/conseil-de-departement.html");
    setHrefByText(["textes legaux", "textes légaux"], "/textes-legaux-et-reglementaires-de-lesu.html");
    setHrefByText(["membre comite de gestion", "membre comité de gestion"], "/membre-comite-gestion.html");
    setHrefByText(["plan strategique", "plan stratégique", "plan strat"], "/plan-strategique.html");
  }

  function setHrefByText(patterns, href) {
    document.querySelectorAll('a[href="#"], a[href=""]').forEach(function (link) {
      var text = (link.textContent || "").trim().toLowerCase();
      if (patterns.some(function (pattern) { return text.indexOf(pattern) !== -1; })) {
        link.href = publicUrl(href);
      }
    });
  }

  function setHrefForText(patterns, href) {
    document.querySelectorAll("a").forEach(function (link) {
      var text = (link.textContent || "").trim().toLowerCase();
      if (patterns.some(function (pattern) { return text === pattern || text.indexOf(pattern) !== -1; })) {
        link.href = publicUrl(href);
      }
    });
  }

  function hideRemovedLinks() {
    document.querySelectorAll("a").forEach(function (link) {
      var href = (link.getAttribute("href") || "").toLowerCase();
      var text = (link.textContent || "").toLowerCase();
      if (
        text.trim() === "activités" ||
        text.trim() === "activites" ||
        text.indexOf("activit") !== -1 ||
        href.indexOf("activites-du-sgac") !== -1 ||
        href.indexOf("activites-du-sgr") !== -1 ||
        href.indexOf("activites-du-sgad") !== -1 ||
        href.indexOf("activites-de-l-ab") !== -1 ||
        href.indexOf("/en/") !== -1 ||
        href.indexOf("en/") === 0 ||
        href === "en.html" ||
        href === "/en.html" ||
        text.indexOf("plan strategique de l") !== -1 ||
        text.indexOf("futuris") !== -1 ||
        text.indexOf("fcoi") !== -1
      ) {
        var item = link.closest(".nav-item, li") || link;
        item.style.display = "none";
      }
    });
  }

  function removeDeadSiteLinks() {
    document.querySelectorAll('a[href="#"], a[href=""]').forEach(function (link) {
      if (link.closest("[data-portal-screen]")) return;
      if (link.closest(".dropdown, .dropdown-menu, .nav-item.has-children")) return;
      if (link.hasAttribute("data-bs-toggle") || link.getAttribute("role") === "button") return;
      if (link.className && String(link.className).indexOf("carousel-control") !== -1) return;
      if (!(link.textContent || "").trim()) return;

      var item = link.closest("li, .nav-item, .footer-link-item") || link;
      item.style.display = "none";
    });
  }

  function enableCardNavigation() {
    document.addEventListener("click", function (event) {
      var card = event.target.closest("[data-isc-card-url]");
      if (!card || event.target.closest("a, button, input, select, textarea, label")) return;
      var href = card.getAttribute("data-isc-card-url");
      if (href && href !== "#") window.location.href = href;
    });

    document.addEventListener("keydown", function (event) {
      if (event.key !== "Enter" && event.key !== " ") return;
      var card = event.target.closest("[data-isc-card-url]");
      if (!card) return;
      event.preventDefault();
      var href = card.getAttribute("data-isc-card-url");
      if (href && href !== "#") window.location.href = href;
    });
  }

  function ensureMobileNavigation() {
    var row = document.querySelector(".navbar .row");
    var navMain = document.querySelector(".nav-main");
    if (!row || !navMain) return;

    var button = row.querySelector(".mobile-menu-toggle");
    var created = false;
    if (!button) {
      button = document.createElement("button");
      button.className = "mobile-menu-toggle";
      button.type = "button";
      button.innerHTML = '<span></span><span></span><span></span><span class="sr-only">Menu</span>';
      button.setAttribute("data-isc-created-mobile-toggle", "true");
      row.insertBefore(button, row.firstChild);
      created = true;
    }

    button.setAttribute("aria-label", "Ouvrir le menu");
    button.setAttribute("aria-expanded", "false");
    syncMobileUtilityLinks(navMain);

    if (created || button.hasAttribute("data-isc-created-mobile-toggle")) {
      bindMobileMenu(button);
    }
  }

  function syncMobileUtilityLinks(navMain) {
    var topLinks = document.querySelector(".top-links");
    if (!topLinks || !navMain) return;

    var utilities = navMain.querySelector(".nav-mobile-utilities");
    if (!utilities) {
      utilities = document.createElement("div");
      utilities.className = "nav-mobile-utilities";
      navMain.insertBefore(utilities, navMain.firstChild);
    }

    utilities.innerHTML = "";
    topLinks.querySelectorAll("a").forEach(function (link) {
      var holder = link.closest("li") || link;
      if (holder.style && holder.style.display === "none") return;
      var clone = link.cloneNode(true);
      clone.removeAttribute("id");
      utilities.appendChild(clone);
    });
  }

  function bindMobileMenu(button) {
    if (!button || button.hasAttribute("data-isc-mobile-bound")) return;
    button.setAttribute("data-isc-mobile-bound", "true");

    function setOpen(open) {
      document.body.classList.toggle("mobile-menu-open", open);
      button.setAttribute("aria-expanded", open ? "true" : "false");
    }

    button.addEventListener("click", function (event) {
      event.preventDefault();
      setOpen(!document.body.classList.contains("mobile-menu-open"));
    });

    document.addEventListener("click", function (event) {
      if (event.target.closest(".navbar")) return;
      setOpen(false);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") setOpen(false);
    });
  }

  function ensureAdminLink() {
    var adminUrl = (config.routes && config.routes.admin && config.routes.admin.login) || "/admin/login";
    if (document.querySelector('[data-isc-admin-link]')) return;
    var topLinks = document.querySelector(".top-links") || document.querySelector(".top-bar-nav");
    if (!topLinks) return;

    var link = document.createElement("a");
    link.href = adminUrl;
    link.textContent = "Admin";
    link.title = "Espace administrateur";
    link.setAttribute("aria-label", "Ouvrir l'espace administrateur");
    link.setAttribute("data-isc-admin-link", "true");
    if (topLinks.tagName && topLinks.tagName.toLowerCase() === "ul") {
      var item = document.createElement("li");
      item.appendChild(link);
      topLinks.insertBefore(item, topLinks.firstChild);
    } else {
      topLinks.insertBefore(link, topLinks.firstChild);
    }
  }

  function silent() {}
})();
