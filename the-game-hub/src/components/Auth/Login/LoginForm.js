export const LoginForm = () => {
  return `
    <div class="auth-form">
      <h2>Log In</h2>
      <input type="email" id="login-email" placeholder="Email"  />
      <input type="password" id="login-password" placeholder="Password" />
      <button id="login-submit">Log In</button>
    </div>
  `;
};
