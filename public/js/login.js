const loginFormHandler = async (event) => {
  event.preventDefault();

  const username = document.querySelector('#username-login').value.trim();
  const password = document.querySelector('#password-login').value.trim();

  if (username && password) {
      try {
          const urlParams = new URLSearchParams(window.location.search);
          const redirect = urlParams.get('redirect') || '/';

          const response = await fetch('/auth/login', {
              method: 'POST',
              body: JSON.stringify({ 
                  username, 
                  password,
                  redirect
              }),
              headers: { 'Content-Type': 'application/json' },
          });

          if (response.ok) {
              const data = await response.json();
              // Use the redirect URL from the server response
              document.location.replace(data.redirect);
          } else {
              const errorData = await response.json();
              alert(errorData.message || 'Failed to log in');
          }
      } catch (error) {
          alert('An error occurred during login');
      }
  }
};

document
  .querySelector('.login-form')
  .addEventListener('submit', loginFormHandler);