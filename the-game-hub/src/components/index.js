//Aqui vamos a unificar todos los componentes que vamos a exportar desde este archivo

// Navbar
export * from "./Navbar";
export { checkAuthAndUpdateNavbar } from "./Navbar/updateAuthUI.js";

//  Sidebar
export { Sidebar, setupSidebarToggle } from "./Sidebar/index.js";

// Loader
export { default as Loader } from "./Loader/index.js";

// GameCard
export { GameCard, getPlatformIcons } from "./GameCard/index.js";

// Theme Toggle
export { applySavedTheme, initThemeToggle } from "./ThemeToggle/index.js";

// Login
export { LoginForm } from "./Auth/Login/LoginForm.js";
export { setupLoginHandler } from "./Auth/Login/handleLogin.js";

// Sign Up
export { SignUpForm } from "./Auth/Signup/SignUpForm.js";
export { setupSignUpHandler } from "./Auth/Signup/handleSignUp.js";
