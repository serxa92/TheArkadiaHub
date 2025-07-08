import "./styles.css";
import { supabase } from "../../supabaseClient.js"; 




// Aqui definimos los iconos de las plataformas, usando Font Awesome
const platformIcons = {
  PC: '<i class="fa-brands fa-windows"></i>',
  PlayStation: '<i class="fa-brands fa-playstation"></i>',
  Xbox: '<i class="fa-brands fa-xbox"></i>',
  macOS: '<i class="fa-brands fa-apple"></i>',
  Linux: '<i class="fa-brands fa-linux"></i>',
  Nintendo: '<i class="fa-solid fa-gamepad"></i>',
};

// Aquí definimos la función que obtiene los iconos de las plataformas

export const getPlatformIcons = (platforms) => {
  if (!Array.isArray(platforms)) return "";

  // Mapeamos los nombres de las plataformas a los iconos
  
  const nameMap = {
    "PC": "PC",
    "PlayStation 4": "PlayStation",
    "PlayStation 5": "PlayStation",
    "PlayStation": "PlayStation",
    "Xbox One": "Xbox",
    "Xbox Series S/X": "Xbox",
    "Xbox": "Xbox",
    "macOS": "macOS",
    "Linux": "Linux",
    "Nintendo Switch": "Nintendo",
    "Nintendo": "Nintendo"
  };
  
  // Filtramos los nombres de las plataformas 

  const names = platforms
    .map((p) => nameMap[p?.platform?.name])
    .filter(Boolean);

  // Eliminamos duplicados usando un Set y luego convertimos de nuevo a un array

  const unique = [...new Set(names)];
  return unique.map((name) => platformIcons[name] ?? "").join(" ");
};

// Esta función genera la tarjeta del juego
export const GameCard = async (game, inWishlist = false) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const isLoggedIn = !!session?.user;
  // Verificamos si el usuario está logueado y si el juego está en su wishlist, si no, mostramos el botón de añadir a wishlist
  const wishlistBtn = isLoggedIn
  ? `<button class="wishlist-btn ${inWishlist ? "remove" : "add"}" 
        data-id="${game.id}" 
        data-name="${game.name}" 
        data-image="${game.background_image}" 
        data-action="${inWishlist ? "remove" : "add"}"
        title="${inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}">
        ${inWishlist ? '<i class="fas fa-trash"></i> Remove from wishlist' : '<i class="fas fa-heart"></i> Add to wishlist'}
     </button>`
  : "";

  return `
    <div class="game-card" data-id="${game.id}">
      <img src="${game.background_image}" alt="${game.name}" />
      <div class="game-info">
        <div class="platform-icons">
          <p>${getPlatformIcons(game.platforms)}</p><p>⭐ ${game.rating ?? "N/A"}</p>
        </div>
        <h3>${game.name}</h3>
        <div class="extra-info">
          <p><strong>Release Date:</strong> ${game.released ?? "N/A"}</p>
        </div>
        ${wishlistBtn}
      </div>
    </div>
  `;
};
