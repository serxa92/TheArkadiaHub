import { supabase } from "../../supabaseClient";
import Swal from "sweetalert2";

/* Funcion para actualizar el navbar dependiendo de si el usuario esta logueado o no para actualizar el texto del boton de login y el enlace de registro y para añadir el evento de logout si el usuario esta logueado */

export async function checkAuthAndUpdateNavbar() {
  const loginBtn = document.getElementById("btn-login");
  const signupBtn = document.getElementById("btn-signup");
  if (!loginBtn) return;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    loginBtn.textContent = "LOG OUT";
    loginBtn.href = "#";
    if (signupBtn) signupBtn.style.display = "none";

    loginBtn.onclick = async (e) => {
      e.preventDefault();
      const result = await Swal.fire({
        title: "Do you want to log out?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes, log out",
      });

      if (result.isConfirmed) {
        await supabase.auth.signOut();
        // redirigiMOS al home
        location.href = "#/";
        // recargamos el navbar 
        setTimeout(() => location.reload(), 300); 
      }
    };
  } else {
    loginBtn.textContent = "LOG IN";
    loginBtn.href = "#/login";
    if (signupBtn) signupBtn.style.display = "inline-block";
    loginBtn.onclick = null;
  }
}
