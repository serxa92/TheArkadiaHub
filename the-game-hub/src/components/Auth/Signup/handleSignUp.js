import Swal from "sweetalert2";
import { supabase } from "../../../supabaseClient.js";

export const setupSignUpHandler = () => {
  document.addEventListener("click", async (e) => {
    /* Controlamos si el usuario deja los campos de email o contraseña vacíos al crear una cuenta,si es así, mostramos un mensaje de advertencia.
    Si no, enviamos los datos a Supabase para autenticar al usuario y mostramos un mensaje de exito. */
    if (e.target.id !== "signup-submit") return;

    const email = document.getElementById("signup-email").value.trim();
    const password = document.getElementById("signup-password").value.trim();

    if (!email || !password) {
      Swal.fire({
        icon: "warning",
        title: "Missing fields",
        text: "Please enter both email and password.",
      });
      return;
    }

    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      Swal.fire({
        icon: "error",
        title: "Sign-up error",
        text: error.message,
      });
    } else {
      Swal.fire({
        title: "Account created successfully!",
        text: "Check your email to confirm your account.",
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
  });
};
