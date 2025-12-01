var movies = [
  { id: Date.now() + 1, 
    titre: "Deadpool", 
    annee: 2016, 
    auteur: "Tim Miller" },
    
  { id: Date.now() + 2, 
    titre: "Spiderman", 
    annee: 2002, 
    auteur: "Sam Remi" },

  { id: Date.now() + 3, 
    titre: "Scream", 
    annee: 1996, 
    auteur: "Wes Craven" },

  { id: Date.now() + 4, 
    titre: "It: chapter 1", 
    annee: 2019, 
    auteur: "Andy Muschietti" },
];

const tbody = document.getElementById("movies-tbody");
const alertContainer = document.getElementById("alert-container");

const btnOpenForm = document.getElementById("btn-open-form");
const addMovieModalEl = document.getElementById("addMovieModal");
const addMovieModal = new bootstrap.Modal(addMovieModalEl);
const addMovieForm = document.getElementById("add-movie-form");

const selectTri = document.getElementById("select-tri");
const btnApplySort = document.getElementById("btn-apply-sort");

// Utils
function capitalizeWords(str) {
  if (!str) return str;
  return str
    .trim()
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

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

function renderTable(data) {
  tbody.innerHTML = "";
  if (!data || data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">Aucun film</td></tr>`;
    return;
  }
  data.forEach((movie, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${movie.titre}</td>
      <td>${movie.annee}</td>
      <td>${movie.auteur}</td>
      <td class="text-end">
        <button class="btn btn-sm btn-outline-danger btn-delete" data-id="${movie.id}">Supprimer</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Tri (utilise lodash _.orderBy - chargé via CDN)
function sortMoviesAndRender() {
  const mode = selectTri.value;
  let sorted = movies.slice(); // copie
  if (mode === "titre") {
    // tri alphabétique (insensible à la casse)
    sorted = _.orderBy(sorted, [m => m.titre.toLowerCase()], ["asc"]);
  } else if (mode === "annee") {
    // tri décroissant par année
    sorted = _.orderBy(sorted, ["annee"], ["desc"]);
  }
  renderTable(sorted);
}

// Suppression (en se basant sur data-id)
tbody.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-id]");
  if (!btn) return;
  const id = Number(btn.getAttribute("data-id"));
  const movie = movies.find(m => m.id === id);
  if (!movie) return;

  const confirmed = window.confirm(`Confirmer la suppression de "${movie.titre}" ?`);
  if (confirmed) {
    movies = movies.filter(m => m.id !== id);
    sortMoviesAndRender();
    showAlert("success", "Film supprimé avec succès", 3000);
  } else {
    showAlert("info", "Suppression annulée", 3000);
  }
});

// Formulaire
btnOpenForm.addEventListener("click", () => {
  addMovieForm.reset();
  addMovieModal.show();
});

addMovieForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const titreRaw = document.getElementById("input-title").value.trim();
  const anneeRaw = document.getElementById("input-year").value.trim();
  const auteurRaw = document.getElementById("input-author").value.trim();

  const errors = [];

  // Validation
  if (titreRaw.length < 2) errors.push("Titre (≥ 2 caractères)");
  const currentYear = new Date().getFullYear();
  const annee = Number(anneeRaw);
  const isYearValid = /^\d{4}$/.test(anneeRaw) && annee >= 1900 && annee <= currentYear;
  if (!isYearValid) errors.push(`Année (format AAAA, entre 1900 et ${currentYear})`);
  if (auteurRaw.length < 5) errors.push("Auteur (≥ 5 caractères)");

  if (errors.length > 0) {
    const msg = "Erreur dans le formulaire: " + errors.join(", ");
    showAlert("danger", msg, 5000);
    return;
  }

  // Normalisation (première lettre de chaque mot en MAJ)
  const titre = capitalizeWords(titreRaw);
  const auteur = capitalizeWords(auteurRaw);

  movies.push({ id: Date.now(), titre, annee, auteur });

  // Tri et rendu
  sortMoviesAndRender();

  addMovieModal.hide();
  showAlert("success", "Film ajouté avec succès", 3000);
});

// Tri manuel
btnApplySort.addEventListener("click", sortMoviesAndRender);

// Initialisation
sortMoviesAndRender();
