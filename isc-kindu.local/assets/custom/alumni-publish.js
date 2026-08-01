(function () {
  var path = window.location.pathname.replace(/\\/g, "/").toLowerCase();
  var isAssociations = path.endsWith("/associations.html") || path.endsWith("/alumni/associations.html");
  var isOpportunities = path.endsWith("/opportunities.html") || path.endsWith("/alumni/opportunities.html");
  if (!isAssociations && !isOpportunities) return;

  var module = isAssociations ? "associations" : "opportunities";
  var storageKey = module === "associations" ? "isc-kindu-alumni-associations" : "isc-kindu-alumni-opportunities";
  var list = document.getElementById(module === "associations" ? "associationsList" : "offersList");
  if (!list) return;

  var items = readItems();
  injectPublishButton();
  injectModal();
  renderItems();
  bindSearchRefresh();

  function readItems() {
    try {
      var parsed = JSON.parse(window.localStorage.getItem(storageKey) || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function saveItems() {
    window.localStorage.setItem(storageKey, JSON.stringify(items));
  }

  function injectPublishButton() {
    var header = document.querySelector("main .row.mb-5 .col-12.text-center");
    if (!header || header.querySelector("[data-alumni-open-publish]")) return;

    var label = module === "associations" ? "Publier une association" : "Publier une opportunite";
    header.insertAdjacentHTML("beforeend",
      '<div class="alumni-publish-actions">' +
        '<button type="button" class="btn btn-warning btn-lg" data-bs-toggle="modal" data-bs-target="#alumniPublishModal" data-alumni-open-publish>' +
          '<i class="fas fa-plus-circle me-2"></i>' + escapeHtml(label) +
        '</button>' +
      '</div>'
    );
  }

  function injectModal() {
    if (document.getElementById("alumniPublishModal")) return;

    var title = module === "associations" ? "Publier une association" : "Publier une opportunite";
    var fields = module === "associations" ? associationFields() : opportunityFields();
    document.body.insertAdjacentHTML("beforeend",
      '<div class="modal fade alumni-publish-modal" id="alumniPublishModal" tabindex="-1" aria-hidden="true">' +
        '<div class="modal-dialog modal-lg modal-dialog-centered">' +
          '<div class="modal-content">' +
            '<div class="modal-header">' +
              '<h5 class="modal-title">' + escapeHtml(title) + '</h5>' +
              '<button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Fermer"></button>' +
            '</div>' +
            '<form data-alumni-publish-form>' +
              '<div class="modal-body">' +
                '<div class="row g-3">' + fields + '</div>' +
              '</div>' +
              '<div class="modal-footer">' +
                '<button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Annuler</button>' +
                '<button type="submit" class="btn btn-primary"><i class="fas fa-paper-plane me-2"></i>Publier</button>' +
              '</div>' +
            '</form>' +
          '</div>' +
        '</div>' +
      '</div>'
    );

    document.querySelector("[data-alumni-publish-form]").addEventListener("submit", submitForm);
  }

  function associationFields() {
    return [
      field("Nom de l'association", "title", "text", true, "col-md-6"),
      field("Responsable", "leader", "text", false, "col-md-6"),
      field("Section ou option", "section", "text", false, "col-md-6"),
      field("Lieu", "location", "text", false, "col-md-6"),
      field("Contact", "contact", "text", false, "col-md-12"),
      textarea("Description", "description", true)
    ].join("");
  }

  function opportunityFields() {
    return [
      field("Titre", "title", "text", true, "col-md-6"),
      select("Type", "type", ["Emploi", "Stage", "Bourse", "Formation", "Autre"], "col-md-6"),
      field("Organisation", "organization", "text", false, "col-md-6"),
      field("Lieu", "location", "text", false, "col-md-6"),
      field("Date limite", "deadline", "date", false, "col-md-6"),
      field("Contact", "contact", "text", false, "col-md-6"),
      textarea("Details", "description", true)
    ].join("");
  }

  function field(label, name, type, required, col) {
    return '<div class="' + col + '"><label class="form-label fw-bold">' + escapeHtml(label) + '</label>' +
      '<input class="form-control" name="' + escapeAttr(name) + '" type="' + escapeAttr(type) + '"' + (required ? " required" : "") + '></div>';
  }

  function select(label, name, options, col) {
    return '<div class="' + col + '"><label class="form-label fw-bold">' + escapeHtml(label) + '</label>' +
      '<select class="form-select" name="' + escapeAttr(name) + '">' +
      options.map(function (option) { return '<option value="' + escapeAttr(option.toLowerCase()) + '">' + escapeHtml(option) + '</option>'; }).join("") +
      '</select></div>';
  }

  function textarea(label, name, required) {
    return '<div class="col-12"><label class="form-label fw-bold">' + escapeHtml(label) + '</label>' +
      '<textarea class="form-control" rows="4" name="' + escapeAttr(name) + '"' + (required ? " required" : "") + '></textarea></div>';
  }

  function submitForm(event) {
    event.preventDefault();
    var form = event.currentTarget;
    var item = Object.fromEntries(new FormData(form).entries());
    item.id = String(Date.now());
    item.created_at = new Date().toLocaleDateString("fr-FR");
    items.unshift(item);
    saveItems();
    form.reset();
    closeModal();
    renderItems();
  }

  function closeModal() {
    var modalEl = document.getElementById("alumniPublishModal");
    if (!modalEl || !window.bootstrap) return;
    var modal = window.bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();
  }

  function renderItems() {
    list.querySelectorAll("[data-local-alumni-item]").forEach(function (node) { node.remove(); });
    if (module === "opportunities" && items.length) {
      list.querySelectorAll(".col-12").forEach(function (node) {
        if (!node.querySelector(".offer-card")) node.style.display = "none";
      });
    }

    items.slice().reverse().forEach(function (item) {
      list.insertAdjacentHTML("afterbegin", module === "associations" ? associationCard(item) : opportunityCard(item));
    });
    updateCounters();
    applyDynamicFilter();
  }

  function associationCard(item) {
    var title = item.title || "Association Alumni";
    var description = item.description || "";
    var location = item.location || "ISC KINDU";
    var section = item.section ? '<div class="mb-2"><i class="fas fa-layer-group text-muted me-2"></i><small class="text-muted">' + escapeHtml(item.section) + '</small></div>' : "";
    var contact = item.contact ? '<div class="mb-2"><i class="fas fa-phone text-muted me-2"></i><small class="text-muted">' + escapeHtml(item.contact) + '</small></div>' : "";

    return '<div class="col-lg-4 col-md-6 mb-4 association-card alumni-local-card" data-type="association" data-local-alumni-item>' +
      '<div class="card h-100 border-0 shadow-sm association-item">' +
        '<div class="card-header bg-primary text-white"><div class="d-flex justify-content-between align-items-center">' +
          '<h5 class="mb-0 fw-bold"><i class="fas fa-users me-2"></i>' + escapeHtml(title) + '</h5>' +
          '<span class="badge bg-light text-primary">Association</span>' +
        '</div></div>' +
        '<div class="card-body">' +
          '<p class="text-muted mb-3">' + escapeHtml(description) + '</p>' +
          '<div class="row text-center mb-3"><div class="col-6"><div class="text-primary"><i class="fas fa-user-friends fa-2x mb-2"></i><div class="fw-bold">0</div><small class="text-muted">Membres</small></div></div>' +
          '<div class="col-6"><div class="text-success"><i class="fas fa-calendar-alt fa-2x mb-2"></i><div class="fw-bold">' + new Date().getFullYear() + '</div><small class="text-muted">Creee</small></div></div></div>' +
          section + '<div class="mb-2"><i class="fas fa-map-marker-alt text-muted me-2"></i><small class="text-muted">' + escapeHtml(location) + '</small></div>' + contact +
        '</div>' +
        '<div class="card-footer bg-transparent"><div class="d-grid gap-2"><button type="button" class="btn btn-outline-success btn-sm" disabled><i class="fas fa-check me-2"></i>Publiee localement</button></div></div>' +
      '</div></div>';
  }

  function opportunityCard(item) {
    var title = item.title || "Opportunite";
    var type = item.type || "autre";
    var location = item.location || "";
    var organization = item.organization || "ISC KINDU";
    var deadline = item.deadline ? '<div class="mb-2"><i class="fas fa-calendar text-muted me-2"></i><small class="text-muted">Date limite: ' + escapeHtml(item.deadline) + '</small></div>' : "";
    var contact = item.contact ? '<div class="mb-2"><i class="fas fa-envelope text-muted me-2"></i><small class="text-muted">' + escapeHtml(item.contact) + '</small></div>' : "";

    return '<div class="col-lg-4 col-md-6 mb-4 offer-card alumni-local-card" data-type="' + escapeAttr(type) + '" data-location="' + escapeAttr(location) + '" data-local-alumni-item>' +
      '<div class="card h-100 border-0 shadow-sm">' +
        '<div class="card-header bg-primary text-white"><div class="d-flex justify-content-between align-items-center">' +
          '<h5 class="card-title mb-0 fw-bold"><i class="fas fa-briefcase me-2"></i>' + escapeHtml(title) + '</h5>' +
          '<span class="badge bg-light text-primary">' + escapeHtml(type) + '</span>' +
        '</div></div>' +
        '<div class="card-body">' +
          '<p class="text-muted mb-3">' + escapeHtml(item.description || "") + '</p>' +
          '<div class="mb-2"><i class="fas fa-building text-muted me-2"></i><small class="text-muted">' + escapeHtml(organization) + '</small></div>' +
          (location ? '<div class="mb-2"><i class="fas fa-map-marker-alt text-muted me-2"></i><small class="text-muted">' + escapeHtml(location) + '</small></div>' : "") +
          deadline + contact +
        '</div>' +
        '<div class="card-footer bg-transparent"><button type="button" class="btn btn-outline-primary btn-sm w-100" disabled><i class="fas fa-check me-2"></i>Publiee localement</button></div>' +
      '</div></div>';
  }

  function updateCounters() {
    var counter = document.querySelector("main .row.mb-5 .card h3");
    if (!counter) return;
    var base = Number(counter.getAttribute("data-base-count"));
    if (Number.isNaN(base)) {
      base = parseInt(counter.textContent, 10) || 0;
      counter.setAttribute("data-base-count", String(base));
    }
    counter.textContent = String(base + items.length);
  }

  function bindSearchRefresh() {
    ["searchOffers", "filterType", "filterLocation"].forEach(function (id) {
      var input = document.getElementById(id);
      if (input) input.addEventListener("input", applyDynamicFilter);
      if (input) input.addEventListener("change", applyDynamicFilter);
    });
  }

  function applyDynamicFilter() {
    if (module !== "opportunities") return;
    var searchInput = document.getElementById("searchOffers");
    var typeInput = document.getElementById("filterType");
    var locationInput = document.getElementById("filterLocation");
    var noResults = document.getElementById("noResults");
    if (!searchInput || !typeInput || !locationInput) return;

    var searchTerm = searchInput.value.toLowerCase();
    var selectedType = typeInput.value;
    var selectedLocation = locationInput.value;
    var visibleCount = 0;

    document.querySelectorAll(".offer-card").forEach(function (card) {
      var title = (card.querySelector(".card-title") || card).textContent.toLowerCase();
      var matchesSearch = title.indexOf(searchTerm) !== -1;
      var matchesType = !selectedType || card.getAttribute("data-type") === selectedType;
      var matchesLocation = !selectedLocation || card.getAttribute("data-location") === selectedLocation;
      var isVisible = matchesSearch && matchesType && matchesLocation;
      card.style.display = isVisible ? "block" : "none";
      if (isVisible) visibleCount++;
    });

    if (noResults) noResults.style.display = visibleCount ? "none" : "block";
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
