/*
* AUTENTICACIÓN DEL ADMINISTRADOR
 * Solo las cuentas autorizadas pueden ver el panel.
 * Firestore sigue siendo responsable de proteger los datos.
 */

const loginScreen = document.getElementById("login-screen");
const adminScreen = document.getElementById("admin-screen");
const loginForm = document.getElementById("login-form");
const loginError = document.getElementById("login-error");
const firebaseWarning = document.getElementById("firebase-warning");
const logoutBtn = document.getElementById("logout-btn");

const ADMIN_UIDS = [
  "ZUmW5LjLn7P1CLm17RhBnp5OzZH2",
  "b3O7qnkFn7ZFj3ra6Ba1b6CCDFI3"
];

function iniciarProteccionAdmin(onLogin) {
  if (!firebaseReady) {
    firebaseWarning.style.display = "block";
    loginScreen.style.display = "block";
    adminScreen.style.display = "none";
    return;
  }

  auth.onAuthStateChanged(async user => {
    if (!user) {
      loginScreen.style.display = "block";
      adminScreen.style.display = "none";
      return;
    }

    if (!ADMIN_UIDS.includes(user.uid)) {
      await auth.signOut();
      loginScreen.style.display = "block";
      adminScreen.style.display = "none";
      loginError.textContent = "Esta cuenta no tiene permisos de administrador.";
      return;
    }

    loginScreen.style.display = "none";
    adminScreen.style.display = "block";
    onLogin(user);
  });
}

loginForm.addEventListener("submit", async e => {
  e.preventDefault();
  loginError.textContent = "";

  if (!firebaseReady) {
    loginError.textContent = "Firebase no está configurado todavía — no se puede iniciar sesión.";
    return;
  }

  const email = document.getElementById("login-email").value.trim();
  const pass = document.getElementById("login-pass").value;

  try {
    await auth.signInWithEmailAndPassword(email, pass);
  } catch (err) {
    loginError.textContent = "Correo o contraseña incorrectos.";
  }
});

logoutBtn.addEventListener("click", () => {
  if (firebaseReady) auth.signOut();
});
