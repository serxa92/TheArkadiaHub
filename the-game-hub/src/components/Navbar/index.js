import { createThemeToggle } from '../ThemeToogle/index.js';
import "./styles.css";

export const Navbar = () => `
<nav>
  <a href="#" class="logo-link">
  <img class="logo" src="/images/logo.png" alt="The Game Hub logo">
</a>
  <ul>
    <li>
      <div class="search-wrapper">
        <input id="searchInput" class="header__search__input" type="text" placeholder="Search 887,255 games">
        

      </div>
    </li>
    <li><a class="navlink" href="#">LOG IN</a></li>
    <li><a class="navlink" href="#">SIGN UP</a></li>
    <li>${createThemeToggle()}</li>
  </ul>
</nav>
`;
