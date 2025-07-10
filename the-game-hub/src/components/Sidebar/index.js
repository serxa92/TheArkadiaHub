import "./styles.css";
import Swal from "sweetalert2";
import { supabase } from "../../supabaseClient.js";
import { GameCard } from "../GameCard/index.js";


export function Sidebar() {
  // Timeout para asegurar que el DOM esté listo antes de añadir el manejador
  setTimeout(() => setupWishlistHandler(), 0);
  return `
    <aside class="sidebar-container">
      <nav class="sidebar-nav">
        <ul>  
          <li>
            <a href="#/" id="btn-home"><i class="fa-solid fa-house fa-lg"></i> Home</a>
          </li>
          <li>
            <a href="#" id="btn-wishlist"><i class="fas fa-heart"></i> Wishlist</a>
          </li>

          <li class="section-title">Releases</li>
          <li><a href="#" id="btn-last30"><i class="fa-regular fa-star fa-lg"></i> Last 30 days</a></li>
          <li><a href="#" id="btn-thisweek"><i class="fa-solid fa-fire fa-lg"></i> This week</a></li>
          <li><a href="#" id="btn-nextweek"><i class="fa-solid fa-forward-fast fa-lg"></i> Next week</a></li>
          <li><a href="#" id="btn-calendar"><i class="fa-solid fa-calendar-days fa-lg"></i> Release calendar</a></li>

          <li class="section-title">Top</li>
          <li><a href="#" id="btn-best"><i class="fa-solid fa-trophy fa-lg"></i> Best of the year</a></li>
          <li><a href="#" id="btn-popular"><i class="fa-solid fa-chart-line fa-lg"></i> Popular</a></li>
          <li><a href="#" id="btn-top"><i class="fa-solid fa-ranking-star fa-lg"></i> All time top</a></li>

          <li class="section-title">Platforms</li>
          <li><a href="#" id="btn-pc"><i class="fa-brands fa-windows fa-lg"></i> PC</a></li>
          <li><a href="#" id="btn-ps"><i class="fa-brands fa-playstation fa-lg"></i> Playstation</a></li>
          <li><a href="#" id="btn-xbox"><i class="fa-brands fa-xbox fa-lg"></i> Xbox One</a></li>
          <li><a href="#" id="btn-switch"><i class="fa-solid fa-gamepad fa-lg"></i> Nintendo Switch</a></li>

          <li class="section-title">Genres</li>
          <li><a href="#" id="btn-free">Free Online Games</a></li>
          <li><a href="#" id="btn-action">Action</a></li>
          <li><a href="#" id="btn-rpg">RPG</a></li>
          <li><a href="#" id="btn-shooter">Shooter</a></li>
          <li><a href="#" id="btn-strategy">Strategy</a></li>
          <li><a href="#" id="btn-adventure">Adventure</a></li>
          <li><a href="#" id="btn-racing">Racing</a></li>
          <li><a href="#" id="btn-sports">Sports</a></li>
          <li><a href="#" id="btn-puzzle">Puzzle</a></li>
        </ul>
      </nav>
    </aside>
  `;
}

// Aqui configuramos la funcion para manejar el clic en el botón de wishlist

async function setupWishlistHandler() {
  const wishlistBtn = document.getElementById("btn-wishlist");
  if (!wishlistBtn) return;

  wishlistBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    // Verificar si el usuario está autenticado
    const {
      data: { user },
    } = await supabase.auth.getUser();
    // Si no hay usuario, mostrar alerta y redirigir a login
    if (!user) {
      const result = await Swal.fire({
        icon: "warning",
        title: "You need to log in",
        confirmButtonText: "Log in",
        showCancelButton: true,
        text: "Log in to access your wishlist.",
      });

      // Si el usuario confirma, redirigimos a la página de login

      if (result.isConfirmed) {
        window.location.href = "#/login";
      }
      return;
    }

    await loadWishlist();
  });
}

// Función reutilizable para cargar la wishlist
async function loadWishlist() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: wishlist, error } = await supabase
    .from("wishlist")
    .select("*")
    .eq("user_id", user.id);

  const container = document.getElementById("game-list");
  container.innerHTML = "";
  container.style.display = "grid";
  document.getElementById("main-title").textContent = "My Wishlist";
  document.getElementById("main-subtitle").textContent =
    "Your saved games in one place";
  document.getElementById("main-subtitle").style.display = "block";
  document.querySelector(".filters").style.display = "none";
  window.currentURL = "";
  window.scrollEnabled = false;

  if (error || !wishlist || wishlist.length === 0) {
    Swal.fire({
      icon: "info",
      title: "Empty Wishlist",
      text: "You have no games in your wishlist yet.",
    });
    return;
  }

  // Elimina duplicados por game_id para evitar mostrar el mismo juego varias veces
  const uniqueWishlist = Array.from(
    new Map(wishlist.map((item) => [item.game_id, item])).values()
  );

  const cards = await Promise.all(
    uniqueWishlist.map(async (item) => {
      const res = await fetch(
        `https://api.rawg.io/api/games/${item.game_id}?key=${
          import.meta.env.VITE_API_KEY
        }`
      );
      const fullGame = await res.json();
      return await GameCard(fullGame, true);
    })
  );

  container.innerHTML = cards.join("");
  setupWishlistButtonListeners();
}


// Botones para añadir o eliminar de la wishlist
function setupWishlistButtonListeners() {
  document.querySelectorAll(".wishlist-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const gameId = btn.dataset.id;
      const gameName = btn.dataset.name;
      const gameImage = btn.dataset.image;
      const action = btn.dataset.action;

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        Swal.fire(
          "Oops!",
          "You need to log in to manage your wishlist.",
          "warning"
        );
        return;
      }

     if (action === "add") {
  // Verifica si ya existe en la wishlist del usuario
  const { data: existing } = await supabase
    .from("wishlist")
    .select("*")
    .eq("user_id", user.id)
    .eq("game_id", gameId);

  if (existing && existing.length > 0) {
    Swal.fire("Oops!", `${gameName} is already in your wishlist.`, "info");
    return;
  }

  await supabase.from("wishlist").insert([
    {
      user_id: user.id,
      game_id: gameId,
      game_name: gameName,
      game_image: gameImage,
    },
  ]);

  Swal.fire("Added!", `${gameName} was added to your wishlist.`, "success");
}

      if (action === "remove") {
        await supabase
          .from("wishlist")
          .delete()
          .eq("user_id", user.id)
          .eq("game_id", gameId);

        Swal.fire(
          "Removed",
          `${gameName} was removed from your wishlist.`,
          "info"
        );

        // Recargar si estamos visualizando la wishlist
        const subtitle = document.getElementById("main-subtitle")?.textContent;
        if (subtitle === "Your saved games in one place") {
          await loadWishlist();
        }
      }
    });
  });
}
export const setupSidebarToggle = () => {
  const hamburger = document.getElementById("hamburger");
  const sidebar = document.querySelector(".sidebar-container");

  if (hamburger && sidebar) {
    hamburger.addEventListener("click", () => {
      sidebar.classList.toggle("active");
    });
  }
};