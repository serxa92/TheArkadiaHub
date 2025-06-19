/* 
Declaramos la función Loader que crea un elemento de carga que se mostrará mientras se cargan los datos de la API.Este elemento se utiliza para mejorar la experiencia del usuario */

export default function Loader() {
  const loader = document.createElement("div");
  loader.className = "loader";
  loader.innerHTML = `<div class="spinner"></div>`;
  return loader;
}
