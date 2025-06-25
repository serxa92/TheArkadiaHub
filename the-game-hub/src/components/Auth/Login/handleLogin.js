import Swal from "sweetalert2";
import { supabase } from "../../../supabaseClient.js";

export const setupLoginHandler = () => {
  document.addEventListener("click", async (e) => {

    if (e.target.id !== "login-submit") return;
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value.trim();

      // Si no hay email o contraseña, mostramos un mensaje de advertencia
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
    // Usamos el optional chaining para evitar errores si data o user son undefined
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
  });
};
