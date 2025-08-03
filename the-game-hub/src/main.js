// Librerías de terceros
import Swal from "sweetalert2";
import { supabase } from "./supabaseClient.js";

// css
import "./style.css";

// Componentes
import {
  Navbar,
  Sidebar,
  Loader,
  GameCard,
  getPlatformIcons,
  setActiveLink,
  checkAuthAndUpdateNavbar,
  applySavedTheme,
  initThemeToggle,
  LoginForm,
  setupLoginHandler,
  setupSidebarToggle,
  SignUpForm,
  setupSignUpHandler,
} from "./components";


// Utilidades
import { filters } from "./utils/filters.js";

//Obtenemos la API desde las variables de entorno
const API_KEY = import.meta.env.VITE_API_KEY;
scroll;

// VARIABLES GLOBALES

let currentPage = 1;
let isLoading = false;
let currentURL = "";
let currentOrdering = "-rating";
let seenIds = new Set();
let currentGames = [];
window.scrollEnabled = true;

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
`;
checkAuthAndUpdateNavbar();
//  Inicializamos el toggle de tema (oscuro/claro)
initThemeToggle();
//Inicializamos el manejador de eventos de inicio de sesión
setupLoginHandler();
// Inicializamos el manejador de eventos de registro
setupSignUpHandler();
//Inicializamos el menu hamburguesa del sidebar
setupSidebarToggle();

// Aquí llamamos a la API para obtener los juegos

const getGames = async (url, reset = false) => {
  // Si ya estamos cargando juegos, no hacemos nada
  if (isLoading) return;
  isLoading = true;
  // Mostramos el loader mientras cargamos los juegos
  loader.style.display = "flex";

  try {
    //si reset es true, limpiamos la lista de juegos y reiniciamos las variables
    if (reset) {
      document.getElementById("game-list").innerHTML = "";
      currentPage = 1;
      currentURL = url;
      seenIds.clear();
      currentGames = [];
    }

    const fullURL = `${url}&page=${currentPage}&page_size=20&key=${API_KEY}`;
    const res = await fetch(fullURL);
    const data = await res.json();

    // Aqui con el spread operator, añadimos los juegos nuevos a la lista de juegos actuales
    currentGames = [...currentGames, ...data.results];
    // Aqui le pasamos el array de juegos y el contenedor donde se van a renderizar
    renderGames(data.results, document.getElementById("game-list"));
    currentPage++;
  } catch (error) {
    Swal.fire({
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

/* Evento para actualizar el orden de los juegos según selección del usuario
Al cambiar el orden, reiniciamos la lista de juegos y volvemos a cargar los juegos
desde la URL actual con el nuevo orden seleccionado */

document.addEventListener("change", (e) => {
  if (e.target.id === "order-select") {
    currentOrdering = e.target.value;
    seenIds.clear();

    // Actualizamos la URL con la nueva ordenación
    const baseURL = `https://api.rawg.io/api/games/lists/main?discover=true&ordering=${currentOrdering}`;
    currentURL = baseURL;

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

export const renderGames = async (games, container) => {
  // Set para controlar juegos ya renderizados
  const seenIds = new Set();

  const uniqueGames = games.filter(
    (game, index, self) => index === self.findIndex((g) => g.id === game.id)
  );

  const filteredGames = uniqueGames.filter(
    (game) => !seenIds.has(game.id) && !containsExplicitContent(game)
  );

  const cardPromises = filteredGames.map(async (game) => {
    seenIds.add(game.id);
    return await GameCard(game); // Esta función debe devolver HTML como string
  });

  const cards = await Promise.all(cardPromises);

  container.innerHTML += cards.join(""); // Renderiza todo junto
};

// Cambiamos los títulos principales dinámicamente

const setTitle = (title, subtitle) => {
  document.getElementById("main-title").textContent = title;
  document.getElementById("main-subtitle").textContent = subtitle;
};

// Evento de búsqueda con Enter

const setupSearch = () => {
  const input = document.getElementById("searchInput");

  // Intentamos buscar un juego, si no se encuentra, buscamos por slug, que es una forma de identificar juegos por su nombre amigable en la URL

  const searchGames = async () => {
    const query = input.value.trim();
    if (!query) return;

    const list = document.getElementById("game-list");
    list.innerHTML = "";
    //Mostramos el loader mientras buscamos los juegos
    loader.style.display = "flex";
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
        renderGames(data.results, list);
        // Mostramos el loader mientras cargamos los juegos

        return;
      }

      // Si no hay resultados, buscamos por slug
      const fallbackSlug = normalizeToSlug(query);
      const slugUrl = `${baseURL}/${fallbackSlug}?key=${API_KEY}`;
      // Normalizamos el nombre del juego a un slug amigable
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
    } finally {
      // Ocultamos el loader al finalizar la búsqueda
      loader.style.display = "none";
    }
  };

  // Ejecutamos la busqueda al pulsar Enter en el input
  input?.addEventListener("keydown", (e) => {
    // Comprobamos si la tecla pulsada es Enter y si es asi, ejecuta la función de búsqueda
    if (e.key === "Enter") searchGames();
  });
};
setupSearch();

// Gestionamos los eventos de clic en el aside
document.querySelector(".sidebar").addEventListener("click", (e) => {
  // Aqui ahorramos escritura llamando f a la función filters con el orden actual
  const f = filters(currentOrdering);

  if (e.target.tagName === "A") {
    /*Comprobamos si el elemento clicado es un enlace dentro del aside y si es asi, previene el comportamiento por defecto del enlace y ejecuta la función correspondiente, esto permite que al hacer clic en un enlace del aside, se actualice el contenido principal sin recargar la página, lo que mejora la experiencia del usuario y permite una navegación más fluida entre las diferentes secciones de la aplicación*/

    e.preventDefault();
    const id = e.target.id;
    switch (id) {
      //Best of the year
      // En este caso, usamos un filtro que muestra los juegos mejor valorados del año actual

      case "btn-best":
        setTitle("Best of the Year", "Top rated games released this year");
        window.scrollEnabled = true;
        getGames(f.best, true);
        break;

      //This week
      // En este caso, usamos un filtro que muestra los juegos lanzados esta semana

      case "btn-thisweek":
        setTitle("This Week", "Fresh releases for this week");
        document.querySelector(".filters").style.display = "none";
        getGames(f.thisWeek(), true);
        break;

      // Last 30 days
      // En este caso, usamos un filtro que muestra los juegos lanzados en los últimos 30 días

      case "btn-last30":
        setTitle("Last 30 Days", "Top games from the past 30 days");
        document.querySelector(".filters").style.display = "none";
        window.scrollEnabled = true;
        getGames(f.last30(), true);
        break;

      // Next week
      // En este caso, usamos un filtro que muestra los juegos que se lanzarán la próxima semana

      case "btn-nextweek":
        setTitle("Next Week", "Games releasing next week");
        window.scrollEnabled = true;
        document.querySelector(".filters").style.display = "none";
        getGames(f.nextWeek(), true);
        break;

      // Release calendar
      // En este caso , usamos un filtro que muestra los juegos que se lanzarán en los próximos meses

      case "btn-calendar":
        setTitle("Release Calendar", "All upcoming releases");
        window.scrollEnabled = true;
        getGames(f.calendar, true);
        break;

      // Popular
      // En este caso, usamos un filtro que muestra los juegos más populares en la plataforma

      case "btn-popular":
        setTitle("Popular", "Games with the most popularity");
        document.querySelector(".filters").style.display = "none";
        window.scrollEnabled = true;
        getGames(f.popular, true);
        break;

      // All time top
      // En este caso, usamos un filtro que muestra los juegos más añadidos por los usuarios

      case "btn-top":
        setTitle("All Time Top", "Most added games by users");
        document.querySelector(".filters").style.display = "none";
        window.scrollEnabled = true;
        getGames(f.top, true);
        break;

      // PC Games
      // En este caso, usamos un filtro que muestra todos los juegos de la plataforma PC

      case "btn-pc":
        setTitle("PC Games", "All PC platform games");
        window.scrollEnabled = true;
        document.querySelector(".filters").style.display = "none";
        getGames(f.pc, true);
        break;

      // PlayStation Games
      // En este caso, usamos un filtro que muestra todos los juegos de la plataforma PlayStation

      case "btn-ps":
        setTitle("PlayStation Games", "All Playstation games");
        document.querySelector(".filters").style.display = "none";
        window.scrollEnabled = true;
        getGames(f.ps, true);
        break;

      // Xbox Games
      // En este caso, usamos un filtro que muestra todos los juegos de la plataforma Xbox One

      case "btn-xbox":
        setTitle("Xbox One Games", "All Xbox One games");
        document.querySelector(".filters").style.display = "none";
        window.scrollEnabled = true;
        getGames(f.xbox, true);
        break;

      // Nintendo Switch Games
      // En este caso, usamos un filtro que muestra todos los juegos de la plataforma Nintendo Switch

      case "btn-switch":
        setTitle("Nintendo Switch Games", "All Nintendo Switch games");
        document.querySelector(".filters").style.display = "none";
        window.scrollEnabled = true;
        getGames(f.switch, true);
        break;

      // Action Games
      // En este caso, usamos un filtro que muestra todos los juegos de acción

      case "btn-action":
        setTitle("Action Games", "Explore the best action-packed titles");
        document.querySelector(".filters").style.display = "none";
        window.scrollEnabled = true;
        getGames(f.action, true);
        break;

      // RPG Games
      // En este caso, usamos un filtro que muestra todos los juegos de rol

      case "btn-rpg":
        setTitle("RPG Games", "Top role-playing experiences");
        document.querySelector(".filters").style.display = "none";
        window.scrollEnabled = true;
        getGames(f.rpg, true);
        break;

      // Shooter Games
      // En este caso, usamos un filtro que muestra todos los juegos de disparos en primera y tercera persona

      case "btn-shooter":
        setTitle("Shooter Games", "Best FPS and TPS games");
        document.querySelector(".filters").style.display = "none";
        window.scrollEnabled = true;
        getGames(f.shooter, true);
        break;

      // Strategy Games
      // En este caso, usamos un filtro que muestra todos los juegos de estrategia y táctica

      case "btn-strategy":
        setTitle("Strategy Games", "Top strategic and tactical games");
        document.querySelector(".filters").style.display = "none";
        window.scrollEnabled = true;
        getGames(f.strategy, true);
        break;

      // Adventure Games
      // En este caso, usamos un filtro que muestra todos los juegos de aventura

      case "btn-adventure":
        setTitle("Adventure Games", "Discover epic adventures");
        document.querySelector(".filters").style.display = "none";
        window.scrollEnabled = true;
        getGames(f.adventure, true);
        break;

      // Racing Games
      // En este caso, usamos un filtro que muestra todos los juegos de carreras

      case "btn-racing":
        setTitle("Racing Games", "Fast-paced racing experiences");
        document.querySelector(".filters").style.display = "none";
        window.scrollEnabled = true;
        getGames(f.racing, true);
        break;

      // Sports Games
      // En este caso, usamos un filtro que muestra todos los juegos de deportes

      case "btn-sports":
        setTitle("Sports Games", "Popular sports simulations");
        document.querySelector(".filters").style.display = "none";
        window.scrollEnabled = true;
        getGames(f.sports, true);
        break;

      // Puzzle Games
      // En este caso, usamos un filtro que muestra todos los juegos de rompecabezas y lógica

      case "btn-puzzle":
        setTitle("Puzzle Games", "Brain teasers and logic challenges");
        document.querySelector(".filters").style.display = "none";
        window.scrollEnabled = true;
        getGames(f.puzzle, true);
        break;

      // Free Online Games
      // En este caso, usamos un filtro que muestra todos los juegos gratuitos en línea

      case "btn-free":
        setTitle("Free Online Games", "Free-to-play online titles");
        document.querySelector(".filters").style.display = "none";
        window.scrollEnabled = true;
        getGames(f.free, true);
        break;
    }
  }
});

// Carga inicial

document.addEventListener("DOMContentLoaded", () => {
  // Solo ejecutamos si no hay hash ya presente
  if (!location.hash || location.hash === "#/") {
    window.scrollEnabled = true;
    handleRouteChange();
  }
});

// Scroll infinito para cualquier llamada activa

document.addEventListener("scroll", () => {
  /*   Verificamos si estamos en la vista de detalle del juego
  y si estamos cerca del final de la página para cargar más juegos */

  const isDetailView = location.hash.startsWith("#/game/");
  const nearBottom =
    window.innerHeight + window.scrollY >= document.body.offsetHeight - 200;

  // Solo ejecutamos el scroll infinito si no estamos en la vista de detalle

  if (!isDetailView && nearBottom && currentURL && window.scrollEnabled) {
    getGames(currentURL, false);
  }
});

// Escuchamos cambios de hash (página) en la URL

window.addEventListener("hashchange", () => {
  handleRouteChange();
  checkAuthAndUpdateNavbar();
  setActiveLink();
});

// Funcion para controlar el cambio de ruta y cargar el contenido adecuado

const handleRouteChange = () => {
  /* Location hash nos da la ruta actual
  Por ejemplo, si la ruta es #/game/123, location.hash será "#/game/123"
   Si la ruta es #/login, location.hash será "#/login"
   Si la ruta es #/signup, location.hash será "#/signup" */

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
  if (route === "#/wishlist") {
    setTitle("My Wishlist", "Your saved games list.");
    document.getElementById("main-subtitle").style.display = "block";
    document.querySelector(".filters").style.display = "none";

    window.scrollEnabled = false; // ❌ Desactivamos scroll infinito
    currentURL = ""; // ❌ Importante: evitamos que getGames use URL antigua
    seenIds.clear(); // ✅ Limpiamos el historial

    loadWishlist();
    return;
  }

  // Página principal (Home)

  setTitle(
    "Welcome to Arkadia",
    "Discover the latest and most popular games right now."
  );
  document.getElementById("main-subtitle").style.display = "block";
  document.querySelector(".filters").style.display = "block";

  const initialURL = `https://api.rawg.io/api/games/lists/main?discover=true&ordering=${currentOrdering}`;

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
    const trailerRes = await fetch(
      `https://api.rawg.io/api/games/${id}/movies?key=${API_KEY}`
    );
    const trailerData = await trailerRes.json();
    const trailer = trailerData.results?.[0]?.data?.max || null;

    container.style.display = "block";
    document.querySelector(".filters").style.display = "none";

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

/* Forzamos la recarga de contenido al hacer clic en "Home" aunque ya estemos en "#/" por que al ser  un SPA, 
no recarga la página */

document.querySelectorAll('a[href="#/"]').forEach((link) => {
  link.addEventListener("click", (e) => {
    // Evitamos el comportamiento por defecto del enlace
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

document.addEventListener("click", async (e) => {
  // Click en botón de wishlist
  const btn = e.target.closest(".wishlist-btn");
  if (btn) {
    // Evitanmos abrir detalle del juego al hacer clic en el botón
    e.stopPropagation();
    e.preventDefault();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      Swal.fire({
        icon: "warning",
        title: "You need to log in",
        text: "Log in to add games to your wishlist.",
      });
      return;
    }

    const { id, name, image } = btn.dataset;

    const { error } = await supabase.from("wishlist").insert([
      {
        user_id: user.id,
        game_id: id,
        game_name: name,
        game_image: image,
      },
    ]);

    if (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "The game could not be saved.",
      });
      console.error(error);
    } else {
      Swal.fire({
        icon: "success",
        title: "Added to Wishlist",
        text: `"${name}" has been added to your wishlist.`,
      });
    }

    return; // salimos aquí, para que no siga con el renderizado del detalle del juego
  }

  // Click en tarjeta del juego
  const card = e.target.closest(".game-card");
  if (card) {
    const id = card.dataset.id;
    if (id) location.hash = `#/game/${id}`;
  }
});

// Creamos el loader y lo añadimos al body
const loader = Loader();
document.body.appendChild(loader);
loader.style.display = "none";
