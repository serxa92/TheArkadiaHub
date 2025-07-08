

export const imports = {
    // Librerías de terceros
    "swal": () => import("sweetalert2"),
    "loader": () => import("./components/Loader/index.js"),
    "navbar": () => import("./components/Navbar/index.js"),
    "sidebar": () => import("./components/Sidebar/index.js"),
    "gameCard": () => import("./components/GameCard/index.js"),
    "platforms": () => import("./components/GameCard/index.js"),
    "activeLink": () => import("./components/Navbar/index.js"),
    "savedTheme": () => import("./components/ThemeToogle/index.js"),
    "themeToogle": () => import("./components/ThemeToogle/index.js"),
    "fiters": () => import("./utils/filters.js"),
    "loginForm": () => import("./components/Auth/Login/LoginForm.js"),
    "loginHandler": () => import("./components/Auth/Login/handleLogin.js"),
    "signupForm": () => import("./components/Auth/Signup/SignUpForm.js"),
    "signupHandler": () => import("./components/Auth/Signup/handleSignUp.js"),
    "supabase": () => import("./supabaseClient.js"),
    

   


}
