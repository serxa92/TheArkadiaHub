export default function Loader() {
  const loader = document.createElement("div");
  loader.className = "loader";
  loader.innerHTML = `<div class="spinner"></div>`;
  return loader;
}
