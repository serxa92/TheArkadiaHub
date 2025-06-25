/* 
Declaramos la función Loader que crea un elemento de carga que se mostrará mientras se cargan los datos de la API */

export default function Loader() {
  const loader = document.createElement("div");
  loader.className = "loader";
  loader.innerHTML = `<div class="spinner"></div>`;
  return loader;
}
