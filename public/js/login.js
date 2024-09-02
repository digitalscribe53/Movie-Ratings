const loginFormHandler = async (event) => {
  event.preventDefault();

  const username = document.querySelector('#username-login').value.trim();
  const password = document.querySelector('#password-login').value.trim();

  if (username && password) {
    const response = await fetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.ok) {
      const data = await response.json();
      document.location.replace(data.redirect);
    } else {
      alert('Failed to log in');
    }
  }
};

document
  .querySelector('.login-form')
  .addEventListener('submit', loginFormHandler);