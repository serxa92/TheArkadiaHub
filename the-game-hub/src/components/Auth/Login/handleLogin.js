import Swal from "sweetalert2";
import { supabase } from "../../../supabaseClient.js";
// Aqui vamos a manejar el evento de login
export const setupLoginHandler = () => {
  const handleLogin = async () => {
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value.trim();
    //Manejamos el caso de que el usuario no haya introducido email o password y mostramos un mensaje de alerta
    if (!email || !password) {
      Swal.fire({
        icon: "warning",
        theme: "dark",
        borderRadius: "10px",
        title: "Missing fields",
        text: "Please enter both email and password.",
      });
      return;
    }
    /* Aqui llamamos a la función de Supabase para iniciar sesión con email y password
    si hay un error, mostramos un mensaje de alerta con el error */
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      Swal.fire({
        icon: "error",
        theme: "dark",
        borderRadius: "10px",
        title: "Login error",
        text: error.message,
      });
      return;
    }

    if (!data.user?.email_confirmed_at) {
      Swal.fire({
        icon: "warning",
        theme: "dark",
        borderRadius: "10px",
        title: "Email not confirmed",
        text: "Please check your inbox to confirm your account.",
      });
      return;
    }

    Swal.fire({
      title: "Login successful!",
  width: 270,
  padding: "1em",
  borderRadius: "10px",
  theme: "dark",
  color: "#5f55eaff",
  customClass: {
    popup: "custom-swal-popup"
  },
  backdrop: `
    rgba(0, 35, 123, 0.4)
    url("/images/cat.gif")
    center
    / contain
    no-repeat
  `,
    }).then(() => {
      location.hash = "#/";
      // Recargamos la página para actualizar el navbar y el estado de login
      location.reload();
    });
  };

  document.addEventListener("click", async (e) => {
    if (e.target.id === "login-submit") {
      await handleLogin();
    }
  });

  document.addEventListener("keydown", async (e) => {
    const isLoginFormFocused =
      document.activeElement.id === "login-email" ||
      document.activeElement.id === "login-password";

    if (e.key === "Enter" && isLoginFormFocused) {
      await handleLogin();
    }
  });
};
