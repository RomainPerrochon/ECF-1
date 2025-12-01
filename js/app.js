var movies = [
{ titre: "Deadpool", annee: 2016, auteur: "Tim Miller" },

{ titre: "Spiderman", annee: 2002, auteur: "Sam Remi" },

{ titre: "Scream", annee: 1996, auteur: "Wes Craven" },

{ titre: "It: chapter 1", annee: 2019, auteur: "Andy Muschietti" },
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
function capitalizeFirstLetter(str) {
    if (!str) return str;
    return str.trim().charAt(0).toUpperCase() + str.trim().slice(1);
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
    data.forEach((movie, index) => {
        const tr = document.createElement("tr");

    tr.innerHTML = `
            <td>${movie.titre}</td>
            <td>${movie.annee}</td>
            <td>${movie.auteur}</td>
            <td class="text-end">
                <button class="btn btn-sm btn-outline-danger" data-index="${index}">Supprimer</button>
            </td>
        `;

        tbody.appendChild(tr);
    });
}

// Tri
function sortMovies() {
    const mode = selectTri.value;
    if (mode === "titre") {
        movies.sort((a, b) =>
        a.titre.localeCompare(b.titre, "fr", { sensitivity: "base" })
        );
    } else if (mode === "annee") {
    movies.sort((a, b) => b.annee - a.annee);
}
renderTable(movies);
}

// Suppression
tbody.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-index]");
    if (!btn) return;
    const index = Number(btn.getAttribute("data-index"));
    const movie = movies[index];
    const confirmed = window.confirm(
    `Confirmer la suppression de "${movie.titre}" ?`
    );
    if (confirmed) {
        movies.splice(index, 1);
        renderTable(movies);
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
    const isYearValid =
    /^\d{4}$/.test(anneeRaw) && annee >= 1900 && annee <= currentYear;

    if (!isYearValid)
    errors.push(`Année (format AAAA, entre 1900 et ${currentYear})`);

    if (auteurRaw.length < 5) errors.push("Auteur (≥ 5 caractères)");

    if (errors.length > 0) {
        const msg = "Erreur dans le formulaire: " + errors.join(", ");
        showAlert("danger", msg, 5000);
        return;
    }

    // Normalisation (lettre en majuscule)
    const titre = capitalizeFirstLetter(titreRaw);
    // Pour l’auteur, mettre la première lettre globale en majuscule et garder le reste tel quel (exigence: première lettre en MAJUSCULE)
    const auteur = capitalizeFirstLetter(auteurRaw);

    movies.push({ titre, annee, auteur });

    // Tri selon l’option sélectionnée après ajout
    sortMovies();

    addMovieModal.hide();
    showAlert("success", "Film ajouté avec succès", 3000);
});

// Tri manuel
btnApplySort.addEventListener("click", sortMovies);

// Initialisation
renderTable(movies);
sortMovies();
