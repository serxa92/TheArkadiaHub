import Swal from "sweetalert2";
import { supabase } from "../../../supabaseClient.js";

export const setupLoginHandler = () => {
 /*  Controlamos si el usuario deja los campos de email o contraseña vacíos al iniciar sesión, si es así, mostramos un mensaje de advertencia.
  Si no, enviamos los datos a Supabase para autenticar al usuario y mostramos un mensaje de éxito.
Si el usuario no ha confirmado su email, mostramos un mensaje de advertencia. */
  const handleLogin = async () => {
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value.trim();

    if (!email || !password) {
      Swal.fire({
        icon: "warning",
        title: "Missing fields",
        text: "Please enter both email and password.",
      });
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      Swal.fire({
        icon: "error",
        title: "Login error",
        text: error.message,
      });
      return;
    }

    if (!data.user?.email_confirmed_at) {
      Swal.fire({
        icon: "warning",
        title: "Email not confirmed",
        text: "Please check your inbox to confirm your account.",
      });
      return;
    }

    Swal.fire({
      title: "Login successful!",
      width: 500,
      padding: "3em",
      color: "#716add",
      backdrop: `
        rgba(0, 35, 123, 0.4)
        url("/images/cat.gif")
        left top
        no-repeat
      `,
    });
  };

  // Click en el botón
  document.addEventListener("click", async (e) => {
    if (e.target.id === "login-submit") {
      await handleLogin();
    }
  });

  // Pulsación de tecla Enter en los campos del formulario
  document.addEventListener("keydown", async (e) => {
    const isLoginFormFocused =
      document.activeElement.id === "login-email" ||
      document.activeElement.id === "login-password";

    if (e.key === "Enter" && isLoginFormFocused) {
      await handleLogin();
    }
  });
};
