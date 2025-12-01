const alertContainer = document.getElementById("alert-container");
const form = document.getElementById("search-form");
const inputTitle = document.getElementById("search-title");
const inputYear = document.getElementById("search-year");
const selectType = document.getElementById("search-type");
const results = document.getElementById("results");
const pagination = document.getElementById("pagination");
const btnReset = document.getElementById("btn-reset");

// clé OMDB
const OMDB_API_KEY = "4d5ded75"; 

function showAlert(type, message, ms = 3000) {
    const wrapper = document.createElement("div");
  wrapper.innerHTML = `
      <div class="alert alert-${type} alert-dismissible fade show" role="alert">
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Fermer"></button>
      </div>
    `;

    alertContainer.appendChild(wrapper);
    setTimeout(() => {
        const alertEl = wrapper.querySelector(".alert");

        if (alertEl) {
            const bsAlert = new bootstrap.Alert(alertEl);
            bsAlert.close();
        }
    }, ms);
}

function buildQuery({ title, year, type, page }) {
    const url = new URL("https://www.omdbapi.com/");
    url.searchParams.set("apikey", OMDB_API_KEY);

    // Utilisation de 's' pour la recherche optimisée (titre partiel)
    url.searchParams.set("s", title);

    if (year) url.searchParams.set("y", year);
    if (type) url.searchParams.set("type", type);
    if (page) url.searchParams.set("page", page);

    return url.toString();
}

async function fetchResults(params) {
    const url = buildQuery(params);

    try {
        const res = await fetch(url);
        const data = await res.json();

        if (data.Response === "False") {
            results.innerHTML = "";
            pagination.innerHTML = "";
            showAlert("warning", data.Error || "Aucun résultat trouvé.", 4000);
            return { list: [], total: 0 };
        }

        const list = Array.isArray(data.Search) ? data.Search : [];
        const total = Number(data.totalResults || 0);
        renderResults(list);
        renderPagination(total, params);
        return { list, total };
    } catch (err) {
    console.error(err);
    showAlert("danger", "Erreur réseau. Réessayez plus tard.", 5000);
    return { list: [], total: 0 };
}
}

function renderResults(items) {
    results.innerHTML = "";
    if (items.length === 0) return;

    items.forEach((item) => {
        const col = document.createElement("div");
        col.className = "col-12 col-sm-6 col-md-4 col-lg-3";

        const poster =
        item.Poster && item.Poster !== "N/A"
        ? item.Poster
        : "./img/fallback-poster.jpg";

    col.innerHTML = `
          <div class="card h-100">
            <img src="${poster}" class="card-img-top" alt="Poster ${
      item.Title
    }">
            <div class="card-body">
              <h3 class="h6 card-title mb-1">${item.Title}</h3>
              <p class="card-text text-muted mb-0">Année: ${item.Year}</p>
              ${
                item.Type
                  ? `<span class="badge bg-secondary mt-2">${item.Type}</span>`
                  : ""
              }
            </div>
          </div>
        `;
        results.appendChild(col);
    });
}

function renderPagination(total, params) {
    pagination.innerHTML = "";
    const pages = Math.ceil(total / 10); // OMDB renvoie 10 éléments par page

    if (pages <= 1) return;

    const currentPage = Number(params.page || 1);
    const createPageItem = (
    pageNum,
    label = pageNum,
    disabled = false,
    active = false
    ) => {
        const li = document.createElement("li");
    li.className = `page-item ${disabled ? "disabled" : ""} ${
      active ? "active" : ""
    }`;
    const a = document.createElement("a");
    a.className = "page-link";
    a.href = "#";
    a.textContent = label;
    a.addEventListener("click", (e) => {
        e.preventDefault();
        if (disabled) return;
        doSearch({ ...params, page: pageNum });
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
    li.appendChild(a);
    return li;
};

// Précédent
pagination.appendChild(
createPageItem(currentPage - 1, "«", currentPage <= 1)
);

// Pages
const maxToShow = 7;
let start = Math.max(1, currentPage - 3);
let end = Math.min(pages, start + maxToShow - 1);

if (end - start + 1 < maxToShow) {
    start = Math.max(1, end - maxToShow + 1);
}

for (let p = start; p <= end; p++) {
    pagination.appendChild(
    createPageItem(p, String(p), false, p === currentPage)
    );
}

// Suivant
pagination.appendChild(
createPageItem(currentPage + 1, "»", currentPage >= pages)
);
}

function doSearch({ title, year, type, page = 1 }) {
    // Nettoyage des paramètres
    const q = {
        title: title.trim(),
        year: year ? String(year).trim() : "",
        type: type ? type.trim() : "",
        page,
    };

    if (q.title.length < 2) {
        showAlert("warning", "Le titre doit contenir au moins 2 caractères.", 4000);
        return;
    }

    fetchResults(q);
}

// Listeners
form.addEventListener("submit", (e) => {
    e.preventDefault();
    doSearch({
        title: inputTitle.value,
        year: inputYear.value,
        type: selectType.value,
        page: 1,
    });
});

btnReset.addEventListener("click", () => {
    form.reset();
    results.innerHTML = "";
    pagination.innerHTML = "";
});
