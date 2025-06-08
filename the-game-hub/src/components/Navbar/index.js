import "./styles.css";

// Espera a que el documento HTML se haya cargado completamente antes de ejecutar el script
document.addEventListener("DOMContentLoaded", function () {
  // Selecciona todos los enlaces dentro de la lista de navegación
  const links = document.querySelectorAll("nav ul li a");

  // Recorre cada enlace y le añade un evento de escucha al hacer clic
  links.forEach((link) => {
    link.addEventListener("click", function () {
      // Recorre todos los enlaces y elimina la clase 'active' para asegurarse de que solo un enlace esté activo a la vez
      links.forEach((item) => item.classList.remove("active"));

      // Agrega la clase 'active' únicamente al enlace que ha sido clicado
      this.classList.add("active");
    });
  });
});

export const Navbar = () => `
<nav>

<a><img class = "logo" src = "/public/images/logo.png" alt = "The Game Hub logo"></img></a>
<ul>
    
    <li>
        <div class="search-wrapper">
  <input class="header__search__input" type="text" placeholder="Search 887,255 games">
</div>
    </li>
    <li>
        <a class = "navlink" href="#" id="homelink">LOG IN</a>
    </li>
    <li>
        <a class = "navlink" href="#" id="homelink">SIGN UP</a>
    </li>
    
    
    </div>

    </li>
</ul>
</nav>

`;
