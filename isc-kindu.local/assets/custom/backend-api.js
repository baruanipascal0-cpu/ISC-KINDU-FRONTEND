(function () {
  var currentScript = document.currentScript;
  var metaOrigin = document.querySelector('meta[name="isc-backend-origin"]');
  var productionOrigin = "https://isc-kindu-backend.onrender.com";
  var explicitOrigin = (
    window.ISC_BACKEND_ORIGIN ||
    window.ISC_KINDU_BACKEND_URL ||
    (currentScript && currentScript.getAttribute("data-backend-origin")) ||
    (metaOrigin && metaOrigin.getAttribute("content")) ||
    storedOrigin() ||
    productionOrigin ||
    ""
  ).replace(/\/$/, "");
  var backendOrigin = explicitOrigin || productionOrigin;
  var displayOrigin = backendOrigin || window.location.origin;
  var apiBase = backendOrigin ? backendOrigin + "/api" : "/api";
  var adminBase = backendOrigin || "";

  window.ISC_BACKEND_API = {
    origin: displayOrigin,
    baseUrl: apiBase,
    routes: {
      site: { settings: "/api/site/settings", menus: "/api/site/menus", pages: "/api/pages", media: "/api/media" },
      blocks: { list: "/api/site/blocks", group: "/api/site/blocks/{group}" },
      home: { slides: "/api/home/slides", cards: "/api/home/cards", statistics: "/api/home/statistics" },
      sections: { sections: "/api/sections", programs: "/api/programs" },
      news: { list: "/api/news", categories: "/api/news/categories" },
      publications: { list: "/api/publications", downloads: "/api/publications/{slug}" },
      graduations: { list: "/api/graduation-lists", detail: "/api/graduation-lists/{slug}" },
      events: { list: "/api/events" },
      auth: { register: "/api/auth/register", login: "/api/auth/login", me: "/api/auth/me", logout: "/api/auth/logout" },
      admissions: { create: "/api/inscriptions", current: "/api/inscriptions/current", status: "/api/inscriptions/status" },
      student: { dashboard: "/api/student/dashboard", documents: "/api/student/documents", payments: "/api/student/payments", comments: "/api/student/comments", notifications: "/api/student/notifications" },
      contact: { messages: "/api/contact/messages", newsletter: "/api/newsletter" },
      admin: { login: adminBase + "/admin/login", dashboard: adminBase + "/admin", users: "/api/admin/users", admissions: "/api/admin/admissions", audit: "/api/admin/audit" }
    }
  };
  document.querySelectorAll("[data-api-endpoint]").forEach(function (node) {
    node.setAttribute("data-api-prepared", "true");
  });

  function storedOrigin() {
    try {
      return window.localStorage.getItem("ISC_BACKEND_ORIGIN") || "";
    } catch (error) {
      return "";
    }
  }
})();
