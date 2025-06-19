//IMPORTACIONES

import "./style.css";
import { Navbar } from "./components/Navbar/index.js";
import { Sidebar } from "./components/Sidebar/index.js";
import {
  applySavedTheme,
  initThemeToggle,
} from "./components/ThemeToogle/index.js";
import Swal from "sweetalert2";
import { GameCard } from "./components/GameCard/index.js";
import { getPlatformIcons } from "./components/GameCard/index.js";
import { supabase } from "./supabaseClient.js";
import { setActiveLink } from "./components/Navbar/index.js";
import Loader from "./components/Loader/index.js";
import "ldrs/ring";
import { LoginForm } from "./components/Auth/Login/LoginForm.js";
import { setupLoginHandler } from "./components/Auth/Login/handleLogin.js";
import { SignUpForm } from "./components/Auth/Signup/SignUpForm.js";
import { setupSignUpHandler } from "./components/Auth/Signup/handleSignUp.js";

//Obtenemos la API desde las variables de entorno

const API_KEY = import.meta.env.VITE_API_KEY;

// VARIABLES GLOBALES

let currentPage = 1;
let isLoading = false;
let currentURL = ""; // Evitamos cargar juegos al iniciar sesión o registrarse
let currentOrdering = "-rating"; // Orden por defecto en el que se muestran los juegos
let seenIds = new Set(); // Impedimos que se repitan los juegos ya vistos
let currentGames = []; // Lista de juegos actualmente cargados

// Aplicamos el tema guardado (modo oscuro/claro)
applySavedTheme();

// Pintamos estructura inicial de la aplicación

document.querySelector("#app").innerHTML = `
  <header>${Navbar()}</header>
  <section class="layout">
    <aside class="sidebar">${Sidebar()}</aside>
    <main class="main-content">
      <h2 id="main-title">Welcome to Arkadia</h2>
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

//  Inicializamos el toggle de tema (oscuro/claro)

initThemeToggle();

//Inicializamos el manejador de eventos de inicio de sesión
setupLoginHandler();
// Inicializamos el manejador de eventos de registro
setupSignUpHandler();

/* Evento para actualizar el orden de los juegos según selección del usuario
Al cambiar el orden, reiniciamos la lista de juegos y volvemos a cargar los juegos
desde la URL actual con el nuevo orden seleccionado */

document.addEventListener("change", (e) => {
  if (e.target.id === "order-select") {
    currentOrdering = e.target.value;
    seenIds.clear();
    getGames(currentURL, true);
  }
});

/*  Función para detectar contenido explícito en los juegos
 Esta función revisa el nombre, slug y etiquetas del juego para detectar palabras clave explícitas.
*/

const containsExplicitContent = (game) => {
  const keywords = [
    "sex",
    "sexual",
    "hentai",
    "futanari",
    "incest",
    "nudity",
    "nsfw",
  ];
  const text = (
    game.name +
    " " +
    (game.slug || "") +
    " " +
    (game.tags?.map((t) => t.name).join(" ") || "")
  ).toLowerCase();
  return keywords.some((keyword) => text.includes(keyword));
};

// Función para renderizar los juegos evitando duplicados y contenido explícito

const renderGames = (games) => {
  const container = document.getElementById("game-list");
  container.style.display = "grid";
  games.forEach((game) => {
    if (!seenIds.has(game.id) && !containsExplicitContent(game)) {
      seenIds.add(game.id);
      container.innerHTML += GameCard(game);
    }
  });
};

// Cambiamos los títulos principales dinámicamente

const setTitle = (title, subtitle) => {
  document.getElementById("main-title").textContent = title;
  document.getElementById("main-subtitle").textContent = subtitle;
};

// Función auxiliar para dar formato a fechas YYYY-MM-DD

const getFormattedDate = (date) => date.toISOString().split("T")[0];

// Almacenamos las urls de los filtros

const filters = {
  best: `https://api.rawg.io/api/games?dates=2025-01-01,2025-12-31`,
  popular: `https://api.rawg.io/api/games?ordering=-added`,
  top: `https://api.rawg.io/api/games?ordering=-added`,
  pc: `https://api.rawg.io/api/games?platforms=4`,
  ps: `https://api.rawg.io/api/games?platforms=18,187`,
  xbox: `https://api.rawg.io/api/games?platforms=1`,
  switch: `https://api.rawg.io/api/games?platforms=7`,
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

  // Aquí para esta semana, calculamos la fecha de inicio (lunes) y fin (domingo) de la semana actual
  thisWeek: () => {
    const today = new Date();
    const start = new Date(today.setDate(today.getDate() - today.getDay()));
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return `https://api.rawg.io/api/games?dates=${getFormattedDate(
      start
    )},${getFormattedDate(end)}&ordering=${currentOrdering}`;
  },

  //Aqui para los últimos 30 días, calculamos la fecha de hace 30 días desde hoy y la fecha de hoy

  last30: () => {
    const today = new Date();
    const lastMonth = new Date();
    lastMonth.setDate(today.getDate() - 30);
    return `https://api.rawg.io/api/games?dates=${getFormattedDate(
      lastMonth
    )},${getFormattedDate(today)}`;
  },

  // Aquí para la próxima semana, calculamos la fecha de inicio (lunes) y fin (domingo) de la próxima semana
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
  loader.style.display = "flex";

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
    Swal.fire({
      // Usamos la libreria SweetAlert2 para mostrar un mensaje de error
      icon: "error",
      theme: "dark",
      title: "Oops...",
      text: "There are no more results!",
    });
  } finally {
    isLoading = false;
    loader.style.display = "none";
  }
};

// Evento de búsqueda con Enter

const setupSearch = () => {
  const input = document.getElementById("searchInput");
  const list = document.getElementById("game-list");

  // Intentamos buscar un juego, si no se encuentra, buscamos por slug, que es una forma de identificar juegos por su nombre amigable en la URL

  const searchGames = async () => {
    const query = input.value.trim();
    if (!query) return;

    const list = document.getElementById("game-list");
    list.innerHTML = "";
    list.style.display = "grid";

    const baseURL = `https://api.rawg.io/api/games`;
    const url = `${baseURL}?search=${encodeURIComponent(
      query
    )}&search_precise=true&key=${API_KEY}`;

    try {
      const res = await fetch(url);
      const data = await res.json();

      // Limpiamos los juegos vistos para evitar duplicados
      seenIds.clear();

      // Si hay resultados, los renderizamos
      if (data.results.length > 0) {
        renderGames(data.results);
        return;
      }

      // Si no hay resultados, buscamos por slug
      const fallbackSlug = normalizeToSlug(query);
      const slugUrl = `${baseURL}/${fallbackSlug}?key=${API_KEY}`;

      const slugRes = await fetch(slugUrl);

      // Si la búsqueda por slug falla, mostramos un mensaje de error
      if (!slugRes.ok) throw new Error("Juego no encontrado por slug");

      const fallbackGame = await slugRes.json();
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
    // Comprobamos si la tecla pulsada es Enter y si es asi, ejecuta la función de búsqueda
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
      // En este caso, usamos un filtro que muestra los juegos mejor valorados del año actual

      case "btn-best":
        setTitle("Best of the Year", "Top rated games released this year");
        getGames(filters.best, true);
        break;

      //This week
      // En este caso, usamos un filtro que muestra los juegos lanzados esta semana

      case "btn-thisweek":
        setTitle("This Week", "Fresh releases for this week");
        getGames(filters.thisWeek(), true);
        break;

      // Last 30 days
      // En este caso, usamos un filtro que muestra los juegos lanzados en los últimos 30 días

      case "btn-last30":
        setTitle("Last 30 Days", "Top games from the past 30 days");
        getGames(filters.last30(), true);
        break;

      // Next week
      // En este caso, usamos un filtro que muestra los juegos que se lanzarán la próxima semana

      case "btn-nextweek":
        setTitle("Next Week", "Games releasing next week");
        getGames(filters.nextWeek(), true);
        break;

      // Release calendar
      // En este caso , usamos un filtro que muestra los juegos que se lanzarán en los próximos meses

      case "btn-calendar":
        setTitle("Release Calendar", "All upcoming releases");
        getGames(filters.calendar, true);
        break;

      // Popular
      // En este caso, usamos un filtro que muestra los juegos más populares en la plataforma

      case "btn-popular":
        setTitle("Popular", "Games with the most popularity");
        getGames(filters.popular, true);
        break;

      // All time top
      // En este caso, usamos un filtro que muestra los juegos más añadidos por los usuarios

      case "btn-top":
        setTitle("All Time Top", "Most added games by users");
        getGames(filters.top, true);
        break;

      // PC Games
      // En este caso, usamos un filtro que muestra todos los juegos de la plataforma PC

      case "btn-pc":
        setTitle("PC Games", "All PC platform games");
        getGames(filters.pc, true);
        break;

      // PlayStation Games
      // En este caso, usamos un filtro que muestra todos los juegos de la plataforma PlayStation

      case "btn-ps":
        setTitle("PlayStation Games", "All Playstation games");
        getGames(filters.ps, true);
        break;

      // Xbox Games
      // En este caso, usamos un filtro que muestra todos los juegos de la plataforma Xbox One

      case "btn-xbox":
        setTitle("Xbox One Games", "All Xbox One games");
        getGames(filters.xbox, true);
        break;

      // Nintendo Switch Games
      // En este caso, usamos un filtro que muestra todos los juegos de la plataforma Nintendo Switch

      case "btn-switch":
        setTitle("Nintendo Switch Games", "All Nintendo Switch games");
        getGames(filters.switch, true);
        break;

      // Action Games
      // En este caso, usamos un filtro que muestra todos los juegos de acción

      case "btn-action":
        setTitle("Action Games", "Explore the best action-packed titles");
        getGames(filters.action, true);
        break;

      // RPG Games
      // En este caso, usamos un filtro que muestra todos los juegos de rol

      case "btn-rpg":
        setTitle("RPG Games", "Top role-playing experiences");
        getGames(filters.rpg, true);
        break;

      // Shooter Games
      // En este caso, usamos un filtro que muestra todos los juegos de disparos en primera y tercera persona

      case "btn-shooter":
        setTitle("Shooter Games", "Best FPS and TPS games");
        getGames(filters.shooter, true);
        break;

      // Strategy Games
      // En este caso, usamos un filtro que muestra todos los juegos de estrategia y táctica

      case "btn-strategy":
        setTitle("Strategy Games", "Top strategic and tactical games");
        getGames(filters.strategy, true);
        break;

      // Adventure Games
      // En este caso, usamos un filtro que muestra todos los juegos de aventura

      case "btn-adventure":
        setTitle("Adventure Games", "Discover epic adventures");
        getGames(filters.adventure, true);
        break;

      // Racing Games
      // En este caso, usamos un filtro que muestra todos los juegos de carreras

      case "btn-racing":
        setTitle("Racing Games", "Fast-paced racing experiences");
        getGames(filters.racing, true);
        break;

      // Sports Games
      // En este caso, usamos un filtro que muestra todos los juegos de deportes

      case "btn-sports":
        setTitle("Sports Games", "Popular sports simulations");
        getGames(filters.sports, true);
        break;

      // Puzzle Games
      // En este caso, usamos un filtro que muestra todos los juegos de rompecabezas y lógica

      case "btn-puzzle":
        setTitle("Puzzle Games", "Brain teasers and logic challenges");
        getGames(filters.puzzle, true);
        break;

      // Free Online Games
      // En este caso, usamos un filtro que muestra todos los juegos gratuitos en línea

      case "btn-free":
        setTitle("Free Online Games", "Free-to-play online titles");
        getGames(filters.free, true);
        break;
    }
  }
});

// Carga inicial

document.addEventListener("DOMContentLoaded", () => {
  /*   Usamos la función handleRouteChange para cargar la página inicial
  y configurar el título y subtítulo iniciales */

  handleRouteChange();
  setupSearch();
});

// Scroll infinito para cualquier llamada activa

document.addEventListener("scroll", () => {
  /*   Verificamos si estamos en la vista de detalle del juego
  y si estamos cerca del final de la página para cargar más juegos */

  const isDetailView = location.hash.startsWith("#/game/");
  const nearBottom =
    window.innerHeight + window.scrollY >= document.body.offsetHeight - 200;

  // Solo ejecutamos el scroll infinito si no estamos en la vista de detalle

  if (!isDetailView && nearBottom && currentURL) {
    getGames(currentURL, false);
  }
});

// Escuchamos cambios de hash (página) en la URL

window.addEventListener("hashchange", () => {
  handleRouteChange();
  setActiveLink();
});

// Funcion para controlar el cambio de ruta y cargar el contenido adecuado

const handleRouteChange = () => {
  const route = location.hash;
  const container = document.getElementById("game-list");
  container.style.display = "grid";

  // Si la ruta es un detalle de juego

  if (route.startsWith("#/game/")) {
    // Extraemos el ID del juego de la ruta por que la ruta es del tipo #/game/{id}
    const gameId = route.split("/")[2];
    if (gameId) loadGameDetail(gameId);
    return;
  }
  // Página de Login
  if (route === "#/login") {
    renderLoginForm();
    return;
  }

  // Página de Registro
  if (route === "#/signup") {
    renderSignUpForm();
    return;
  }

  // Página principal (Home)

  setTitle(
    "Welcome to Arkadia",
    "Discover the latest and most popular games right now."
  );
  document.getElementById("main-subtitle").style.display = "block";
  document.querySelector(".filters").style.display = "block";

  const initialURL = `https://api.rawg.io/api/games/lists/main?discover=true`;
  currentURL = initialURL;
  seenIds.clear();
  getGames(initialURL, true);
};

//Esta función se encarga de hacer una petición a la API para obtener los detalles de un juego específico

const loadGameDetail = async (id) => {
  try {
    const res = await fetch(
      `https://api.rawg.io/api/games/${id}?key=${API_KEY}`
    );
    const game = await res.json();
    const container = document.getElementById("game-list");
    container.style.display = "block";
    // Limpiamos el contenido previo y  mostramos los detalles del juego
    container.innerHTML = `
  <div class="detail-view">
    <img src="${game.background_image}" alt="${game.name} cover" />
    <div class="detail-info">
      <span class="platforms">${getPlatformIcons(game.platforms)}</span>
      <h2>${game.name}</h2>
      <p class="description">${
        game.description_raw || "No description available."
      }</p>
      
      <div class="meta">
        <p><strong>Developer:</strong> ${
          game.developers?.map((dev) => dev.name).join(", ") || "Unknown"
        }</p>
        <p><strong>Publisher:</strong> ${
          game.publishers?.map((pub) => pub.name).join(", ") || "Unknown"
        }</p>
        <p><strong>Genres:</strong> ${
          game.genres?.map((g) => g.name).join(", ") || "Unknown"
        }</p>
        <p><strong>Tags:</strong> ${
          game.tags
            ?.slice(0, 5)
            .map((tag) => tag.name)
            .join(", ") || "None"
        }</p>
        <p><strong>Release date:</strong> ${game.released || "N/A"}</p>
        ${
          game.website
            ? `<p><strong>Official site:</strong> <a href="${game.website}" target="_blank">${game.website}</a></p>`
            : ""
        }
        
        
      </div>
      <button class="back-btn" id="goBack"><i>⬅</i> Back</button>
    </div>
  </div>
`;

    // Actualizamos el título y subtítulo de la página
    document.getElementById("main-title").textContent = game.name;
    document.getElementById("main-subtitle").textContent = "";

    /* Añadimos el evento para volver atrás
    Al hacer clic en el botón "Back", volvemos a la página principal
     Esto cambia el hash a "#/" para que se recargue la página principal
    y se muestren los juegos de nuevo */

    document.getElementById("goBack").addEventListener("click", () => {
      location.hash = "#/";
    });
  } catch (error) {
    // Si hay un error al cargar los detalles del juego, mostramos un mensaje de error
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Game details could not be loaded.",
    });
  }
};
// Evento para manejar clics en las tarjetas de juego
document.addEventListener("click", (e) => {
  const card = e.target.closest(".game-card");
  if (card) {
    const id = card.dataset.id;
    if (id) location.hash = `#/game/${id}`;
  }
});

/* Forzamos la recarga de contenido al hacer clic en "Home" aunque ya estemos en "#/" por que al ser  un SPA, 
no recarga la página */

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

//Funcion para renderizar el formulario de inicio de sesión

const renderLoginForm = () => {
  currentURL = "";
  const container = document.getElementById("game-list");
  container.style.display = "block";
  document.getElementById("main-title").innerHTML = "Log In";
  document.getElementById("main-subtitle").style.display = "none";
  document.querySelector(".filters").style.display = "none";

  container.innerHTML = LoginForm();
};

// Funcion para renderizar el formulario de registro
const renderSignUpForm = () => {
  currentURL = "";
  const container = document.getElementById("game-list");
  container.style.display = "block";
  document.getElementById("main-title").innerHTML = "Sign Up";
  document.getElementById("main-subtitle").style.display = "none";
  document.querySelector(".filters").style.display = "none";

  container.innerHTML = SignUpForm();
};

// Creamos el loader y lo añadimos al body
const loader = Loader();
document.body.appendChild(loader);
loader.style.display = "none";
