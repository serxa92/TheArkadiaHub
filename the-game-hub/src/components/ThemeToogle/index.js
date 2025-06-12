import "./styles.css";

// Aplica el tema guardado al cargar la página
export function applySavedTheme() {
  const saved = localStorage.getItem("theme");
  const theme = saved || "light";
  document.body.classList.add(theme);
}


export function createThemeToggle() {
  return `<div class="switch">
      <input type="checkbox" class="switch__input" id="Switch">
      <label class="switch__label" for="Switch">
          <span class="switch__indicator"></span>
          <span class="switch__decoration"></span>
      </label>
  </div>`;
}

// Inicializamos el interruptor de tema y asigna su comportamiento
export function initThemeToggle() {
  const button = document.getElementById("Switch");
  if (!button) return;

  // Establecemos el icono inicial según el tema actual
  updateButtonIcon();

  // Listener para cambiar el tema
  button.addEventListener("click", () => {
    const body = document.body;
    const isDark = body.classList.contains("dark");

    // Cambiamos las clases de tema
    body.classList.toggle("dark", !isDark);
    body.classList.toggle("light", isDark);

    // Guardamos el tema en localStorage
    const newTheme = isDark ? "light" : "dark";
    localStorage.setItem("theme", newTheme);

    // Actualizamos el icono del botón
    updateButtonIcon();
  });
}

// Función para actualizar el icono del interruptor
function updateButtonIcon() {
  const isDark = document.body.classList.contains("dark");
  const button = document.getElementById("Switch");

  // Cambiamos el texto del botón dependiendo del tema
  button.textContent = isDark ? "🌞 Light" : "🌙 Dark";
}
