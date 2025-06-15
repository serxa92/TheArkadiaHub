import "./styles.css";

// Iconos según la plataforma general
const platformIcons = {
  PC: '<i class="fa-brands fa-windows"></i>',
  PlayStation: '<i class="fa-brands fa-playstation"></i>',
  Xbox: '<i class="fa-brands fa-xbox"></i>',
  macOS: '<i class="fa-brands fa-apple"></i>',
  Linux: '<i class="fa-brands fa-linux"></i>',
  Nintendo: '<i class="fa-solid fa-gamepad"></i>',
};

// Esta función toma parent_platforms y devuelve HTML de iconos
const getPlatformIcons = (platforms) => {
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

  const unique = [...new Set(names)];

  return unique.map((name) => platformIcons[name] ?? "").join(" ");
};


// Genera la tarjeta de juego
export const GameCard = (game) => {
  return `
    
      <div class="game-card">
        <img src="${game.background_image}" alt="${game.name}" />
        <div class="game-info">
          <div class="platform-icons">
            ${getPlatformIcons(game.platforms)}
          </div>
          <h3>${game.name}</h3>
          <div class="extra-info">
            <p><strong>Rating:</strong> ⭐ ${game.rating ?? "N/A"}</p>
            <p><strong>Release date:</strong> ${game.released ?? "N/A"}</p>
          </div>
        </div>
      </div>
    
  `;
};
