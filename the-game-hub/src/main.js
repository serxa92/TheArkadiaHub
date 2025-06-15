import "./style.css";

import { Navbar } from "./components/Navbar/index.js";
import { Sidebar } from "./components/Sidebar/index.js";
import {
  applySavedTheme,
  initThemeToggle,
} from "./components/ThemeToogle/index.js";
import Swal from "sweetalert2";
import { GameCard } from "./components/GameCard/index.js";

const API_KEY = import.meta.env.VITE_API_KEY;

// Variables para controlar la paginación y el estado de carga

let currentPage = 1;
let isLoading = false;
let currentURL = "";
// Orden por defecto en el que se muestran los juegos
let currentOrdering = "-rating";
// Impedimos que se repitan los juegos ya vistos
let seenIds = new Set();
// Lista de juegos actualmente cargados
let currentGames = [];

// Aplicamos el tema guardado
applySavedTheme();

// Pintamos estructura inicial

document.querySelector("#app").innerHTML = `
  <header>${Navbar()}</header>
  <section class="layout">
    <aside class="sidebar">${Sidebar()}</aside>
    <main class="main-content">
      <h2 id="main-title">Welcome to The Game Hub</h2>
      <p id="main-subtitle">Discover the latest and most popular games right now.</p>
      <div class="filters">
        <label for="order-select">Order by:</label>
        <select id="order-select">
          <option value="-rating">Rating</option>
          <option value="-released">Release Date</option>
          <option value="-added">Popularity</option>
          <option value="name">Name (A-Z)</option>
        </select>
      </div>
      <div class="game-list" id="game-list"></div>
    </main>
  </section>
`;

// Inicializamos toggle de tema

initThemeToggle();
setupSearch();


// Guardamos el valor del orden elegido por el usuario

document.addEventListener("change", (e) => {
  if (e.target.id === "order-select") {
    currentOrdering = e.target.value;
    seenIds.clear();
    getGames(currentURL, true);
  }
});

// Función para renderizar los juegos en el DOM

const renderGames = (games) => {
  const container = document.getElementById("game-list");
  games.forEach((game) => {
    if (!seenIds.has(game.id)) {
      seenIds.add(game.id);
      container.innerHTML += GameCard(game);
    }
  });
};

// Cambiamos los títulos dinámicamente
const setTitle = (title, subtitle) => {
  document.getElementById("main-title").textContent = title;
  document.getElementById("main-subtitle").textContent = subtitle;
};

// Funciones auxiliares de fecha
const getFormattedDate = (date) => date.toISOString().split("T")[0];

// Almacenamos las urls de los filtros
const filters = {
  best: `https://api.rawg.io/api/games?dates=2025-01-01,2025-12-31`,
  popular: `https://api.rawg.io/api/games`,
  pc: `https://api.rawg.io/api/games?platforms=4`,
  ps: `https://api.rawg.io/api/games?platforms=18,187`,
  xbox: `https://api.rawg.io/api/games?platforms=1`,
  action: `https://api.rawg.io/api/games?genres=action`,
  rpg: `https://api.rawg.io/api/games?genres=role-playing-games-rpg`,
  shooter: `https://api.rawg.io/api/games?genres=shooter`,
  strategy: `https://api.rawg.io/api/games?genres=strategy`,
  adventure: `https://api.rawg.io/api/games?genres=adventure`,
  racing: `https://api.rawg.io/api/games?genres=racing`,
  sports: `https://api.rawg.io/api/games?genres=sports`,
  puzzle: `https://api.rawg.io/api/games?genres=puzzle`,
  free: `https://api.rawg.io/api/games?tags=free-to-play`,
  calendar: `https://api.rawg.io/api/games?dates=2025-06-01,2025-12-31`,

  // Funciones para obtener las URLs de los filtros dinámicamente

  thisWeek: () => {
    const today = new Date();
    const start = new Date(today.setDate(today.getDate() - today.getDay()));
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return `https://api.rawg.io/api/games?dates=${getFormattedDate(
      start
    )},${getFormattedDate(end)}`;
  },
  last30: () => {
    const today = new Date();
    const lastMonth = new Date();
    lastMonth.setDate(today.getDate() - 30);
    return `https://api.rawg.io/api/games?dates=${getFormattedDate(
      lastMonth
    )},${getFormattedDate(today)}`;
  },
  nextWeek: () => {
    const today = new Date();
    const nextMonday = new Date(
      today.setDate(today.getDate() + (8 - today.getDay()))
    );
    const nextSunday = new Date(nextMonday);
    nextSunday.setDate(nextMonday.getDate() + 6);
    return `https://api.rawg.io/api/games?dates=${getFormattedDate(
      nextMonday
    )},${getFormattedDate(nextSunday)}`;
  },
};

// Aquí llamamos a la API para obtener los juegos
const getGames = async (url, reset = false) => {
  if (isLoading) return;
  isLoading = true;

  try {
    if (reset) {
      document.getElementById("game-list").innerHTML = "";
      currentPage = 1;
      currentURL = url;
      seenIds.clear();
      currentGames = [];
    }

    const fullURL = `${url}&page=${currentPage}&page_size=20&ordering=${currentOrdering}&key=${API_KEY}`;
    const res = await fetch(fullURL);
    const data = await res.json();

    currentGames = [...currentGames, ...data.results];
    renderGames(data.results);
    currentPage++;
  } catch (error) {
    // Usamos la libreria SweetAlert2 para mostrar un mensaje de error
    Swal.fire({
      icon: "error",
      theme: "dark",
      title: "Oops...",
      text: "There are no more results!",
    });
  } finally {
    isLoading = false;
  }
};

// Evento de búsqueda con botón y Enter
const setupSearch = () => {
  const input = document.getElementById("searchInput");
  const button = document.getElementById("searchBtn");
  const list = document.getElementById("game-list");

  // Intentamos buscar un juego, si no se encuentra, buscamos por slug, que es una forma de identificar juegos por su nombre amigable en la URL

  const searchGames = async () => {
    const query = input.value.trim();
    if (!query) return;

    list.innerHTML = "";

    const url = `https://api.rawg.io/api/games?search=${encodeURIComponent(
      query
    )}&search_precise=true&key=${API_KEY}`;

    try {
      const res = await fetch(url);
      const data = await res.json();

      if (data.results.length > 0) {
        seenIds.clear();
        renderGames(data.results);
        return;
      }

      //Si no hay resultados, intentamos buscar por slug
      const fallbackSlug = normalizeToSlug(query);
      const slugUrl = `https://api.rawg.io/api/games/${fallbackSlug}?key=${API_KEY}`;

      const slugRes = await fetch(slugUrl);

      if (!slugRes.ok) throw new Error("Juego no encontrado por slug");

      const fallbackGame = await slugRes.json();

      seenIds.clear();
      renderGames([fallbackGame]);
    } catch (error) {
      Swal.fire({
        icon: "error",
        theme: "dark",
        title: "No results",
        text: `No game found for "${query}".`,
      });
    }
  };

  // Ejecutamos la busqueda al pulsar Enter en el input
  input?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") searchGames();
  });
};

// Gestionamos los eventos de clic en el aside
document.querySelector(".sidebar").addEventListener("click", (e) => {
  if (e.target.tagName === "A") {
    /*Comprobamos si el elemento clicado es un enlace dentro del aside y si es asi, previene el comportamiento por defecto del enlace y ejecuta la función correspondiente, esto permite que al hacer clic en un enlace del aside, se actualice el contenido principal sin recargar la página, lo que mejora la experiencia del usuario y permite una navegación más fluida entre las diferentes secciones de la aplicación*/

    e.preventDefault();
    const id = e.target.id;
    switch (id) {
      //Best of the year

      case "btn-best":
        setTitle("Best of the Year", "Top rated games released this year");
        getGames(filters.best, true);
        break;

      //This week

      case "btn-thisweek":
        setTitle("This Week", "Fresh releases for this week");
        getGames(filters.thisWeek(), true);
        break;

      // Last 30 days

      case "btn-last30":
        setTitle("Last 30 Days", "Top games from the past 30 days");
        getGames(filters.last30(), true);
        break;

      // Next week

      case "btn-nextweek":
        setTitle("Next Week", "Games releasing next week");
        getGames(filters.nextWeek(), true);
        break;

      // Release calendar

      case "btn-calendar":
        setTitle("Release Calendar", "All upcoming releases");
        getGames(filters.calendar, true);
        break;

      // Popular

      case "btn-popular":
        setTitle("Popular", "Games with the most popularity");
        getGames(filters.popular, true);
        break;

      // PC Games

      case "btn-pc":
        setTitle("PC Games", "All PC platform games");
        getGames(filters.pc, true);
        break;

      // PlayStation Games

      case "btn-ps":
        setTitle("PlayStation Games", "All Playstation games");
        getGames(filters.ps, true);
        break;

      // Xbox Games

      case "btn-xbox":
        setTitle("Xbox One Games", "All Xbox One games");
        getGames(filters.xbox, true);
        break;

      // Action Games

      case "btn-action":
        setTitle("Action Games", "Explore the best action-packed titles");
        getGames(filters.action, true);
        break;

      // RPG Games

      case "btn-rpg":
        setTitle("RPG Games", "Top role-playing experiences");
        getGames(filters.rpg, true);
        break;

      // Shooter Games

      case "btn-shooter":
        setTitle("Shooter Games", "Best FPS and TPS games");
        getGames(filters.shooter, true);
        break;

      // Strategy Games

      case "btn-strategy":
        setTitle("Strategy Games", "Top strategic and tactical games");
        getGames(filters.strategy, true);
        break;

      // Adventure Games

      case "btn-adventure":
        setTitle("Adventure Games", "Discover epic adventures");
        getGames(filters.adventure, true);
        break;

      // Racing Games

      case "btn-racing":
        setTitle("Racing Games", "Fast-paced racing experiences");
        getGames(filters.racing, true);
        break;

      // Sports Games

      case "btn-sports":
        setTitle("Sports Games", "Popular sports simulations");
        getGames(filters.sports, true);
        break;

      // Puzzle Games

      case "btn-puzzle":
        setTitle("Puzzle Games", "Brain teasers and logic challenges");
        getGames(filters.puzzle, true);
        break;

      // Free Online Games

      case "btn-free":
        setTitle("Free Online Games", "Free-to-play online titles");
        getGames(filters.free, true);
        break;
    }
  }
});

// Carga inicial
document.addEventListener("DOMContentLoaded", () => {
  handleRouteChange();
});

// Scroll infinito para cualquier llamada activa
document.addEventListener("scroll", () => {
  const nearBottom =
    window.innerHeight + window.scrollY >= document.body.offsetHeight - 200;
  if (nearBottom && currentURL) {
    getGames(currentURL, false);
  }
});

// Escuchamos cambios de hash en la URL
window.addEventListener("hashchange", () => {
  handleRouteChange();
});

const handleRouteChange = () => {
  const route = location.hash;

  switch (route) {
    case "#/":
    default:
      setTitle(
        "Welcome to The Game Hub",
        "Discover the latest and most popular games right now."
      );
      const initialURL = `https://api.rawg.io/api/games/lists/main?discover=true`;
      currentURL = initialURL;
      seenIds.clear();
      getGames(initialURL, true);
      break;
  }
};
// Forzamos la recarga de contenido al hacer clic en "Home" aunque ya estemos en "#/"
document.querySelectorAll('a[href="#/"]').forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    if (location.hash === "#/") {
      handleRouteChange();
    } else {
      location.hash = "#/";
    }
  });
});
