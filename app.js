
console.log("MY SHOWS EST BIEN CONNECTÉ 💜");

// Les séries sont conservées dans le navigateur
let mySeries = JSON.parse(localStorage.getItem("mySeries")) || [];

const main = document.querySelector("main");
const seriesList = document.getElementById("series-list");
const seriesCount = document.getElementById("series-count");

// Importer une bibliothèque depuis un fichier JSON
const importButton = document.getElementById("import-library-button");
const importFile = document.getElementById("import-library-file");


importButton.addEventListener("click", event => {
    event.preventDefault();
    event.stopPropagation();
    importFile.click();
});


importFile.addEventListener("change", async () => {
    const file = importFile.files[0];

    if (!file) return;

    try {
        const importedSeries = JSON.parse(await file.text());

        if (!Array.isArray(importedSeries)) {
            throw new Error("Fichier invalide");
        }

        if (!confirm(
            "Importer " + importedSeries.length +
            " séries ? Cela remplacera la bibliothèque actuelle sur cet appareil."
        )) {
            importFile.value = "";
            return;
        }

        mySeries = importedSeries;
        localStorage.setItem("mySeries", JSON.stringify(mySeries));

        alert(importedSeries.length + " séries importées avec succès ! 💜");
        location.reload();

    } catch (error) {
        alert("Impossible d'importer ce fichier : " + error.message);
    }

    importFile.value = "";
});

// Création de la page Découvrir
const discoverPage = document.createElement("section");
discoverPage.id = "discover-page";
discoverPage.style.display = "none";


discoverPage.innerHTML = `
    <div class="section-heading">
        <div>
            <p class="eyebrow">TON PROCHAIN COUP DE CŒUR</p>
            <h2>Découvrir ✨</h2>
        </div>
    </div>

    <input
        id="search"
        class="discover-search"
        type="text"
        placeholder="⌕  Rechercher une série..."
    >

    <div id="suggestions" class="suggestion-list"></div>

    <div id="recommendations">
        <p class="empty-message">Chargement de tes découvertes... 💜</p>
    </div>

    <div class="manual-add-box">
        <h3>Une série introuvable ?</h3>
        <input id="manual-title" type="text" placeholder="Nom de la série">
        <button id="manual-add">Ajouter à ma bibliothèque +</button>
    </div>
`;



main.appendChild(discoverPage);
// Page de détail d'une série
const detailPage = document.createElement("section");
detailPage.id = "detail-page";
detailPage.style.display = "none";

detailPage.innerHTML = `
    <button id="back-to-home" class="text-button">
        ← Retour à ma bibliothèque
    </button>

    <div id="detail-content" style="margin-top:25px;">
    </div>
`;

main.appendChild(detailPage);

const searchInput = document.getElementById("search");
const suggestions = document.getElementById("suggestions");

// Afficher les séries

let currentSeriesFilter = "all";

const seriesStatuses = {
    to_start: "À commencer",
    watching: "En cours",
    up_to_date: "À jour",
    completed: "Terminée",
    abandoned: "Abandonnée"
};



function getInitialSeriesStatus(show) {
    if (show.statusManuallySet && show.seriesStatus === "abandoned") {
        return "abandoned";
    }

    if (["abandoned", "dropped"].includes(
        (show.tvTimeStatus || "").toLowerCase()
    )) {
        return "abandoned";
    }

    const watchedCount = (show.watchedEpisodes || []).length;
    const totalEpisodes = show.totalEpisodes || 0;
    const tvMazeStatus = (show.tvMazeStatus || "").toLowerCase();

    if (watchedCount === 0) {
        return "to_start";
    }

    if (totalEpisodes > 0 && watchedCount < totalEpisodes) {
        return "watching";
    }

    if (totalEpisodes > 0 && watchedCount >= totalEpisodes) {
        return tvMazeStatus === "ended" ? "completed" : "up_to_date";
    }

    return "watching";
}


const filterBar = document.createElement("div");
filterBar.style.display = "flex";
filterBar.style.flexWrap = "wrap";
filterBar.style.gap = "8px";
filterBar.style.marginBottom = "18px";

seriesList.parentElement.insertBefore(filterBar, seriesList);

function displaySeries() {
    seriesList.innerHTML = "";
    filterBar.innerHTML = "";

    const filters = [
        ["all", "Toutes"],
        ["to_start", "À commencer"],
        ["watching", "En cours"],
        ["up_to_date", "À jour"],
        ["completed", "Terminées"],
        ["abandoned", "Abandonnées"]
    ];

    filters.forEach(([key, label]) => {
        const button = document.createElement("button");
        button.textContent = label;
        button.style.padding = "9px 12px";
        button.style.borderRadius = "20px";
        button.style.border = "1px solid #3a3947";
        button.style.background =
            currentSeriesFilter === key ? "#b8a0ed" : "#22222c";
        button.style.color =
            currentSeriesFilter === key ? "#17171d" : "#f5f3fa";
        button.style.fontSize = "11px";
        button.style.cursor = "pointer";

        button.addEventListener("click", () => {
            currentSeriesFilter = key;
            displaySeries();
        });

        filterBar.appendChild(button);
    });

    seriesCount.textContent =
        mySeries.length + (mySeries.length > 1 ? " séries" : " série");

    mySeries.forEach(show => {
        show.seriesStatus = getInitialSeriesStatus(show);
    });

    localStorage.setItem("mySeries", JSON.stringify(mySeries));

    const visibleSeries = mySeries.filter(show =>
        currentSeriesFilter === "all" ||
        show.seriesStatus === currentSeriesFilter
    );

    if (visibleSeries.length === 0) {
        seriesList.innerHTML =
            '<p class="empty-message">Aucune série dans cette catégorie 💜</p>';
        return;
    }

    visibleSeries.forEach(show => {
        const card = document.createElement("div");
        card.className = "serie";
        card.style.display = "flex";
        card.style.alignItems = "center";
        card.style.gap = "15px";

        if (show.image) {
            const poster = document.createElement("img");
            poster.src = show.image;
            poster.alt = "";
            poster.style.width = "75px";
            poster.style.height = "110px";
            poster.style.objectFit = "cover";
            poster.style.borderRadius = "8px";
            card.appendChild(poster);
        }

        const info = document.createElement("div");
        info.style.flex = "1";
        info.style.minWidth = "0";

        const titleRow = document.createElement("div");
        titleRow.style.display = "flex";
        titleRow.style.alignItems = "center";
        titleRow.style.justifyContent = "space-between";
        titleRow.style.gap = "8px";

        const title = document.createElement("strong");
        title.textContent = show.name;
        titleRow.appendChild(title);

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "✕";
        deleteButton.style.background = "none";
        deleteButton.style.border = "none";
        deleteButton.style.color = "#9997a8";
        deleteButton.style.fontSize = "18px";
        deleteButton.style.cursor = "pointer";

        deleteButton.addEventListener("click", event => {
            event.stopPropagation();

            if (confirm("Supprimer " + show.name + " de ta bibliothèque ?")) {
                mySeries = mySeries.filter(
                    serie => serie.id !== show.id
                );
                localStorage.setItem("mySeries", JSON.stringify(mySeries));
                displaySeries();
            }
        });

        titleRow.appendChild(deleteButton);
        info.appendChild(titleRow);

        const statusSelect = document.createElement("select");
        statusSelect.style.marginTop = "9px";
        statusSelect.style.padding = "6px";
        statusSelect.style.borderRadius = "8px";
        statusSelect.style.background = "#2d2d39";
        statusSelect.style.color = "#b8a0ed";
        statusSelect.style.border = "1px solid #454354";
        statusSelect.style.fontSize = "11px";

        Object.entries(seriesStatuses).forEach(([value, label]) => {
            const option = document.createElement("option");
            option.value = value;
            option.textContent = label;
            statusSelect.appendChild(option);
        });

        statusSelect.value = show.seriesStatus;

        statusSelect.addEventListener("click", event => {
            event.stopPropagation();
        });

        
statusSelect.addEventListener("change", event => {
    event.stopPropagation();

    if (statusSelect.value === "abandoned") {
        show.seriesStatus = "abandoned";
        show.statusManuallySet = true;
    } else {
        show.statusManuallySet = false;
        show.tvTimeStatus = "";
        delete show.seriesStatus;
    }

    localStorage.setItem("mySeries", JSON.stringify(mySeries));
    displaySeries();
});


        info.appendChild(statusSelect);

        const watchedCount = (show.watchedEpisodes || []).length;
        const totalEpisodes = show.totalEpisodes || 0;

        const percentage = totalEpisodes > 0
            ? Math.min(100, Math.round(watchedCount / totalEpisodes * 100))
            : 0;

        const nextEpisode = (show.episodesList || []).find(ep =>
            !(show.watchedEpisodes || []).includes(String(ep.id))
        );

        const progress = document.createElement("p");
        progress.style.marginTop = "8px";
        progress.style.fontSize = "12px";
        progress.style.color = "#b8a0ed";

        if (nextEpisode) {
            progress.textContent =
                "Saison " + nextEpisode.season +
                " · Épisode " + nextEpisode.number + " à regarder";
        } else if (totalEpisodes > 0) {
            progress.textContent = "Tous les épisodes vus ! 🎉";
        } else {
            progress.textContent = "Progression à renseigner";
        }

        info.appendChild(progress);

        const progressBar = document.createElement("div");
        progressBar.style.height = "6px";
        progressBar.style.background = "#3a3947";
        progressBar.style.borderRadius = "10px";
        progressBar.style.marginTop = "10px";
        progressBar.style.overflow = "hidden";

        const progressFill = document.createElement("div");
        progressFill.style.height = "100%";
        progressFill.style.background = "#b8a0ed";
        progressFill.style.width = percentage + "%";

        progressBar.appendChild(progressFill);
        info.appendChild(progressBar);

        card.appendChild(info);
        card.style.cursor = "pointer";

        card.addEventListener("click", () => openSeries(show));

        seriesList.appendChild(card);
    });
}


// Ajouter une série
function addSeries(show) {
    if (mySeries.some(serie => serie.id === show.id)) {
        alert("Cette série est déjà dans ta bibliothèque !");
        return;
    }

    mySeries.push(show);
    localStorage.setItem("mySeries", JSON.stringify(mySeries));

    displaySeries();
    suggestions.innerHTML = "";
    searchInput.value = "";
}


// Rechercher automatiquement

function createShowCard(show) {
    const card = document.createElement("div");
    card.className = "discovery-card";

    const poster = document.createElement("img");
    poster.className = "discovery-poster";
    poster.src = show.image?.medium || "";
    poster.alt = show.name;

    const title = document.createElement("strong");
    title.textContent = show.name;

    const addButton = document.createElement("button");
    addButton.className = "discovery-add";
    
    const alreadyAdded = mySeries.some(
        serie => String(serie.id) === String(show.id)
    );

    addButton.textContent = alreadyAdded ? "Ajoutée ✓" : "+ Ajouter";
    addButton.disabled = alreadyAdded;

    addButton.addEventListener("click", () => {
        addSeries({
            id: show.id,
            name: show.name,
            image: show.image?.medium || ""
        });
        addButton.textContent = "Ajoutée ✓";
        addButton.disabled = true;
    });

    card.appendChild(poster);
    card.appendChild(title);
    card.appendChild(addButton);

    return card;
}

// Recherche de séries
searchInput.addEventListener("input", async function () {
    const query = searchInput.value.trim();
    suggestions.innerHTML = "";

    if (query.length < 2) return;

    try {
        const response = await fetch(
            `https://api.tvmaze.com/search/shows?q=${encodeURIComponent(query)}`
        );

        const results = await response.json();

        results.slice(0, 10).forEach(result => {
            suggestions.appendChild(createShowCard(result.show));
        });
    } catch (error) {
        suggestions.textContent = "Impossible de charger les résultats.";
        console.error(error);
    }
});

// Affiches de recommandations
async function loadRecommendations() {
    const container = document.getElementById("recommendations");
    container.innerHTML = "";

    const categories = [
        {
            title: "✨ Pour commencer",
            shows: ["Frieren", "Spy x Family", "Violet Evergarden", "Demon Slayer"]
        },
        {
            title: "🔥 Les incontournables",
            shows: ["Wednesday", "Stranger Things", "The Last of Us", "Sherlock"]
        }
    ];

    for (const category of categories) {
        const section = document.createElement("section");
        section.className = "discovery-section";

        const heading = document.createElement("h3");
        heading.textContent = category.title;

        const shelf = document.createElement("div");
        shelf.className = "discovery-shelf";

        section.appendChild(heading);
        section.appendChild(shelf);
        container.appendChild(section);

        const results = await Promise.all(
            category.shows.map(async name => {
                try {
                    const response = await fetch(
                        `https://api.tvmaze.com/search/shows?q=${encodeURIComponent(name)}`
                    );
                    const data = await response.json();
                    return data[0]?.show || null;
                } catch (error) {
                    return null;
                }
            })
        );

        results.filter(Boolean).forEach(show => {
            shelf.appendChild(createShowCard(show));
        });
    }
}

loadRecommendations();


// Ajouter manuellement
document.getElementById("manual-add").addEventListener("click", function () {
    const titleInput = document.getElementById("manual-title");
    const name = titleInput.value.trim();

    if (!name) {
        alert("Écris le nom de ta série !");
        return;
    }

    addSeries({
        id: "manual-" + Date.now(),
        name: name,
        image: ""
    });

    titleInput.value = "";
});
// Ouvrir la fiche d'une série
async function openSeries(show) {
    document.querySelectorAll("main > section").forEach(section => {
        section.style.display = "none";
    });

    detailPage.style.display = "";

    const content = document.getElementById("detail-content");
    content.innerHTML = "<p>Chargement des informations...</p>";

    try {
        const response = await fetch(
            `https://api.tvmaze.com/shows/${show.id}`
        );

        const details = await response.json();

        content.innerHTML = "";

        if (details.image?.original || show.image) {
            const poster = document.createElement("img");
            poster.src = details.image?.original || show.image;
            poster.alt = "";
            poster.style.width = "150px";
            poster.style.borderRadius = "12px";
            poster.style.display = "block";
            poster.style.marginBottom = "20px";
            content.appendChild(poster);
        }

        const title = document.createElement("h2");
        title.textContent = details.name || show.name;
        content.appendChild(title);

        const summary = document.createElement("div");
        summary.innerHTML = details.summary || "Aucun résumé disponible.";
        summary.style.marginTop = "15px";
        summary.style.lineHeight = "1.6";
        content.appendChild(summary);

        // Récupérer les saisons et les épisodes
const episodesResponse = await fetch(
    `https://api.tvmaze.com/shows/${show.id}/episodes`
);

const episodes = await episodesResponse.json();
show.totalEpisodes = episodes.length;

show.episodesList = episodes.map(ep => ({
    id: String(ep.id),
    season: ep.season,
    number: ep.number,
    name: ep.name,
    airdate: ep.airdate || "",
    airtime: ep.airtime || "",
    airstamp: ep.airstamp || "",
    runtime: ep.runtime || null
}));

localStorage.setItem("mySeries", JSON.stringify(mySeries));

// Actualiser la bibliothèque avec le nombre total d'épisodes
displaySeries();

const seasons = {};

episodes.forEach(episode => {
    const seasonNumber = episode.season;

    if (!seasons[seasonNumber]) {
        seasons[seasonNumber] = [];
    }

    seasons[seasonNumber].push(episode);
});

const seasonsTitle = document.createElement("h3");
seasonsTitle.textContent = "Saisons et épisodes";
seasonsTitle.style.marginTop = "30px";
content.appendChild(seasonsTitle);


// Tous les épisodes dans l'ordre
const allEpisodes = episodes.slice().sort((a, b) =>
    a.season - b.season || a.number - b.number
);

// Progression sauvegardée
show.watchedEpisodes = show.watchedEpisodes || [];
show.watchMode = show.watchMode || "manual";

const watched = new Set(show.watchedEpisodes.map(String));

// Choix du mode de suivi
const modeContainer = document.createElement("div");
modeContainer.style.marginTop = "25px";

const modeLabel = document.createElement("label");
modeLabel.textContent = "Mode de suivi : ";
modeLabel.style.fontWeight = "bold";

const modeSelect = document.createElement("select");
modeSelect.style.marginLeft = "10px";
modeSelect.style.padding = "8px";
modeSelect.style.borderRadius = "8px";
modeSelect.innerHTML = `
    <option value="manual">Manuel</option>
    <option value="automatic">Automatique</option>
`;
modeSelect.value = show.watchMode;

modeContainer.appendChild(modeLabel);
modeContainer.appendChild(modeSelect);
content.appendChild(modeContainer);

// Sauvegarder la progression
function saveProgress() {
    show.watchedEpisodes = [...watched];
    show.watchMode = modeSelect.value;
    localStorage.setItem("mySeries", JSON.stringify(mySeries));
}

// Afficher les saisons
Object.keys(seasons).forEach(seasonNumber => {
    const seasonMenu = document.createElement("details");
    seasonMenu.style.marginTop = "15px";
    seasonMenu.style.background = "#22222c";
    seasonMenu.style.borderRadius = "12px";
    seasonMenu.style.padding = "15px";

    const seasonTitle = document.createElement("summary");
    seasonTitle.textContent = "Saison " + seasonNumber;
    seasonTitle.style.cursor = "pointer";
    seasonTitle.style.fontWeight = "bold";
    seasonMenu.appendChild(seasonTitle);

    seasons[seasonNumber].forEach(episode => {
        const line = document.createElement("label");
        line.style.display = "flex";
        line.style.alignItems = "center";
        line.style.gap = "10px";
        line.style.marginTop = "12px";
        line.style.cursor = "pointer";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = watched.has(String(episode.id));
        checkbox.dataset.episodeId = episode.id;

        const episodeName = document.createElement("span");
        episodeName.textContent =
            "Épisode " + episode.number + " : " + episode.name;

        checkbox.addEventListener("change", function () {
            const index = allEpisodes.findIndex(
                ep => String(ep.id) === String(episode.id)
            );

            if (checkbox.checked) {
                if (modeSelect.value === "automatic") {
                    allEpisodes.slice(0, index + 1).forEach(ep => {
                        watched.add(String(ep.id));
                    });
                } else {
                    watched.add(String(episode.id));
                }
            } else {
                watched.delete(String(episode.id));
            }

            document.querySelectorAll("[data-episode-id]").forEach(box => {
                box.checked = watched.has(box.dataset.episodeId);
            });

            saveProgress();
        });

        line.appendChild(checkbox);
        line.appendChild(episodeName);
        seasonMenu.appendChild(line);
    });

    content.appendChild(seasonMenu);
});

// Sauvegarder le mode choisi
modeSelect.addEventListener("change", saveProgress);


        const info = document.createElement("p");
        info.textContent =
            "Statut : " + (details.status || "Inconnu");
        info.style.marginTop = "15px";
        content.appendChild(info);

    } catch (error) {
        content.textContent =
            "Impossible de charger les informations pour le moment.";
        console.error(error);
    }
}

// Retour à la bibliothèque
document.getElementById("back-to-home").addEventListener("click", function () {
    detailPage.style.display = "none";
    document.querySelector(".upcoming-section").style.display = "";
    document.querySelector(".library-section").style.display = "";

    document.querySelectorAll(".nav-button").forEach(nav => {
        nav.classList.toggle("active", nav.dataset.page === "home");
    });
});



async function loadCalendar() {
    const calendarList = document.getElementById("calendar-list");
    const upcomingList = document.getElementById("upcoming-list");

    const loading =
        '<p class="empty-message">Recherche des prochaines sorties... 💜</p>';

    if (calendarList) calendarList.innerHTML = loading;
    if (upcomingList) upcomingList.innerHTML = loading;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const limit = new Date(today);
    limit.setDate(limit.getDate() + 30);

    const seriesToCheck = mySeries.filter(show =>
        !String(show.id).startsWith("manual-") &&
        show.id
    );

    const upcoming = [];

    // On récupère les épisodes directement depuis chaque série
    for (let i = 0; i < seriesToCheck.length; i += 5) {
        const batch = seriesToCheck.slice(i, i + 5);

        const results = await Promise.all(
            batch.map(async show => {
                try {
                    const controller = new AbortController();
                    const timeout = setTimeout(
                        () => controller.abort(),
                        10000
                    );

                    const response = await fetch(
                        `https://api.tvmaze.com/shows/${show.id}/episodes`,
                        { signal: controller.signal }
                    );

                    clearTimeout(timeout);

                    if (!response.ok) return [];

                    const episodes = await response.json();

                    return episodes
                        .filter(ep => {
                            if (!ep.airdate) return false;

                            const date = new Date(ep.airdate + "T12:00:00");

                            return date >= today && date <= limit;
                        })
                        .map(ep => ({ show, episode: ep }));

                } catch (error) {
                    console.error(
                        "Erreur pour " + show.name + " :",
                        error
                    );
                    return [];
                }
            })
        );

        results.flat().forEach(item => upcoming.push(item));
    }

    upcoming.sort((a, b) =>
        a.episode.airdate.localeCompare(b.episode.airdate)
    );

   
function displayEpisodes(container, episodes) {
    if (!container) return;

    container.innerHTML = "";

    if (episodes.length === 0) {
        container.innerHTML =
            '<p class="empty-message">Aucune sortie annoncée pour tes séries dans les 30 prochains jours 💜</p>';
        return;
    }

    // Regrouper les épisodes par date
    const groupedEpisodes = {};

    episodes.forEach(({ show, episode }) => {
        const date = episode.airdate;

        if (!groupedEpisodes[date]) {
            groupedEpisodes[date] = [];
        }

        groupedEpisodes[date].push({ show, episode });
    });

    // Créer une section pour chaque journée
    Object.keys(groupedEpisodes).sort().forEach(dateString => {
        const date = new Date(dateString + "T12:00:00");

        const daySection = document.createElement("div");
        daySection.style.marginBottom = "25px";

        const dayTitle = document.createElement("h3");
        dayTitle.textContent = date.toLocaleDateString("fr-FR", {
            weekday: "long",
            day: "numeric",
            month: "long"
        });

        dayTitle.style.textTransform = "capitalize";
        dayTitle.style.marginBottom = "12px";
        daySection.appendChild(dayTitle);

        groupedEpisodes[dateString].forEach(({ show, episode }) => {
            const card = document.createElement("div");
            card.className = "serie";
            card.style.cursor = "pointer";
card.addEventListener("click", () => {
    openSeries(show);
});
            card.style.display = "flex";
            card.style.alignItems = "center";
            card.style.gap = "15px";
            card.style.marginBottom = "12px";

            if (show.image) {
                const poster = document.createElement("img");
                poster.src = show.image;
                poster.alt = "";
                poster.style.width = "65px";
                poster.style.borderRadius = "8px";
                card.appendChild(poster);
            }

            const info = document.createElement("div");

            const title = document.createElement("strong");
            title.textContent = show.name;

            const episodeInfo = document.createElement("p");
            episodeInfo.textContent =
                "Saison " + episode.season +
                " · Épisode " + episode.number;

            info.appendChild(title);
            info.appendChild(episodeInfo);

            card.appendChild(info);
            daySection.appendChild(card);
        });

        container.appendChild(daySection);
    });
}


    displayEpisodes(calendarList, upcoming);
const upcomingDates = [...new Set(
    upcoming.map(item => item.episode.airdate)
)].sort();

const homeEpisodes = upcoming.filter(item =>
    upcomingDates.slice(0, 3).includes(item.episode.airdate)
);

displayEpisodes(upcomingList, homeEpisodes);

    console.log(
        "Calendrier chargé :",
        upcoming.length,
        "épisodes à venir"
    );
}

 // Navigation
document.querySelectorAll(".nav-button, .text-button").forEach(button => {
    button.addEventListener("click", function () {
        const page = button.dataset.page;

        document.querySelectorAll("main > section").forEach(section => {
            section.style.display = "none";
        });

        if (page === "home") {
            document.querySelector(".upcoming-section").style.display = "";
            document.querySelector(".library-section").style.display = "";
        } else if (page === "discover") {
            discoverPage.style.display = "";
        } else if (page === "calendar") {
            document.getElementById("calendar-page").style.display = "";
            loadCalendar();
        } else {
            alert("Cette rubrique arrive bientôt 💜");
            document.querySelector(".upcoming-section").style.display = "";
            document.querySelector(".library-section").style.display = "";
        }

        document.querySelectorAll(".nav-button").forEach(nav => {
            nav.classList.toggle("active", nav.dataset.page === page);
        });
    });
});


displaySeries();

loadCalendar();


// =====================================
// IMPORT TEMPORAIRE TV TIME
// =====================================

const importBox = document.createElement("div");
importBox.className = "manual-add-box";
importBox.innerHTML = `
    <h3>📦 Importer mon historique TV Time</h3>
    <p style="color:#9997a8;font-size:12px;margin-bottom:15px;">
        Récupère tes séries et tes épisodes déjà regardés.
    </p>
    <input type="file" id="tvtime-file" accept=".json,application/json">
    <button id="tvtime-import">Importer mes séries 💜</button>
    <p id="tvtime-status" style="margin-top:12px;font-size:12px;"></p>
`;

discoverPage.appendChild(importBox);

const tvtimeFile = document.getElementById("tvtime-file");
const tvtimeButton = document.getElementById("tvtime-import");
const tvtimeStatus = document.getElementById("tvtime-status");

function findTVTimeSeries(data) {
    const found = [];
    const visited = new WeakSet();

    function explore(value) {
        if (!value || typeof value !== "object") return;
        if (visited.has(value)) return;
        visited.add(value);

        if (
            !Array.isArray(value) &&
            value.title &&
            Array.isArray(value.seasons)
        ) {
            found.push(value);
        }

        Object.values(value).forEach(explore);
    }

    explore(data);
    return found;
}

function normalizeTitle(title) {
    return title
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

let lastTVMazeRequest = 0;

async function tvmazeRequest(url) {
    const now = Date.now();
    const wait = Math.max(0, 550 - (now - lastTVMazeRequest));

    if (wait) {
        await new Promise(resolve => setTimeout(resolve, wait));
    }

    lastTVMazeRequest = Date.now();

    const response = await fetch(url);

    if (!response.ok) return null;

    return response.json();
}

async function findTVMazeShow(oldShow) {
    let result = null;

    if (oldShow.id?.tvdb) {
        result = await tvmazeRequest(
            `https://api.tvmaze.com/lookup/shows?thetvdb=${oldShow.id.tvdb}`
        );
    }

    if (!result && oldShow.id?.imdb) {
        result = await tvmazeRequest(
            `https://api.tvmaze.com/lookup/shows?imdb=${encodeURIComponent(oldShow.id.imdb)}`
        );
    }

    if (!result) {
        const search = await tvmazeRequest(
            `https://api.tvmaze.com/search/shows?q=${encodeURIComponent(oldShow.title)}`
        );

        result = search?.find(item =>
            normalizeTitle(item.show.name) === normalizeTitle(oldShow.title)
        )?.show;
    }

    return result;
}


tvtimeButton.addEventListener("click", async function () {
    const file = tvtimeFile.files[0];

    if (!file) {
        tvtimeStatus.textContent = "Choisis d'abord ton fichier JSON.";
        return;
    }

    tvtimeButton.disabled = true;
    tvtimeStatus.textContent = "Lecture de ton export...";

    try {
        const data = JSON.parse(await file.text());
        const oldSeries = findTVTimeSeries(data);

        if (!oldSeries.length) {
            throw new Error("Aucune série trouvée dans ce fichier.");
        }

        let imported = 0;
        let updated = 0;
        let failed = [];

        for (let i = 0; i < oldSeries.length; i++) {
            const oldShow = oldSeries[i];

            tvtimeStatus.textContent =
                `Import en cours : ${i + 1} / ${oldSeries.length} — ${oldShow.title}`;

            try {
                const tvShow = await findTVMazeShow(oldShow);

                if (!tvShow) {
                    failed.push(oldShow.title);
                    continue;
                }

                const episodes = await tvmazeRequest(
                    `https://api.tvmaze.com/shows/${tvShow.id}/episodes`
                );

                const watchedIds = [];

                if (episodes && Array.isArray(oldShow.seasons)) {
                    const episodeMap = new Map();

                    episodes.forEach(ep => {
                        episodeMap.set(
                            `${ep.season}-${ep.number}`,
                            String(ep.id)
                        );
                    });

                    oldShow.seasons.forEach(season => {
                        (season.episodes || []).forEach(ep => {
                            if (ep.is_watched) {
                                const id = episodeMap.get(
                                    `${season.number}-${ep.number}`
                                );

                                if (id) watchedIds.push(id);
                            }
                        });
                    });
                }

                const newShow = {
                    id: tvShow.id,
                    name: tvShow.name,
                    tvMazeStatus: tvShow.status || "",
                    image: tvShow.image?.medium || "",
                    totalEpisodes: episodes?.length || 0,
                    episodesList: (episodes || []).map(ep => ({
                        id: String(ep.id),
                        season: ep.season,
                        number: ep.number,
                        name: ep.name
                    })),
                    watchedEpisodes: watchedIds,
                    watchMode: "manual",
                    isFavorite: Boolean(oldShow.is_favorite),
                    tvTimeStatus: oldShow.status || ""
                };

                const existing = mySeries.find(show =>
                    String(show.id) === String(newShow.id) ||
                    normalizeTitle(show.name) === normalizeTitle(newShow.name)
                );

                if (existing) {
                    existing.tvMazeStatus = newShow.tvMazeStatus;
                    existing.tvTimeStatus = newShow.tvTimeStatus;
                    existing.totalEpisodes = newShow.totalEpisodes;
                    existing.episodesList = newShow.episodesList;

                    existing.watchedEpisodes = [
                        ...new Set([
                            ...(existing.watchedEpisodes || []),
                            ...watchedIds
                        ])
                    ];

                    existing.image = existing.image || newShow.image;
                    existing.isFavorite =
                        existing.isFavorite || newShow.isFavorite;

                    updated++;
                } else {
                    mySeries.push(newShow);
                    imported++;
                }

            } catch (error) {
                console.error("Erreur pour", oldShow.title, error);
                failed.push(oldShow.title);
            }
        }

        mySeries.forEach(show => {
            if (!show.statusManuallySet) {
                delete show.seriesStatus;
                show.seriesStatus = getInitialSeriesStatus(show);
            }
        });

        localStorage.setItem("mySeries", JSON.stringify(mySeries));
        displaySeries();

        tvtimeStatus.textContent =
            `Terminé ! ${imported} nouvelles séries ajoutées, ${updated} mises à jour. ` +
            `${failed.length} non retrouvées.`;

        if (failed.length) {
            console.log("Séries non retrouvées :", failed);
        }

    } catch (error) {
        tvtimeStatus.textContent =
            "Erreur : " + error.message;
        console.error(error);

    } finally {
        tvtimeButton.disabled = false;
    }
});
