import Swal from "sweetalert2";
import { supabase } from "../../../supabaseClient.js";

export const setupSignUpHandler = () => {
  /* Controlamos si el usuario deja los campos de email o contraseña vacíos al crear una cuenta,si es así, mostramos un mensaje de advertencia.
    Si no, enviamos los datos a Supabase para autenticar al usuario y mostramos un mensaje de exito. */
  const handleSignUp = async () => {
    const email = document.getElementById("signup-email").value.trim();
    const password = document.getElementById("signup-password").value.trim();

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

    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      Swal.fire({
        icon: "error",
        theme: "dark",
        borderRadius: "10px",
        title: "Sign-up error",
        text: error.message,
      });
    } else {
      Swal.fire({
        title: "Account created successfully!",
        text: "Check your email to confirm your account.",
        theme: "dark",
        borderRadius: "10px",
        width: 500,
        padding: "3em",
        color: "#716add",
        backdrop: `
          rgba(0,0,123,0.4)
          url("/images/cat.gif")
          left top
          no-repeat
        `,
      });
    }
  };

  // Click en el botón
  document.addEventListener("click", async (e) => {
    if (e.target.id === "signup-submit") {
      await handleSignUp();
    }
  });

  // Pulsar Enter desde los campos del formulario
  document.addEventListener("keydown", async (e) => {
    const isSignupFormFocused =
      document.activeElement.id === "signup-email" ||
      document.activeElement.id === "signup-password";

    if (e.key === "Enter" && isSignupFormFocused) {
      await handleSignUp();
    }
  });
};
