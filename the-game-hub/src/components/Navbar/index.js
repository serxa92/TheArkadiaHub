import { createThemeToggle } from "../ThemeToogle/index.js";
import "./styles.css";

export const Navbar = () => `
<nav>
  <a href="#/" class="logo-link">
    <img class="logo" src="/images/logo.png" alt="The Game Hub logo">
  </a>
  <ul class="nav-links">
    <li class="search-container">
      <div class="search-wrapper">
        <input id="searchInput" class="header__search__input" type="text" placeholder="Search 887,255 games">
      </div>
    </li>
    <li><a class="navlink" href="#/login" id="btn-login">LOG IN</a></li>
    <li><a class="navlink" href="#/signup" id="btn-signup">SIGN UP</a></li>
    <li>${createThemeToggle()}</li>
  </ul>
</nav>


`;

/* Esta funcion se encarga de resaltar el enlace activo en la barra de navegación
Se utiliza para mejorar la experiencia del usuario, indicando en qué sección se encuentra actualmente */

export const setActiveLink = () => {
  const links = document.querySelectorAll(".navlinkk");
  links.forEach((link) => {
    const href = link.getAttribute("href");
    if (href === location.hash) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
};

