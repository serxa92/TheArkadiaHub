import "./style.css";

import { Navbar } from "./components/Navbar/index.js";
import { Sidebar } from "./components/Sidebar/index.js";
import { Footer } from "./components/Footer/index.js";
import { applySavedTheme, initThemeToggle } from './components/ThemeToogle/index.js';

// Aplicamos el tema guardado ANTES de renderizar
applySavedTheme(); 

document.querySelector("#app").innerHTML = `
  <header>${Navbar()}</header>

  <main class="main-layout">
    <aside class="sidebar">${Sidebar()}</aside>
    <section class="content">
      <div id="game-list"></div>
    </section>
  </main>

  <footer>${Footer()}</footer>
`;

initThemeToggle(); 
